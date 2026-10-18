#!/usr/bin/env python3
"""מאמת שההרחבה והמשימה השבועית אינן סותרות זו את זו.

    py tools/check_extension.py        כל השבועות שיש להם הרחבה
    py tools/check_extension.py 3      שבוע אחד

**למה הכלי הזה קיים.** בדפדפן, תלמיד שקיבל הרחבה מריץ את הבדיקות
השבועיות **ואת** בדיקות ההרחבה על אותה תוכנית — `app.js` משרשר את
השתיים. לכן כל ערך שהמשימה השבועית מקבעת חייב לשרוד גם את ההרחבה.

בשבוע 3 זה נשבר בשקט: המשימה השבועית דרשה `gross_salary == 13750.5`
וההרחבה ביקשה העלאה נוספת על אותו משתנה. **לא הייתה תוכנית שעוברת
את שתי הקבוצות**, ואת זה לא רואים כשבודקים כל קובץ לחוד — זו בדיוק
הטעות שהכלי הזה חוסם.

כל שבוע עם `extension.md` חייב `reference_extension.py`, והוא נבדק
מול שתי קבוצות הבדיקות יחד. `reference.py` נבדק מול הגלויות בלבד.
"""
import io
import re
import sys
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"


def injects_of(week_dir: Path) -> str:
    """קוד התשתית ש-meta.yml מכריז עליו — אותו קוד שהדפדפן מזריק.

    ⚠️ **בלי זה שבוע 2 נופל כאן על NameError: Account**, בדיוק כמו
       שהוא נפל בדפדפן לפני שהאפליקציה למדה על ההזרקות.
    """
    meta = week_dir / "meta.yml"
    if not meta.exists():
        return ""
    m = re.search(r"^injects:\s*\n((?:\s*-\s*.+\n)+)",
                  meta.read_text(encoding="utf-8"), re.M)
    if not m:
        return ""
    src = ""
    for ln in m.group(1).strip().split("\n"):
        rel = ln.strip().lstrip("-").strip().strip("\"'")
        p = ROOT / rel
        if p.exists():
            src += p.read_text(encoding="utf-8") + "\n"
    return src


def run(src_path: Path) -> dict:
    """מריץ את התוכנית ומחזיר את אותם שלושה שמות שהדפדפן מספק."""
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    with redirect_stdout(buf):
        inject = injects_of(src_path.parent)
        if inject:
            exec(compile(inject, "inject", "exec"), ns)
        exec(compile(src_path.read_text(encoding="utf-8"),
                     src_path.name, "exec"), ns)
    out = buf.getvalue()
    return {"OUTPUT": out, "LINES": out.split("\n"),
            "VARS": {k: v for k, v in ns.items() if not k.startswith("__")}}


def check(tests_path: Path, env: dict) -> list:
    """מריץ קובץ בדיקות ומחזיר את רשימת הכישלונות."""
    ns = dict(env)
    exec(compile(tests_path.read_text(encoding="utf-8"),
                 tests_path.name, "exec"), ns)
    failures = []
    for name, fn in sorted(ns.items()):
        if not name.startswith("test_") or not callable(fn):
            continue
        try:
            fn()
        except AssertionError as err:
            doc = (fn.__doc__ or name).strip().split("\n")[0]
            failures.append((tests_path.name, doc, str(err)))
    return failures


def week_dirs(only: str | None) -> list:
    if only:
        d = CONTENT / f"week-{int(only):02d}"
        if not d.is_dir():
            raise SystemExit(f"אין תיקייה {d}")
        return [d]
    return sorted(d for d in CONTENT.glob("week-*") if d.is_dir())


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    only = sys.argv[1] if len(sys.argv) > 1 else None
    bad = 0

    for d in week_dirs(only):
        visible = d / "tests_visible.py"
        if not visible.exists():
            continue
        print(f"── {d.name} ──")

        ref = d / "reference.py"
        if ref.exists():
            fails = check(visible, run(ref))
            print(f"  reference.py            "
                  f"{'נפל' if fails else 'עובר'} את הבדיקות הגלויות")
            for where, doc, msg in fails:
                print(f"      ✗ {where} · {doc}\n        {msg}")
            bad += len(fails)

        if not (d / "extension.md").exists():
            print("  אין הרחבה\n")
            continue

        ref_ext = d / "reference_extension.py"
        if not ref_ext.exists():
            print(f"  ⚠ חסר {ref_ext.name} — "
                  f"אי אפשר לאמת שההרחבה אינה סותרת את המשימה\n")
            bad += 1
            continue

        env = run(ref_ext)
        fails = check(visible, env) + check(d / "tests_extension.py", env)
        print(f"  reference_extension.py  "
              f"{'נפל' if fails else 'עובר'} את שתי הקבוצות יחד")
        for where, doc, msg in fails:
            print(f"      ✗ {where} · {doc}\n        {msg}")
        bad += len(fails)
        print()

    print("הכול עקבי." if bad == 0 else f"\n{bad} כשלים.")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
