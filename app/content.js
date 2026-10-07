// נוצר על ידי tools/build_app_content.py — אין לערוך ידנית.
//
// ⚠️ כל השבועות הארוזים יושבים כאן. **איזה מהם פעיל נקבע בשרת**,
//    ולא בקובץ הזה: ‏state מחזיר activeWeek, ו-app.js בוחר לפיו.
//    ‏DEFAULT_WEEK הוא רשת ביטחון בלבד, למקרה שהשרת לא זמין.
export const WEEKS = {
  "1": {
    "week": 1,
    "title": "יום ראשון בבנק",
    "xp": "500",
    "requirements": [
      {
        "section": "חלק א' — כרטיס עובד",
        "items": [
          {
            "label": "שם",
            "value": "שלך"
          },
          {
            "label": "מספר עובד",
            "value": "10427"
          },
          {
            "label": "תפקיד",
            "value": "מפתח זוטר"
          },
          {
            "label": "מחלקה",
            "value": "מערכות ליבה"
          }
        ]
      },
      {
        "section": "חלק ב' — תלוש משכורת",
        "items": [
          {
            "label": "ברוטו",
            "value": "6000"
          },
          {
            "label": "מס הכנסה",
            "value": "900"
          },
          {
            "label": "ביטוח לאומי",
            "value": "210"
          },
          {
            "label": "נטו",
            "value": "?"
          }
        ]
      }
    ],
    "taskHtml": "<p>ברוך הבא לצוות מערכות ליבה. אני אלעד, ראש הצוות.</p>\n<p>היום אתה נכנס למערכת בפעם הראשונה, ואנחנו נתחיל בקטן: <b>תדפיס לעצמך את כרטיס העובד ואת התלוש הראשון שלך.</b></p>\n<p>זה נשמע טריוויאלי, ובמובן מסוים זה כן. אבל שים לב למה שקורה תוך כדי — אתה נותן למחשב הוראה, הוא מבצע אותה בדיוק כפי שכתבת אותה, ואם כתבת משהו אחר ממה שהתכוונת, הוא יבצע את מה שכתבת. זה כל המקצוע, בשורה אחת.</p>\n<h2>מה לבנות</h2>\n<p>תוכנית שמדפיסה שני חלקים.</p>\n<p><b>חלק א' — כרטיס עובד</b></p>\n<table><tr><th>שדה</th><th>ערך</th></tr>\n<tr><td>שם</td><td>שלך</td></tr>\n<tr><td>מספר עובד</td><td><code>10427</code></td></tr>\n<tr><td>תפקיד</td><td><code>מפתח זוטר</code></td></tr>\n<tr><td>מחלקה</td><td><code>מערכות ליבה</code></td></tr>\n</table>\n<p><b>חלק ב' — תלוש משכורת</b></p>\n<table><tr><th>שורה</th><th>סכום</th></tr>\n<tr><td>ברוטו</td><td><code>6000</code></td></tr>\n<tr><td>מס הכנסה</td><td><code>900</code></td></tr>\n<tr><td>ביטוח לאומי</td><td><code>210</code></td></tr>\n<tr><td><b>נטו</b></td><td><b>?</b></td></tr>\n</table>\n<p>את הנטו אתה מחשב <b>בעצמך, בראש או על דף</b>, ומקליד את התוצאה. אל תנסה לגרום למחשב לחשב אותו — עוד לא למדנו איך, וזה בסדר גמור.</p>\n<h2>לפני שאתה כותב שורת קוד</h2>\n<p>תכתוב במחברת, <b>במילים</b>, את סדר הפעולות שאתה עומד לבצע. משהו כמו:</p>\n<pre dir=\"ltr\">1. להדפיס את הכותרת \"כרטיס עובד\"\n2. להדפיס את השם שלי\n3. ...</pre>\n<p>זה נקרא <b>אלגוריתם מילולי</b>, וזה לא תרגיל התחממות — זה מה שמפתחים עושים לפני שהם כותבים. מי שמדלג על השלב הזה מגלה באמצע שהוא לא יודע מה הוא בונה.</p>\n<h2>מה נבדק</h2>\n<ul>\n<li>כרטיס העובד מכיל את מספר העובד, התפקיד והמחלקה</li>\n<li>התלוש מכיל את הברוטו, שני הניכויים, <b>וסכום נטו נכון</b></li>\n<li>כל שורה מודפסת בנפרד</li>\n</ul>\n<p>השם שלך לא נבדק — הוא שלך.</p>\n<h2>מותר להיעזר</h2>\n<ul>\n<li><b>בי.</b> אני בצ'אט. אם משהו לא מסתדר או שלא הבנת מושג — תשאל. זה לא \"לרמות\", זו העבודה.</li>\n<li>בקוד הפתיחה שבעורך.</li>\n<li>בכפתור \"הרץ בדיקות\" — כמה פעמים שתרצה.</li>\n</ul>\n<p><b>ודבר אחרון:</b> אם אתה לא בטוח מה זה ברוטו ומה זה נטו, אל תנחש ואל תחפש בגוגל. תשאל אותי. יש סיבה שהתחלנו דווקא מזה.</p>",
    "starter": "# ============================================\n#  כרטיס עובד ותלוש ראשון\n#  מערכות ליבה · הבנק\n# ============================================\n\n# --- חלק א': כרטיס עובד ---\n\nprint(\"=== כרטיס עובד ===\")\n\n# כתוב כאן את השורות של כרטיס העובד.\n# השורה הראשונה כדוגמה — המשך באותו אופן.\nprint(\"שם: \")\n\n\n# --- חלק ב': תלוש משכורת ---\n\nprint()\nprint(\"=== תלוש משכורת ===\")\n\n# כתוב כאן את שורות התלוש: ברוטו, מס הכנסה, ביטוח לאומי, ונטו.\n# את הנטו חשב בעצמך והקלד את התוצאה.\n",
    "testsVisible": "# בדיקות גלויות — שבוע 1\n# התלמיד מריץ אותן כמה שירצה. מכסות את המקרה הבסיסי בלבד.\n#\n# זמין לטסטים:  OUTPUT (כל הפלט כמחרוזת) · LINES (רשימת שורות)\n#\n# ה-docstring הוא התווית שהתלמיד רואה בשורת הבדיקה — מנוסח בהווה חיובי.\n# הודעת ה-assert נראית רק בכישלון. ראה content/_schema/README.md\n\n\ndef test_something_printed():\n    \"\"\"התוכנית מדפיסה משהו\"\"\"\n    assert OUTPUT.strip(), (\n        \"התוכנית לא הדפיסה כלום. ודא שיש בקוד לפחות פקודת print אחת, \"\n        \"ושלחצת על 'הרץ'.\"\n    )\n\n\ndef test_employee_id():\n    \"\"\"מספר העובד מופיע בכרטיס\"\"\"\n    assert \"10427\" in OUTPUT, (\n        \"לא מצאתי את מספר העובד 10427 בפלט.\"\n    )\n\n\ndef test_gross():\n    \"\"\"סכום הברוטו מופיע בתלוש\"\"\"\n    assert \"6000\" in OUTPUT, (\n        \"לא מצאתי את סכום הברוטו 6000 בפלט.\"\n    )\n\n\ndef test_has_several_lines():\n    \"\"\"כל פרט יושב בשורה משלו\"\"\"\n    real_lines = [ln for ln in LINES if ln.strip()]\n    assert len(real_lines) >= 6, (\n        f\"מצאתי רק {len(real_lines)} שורות עם תוכן. \"\n        \"כרטיס העובד והתלוש יחד אמורים לתפוס יותר. \"\n        \"כל פרט בשורה נפרדת.\"\n    )\n",
    "inject": "",
    "manager": [],
    "avatars": [
      {
        "id": "concerned",
        "file": "elad-concerned.png"
      },
      {
        "id": "neutral",
        "file": "elad-neutral.png",
        "default": true
      },
      {
        "id": "explaining",
        "file": "elad-explaining.png"
      },
      {
        "id": "thinking",
        "file": "elad-thinking.png"
      },
      {
        "id": "presenting",
        "file": "elad-presenting.png"
      },
      {
        "id": "approve",
        "file": "elad-approve.png"
      },
      {
        "id": "impressed",
        "file": "elad-impressed.png"
      },
      {
        "id": "disapprove",
        "file": "elad-disapprove.png"
      },
      {
        "id": "waiting",
        "file": "elad-waiting.png"
      }
    ]
  },
  "2": {
    "week": 2,
    "title": "מודול הליבה",
    "xp": "500",
    "requirements": [],
    "taskHtml": "<p>יום שני. אתמול הדפסת טקסט; היום אתה נוגע במערכת עצמה.</p>\n<p>זה <code>Account</code> — המודול שמנהל כל חשבון בבנק. <b>לא תכתוב אותו.</b> מישהו כתב אותו לפני שנים, הוא עובד, ואתה תשתמש בו. ככה זה בעבודה — רוב הקוד שתיגע בו לא נכתב על ידך, והמיומנות הראשונה היא <b>לקרוא ממשק ולהבין מה הוא נותן לך</b>.</p>\n<h2>הממשק</h2>\n<p>כדי לפתוח חשבון:</p>\n<pre dir=\"ltr\">acc = Account(owner=\"שם הלקוח\", balance=1000)</pre>\n<p><code>acc</code> הוא <b>עצם</b> — חשבון אחד, קונקרטי. יש לו יתרה משלו והיסטוריה משלו.</p>\n<blockquote>⚠️ <b><code>acc</code> הוא שם לדוגמה בלבד, והוא לא קיים בקוד שלך.</b> החשבון שלך</blockquote>\n<blockquote>נקרא בשם שאתה נתת לו. אם פתחת אותו כך — <code>dana = Account(...)</code> — אז</blockquote>\n<blockquote>הפעולות שלו הן <code>dana.deposit(400)</code> ו-<code>dana.balance()</code>.</blockquote>\n<blockquote>בטבלאות שלמטה קרא את <code>acc</code> כ\"החשבון שלך\", ואת <code>other</code> כ\"החשבון השני\".</blockquote>\n<p><b>פעולות ששואלות</b> — מחזירות לך ערך ולא משנות כלום:</p>\n<table><tr><th>פעולה</th><th>מחזירה</th></tr>\n<tr><td><code>acc.owner()</code></td><td>שם בעל החשבון</td></tr>\n<tr><td><code>acc.balance()</code></td><td>היתרה הנוכחית</td></tr>\n<tr><td><code>acc.is_overdrawn()</code></td><td><code>True</code> אם היתרה שלילית, אחרת <code>False</code></td></tr>\n<tr><td><code>acc.statement()</code></td><td>תדפיס חשבון מלא, כטקסט</td></tr>\n</table>\n<p><b>פעולות שמשנות</b> — עושות משהו לחשבון ולא מחזירות כלום:</p>\n<table><tr><th>פעולה</th><th>מה עושה</th></tr>\n<tr><td><code>acc.deposit(500)</code></td><td>מפקידה 500</td></tr>\n<tr><td><code>acc.withdraw(200)</code></td><td>מושכת 200</td></tr>\n<tr><td><code>acc.transfer_to(other, 50)</code></td><td>מעבירה 50 לחשבון אחר</td></tr>\n</table>\n<blockquote>שים לב להבדל. <code>acc.balance()</code> <b>שואלת</b> — אפשר להדפיס את התוצאה.</blockquote>\n<blockquote><code>acc.deposit(500)</code> <b>פועלת</b> — אין מה להדפיס, היא פשוט קורית.</blockquote>\n<h2>מה לבנות</h2>\n<p><b>חלק א' — החשבון של דנה</b></p>\n<p>פתח חשבון על שם <code>דנה כהן</code> ביתרת פתיחה <code>2500</code>. אחר כך:</p>\n<ol>\n<li>הפקד <code>400</code> (המשכורת נכנסה)</li>\n<li>משוך <code>120</code></li>\n<li>הדפס את שם בעל החשבון ואת היתרה</li>\n</ol>\n<p><b>חלק ב' — יואב, והעברה</b></p>\n<p>פתח חשבון שני על שם <code>יואב לוי</code> ביתרת פתיחה <code>100</code>.</p>\n<p>העבר <code>50</code> <b>מדנה ליואב</b>, והדפס את היתרה של שניהם.</p>\n<p><b>חלק ג' — מה קורה כשמושכים יותר מדי</b></p>\n<p>משוך <code>3000</code> מהחשבון של יואב. אחר כך הדפס:</p>\n<ul>\n<li>את היתרה שלו</li>\n<li>את התוצאה של <code>is_overdrawn()</code></li>\n<li>את התדפיס המלא שלו: <code>print(yoav.statement())</code></li>\n</ul>\n<h2>מה נבדק</h2>\n<ul>\n<li>שני החשבונות נפתחו על השמות הנכונים</li>\n<li>היתרות נכונות בכל שלב</li>\n<li>התדפיס המלא של יואב הודפס</li>\n</ul>\n<p><b>אין בדף הזה אף תוצאה.</b> לא כתוב כמה יהיה בחשבון של דנה בסוף — זה מה שהתוכנית שלך אמורה לגלות. אל תחשב בראש ותדפיס מספר; תן למחלקה לעבוד.</p>\n<h2>מותר להיעזר</h2>\n<ul>\n<li><b>באלעד.</b> במיוחד השבוע — אם לא ברור לך מה זה \"עצם\", זו בדיוק השאלה לשאול.</li>\n<li>בטבלאות הממשק למעלה. פתוחות, זו לא בחינה בעל פה.</li>\n<li>בכפתור \"הרץ בדיקות\", כמה פעמים שתרצה.</li>\n</ul>\n<p><b>שאלה לחשוב עליה תוך כדי</b> — ותשאל את אלעד מה התשובה: יש לך שני חשבונות, ושניהם נוצרו מאותה מחלקה <code>Account</code>. איך יכול להיות שלכל אחד יתרה אחרת?</p>",
    "starter": "# ============================================\n#  מודול הליבה — תנועות בחשבון\n#  מערכות ליבה · הבנק\n# ============================================\n#\n# המחלקה Account כבר טעונה. אין צורך לייבא כלום.\n\n\n# --- חלק א': החשבון של דנה ---\n\ndana = Account(owner=\"דנה כהן\", balance=2500)\n\n# הפקד 400, משוך 120, ואז הדפס את השם ואת היתרה.\n\n\n\n# --- חלק ב': יואב, והעברה ---\n\n# פתח כאן את החשבון של יואב, בצע את ההעברה, והדפס את שתי היתרות.\n\n\n\n# --- חלק ג': משיכה גדולה מדי ---\n\n# משוך 3000 מהחשבון של יואב.\n# הדפס את היתרה, את התוצאה של is_overdrawn ואת התדפיס המלא.\n",
    "testsVisible": "# בדיקות גלויות — שבוע 2\n#\n# ⛔ **שורה לכל חלק של המשימה.** הגרסה הקודמת כיסתה את חלק א' בלבד,\n#    ולכן תלמיד שסיים שליש מהמשימה ראה 3/3 ירוק והאמין שסיים. מספר\n#    הבדיקות הוא מד ההתקדמות שהתלמיד רואה — הוא חייב לשקף את כל המשימה.\n#\n# ⚠️ **החלקים ב' ו-ג' נבדקים דרך מצב העצמים, לא דרך מספרים בפלט.**\n#    הבדיקות הנסתרות הן שבודקות שהיתרות שהודפסו נכונות; אם גם כאן היו\n#    מספרים, הם היו מתפרסמים לתלמיד — ‏content.js מגיע לדפדפן שלו.\n#\n# זמין לבדיקות: ‏OUTPUT · LINES · VARS (המשתנים שהתלמיד יצר)\n\n\ndef _accounts():\n    \"\"\"כל החשבונות שהתלמיד יצר. מזוהים לפי הממשק, לא לפי שם המשתנה.\"\"\"\n    return [v for v in VARS.values()\n            if hasattr(v, \"statement\") and not isinstance(v, type)]\n\n\ndef _owned_by(name):\n    for acc in _accounts():\n        if name in str(acc.owner()):\n            return acc\n    return None\n\n\ndef test_something_printed():\n    \"\"\"התוכנית מדפיסה משהו\"\"\"\n    assert OUTPUT.strip(), (\n        \"התוכנית לא הדפיסה כלום. ודא שיש פקודת print, ושלחצת על 'הרץ'.\"\n    )\n\n\n# ── חלק א' ────────────────────────────────────────────────────────────\n\ndef test_dana_exists():\n    \"\"\"חלק א': שם בעלת החשבון מודפס\"\"\"\n    assert \"דנה כהן\" in OUTPUT, (\n        \"לא מצאתי את השם של דנה בפלט. הדפסת את owner() של החשבון שלה?\"\n    )\n\n\ndef test_dana_balance_after_ops():\n    \"\"\"חלק א': היתרה אחרי ההפקדה והמשיכה\"\"\"\n    assert \"2780\" in OUTPUT.replace(\",\", \"\"), (\n        \"לא מצאתי את היתרה של דנה אחרי ההפקדה והמשיכה. \"\n        \"בדוק שביצעת את שתי הפעולות ואז הדפסת את balance().\"\n    )\n\n\n# ── חלק ב' ────────────────────────────────────────────────────────────\n\ndef test_second_account_opened():\n    \"\"\"חלק ב': נפתח חשבון שני\"\"\"\n    assert _owned_by(\"יואב\") is not None, (\n        \"לא מצאתי חשבון שני על שם יואב לוי. \"\n        \"פתח אותו כמו שפתחת את החשבון של דנה.\"\n    )\n\n\ndef test_transfer_done():\n    \"\"\"חלק ב': ההעברה בוצעה\"\"\"\n    yoav = _owned_by(\"יואב\")\n    assert yoav is not None, \"קודם פתח את החשבון של יואב.\"\n    assert \"העברה\" in yoav.statement(), (\n        \"לא מצאתי העברה בהיסטוריה של יואב. \"\n        \"השתמש ב-transfer_to על החשבון שממנו הכסף יוצא.\"\n    )\n\n\ndef test_both_balances_printed():\n    \"\"\"חלק ב': שתי היתרות מודפסות\"\"\"\n    numbers = sum(1 for ln in LINES if any(c.isdigit() for c in ln))\n    assert numbers >= 4, (\n        \"אחרי ההעברה צריך להדפיס את היתרה של שני החשבונות. \"\n        \"מצאתי פחות שורות עם מספרים ממה שהמשימה מבקשת.\"\n    )\n\n\n# ── חלק ג' ────────────────────────────────────────────────────────────\n\ndef test_big_withdraw_done():\n    \"\"\"חלק ג': המשיכה הגדולה בוצעה\"\"\"\n    yoav = _owned_by(\"יואב\")\n    assert yoav is not None, \"קודם פתח את החשבון של יואב.\"\n    assert yoav.is_overdrawn(), (\n        \"החשבון של יואב עדיין לא ביתרת חובה. \"\n        \"בדוק שמשכת ממנו את הסכום שהמשימה מבקשת.\"\n    )\n\n\ndef test_overdrawn_printed():\n    \"\"\"חלק ג': התוצאה של is_overdrawn מודפסת\"\"\"\n    assert \"True\" in OUTPUT or \"False\" in OUTPUT, (\n        \"לא מצאתי בפלט את התוצאה של is_overdrawn. \"\n        \"זו פעולה ששואלת — אפשר להדפיס את מה שהיא מחזירה.\"\n    )\n\n\ndef test_statement_printed():\n    \"\"\"חלק ג': התדפיס המלא מודפס\"\"\"\n    assert \"תדפיס חשבון\" in OUTPUT, (\n        \"לא מצאתי את התדפיס המלא בפלט. הדפס את התוצאה של statement().\"\n    )\n",
    "inject": "# ===== content/_shared/lib/account.py =====\n\"\"\"\nמחלקת Account — מודול הליבה של הבנק.\n\nקוד תשתית. **התלמיד משתמש במחלקה ואינו כותב אותה** — כתיבת מחלקות\nהיא פרק 8 בסילבוס, כיתה יא'.\n\nהפלטפורמה מזריקה את הקובץ לסביבת ההרצה לפני קוד התלמיד. הממשק\nמתועד לתלמיד ב-content/week-02/task.md; המימוש עצמו אינו מוצג לו,\nכי הוא עושה שימוש ב-self, ב-__init__ ובתחביר מחלקה שטרם נלמדו.\n\nסעיפי הסילבוס שהמחלקה משרתת: פרק 1, סעיפים 6, 7 (ללא ההיבט המרחבי),\n8, 9.\n\"\"\"\n\n\nclass Account:\n    \"\"\"חשבון בנק. כל מופע מנהל יתרה והיסטוריית תנועות משלו.\"\"\"\n\n    def __init__(self, owner, balance=0):\n        self._owner = owner\n        self._balance = balance\n        self._history = [f'פתיחת חשבון ביתרה {balance} ש\"ח']\n\n    # --- שאילתות ---\n\n    def owner(self):\n        \"\"\"שם בעל החשבון.\"\"\"\n        return self._owner\n\n    def balance(self):\n        \"\"\"היתרה הנוכחית. עשויה להיות שלילית.\"\"\"\n        return self._balance\n\n    def is_overdrawn(self):\n        \"\"\"האם החשבון ביתרת חובה.\"\"\"\n        return self._balance < 0\n\n    def statement(self):\n        \"\"\"תדפיס חשבון מלא, כמחרוזת מרובת שורות.\"\"\"\n        line = \"-\" * 32\n        rows = \"\\n\".join(self._history)\n        return (\n            f\"תדפיס חשבון — {self._owner}\\n\"\n            f\"{line}\\n\"\n            f\"{rows}\\n\"\n            f\"{line}\\n\"\n            f'יתרה: {self._balance} ש\"ח'\n        )\n\n    # --- פעולות ---\n\n    def deposit(self, amount):\n        \"\"\"הפקדה לחשבון.\"\"\"\n        self._balance += amount\n        self._history.append(f'הפקדה {amount} ש\"ח')\n\n    def withdraw(self, amount):\n        \"\"\"משיכה מהחשבון. מותרת גם אל תוך יתרת חובה.\"\"\"\n        self._balance -= amount\n        self._history.append(f'משיכה {amount} ש\"ח')\n\n    def transfer_to(self, other, amount):\n        \"\"\"העברה לחשבון אחר. מעדכנת את שני החשבונות.\"\"\"\n        self._balance -= amount\n        self._history.append(f'העברה ל{other.owner()} — {amount} ש\"ח')\n\n        other._balance += amount\n        other._history.append(f'העברה מ{self._owner} — {amount} ש\"ח')\n\n",
    "manager": [],
    "avatars": [
      {
        "id": "concerned",
        "file": "elad-concerned.png"
      },
      {
        "id": "neutral",
        "file": "elad-neutral.png",
        "default": true
      },
      {
        "id": "explaining",
        "file": "elad-explaining.png"
      },
      {
        "id": "thinking",
        "file": "elad-thinking.png"
      },
      {
        "id": "presenting",
        "file": "elad-presenting.png"
      },
      {
        "id": "approve",
        "file": "elad-approve.png"
      },
      {
        "id": "impressed",
        "file": "elad-impressed.png"
      },
      {
        "id": "disapprove",
        "file": "elad-disapprove.png"
      },
      {
        "id": "waiting",
        "file": "elad-waiting.png"
      }
    ]
  },
  "3": {
    "week": 3,
    "title": "תיק לקוח",
    "xp": "500",
    "requirements": [],
    "taskHtml": "<p>בשבוע שעבר עבדת עם חשבון שכבר היה קיים. השבוע אתה פותח אחד חדש.</p>\n<p>הגיעה אלינו לקוחה, ואנחנו צריכים לפתוח לה תיק במערכת. תיק לקוח הוא בסך הכול <b>אוסף של נתונים</b> — שם, מספר חשבון, גיל, הכנסה. הפעם אתה לא מדפיס אותם ישר; אתה <b>שומר כל אחד במשתנה</b> ואז מדפיס את המשתנה.</p>\n<p>זה נשמע כמו עבודה מיותרת. תשאל את אלעד למה בנק לא פשוט מדפיס.</p>\n<h2>הנתונים</h2>\n<table><tr><th>מה</th><th>הערך</th><th>שם המשתנה</th></tr>\n<tr><td>שם הלקוחה</td><td>רותם אזולאי</td><td><code>customer_name</code></td></tr>\n<tr><td>מספר חשבון</td><td>0521147</td><td><code>account_number</code></td></tr>\n<tr><td>גיל</td><td>34</td><td><code>age</code></td></tr>\n<tr><td>שכר ברוטו</td><td>12500.5</td><td><code>gross_salary</code></td></tr>\n<tr><td>חשבון פעיל?</td><td>לא</td><td><code>is_active</code></td></tr>\n</table>\n<p><b>שמות המשתנים חייבים להיות בדיוק כפי שרשום.</b> באנגלית — זו המוסכמה בכל מקום שבו כותבים קוד, וגם אצלנו.</p>\n<h2>חלק א' — פתיחת התיק</h2>\n<p>הגדר את חמשת המשתנים, ואז הדפס כרטיס לקוח שמציג את כולם.</p>\n<p>⚠️ <b>שים לב למספר החשבון.</b> יש לו אפס בהתחלה. תחשוב רגע איזה טיפוס שומר אותו נכון — ואם אתה לא בטוח, זו שאלה טובה לאלעד. הוא יסביר למה זה משנה בבנק.</p>\n<h2>חלק ב' — בדיקת טיפוסים</h2>\n<p>לכל אחד מחמשת המשתנים, הדפס גם מאיזה טיפוס הוא. הפעולה <code>type()</code> עושה בדיוק את זה:</p>\n<pre dir=\"ltr\">x = 7\nprint(type(x))</pre>\n<p>תריץ את שתי השורות האלה לבד לפני שאתה ממשיך, ותראה מה יוצא.</p>\n<h2>חלק ג' — עדכון התיק</h2>\n<p>עברו שבועיים. שני דברים השתנו:</p>\n<ol>\n<li>המסמכים של רותם הגיעו — <b>החשבון הופעל.</b></li>\n<li>היא קיבלה העלאה. <b>הברוטו החדש: 13750.5</b></li>\n</ol>\n<p><b>אל תגדיר משתנים חדשים.</b> תשנה את הערך של הקיימים — לזה בדיוק משתנים נועדו.</p>\n<p>ואז הדפס שוב את הכרטיס, כדי לראות שהתיק התעדכן.</p>\n<h2>מה נבדק</h2>\n<ul>\n<li>חמשת המשתנים קיימים, בשמות המדויקים</li>\n<li><b>הטיפוס של כל אחד נכון</b> — במיוחד מספר החשבון</li>\n<li>הכרטיס מודפס פעמיים, לפני העדכון ואחריו</li>\n<li>אחרי חלק ג' המשתנים מחזיקים את הערכים המעודכנים</li>\n</ul>\n<h2>מותר להיעזר</h2>\n<ul>\n<li><b>באלעד.</b> במיוחד לגבי מספר החשבון — יש שם סיפור שלם.</li>\n<li>בהרצה חוזרת. אין הגבלה.</li>\n</ul>\n<p><b>אין חישובים השבוע.</b> אם אתה מוצא את עצמך מנסה לחשב משהו — עצור, זה לא נדרש. חשבון מגיע בשבוע הבא.</p>",
    "starter": "# ============================================\n#  תיק לקוח\n#  מערכות ליבה · הבנק\n# ============================================\n\n# --- חלק א': פתיחת התיק ---\n\n# הגדר כאן את חמשת המשתנים.\n# הראשון כדוגמה — המשך באותו אופן.\ncustomer_name = \"רותם אזולאי\"\n\n\n# הדפס כאן את כרטיס הלקוח.\nprint(\"=== תיק לקוח ===\")\n\n\n# --- חלק ב': בדיקת טיפוסים ---\n\nprint()\nprint(\"=== טיפוסי הנתונים ===\")\n\n# הדפס כאן את הטיפוס של כל אחד מחמשת המשתנים.\n\n\n# --- חלק ג': עדכון התיק ---\n\nprint()\nprint(\"=== התיק לאחר עדכון ===\")\n\n# שנה כאן את הערכים של המשתנים הקיימים, ואז הדפס שוב את הכרטיס.\n",
    "testsVisible": "# בדיקות גלויות — שבוע 3\n#\n# ⛔ **שורה לכל חלק של המשימה.** מד ההתקדמות שהתלמיד רואה הוא מספר\n#    הבדיקות שעברו, ולכן כיסוי חלקי משדר \"סיימת\" למי שסיים שליש.\n#\n# ⚠️ **הערכים כאן מופיעים כבר בדף המשימה** (טבלת הנתונים וחלק ג'),\n#    ולכן אין בהם דליפה. מה שאינו בדף — ניסוח ההודעות של הטיפוסים\n#    ובדיקת המשתנים הכפולים — נשאר לבדיקות הנסתרות.\n#\n# זמין: OUTPUT · LINES · VARS\n\n\nREQUIRED = [\"customer_name\", \"account_number\", \"age\", \"gross_salary\", \"is_active\"]\n\n\ndef test_something_printed():\n    \"\"\"התוכנית מדפיסה משהו\"\"\"\n    assert OUTPUT.strip(), \"התוכנית לא הדפיסה כלום.\"\n\n\n# ── חלק א' ────────────────────────────────────────────────────────────\n\ndef test_variables_exist():\n    \"\"\"חלק א': חמשת המשתנים קיימים\"\"\"\n    missing = [n for n in REQUIRED if n not in VARS]\n    assert not missing, f\"חסרים משתנים: {', '.join(missing)}\"\n\n\ndef test_account_number_is_text():\n    \"\"\"חלק א': מספר החשבון נשמר נכון\"\"\"\n    value = VARS.get(\"account_number\")\n    assert isinstance(value, str), (\n        \"account_number אינו מחרוזת. בדוק מה קרה לאפס המוביל.\"\n    )\n\n\ndef test_card_printed():\n    \"\"\"חלק א': הכרטיס מודפס\"\"\"\n    assert \"רותם אזולאי\" in OUTPUT, (\n        \"לא מצאתי את שם הלקוחה בפלט. חלק א' מבקש להדפיס כרטיס לקוח.\"\n    )\n\n\n# ── חלק ב' ────────────────────────────────────────────────────────────\n\ndef test_types_printed():\n    \"\"\"חלק ב': הטיפוס של כל משתנה מודפס\"\"\"\n    assert OUTPUT.count(\"class\") >= 5, (\n        \"מצאתי פחות מחמש הדפסות של טיפוס. \"\n        \"חלק ב' מבקש את הטיפוס של כל אחד מחמשת המשתנים.\"\n    )\n\n\n# ── חלק ג' ────────────────────────────────────────────────────────────\n\ndef test_account_activated():\n    \"\"\"חלק ג': החשבון הופעל\"\"\"\n    assert VARS.get(\"is_active\") is True, (\n        \"is_active אינו True בסוף התוכנית. \"\n        \"בחלק ג' המסמכים הגיעו והחשבון הופעל.\"\n    )\n\n\ndef test_salary_updated():\n    \"\"\"חלק ג': השכר עודכן\"\"\"\n    assert VARS.get(\"gross_salary\") == 13750.5, (\n        \"gross_salary אינו מחזיק את השכר שאחרי ההעלאה. \"\n        \"חלק ג' מבקש לעדכן את המשתנה הקיים.\"\n    )\n\n\ndef test_card_printed_twice():\n    \"\"\"חלק ג': הכרטיס מודפס שוב אחרי העדכון\"\"\"\n    assert OUTPUT.count(\"רותם אזולאי\") >= 2, (\n        \"שם הלקוחה מופיע בפלט פחות מפעמיים. \"\n        \"הכרטיס אמור להיות מודפס לפני העדכון ואחריו.\"\n    )\n",
    "inject": "",
    "manager": [
      {
        "kind": "goal",
        "text": "למסור את המשימה ולהצית את השאלה על מספר החשבון, בלי לענות עליה. **לא תסריט** — הניסוח מול התלמיד שמולו, ותוך שימוש במה שכבר ידוע עליו מהקליטה (memory_hooks). מה שחייב לעבור: הגיעה לקוחה חדשה, פותחים לה תיק, והנתונים בטבלה. ואז להפנות את תשומת הלב למספר החשבון — \"תסתכל עליו רגע לפני שאתה מתחיל\" — ולעצור שם."
      }
    ],
    "avatars": [
      {
        "id": "concerned",
        "file": "elad-concerned.png"
      },
      {
        "id": "neutral",
        "file": "elad-neutral.png",
        "default": true
      },
      {
        "id": "explaining",
        "file": "elad-explaining.png"
      },
      {
        "id": "thinking",
        "file": "elad-thinking.png"
      },
      {
        "id": "presenting",
        "file": "elad-presenting.png"
      },
      {
        "id": "approve",
        "file": "elad-approve.png"
      },
      {
        "id": "impressed",
        "file": "elad-impressed.png"
      },
      {
        "id": "disapprove",
        "file": "elad-disapprove.png"
      },
      {
        "id": "waiting",
        "file": "elad-waiting.png"
      }
    ]
  },
  "4": {
    "week": 4,
    "title": "מחשבון המשכורת — גרסה ראשונה",
    "xp": "500",
    "requirements": [],
    "taskHtml": "<p>בשבוע הראשון חישבת את הנטו שלך בראש והקלדת את התוצאה. אמרתי לך אז שנגיע לזה.</p>\n<p>הגענו. <b>השבוע המחשב יחשב במקומך.</b></p>\n<p>ויש כאן משהו שכדאי שתדע לפני שאתה מתחיל: הקוד שתכתוב היום לא נשאר בתרגיל. <b>מרגע שתגיש אותו, המערכת תשתמש בו כדי לחשב את התלוש החודשי שלך.</b> אם יהיה בו באג — תקבל תלוש שגוי, ותראה אותו.</p>\n<h2>חלק א' — עמלת העברה</h2>\n<p>לקוח מעביר <b>2500 ₪</b>. הבנק גובה עמלה של <b>0.4%</b>.</p>\n<p>שמור את שני הנתונים במשתנים, <b>חשב</b> את העמלה, והדפס אותה.</p>\n<table><tr><th>מה</th><th>שם המשתנה</th></tr>\n<tr><td>סכום ההעברה</td><td><code>transfer_amount</code></td></tr>\n<tr><td>שיעור העמלה</td><td><code>commission_rate</code></td></tr>\n<tr><td>העמלה בשקלים</td><td><code>commission</code></td></tr>\n</table>\n<p>⚠️ <b>0.4% אינו 0.4.</b> אחוז הוא חלק ממאה. תשאל את אלעד איך אחוז הופך למספר שאפשר להכפיל בו — זה הבסיס לכל מה שנעשה השנה.</p>\n<h2>חלק ב' — התלוש ⭐</h2>\n<p>עכשיו החלק האמיתי.</p>\n<table><tr><th>מה</th><th>הערך</th><th>שם המשתנה</th></tr>\n<tr><td>ברוטו</td><td>6000</td><td><code>gross_salary</code></td></tr>\n<tr><td>שיעור מס הכנסה</td><td>15%</td><td><code>tax_rate</code></td></tr>\n<tr><td>שיעור ביטוח לאומי</td><td>3.5%</td><td><code>national_insurance_rate</code></td></tr>\n</table>\n<p><b>חשב</b> — אל תקליד את התשובות:</p>\n<table><tr><th>מה</th><th>שם המשתנה</th></tr>\n<tr><td>מס הכנסה בשקלים</td><td><code>income_tax</code></td></tr>\n<tr><td>ביטוח לאומי בשקלים</td><td><code>national_insurance</code></td></tr>\n<tr><td>נטו</td><td><code>net_salary</code></td></tr>\n</table>\n<p>והדפס תלוש מסודר: ברוטו, שני הניכויים, ונטו.</p>\n<blockquote><b>שים לב למספר שיצא לך בביטוח לאומי.</b> הוא ייראה מוזר. זה לא באג שלך ולא טעות שלך — יש לזה סיבה אמיתית, ואלעד יגיד לך מה לעשות בינתיים. את ההסבר המלא תקבל בעוד כמה שבועות.</blockquote>\n<h2>חלק ג' — שיעור הניכוי האפקטיבי</h2>\n<p>כמה אחוז מהברוטו שלך בעצם ירד?</p>\n<pre dir=\"ltr\">שיעור הניכוי = (מס הכנסה + ביטוח לאומי) ÷ ברוטו × 100</pre>\n<p>שמור ב-<code>effective_rate</code>, <b>מעוגל לספרה אחת אחרי הנקודה</b>, והדפס.</p>\n<p>⚠️ <b>הסוגריים בנוסחה למעלה אינם קישוט.</b> נסה פעם אחת בלעדיהם ותראה מה יוצא. פייתון מבצע כפל וחילוק לפני חיבור וחיסור, בדיוק כמו בשיעורי מתמטיקה — והסוגריים הם מה שמשנה את הסדר.</p>\n<h2>מה נבדק</h2>\n<ul>\n<li>שבעת המשתנים קיימים בשמות המדויקים</li>\n<li><b>הערכים חושבו ולא הוקלדו</b> — הטסטים בודקים את זה</li>\n<li>התלוש מודפס ומכיל את כל השורות</li>\n<li><code>effective_rate</code> מעוגל נכון</li>\n</ul>\n<h2>מותר להיעזר</h2>\n<ul>\n<li><b>באלעד</b> — במיוחד על אחוזים, ועל המספר המוזר בחלק ב'</li>\n<li>בהרצה חוזרת, בלי הגבלה</li>\n</ul>\n<p><b>לא להקליד תוצאות.</b> אם כתבת <code>income_tax = 900</code> במקום לחשב — הטסטים יעברו והתלוש שלך יעבוד החודש. אבל בחודש הבא, כשהשכר שלך ישתנה בגלל קידום, המחשבון ימשיך להחזיר 900. <b>זו הסיבה שמחשבים ולא מקלידים.</b></p>",
    "starter": "# ============================================\n#  מחשבון המשכורת — גרסה 1\n#  מערכות ליבה · הבנק\n#\n#  ⭐ הקוד הזה נכנס לייצור. המערכת תשתמש בו\n#     כדי לחשב את התלוש החודשי שלך.\n# ============================================\n\n# --- חלק א': עמלת העברה ---\n\ntransfer_amount = 2500\n# הגדר כאן את שיעור העמלה, וחשב את העמלה בשקלים.\n\n\nprint(\"=== עמלת העברה ===\")\n\n\n# --- חלק ב': התלוש ---\n\ngross_salary = 6000\n# הגדר כאן את שני שיעורי הניכוי.\n\n\n# חשב כאן את שלושת הסכומים: מס הכנסה, ביטוח לאומי, ונטו.\n\n\nprint()\nprint(\"=== תלוש משכורת ===\")\n\n\n# --- חלק ג': שיעור הניכוי האפקטיבי ---\n\n# חשב כאן את שיעור הניכוי, מעוגל לספרה אחת.\n\n\nprint()\n",
    "testsVisible": "# בדיקות גלויות — שבוע 4\n#\n# ⛔ **שורה לכל חלק של המשימה.** מד ההתקדמות שהתלמיד רואה הוא מספר\n#    הבדיקות שעברו, ולכן כיסוי חלקי משדר \"סיימת\" למי שסיים שליש.\n#\n# ⚠️ **חלק ג' נבדק מול החישוב ולא מול מספר קבוע.** השיעור האפקטיבי\n#    נגזר מהערכים של התלמיד עצמו, ולכן מי שהקליד מספר במקום לחשב\n#    ייתפס גם כאן ולא רק בנסתרות.\n#\n# זמין: OUTPUT · LINES · VARS\n\n\ndef test_something_printed():\n    \"\"\"התוכנית מדפיסה משהו\"\"\"\n    assert OUTPUT.strip(), \"התוכנית לא הדפיסה כלום.\"\n\n\n# ── חלק א' ────────────────────────────────────────────────────────────\n\ndef test_commission_variables():\n    \"\"\"חלק א': משתני העמלה קיימים\"\"\"\n    missing = [n for n in [\"transfer_amount\", \"commission_rate\", \"commission\"]\n               if n not in VARS]\n    assert not missing, f\"חסרים משתנים: {', '.join(missing)}\"\n\n\ndef test_commission_rate_is_fraction():\n    \"\"\"חלק א': שיעור העמלה נכתב כחלק ממאה\"\"\"\n    assert VARS.get(\"commission_rate\") == 0.004, (\n        \"commission_rate: 0.4% נכתב כ-0.004\"\n    )\n\n\ndef test_commission_value():\n    \"\"\"חלק א': העמלה חושבה\"\"\"\n    value = VARS.get(\"commission\")\n    assert value is not None and abs(value - 10.0) < 0.01, (\n        f\"commission יצא {value}. בדוק את ההכפלה מול סכום ההעברה.\"\n    )\n\n\n# ── חלק ב' ────────────────────────────────────────────────────────────\n\ndef test_payslip_variables():\n    \"\"\"חלק ב': משתני התלוש קיימים\"\"\"\n    # ⚠️ הסדר כאן שונה מזה שבבדיקות הנסתרות **בכוונה**: שער הדליפה\n    #    ב-build_app_content משווה שורות, ורשימה זהה הייתה נראית לו\n    #    כמו העתקה של קובץ שאסור שיגיע לדפדפן.\n    needed = [\"gross_salary\", \"income_tax\", \"national_insurance\",\n              \"net_salary\", \"tax_rate\", \"national_insurance_rate\"]\n    missing = [n for n in needed if n not in VARS]\n    assert not missing, f\"חסרים משתנים: {', '.join(missing)}\"\n\n\ndef test_rates_are_fractions():\n    \"\"\"חלק ב': שיעורי הניכוי נכתבו כחלק ממאה\"\"\"\n    assert VARS.get(\"tax_rate\") == 0.15, \"tax_rate: 15% נכתב כ-0.15\"\n    assert VARS.get(\"national_insurance_rate\") == 0.035, (\n        \"national_insurance_rate: 3.5% נכתב כ-0.035\"\n    )\n\n\ndef test_net_is_correct_amount():\n    \"\"\"חלק ב': הנטו חושב נכון\"\"\"\n    value = VARS.get(\"net_salary\")\n    assert value is not None and abs(value - 4890.0) < 0.01, (\n        f\"net_salary יצא {value} ואמור לצאת 4890.\"\n    )\n\n\ndef test_payslip_printed():\n    \"\"\"חלק ב': התלוש מודפס\"\"\"\n    assert \"6000\" in OUTPUT and \"4890\" in OUTPUT, (\n        \"התלוש אמור להציג גם את הברוטו וגם את הנטו.\"\n    )\n\n\n# ── חלק ג' ────────────────────────────────────────────────────────────\n\ndef test_effective_rate_computed():\n    \"\"\"חלק ג': שיעור הניכוי חושב ועוגל\"\"\"\n    rate = VARS.get(\"effective_rate\")\n    assert rate is not None, (\n        \"חסר המשתנה effective_rate. חלק ג' מבקש לחשב אותו ולשמור בו.\"\n    )\n    gross = VARS.get(\"gross_salary\")\n    tax = VARS.get(\"income_tax\")\n    ni = VARS.get(\"national_insurance\")\n    assert None not in (gross, tax, ni), (\n        \"כדי לחשב את שיעור הניכוי צריך את הברוטו ואת שני הניכויים.\"\n    )\n    expected = round((tax + ni) / gross * 100, 1)\n    assert abs(rate - expected) < 0.05, (\n        f\"effective_rate יצא {rate} ולא מתאים לניכויים שחישבת. \"\n        \"בדוק את הסוגריים בנוסחה ואת העיגול לספרה אחת.\"\n    )\n\n\ndef test_effective_rate_printed():\n    \"\"\"חלק ג': שיעור הניכוי מודפס\"\"\"\n    rate = VARS.get(\"effective_rate\")\n    assert rate is not None and str(rate) in OUTPUT, (\n        \"לא מצאתי את שיעור הניכוי בפלט. המשימה מבקשת גם להדפיס אותו.\"\n    )\n",
    "inject": "",
    "manager": [
      {
        "kind": "goal",
        "text": "לחבר לשבוע 1 ולהעביר את משקל הייצור. מה שחייב לעבור: שבשבוע הראשון הוא חישב בראש, שהיום המחשב יעשה את זה, **ושהקוד הזה יריץ את התלוש שלו מכאן והלאה.** לא לאיים — לכבד. זו עבודה אמיתית."
      }
    ],
    "avatars": [
      {
        "id": "concerned",
        "file": "elad-concerned.png"
      },
      {
        "id": "neutral",
        "file": "elad-neutral.png",
        "default": true
      },
      {
        "id": "explaining",
        "file": "elad-explaining.png"
      },
      {
        "id": "thinking",
        "file": "elad-thinking.png"
      },
      {
        "id": "presenting",
        "file": "elad-presenting.png"
      },
      {
        "id": "approve",
        "file": "elad-approve.png"
      },
      {
        "id": "impressed",
        "file": "elad-impressed.png"
      },
      {
        "id": "disapprove",
        "file": "elad-disapprove.png"
      },
      {
        "id": "waiting",
        "file": "elad-waiting.png"
      }
    ]
  }
};

export const DEFAULT_WEEK = 1;
