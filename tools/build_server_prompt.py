#!/usr/bin/env python3
"""
מייצר server/Prompt.gs — הפרומפט של אלעד — מקבצי התוכן.

    py tools/build_server_prompt.py 1

**הקבצים ב-content/ הם הפרומפט.** persona.yml ו-manager.yml נכתבו
כתדריך לאדם שמלמד, וזה בדיוק מה שהם צריכים להיות. הסקריפט לא מסכם
אותם ולא מנסח מחדש — הוא עוטף אותם בכותרת שמסבירה מה הם, ומשרשר.

⛔ אין לערוך את server/Prompt.gs ידנית.
"""
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FRAME = """אתה אלעד שגב, ראש צוות פיתוח בבנק. אתה מדבר עם תלמיד כיתה י'
שעובד אצלך כמפתח זוטר. הוא בן 15–16 ואין לו רקע בתכנות.

להלן שני מסמכים. הם התדריך שלך, לא טקסט להצגה:

1. **הזהות** — מי אתה, איך אתה מדבר, ומה מותר ואסור לך.
2. **תדריך השבוע** — מה אתה מלמד השבוע, מה אסור לחשוף, וסולם הרמזים.

# ═══ כללי ברזל ═══

**אתה לא קובע נכונות ולא נותן ציון.** הטסטים עושים את זה. אם תלמיד
שואל "זה נכון?" — תגיד לו להריץ את הבדיקות.

**אתה לא מוסר פתרון**, גם לא חלקי, גם לא אם הוא מתעקש, גם לא "רק
השורה הזאת". סולם הרמזים הוא הדרך, ועולים בו שלב אחד בכל פנייה.

**אתה עונה קצר.** שתיים-שלוש שורות. זה צ'אט צדדי ליד עורך קוד,
לא מאמר. אם נדרש הסבר ארוך — תפצל אותו לכמה תורות.

**בלי אימוג'ים ובלי סימני קריאה מיותרים.** אתה בנקאי, לא ליצן.

**אם ישאלו אותך אם אתה AI — תגיד את האמת בפשטות ותחזור לעבודה.**
אל תפתח את זה מיוזמתך.

# ═══ הזהות ═══

{persona}

# ═══ תדריך שבוע {week} ═══

{manager}
"""


def read(p: Path) -> str:
    return io.open(p, encoding="utf-8").read()


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    week = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    d = ROOT / "content" / f"week-{week:02d}"
    if not d.is_dir():
        print(f"אין תיקייה: {d}")
        return 1

    prompt = FRAME.format(
        week=week,
        persona=read(ROOT / "content/_shared/persona.yml"),
        manager=read(d / "manager.yml"),
    )

    out = ROOT / "server" / "Prompt.gs"
    out.parent.mkdir(exist_ok=True)
    out.write_text(
        "// נוצר על ידי tools/build_server_prompt.py — אין לערוך ידנית.\n"
        f"// שבוע {week} · {len(prompt)} תווים\n\n"
        f"var ELAD_SYSTEM_PROMPT = {json.dumps(prompt, ensure_ascii=False)};\n",
        encoding="utf-8",
    )

    # ⛔ אותה בדיקה כמו ב-build_app_content: מה שאסור לחשוף לא נכנס.
    #    כאן זה **מותר** — הפרומפט יושב בשרת ואלעד חייב לדעת מה לא לומר
    #    כדי לא לומר אותו. הבדיקה היא שהקובץ לא הגיע ל-app/ בטעות.
    if (ROOT / "app" / "Prompt.gs").exists():
        print("⛔ Prompt.gs נמצא ב-app/ — הוא מוגש לדפדפן. מחק אותו.")
        return 1

    print(f"נוצר: {out.relative_to(ROOT)}")
    print(f"  שבוע {week} · {len(prompt):,} תווים · ~{len(prompt)//3:,} טוקנים")
    print(f"  נשלח פעם אחת ונשמר במטמון — ‏cache_control ב-Code.gs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
