# בדיקות נסתרות — שבוע 3
# קובעות ניקוד. לא נחשפות לתלמיד אלא בקניית הפריט מהחנות.
#
# זמין: OUTPUT · LINES · VARS (המשתנים של התלמיד אחרי ההרצה)
#
# כלל ניסוח: הודעת כישלון אומרת מה חסר — לעולם לא איך לתקן.

REQUIRED = ["customer_name", "account_number", "age", "gross_salary", "is_active"]


def _get(name):
    assert name in VARS, (
        f"לא מצאתי משתנה בשם {name}. "
        "שמות המשתנים חייבים להיות בדיוק כפי שרשום בטבלה שבמשימה."
    )
    return VARS[name]


# --- קיום המשתנים ---

def test_all_variables_exist():
    missing = [n for n in REQUIRED if n not in VARS]
    assert not missing, (
        f"חסרים משתנים: {', '.join(missing)}. "
        "צריך חמישה, בשמות המדויקים מהטבלה."
    )


# --- טיפוסים ---

def test_customer_name_is_text():
    value = _get("customer_name")
    assert isinstance(value, str), (
        f"customer_name הוא {type(value).__name__} ולא טקסט. "
        "שם של אדם נשמר כמחרוזת."
    )


def test_account_number_is_text_not_number():
    """הבדיקה המרכזית של השבוע."""
    value = _get("account_number")
    assert isinstance(value, str), (
        f"account_number נשמר כ-{type(value).__name__}. "
        "בדוק מה קורה לאפס שבתחילת המספר כשהוא נשמר כך — "
        "ואז תחשוב איזה טיפוס משמר אותו."
    )


def test_account_number_kept_leading_zero():
    value = _get("account_number")
    assert value == "0521147", (
        f"מספר החשבון הוא '{value}' ואמור להיות '0521147'. "
        "האפס המוביל הוא חלק מהמספר ולא קישוט."
    )


def test_age_is_whole_number():
    value = _get("age")
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"age הוא {type(value).__name__}. גיל הוא מספר שלם."
    )


def test_gross_salary_is_decimal():
    value = _get("gross_salary")
    assert isinstance(value, float), (
        f"gross_salary הוא {type(value).__name__}. "
        "שכר של 12500.5 אינו מספר שלם."
    )


def test_is_active_is_boolean():
    value = _get("is_active")
    assert isinstance(value, bool), (
        f"is_active הוא {type(value).__name__}. "
        "שאלה שהתשובה לה 'כן' או 'לא' נשמרת כטיפוס בוליאני."
    )


# --- חלק ג': הערכים התעדכנו ---

def test_salary_was_updated():
    value = _get("gross_salary")
    assert value == 13750.5, (
        f"gross_salary נשאר {value}. "
        "בסוף התוכנית הוא אמור להחזיק את השכר שאחרי ההעלאה."
    )


def test_account_was_activated():
    value = _get("is_active")
    assert value is True, (
        "is_active אינו True בסוף התוכנית. "
        "החשבון הופעל אחרי שהמסמכים הגיעו."
    )


def test_no_duplicate_variables_created():
    """מונע 'gross_salary2' במקום השמה מחדש."""
    suspicious = [
        n for n in VARS
        if not n.startswith("_")
        and any(n.startswith(base) and n != base for base in REQUIRED)
    ]
    assert not suspicious, (
        f"מצאתי משתנים נוספים: {', '.join(suspicious)}. "
        "עדכון תיק נעשה בשינוי הערך של המשתנה הקיים, לא ביצירת חדש."
    )


# --- פלט ---

def test_types_were_printed():
    assert OUTPUT.count("class") >= 5, (
        "לא מצאתי חמש הדפסות של טיפוס. "
        "חלק ב' מבקש להדפיס את הטיפוס של כל אחד מחמשת המשתנים."
    )


def test_card_printed_twice():
    """הכרטיס לפני העדכון ואחריו."""
    assert OUTPUT.count("רותם אזולאי") >= 2, (
        "שם הלקוחה מופיע בפלט פחות מפעמיים. "
        "הכרטיס אמור להיות מודפס גם לפני העדכון וגם אחריו."
    )


def test_both_salaries_appear():
    assert "12500.5" in OUTPUT, (
        "לא מצאתי את השכר המקורי בפלט. "
        "הכרטיס הראשון אמור להציג אותו."
    )
    assert "13750.5" in OUTPUT, (
        "לא מצאתי את השכר המעודכן בפלט. "
        "הכרטיס השני אמור להציג אותו."
    )
