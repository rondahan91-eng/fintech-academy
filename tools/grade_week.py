#!/usr/bin/env python3
"""
בודק הגשות של כיתה מול הטסטים הנסתרים, ומוציא דוח קריא.

    py tools/grade_week.py 2 submissions.csv
    py tools/grade_week.py 2 submissions.csv --roster roster.csv
    py tools/grade_week.py 2 submissions.csv --out report.md

את ה-CSV מייצאים מהגיליון: לשונית submissions ← קובץ ← הורדה ← CSV.
‏--roster על לשונית roster מוסיף לדוח גם את מי שלא הגיש כלל.

⛔ **הטסטים הנסתרים רצים כאן ולא בדפדפן** (‏SPEC §7). הקובץ הזה הוא
   הגשר בין ההגשות בגיליון לבין הציון, ולכן הוא מריץ את שתי החבילות:
   הגלויות — מה שהתלמיד ראה בזמן העבודה, והנסתרות — מה שקובע.

⚠️ **הקוד של התלמידים רץ כאן במחשב שלך, בלי ארגז חול אמיתי.** יש מגבלת
   זמן, חסימת input וחסימת כתיבה לקבצים, אבל מי שירצה להזיק יצליח.
   זה קוד של תלמידים בכיתה, לא קלט מהאינטרנט — ובכל זאת: לא להריץ
   קובץ CSV שהגיע ממקור אחר.
"""
import argparse
import builtins
import csv
import io
import sys
import time
from contextlib import redirect_stdout
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LIMIT_SECONDS = 10          # נדיב פי שניים מהמגבלה שבדפדפן
OUTPUT_CAP = 200_000


# ═══ ארגז החול ════════════════════════════════════════════════════════

class _Capped(io.StringIO):
    """לולאה אינסופית עם print בתוכה הייתה ממלאת את הזיכרון."""

    def write(self, s):
        if self.tell() > OUTPUT_CAP:
            raise KeyboardInterrupt("הפלט חרג מהמותר — כנראה לולאה אינסופית")
        return io.StringIO.write(self, s)


def _deadline_tracer(deadline):
    """עוצר קוד שרץ יותר מדי. אותו מנגנון כמו במנוע שבדפדפן."""
    def local(frame, event, arg):
        if time.monotonic() > deadline:
            raise KeyboardInterrupt(f"הקוד רץ יותר מ-{LIMIT_SECONDS} שניות")
        return local

    def top(frame, event, arg):
        return local
    return top


def run_student_code(code: str, inject_src: str):
    """
    מריץ קוד תלמיד ומחזיר (פלט, namespace, שגיאה).

    קוד התשתית רץ **באותו namespace ולפני** קוד התלמיד — בדיוק כמו
    ‏run_week.py וכמו המנוע שבדפדפן. שלושת המקומות חייבים להסכים,
    אחרת ההגשה נבדקת אחרת ממה שהתלמיד ראה על המסך.
    """
    ns = {"__name__": "__main__"}
    buf = _Capped()
    err = None

    # ⚠️ input() בלי מקלדת זורק EOFError ומפיל הגשה שלמה על כלום.
    #    משבוע 3 יהיה קלט, ואז הוא יגיע מרשימה; עד אז מחרוזת ריקה.
    original_input = builtins.input
    builtins.input = lambda *a: ""
    try:
        with redirect_stdout(buf):
            if inject_src.strip():
                exec(compile(inject_src, "מודול התשתית", "exec"), ns)
            sys.settrace(_deadline_tracer(time.monotonic() + LIMIT_SECONDS))
            try:
                exec(compile(code, "הגשה", "exec"), ns)
            finally:
                sys.settrace(None)
    except BaseException as exc:                       # noqa: BLE001
        err = f"{type(exc).__name__}: {exc}"
    finally:
        builtins.input = original_input

    return buf.getvalue(), ns, err


def run_suite(test_src: str, label: str, output: str, ns: dict):
    """מריץ חבילת טסטים. מחזיר [(שם, תווית, עבר, הודעה)]."""
    g = {"OUTPUT": output, "LINES": output.split("\n"),
         "VARS": {k: v for k, v in ns.items() if not k.startswith("__")}}
    try:
        exec(compile(test_src, label, "exec"), g)
    except BaseException as exc:                       # noqa: BLE001
        return [("<חבילה>", label, False, f"[החבילה עצמה קרסה] {exc}")]

    out = []
    for name, fn in sorted(g.items()):
        if not (name.startswith("test_") and callable(fn)):
            continue
        # ⚠️ ה-docstring של טסט נסתר נכתב למורה ולעיתים הוא פסקה שלמה.
        #    בדוח הוא תווית, ולכן: שורה אחת, ועד המשפט הראשון.
        doc = " ".join((fn.__doc__ or "").split())
        title = doc.split(". ")[0][:90] if doc else name
        try:
            fn()
            out.append((name, title, True, ""))
        except AssertionError as exc:
            out.append((name, title, False, str(exc)))
        except BaseException as exc:                   # noqa: BLE001
            out.append((name, title, False, f"[הטסט קרס] {type(exc).__name__}: {exc}"))
    return out


# ═══ קריאת הגיליון ════════════════════════════════════════════════════

def read_csv(path: Path) -> list:
    """‏Sheets מייצא UTF-8 עם BOM. utf-8-sig בולע אותו; utf-8 היה משאיר
    אותו בשם העמודה הראשונה, וכל חיפוש של 'ts' היה נכשל."""
    with io.open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def parse_ts(value: str):
    """הגיליון כותב dd/MM/yyyy HH:mm:ss. נכשל — אין תאריך, לא נפילה."""
    for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(value.strip(), fmt)
        except (ValueError, AttributeError):
            continue
    return None


def load_week_assets(week: int):
    d = ROOT / "content" / f"week-{week:02d}"
    if not d.is_dir():
        raise SystemExit(f"אין תיקיית שבוע: {d}")

    meta_src = (d / "meta.yml").read_text(encoding="utf-8")
    inject_src = ""
    # ⚠️ בלי pyyaml — אותה שליפה כמו ב-build_app_content.py. תלות אחת
    #    פחות על מחשב של מורה.
    in_block = False
    for line in meta_src.splitlines():
        if line.startswith("injects:"):
            in_block = True
            continue
        if in_block:
            if line.strip().startswith("-"):
                rel = line.strip().lstrip("-").strip().strip("\"'")
                p = ROOT / rel
                if not p.is_file():
                    raise SystemExit(f"קוד תשתית חסר: {rel}")
                inject_src += f"# ===== {rel} =====\n{p.read_text(encoding='utf-8')}\n"
                continue
            if line.strip() and not line.startswith(" "):
                in_block = False

    suites = []
    for name in ("tests_visible.py", "tests_hidden.py"):
        p = d / name
        suites.append((name, p.read_text(encoding="utf-8") if p.is_file() else ""))
    return inject_src, suites


# ═══ הדוח ═════════════════════════════════════════════════════════════

def status_of(crashed: bool, hidden_pass: int, hidden_total: int) -> str:
    if crashed:
        return "הקוד קרס"
    if hidden_total and hidden_pass == hidden_total:
        return "הושלם"
    if hidden_pass == 0:
        return "לא בוצע"
    return "חלקי"


def main() -> int:
    ap = argparse.ArgumentParser(description="בודק הגשות כיתה מול הטסטים הנסתרים")
    ap.add_argument("week", type=int)
    ap.add_argument("submissions", type=Path, help="‏CSV של לשונית submissions")
    ap.add_argument("--roster", type=Path, help="‏CSV של לשונית roster — מוסיף את מי שלא הגיש")
    ap.add_argument("--out", type=Path, help="קובץ דוח. ברירת מחדל: reports/week-NN.md")
    args = ap.parse_args()

    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    inject_src, suites = load_week_assets(args.week)
    rows = [r for r in read_csv(args.submissions)
            if str(r.get("week", "")).strip() == str(args.week)]

    by_student = {}
    for r in rows:
        by_student.setdefault(str(r.get("id", "")).strip(), []).append(r)

    results = []
    for sid, subs in by_student.items():
        subs.sort(key=lambda r: parse_ts(r.get("ts", "")) or datetime.min)
        graded = []
        for sub in subs:
            output, ns, err = run_student_code(sub.get("code", ""), inject_src)
            per_suite = {}
            for name, src in suites:
                per_suite[name] = run_suite(src, name, output, ns) if src else []
            graded.append({"row": sub, "err": err, "suites": per_suite})

        def hidden_score(g):
            res = g["suites"].get("tests_hidden.py", [])
            return sum(1 for _, _, ok, _ in res if ok)

        last = graded[-1]
        best = max(graded, key=hidden_score)
        results.append({
            "id": sid,
            "name": str(subs[-1].get("name", "")).strip(),
            "count": len(subs),
            "last_ts": subs[-1].get("ts", ""),
            "last": last,
            "best": best,
            "improved_earlier": hidden_score(best) > hidden_score(last),
        })

    missing = []
    if args.roster:
        submitted = set(by_student)
        for r in read_csv(args.roster):
            sid = str(r.get("id", "")).strip()
            name = str(r.get("name", "")).strip()
            if name and sid not in submitted:
                missing.append((sid, name))

    out_path = args.out or (ROOT / "reports" / f"week-{args.week:02d}.md")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    write_report(out_path, args.week, results, missing)

    # ── סיכום למסך ────────────────────────────────────────────────────
    done = sum(1 for x in results if status_of(
        bool(x["last"]["err"]),
        *tally(x["last"]["suites"].get("tests_hidden.py", []))) == "הושלם")
    print(f"שבוע {args.week} · {len(results)} הגישו · {done} השלימו "
          f"· {len(results) - done} חלקי או נכשל" +
          (f" · {len(missing)} לא הגישו" if args.roster else ""))
    print(f"הדוח: {out_path}")
    return 0


def tally(res):
    return sum(1 for _, _, ok, _ in res if ok), len(res)


def write_report(path: Path, week: int, results: list, missing: list):
    lines = [f"# שבוע {week} — דוח הגשות", "",
             f"נוצר: {datetime.now().strftime('%d/%m/%Y %H:%M')} · "
             "‏הטסטים הנסתרים הם שקובעים; הגלויות הן מה שהתלמיד ראה בזמן העבודה.",
             "", "| תלמיד | הגשות | אחרונה | גלויות | נסתרות | מצב |",
             "|---|---|---|---|---|---|"]

    results.sort(key=lambda x: x["name"])
    for x in results:
        last = x["last"]
        vp, vt = tally(last["suites"].get("tests_visible.py", []))
        hp, ht = tally(last["suites"].get("tests_hidden.py", []))
        state = status_of(bool(last["err"]), hp, ht)
        flag = " ⬆" if x["improved_earlier"] else ""
        lines.append(f"| {x['name']} | {x['count']} | {x['last_ts']} | "
                     f"{vp}/{vt} | {hp}/{ht} | **{state}**{flag} |")

    for sid, name in missing:
        lines.append(f"| {name} | 0 | — | — | — | **לא הגיש** |")

    if any(x["improved_earlier"] for x in results):
        lines += ["", "‏⬆ בהגשה מוקדמת יותר עברו יותר בדיקות מאשר באחרונה. "
                      "הטבלה מציגה את האחרונה, כי היא מה שהתלמיד השאיר."]

    lines += ["", "---", "", "## מה נפל אצל מי", ""]
    for x in results:
        last = x["last"]
        fails = [(title, why) for _, title, ok, why
                 in last["suites"].get("tests_hidden.py", []) if not ok]
        if not (fails or last["err"]):
            continue
        lines.append(f"### {x['name']}")
        # ⚠️ **קוד שקרס מכשיל את כל הבדיקות, וזו רשימה חסרת ערך.**
        #    הסיבה היחידה היא הקריסה עצמה, ורק אותה מציגים.
        if last["err"]:
            lines.append(f"- **הקוד קרס לפני הבדיקות:** `{last['err']}`")
            lines.append("- שאר הבדיקות נכשלו כתוצאה מכך, ואין בהן מידע נוסף.")
        else:
            for title, why in fails:
                lines.append(f"- **{title}** — {why.splitlines()[0] if why else ''}")
        lines.append("")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
