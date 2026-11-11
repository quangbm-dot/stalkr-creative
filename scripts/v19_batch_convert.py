"""
v19 batch: convert every not-yet-used story in build/story_all/story_*.json
into a playable case (src/cases/<nn>_<slug>_v19/) with exactly 7 real
questions — auto-picking the first 7 questions in story order whose
revealGuide names an app this playable already has a mini-app UI for
(same APP_MAP as v9_convert_cases.py), skipping the rest (Safari, SplitPay,
PayPal, Snapchat, Google Drive, Spotify, Photoshop, Hinge, ChatGPT, camera/
QR/health/fitness/screen-time/wifi/bluetooth questions etc. — no UI for
those yet).

    python -I scripts/v19_batch_convert.py            -> all unused stories
    python -I scripts/v19_batch_convert.py 6 41        -> only story ids 6, 41

Writes src/cases/<id>/phone.json + img/*.webp (same shape buildCase.ts /
Phone.tsx /Gmail.tsx / etc. already read) and a small index.ts that calls
buildCase() with 7 auto-filled question overrides (hintApp detected above,
no hintTarget — apps without row-level highlighting now fall back to the
"point at the back button" hint, see AppScreen/App.tsx).
"""

import io
import json
import re
import sys
import urllib.parse
import urllib.request

# Windows console mặc định dùng cp1252 — print() văng UnicodeEncodeError khi
# gặp emoji trong câu hỏi/đáp án gốc. Ép stdout ra utf-8 (thay ký tự lạ bằng
# "?" nếu cp vẫn không hiểu) để log không làm crash cả batch giữa chừng.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from datetime import datetime
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
# ROOT là git worktree (.../stalkr-creative/.worktrees/v10-smd-playables) —
# build/story_all nằm ở repo chính, không phải worktree.
MAIN_REPO = ROOT.parent.parent if ROOT.parent.name == ".worktrees" else ROOT
STORY_DIR = MAIN_REPO / "build" / "story_all"
CASES_DIR = ROOT / "src" / "cases"

TARGET_QUESTIONS = 7
PHOTO_COUNT = 9
IG_POST_COUNT = 9
AIRBNB_COUNT = 9
# Từ phổ biến bỏ qua khi chấm điểm khớp tin nhắn theo từ khoá (find_hint_message)
# — giữ lại ngắn gọn, chỉ cần loại được những từ chắc chắn xuất hiện lung
# tung trong revealGuide/hint lẫn hội thoại đời thường, không cần đầy đủ.
STOPWORDS = {
    "open", "chat", "with", "that", "this", "says", "said", "message", "messages",
    "whatsapp", "thread", "look", "looking", "find", "about", "reads", "read",
    "then", "they", "them", "their", "what", "when", "where", "which", "while",
    "asks", "asked", "tells", "told", "from", "have", "has", "the", "and", "for",
    "she", "her", "his", "him", "why", "scroll", "near", "end", "start", "titled",
    "also", "just", "been", "were", "would", "could", "should", "onto", "into",
}
MAX_THREAD_AVATARS = 14

# story app key -> playable AppKey (same apps buildCase.ts's ICONS/registry support).
APP_MAP = {
    "phone": "phone",
    "messages": "messages",
    "photos": "photos",
    "email": "gmail",
    "gmail": "gmail",
    "revobank": "revolut",
    "calendar": "calendar",
    "maps": "maps",
    "notes": "notes",
    "clock": "clock",
    "whatsapp": "whatsapp",
    "settings": "settings",
    "weather": "weather",
    "wallet": "wallet",
    "instagram": "instagram",
    "calculator": "calculator",
    "airbnb": "airbnb",
    "compass": "compass",
}

# Case ids (story_all numbering) already turned into a real creative —
# skip these (see earlier build-folder audit).
ALREADY_USED = {1, 20, 22, 24, 25, 27, 29, 33, 39, 40}


def parse_ts(s):
    if not s:
        return None
    s = s.replace("Z", "").split("+")[0]
    s = re.sub(r"\.\d+$", "", s)
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    return None


def fmt_time(dt):
    return dt.strftime("%I:%M %p").lstrip("0")


def rel_day(dt, now):
    days = (now.date() - dt.date()).days
    if days == 0:
        return "Today"
    if days == 1:
        return "Yesterday"
    if 1 < days < 7:
        return dt.strftime("%A")
    return f"{dt.month}/{dt.day}/{dt.strftime('%y')}"


def rel_short(dt, now):
    return fmt_time(dt) if (now.date() - dt.date()).days == 0 else rel_day(dt, now)


def rel_full(dt, now):
    return f"{rel_day(dt, now)}, {fmt_time(dt)}"


def money(v):
    return f"${abs(v):,.2f}"


class ImageStore:
    def __init__(self, out_dir):
        self.out_dir = out_dir
        self.by_url = {}
        out_dir.mkdir(parents=True, exist_ok=True)
        for old in out_dir.glob("*.webp"):
            old.unlink()

    def get(self, url, name, max_side, quality=72):
        if not url:
            return None
        if url in self.by_url:
            return self.by_url[url]
        try:
            # Vài URL ảnh chứa ký tự non-ASCII literal (vd "pote_6_à_la_plage.jpg")
            # thay vì đã percent-encode sẵn — urllib không tự xử lý, crash với
            # UnicodeEncodeError. quote() với safe giữ nguyên phần URL hợp lệ.
            safe_url = urllib.parse.quote(url, safe=":/?&=%")
            req = urllib.request.Request(safe_url, headers={"User-Agent": "Mozilla/5.0"})
            raw = urllib.request.urlopen(req, timeout=30).read()
            im = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception as e:  # noqa: BLE001
            print(f"   ! image failed {url}: {e}", file=sys.stderr)
            return None
        im.thumbnail((max_side, max_side), Image.LANCZOS)
        fname = f"{name}.webp"
        im.save(self.out_dir / fname, "WEBP", quality=quality, method=6)
        self.by_url[url] = fname
        return fname


def person_name(p):
    return " ".join(x for x in [p.get("name", ""), p.get("lastName", "")] if x).strip()


def _pname(p):
    """Tên 1 participant — thường {"name":...}, đôi khi chỉ là string thô."""
    return p.get("name", "") if isinstance(p, dict) else str(p or "")


def convert_threads(convs, now, imgs, prefix):
    convs = sorted(convs, key=lambda c: c.get("lastUpdated") or "", reverse=True)
    out = []
    for i, c in enumerate(convs):
        if not isinstance(c, dict):
            continue
        parts = c.get("participants") or []
        title = c.get("name") or ", ".join(_pname(p) for p in parts) or "Unknown"
        raw_msgs = [m for m in (c.get("messages") or []) if isinstance(m, dict)]
        msgs = []
        for m in sorted(raw_msgs, key=lambda m: m.get("timestamp") or ""):
            text = (m.get("text") or "").strip()
            if not text:
                continue
            sender = m.get("sender")
            # sender thường là {"id": ...}, nhưng 1 số tin tự động (vd SMS mã
            # xác thực) có sender là string ("unknown") thay vì dict.
            is_me = isinstance(sender, dict) and sender.get("id") == "me"
            msgs.append({"me": is_me, "text": text})
        if not msgs:
            continue
        last = parse_ts(c.get("lastUpdated")) or now
        avatar = None
        if len(parts) == 1 and i < MAX_THREAD_AVATARS and isinstance(parts[0], dict):
            avatar = imgs.get(parts[0].get("avatarUrl"), f"{prefix}_{i}", 128, 70)
        t = {"id": c.get("id", f"{prefix}_{i}"), "title": title, "time": rel_short(last, now), "unread": False, "msgs": msgs}
        if avatar:
            t["avatar"] = avatar
        out.append(t)
    return out


def email_row(e, now, folder):
    dt = parse_ts(e.get("dateTime")) or now
    body = (e.get("body") or "").strip()
    if folder == "sent":
        to = ", ".join((r.get("name") or r.get("email") or "") for r in e.get("recipients") or [])
        sender = f"To: {to}"
    else:
        sender = (e.get("sender") or {}).get("name") or (e.get("sender") or {}).get("email") or ""
    return {
        "sender": sender,
        "subject": e.get("subject") or "(no subject)",
        "preview": re.sub(r"\s+", " ", body)[:110],
        "body": body,
        "time": rel_short(dt, now),
        "folder": folder,
        "_ts": dt.isoformat(),
    }


WEATHER_TEXT = {
    "sunny": "Sunny", "clear": "Clear", "partly_cloudy": "Partly Cloudy", "cloudy": "Cloudy",
    "rainy": "Rain", "rain": "Rain", "stormy": "Thunderstorms", "snowy": "Snow",
    "foggy": "Fog", "windy": "Windy",
}


def f_to_c(f):
    return round((f - 32) * 5 / 9)


def slugify_title(title):
    parts = [p.strip() for p in title.split("&")]
    names = []
    for p in parts:
        first = re.sub(r"[^A-Za-z]", "", p.split(" ")[0]).lower()
        if first:
            names.append(first)
    return "_".join(names) or re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")


def pick_questions(d):
    """First TARGET_QUESTIONS questions (story order) whose revealGuide names
    a supported app. Returns list of (question_dict, playable_app_key)."""
    label_to_key = {a["label"].strip().lower(): a["app"] for a in d["availableApps"]}
    picked = []
    for q in d["questions"]:
        guide = (q.get("revealGuide") or "").split("\n")[0]
        phrase = guide[5:] if guide.lower().startswith("open ") else guide
        head = re.split(r"→|\.|,| and ", phrase, maxsplit=1)[0].strip()
        story_key = label_to_key.get(head.lower())
        app_key = APP_MAP.get(story_key) if story_key else None
        # Câu cần đi qua 2 app nối tiếp (vd "Instagram → ... → Photos: ...")
        # — revealGuide chỉ ra app ĐẦU (Instagram, chỉ để lấy manh mối dẫn
        # đường) nhưng field "hint" hiển thị cho người chơi (nút 💡) lại chỉ
        # thẳng app THẬT chứa đáp án (Photos) — glow/tay chỉ app sai (theo
        # app_key) trong khi gợi ý 💡 lại nói app khác, người chơi bị lạc.
        # Không có cơ chế multi-step trong batch này — phát hiện mismatch
        # này thì bỏ qua câu, để script chọn câu khác đơn giản hơn.
        if app_key:
            hint_text = q.get("hint") or ""
            # Tìm app NÀO được nhắc tới trước tiên trong "hint" (gợi ý 💡
            # hiện cho người chơi) — thử label dài nhất trước để tránh khớp
            # nhầm 1 từ ngắn là tiền tố của app khác. Không chỉ nhìn "Open X"
            # ở đầu câu vì nhiều hint viết tự nhiên hơn (vd "His Instagram
            # profile should say.", "Check his Hinge profile.").
            # Bỏ qua label TRÙNG TỪ TIẾNG ANH THÔNG DỤNG (Settings, Notes,
            # Clock...) — vd "location-sharing SETTINGS" chỉ là danh từ
            # thường, không phải nhắc app Settings, nhưng vẫn khớp label
            # "Settings" nếu không loại trừ, làm bỏ oan câu hỏi đúng.
            GENERIC_WORD_APPS = {"settings", "notes", "weather", "wallet", "clock", "camera", "compass"}
            for label, h_story_key in sorted(label_to_key.items(), key=lambda kv: -len(kv[0])):
                if h_story_key in GENERIC_WORD_APPS:
                    continue
                if re.search(r"(?<!\w)" + re.escape(label) + r"(?!\w)", hint_text, re.I):
                    hint_app_key = APP_MAP.get(h_story_key)
                    # hint_app_key None nhưng CÓ match label (vd "Hinge" —
                    # app chưa hỗ trợ) nghĩa là đáp án thật nằm ở 1 app
                    # KHÔNG chơi được — vẫn phải bỏ câu, không chỉ khi khác
                    # app_key.
                    if hint_app_key != app_key:
                        app_key = None
                    break
        # Câu cần mở "Hidden album" có mã PIN trong Photos — mã đó luôn được
        # tiết lộ ở 1 câu KHÁC (thường qua Notes), không có cơ chế liên kết
        # nhiều bước giữa các câu trong batch này. Giữ lại thì người chơi bị
        # bí, không nơi nào trong 7 câu cho biết mã — bỏ qua như app chưa hỗ
        # trợ (MISSING_APPS), để script tự chọn câu khác thay thế.
        if app_key == "photos":
            guide_all = f"{q.get('revealGuide') or ''}\n{q.get('hint') or ''}"
            if re.search(r"hidden album|Hidden:|Albums.*Hidden|passcode", guide_all, re.I):
                app_key = None
        # Câu cần mở profile Instagram của NGƯỜI KHÁC (tìm qua DM/search) —
        # app chỉ hiện được đúng 1 profile cố định (chủ máy), không có search/
        # chuyển profile. Hiếm (2/43 case) nên bỏ qua thay vì xây riêng 1
        # tính năng search+multi-profile chỉ cho vài câu.
        if app_key == "instagram":
            guide_all = f"{q.get('revealGuide') or ''}\n{q.get('hint') or ''}"
            # "profile of X" hoặc sở hữu cách "X's profile" — cả 2 đều nghĩa
            # xem trang của NGƯỜI KHÁC, không phải chủ máy.
            if re.search(r"profile of \S|\w+'s profile", guide_all, re.I):
                app_key = None
            # Stories bar (tap vào story tròn trên đầu feed) — tính năng
            # khác hẳn profile/feed thường, app chưa có UI này.
            if re.search(r"stories bar|tap .{0,20}story|his story|her story", guide_all, re.I):
                app_key = None
        # Câu cần quét mã QR (app Camera) để mở khoá 1 app/đoạn chat ẩn —
        # cơ chế riêng biệt, không có app Camera/hidden-chat nào trong
        # playable này. Rất hiếm (1/43 case) nên bỏ thay vì xây riêng.
        if app_key:
            guide_all = f"{q.get('revealGuide') or ''}\n{q.get('hint') or ''}"
            if re.search(r"QR code|scan.{0,20}camera|hidden app|hidden chat", guide_all, re.I):
                app_key = None
        # Câu dò ĐƯỢC app bước đầu (vd Messages) nhưng cả chuỗi revealGuide
        # còn nhắc tới 1 app KHÁC hoàn toàn chưa hỗ trợ (Snapchat, ChatGPT,
        # Amtrak, Health/Fitness, Hinge, Safari/Internet, LinkedIn, PayPal,
        # Drive...) ở bước sau — nghĩa là đáp án thật nằm ở app đó, bước đầu
        # chỉ xác nhận được MỘT NỬA manh mối, không đủ tự trả lời (vd Q
        # "darling" — Messages/Paige chỉ xác nhận có từ "darling", còn TÊN
        # người thứ 2 nằm trong Snapchat). Bỏ câu này. Tự tính danh sách app
        # CHƯA hỗ trợ từ chính availableApps của story (mọi label không map
        # được qua APP_MAP) thay vì liệt kê tay — tự thích ứng mọi story,
        # khỏi phải vá thêm tên app mới mỗi lần gặp case khác.
        if app_key:
            guide_all = f"{q.get('revealGuide') or ''}\n{q.get('hint') or ''}"
            # "Camera" loại khỏi check này — từ tiếng Anh thông dụng (security
            # camera, camera roll...), dễ khớp nhầm ngữ cảnh không liên quan
            # tới app; trường hợp THẬT cần Camera (quét QR) đã có check riêng
            # phía trên rồi.
            unsupported_labels = [lbl for lbl, sk in label_to_key.items() if APP_MAP.get(sk) is None and sk != "camera"]
            for lbl in sorted(unsupported_labels, key=len, reverse=True):
                if re.search(r"(?<!\w)" + re.escape(lbl) + r"(?!\w)", guide_all, re.I):
                    app_key = None
                    break
        if app_key:
            picked.append((q, app_key))
        if len(picked) >= TARGET_QUESTIONS:
            break
    return picked


def convert_one(story_id, case_num):
    src = STORY_DIR / f"story_{story_id}.json"
    d = json.loads(src.read_text(encoding="utf-8"))
    picked = pick_questions(d)
    if len(picked) < 3:
        print(f"== story_{story_id} ({d['title']}) SKIPPED — only {len(picked)} usable questions")
        return None

    slug = slugify_title(d["title"])
    case_id = f"{case_num:02d}_{slug}_v19"
    print(f"== story_{story_id} -> {case_id} ({d['title']}) — {len(picked)} questions")

    pd = d["phoneData"]
    out_dir = CASES_DIR / case_id
    imgs = ImageStore(out_dir / "img")

    stamps = [parse_ts(c["timestamp"]) for c in pd["callLogs"]]
    for c in pd["conversations"] + pd["whatsappConversations"]:
        stamps += [parse_ts(m.get("timestamp")) for m in c["messages"]]
    stamps += [parse_ts(e.get("dateTime")) for e in pd["emails"] + pd.get("emailsSend", [])]
    stamps = [s for s in stamps if s]
    latest = max(stamps) if stamps else datetime.now()
    today = parse_ts((pd.get("weatherCities") or [{}])[0].get("currentWeather", {}).get("date")) if pd.get("weatherCities") else None
    now = max(latest, today.replace(hour=23, minute=59)) if today else latest
    now = now.replace(hour=23, minute=59, second=0)

    owner = pd["phoneOwnerProfile"]
    owner_contact = next((c for c in pd["contacts"] if c.get("id") == "owner"), {})

    calls = []
    for c in sorted(pd.get("callLogs", []), key=lambda c: c["timestamp"], reverse=True):
        dt = parse_ts(c["timestamp"])
        missed = c["type"] == "missed" or c.get("status") == "missed"
        ctype = "missed" if missed else c["type"]
        detail = ""
        if c.get("status") == "completed" and c.get("duration"):
            mins = max(1, round(c["duration"] / 60))
            detail = f"{mins} min"
        elif c.get("status") == "blocked":
            detail = "Blocked"
        contact = c.get("contact") if isinstance(c.get("contact"), dict) else {}
        calls.append({
            "name": person_name(contact) or contact.get("phoneNumber", "Unknown"),
            "time": rel_full(dt, now),
            "type": ctype if ctype in ("incoming", "outgoing", "missed") else "incoming",
            "detail": detail,
        })

    # Contacts (khác callLogs — đây là DANH BẠ, không phải lịch sử cuộc gọi).
    # Recents không hiện SĐT đầy đủ, vài câu cần đọc nguyên SĐT của 1 liên hệ
    # lưu dưới biệt danh (vd "N 🖤") mà Recents không có dòng nào — trước đây
    # Phone app không có tab Contacts, câu này không có nơi nào để tìm ra.
    contacts = [
        {"name": c["name"], "phoneNumber": c["phoneNumber"]}
        for c in pd.get("contacts", [])
        if c.get("name") and c.get("phoneNumber")
    ]

    # Airbnb: trước đây hardcode listings:[] trong buildCase.ts (chưa từng
    # nối data thật cho BẤT KỲ case nào) — dữ liệu thật nằm ở previousHotels.
    airbnb_listings = []
    for i, h in enumerate(pd.get("previousHotels", [])[:AIRBNB_COUNT]):
        imgs_list = h.get("imagesUrl") or []
        f = imgs.get(imgs_list[0], f"airbnb_{i}", 480, 68) if imgs_list else None
        if not f:
            continue
        price = h.get("price")
        airbnb_listings.append({
            "title": h.get("name") or "Stay",
            "image": f,
            "rating": f"{h['note']:.1f}" if h.get("note") is not None else None,
            "subtitle": h.get("date") or "",
            "price": f"${price:.0f}/night" if price is not None else None,
        })
    airbnb_data = {"name": "", "listings": airbnb_listings}

    # "the Trash folder" là 1 bước clue thật trong nhiều story (email đã xoá
    # vẫn còn trong Trash) — trước đây isDeleted=True bị loại bỏ thẳng, nên
    # những câu cần tìm trong Trash không có nơi nào để tìm ra, Gmail cũng
    # chưa có tab Trash. Giữ lại, gắn folder "trash" (tab riêng, như "sent").
    # "Spam" cũng vậy — nhiều câu cần đúng email nằm ở Spam (vd thông báo
    # match Tinder), trước đây isSpam=True bị loại bỏ thẳng như isDeleted.
    gmail = [email_row(e, now, "inbox") for e in pd.get("emails", []) if not e.get("isSpam") and not e.get("isDeleted")]
    gmail += [email_row(e, now, "trash") for e in pd.get("emails", []) if not e.get("isSpam") and e.get("isDeleted")]
    gmail += [email_row(e, now, "spam") for e in pd.get("emails", []) if e.get("isSpam")]
    gmail += [email_row(e, now, "sent") for e in pd.get("emailsSend", [])]
    gmail.sort(key=lambda g: g["_ts"], reverse=True)
    for g in gmail:
        del g["_ts"]

    calendar = []
    for e in sorted(pd.get("calendarEvents", []), key=lambda e: e["start"], reverse=True):
        st, en = parse_ts(e["start"]), parse_ts(e.get("end"))
        time = "All day" if e.get("isAllDay") else fmt_time(st) + (f" – {fmt_time(en)}" if en else "")
        calendar.append({
            "title": e["title"], "date": f"{st.month:02d}/{st.day:02d}",
            "dateLabel": st.strftime("%a, %b ") + str(st.day) + st.strftime(", %Y"),
            "month": st.strftime("%Y-%m"), "time": time, "location": e.get("location") or "",
            "description": e.get("description") or "",
        })

    notes = [
        {"title": n.get("title") or "Note", "body": n.get("content") or ""}
        for n in sorted(pd.get("notes", []), key=lambda n: n.get("updatedAt") or "", reverse=True)
        if not n.get("password")
    ]

    maps = [{"name": l["name"], "subtitle": l.get("description") or ""} for l in pd.get("mapLocations", [])]
    map_shared_with = [{"name": s["name"]} for s in pd.get("mapLocationSharing", []) if s.get("name")]

    revolut_tx = []
    accounts = pd.get("revolutAccounts") or []
    if accounts:
        main_acc = accounts[0]
        acc_tx = set(main_acc.get("transactionIds") or [])
        txs = [t for t in pd.get("revolutTransactions", []) if not acc_tx or t["id"] in acc_tx or t.get("accountId") == main_acc["id"]]
        for t in sorted(txs, key=lambda t: t["date"], reverse=True):
            title = t.get("title") or ""
            incoming = t.get("type") == "topup" or (t.get("type") == "transfer" and re.match(r"(transfer )?from ", title, re.I))
            revolut_tx.append({
                "name": title if incoming else (t.get("merchantName") or title),
                "amount": f"{'+' if incoming else '-'}{money(t['amount'])}",
                "date": rel_full(parse_ts(t["date"]), now), "note": t.get("description") or "",
            })
        balance = money(main_acc["balance"])
    else:
        balance = "$0.00"

    # Wallet (thẻ ngân hàng thật, khác RevoBank) — trước giờ buildCase.ts
    # hardcode "City Bank"/"$2,140" giả, 0 giao dịch, cho MỌI case dùng tới
    # nó. walletCards có sẵn isKeyTransaction+linkedQuestionId y hệt pattern
    # isKeyPhoto — map thẳng theo đó, không cần đoán qua text match.
    wallet_tx_by_qid = {}
    wallet_cards = pd.get("walletCards", [])
    if wallet_cards:
        wc = wallet_cards[0]
        wallet_tx = []
        for t in sorted(wc.get("transactions", []), key=lambda t: t.get("date") or "", reverse=True):
            name = t.get("title") or t.get("merchantName") or "Transaction"
            wallet_tx.append({
                "name": name,
                "amount": f"-{money(abs(t['amount']))}" if t.get("amount", 0) < 0 else f"+{money(t.get('amount', 0))}",
                "date": rel_full(parse_ts(t["date"]), now) if t.get("date") else "",
            })
            if t.get("isKeyTransaction") and t.get("linkedQuestionId"):
                wallet_tx_by_qid.setdefault(t["linkedQuestionId"], name)
        wallet_data = {
            "bank": wc.get("bank") or "Bank",
            "last4": wc.get("last4") or "0000",
            "balance": money(wc.get("balance", 0)),
            "transactions": wallet_tx,
        }
    else:
        wallet_data = None

    weather = {"city": "Local", "tempC": 18, "hi": 21, "lo": 12, "condition": "Clear"}
    wcities = pd.get("weatherCities") or []
    if wcities:
        wc = wcities[0]
        fc = (wc.get("forecast") or [{}])[0]
        cw = wc.get("currentWeather", {})
        weather = {
            "city": wc.get("cityName", "Local"),
            "tempC": f_to_c(cw.get("temperature", 64)),
            "hi": f_to_c(fc.get("highTemperature", fc.get("high", cw.get("temperature", 64) + 4))),
            "lo": f_to_c(fc.get("lowTemperature", fc.get("low", cw.get("temperature", 64) - 8))),
            "condition": WEATHER_TEXT.get(cw.get("condition"), str(cw.get("condition", "Clear")).replace("_", " ").title()),
        }

    # Ảnh "manh mối" (isKeyPhoto) PHẢI luôn có mặt — chúng chứa chữ/số thật
    # sự trả lời câu hỏi (textToDisplay, vd "ESTATE OF MARGUERITE FINCH"),
    # khác với ảnh đời thường (ảnh stock chung chung) chỉ để lấp đầy app.
    # Ưu tiên nhét hết key photo trước, dư chỗ mới lấy thêm ảnh gần đây nhất.
    # Ảnh bị cố tình làm mờ (unblurImage có sẵn ảnh rõ) thì lấy luôn bản rõ —
    # không làm cơ chế "chạm để unblur" phức tạp, hiện thẳng bản đọc được.
    all_photos = pd.get("photos", [])
    # photoAlbums — nguồn ảnh TÁCH RIÊNG khỏi mảng "photos" thường (vd album
    # "Dating app profile"), từng ảnh có thể tự kèm "text" (caption y hệt
    # textToDisplay của key photo) — trước đây bỏ sót hoàn toàn, case cần
    # đọc chữ trong 1 ảnh thuộc album thì không có nơi nào để tìm ra.
    album_key_photos = [
        {"imagePath": img["imagePath"], "dateTime": img.get("dateTime"), "isKeyPhoto": True, "textToDisplay": img["text"]}
        for album in pd.get("photoAlbums", [])
        for img in album.get("imagePath", [])
        if img.get("text")
    ]
    key_photos = [p for p in all_photos if p.get("isKeyPhoto")] + album_key_photos
    other_photos = sorted(
        (p for p in all_photos if not p.get("isKeyPhoto")),
        key=lambda p: p.get("dateTime") or "", reverse=True,
    )
    chosen = (key_photos + other_photos)[:PHOTO_COUNT]
    chosen.sort(key=lambda p: p.get("dateTime") or "", reverse=True)

    photos = []
    for i, p in enumerate(chosen):
        url = p.get("unblurImage") or p.get("imagePath")
        f = imgs.get(url, f"photo_{i}", 480, 68)
        if not f:
            continue
        caption = p.get("textToDisplay") if p.get("isKeyPhoto") else None
        photos.append({"image": f, "caption": caption} if caption else f)

    screen_time = sorted(
        (
            {"appName": s["appName"], "durationMinutes": s["durationMinutes"]}
            for s in pd.get("screenTimeUsage", [])
            if s.get("appName") and s.get("durationMinutes") is not None
        ),
        key=lambda s: s["durationMinutes"], reverse=True,
    )

    # Instagram: header lấy từ instagramProfile (bio thật), feed lấy từ
    # instagramPosts (bài của người khác xuất hiện trên dòng thời gian) —
    # trước đây field "instagram" không tồn tại trong phone_data nên app
    # luôn hiện trống trơn (0 Posts, không bio) cho MỌI case dùng tới nó.
    ig_profile = pd.get("instagramProfile") or {}
    ig_posts = []
    for i, p in enumerate(pd.get("instagramPosts", [])[:IG_POST_COUNT]):
        f = imgs.get(p.get("postImageUrl"), f"ig_post_{i}", 480, 68)
        if f:
            ig_posts.append({"image": f, "location": p.get("location") or "", "caption": p.get("caption") or "", "username": p.get("username") or ""})
    instagram_data = {
        "username": ig_profile.get("username") or "",
        "displayName": ig_profile.get("displayName") or owner["firstName"],
        "avatar": imgs.get(ig_profile.get("profileImageUrl"), "ig_avatar", 256, 75),
        "bio": ig_profile.get("bio") or "",
        "posts": ig_posts,
    }

    home, dock = [], []
    for a in d["availableApps"]:
        key = APP_MAP.get(a["app"])
        if not key:
            continue
        (dock if a.get("placement") == "dock" else home).append({"app": key, "label": a["label"]})

    messages_threads = convert_threads(pd.get("conversations", []), now, imgs, "msg")
    whatsapp_threads = convert_threads(pd.get("whatsappConversations", []), now, imgs, "wa")

    # Apps biết tự phát sáng đúng dòng (xem Messages/WhatsApp/Notes/Calendar/
    # Revolut .tsx: so khớp hintTargetId == title/name) — tìm candidate nào
    # được NHẮC TỚI NGUYÊN VĂN trong revealGuide/hint của câu đó thì gán làm
    # hintTarget. Không tìm thấy thì bỏ trống (app đó không highlight được —
    # bàn tay fallback trỏ nút back, xem AppScreen/App.tsx).
    ROW_CANDIDATES = {
        "messages": [t["title"] for t in messages_threads],
        "whatsapp": [t["title"] for t in whatsapp_threads],
        "notes": [n["title"] for n in notes],
        "calendar": [e["title"] for e in calendar],
        "revolut": [t["name"] for t in revolut_tx],
        "phone": [c["name"] for c in calls] + [c["name"] for c in contacts],
        "airbnb": [a["title"] for a in airbnb_listings],
        "wallet": [t["name"] for t in wallet_data["transactions"]] if wallet_data else [],
        "maps": [m["name"] for m in maps] + [s["name"] for s in map_shared_with],
        # Loại app "Settings" khỏi candidate — nó tự có mặt trong chính danh
        # sách Screen Time (iOS tính luôn thời gian dùng app Settings), chữ
        # "Settings" lại trùng với "Open Settings" trong mọi revealGuide nên
        # luôn match nhầm thành chính nó thay vì app thật cần tìm.
        "settings": [s["appName"] for s in screen_time if s["appName"] != "Settings"],
        # Fallback khi photo_caption_by_qid (linkedQuestionIds) không có —
        # album photo (photoAlbums) không tự khai linkedQuestionIds, chỉ có
        # thể dò qua text match thường như các app khác.
        "photos": [p["textToDisplay"] for p in key_photos if p.get("textToDisplay")],
        # Câu cần tìm email trong Sent thường mô tả bằng TIÊU ĐỀ ("the email
        # titled 'Custom engraving request'"), không nhắc người nhận (sender
        # của mục Sent chỉ là "To: ...") — thêm subject làm candidate thì
        # mới khớp được loại câu này.
        "gmail": [g["sender"] for g in gmail] + [g["subject"] for g in gmail],
    }

    def find_hint_target(q, app_key):
        candidates = ROW_CANDIDATES.get(app_key)
        if not candidates:
            return None
        haystack = f"{q.get('revealGuide') or ''}\n{q.get('hint') or ''}"
        # revealGuide thường có dạng "<các bước đi tìm>\nWhy: <giải thích vì
        # sao ra đáp án>" — candidate nằm trong phần "Why:" mới thực sự là
        # ĐÁP ÁN (đáng để chỉ tay vào), các candidate ở phần bước-đi-tìm phía
        # trên chỉ là mốc trung gian (vd "sự kiện Trey" chỉ để tìm ĐÚNG NGÀY,
        # còn đáp án thật "Cole" mới nằm trong Why) — ưu tiên match nằm trong
        # Why trước, rồi mới tới dài nhất, rồi tới xuất hiện sớm nhất (tie-
        # break phải xác định hẳn hoi, không chỉ dựa len(): duyệt set() không
        # ổn định giữa các lần chạy script do Python hash-randomize mỗi
        # process, cùng 1 case regenerate lại có thể ra kết quả khác nhau).
        why_text = re.split(r"\bWhy:", haystack, maxsplit=1, flags=re.I)[-1] if re.search(r"\bWhy:", haystack, re.I) else ""
        # Chuẩn hoá khi SO KHỚP (bỏ emoji/dấu câu, hạ chữ thường) — tiêu đề
        # email/tin nhắn thật hay có emoji ("🔥 You have a new match...")
        # trong khi revealGuide trích dẫn lại bỏ emoji đi, so khớp y nguyên
        # từng ký tự sẽ trượt dù nội dung giống hệt. Vẫn RETURN đúng cand
        # gốc (có emoji) để khớp chính xác với data thật lúc runtime.
        def norm(s):
            return re.sub(r"[^\w\s]", "", s).strip().lower()

        norm_haystack = norm(haystack)
        norm_why = norm(why_text)

        # Ưu tiên ĐỘ DÀI trước (candidate dài/cụ thể hơn luôn đáng tin hơn,
        # vd nguyên tiêu đề email "You have a new match with Paige!" đáng
        # tin hơn hẳn mỗi tên "Tinder" chung chung) — in_why CHỈ dùng để phá
        # hoà khi 2 candidate dài bằng nhau (ca Trey/Cole), không được để nó
        # đánh bại hẳn 1 candidate dài hơn nhiều chỉ vì tên NGẮN đó cũng
        # tình cờ được nhắc lại trong câu Why (rất hay xảy ra vì Why
        # thường lặp lại TÊN chung, không lặp nguyên văn tiêu đề/câu quote).
        def sort_key(cand):
            nc = norm(cand)
            in_why = nc in norm_why
            pos = norm_haystack.find(nc)
            return (-len(cand), 0 if in_why else 1, pos if pos >= 0 else len(haystack))

        for cand in sorted({c for c in candidates if c}, key=sort_key):
            if norm(cand) in norm_haystack:
                return cand
        # revolut: nhiều revealGuide mô tả giao dịch bằng số tiền thay vì nhắc
        # đúng tên merchant (vd "the $5,421.00 'Ring purchase' payment" trong
        # khi tên giao dịch thật là "Bisous Bisous Infinity") — match theo số
        # tiền $xxx.xx khi match theo tên thất bại.
        if app_key == "revolut":
            for amt in re.findall(r"\$[\d,]+\.\d{2}", haystack):
                for t in revolut_tx:
                    if t["amount"].lstrip("+-") == amt:
                        return t["name"]
        return None

    # Photos không dò bằng text match như các app khác — story gốc đã có sẵn
    # liên kết đáng tin cậy hơn: mỗi key photo tự khai linkedQuestionIds (vd
    # ảnh phong bì "ESTATE OF MARGUERITE FINCH" tự khai linkedQuestionIds=[6]
    # — đúng id câu hỏi gốc cần nó), không phải đoán qua revealGuide (thường
    # chỉ mô tả ảnh chung chung "phong bì trên bàn bếp", không nhắc nguyên văn
    # chữ hiện trên ảnh).
    photo_caption_by_qid = {}
    for p in all_photos:
        if p.get("isKeyPhoto") and p.get("textToDisplay"):
            for qid in p.get("linkedQuestionIds") or []:
                photo_caption_by_qid.setdefault(qid, p["textToDisplay"])

    # Messages/WhatsApp: đoạn chat (target) có thể dài hàng chục tin, câu hỏi
    # chỉ cần ĐÚNG 1 tin trong đó — nếu revealGuide/hint trích dẫn nguyên văn
    # (trong "..."), thử khớp với 1 tin nhắn thật trong đúng thread đó để tô
    # sáng đúng bong bóng. Không trích được quote hoặc không khớp tin nào
    # thật thì bỏ trống (vẫn còn gợi ý 💡, chỉ là không tô sáng tự động).
    def find_hint_message(q, app_key, target):
        if app_key not in ("messages", "whatsapp") or not target:
            return None
        threads = messages_threads if app_key == "messages" else whatsapp_threads
        thread = next((t for t in threads if t["title"] == target), None)
        if not thread:
            return None
        haystack = f"{q.get('revealGuide') or ''}\n{q.get('hint') or ''}"
        for quote in re.findall(r'"([^"]{4,})"', haystack):
            needle = quote.strip().rstrip("?.!,").lower()
            for m in thread["msgs"]:
                if needle in m["text"].lower():
                    return quote.strip()
        # Không có quote nguyên văn — nhiều revealGuide chỉ DIỄN GIẢI nội
        # dung tin nhắn (vd "he asks if she has seen the suite he booked")
        # thay vì trích dẫn, nhưng từ khoá đặc trưng (suite, booked, skyline,
        # jacuzzi...) vẫn trùng với từ thật trong tin. Chấm điểm theo số từ
        # khoá ĐẶC TRƯNG (bỏ qua từ phổ biến) xuất hiện trong mỗi tin, chọn
        # tin điểm cao nhất — tin đó gần như chắc chắn chính là tin được mô
        # tả (≥2 từ trùng hiếm khi là trùng hợp ngẫu nhiên trong tin nhắn
        # ngắn). Dưới 2 thì bỏ qua, thà không tô sáng còn hơn tô sai.
        words = {w for w in re.findall(r"[a-z]{4,}", haystack.lower()) if w not in STOPWORDS}
        best_msg, best_score = None, 0
        for m in thread["msgs"]:
            text_lower = m["text"].lower()
            score = sum(1 for w in words if w in text_lower)
            if score > best_score:
                best_msg, best_score = m["text"], score
        return best_msg if best_score >= 2 else None

    # 7 câu đã chọn -> data.questions tuần tự (reindex 1..7), KHỚP 1-1 với
    # overrides trong index.ts (xem buildCase.ts: qs[i+1] dùng để lấy lời
    # phản ứng câu kế — i là vị trí, không phải id gốc, nên phải compact lại).
    questions = []
    overrides_meta = []
    for k, (q, app_key) in enumerate(picked):
        questions.append({
            "id": k + 1, "text": q["question"], "answer": q["answer"][0],
            "decoys": (q.get("hintDecoys") or [])[:3], "hint": q.get("hint") or "",
        })
        if app_key == "photos":
            target = photo_caption_by_qid.get(q["id"]) or find_hint_target(q, app_key)
        elif app_key == "wallet":
            target = wallet_tx_by_qid.get(q["id"]) or find_hint_target(q, app_key)
        else:
            target = find_hint_target(q, app_key)
        message = find_hint_message(q, app_key, target)
        overrides_meta.append((app_key, target, message))

    onboarding = []
    for i, o in enumerate(d.get("onboardingContent", [])):
        onboarding.append({
            "text": o["text"], "label": o.get("textUnderImage") or "",
            "image": imgs.get(o.get("image"), f"onboarding_{i + 1}", 720, 72),
        })

    phone_data = {
        "caseName": d["redChapters"]["caseName"],
        "title": d["title"],
        "now": now.isoformat(),
        "client": {"name": d["nameProfile"], "avatar": imgs.get(d.get("imageProfile"), "client", 256, 75)},
        "owner": {
            "first": owner["firstName"], "full": f"{owner['firstName']} {owner['lastName']}",
            "avatar": imgs.get(owner_contact.get("avatarUrl"), "owner", 256, 75),
        },
        "wallpaper": imgs.get(d.get("wallpaper"), "wallpaper", 900, 70),
        "passcode": d.get("passcode") or "0000",
        "totalQuestions": len(questions),
        "questions": questions,
        "onboarding": onboarding,
        "home": home, "dock": dock, "missingApps": [],
        "calls": calls, "contacts": contacts,
        "messages": messages_threads,
        "whatsapp": whatsapp_threads,
        "gmail": gmail, "calendar": calendar, "notes": notes, "maps": maps, "mapSharedWith": map_shared_with,
        "revolut": {"balance": balance, "transactions": revolut_tx},
        "weather": weather, "photos": photos, "screenTime": screen_time,
        "instagram": instagram_data,
        "wallet": wallet_data,
        "airbnb": airbnb_data,
    }
    (out_dir / "phone.json").write_text(json.dumps(phone_data, ensure_ascii=False, indent=1), encoding="utf-8")

    # --- index.ts (7 overrides, hintApp auto-detected; hintTarget set khi
    # tìm được đúng tên dòng trong app đó — app không highlight được dòng
    # (Phone/Gmail/Photos/...) thì bàn tay fallback trỏ nút back) ---
    def esc(s):
        return (s or "").replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()

    final_reply = (d.get("textSuccess") or "").split(".")[0].strip()
    if not final_reply:
        final_reply = "That settles it. I know what I need to know now."
    lines = [
        'import { buildCase, type PhoneJson } from "../buildCase";',
        'import data from "./phone.json";',
        "",
        'const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });',
        "",
        f'export default buildCase("{case_id}", data as unknown as PhoneJson, images, {{',
        "  questions: [",
    ]
    for app_key, hint_target, hint_message in overrides_meta:
        attrs = [f'hintApp: "{app_key}"']
        if hint_target:
            attrs.append(f'hintTarget: "{esc(hint_target)}"')
        if hint_message:
            attrs.append(f'hintMessage: "{esc(hint_message)}"')
        lines.append(f'    {{ {", ".join(attrs)} }},')
    lines += [
        "  ],",
        f'  introChoices: ["I\'ll help you, {esc(d["nameProfile"])}.", "Show me {esc(owner["firstName"])}\'s phone."],',
        f'  introCta: "Open {esc(owner["firstName"])}\'s phone \U0001f50d",',
        f'  finalReply: "{esc(final_reply)}.",',
        f'  endHeadline: "{esc(d["redChapters"]["caseName"])}",',
        f'  endSubhead: "{esc(d.get("description", ""))}",',
        "});",
        "",
    ]
    (out_dir / "index.ts").write_text("\n".join(lines), encoding="utf-8")

    img_count = len(list((out_dir / "img").glob("*.webp")))
    print(f"   now={now:%Y-%m-%d} questions={len(questions)} apps={overrides_meta} images={img_count}")
    return case_id


MANIFEST = ROOT / "scripts" / "v19_batch_manifest.json"


def load_manifest():
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text(encoding="utf-8"))
    return {}


def save_manifest(m):
    MANIFEST.write_text(json.dumps(m, indent=1), encoding="utf-8")


if __name__ == "__main__":
    only = set(sys.argv[1:])
    force = "--force" in sys.argv
    if force:
        only.discard("--force")
    story_ids = sorted(
        int(re.match(r"story_(\d+)\.json", p.name).group(1))
        for p in STORY_DIR.glob("story_*.json")
    )
    targets = [sid for sid in story_ids if sid not in ALREADY_USED]
    if only:
        targets = [sid for sid in targets if str(sid) in only]

    # Chạy lại an toàn: bỏ qua story đã convert thành công ở lần chạy trước
    # (trừ khi --force), và số thứ tự case tiếp tục từ chỗ dở dang, không
    # đụng/đè lên các case đã ghi.
    manifest = load_manifest()
    if not force:
        targets = [sid for sid in targets if str(sid) not in manifest]
    next_num = 14 + len(manifest)

    done = []
    for sid in targets:
        case_id = convert_one(sid, next_num)
        if case_id:
            done.append(case_id)
            manifest[str(sid)] = case_id
            save_manifest(manifest)
            next_num += 1
    print(f"\n{len(done)} cases written this run (tong manifest: {len(manifest)}):")
    for c in done:
        print(f"  {c}")
