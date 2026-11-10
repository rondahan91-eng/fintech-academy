# בדיקות ההרחבה — שבוע 6
#
# ⚠️ **גלויות לתלמיד שקיבל את ההרחבה.** הן נשלחות אליו יחד עם המשימה
#    הנוספת ומשמשות אותו כמד התקדמות, בדיוק כמו הבדיקות השבועיות.
#
# ⚠️ **הן רצות לצד הבדיקות השבועיות על אותה תוכנית.** כל ערך שהמשימה
#    השבועית מקבעת חייב לשרוד גם כאן — ראה tools/check_extension.py.
#
# זמין: OUTPUT · LINES · VARS

CENT = 0.01

QUARTERS = ["q1", "q2", "q3", "q4"]
SECOND = ["principal2", "rate2", "years2",
          "compound_total2", "compound_interest2"]


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


def test_quarter_variables():
    """ארבעת הרבעונים קיימים"""
    missing = [n for n in QUARTERS if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_quarter_values():
    """הסכומים של הרבעונים"""
    for name, value in zip(QUARTERS, [3000, 2500, 4000, 1500]):
        assert _get(name) == value, f"{name} אינו הסכום שבדף ההרחבה."


def test_total_deposits():
    """סך ההפקדות הוא הסכום של ארבעתם"""
    quarters = [_get(n) for n in QUARTERS]
    _close("total_deposits", sum(quarters),
           "sum על ארבעת הרבעונים, עם הסוגריים הפנימיים.")


def test_biggest_and_smallest():
    """הרבעון הגדול והקטן"""
    quarters = [_get(n) for n in QUARTERS]
    assert _get("biggest") == max(quarters), (
        f"biggest יצא {_get('biggest')}, והגדול מבין הרבעונים הוא {max(quarters)}."
    )
    assert _get("smallest") == min(quarters), (
        f"smallest יצא {_get('smallest')}, והקטן הוא {min(quarters)}."
    )


def test_spread():
    """ההפרש בין הגדול לקטן"""
    _close("spread", _get("biggest") - _get("smallest"),
           "ההפרש נבנה משני המשתנים שלך.")


def test_quarter_labels():
    """ארבע שורות הרבעונים מודפסות"""
    missing = [lbl for lbl in ["סך ההפקדות:", "הרבעון הגדול:",
                               "הרבעון הקטן:", "ההפרש בין הרבעונים:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"


def test_second_customer_variables():
    """משתני הלקוח השני קיימים"""
    missing = [n for n in SECOND if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_second_customer_data():
    """הנתונים של הלקוח השני"""
    assert _get("principal2") == 8000, "principal2 אינו הקרן שבהרחבה."
    assert abs(_get("rate2") - 0.042) < 1e-9, "rate2 אינו 4.2%."
    assert _get("years2") == 6, "years2 אינו מספר השנים שבהרחבה."


def test_second_compound():
    """הדריבית של הלקוח השני חושבה בחזקה"""
    p, r, y = _get("principal2"), _get("rate2"), _get("years2")
    _close("compound_total2", p * pow(1 + r, y),
           "אותו חישוב של חלק ב', על הנתונים שלו.")
    assert _get("compound_total2") > p, (
        "compound_total2 אינו גדול מהקרן. הבסיס הוא 1 ועוד הריבית השנתית."
    )
    _close("compound_interest2", _get("compound_total2") - p,
           "הריבית היא מה שנוסף לקרן שלו.")


def test_second_labels():
    """שתי שורות הלקוח השני מודפסות"""
    missing = [lbl for lbl in ["סך הכול · לקוח שני:", "ריבית · לקוח שני:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"


def test_yields():
    """שתי התשואות מעוגלות לספרה אחת"""
    y1 = _get("yield1")
    y2 = _get("yield2")
    assert round(y1, 1) == y1, (
        f"yield1 יצא {y1} ואינו מעוגל לספרה אחת. העיגול נכנס למשתנה."
    )
    assert round(y2, 1) == y2, (
        f"yield2 יצא {y2} ואינו מעוגל לספרה אחת. העיגול נכנס למשתנה."
    )
    _close("yield1", round(_get("compound_interest") / _get("principal") * 100, 1),
           "הריבית שלו חלקי הקרן שלו, כפול מאה.")
    _close("yield2",
           round(_get("compound_interest2") / _get("principal2") * 100, 1),
           "אותו חישוב על הנתונים של השני.")


def test_better_is_the_max():
    """הגבוהה מבין שתי התשואות"""
    # ⚠️ **והבדיקה הזאת אינה תופסת את מי שכתב better = yield2.** נבדק:
    #    התשואה השנייה **היא** הגדולה על הנתונים האלה, ולכן השוואה
    #    ל-max מחזירה אמת בשני המקרים. עם קלט קבוע אין דרך להבדיל.
    #    **זה עובר לרובריקה.**
    assert _get("better") == max(_get("yield1"), _get("yield2")), (
        f"better יצא {_get('better')}, והגדולה מבין השתיים היא "
        f"{max(_get('yield1'), _get('yield2'))}."
    )


def test_yield_labels():
    """שלוש שורות התשואה מודפסות"""
    missing = [lbl for lbl in ["תשואה · ראשון:", "תשואה · שני:",
                               "הגבוהה מביניהן:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות תוויות: {', '.join(missing)}"


def test_first_customer_untouched():
    """הלקוח הראשון נשאר כפי שהמשימה השבועית קבעה"""
    # ⚠️ בלי הבדיקה הזאת תלמיד שישכתב את המשתנים הקיימים יפיל את
    #    הבדיקות השבועיות בלי להבין למה.
    assert _get("principal") == 12000 and _get("years") == 4, (
        "הנתונים של הלקוח הראשון השתנו. ההרחבה מוסיפה לקוח שני "
        "ואינה נוגעת בראשון."
    )
