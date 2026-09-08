#!/usr/bin/env python3
"""Downscale oversized park photos under skate_assets/ for faster gallery loads.

Usage:
  python scripts/optimize-skate-assets.py
  python scripts/optimize-skate-assets.py --park WestValley_SkatePark
  python scripts/optimize-skate-assets.py --max-width 1600 --quality 80 --dry-run
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "skate_assets"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--park", default="", help="Only process this folder name")
    parser.add_argument("--max-width", type=int, default=1920)
    parser.add_argument("--quality", type=int, default=82)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    folders = (
        [ROOT / args.park]
        if args.park
        else [p for p in ROOT.iterdir() if p.is_dir() and p.name != "skateAssets"]
    )

    changed = skipped = 0
    bytes_before = bytes_after = 0

    for folder in folders:
        if not folder.is_dir():
            print(f"skip missing folder: {folder.name}")
            continue
        for path in sorted(folder.iterdir()):
            if not path.is_file() or path.suffix.lower() not in IMAGE_EXT:
                continue
            before = path.stat().st_size
            with Image.open(path) as im:
                if im.mode in ("RGBA", "P"):
                    im = im.convert("RGB")
                w, h = im.size
                needs_resize = w > args.max_width
                needs_recompress = before > 900_000
                if not needs_resize and not needs_recompress:
                    skipped += 1
                    continue

                new_w = min(w, args.max_width)
                new_h = round(h * (new_w / w))
                if args.dry_run:
                    print(
                        f"DRY  {path.relative_to(ROOT)}  {w}x{h} "
                        f"{before/1024:.0f}KB -> ~{new_w}x{new_h}"
                    )
                    changed += 1
                    continue

                out = im if new_w == w else im.resize((new_w, new_h), Image.Resampling.LANCZOS)
                tmp = path.with_suffix(path.suffix + ".tmp")
                suf = path.suffix.lower()
                if suf in {".jpg", ".jpeg"}:
                    out.save(tmp, "JPEG", quality=args.quality, optimize=True, progressive=True)
                elif suf == ".webp":
                    out.save(tmp, "WEBP", quality=args.quality, method=4)
                else:
                    out.save(tmp, "PNG", optimize=True)

                after = tmp.stat().st_size
                if after >= before and new_w == w:
                    tmp.unlink()
                    skipped += 1
                    continue

                path.unlink()
                tmp.rename(path)
                print(
                    f"OK   {path.relative_to(ROOT)}  {w}x{h} {before/1024:.0f}KB "
                    f"-> {new_w}x{new_h} {after/1024:.0f}KB"
                )
                changed += 1
                bytes_before += before
                bytes_after += after

    saved = (bytes_before - bytes_after) / 1024 / 1024
    print(f"--- changed={changed} skipped={skipped} saved={saved:.2f}MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
