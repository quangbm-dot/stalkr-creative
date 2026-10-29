"""
One-off asset-download script (NOT part of build/runtime) for case
10_joanne_walt: pulls 7 extra candid/filler photos from the same GCS
bucket (20261014_joanne_walt) to pad out the Photos app gallery.

Usage:
    python -I scripts/download_joanne_walt_gallery.py
"""
import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src/cases/10_joanne_walt/img"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASE = "https://storage.googleapis.com/stalkr-images/20261014_joanne_walt/photos"
FILES = {
    "lorraine_car": f"{BASE}/photo_1.jpg",
    "pills_note": f"{BASE}/photo_10.jpg",
    "pierogi_dinner": f"{BASE}/photo_11.jpg",
    "milk_bananas_note": f"{BASE}/photo_12.jpg",
    "grave_visit": f"{BASE}/photo_13.jpg",
    "fireworks_river": f"{BASE}/photo_15.jpg",
    "cardinal_feeder": f"{BASE}/photo_16.jpg",
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
        fetch(url, name, 700)
    except Exception as e:  # noqa: BLE001
        print(f"! failed {name}: {e}", file=sys.stderr)
