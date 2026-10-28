"""
One-off asset-download script (NOT part of build/runtime) for case
10_joanne_walt: pulls the real photos referenced by story_27_joanne_walt.json's
GCS bucket (20261014_joanne_walt) into src/cases/10_joanne_walt/img/ as webp.

Usage:
    python -I scripts/download_joanne_walt_photos.py
"""
import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src/cases/10_joanne_walt/img"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASE = "https://storage.googleapis.com/stalkr-images/20261014_joanne_walt"
FILES = {
    "joanne": f"{BASE}/onboarding/profile_joanne_client.jpg?v=2100",
    "joanne_walt_duo": f"{BASE}/onboarding/onboarding_2.jpg?v=2100",
    "walt": f"{BASE}/onboarding/onboarding_3.jpg?v=2100",
    "hero": f"{BASE}/photos/photo_81.jpg?v=2100",
    "wallpaper": f"{BASE}/wallpaper/wallpaper_walt.jpg?v=2100",
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
