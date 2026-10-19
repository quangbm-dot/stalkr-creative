"""
v9: convert Stalkr app case drafts (test_case_draft_*.json) into the trimmed
data + local webp images the playable bundles.

    python -I scripts/v9_convert_cases.py

For each case in CASES this writes:
  src/cases/<id>/phone.json   only the fields the playable's mini apps render
  src/cases/<id>/img/*.webp   every image phone.json references, downloaded
                              from the CDN and recompressed (keeps each build
                              small and fully self-contained — no remote URLs)

Times are pre-formatted here relative to the case's "now" (latest call /
message / email on the phone), using the timestamps' wall-clock fields as-is
(the drafts store local time with a Z suffix).
"""

import io
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

CASES = [
    ("01_gus_ilse", "test_case_draft_20261005_gus_ilse.json"),
    ("02_joss_calder", "test_case_draft_20261012_joss_calder.json"),
    ("03_lucia_bex", "test_case_draft_20261012_lucia_bex.json"),
    ("04_noor_celeste", "test_case_draft_20261009_noor_celeste.json"),
]

# Case app key -> playable AppKey. Apps missing here have no mini-app UI /
# icon in the playable yet and are left off the home screen.
APP_MAP = {
    "phone": "phone",
    "messages": "messages",
    "photos": "photos",
    "email": "gmail",
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
}

MAX_QUESTIONS = 5
PHOTO_COUNT = 9
MAX_THREAD_AVATARS = 14


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
    """List-row timestamp: time if today, otherwise the day label."""
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
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
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


def convert_threads(convs, now, imgs, prefix):
    convs = sorted(convs, key=lambda c: c.get("lastUpdated") or "", reverse=True)
    out = []
    for i, c in enumerate(convs):
        parts = c.get("participants") or []
        title = c.get("name") or ", ".join(p.get("name", "") for p in parts) or "Unknown"
        msgs = []
        for m in sorted(c["messages"], key=lambda m: m.get("timestamp") or ""):
            text = (m.get("text") or "").strip()
            if not text:
                continue
            msgs.append({"me": (m.get("sender") or {}).get("id") == "me", "text": text})
        if not msgs:
            continue
        last = parse_ts(c.get("lastUpdated")) or now
        avatar = None
        if len(parts) == 1 and i < MAX_THREAD_AVATARS:
            avatar = imgs.get(parts[0].get("avatarUrl"), f"{prefix}_{i}", 128, 70)
        t = {
            "id": c["id"],
            "title": title,
            "time": rel_short(last, now),
            "unread": False,
            "msgs": msgs,
        }
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
    "sunny": "Sunny",
    "clear": "Clear",
    "partly_cloudy": "Partly Cloudy",
    "cloudy": "Cloudy",
    "rainy": "Rain",
    "rain": "Rain",
    "stormy": "Thunderstorms",
    "snowy": "Snow",
    "foggy": "Fog",
    "windy": "Windy",
}


def f_to_c(f):
    return round((f - 32) * 5 / 9)


def convert(case_id, src_name):
    print(f"== {case_id} <- {src_name}")
    d = json.loads((ROOT / src_name).read_text(encoding="utf-8"))
    pd = d["phoneData"]
    out_dir = ROOT / "src" / "cases" / case_id
    imgs = ImageStore(out_dir / "img")

    stamps = [parse_ts(c["timestamp"]) for c in pd["callLogs"]]
    for c in pd["conversations"] + pd["whatsappConversations"]:
        stamps += [parse_ts(m.get("timestamp")) for m in c["messages"]]
    stamps += [parse_ts(e.get("dateTime")) for e in pd["emails"] + pd.get("emailsSend", [])]
    # The weather "current" date is the case's in-story today (questions say
    # "yesterday morning" relative to it); fall back to the latest activity.
    latest = max(s for s in stamps if s)
    today = parse_ts(pd["weatherCities"][0]["currentWeather"].get("date"))
    now = max(latest, today.replace(hour=23, minute=59)) if today else latest
    now = now.replace(hour=23, minute=59, second=0)

    owner = pd["phoneOwnerProfile"]
    owner_contact = next((c for c in pd["contacts"] if c.get("id") == "owner"), {})

    calls = []
    for c in sorted(pd["callLogs"], key=lambda c: c["timestamp"], reverse=True):
        dt = parse_ts(c["timestamp"])
        missed = c["type"] == "missed" or c.get("status") == "missed"
        ctype = "missed" if missed else c["type"]
        detail = ""
        if c.get("status") == "completed" and c.get("duration"):
            mins = max(1, round(c["duration"] / 60))
            detail = f"{mins} min"
        elif c.get("status") == "blocked":
            detail = "Blocked"
        calls.append({
            "name": person_name(c["contact"]) or c["contact"].get("phoneNumber", "Unknown"),
            "time": rel_full(dt, now),
            "type": ctype if ctype in ("incoming", "outgoing", "missed") else "incoming",
            "detail": detail,
        })

    gmail = [email_row(e, now, "inbox") for e in pd["emails"] if not e.get("isSpam") and not e.get("isDeleted")]
    gmail += [email_row(e, now, "sent") for e in pd.get("emailsSend", [])]
    gmail.sort(key=lambda g: g["_ts"], reverse=True)
    for g in gmail:
        del g["_ts"]

    calendar = []
    for e in sorted(pd["calendarEvents"], key=lambda e: e["start"], reverse=True):
        st, en = parse_ts(e["start"]), parse_ts(e.get("end"))
        if e.get("isAllDay"):
            time = "All day"
        else:
            time = fmt_time(st) + (f" – {fmt_time(en)}" if en else "")
        calendar.append({
            "title": e["title"],
            "date": f"{st.month:02d}/{st.day:02d}",
            "dateLabel": st.strftime("%a, %b ") + str(st.day) + st.strftime(", %Y"),
            "month": st.strftime("%Y-%m"),
            "time": time,
            "location": e.get("location") or "",
        })

    notes = [
        {"title": n.get("title") or "Note", "body": n.get("content") or ""}
        for n in sorted(pd["notes"], key=lambda n: n.get("updatedAt") or "", reverse=True)
        if not n.get("password")
    ]

    maps = [{"name": l["name"], "subtitle": l.get("description") or ""} for l in pd["mapLocations"]]

    main_acc = pd["revolutAccounts"][0]
    acc_tx = set(main_acc.get("transactionIds") or [])
    txs = [t for t in pd["revolutTransactions"] if not acc_tx or t["id"] in acc_tx or t.get("accountId") == main_acc["id"]]
    revolut_tx = []
    for t in sorted(txs, key=lambda t: t["date"], reverse=True):
        # Drafts aren't consistent about sign (payments are sometimes stored
        # positive), so direction comes from the type/title instead.
        title = t.get("title") or ""
        incoming = t.get("type") == "topup" or (
            t.get("type") == "transfer" and re.match(r"(transfer )?from ", title, re.I)
        )
        revolut_tx.append({
            "name": title if incoming else (t.get("merchantName") or title),
            "amount": f"{'+' if incoming else '-'}{money(t['amount'])}",
            "date": rel_full(parse_ts(t["date"]), now),
            "note": t.get("description") or "",
        })

    wc = pd["weatherCities"][0]
    fc = (wc.get("forecast") or [{}])[0]
    weather = {
        "city": wc["cityName"],
        "tempC": f_to_c(wc["currentWeather"]["temperature"]),
        "hi": f_to_c(fc.get("highTemperature", fc.get("high", wc["currentWeather"]["temperature"] + 4))),
        "lo": f_to_c(fc.get("lowTemperature", fc.get("low", wc["currentWeather"]["temperature"] - 8))),
        "condition": WEATHER_TEXT.get(wc["currentWeather"]["condition"], wc["currentWeather"]["condition"].replace("_", " ").title()),
    }

    photos = []
    for i, p in enumerate(sorted(pd["photos"], key=lambda p: p.get("dateTime") or "", reverse=True)[:PHOTO_COUNT]):
        f = imgs.get(p["imagePath"], f"photo_{i}", 480, 68)
        if f:
            photos.append(f)

    home, dock, missing_apps = [], [], []
    for a in d["availableApps"]:
        key = APP_MAP.get(a["app"])
        if not key:
            missing_apps.append(a["label"])
            continue
        (dock if a.get("placement") == "dock" else home).append({"app": key, "label": a["label"]})

    questions = []
    for q in d["questions"][:MAX_QUESTIONS + 1]:
        questions.append({
            "id": q["id"],
            "text": q["question"],
            "answer": q["answer"][0],
            "decoys": q.get("hintDecoys") or [],
            "hint": q.get("hint") or "",
        })

    onboarding = []
    for i, o in enumerate(d["onboardingContent"]):
        onboarding.append({
            "text": o["text"],
            "label": o.get("textUnderImage") or "",
            "image": imgs.get(o["image"], f"onboarding_{i + 1}", 720, 72),
        })

    data = {
        "caseName": d["redChapters"]["caseName"],
        "title": d["title"],
        "now": now.isoformat(),
        "client": {
            "name": d["nameProfile"],
            "avatar": imgs.get(d["imageProfile"], "client", 256, 75),
        },
        "owner": {
            "first": owner["firstName"],
            "full": f"{owner['firstName']} {owner['lastName']}",
            "avatar": imgs.get(owner_contact.get("avatarUrl"), "owner", 256, 75),
        },
        "wallpaper": imgs.get(d["wallpaper"], "wallpaper", 900, 70),
        "passcode": d.get("passcode") or "0000",
        "totalQuestions": len(d["questions"]),
        "questions": questions,
        "onboarding": onboarding,
        "home": home,
        "dock": dock,
        "missingApps": missing_apps,
        "calls": calls,
        "messages": convert_threads(pd["conversations"], now, imgs, "msg"),
        "whatsapp": convert_threads(pd["whatsappConversations"], now, imgs, "wa"),
        "gmail": gmail,
        "calendar": calendar,
        "notes": notes,
        "maps": maps,
        "revolut": {"balance": money(main_acc["balance"]), "transactions": revolut_tx},
        "weather": weather,
        "photos": photos,
    }
    (out_dir / "phone.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    size = sum(f.stat().st_size for f in (out_dir / "img").glob("*.webp"))
    print(f"   now={now:%Y-%m-%d} images={len(list((out_dir / 'img').glob('*.webp')))} ({size // 1024} KB) "
          f"json={(out_dir / 'phone.json').stat().st_size // 1024} KB missing apps={missing_apps}")


if __name__ == "__main__":
    only = sys.argv[1:]
    for cid, src in CASES:
        if not only or any(o in cid for o in only):
            convert(cid, src)
