# בדיקות גלויות — שבוע 5
#
# ⛔ **שורה לכל חלק של המשימה.** מד ההתקדמות שהתלמיד רואה הוא מספר
#    הבדיקות שעברו, ולכן כיסוי חלקי משדר "סיימת" למי שסיים שליש.
#
# ⚠️ **הערכים נבדקים מול החישוב ולא מול מספר קבוע** בכל מקום שאפשר,
#    כך שמי שהקליד תוצאה נופל כבר כאן ולא רק בנסתרות.
#
# זמין: OUTPUT · LINES · VARS


def test_something_printed():
    """התוכנית מדפיסה משהו"""
    assert OUTPUT.strip(), "התוכנית לא הדפיסה כלום."


# ── חלק א' ────────────────────────────────────────────────────────────

def test_split_variables():
    """חלק א': משתני הפריסה קיימים"""
    missing = [n for n in ["purchase_amount", "payments_count",
                           "payment", "remainder"] if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_payment_is_whole_division():
    """חלק א': התשלום הרגיל הוא המנה השלמה"""
    amount = VARS.get("purchase_amount")
    count = VARS.get("payments_count")
    assert amount and count, "חסר סכום הרכישה או מספר התשלומים."
    assert VARS.get("payment") == amount // count, (
        f"payment יצא {VARS.get('payment')}, והמנה השלמה של "
        f"{amount} ב-{count} היא {amount // count}. "
        "שים לב: // ולא /."
    )


def test_payment_is_not_float():
    """חלק א': התשלום הרגיל הוא מספר שלם"""
    # ⚠️ **הטעות המרכזית של השבוע.** / מחזיר 808.3333 ו-// מחזיר 808.
    #    שניהם "נראים נכון" למי שלא הסתכל על הטיפוס.
    value = VARS.get("payment")
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"payment הוא {type(value).__name__} ולא מספר שלם. "
        "אי אפשר לחייב לקוח בשליש שקל — בדוק אם השתמשת ב-/ במקום ב-//."
    )


def test_remainder_is_modulo():
    """חלק א': השארית חושבה באופרטור השארית"""
    amount = VARS.get("purchase_amount")
    count = VARS.get("payments_count")
    assert amount and count, "חסר סכום הרכישה או מספר התשלומים."
    assert VARS.get("remainder") == amount % count, (
        f"remainder יצא {VARS.get('remainder')}, והשארית של "
        f"{amount} ב-{count} היא {amount % count}."
    )


def test_split_labels():
    """חלק א': ארבע השורות מודפסות עם התוויות"""
    missing = [label for label in ["סכום הרכישה:", "מספר תשלומים:",
                                   "תשלום רגיל:", "שארית:"]
               if label not in OUTPUT]
    assert not missing, (
        f"חסרות תוויות: {', '.join(missing)} — "
        "ראה את טבלת התוויות בחלק א'."
    )


# ── חלק ב' ────────────────────────────────────────────────────────────

def test_first_payment():
    """חלק ב': התשלום הראשון בולע את השארית"""
    p = VARS.get("payment")
    r = VARS.get("remainder")
    assert p is not None and r is not None, "חסר payment או remainder."
    assert VARS.get("first_payment") == p + r, (
        f"first_payment יצא {VARS.get('first_payment')} "
        f"ואמור להיות {p} ועוד {r}."
    )


def test_check_total_matches():
    """חלק ב': הסכום חוזר מהפריסה בדיוק"""
    # ⚠️ **זו הבדיקה שמלמדת את השיעור האמיתי של השבוע.** פריסה שלא
    #    מחזירה את הסכום המקורי היא פריסה שאיבדה או המציאה כסף.
    total = VARS.get("check_total")
    amount = VARS.get("purchase_amount")
    assert total is not None, (
        "חסר המשתנה check_total. חלק ב' מבקש להוכיח שלא אבד כסף."
    )
    assert total == amount, (
        f"check_total יצא {total} וסכום הרכישה הוא {amount}. "
        "הפריסה שלך מאבדת או ממציאה כסף — תמצא את השורה, "
        "אל תתקן את המספר."
    )


def test_check_labels():
    """חלק ב': שתי השורות מודפסות עם התוויות"""
    missing = [label for label in ["תשלום ראשון:", "סך הכול:"]
               if label not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"


# ── חלק ג' ────────────────────────────────────────────────────────────

def test_agorot_variables():
    """חלק ג': משתני האגורות קיימים"""
    missing = [n for n in ["total_agorot", "shekels", "agorot"]
               if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_agorot_split():
    """חלק ג': הפירוק לשקלים ולאגורות"""
    t = VARS.get("total_agorot")
    assert t is not None, "חסר total_agorot."
    assert VARS.get("shekels") == t // 100, (
        f"shekels יצא {VARS.get('shekels')} ואמור להיות {t // 100}. "
        "בשקל מאה אגורות."
    )
    assert VARS.get("agorot") == t % 100, (
        f"agorot יצא {VARS.get('agorot')} ואמור להיות {t % 100}."
    )


def test_agorot_labels():
    """חלק ג': שתי השורות מודפסות עם התוויות"""
    missing = [label for label in ["שקלים:", "אגורות:"]
               if label not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"
