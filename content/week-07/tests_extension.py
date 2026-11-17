# בדיקות ההרחבה — שבוע 7
#
# ⚠️ **גלויות לתלמיד שקיבל את ההרחבה**, ורצות לצד הבדיקות השבועיות
#    על אותה תוכנית — ראה tools/check_extension.py.
#
# זמין: OUTPUT · LINES · VARS

CENT = 0.01

SECOND = ["income2", "amount2", "months2",
          "monthly2", "max_monthly2", "approved_monthly2",
          "real_months2", "last_payment2"]


def _get(name):
    assert name in VARS, f"לא מצאתי משתנה בשם {name}."
    return VARS[name]


def test_second_variables():
    """שמונת משתני הבקשה השנייה קיימים"""
    missing = [n for n in SECOND if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_second_input_converted():
    """שלושת נתוני הקלט הומרו למספרים שלמים"""
    for name, value in (("income2", 12000), ("amount2", 21000), ("months2", 12)):
        got = _get(name)
        assert isinstance(got, int) and not isinstance(got, bool), (
            f"{name} הוא {type(got).__name__} ולא מספר שלם."
        )
        assert got == value, (
            f"{name} יצא {got}. ⚠️ אם קיבלת כאן ערך של הבקשה הראשונה — "
            "שלוש הקריאות ל-input של ההרחבה חייבות לבוא אחרי החמש שלה."
        )


def test_second_monthly():
    """ההחזר המבוקש של השני"""
    expected = _get("amount2") / _get("months2")
    assert abs(_get("monthly2") - expected) < CENT, (
        f"monthly2 יצא {_get('monthly2')}, והחישוב נותן {expected}."
    )


def test_second_cap():
    """התקרה שלו היא שליש מההכנסה שלו, בשקלים שלמים"""
    value = _get("max_monthly2")
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"max_monthly2 הוא {type(value).__name__} ולא מספר שלם."
    )
    assert value == _get("income2") // 3, (
        f"max_monthly2 יצא {value}, ושליש מ-{_get('income2')} בשקלים שלמים "
        f"הוא {_get('income2') // 3}."
    )


def test_second_approved_is_the_request():
    """אצלו התקרה אינה נוגעת, ולכן מאושר מה שביקש"""
    # ⚠️ **זה הלב של ההרחבה.** אותה שורת min נתנה כאן את הצד השני,
    #    בלי שום תנאי ובלי שורה נוספת.
    expected = min(_get("monthly2"), _get("max_monthly2"))
    assert abs(_get("approved_monthly2") - expected) < CENT, (
        f"approved_monthly2 יצא {_get('approved_monthly2')}, "
        f"והקטן מבין השניים הוא {expected}."
    )
    assert abs(_get("approved_monthly2") - _get("monthly2")) < CENT, (
        "אצל המבקש השני ההכנסה גבוהה והתקרה אינה נוגעת — "
        "ההחזר המאושר אמור להיות בדיוק מה שביקש."
    )


def test_second_split_adds_up():
    """הפריסה שלו מחזירה את הסכום במדויק"""
    total = _get("real_months2") * _get("approved_monthly2") + _get("last_payment2")
    assert abs(total - _get("amount2")) < CENT, (
        f"הפריסה נותנת {total} והסכום המבוקש הוא {_get('amount2')}."
    )


def test_second_printed():
    """שתי שורות הבקשה השנייה מודפסות"""
    missing = [lbl for lbl in ["החזר מאושר · שני:", "פריסה · שני:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות שורות: {', '.join(missing)}"


def test_first_request_untouched():
    """הבקשה הראשונה נשארה כפי שהמשימה קבעה"""
    assert _get("income") == 4200 and _get("amount") == 15000, (
        "הנתונים של הבקשה הראשונה השתנו. ההרחבה מוסיפה בקשה שנייה "
        "ואינה נוגעת בראשונה."
    )
