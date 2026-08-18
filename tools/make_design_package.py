#!/usr/bin/env python3
"""
בונה קובץ אחד לכלי העיצוב: תדריך + שלושת המסכים.

    py tools/make_design_package.py

מאחד את design/design-brief.md ואת design/wireframe.html לקובץ HTML
עצמאי אחד, כדי שיהיה צירוף אחד ולא שניים בשני פורמטים.
תוצר — לא מקור. שני קבצי המקור נשארים בעריכה נפרדת.
"""
import io
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DESIGN = ROOT / "design"

BRIEF_CSS = """
.brief { max-width: 900px; margin: 0 auto 50px; background:#fff; border:1px solid #bbb;
         padding: 34px 40px; line-height:1.65; font-size:14px; color:#222; }
.brief h1 { font-size:26px; margin:0 0 .2em; border-bottom:3px solid #2b2b30; padding-bottom:.25em; }
.brief h2 { font-size:18px; margin:1.8em 0 .5em; color:#2b2b30;
            border-bottom:1px solid #ddd; padding-bottom:.2em; }
.brief h3 { font-size:15px; margin:1.3em 0 .4em; }
.brief table { margin:1em 0; font-size:13px; }
.brief th, .brief td { padding:.5em .7em; }
.brief blockquote { background:#fff8e6; border-inline-start:4px solid #e0a800;
                    margin:1em 0; padding:.7em 1em; }
.brief code { background:#f0f0f3; padding:.1em .35em; border-radius:3px;
              font-family:Consolas,monospace; font-size:.9em; direction:ltr;
              unicode-bidi:embed; }
.brief pre { background:#f4f6f9; border:1px solid #ddd; padding:.8em 1em;
             direction:ltr; text-align:left; overflow-x:auto; }
.brief hr { border:none; border-top:1px solid #ddd; margin:2em 0; }
.brief ul, .brief ol { padding-inline-start:1.6em; }
.nav { position:sticky; top:0; z-index:50; background:#2b2b30; color:#fff;
       padding:11px 18px; display:flex; gap:8px; align-items:center; }
.nav b { margin-left:18px; }
.nav a { background:#444; color:#fff; text-decoration:none; padding:7px 14px;
         border-radius:3px; font-size:13px; }
.nav a:hover { background:#fff; color:#222; }
.nav span { margin-right:auto; opacity:.55; font-size:12px; }
.part { padding: 26px 20px 10px; }
.part-title { max-width:1280px; margin:0 auto 14px; font-size:13px; color:#55555c;
              font-weight:600; letter-spacing:.08em; text-transform:uppercase; }
"""


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    sys.path.insert(0, str(ROOT / "tools"))
    from make_handout import md_to_html

    brief = (DESIGN / "design-brief.md").read_text(encoding="utf-8")
    wire = (DESIGN / "wireframe.html").read_text(encoding="utf-8")

    wire_css = re.search(r"<style>(.*?)</style>", wire, re.S).group(1)
    wire_body = re.search(r"<body>(.*?)</body>", wire, re.S).group(1)
    wire_body = re.sub(r'<div class="switcher">.*?</div>', "", wire_body, flags=re.S)

    page = (
        '<!doctype html>\n<html lang="he" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
        "<title>FinTech Academy — חבילת עיצוב</title>\n"
        f"<style>{wire_css}{BRIEF_CSS}</style>\n</head>\n<body>\n\n"
        '<div class="nav">\n'
        "  <b>FinTech Academy · חבילת עיצוב</b>\n"
        '  <a href="#brief">תדריך</a>\n'
        '  <a href="#login">מסך כניסה</a>\n'
        '  <a href="#student">מסך תלמיד</a>\n'
        '  <a href="#teacher">מסך מורה</a>\n'
        '  <span>הקשר + פריסה גסה · ללא החלטות עיצוב</span>\n'
        "</div>\n\n"
        '<div class="part">\n  <div class="part-title">חלק א\' · תדריך</div>\n'
        f'  <div class="brief" id="brief">\n{md_to_html(brief)}\n  </div>\n</div>\n\n'
        '<div class="part">\n  <div class="part-title">חלק ב\' · פריסת מסכים</div>\n</div>\n'
        f"{wire_body}\n</body>\n</html>\n"
    )

    out = DESIGN / "claude-design-package.html"
    out.write_text(page, encoding="utf-8")
    print(f"נוצר: {out.relative_to(ROOT)}  ({len(page):,} תווים)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
