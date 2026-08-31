#!/usr/bin/env python3
"""
שרת הכיתה — סטטי, לרשת המקומית.

    py tools/serve.py

מדפיס את הכתובת שהתלמידים מקלידים, ומגיש את האפליקציה לכל המעבדה.

**למה לא `py -m http.server`.** שתי סיבות שהורגות שיעור:

1. **סוגי MIME.** ‏http.server קורא אותם מהרישום של Windows. בתמונת
   מערכת שבה `.js` רשום כ-text/plain, ‏Chrome **מסרב לטעון את המודול**
   והדף מת בשקט, בלי שגיאה. כאן המפה קבועה בקוד.

2. **כיווץ.** ‏Pyodide הוא 13.8MB לתלמיד. שלושים תלמידים שפותחים ביחד
   הם 414MB בדקה אחת. ‏gzip על ה-wasm ועל ה-zip חוסך את רוב זה.
"""
import gzip
import io
import socket
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# ⚠️ קבוע בקוד ולא מהרישום. ראה למעלה.
TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js":   "text/javascript; charset=utf-8",
    ".mjs":  "text/javascript; charset=utf-8",
    ".css":  "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".wasm": "application/wasm",
    ".zip":  "application/zip",
    ".png":  "image/png",
    ".svg":  "image/svg+xml",
    ".md":   "text/markdown; charset=utf-8",
    ".py":   "text/plain; charset=utf-8",
}

GZIP_ABOVE = 1024
GZIP_TYPES = (".js", ".mjs", ".css", ".html", ".json", ".wasm", ".zip", ".svg")


class Handler(SimpleHTTPRequestHandler):
    def guess_type(self, path):
        return TYPES.get(Path(path).suffix.lower(), "application/octet-stream")

    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir() or not path.is_file():
            return super().send_head()

        accepts_gzip = "gzip" in self.headers.get("Accept-Encoding", "")
        ctype = self.guess_type(str(path))
        raw = path.read_bytes()

        if accepts_gzip and path.suffix.lower() in GZIP_TYPES and len(raw) > GZIP_ABOVE:
            body = gzip.compress(raw, 6)
            encoding = "gzip"
        else:
            body, encoding = raw, None

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        if encoding:
            self.send_header("Content-Encoding", encoding)
        # ‏Pyodide הוא 13.8MB ולא משתנה. שיישב במטמון של הדפדפן.
        if path.suffix.lower() in (".wasm", ".zip"):
            self.send_header("Cache-Control", "public, max-age=604800")
        self.end_headers()
        return io.BytesIO(body)

    def log_message(self, fmt, *args):
        if "404" in (args[1] if len(args) > 1 else ""):
            super().log_message(fmt, *args)


def lan_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))       # לא נשלחת תעבורה
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def main() -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    if not (ROOT / "app" / "config.js").is_file():
        print("⚠️  אין app/config.js — אין כתובת שרת, ואין כניסה.")
        print("    cp app/config.example.js app/config.js  ואז מלא את ENDPOINT\n")

    url = f"http://{lan_ip()}:{PORT}/app/login.html"
    print("═" * 58)
    print("  התלמידים מקלידים:")
    print(f"  {url}")
    print("═" * 58)
    print("  ⚠️ אם Windows שואל על חומת אש — אשר לרשת פרטית.")
    print("     בלי זה אף מחשב אחר לא יגיע לכאן.\n")

    srv = ThreadingHTTPServer(("0.0.0.0", PORT),
                              partial(Handler, directory=str(ROOT)))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nנעצר.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
