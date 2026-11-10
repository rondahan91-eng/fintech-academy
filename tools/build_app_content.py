#!/usr/bin/env python3
"""
מייצר app/content.js מתוך קבצי השבוע הקנוניים.

    py tools/build_app_content.py 1

**התוכן נשאר ב-content/week-NN/.** האפליקציה לא קוראת אותו ישירות כי הוא
yml ו-py; הסקריפט הזה מתרגם אותו ל-JS. כל שינוי בתוכן מחייב הרצה מחדש.

⛔ אין לערוך את app/content.js ידנית.

⛔ **הקובץ הזה נשלח לדפדפן של התלמיד. כל מה שנכנס ל-payload גלוי לו.**
   ‏reference.py ו-tests_hidden.py **לא נכנסים**, ויש בדיקה בסוף שאוכפת
   את זה. הקובץ נשלח בשלמותו ואין בו "חלק פרטי".
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


# ⚠️ **כמה שורות טבלה בגוש אחד.** טבלה אינה ניתנת לחיתוך בזמן ריצה,
#    ולכן היא נחתכת כאן מראש לגושים שבוודאות נכנסים גם במסך נמוך.
TABLE_ROWS_PER_BLOCK = 4


def _blocks(md: str) -> list:
    """מפריד markdown לגושים אטומיים, ושומר גוש קוד שלם."""
    nl = chr(10)
    out, cur, fence = [], [], False
    for line in md.split(nl):
        if line.lstrip().startswith("```"):
            fence = not fence
            cur.append(line)
            if not fence:
                out.append(nl.join(cur))
                cur = []
            continue
        if fence:
            cur.append(line)
            continue
        if line.strip() == "":
            if cur:
                out.append(nl.join(cur))
                cur = []
            continue
        if line.strip() == "---":
            continue
        cur.append(line)
    if cur:
        out.append(nl.join(cur))
    return [b for b in out if b.strip()]


def _split_tables(blocks: list) -> list:
    """טבלה ארוכה נחתכת לשורות, וכותרת הטבלה חוזרת בכל חלק.

    ⚠️ **זה החיתוך היחיד שמותר בתוך גוש.** שורות טבלה הן יחידות
       עצמאיות, ועם כותרת חוזרת כל חלק נקרא לבדו — בניגוד לפסקה,
       שחיתוך באמצעה הורס אותה.
    """
    nl = chr(10)
    out = []
    for b in blocks:
        lines = [ln for ln in b.split(nl) if ln.strip()]
        if not lines[0].lstrip().startswith("|") or len(lines) - 2 <= TABLE_ROWS_PER_BLOCK:
            out.append(b)
            continue
        head, sep, body = lines[0], lines[1], lines[2:]
        for i in range(0, len(body), TABLE_ROWS_PER_BLOCK):
            out.append(nl.join([head, sep] + body[i:i + TABLE_ROWS_PER_BLOCK]))
    return out


def _glue_flags(blocks: list) -> list:
    """מסמן גוש שרצוי להשאיר צמוד לקודמו, בלי למזג אותם.

    ⚠️ **רמז ולא מיזוג.** פסקה שאחריה טבלה היא המשפט שמסביר אותה
       ("התוויות המדויקות:"), ולכן עדיף לא לחתוך ביניהן — אבל אם
       **השתיים יחד** אינן נכנסות בעמודה, מיזוג היה יוצר גוש ענק
       שאי אפשר לחתוך בכלל. הדפדפן מקבל את הרמז ומכריע לפי הגובה
       שיש לו באמת.
    """
    out = []
    for i, b in enumerate(blocks):
        prev = blocks[i - 1].lstrip() if i else ""
        cur = b.lstrip()
        follows_text = bool(prev) and not prev.startswith(("|", "```", "- ", "* ", ">", "#"))
        is_block = cur.startswith(("|", "```", "- ", "* ")) or bool(re.match(r"^\d+\.", cur))
        out.append({"md": b, "glue": bool(i) and follows_text and is_block})
    return out


def split_task(md: str) -> list:
    """‏task.md → גושים לעמודת המשימה, עם שם המקטע של כל גוש.

    **כאן לא נקבע כמה מנות יהיו.** הגודל של עמודת המשימה נקבע במסך
    של התלמיד — גובה חלון, גודל גופן, זום — ולכן האריזה למנות נעשית
    בדפדפן, שם אפשר למדוד. מה שנקבע כאן הוא רק **איפה מותר לחתוך**.

    ⚠️ **דף בלי אף ``##`` עדיין מוחזר כגושים**, ולכן גם שבוע שנכתב
       אחרת אינו חוזר לגלילה.
    """
    body = re.sub(r"^#\s*שבוע\s*\d+\s*·.*$", "", md, count=1, flags=re.M)

    def chunks(text, mark):
        nl = chr(10)
        out, cur_title, cur = [], None, []
        for line in text.split(nl):
            m = re.match(r"^" + mark + r"\s+(.+)$", line)
            if m:
                if cur_title is not None or "".join(cur).strip():
                    out.append((cur_title, nl.join(cur)))
                cur_title, cur = m.group(1).strip(), []
            else:
                cur.append(line)
        if cur_title is not None or "".join(cur).strip():
            out.append((cur_title, nl.join(cur)))
        return out

    sections = []
    for title, section in chunks(body, "##(?!#)"):
        if title is None:
            if re.sub(r"[-\s]", "", section):
                sections.append(("לפני שמתחילים", section))
            continue
        subs = chunks(section, "###")
        if len(subs) > 1:
            for sub_title, sub in subs:
                if sub.strip():
                    sections.append((sub_title or title, sub))
        else:
            sections.append((title, section))

    out = []
    for sec, text in sections:
        for item in _glue_flags(_split_tables(_blocks(text))):
            blk = {"sec": sec, "html": md_to_html(item["md"])}
            if item["glue"]:
                blk["glue"] = True
            out.append(blk)
    return out


def md_to_html(md: str) -> str:
    """
    ‏task.md → HTML ללוח המשימה.

    ⛔ **הגרסה הקודמת לא הייתה ממיר אלא שולף.** היא חיפשה טבלאות שבאות
       מיד אחרי שורה מודגשת שמתחילה במילה "חלק" — הצורה המדויקת של
       שבוע 1 — וכל מה שלא נראה כך נזרק. התוצאה: שבועות 2, 3 ו-4 הגיעו
       לתלמיד עם **לוח משימה ריק לגמרי**, בלי טבלת הממשק ובלי ההוראות.

    הכותרת הראשית (# שבוע N · שם) יורדת — היא מוצגת בנפרד מעל הלוח.
    """
    esc_html = (lambda s: s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

    def inline(s: str) -> str:
        s = esc_html(s)
        s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
        s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
        return s

    out, rows, lst, code = [], [], None, None

    def flush_table():
        if not rows:
            return
        head, body = rows[0], rows[2:] if len(rows) > 2 else []
        out.append("<table><tr>" +
                   "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr>")
        for r in body:
            out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
        out.append("</table>")
        rows.clear()

    def flush_list():
        nonlocal lst
        if lst:
            out.append(f"</{lst}>")
            lst = None

    for raw in md.splitlines():
        line = raw.rstrip()

        # גוש קוד מוקף. ⚠️ **נאסף כמות שהוא** — כל עיבוד אחר ישבור הזחה.
        if line.startswith("```"):
            if code is None:
                flush_table(); flush_list(); code = []
            else:
                out.append("<pre dir=\"ltr\">" + esc_html("\n".join(code)) + "</pre>")
                code = None
            continue
        if code is not None:
            code.append(raw)
            continue

        if line.startswith("|"):
            rows.append([c.strip() for c in line.strip().strip("|").split("|")])
            continue
        flush_table()

        if not line.strip() or set(line.strip()) <= set("-*_ ") and len(line.strip()) >= 3:
            flush_list()
            continue
        if line.startswith("# "):
            continue                                  # הכותרת מוצגת מעל הלוח
        if line.startswith("## "):
            flush_list(); out.append(f"<h2>{inline(line[3:])}</h2>"); continue
        if line.startswith("### "):
            flush_list(); out.append(f"<h3>{inline(line[4:])}</h3>"); continue
        if line.startswith("> "):
            flush_list(); out.append(f"<blockquote>{inline(line[2:])}</blockquote>"); continue

        m = re.match(r"^(\d+)\.\s+(.*)", line)
        if m:
            if lst != "ol":
                flush_list(); out.append("<ol>"); lst = "ol"
            out.append(f"<li>{inline(m.group(2))}</li>")
            continue
        if line.startswith("- "):
            if lst != "ul":
                flush_list(); out.append("<ul>"); lst = "ul"
            out.append(f"<li>{inline(line[2:])}</li>")
            continue

        flush_list()
        out.append(f"<p>{inline(line)}</p>")

    flush_table()
    flush_list()
    if code is not None:                     # גדר שנפתחה ולא נסגרה
        out.append("<pre dir=\"ltr\">" + esc_html("\n".join(code)) + "</pre>")
    return "\n".join(out)


def parse_meta(yml: str) -> dict:
    """קורא את השדות שהממשק צריך. מכוון — לא מנתח YAML מלא."""
    out = {}
    for key in ("week", "title", "xp"):
        m = re.search(rf"^{key}:\s*\"?([^\"\n]+)\"?", yml, re.M)
        if m:
            out[key] = m.group(1).strip()
    out["week"] = int(out.get("week", 0))
    return out


def parse_injects(yml: str) -> list:
    """‏meta.yml → injects: רשימת קובצי תשתית, יחסית לשורש המאגר.

    ⚠️ **בלי זה שבוע 2 נופל אצל כל תלמיד.** ‏tools/run_week.py כבר מזריק
       אותם כשאתה בודק הגשות; האפליקציה לא ידעה עליהם בכלל, והשורה
       הראשונה בקובץ ההתחלה הייתה נותנת NameError: Account.
    """
    m = re.search(r"^injects:\s*\n((?:\s*-\s*.+\n)+)", yml, re.M)
    if not m:
        return []
    return [ln.strip().lstrip("-").strip().strip("\"'")
            for ln in m.group(1).strip().split("\n") if ln.strip()]


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


def build_week(week: int):
    """בונה את המטען של שבוע אחד. מחזיר None אם השבוע אינו שלם."""
    d = ROOT / "content" / f"week-{week:02d}"
    if not d.is_dir():
        print(f"אין תיקייה: {d}")
        return None

    # שבוע שנכתב חלקית לא ייארז. **עדיף שלא יופיע מאשר שייפתח שבור.**
    required = ["meta.yml", "task.md", "starter.py", "tests_visible.py"]
    missing_files = [f for f in required if not (d / f).is_file()]
    if missing_files:
        print(f"  שבוע {week}: חסרים {', '.join(missing_files)} — מדלג")
        return None

    meta_src = read(d / "meta.yml")
    meta = parse_meta(meta_src)
    task_md = read(d / "task.md")
    task = parse_task_md(task_md)

    # ⚠️ **קוד התשתית נשלח לדפדפן, כלומר הוא גלוי לתלמיד שיחפש.**
    #    אין דרך להריץ אותו בדפדפן בלי לשלוח אותו. הממשק הוא מה שמתועד
    #    ב-task.md; המימוש פשוט אינו מוסתר, והוא גם לא הפתרון למשימה.
    injects = parse_injects(meta_src)
    inject_src = ""
    for rel in injects:
        p = ROOT / rel
        if not p.is_file():
            print(f"⛔ שבוע {week}: קוד תשתית חסר — {rel}")
            return None
        inject_src += f"# ===== {rel} =====\n{read(p)}\n"

    # ההרחבה — משימה רשותית לתלמיד שסיים. קיימת רק בשבועות שנכתבה להם.
    extension = None
    ext_md, ext_tests = d / "extension.md", d / "tests_extension.py"
    if ext_md.is_file():
        # ⚠️ **גושים, ולא רק HTML אחד.** עד 2026-11-08 ההרחבה נדחפה
        #    כמחרוזת אחת לתוך גוף המשימה — ומאז שהגוף מציג מנה אחת
        #    בכל רגע, הדחיפה הזאת נמחקה בכל מעבר מנה. ‏extensionBlocks
        #    נכנסים לאותה אריזה של המשימה ומקבלים מנות משלהם.
        extension = {
            "html": md_to_html(read(ext_md)),
            "blocks": split_task(read(ext_md)),
            "tests": read(ext_tests) if ext_tests.is_file() else "",
        }

    # מצגת השיעור, אם יוצאה לכאן. ⚠️ **רק הנתיב נשלח, לא התוכן** —
    #    כל קובץ כזה הוא כרבע מגהבייט, והוא נטען רק אם התלמיד פותח.
    slides_rel = f"slides/week-{int(meta['week']):02d}.html"
    has_slides = (ROOT / "app" / slides_rel).is_file()

    payload = {
        "week": meta["week"],
        "slides": slides_rel if has_slides else "",
        "title": meta.get("title", task["title"]),
        "xp": meta.get("xp"),
        # ‏requirements נשאר לתאימות; מה שמוצג בפועל הוא taskHtml.
        "requirements": task["requirements"],
        "taskHtml": md_to_html(task_md),
        # המנות — מה שעמודת המשימה מציגה בפועל מאז 2026-11-02.
        # גושים; הדפדפן אורז אותם למנות לפי הגובה שיש לו.
        "taskBlocks": split_task(task_md),
        "starter": read(d / "starter.py"),
        "testsVisible": read(d / "tests_visible.py"),
        "inject": inject_src,
        # ⚠️ **נשלח לכל התלמידים, ומוצג רק למי שקיבל אותה.** ההרחבה היא
        #    משימה ולא פתרון, ולכן אין נזק בכך שהיא יושבת בקובץ.
        "extension": extension,
        "manager": parse_manager_opening(read(d / "manager.yml")),
        "avatars": parse_avatar_states(read(ROOT / "assets/persona/manifest.yml")),
    }

    # ═══ שער הדליפה ═══════════════════════════════════════════════════
    # ‏content.js הוא קובץ ציבורי. הפתרון והטסטים הנסתרים אסור שיגיעו
    # אליו — לא בשדה, לא בטעות. הבדיקה על **הטקסט הסופי**, לא על
    # רשימת השדות, כי שדה חדש הוא בדיוק איך שזה קורה שוב.
    def code_lines(src: str) -> set:
        """שורות קוד ממשיות. הערות יורדות — הן זהות בכוונה בין הקבצים."""
        return {ln.strip() for ln in src.splitlines()
                if len(ln.strip()) > 25 and not ln.lstrip().startswith("#")}

    # שורה שמופיעה גם בקובץ שנשלח בכוונה אינה דליפה. `real_lines = [...]`
    # הוא אותו ניב בטסטים הגלויים ובנסתרים, ושם הוא לגיטימי.
    # קוד התשתית נשלח בכוונה, ולכן שורה שמופיעה בו אינה דליפה — גם אם
    # הפתרון משתמש באותה שורה בדיוק.
    # ⚠️ **גם task.md.** מאז שדף המשימה נשלח במלואו, שורת קוד שמופיעה
    #    בו היא פומבית בהגדרה — התלמיד קורא אותה על המסך. בלי זה השער
    #    סימן דוגמה שהמשימה נותנת בכוונה כאילו הפתרון דלף, והפיל שבוע
    #    שלם מהחבילה.
    public = (code_lines(read(d / "starter.py"))
              | code_lines(read(d / "tests_visible.py"))
              | code_lines(task_md)
              | code_lines(inject_src))
    if extension:
        public |= code_lines(extension["tests"]) | code_lines(read(ext_md))

    # ⚠️ **לחפש בערכים, לא ב-JSON.** בטקסט המקודד כל גרשיים הם \" ,
    #    ולכן `print("נטו: 4890")` לעולם אינו תת-מחרוזת שלו. גרסה
    #    קודמת של השער חיפשה ב-json.dumps ותפסה **רק שורות הערה** —
    #    היחידות בלי גרשיים. היא הייתה עוברת על הדליפה האמיתית.
    def walk(node):
        if isinstance(node, str):
            yield node
        elif isinstance(node, dict):
            for v in node.values():
                yield from walk(v)
        elif isinstance(node, list):
            for v in node:
                yield from walk(v)

    blob = "\n".join(walk(payload))
    for name in ("reference.py", "reference_extension.py", "tests_hidden.py"):
        p = d / name
        if not p.is_file():
            continue
        leaked = sorted(ln for ln in code_lines(read(p)) - public if ln in blob)
        if leaked:
            print(f"⛔ שבוע {week}: {name} דולף ל-content.js — "
                  f"{len(leaked)} שורות קוד")
            print(f"   לדוגמה: {leaked[0][:70]}")
            return None

    n_tests = len(re.findall(r"^def test_", payload["testsVisible"], re.M))
    print(f"  שבוע {payload['week']} · {payload['title']} · "
          f"{n_tests} בדיקות גלויות" +
          (" · עם קוד תשתית" if inject_src else ""))
    return payload


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    # ⚠️ **נארזים כל השבועות שנכתבו, ולא אחד.** השבוע הפעיל נקבע בשרת
    #    (‏ACTIVE_WEEK) וההחלפה היא לחיצה בגיליון — בלי בנייה ובלי דחיפה.
    #    מספרי שבועות בשורת הפקודה מצמצמים את הרשימה, לבדיקות.
    wanted = [int(a) for a in sys.argv[1:] if a.isdigit()]
    found = sorted(int(p.name.split("-")[1]) for p in
                   (ROOT / "content").glob("week-*") if p.is_dir())
    weeks = [w for w in found if not wanted or w in wanted]
    if not weeks:
        print("לא נמצאו שבועות לאריזה")
        return 1

    print("אורז:")
    payloads = {}
    for w in weeks:
        p = build_week(w)
        if p:
            payloads[w] = p
    if not payloads:
        return 1

    out = ROOT / "app" / "content.js"
    out.parent.mkdir(exist_ok=True)
    body = json.dumps(payloads, ensure_ascii=False, indent=2)
    default_week = min(payloads)
    out.write_text(
        "// נוצר על ידי tools/build_app_content.py — אין לערוך ידנית.\n"
        "//\n"
        "// ⚠️ כל השבועות הארוזים יושבים כאן. **איזה מהם פעיל נקבע בשרת**,\n"
        "//    ולא בקובץ הזה: ‏state מחזיר activeWeek, ו-app.js בוחר לפיו.\n"
        "//    ‏DEFAULT_WEEK הוא רשת ביטחון בלבד, למקרה שהשרת לא זמין.\n"
        f"export const WEEKS = {body};\n\n"
        f"export const DEFAULT_WEEK = {default_week};\n",
        encoding="utf-8",
    )

    print(f"נוצר: {out.relative_to(ROOT)}")
    print(f"  {len(payloads)} שבועות: {', '.join(str(w) for w in payloads)}")
    print(f"  ברירת מחדל אם השרת שותק: שבוע {default_week}")

    # האפליקציה טוענת את החיתוכים, לא את המקורות
    avatars = payloads[default_week]["avatars"]
    missing = [a["file"] for a in avatars
               if not (ROOT / "assets/persona/panel" / a["file"]).is_file()]
    if missing:
        print(f"  ⚠️ {len(missing)} מתוך {len(avatars)} חיתוכי אווטאר "
              f"חסרים — הרץ py tools/crop_persona.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
