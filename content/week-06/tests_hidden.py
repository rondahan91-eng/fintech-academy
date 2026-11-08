# בדיקות נסתרות — שבוע 6
# קובעות ניקוד. לא נחשפות לתלמיד אלא בקניית הפריט מהחנות.
#
# זמין: OUTPUT · LINES · VARS
#
# ⚠️ **הציר של השבוע הוא מה שהחזקה עושה, לא המספר שיוצא.** תלמיד
#    שהקליד 13770.28 מקבל את אותה תוצאה כמו מי שחישב — ולכן כאן
#    נבדקת **העקביות בין המשתנים** ולא רק הערך: הריבית חייבת להיות
#    ההפרש של הסכום שלו מהקרן שלו, ההפרש חייב להיות ההפרש של שתי
#    הריביות שלו, והשקלים חייבים לצאת מהאגורות שלו.
#
# ⚠️ **ומה שהבדיקות לא תופסות:** ‏pow(x, y) ו-x ** y מחזירים את אותו
#    float בדיוק, ונבדק. אין דרך להבדיל ביניהם בקוד שרץ. הדרישה
#    ל-pow היא קריטריון ראשון **ברובריקה**.

CENT = 0.01

REQUIRED = [
    "principal", "annual_rate", "years",
    "simple_interest", "simple_total",
    "compound_total", "compound_interest", "gap",
    "cap", "paid_now", "left_for_next",
    "left_agorot", "shekels", "agorot",
]


def _get(name):
    assert name in VARS, (
        f"לא מצאתי משתנה בשם {name}. "
        "שמות המשתנים חייבים להיות בדיוק כפי שרשום במשימה."
    )
    return VARS[name]


def _close(name, expected, hint=""):
    value = _get(name)
    assert isinstance(value, (int, float)) and not isinstance(value, bool), (
        f"{name} אינו מספר אלא {type(value).__name__}."
    )
    assert abs(value - expected) < CENT, (
        f"{name} יצא {round(value, 2)} במקום {round(expected, 2)}. {hint}"
    )


def _whole(name):
    value = _get(name)
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"{name} הוא {type(value).__name__} ולא מספר שלם. "
        "אגורה היא יחידה שלמה."
    )
    return value


def test_all_variables_exist():
    missing = [n for n in REQUIRED if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_source_data_untouched():
    # ⚠️ **נוסח אחר מהבדיקה הגלויה בכוונה.** שער הדליפה ב-
    #    build_app_content.py מחפש שורות של הקובץ הזה בתוך החבילה
    #    שנשלחת לדפדפן, ושורה שזהה לשורה גלויה נספרת כדליפה — ואז
    #    **השבוע כולו יוצא מהחבילה.** שלוש שורות כאלה הפילו את שבוע 6.
    given = (_get("principal"), _get("years"), _get("cap"))
    assert given == (12000, 4, 1500), (
        f"הנתונים שבמשימה שונו: {given} במקום (12000, 4, 1500)."
    )
    assert abs(_get("annual_rate") - 0.035) < 1e-9, "annual_rate שונה מ-3.5%."


# --- חלק א': ריבית פשוטה ---

def test_simple_interest_value():
    _close("simple_interest", 1680.0,
           "ריבית פשוטה: קרן כפול שיעור כפול שנים.")


def test_simple_total_consistent():
    _close("simple_total", _get("principal") + _get("simple_interest"),
           "הסכום בסוף נבנה מהקרן ומהריבית שלך.")


# --- חלק ב': ריבית דריבית ---

def test_compound_total_value():
    _close("compound_total", 13770.28,
           "הקרן כפול (1 ועוד השיעור) בחזקת מספר השנים.")


def test_compound_interest_consistent():
    _close("compound_interest", _get("compound_total") - _get("principal"),
           "הריבית היא מה שנוסף לקרן שלך, ולא מספר שהוקלד.")


def test_gap_consistent():
    _close("gap", abs(_get("compound_interest") - _get("simple_interest")),
           "ההפרש נבנה משתי הריביות שלך.")


def test_gap_value():
    _close("gap", 90.28, "ההפרש בין דריבית לפשוטה על הנתונים האלה.")


# --- חלק ג': תקרת התשלום ---

def test_paid_now_is_the_cap():
    # הריבית גדולה מהתקרה, ולכן min חייב להחזיר את התקרה.
    _close("paid_now", 1500, "הריבית גדולה מהתקרה, ולכן משולמת התקרה.")


def test_left_for_next_consistent():
    _close("left_for_next",
           max(_get("compound_interest") - _get("paid_now"), 0),
           "מה שנשאר נבנה מהריבית שלך ומהתשלום שלך.")


def test_left_agorot_is_whole():
    agorot_total = _whole("left_agorot")
    _close("left_agorot", round(_get("left_for_next") * 100),
           "מה שנשאר, כפול מאה, מעוגל לאגורה שלמה.")
    assert agorot_total == 27028, (
        f"left_agorot יצא {agorot_total} ולא 27028."
    )


def test_divmod_split():
    _whole("shekels")
    _whole("agorot")
    assert (_get("shekels"), _get("agorot")) == divmod(_get("left_agorot"), 100), (
        "השקלים והאגורות אינם הפירוק של left_agorot שלך."
    )
    assert (_get("shekels"), _get("agorot")) == (270, 28), (
        f"יצא {(_get('shekels'), _get('agorot'))} ולא (270, 28)."
    )


def test_agorot_in_range():
    assert 0 <= _get("agorot") < 100, (
        f"agorot יצא {_get('agorot')}. שארית בחלוקה למאה היא בין 0 ל-99."
    )


# --- ההדפסה ---

def test_all_labels_printed():
    # ⚠️ שמות אחרים מאשר בבדיקה הגלויה — ראה test_source_data_untouched.
    wanted = ("ריבית פשוטה:", "סך הכול פשוטה:", "ריבית דריבית:",
              "סך הכול בדריבית:", "ההפרש:", "משולם עכשיו:",
              "נשאר להעברה הבאה:", "שקלים:", "אגורות:")
    absent = [lbl for lbl in wanted if lbl not in OUTPUT]
    assert not absent, f"חסרות תוויות: {', '.join(absent)}"


def test_money_printed_rounded():
    """הסכומים מוצגים מעוגלים לשתי ספרות"""
    # ⚠️ נבדק על הפלט ולא על המשתנה: העיגול כאן הוא בהדפסה, והמשתנה
    #    חייב להישאר מלא — בדיוק ההפך מ-left_agorot.
    for lbl in ["ריבית דריבית:", "סך הכול בדריבית:", "ההפרש:"]:
        row = [ln for ln in LINES if ln.strip().startswith(lbl)]
        assert row, f"לא מצאתי שורה שמתחילה ב-{lbl}"
        tail = row[0].split(lbl, 1)[1].strip()
        if "." in tail:
            digits = tail.split(".", 1)[1].strip()
            assert len(digits) <= 2, (
                f"השורה '{row[0].strip()}' מציגה יותר משתי ספרות אחרי הנקודה. "
                "הסכומים מוצגים מעוגלים — round בהדפסה."
            )
