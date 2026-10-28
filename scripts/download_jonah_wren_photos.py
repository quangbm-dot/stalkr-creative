"""
One-off asset-download script (NOT part of build/runtime) for case
09_jonah_wren: pulls the real photos referenced by story_25_jonah_wren.json's
GCS bucket (20261014_jonah_wren) into src/cases/09_jonah_wren/img/ as webp.

Usage:
    python -I scripts/download_jonah_wren_photos.py
"""
import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src/cases/09_jonah_wren/img"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASE = "https://storage.googleapis.com/stalkr-images/20261014_jonah_wren"
FILES = {
    "jonah": f"{BASE}/onboarding/profile_jonah_client.jpg?v=2100",
    "jonah_wren_duo": f"{BASE}/onboarding/onboarding_2.jpg?v=2100",
    "wren": f"{BASE}/onboarding/onboarding_3.jpg?v=2100",
    "hero": f"{BASE}/photos/photo_81.jpg?v=2101",
    "wallpaper": f"{BASE}/wallpaper/wallpaper_wren.jpg?v=2100",
}


def fetch(url: str, name: str, max_side: int, quality: int = 82):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    raw = urllib.request.urlopen(req, timeout=30).read()
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    out = OUT_DIR / f"{name}.webp"
    im.save(out, "WEBP", quality=quality, method=6)
    print(f"-> {out} ({im.width}x{im.height})")


for name, url in FILES.items():
    try:
        fetch(url, name, 900)
    except Exception as e:  # noqa: BLE001
        print(f"! failed {name}: {e}", file=sys.stderr)
