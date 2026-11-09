#!/usr/bin/env python3
"""מחליף את בלוק העיצוב בכל presentation-prompt.md מתוך מקור אחד.

    py tools/sync_slide_style.py            סנכרון
    py tools/sync_slide_style.py --check     בדיקה בלבד, בלי כתיבה

**למה הכלי הזה קיים.** כל קובץ `presentation-prompt.md` מועתק בשלמותו
ל-Claude, ולכן הסגנון חייב לשבת **בתוכו** ולא כהפניה. בלי סנכרון, שינוי
בסגנון המערכת היה דורש עריכה ידנית בכל שבוע — וההבדל בין השבועות היה
מתגלה רק כשמסתכלים על שתי מצגות זו לצד זו.

המקור: content/_shared/presentation-style.md, בין שני הסמנים.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "content" / "_shared" / "presentation-style.md"
OPEN = "<!-- ═══ התחלת בלוק הסגנון ═══ -->"
CLOSE = "<!-- ═══ סוף בלוק הסגנון ═══ -->"


def block_of(text: str, where: str) -> str:
    if OPEN not in text or CLOSE not in text:
        raise SystemExit(f"⛔ חסרים סמנים ב-{where}")
    head, rest = text.split(OPEN, 1)
    body, _ = rest.split(CLOSE, 1)
    return body


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    check = "--check" in sys.argv
    style = block_of(SOURCE.read_text(encoding="utf-8"), SOURCE.name)

    targets = sorted((ROOT / "content").glob("week-*/presentation-prompt.md"))
    if not targets:
        print("לא נמצא אף presentation-prompt.md")
        return 0

    stale, synced, skipped = [], 0, []
    for p in targets:
        text = p.read_text(encoding="utf-8")
        # ⚠️ **קובץ בלי סמנים מדולג ואינו נכשל.** מצגות שנכתבו לפני
        #    שהסגנון רוכז עדיין תקפות; הן פשוט אינן מנוהלות מכאן.
        if OPEN not in text or CLOSE not in text:
            skipped.append(p.parent.name)
            continue
        if block_of(text, p.name) == style:
            synced += 1
            continue
        stale.append(p.parent.name)
        if not check:
            head, rest = text.split(OPEN, 1)
            _, tail = rest.split(CLOSE, 1)
            p.write_text(head + OPEN + style + CLOSE + tail, encoding="utf-8")

    for name in skipped:
        print(f"  {name}: אין סמנים — מדולג")
    print(f"  מסונכרנים ממילא: {synced}")
    if stale:
        verb = "לא מעודכנים" if check else "עודכנו"
        print(f"  {verb}: {', '.join(stale)}")
    if check and stale:
        return 1
    print("הסגנון אחיד." if not stale else "הסגנון סונכרן.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
