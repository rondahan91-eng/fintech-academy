#!/usr/bin/env python3
"""
מנרמל את תשעת האווטארים לקנבס אחיד וחותך לגודל הפאנל.

    py tools/crop_persona.py

    assets/persona/elad-*.png        ← המקורות. 2816×1536, לא נוגעים בהם
    assets/persona/panel/elad-*.png  ← מה שהאפליקציה טוענת. 656×480

**למה בכלל צריך את זה.** המקורות הם פריים רחב עם הדמות באמצע והרבה
לבן סביבה. ‏`object-fit: contain` על פריים כזה בקופסה של 240 פיקסלים
היה נותן ראש בגודל 40 פיקסלים. `manifest.yml` אומר את זה במפורש:
**"240px הוא חיתוך, לא הקטנה."**

**ולמה כל התשעה יחד.** בפאנל האווטאר מחליף מצב תוך כדי שיחה. אם
הראש יושב בגובה אחר בכל תמונה, הוא יקפוץ בכל החלפה — וזו הדרישה
`normalized_baseline` במניפסט. הנרמול כאן הוא לפי שני ציוני דרך
שנמדדים אמינות בכל התשעה:

    top       השורה הראשונה שאינה לבנה — קודקוד הכיפה
    headH     מ-top ועד קו הכתפיים, שם רוחב הצללית קופץ פי 1.8
    cx        מרכז הראש אופקית

‏headH נמדד 605–673 בתשעת המצבים — פער של 5%, וזה מה שהנרמול מיישר.
"""
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "persona"

# ⚠️ **חצי הרוחב הוא האילוץ, לא היחס.** ‏presenting מושיט יד עד 1166
#    פיקסלים ממרכז הראש ו-explaining פורש ידיים ל-978. חלון צר מזה
#    חותך בדיוק את מה שמבדיל בין המצבים — האזהרה שכתובה במניפסט.
#    כל מסגור נגזר מ-HALF_W, ומה שלא מסתדר מרופד בלבן.
HALF_W = 1180

# ‏head_top_frac — איפה יושב קודקוד הראש כשבר מגובה הפלט.
CROPS = {
    # מסך העבודה: הקופסה 328×240, לרוחב. פי 2 לצפיפות.
    "panel": {"w": 656, "h": 480, "head_top_frac": 0.071},
    # שיחת הקליטה: layout.md §10, פורטרט לצד השיחה. פי 2.
    "talk":  {"w": 1080, "h": 1040, "head_top_frac": 0.20},
}


def head_target(out_w: int, min_head: int) -> int:
    """גובה הראש ביעד — **נגזר, לא נבחר.**

    הנרמול הוא לפי גובה הראש, ולכן חלון המקור רחב `out_w·headH/HEAD_H`.
    ככל שהראש ביעד גדול יותר, החלון צר יותר. הראש הקטן ביותר בסט הוא
    המקרה הגרוע, והוא זה שקובע את התקרה:

        out_w · min_head / HEAD_H  ≥  2·HALF_W

    ‏98% כדי להשאיר שוליים לעיגול.
    """
    return int(out_w * min_head / (2 * HALF_W) * 0.98)

WHITE_SUM = 720   # סכום RGB שמעליו פיקסל נחשב רקע


def landmarks(path: Path) -> dict:
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    mask = a.sum(axis=2) < WHITE_SUM
    rows = mask.any(axis=1)
    widths = mask.sum(axis=1)

    top = int(np.argmax(rows))
    h = len(rows) - top
    head_w = int(widths[top: top + int(h * 0.15)].max())

    shoulder = next((y for y in range(top + int(h * 0.15), len(widths))
                     if widths[y] > head_w * 1.8), None)
    if shoulder is None:
        raise SystemExit(f"{path.name}: לא נמצא קו כתפיים")

    band = mask[top: top + int(h * 0.12)]
    cols = np.where(band.any(axis=0))[0]
    cx = int((cols[0] + cols[-1]) / 2)

    return {"top": top, "headH": shoulder - top, "cx": cx,
            "size": (a.shape[1], a.shape[0])}


def crop(path: Path, lm: dict, spec: dict, head_h: int) -> Image.Image:
    """מנרמל לפי גובה הראש, ומרפד בלבן את מה שחורג מהמקור."""
    s = head_h / lm["headH"]                 # קנה המידה שמיישר את הראשים
    w_src = round(spec["w"] / s)
    h_src = round(spec["h"] / s)
    x0 = lm["cx"] - w_src // 2
    y0 = lm["top"] - round(spec["head_top_frac"] * h_src)

    # החלון חורג מהמקור. הרקע לבן ממילא — מרפדים בלבן ולא נותנים
    # ל-PIL למלא בשחור.
    canvas = Image.new("RGB", (w_src, h_src), "white")
    src = Image.open(path).convert("RGB")
    sx0, sy0 = max(0, x0), max(0, y0)
    sx1 = min(src.width, x0 + w_src)
    sy1 = min(src.height, y0 + h_src)
    if sx1 > sx0 and sy1 > sy0:
        canvas.paste(src.crop((sx0, sy0, sx1, sy1)), (sx0 - x0, sy0 - y0))

    return canvas.resize((spec["w"], spec["h"]), Image.LANCZOS)


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    masters = sorted(SRC.glob("elad-*.png"))
    if not masters:
        print(f"אין מקורות ב-{SRC}")
        return 1

    lms = {p: landmarks(p) for p in masters}
    heads = [lm["headH"] for lm in lms.values()]
    reach = max(max(lm["cx"] - 0, 0) for lm in lms.values())  # לתיעוד בלבד
    print(f"{len(masters)} מצבים · גובה ראש במקור {min(heads)}–{max(heads)}\n")

    for name, spec in CROPS.items():
        out = SRC / name
        out.mkdir(exist_ok=True)
        head_h = head_target(spec["w"], min(heads))
        print(f"  {name}  {spec['w']}×{spec['h']} · ראש {head_h}px "
              f"({head_h * 100 // spec['h']}% מהגובה)")

        for p, lm in lms.items():
            img = crop(p, lm, spec, head_h)
            dest = out / p.name
            img.save(dest, optimize=True)

            # אימות: החלון באמת מכיל את המחווה הרחבה ביותר?
            half = round(spec["w"] / (head_h / lm["headH"])) // 2
            flag = "" if half >= HALF_W else f"  ⚠ צר ב-{HALF_W - half}px"
            print(f"    {p.name[5:-4]:14s} חצי חלון {half:5d}"
                  f"  {dest.stat().st_size // 1024:4d} KB{flag}")
        print()

    print(f"נוצר: {', '.join('assets/persona/' + n for n in CROPS)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
