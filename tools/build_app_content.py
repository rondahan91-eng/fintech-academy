#!/usr/bin/env python3
"""
מייצר app/content.js מתוך קבצי השבוע הקנוניים.

    py tools/build_app_content.py 1

**התוכן נשאר ב-content/week-NN/.** האפליקציה לא קוראת אותו ישירות כי הוא
yml ו-py; הסקריפט הזה מתרגם אותו ל-JS. כל שינוי בתוכן מחייב הרצה מחדש.

⛔ אין לערוך את app/content.js ידנית.
"""
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(p: Path) -> str:
    return io.open(p, encoding="utf-8").read()


def parse_task_md(md: str) -> dict:
    """מחלץ מ-task.md את מה שעמודת המשימה מציגה — כותרת ודרישות."""
    title = ""
    m = re.search(r"^#\s*שבוע\s*\d+\s*·\s*(.+)$", md, re.M)
    if m:
        title = m.group(1).strip()

    # שורות הטבלאות תחת "מה לבנות" הן הדרישות שהתלמיד צריך לראות
    reqs = []
    for section, rows in re.findall(r"\*\*(חלק [^*]+)\*\*\s*\n\n((?:\|.*\n)+)", md):
        items = []
        for line in rows.strip().split("\n")[2:]:      # דילוג על הכותרת והמפריד
            cells = [c.strip().strip("*` ") for c in line.strip("|").split("|")]
            if len(cells) >= 2 and cells[0]:
                items.append({"label": cells[0], "value": cells[1]})
        if items:
            reqs.append({"section": section.strip(), "items": items})
    return {"title": title, "requirements": reqs}


def parse_meta(yml: str) -> dict:
    """קורא את השדות שהממשק צריך. מכוון — לא מנתח YAML מלא."""
    out = {}
    for key in ("week", "title", "xp"):
        m = re.search(rf"^{key}:\s*\"?([^\"\n]+)\"?", yml, re.M)
        if m:
            out[key] = m.group(1).strip()
    out["week"] = int(out.get("week", 0))
    return out


def parse_manager_opening(yml: str) -> list:
    """הודעות הפתיחה של אלעד. שבוע 1 — מסירת המשימה בלבד."""
    msgs = []
    m = re.search(r"opening_goal:\s*>\s*\n((?:\s{2,}.*\n)+)", yml)
    if m:
        goal = " ".join(l.strip() for l in m.group(1).split("\n") if l.strip())
        msgs.append({"kind": "goal", "text": goal})
    return msgs


def parse_avatar_states(yml: str) -> list:
    """מצבי האווטאר מ-assets/persona/manifest.yml — id, קובץ, וברירת המחדל.

    ⚠️ תשעת קובצי ה-PNG עצמם מעולם לא נשמרו לריפו. המניפסט מתאר אותם,
    והאפליקציה נופלת לגרפיקת מקום כשהקובץ חסר.
    """
    states = []
    for block in re.split(r"\n  - id: ", "\n" + yml)[1:]:
        sid = block.split("\n", 1)[0].strip()
        m = re.search(r"^\s{4}file:\s*(\S+)", block, re.M)
        if not m:
            continue
        state = {"id": sid, "file": m.group(1).strip()}
        if re.search(r"^\s{4}default:\s*true", block, re.M):
            state["default"] = True
        states.append(state)
    return states


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    week = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    d = ROOT / "content" / f"week-{week:02d}"
    if not d.is_dir():
        print(f"אין תיקייה: {d}")
        return 1

    meta = parse_meta(read(d / "meta.yml"))
    task = parse_task_md(read(d / "task.md"))

    payload = {
        "week": meta["week"],
        "title": meta.get("title", task["title"]),
        "xp": meta.get("xp"),
        "requirements": task["requirements"],
        "starter": read(d / "starter.py"),
        "testsVisible": read(d / "tests_visible.py"),
        "reference": read(d / "reference.py"),
        "manager": parse_manager_opening(read(d / "manager.yml")),
        "avatars": parse_avatar_states(read(ROOT / "assets/persona/manifest.yml")),
    }

    out = ROOT / "app" / "content.js"
    out.parent.mkdir(exist_ok=True)
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    out.write_text(
        "// נוצר על ידי tools/build_app_content.py — אין לערוך ידנית.\n"
        f"export const WEEK = {body};\n",
        encoding="utf-8",
    )

    n_tests = len(re.findall(r"^def test_", payload["testsVisible"], re.M))
    print(f"נוצר: {out.relative_to(ROOT)}")
    print(f"  שבוע {payload['week']} · {payload['title']}")
    print(f"  {n_tests} בדיקות גלויות · starter {len(payload['starter'].splitlines())} שורות")

    missing = [a["file"] for a in payload["avatars"]
               if not (ROOT / "assets/persona" / a["file"]).is_file()]
    if missing:
        print(f"  ⚠️ {len(missing)} מתוך {len(payload['avatars'])} אווטארים חסרים "
              f"ב-assets/persona/ — הפאנל יציג גרפיקת מקום")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
