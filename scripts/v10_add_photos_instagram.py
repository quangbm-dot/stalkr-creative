"""
Bổ sung dữ liệu còn thiếu cho 5 case (không chạy lại converter cũ để khỏi đè ảnh):
  - Casey (story.json): thêm "photos" (9 ảnh mới nhất) — trước đó mảng rỗng nên app Photos trống.
  - Instagram cho cả 5 case: thêm "instagram" {username, displayName, avatar, posts[]}.
    Case có instagramPosts trong draft (Casey, Noor) -> dùng thật.
    Case không có (Gus, Joss, Lucia) -> dựng feed từ chính các ảnh photo_* của máy.

    python -I -X utf8 scripts/v10_add_photos_instagram.py
"""
import io, json, re, sys, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CASES = ROOT / "src/cases"
PHOTO_COUNT = 9
POST_COUNT = 8


def fetch(url, dst, max_side, quality=70):
    try:
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read()
        im = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as e:  # noqa: BLE001
        print(f"   ! {url}: {e}", file=sys.stderr)
        return False
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)
    return True


def posts_from_draft(pd, img_dir):
    prof = pd.get("instagramProfile") or {}
    raw = pd.get("instagramPosts") or []
    posts = []
    for i, p in enumerate(raw[:POST_COUNT]):
        name = f"insta_{i}.webp"
        if fetch(p["postImageUrl"], img_dir / name, 480):
            posts.append({"image": name, "location": p.get("location") or "", "caption": p.get("caption") or "",
                          "username": p.get("username") or prof.get("username") or ""})
    avatar = None
    if prof.get("profileImageUrl") and fetch(prof["profileImageUrl"], img_dir / "insta_avatar.webp", 160, 80):
        avatar = "insta_avatar.webp"
    return prof.get("username") or "", prof.get("displayName") or "", avatar, posts


def posts_from_photos(photos, owner_full, avatar, img_dir):
    user = re.sub(r"[^a-z0-9]+", "_", owner_full.lower()).strip("_")
    posts = [{"image": f, "location": "", "caption": "", "username": user} for f in photos[:6]]
    return user, owner_full, avatar, posts


def patch(case_id, json_name, draft_name, story_style):
    d = CASES / case_id
    img_dir = d / "img"
    data = json.load(open(d / json_name, encoding="utf-8"))
    draft = json.load(open(ROOT / draft_name, encoding="utf-8"))
    pd = draft.get("phoneData", draft)
    if story_style and not data.get("photos"):
        photos = []
        for i, p in enumerate(sorted(pd["photos"], key=lambda p: p.get("dateTime") or "", reverse=True)[:PHOTO_COUNT]):
            name = f"photo_{i}.webp"
            if fetch(p["imagePath"], img_dir / name, 480, 68):
                photos.append(name)
        data["photos"] = photos
    username, display, avatar, posts = posts_from_draft(pd, img_dir)
    if not posts:
        owner_full = data.get("ownerFull") or data.get("owner", {}).get("full", "")
        av = data.get("clientAvatar") or (data.get("owner") or {}).get("avatar")
        username, display, avatar, posts = posts_from_photos(data.get("photos") or [], owner_full, av, img_dir)
        src = "photos"
    else:
        src = "draft"
    data["instagram"] = {"username": username, "displayName": display or username, "avatar": avatar, "posts": posts}
    json.dump(data, open(d / json_name, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{case_id}: photos={len(data.get('photos') or [])} instagram posts={len(posts)} ({src}) user={username}")


patch("01_casey_miles", "story.json", "story_1_casey-miles.json", True)
patch("01_gus_ilse", "phone.json", "test_case_draft_20261005_gus_ilse.json", False)
patch("02_joss_calder", "phone.json", "test_case_draft_20261012_joss_calder.json", False)
patch("03_lucia_bex", "phone.json", "test_case_draft_20261012_lucia_bex.json", False)
patch("04_noor_celeste", "phone.json", "test_case_draft_20261009_noor_celeste.json", False)
