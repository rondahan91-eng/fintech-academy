#!/usr/bin/env python3
"""
מחולל דפי עבודה — Markdown ← HTML מעוצב ב-RTL.

קבצי התוכן נשמרים ב-Markdown כי זה מה שהפלטפורמה קוראת וזה מה שגיט
עוקב אחריו. הקובץ הזה מייצר מהם גרסה קריאה להדפסה, בלי להפוך אותה
למקור אמת שני.

    py tools/make_handout.py 4          # -> content/week-04/handout.html
    py tools/make_handout.py 1 2 3 4    # כמה שבועות
    py tools/make_handout.py all

הפלט נפתח בכל דפדפן. להדפסה או ל-PDF: Ctrl+P.
ללא תלויות — ספרייה סטנדרטית בלבד.
"""

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# הסדר שבו החלקים מופיעים בדף. מה שלא קיים — מדולג.
SECTIONS = [
    ("lesson-plan.md", "מערך שיעור"),
    ("task.md", "המשימה כפי שהתלמיד רואה אותה"),
    ("rubric.md", "רובריקת איכות קוד"),
]


# ---------------------------------------------------------------- inline

def _inline(text: str) -> str:
    """עיצוב בתוך שורה. מריצים אחרי escape."""
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r'<code>\1</code>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    return text


def _row(line: str):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def _is_divider(line: str) -> bool:
    return bool(re.fullmatch(r"\|[\s:|-]+\|", line.strip()))


# ---------------------------------------------------------------- block

def md_to_html(md: str) -> str:
    lines = md.split("\n")
    out, i = [], 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # גוש קוד
        if stripped.startswith("```"):
            i += 1
            body = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                body.append(html.escape(lines[i]))
                i += 1
            i += 1
            out.append('<pre dir="ltr"><code>' + "\n".join(body) + "</code></pre>")
            continue

        # טבלה
        if stripped.startswith("|") and i + 1 < len(lines) and _is_divider(lines[i + 1]):
            head = _row(stripped)
            i += 2
            body = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                body.append(_row(lines[i]))
                i += 1
            cells = "".join(f"<th>{_inline(c)}</th>" for c in head)
            rows = "".join(
                "<tr>" + "".join(f"<td>{_inline(c)}</td>" for c in r) + "</tr>"
                for r in body
            )
            out.append(f"<table><thead><tr>{cells}</tr></thead><tbody>{rows}</tbody></table>")
            continue

        # קו מפריד
        if re.fullmatch(r"-{3,}|\*{3,}", stripped):
            out.append("<hr>")
            i += 1
            continue

        # כותרת
        m = re.match(r"(#{1,4})\s+(.*)", stripped)
        if m:
            level = len(m.group(1))
            out.append(f"<h{level}>{_inline(m.group(2))}</h{level}>")
            i += 1
            continue

        # ציטוט
        if stripped.startswith(">"):
            body = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                body.append(lines[i].strip().lstrip(">").strip())
                i += 1
            inner = md_to_html("\n".join(body))
            out.append(f"<blockquote>{inner}</blockquote>")
            continue

        # רשימה — כולל תיבות סימון
        if re.match(r"[-*]\s+|\d+\.\s+", stripped):
            ordered = bool(re.match(r"\d+\.\s+", stripped))
            items = []
            while i < len(lines) and re.match(r"[-*]\s+|\d+\.\s+", lines[i].strip()):
                item = re.sub(r"^([-*]|\d+\.)\s+", "", lines[i].strip())
                box = ""
                if item.startswith("[ ]"):
                    box, item = '<span class="box"></span>', item[3:].strip()
                elif item.lower().startswith("[x]"):
                    box, item = '<span class="box checked">✓</span>', item[3:].strip()
                items.append(f"<li>{box}{_inline(item)}</li>")
                i += 1
            tag = "ol" if ordered else "ul"
            klass = ' class="checklist"' if "box" in "".join(items) else ""
            out.append(f"<{tag}{klass}>" + "".join(items) + f"</{tag}>")
            continue

        # פסקה
        if stripped:
            body = []
            while i < len(lines) and lines[i].strip() and not re.match(
                r"[-*]\s+|\d+\.\s+|#{1,4}\s|>|\||```|-{3,}$", lines[i].strip()
            ):
                body.append(lines[i].strip())
                i += 1
            out.append("<p>" + _inline(" ".join(body)) + "</p>")
            continue

        i += 1

    return "\n".join(out)


# ---------------------------------------------------------------- page

CSS = """
:root { --ink:#1a1a1a; --muted:#5a5a5a; --line:#d8d8d8; --accent:#1e5aa8;
        --soft:#f4f6f9; --warn:#fff8e6; --warn-line:#e0a800; }
* { box-sizing:border-box; }
body { direction:rtl; font-family:"Segoe UI","Arial",sans-serif;
       color:var(--ink); line-height:1.65; max-width:19cm;
       margin:0 auto; padding:1.5cm 1.2cm; font-size:11.5pt; }
h1 { font-size:22pt; border-bottom:3px solid var(--accent); padding-bottom:.3em;
     margin:0 0 .6em; }
h2 { font-size:15pt; color:var(--accent); margin:1.6em 0 .5em;
     border-bottom:1px solid var(--line); padding-bottom:.2em; }
h3 { font-size:12.5pt; margin:1.2em 0 .4em; }
h4 { font-size:11.5pt; color:var(--muted); margin:1em 0 .3em; }
p { margin:.5em 0; }
ul,ol { margin:.5em 0; padding-inline-start:1.5em; }
li { margin:.25em 0; }
code { direction:ltr; unicode-bidi:embed; font-family:Consolas,monospace;
       background:var(--soft); padding:.1em .35em; border-radius:3px;
       font-size:.9em; }
pre { direction:ltr; text-align:left; background:var(--soft);
      border:1px solid var(--line); border-inline-start:3px solid var(--accent);
      padding:.7em .9em; border-radius:4px; overflow-x:auto; }
pre code { background:none; padding:0; }
table { border-collapse:collapse; width:100%; margin:.8em 0; font-size:10.5pt; }
th,td { border:1px solid var(--line); padding:.45em .6em; text-align:right;
        vertical-align:top; }
th { background:var(--soft); font-weight:600; }
tr:nth-child(even) td { background:#fafbfc; }
blockquote { background:var(--warn); border-inline-start:4px solid var(--warn-line);
             margin:.9em 0; padding:.6em .9em; border-radius:0 4px 4px 0; }
blockquote p { margin:.3em 0; }
hr { border:none; border-top:1px solid var(--line); margin:1.6em 0; }
a { color:var(--accent); }
.box { display:inline-block; width:.95em; height:.95em; border:1.5px solid var(--muted);
       border-radius:2px; margin-inline-end:.5em; vertical-align:-2px;
       text-align:center; line-height:.9em; font-size:.8em; }
.checklist { list-style:none; padding-inline-start:.2em; }
.doc-head { color:var(--muted); font-size:10pt; margin-bottom:1.5em;
            padding-bottom:.6em; border-bottom:1px solid var(--line); }
.section-label { background:var(--accent); color:#fff; display:inline-block;
                 padding:.25em .9em; border-radius:3px; font-size:10pt;
                 margin:2.5em 0 .8em; }
@media print {
  body { padding:0; max-width:none; font-size:10.5pt; }
  @page { margin:1.6cm 1.4cm; }
  h1,h2,h3 { break-after:avoid; }
  table,blockquote,pre { break-inside:avoid; }
  .page-break { break-before:page; }
  a { color:var(--ink); text-decoration:none; }
}
"""


def build_week(week: int) -> Path | None:
    week_dir = ROOT / "content" / f"week-{week:02d}"
    if not week_dir.is_dir():
        print(f"שבוע {week}: תיקייה לא נמצאה")
        return None

    title = f"שבוע {week}"
    meta = week_dir / "meta.yml"
    if meta.is_file():
        m = re.search(r'^title:\s*"?([^"\n]+)"?', meta.read_text(encoding="utf-8"), re.M)
        if m:
            title = f"שבוע {week} · {m.group(1).strip()}"

    parts, first = [], True
    for filename, label in SECTIONS:
        path = week_dir / filename
        if not path.is_file():
            continue
        cls = "" if first else ' class="page-break"'
        parts.append(f'<div{cls}><span class="section-label">{label}</span>')
        parts.append(md_to_html(path.read_text(encoding="utf-8")))
        parts.append("</div>")
        first = False

    if not parts:
        print(f"שבוע {week}: אין קבצי Markdown להמרה")
        return None

    page = (
        '<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">'
        f"<title>{html.escape(title)}</title><style>{CSS}</style></head><body>"
        f'<div class="doc-head">FinTech Academy · חומרי מורה</div>'
        + "\n".join(parts)
        + "</body></html>"
    )

    out = week_dir / "handout.html"
    out.write_text(page, encoding="utf-8")
    return out


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2

    if args == ["all"]:
        weeks = sorted(
            int(p.name.split("-")[1])
            for p in (ROOT / "content").glob("week-*")
            if p.is_dir()
        )
    else:
        weeks = [int(a) for a in args]

    made = [p for w in weeks if (p := build_week(w))]
    for p in made:
        print(f"נוצר: {p.relative_to(ROOT)}")
    if made:
        print(f"\n{len(made)} קבצים. לפתיחה — לחיצה כפולה. ל-PDF — Ctrl+P בדפדפן.")
    return 0 if made else 1


if __name__ == "__main__":
    raise SystemExit(main())
