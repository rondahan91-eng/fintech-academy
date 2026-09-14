// נוצר על ידי tools/build_app_content.py — אין לערוך ידנית.
export const WEEK = {
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
};
