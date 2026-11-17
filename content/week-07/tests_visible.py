# בדיקות גלויות — שבוע 7
#
# ⛔ **שורה לכל חלק של המשימה.** מד ההתקדמות שהתלמיד רואה הוא מספר
#    הבדיקות שעברו, ולכן כיסוי חלקי משדר "סיימת" למי שסיים שליש.
#
# ⚠️ **השבוע הציר הוא הטיפוס, לא הערך.** ‏input() מחזיר מחרוזת, ותלמיד
#    שלא המיר יקבל "15000" במקום 15000 — ועל מחרוזות גם // עובד אחרת
#    וגם min משווה לפי סדר אלפביתי. כל בדיקה על נתון קלוט שואלת גם
#    מאיזה טיפוס הוא.
#
# ⚠️ **הבדיקות רצות על הקלט הרשמי של המשימה**, גם אם התלמיד שינה את
#    תיבת הקלט. ראה execute() ב-app.js.
#
# זמין: OUTPUT · LINES · VARS

CENT = 0.01


def _get(name):
    assert name in VARS, (
        f"לא מצאתי משתנה בשם {name}. "
        "שמות המשתנים חייבים להיות בדיוק כפי שרשום במשימה."
    )
    return VARS[name]


def _whole(name):
    value = _get(name)
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"{name} הוא {type(value).__name__} ולא מספר שלם. "
        "‏input() מחזיר מחרוזת תמיד — צריך להמיר ב-int()."
    )
    return value


def test_something_printed():
    """התוכנית מדפיסה משהו"""
    assert OUTPUT.strip(), "התוכנית לא הדפיסה כלום."


# ── חלק א': הקליטה ────────────────────────────────────────────────────

def test_name_is_text():
    """חלק א': השם נקלט כמחרוזת"""
    value = _get("name")
    assert isinstance(value, str), f"name הוא {type(value).__name__} ולא מחרוזת."
    assert value.strip() == "דנה לוי", (
        f"name הוא {value!r}. הוא אמור להיות השורה הראשונה של הקלט, כפי שהיא."
    )


def test_numbers_converted():
    """חלק א': שלושת המספרים הומרו למספרים שלמים"""
    assert _whole("income") == 4200, "income אינו ההכנסה שבקלט."
    assert _whole("amount") == 15000, "amount אינו הסכום שבקלט."
    assert _whole("months") == 10, "months אינו מספר התשלומים שבקלט."


def test_has_account_is_boolean():
    """חלק א': הלקוחה הקיימת נקלטה כאמת או שקר"""
    value = _get("has_account")
    assert isinstance(value, bool), (
        f"has_account הוא {type(value).__name__} ולא אמת או שקר. "
        "שתי המרות: קודם int, ואז bool."
    )
    assert value is True, (
        "has_account יצא False. בקלט יש 1, כלומר לקוחה קיימת."
    )


def test_greeting_line():
    """חלק א': שורת הפתיחה מדביקה את השם"""
    assert "דנה לוי" in OUTPUT, (
        "השם לא מופיע בפלט. שורת הפתיחה מדביקה טקסט לשם שנקלט."
    )
    assert "שלום" in OUTPUT, "חסרה שורת הפתיחה."


# ── חלק ב' ────────────────────────────────────────────────────────────

def test_monthly_requested():
    """חלק ב': ההחזר המבוקש הוא הסכום חלקי מספר התשלומים"""
    expected = _get("amount") / _get("months")
    value = _get("monthly")
    assert abs(value - expected) < CENT, (
        f"monthly יצא {value}, והחישוב נותן {expected}."
    )


# ── חלק ג' ────────────────────────────────────────────────────────────

def test_max_monthly_is_a_third():
    """חלק ג': התקרה היא שליש מההכנסה, בשקלים שלמים"""
    value = _get("max_monthly")
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"max_monthly הוא {type(value).__name__} ולא מספר שלם. "
        "שקלים שלמים — ראה שבוע 5."
    )
    assert value == _get("income") // 3, (
        f"max_monthly יצא {value}, ושליש מ-{_get('income')} בשקלים שלמים "
        f"הוא {_get('income') // 3}."
    )


def test_approved_is_the_smaller():
    """חלק ג': ההחזר המאושר הוא הקטן מבין השניים"""
    expected = min(_get("monthly"), _get("max_monthly"))
    value = _get("approved_monthly")
    assert abs(value - expected) < CENT, (
        f"approved_monthly יצא {value}. הקטן מבין {_get('monthly')} "
        f"ל-{_get('max_monthly')} הוא {expected}."
    )
    assert value <= _get("max_monthly") + CENT, (
        "approved_monthly גדול מהתקרה. זה בדיוק מה שהכלל אוסר."
    )


def test_split_adds_up():
    """חלק ג': הפריסה מחזירה את הסכום במדויק"""
    # ⚠️ **זו הבדיקה שבאמת שווה משהו כאן.** היא לא משווה למספר קבוע
    #    אלא שואלת אם הפריסה של התלמיד **סוגרת** — וזה מה שבנק בודק.
    months = _get("real_months")
    last = _get("last_payment")
    approved = _get("approved_monthly")
    total = months * approved + last
    assert abs(total - _get("amount")) < CENT, (
        f"‏{months} תשלומים של {approved} ועוד {last} הם {total}, "
        f"והסכום המבוקש הוא {_get('amount')}. הפריסה מאבדת או ממציאה כסף."
    )
    assert last < approved + CENT, (
        f"last_payment יצא {last}, והוא אינו קטן מתשלום מלא. "
        "אם נשאר תשלום שלם — הוא היה צריך להיספר ב-real_months."
    )


def test_decision_printed():
    """חלק ג': שלוש שורות ההחלטה מודפסות"""
    missing = [lbl for lbl in ["החזר מבוקש:", "החזר מאושר:", "פריסה:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות שורות: {', '.join(missing)}"
