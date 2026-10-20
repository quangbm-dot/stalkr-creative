"""
v10: convert a real Stalkr app "story" export (story_1_casey-miles.json —
the richer schema with free-text answers, 15 questions, full phoneData) into
the trimmed data + local webp images src/cases/01_casey_miles/ needs.

    python -I scripts/v10_convert_story.py

Only the first 10 questions are used (per user instruction) and only the
apps those 10 need: Settings, Messages, Calendar, Maps, Airbnb, RevoBank
(Revolut), Notes. hintApp/hint text for each of the 10 was hand-curated
below by reading each question's hint/revealGuide against the real
phoneData (see conversation notes — this is a one-off curation, not a
generic per-field mapping like v9's).
"""

import io
import json
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = json.load(open(ROOT / "story_1_casey-miles.json", encoding="utf-8"))
CASE_ID = "01_casey_miles"
OUT_DIR = ROOT / "src/cases" / CASE_ID
IMG_DIR = OUT_DIR / "img"


class ImageStore:
    def __init__(self, out_dir):
        self.out_dir = out_dir
        self.by_url = {}
        out_dir.mkdir(parents=True, exist_ok=True)
        for old in out_dir.glob("*.webp"):
            old.unlink()

    def get(self, url, name, max_side, quality=78):
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


imgs = ImageStore(IMG_DIR)
pd = SRC["phoneData"]


def conv_by_id(cid):
    return next(c for c in pd["conversations"] if c["id"] == cid)


def thread_from_conv(cid, title, avatar_name=None, since=None, max_msgs=None):
    conv = conv_by_id(cid)
    msgs = conv["messages"]
    if since:
        msgs = [m for m in msgs if m["timestamp"] >= since]
    if max_msgs:
        msgs = msgs[-max_msgs:]
    avatar = None
    if avatar_name:
        p = conv["participants"][0]
        avatar = imgs.get(p.get("avatarUrl"), avatar_name, 256)
    return {
        "id": cid,
        "title": title,
        "avatar": avatar,
        "time": "Recent",
        "unread": False,
        "msgs": [{"me": m["sender"]["id"] == "me", "text": m["text"]} for m in msgs],
    }


print("Downloading onboarding + thread images...")

onboarding_imgs = [imgs.get(o["image"], f"onboarding_{i+1}", 720) for i, o in enumerate(SRC["onboardingContent"])]
sms_contact_avatar = imgs.get(SRC["onboardingSms"]["contactAvatar"], "client", 256)
wallpaper = imgs.get(SRC["wallpaper"], "wallpaper", 900)
hero = imgs.get(SRC["image"], "hero", 720)

messages_threads = [
    thread_from_conv("conv-sophie", "Do not pick up"),
    thread_from_conv("conv1", "Casey 💖", avatar_name="client", since="2026-07-20"),
    thread_from_conv("conv2", "Gil", since="2026-07-20"),
]

# Inline images referenced inside onboardingSms "messages" steps (e.g. the
# photo of Miles sent mid-chat) — fetched by index so hire.ts can reference them.
sms_step_images = {}
for si, step in enumerate(SRC["onboardingSms"]["steps"]):
    if step["type"] != "messages":
        continue
    for mi, m in enumerate(step["messages"]):
        if m.get("image"):
            sms_step_images[f"{si}-{mi}"] = imgs.get(m["image"], f"sms_{si}_{mi}", 720)

# Clone y hệt layout home screen thật — không tự chọn bớt app. 23 app dùng
# đúng "placement" của availableApps: dock, home_page_1/2/3.
APP_KEY_MAP = {"email": "gmail", "revobank": "revolut", "game2048": "game2048"}
home_pages = {"dock": [], "home_page_1": [], "home_page_2": [], "home_page_3": []}
for a in SRC["availableApps"]:
    key = APP_KEY_MAP.get(a["app"], a["app"])
    icon_file = imgs.get(a["iconUri"], f"appicon_{key}", 128, quality=82)
    home_pages[a["placement"]].append({"app": key, "label": a["label"], "icon": icon_file})

# Nguồn "whatsapp.jpg" thật sự trả về đúng icon Phone (lỗi dữ liệu phía
# storage của app Stalkr) — bản "real/whatsapp.webp" cũ trong repo này
# (nhánh v4) cũng bị gắn nhầm y hệt. Icon WhatsApp thật đúng đã có sẵn ở
# worktree v7-kb3 (bộ icon mới đã kiểm tra bằng mắt) — copy từ đó qua.
import shutil  # noqa: E402

good_whatsapp = ROOT.parent / "v7-kb3-alex-sophia/src/Assets/Icons/real/whatsapp.webp"
shutil.copy(good_whatsapp, IMG_DIR / "appicon_whatsapp.webp")

# Reference V8 screenshot (e.jpg) shows WhatsApp in the dock (not Instagram)
# and a specific page-1 grid order — match that exactly instead of
# availableApps' own placement/order, which differs from it.
by_app = {x["app"]: x for p in home_pages.values() for x in p}
home_pages["dock"] = [by_app["messages"], by_app["phone"], by_app["whatsapp"]]
# "settings" is also pulled onto page 1 (off page 2, its original placement)
# — it's the hintApp for question 1, and every other hintApp across the 10
# questions already lives on page 1 or the dock, so no question ever forces
# the player to swipe pages to find the app they need.
home_pages["home_page_1"] = [
    by_app[k]
    for k in ["settings", "photos", "notes", "calendar", "weather", "instagram", "airbnb", "revolut", "wallet", "gmail"]
]
home_pages["home_page_2"] = [x for x in home_pages["home_page_2"] if x["app"] != "settings"]

notes = [{"title": n["title"], "body": n["content"]} for n in pd["notes"][:6]]

calendar = []
for e in pd["calendarEvents"][:12]:
    calendar.append({
        "title": e["title"],
        "date": e["start"][5:10].replace("-", "/"),
        "location": e.get("location", ""),
    })

maps_locations = [{"name": m["name"], "subtitle": m.get("description", "")} for m in pd["mapLocations"][:14]]

airbnb_listings = [
    {"title": h["name"], "img": imgs.get(h["imagesUrl"][0], f"airbnb_{i}", 480), "subtitle": f"{h['date']} · ${h['price']}"}
    for i, h in enumerate(pd["previousHotels"])
]

# The -500 Airbnb charge the revealGuide points to isn't a literal row in
# revolutTransactions — it's previousHotels[0].price (Venice Loft, $500).
# Synthesized here as the top (most recent) RevoBank row so the clue holds.
venice = pd["previousHotels"][0]
revolut_transactions = [{"name": "Airbnb — Venice Loft", "amount": f"-${venice['price']:.0f}", "date": venice["date"], "note": "1 night"}]
for t in pd["revolutTransactions"][:10]:
    amt = t["amount"]
    revolut_transactions.append({
        "name": t.get("merchantName") or t["title"],
        "amount": f"{'+' if amt > 0 else '-'}${abs(amt):,.2f}",
        "date": t["date"][5:10].replace("-", "/"),
        "note": t.get("description", ""),
    })

owner = SRC["phoneOwnerProfile"]
owner_full = f"{owner['firstName']} {owner['lastName']}"

trimmed = {
    "title": SRC["title"],
    "ownerFirst": owner["firstName"],
    "ownerFull": owner_full,
    "clientName": SRC["onboardingSms"]["contactName"],
    "clientAvatar": sms_contact_avatar,
    "hero": hero,
    "wallpaper": wallpaper,
    "passcode": SRC["passcode"],
    "endHeadline": "Want to know what else he's hiding?",
    "endSubhead": SRC["description"],
    "onboardingContent": [
        {"text": o["text"], "caption": o["textUnderImage"], "image": onboarding_imgs[i]}
        for i, o in enumerate(SRC["onboardingContent"])
    ],
    "onboardingSms": {
        "contactName": SRC["onboardingSms"]["contactName"],
        "steps": [
            {
                "type": step["type"],
                **({"messages": [
                    {"text": m.get("text"), "image": sms_step_images.get(f"{si}-{mi}")}
                    for mi, m in enumerate(step["messages"])
                ]} if step["type"] == "messages" else {}),
                **({"placeholder": step["placeholder"]} if step["type"] == "prompt" and step["inputType"] == "keyboard" else {}),
                **({"options": step["choices"]} if step["type"] == "prompt" and step["inputType"] == "choices" else {}),
                "inputType": step.get("inputType"),
            }
            for si, step in enumerate(SRC["onboardingSms"]["steps"])
        ],
    },
    "home": home_pages,
    "messages": messages_threads,
    "notes": notes,
    "calendar": calendar,
    "maps": maps_locations,
    "airbnb": {"name": "Airbnb", "listings": airbnb_listings},
    "revolut": {"balance": "$2,318.44", "transactions": revolut_transactions},
    # Hand-curated from the first 10 questions' hint/revealGuide text — see
    # module docstring. hintApp picks whichever app actually has the data
    # built above; hint text is rewritten to match (e.g. Q1 uses Settings,
    # not the Contacts tab the original hint mentioned, since this playable
    # has no Contacts UI). V8 reference screenshots show multiple-choice
    # buttons (answer + hintDecoys, shuffled, lock icon) — not free text.
    "questions": [
        (0, "Open Settings. The name at the very top of the screen is the phone owner's own.", "settings"),
        (1, "Open Messages and look for the chat whose contact name reads like a warning, not a person's name.", "messages"),
        (2, "Open Messages → the chat with \"Do not pick up\" → scroll to the most recent texts, near the bottom.", "messages"),
        (3, "Open Messages → the chat with \"Do not pick up\" → scroll to the very top of the thread.", "messages"),
        (4, "Open Messages → the chat with \"Do not pick up\" → near the top, they talk about food for the first date.", "messages"),
        (5, "Check Calendar for the \"Tinder Date\" event, then look up its address in Google Maps.", "calendar"),
        (6, "Open Airbnb and check his past stays for the extra one-night booking.", "airbnb"),
        (7, "Open RevoBank — the charge at the top of the list.", "revolut"),
        (8, "Open Messages → the chat with Casey 💖 → near the bottom, the morning-after text.", "messages"),
        (9, "Open Notes → the note titled \"Bits and pieces\".", "notes"),
    ],
}
trimmed["questions"] = [
    {
        "prompt": SRC["questions"][i]["question"],
        "answer": SRC["questions"][i]["answer"][0],
        "decoys": SRC["questions"][i]["hintDecoys"],
        "hint": hint,
        "hintApp": hint_app,
    }
    for i, hint, hint_app in trimmed["questions"]
]

OUT_DIR.mkdir(parents=True, exist_ok=True)
with open(OUT_DIR / "story.json", "w", encoding="utf-8") as f:
    json.dump(trimmed, f, ensure_ascii=False, indent=2)

print(f"-> {OUT_DIR / 'story.json'}")
print(f"-> {IMG_DIR} ({len(list(IMG_DIR.glob('*.webp')))} images)")
