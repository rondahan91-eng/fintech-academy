# בדיקות גלויות — שבוע 6
#
# ⛔ **שורה לכל חלק של המשימה.** מד ההתקדמות שהתלמיד רואה הוא מספר
#    הבדיקות שעברו, ולכן כיסוי חלקי משדר "סיימת" למי שסיים שליש.
#
# ⚠️ **כל השוואה על כסף היא עם סובלנות של אגורה.** ‏12000 * 0.035 * 4
#    מחזיר 1680.0000000000002, ולא 1680 — וזה לא באג של התלמיד אלא
#    הנושא של שבוע 8. השוואה מדויקת כאן הייתה מפילה פתרון נכון.
#
# זמין: OUTPUT · LINES · VARS

CENT = 0.01


def _get(name):
    assert name in VARS, f"לא מצאתי משתנה בשם {name}."
    return VARS[name]


def _close(name, expected, hint=""):
    value = _get(name)
    assert isinstance(value, (int, float)) and not isinstance(value, bool), (
        f"{name} אינו מספר אלא {type(value).__name__}."
    )
    assert abs(value - expected) < CENT, (
        f"{name} יצא {round(value, 2)}, והחישוב נותן {round(expected, 2)}. {hint}"
    )


def test_something_printed():
    """התוכנית מדפיסה משהו"""
    assert OUTPUT.strip(), "התוכנית לא הדפיסה כלום."


def test_source_data():
    """הנתונים הנתונים לא שונו"""
    assert _get("principal") == 12000, "principal אינו הקרן שבמשימה."
    assert abs(_get("annual_rate") - 0.035) < 1e-9, (
        "annual_rate אינו 3.5%. אחוז הוא חלק ממאה — ראה שבוע 4."
    )
    assert _get("years") == 4, "years אינו מספר השנים שבמשימה."


# ── חלק א' ────────────────────────────────────────────────────────────

def test_simple_interest():
    """חלק א': הריבית הפשוטה חושבה על הקרן"""
    p, r, y = _get("principal"), _get("annual_rate"), _get("years")
    _close("simple_interest", p * r * y,
           "ריבית פשוטה היא הקרן כפול השיעור כפול מספר השנים.")


def test_simple_total():
    """חלק א': הסכום בסוף הוא הקרן ועוד הריבית"""
    _close("simple_total", _get("principal") + _get("simple_interest"),
           "הסכום בסוף הוא הקרן ועוד הריבית שהצטברה.")


def test_simple_labels():
    """חלק א': שתי השורות מודפסות עם התוויות"""
    missing = [lbl for lbl in ["ריבית פשוטה:", "סך הכול פשוטה:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"


# ── חלק ב' ────────────────────────────────────────────────────────────

def test_compound_total():
    """חלק ב': הסכום בדריבית חושב בחזקה"""
    p, r, y = _get("principal"), _get("annual_rate"), _get("years")
    _close("compound_total", p * pow(1 + r, y),
           "הקרן כפול (1 ועוד השיעור) בחזקת מספר השנים.")


def test_compound_beats_simple():
    """חלק ב': הדריבית גדולה מהפשוטה"""
    # ⚠️ הבדיקה שתופסת את הטעות הנפוצה: העלאה בחזקה של השיעור לבדו,
    #    בלי ה-1. שם התוצאה זעירה, והסכום יוצא קטן מהקרן.
    assert _get("compound_total") > _get("simple_total"), (
        f"compound_total יצא {round(_get('compound_total'), 2)} והוא אינו גדול "
        f"מ-{round(_get('simple_total'), 2)}. בדוק שהעלית בחזקה את "
        "1 ועוד השיעור, ולא את השיעור לבדו."
    )


def test_compound_interest():
    """חלק ב': הריבית בדריבית היא הסכום פחות הקרן"""
    _close("compound_interest", _get("compound_total") - _get("principal"),
           "הריבית היא מה שנוסף לקרן.")


def test_gap_is_absolute():
    """חלק ב': ההפרש חושב בלי סימן"""
    expected = abs(_get("compound_interest") - _get("simple_interest"))
    _close("gap", expected, "ההפרש בין שתי הריביות, בערך מוחלט.")
    assert _get("gap") >= 0, "gap יצא שלילי. abs מחזיר את הגודל בלי הסימן."


def test_compound_labels():
    """חלק ב': שלוש השורות מודפסות עם התוויות"""
    missing = [lbl for lbl in ["ריבית דריבית:", "סך הכול בדריבית:", "ההפרש:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"


# ── חלק ג' ────────────────────────────────────────────────────────────

def test_cap_applied():
    """חלק ג': התשלום עכשיו הוא הקטן מבין הריבית והתקרה"""
    assert _get("cap") == 1500, "cap אינו התקרה שבמשימה."
    _close("paid_now", min(_get("compound_interest"), _get("cap")),
           "תקרה היא min, לא חיסור.")


def test_left_for_next():
    """חלק ג': מה שנשאר אינו יורד מתחת לאפס"""
    expected = max(_get("compound_interest") - _get("paid_now"), 0)
    _close("left_for_next", expected, "רצפה היא max מול אפס.")
    assert _get("left_for_next") >= 0, "left_for_next יצא שלילי."


def test_divmod_parts():
    """חלק ג': מה שנשאר פורק לשקלים ולאגורות"""
    agorot_total = _get("left_agorot")
    assert isinstance(agorot_total, int) and not isinstance(agorot_total, bool), (
        f"left_agorot הוא {type(agorot_total).__name__} ולא מספר שלם. "
        "אגורה היא יחידה שלמה — round מחזיר שלם כשקוראים לו בלי ספרות."
    )
    expected = divmod(agorot_total, 100)
    assert (_get("shekels"), _get("agorot")) == expected, (
        f"shekels ו-agorot יצאו {(_get('shekels'), _get('agorot'))}, "
        f"ו-divmod של {agorot_total} ב-100 נותן {expected}."
    )


def test_transfer_labels():
    """חלק ג': ארבע השורות מודפסות עם התוויות"""
    missing = [lbl for lbl in ["משולם עכשיו:", "נשאר להעברה הבאה:",
                               "שקלים:", "אגורות:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"
