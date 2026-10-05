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
    "starter": "# ============================================\n#  מודול הליבה — תנועות בחשבון\n#  מערכות ליבה · הבנק\n# ============================================\n#\n# המחלקה Account כבר טעונה. אין צורך לייבא כלום.\n\n\n# --- חלק א': החשבון של דנה ---\n\ndana = Account(owner=\"דנה כהן\", balance=2500)\n\n# הפקד 400, משוך 120, ואז הדפס את השם ואת היתרה.\n\n\n\n# --- חלק ב': יואב, והעברה ---\n\n# פתח כאן את החשבון של יואב, בצע את ההעברה, והדפס את שתי היתרות.\n\n\n\n# --- חלק ג': משיכה גדולה מדי ---\n\n# משוך 3000 מהחשבון של יואב.\n# הדפס את היתרה, את is_overdrawn(), ואת התדפיס המלא.\n",
    "testsVisible": "# בדיקות גלויות — שבוע 2\n# מכסות את חלק א' בלבד. חלקים ב' ו-ג' נבדקים רק בנסתרים.\n\n\ndef test_something_printed():\n    assert OUTPUT.strip(), (\n        \"התוכנית לא הדפיסה כלום. ודא שיש פקודת print, ושלחצת על 'הרץ'.\"\n    )\n\n\ndef test_dana_exists():\n    assert \"דנה כהן\" in OUTPUT, (\n        \"לא מצאתי את השם של דנה בפלט. הדפסת את acc.owner()?\"\n    )\n\n\ndef test_dana_balance_after_ops():\n    assert \"2780\" in OUTPUT.replace(\",\", \"\"), (\n        \"לא מצאתי את היתרה של דנה אחרי ההפקדה והמשיכה. \"\n        \"בדוק שביצעת את שתי הפעולות ואז הדפסת את balance().\"\n    )\n",
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
    "starter": "# ============================================\n#  תיק לקוח\n#  מערכות ליבה · הבנק\n# ============================================\n\n# --- חלק א': פתיחת התיק ---\n\n# הגדר כאן את חמשת המשתנים.\n# הראשון כדוגמה — המשך באותו אופן.\ncustomer_name = \"רותם אזולאי\"\n\n\n# הדפס כאן את כרטיס הלקוח.\nprint(\"=== תיק לקוח ===\")\n\n\n# --- חלק ב': בדיקת טיפוסים ---\n\nprint()\nprint(\"=== טיפוסי הנתונים ===\")\n\n# הדפס כאן את הטיפוס של כל אחד מחמשת המשתנים.\n\n\n# --- חלק ג': עדכון התיק ---\n\nprint()\nprint(\"=== התיק לאחר עדכון ===\")\n\n# שנה כאן את הערכים של המשתנים הקיימים, ואז הדפס שוב את הכרטיס.\n",
    "testsVisible": "# בדיקות גלויות — שבוע 3\n# התלמיד מריץ אותן כמה שירצה. מכסות את המקרה הבסיסי בלבד.\n#\n# זמין: OUTPUT · LINES · VARS\n\n\ndef test_variables_exist():\n    required = [\"customer_name\", \"account_number\", \"age\", \"gross_salary\", \"is_active\"]\n    missing = [n for n in required if n not in VARS]\n    assert not missing, (\n        f\"חסרים משתנים: {', '.join(missing)}\"\n    )\n\n\ndef test_account_number_is_text():\n    value = VARS.get(\"account_number\")\n    assert isinstance(value, str), (\n        \"account_number אינו מחרוזת. בדוק מה קרה לאפס המוביל.\"\n    )\n\n\ndef test_something_printed():\n    assert OUTPUT.strip(), \"התוכנית לא הדפיסה כלום.\"\n\n\ndef test_types_printed():\n    assert \"class\" in OUTPUT, (\n        \"לא מצאתי הדפסה של טיפוס. חלק ב' מבקש להשתמש ב-type().\"\n    )\n",
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
    "starter": "# ============================================\n#  מחשבון המשכורת — גרסה 1\n#  מערכות ליבה · הבנק\n#\n#  ⭐ הקוד הזה נכנס לייצור. המערכת תשתמש בו\n#     כדי לחשב את התלוש החודשי שלך.\n# ============================================\n\n# --- חלק א': עמלת העברה ---\n\ntransfer_amount = 2500\n# הגדר כאן את שיעור העמלה, וחשב את העמלה בשקלים.\n\n\nprint(\"=== עמלת העברה ===\")\n\n\n# --- חלק ב': התלוש ---\n\ngross_salary = 6000\n# הגדר כאן את שני שיעורי הניכוי.\n\n\n# חשב כאן את שלושת הסכומים: מס הכנסה, ביטוח לאומי, ונטו.\n\n\nprint()\nprint(\"=== תלוש משכורת ===\")\n\n\n# --- חלק ג': שיעור הניכוי האפקטיבי ---\n\n# חשב כאן את שיעור הניכוי, מעוגל לספרה אחת.\n\n\nprint()\n",
    "testsVisible": "# בדיקות גלויות — שבוע 4\n# זמין: OUTPUT · LINES · VARS\n\n\ndef test_variables_exist():\n    required = [\"commission\", \"income_tax\", \"national_insurance\",\n                \"net_salary\", \"effective_rate\"]\n    missing = [n for n in required if n not in VARS]\n    assert not missing, f\"חסרים משתנים: {', '.join(missing)}\"\n\n\ndef test_rates_are_fractions():\n    assert VARS.get(\"tax_rate\") == 0.15, \"tax_rate: 15% נכתב כ-0.15\"\n    assert VARS.get(\"commission_rate\") == 0.004, \"commission_rate: 0.4% נכתב כ-0.004\"\n\n\ndef test_net_is_correct_amount():\n    value = VARS.get(\"net_salary\")\n    assert value is not None and abs(value - 4890.0) < 0.01, (\n        f\"net_salary יצא {value} ואמור לצאת 4890.\"\n    )\n\n\ndef test_payslip_printed():\n    assert \"6000\" in OUTPUT and \"4890\" in OUTPUT, (\n        \"התלוש אמור להציג גם את הברוטו וגם את הנטו.\"\n    )\n",
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
