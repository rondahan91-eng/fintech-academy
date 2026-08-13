#!/usr/bin/env python3
"""
רַצָּן שבוע — כלי אימות תוכן.

מריץ פתרון כלשהו מול הטסטים של שבוע, ומדפיס מה עבר ומה נכשל.
נועד לאימות התוכן לפני שקיימת פלטפורמה: מאמת שפתרון ייחוס עובר,
ושפתרונות שגויים נכשלים בדיוק בטסט הנכון.

    py tools/run_week.py 1 solutions/week-01_reference.py
    py tools/run_week.py 1 solutions/week-01_reference.py --hidden-only

חוזה הטסטים זהה לזה שהפלטפורמה תממש (ראה content/_schema/README.md):
כל פונקציה test_* מורצת, ולרשותה OUTPUT ו-LINES.
"""

import argparse
import contextlib
import io
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_meta(week_dir: Path) -> dict:
    """קורא meta.yml. מחזיר dict ריק אם אין yaml מותקן או אין קובץ."""
    meta_path = week_dir / "meta.yml"
    if not meta_path.is_file():
        return {}
    try:
        import yaml
    except ImportError:
        print("אזהרה: pyyaml לא מותקן — קוד תשתית לא יוזרק.")
        return {}
    return yaml.safe_load(meta_path.read_text(encoding="utf-8")) or {}


def capture_output(solution_path: Path, injects: list) -> str:
    """
    מריץ את קוד התלמיד ומחזיר את כל מה שהודפס.

    קוד התשתית מ-meta.yml → injects מורץ קודם, **באותו namespace**,
    כך שהמחלקות שהוא מגדיר זמינות לתלמיד בלי import — בדיוק כפי
    שהפלטפורמה תעשה.
    """
    namespace = {"__name__": "__main__"}
    buf = io.StringIO()

    with contextlib.redirect_stdout(buf):
        for rel in injects:
            lib_path = ROOT / rel
            if not lib_path.is_file():
                raise FileNotFoundError(f"קוד תשתית חסר: {rel}")
            exec(compile(lib_path.read_text(encoding="utf-8"), str(lib_path), "exec"), namespace)

        code = solution_path.read_text(encoding="utf-8")
        exec(compile(code, str(solution_path), "exec"), namespace)

    return buf.getvalue()


def run_suite(test_path: Path, output: str):
    """מריץ קובץ טסטים אחד. מחזיר [(שם, עבר, הודעה)]."""
    namespace = {"OUTPUT": output, "LINES": output.split("\n")}
    exec(compile(test_path.read_text(encoding="utf-8"), str(test_path), "exec"), namespace)

    results = []
    for name, fn in sorted(namespace.items()):
        if not (name.startswith("test_") and callable(fn)):
            continue
        try:
            fn()
            results.append((name, True, ""))
        except AssertionError as exc:
            results.append((name, False, str(exc)))
        except Exception as exc:  # noqa: BLE001 — טסט שבור, לא פתרון שבור
            results.append((name, False, f"[הטסט עצמו קרס] {type(exc).__name__}: {exc}"))
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="מריץ פתרון מול טסטים של שבוע")
    parser.add_argument("week", type=int, help="מספר שבוע (1-30)")
    parser.add_argument("solution", type=Path, help="נתיב לקובץ הפתרון")
    parser.add_argument("--hidden-only", action="store_true", help="רק הטסטים הנסתרים")
    parser.add_argument("--show-output", action="store_true", help="להדפיס גם את פלט הפתרון")
    args = parser.parse_args()

    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    week_dir = ROOT / "content" / f"week-{args.week:02d}"
    if not week_dir.is_dir():
        print(f"לא נמצאה תיקיית שבוע: {week_dir}")
        return 2
    if not args.solution.is_file():
        print(f"לא נמצא קובץ פתרון: {args.solution}")
        return 2

    meta = load_meta(week_dir)
    injects = meta.get("injects") or []
    if injects:
        print(f"קוד תשתית מוזרק: {', '.join(injects)}\n")

    try:
        output = capture_output(args.solution, injects)
    except Exception as exc:  # noqa: BLE001
        print(f"קוד הפתרון קרס לפני שהטסטים רצו:\n  {type(exc).__name__}: {exc}")
        return 1

    if args.show_output:
        print("--- פלט הפתרון ---")
        print(output)
        print("--- סוף פלט ---\n")

    suites = ["tests_hidden.py"] if args.hidden_only else ["tests_visible.py", "tests_hidden.py"]

    total_failed = 0
    for suite in suites:
        path = week_dir / suite
        if not path.is_file():
            print(f"{suite}: לא קיים, מדלג")
            continue

        results = run_suite(path, output)
        passed = sum(1 for _, ok, _ in results if ok)
        failed = len(results) - passed
        total_failed += failed

        mark = "✓" if failed == 0 else "✗"
        print(f"{mark} {suite}  —  {passed}/{len(results)}")
        for name, ok, message in results:
            if not ok:
                print(f"    {name}")
                for line in message.split("\n"):
                    print(f"      {line}")
        print()

    return 0 if total_failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
