"""
Casey: thêm các chat gây nhiễu (lấy từ conversations gốc) vào Messages để
"Do not pick up" không còn nằm sẵn ở đầu danh sách (quá dễ lộ ở Q2).
Thứ tự theo ngày tin cuối như điện thoại thật; "Do not pick up" ở vị trí 9.

    python -I -X utf8 scripts/v10_add_decoy_threads.py
"""
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = json.load(open(ROOT / "story_1_casey-miles.json", encoding="utf-8"))["phoneData"]["conversations"]
P = ROOT / "src/cases/01_casey_miles/story.json"
story = json.load(open(P, encoding="utf-8"))
by_id = {t["id"]: t for t in story["messages"]}  # 3 thread cũ (đầy đủ, có avatar)

ORDER = ["conv1", "conv-maxime", "conv-luke", "conv-mom", "conv-dad", "conv2", "conv-taxi", "conv-nathan",
         "conv-sophie", "conv-mathys", "conv-frangin", "conv-sarah", "conv-yass", "conv-alex", "conv-cousine-paula"]
src = {c["id"]: c for c in SRC}


def label(ts):
    d = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    return d.strftime("%b %-d") if hasattr(d, "strftime") and False else f"{d.strftime('%b')} {d.day}"


out = []
for cid in ORDER:
    c = src[cid]
    if cid in by_id:
        t = dict(by_id[cid])
    else:
        msgs = [{"me": m["sender"]["id"] == "me", "text": m["text"]} for m in c["messages"][-8:]]
        t = {"id": cid, "title": c["participants"][0]["name"], "avatar": None, "unread": False, "msgs": msgs}
    t["time"] = label(c["messages"][-1]["timestamp"])
    out.append(t)
story["messages"] = out
json.dump(story, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print([t["title"] for t in out])
