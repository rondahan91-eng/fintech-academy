# בדיקות נסתרות — שבוע 5
# קובעות ניקוד. לא נחשפות לתלמיד אלא בקניית הפריט מהחנות.
#
# זמין: OUTPUT · LINES · VARS
#
# ⚠️ **הציר של השבוע הוא הטיפוס, לא הערך.** ‏4850 / 6 נותן 808.3333
#    ו-4850 // 6 נותן 808. תלמיד שהשתמש ב-/ ואז עיגל מקבל את אותו
#    מספר — ולכן כל בדיקה כאן שואלת גם מאיזה טיפוס הוא.

REQUIRED = [
    "purchase_amount", "payments_count", "payment", "remainder",
    "first_payment", "check_total",
    "total_agorot", "shekels", "agorot",
]


def _get(name):
    assert name in VARS, (
        f"לא מצאתי משתנה בשם {name}. "
        "שמות המשתנים חייבים להיות בדיוק כפי שרשום במשימה."
    )
    return VARS[name]


def _whole(name):
    """מספר שלם אמיתי, ולא float שבמקרה יצא עגול."""
    value = _get(name)
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"{name} הוא {type(value).__name__} ולא מספר שלם. "
        "‏// מחזיר שלם; / מחזיר עשרוני גם כשהחלוקה יפה."
    )
    return value


def test_all_variables_exist():
    missing = [n for n in REQUIRED if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


# --- חלק א': הפריסה ---

def test_source_data_untouched():
    assert _get("purchase_amount") == 4850, "purchase_amount אינו הסכום שבמשימה."
    assert _get("payments_count") == 6, "payments_count אינו מספר התשלומים שבמשימה."


def test_payment_is_whole_and_correct():
    value = _whole("payment")
    expected = _get("purchase_amount") // _get("payments_count")
    assert value == expected, (
        f"payment הוא {value}, והמנה השלמה היא {expected}."
    )


def test_remainder_is_whole_and_correct():
    value = _whole("remainder")
    expected = _get("purchase_amount") % _get("payments_count")
    assert value == expected, (
        f"remainder הוא {value}, והשארית היא {expected}."
    )


def test_split_is_self_consistent():
    """
    הפריסה סוגרת את עצמה.

    ⚠️ **מה שהבדיקות כאן תופסות, ומה שלא.** נבדק בפועל על ארבע
       גרסאות שגויות:

       ‏payment = purchase_amount / payments_count     → נתפס (float)
       ‏payment = round(... / ..., 2)                  → נתפס (float)
       ‏payment = int(... / ...)                       → **עובר**
       ‏payment = round(... / ... - 0.5)               → **עובר**

       שתי האחרונות מחזירות int עם הערך הנכון, ועל הקלט הזה הן
       נכונות. אין בדיקה שתבדיל ביניהן ל-// כשהקלט קבוע — ההבדל
       מתגלה רק על קלט אחר. **זו עבודה של הרובריקה, לא של הטסטים**,
       והיא רשומה שם במפורש.

    מה שכן נבדק כאן: ששני החישובים עקביים זה עם זה. פריסה שאינה
    סוגרת את הסכום פירושה שאחד מהם שגוי, לא משנה באיזו דרך חושב.
    """
    p = _get("payment")
    r = _get("remainder")
    n = _get("payments_count")
    total = _get("purchase_amount")
    assert p * n + r == total, (
        f"התשלום הרגיל כפול {n} ועוד השארית נותן {p * n + r}, "
        f"וסכום הרכישה הוא {total}. אחד משני החישובים אינו נכון."
    )


# --- חלק ב': השארית והבדיקה ---

def test_first_payment():
    value = _whole("first_payment")
    expected = _get("payment") + _get("remainder")
    assert value == expected, (
        f"first_payment הוא {value} ואמור להיות {expected}."
    )


def test_check_total_is_exact():
    value = _get("check_total")
    total = _get("purchase_amount")
    assert value == total, (
        f"check_total הוא {value} וסכום הרכישה הוא {total}. "
        "הפריסה מאבדת או ממציאה כסף."
    )


def test_check_total_was_computed():
    """מונע הקלדה של 4850 לתוך check_total."""
    expected = _get("first_payment") + _get("payment") * (_get("payments_count") - 1)
    assert _get("check_total") == expected, (
        "check_total אינו מורכב מהתשלום הראשון ומשאר התשלומים. "
        "הוא אמור להיבנות מהפריסה עצמה, אחרת הוא לא בודק דבר."
    )


# --- חלק ג': אגורות ---

def test_agorot_split():
    assert _get("total_agorot") == 128745, "total_agorot אינו הערך שבמשימה."
    assert _whole("shekels") == _get("total_agorot") // 100, (
        "shekels אינו מספר השקלים השלמים."
    )
    assert _whole("agorot") == _get("total_agorot") % 100, (
        "agorot אינו מה שנשאר אחרי השקלים."
    )


def test_agorot_recombine():
    """השקלים והאגורות מרכיבים בחזרה את הסכום המקורי."""
    back = _get("shekels") * 100 + _get("agorot")
    assert back == _get("total_agorot"), (
        f"‏{_get('shekels')} שקלים ו-{_get('agorot')} אגורות נותנים {back} "
        f"אגורות, והסכום המקורי הוא {_get('total_agorot')}."
    )


# --- פלט ---

def test_all_labels_printed():
    labels = ["סכום הרכישה:", "מספר תשלומים:", "תשלום רגיל:", "שארית:",
              "תשלום ראשון:", "סך הכול:", "שקלים:", "אגורות:"]
    missing = [lbl for lbl in labels if lbl not in OUTPUT]
    assert not missing, f"חסרות תוויות בפלט: {', '.join(missing)}"


def test_values_printed():
    for name in ("payment", "remainder", "first_payment", "shekels", "agorot"):
        assert str(_get(name)) in OUTPUT, (
            f"הערך של {name} אינו מופיע בפלט."
        )
