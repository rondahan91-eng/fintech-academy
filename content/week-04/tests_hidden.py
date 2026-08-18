# בדיקות נסתרות — שבוע 4
# קובעות ניקוד. לא נחשפות לתלמיד אלא בקניית הפריט מהחנות.
#
# זמין: OUTPUT · LINES · VARS
#
# ⭐ שבוע ייצור. הקוד הזה ירוץ כדי לחשב תלושים אמיתיים, ולכן
#    הטסטים כאן מקפידים יותר מהרגיל — במיוחד על כך שהערכים
#    **חושבו** ולא הוקלדו.

REQUIRED = [
    "transfer_amount", "commission_rate", "commission",
    "gross_salary", "tax_rate", "national_insurance_rate",
    "income_tax", "national_insurance", "net_salary",
    "effective_rate",
]


def _get(name):
    assert name in VARS, (
        f"לא מצאתי משתנה בשם {name}. "
        "שמות המשתנים חייבים להיות בדיוק כפי שרשום במשימה."
    )
    return VARS[name]


def test_all_variables_exist():
    missing = [n for n in REQUIRED if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


# --- חלק א': עמלה ---

def test_commission_rate_is_a_fraction():
    rate = _get("commission_rate")
    assert rate == 0.004, (
        f"commission_rate הוא {rate}. "
        "0.4% אינו 0.4 — אחוז הוא חלק ממאה."
    )


def test_commission_was_computed():
    value = _get("commission")
    expected = _get("transfer_amount") * _get("commission_rate")
    assert value == expected, (
        f"commission הוא {value}, ומכפלת סכום ההעברה בשיעור העמלה "
        f"נותנת {expected}. העמלה אמורה להיות מחושבת מהם."
    )


# --- חלק ב': שיעורים ---

def test_tax_rate_is_a_fraction():
    rate = _get("tax_rate")
    assert rate == 0.15, (
        f"tax_rate הוא {rate}. 15% נכתב כ-0.15."
    )


def test_national_insurance_rate_is_a_fraction():
    rate = _get("national_insurance_rate")
    assert rate == 0.035, (
        f"national_insurance_rate הוא {rate}. 3.5% נכתב כ-0.035."
    )


# --- חלק ב': הסכומים חושבו ---

def test_income_tax_was_computed():
    value = _get("income_tax")
    expected = _get("gross_salary") * _get("tax_rate")
    assert value == expected, (
        f"income_tax הוא {value}, והברוטו כפול שיעור המס נותן {expected}."
    )


def test_national_insurance_was_computed():
    """
    גלאי ההקלדה של השבוע.

    6000 * 0.035 אינו 210.0 אלא 210.00000000000003. תלמיד שהקליד
    210 ייכשל כאן, ותלמיד שחישב יעבור — בלי שנצטרך להריץ את הקוד
    פעמיים.
    """
    value = _get("national_insurance")
    expected = _get("gross_salary") * _get("national_insurance_rate")

    if value == 210.0:
        raise AssertionError(
            "national_insurance מחזיק בדיוק 210.0. "
            "כשמחשבים 6000 כפול 0.035 המספר שיוצא אינו עגול לגמרי — "
            "נראה שהערך הוקלד ולא חושב. "
            "עגל רק בהדפסה, לא בשמירה."
        )

    assert value == expected, (
        f"national_insurance הוא {value}, "
        f"והברוטו כפול השיעור נותן {expected}."
    )


def test_net_was_computed():
    value = _get("net_salary")
    expected = _get("gross_salary") - _get("income_tax") - _get("national_insurance")
    assert value == expected, (
        f"net_salary הוא {value}, ומה שנשאר מהברוטו אחרי שני "
        f"הניכויים הוא {expected}."
    )


def test_net_is_correct_amount():
    value = _get("net_salary")
    assert abs(value - 4890.0) < 0.01, (
        f"net_salary יצא {value} ואמור לצאת 4890. "
        "בדוק שהורדת את שני הניכויים מהברוטו, ולא אחד מהם."
    )


# --- חלק ג': שיעור אפקטיבי וסוגריים ---

def test_effective_rate_is_correct():
    value = _get("effective_rate")

    if abs(value - 903.5) < 0.5:
        raise AssertionError(
            "effective_rate יצא בערך 903.5. "
            "זה מה שקורה כשמחשבים בלי סוגריים: החילוק והכפל מתבצעים "
            "לפני החיבור. הסוגריים בנוסחה שבמשימה קובעים מה מתחלק במה."
        )

    assert abs(value - 18.5) < 0.05, (
        f"effective_rate יצא {value} ואמור לצאת 18.5."
    )


def test_effective_rate_was_rounded():
    value = _get("effective_rate")
    assert value == round(value, 1), (
        f"effective_rate הוא {value} ואינו מעוגל לספרה אחת."
    )


# --- פלט ---

def test_commission_printed():
    assert "10.0" in OUTPUT or "10 " in OUTPUT, (
        "לא מצאתי את סכום העמלה בפלט."
    )


def test_payslip_printed():
    for token, label in [("6000", "הברוטו"), ("900", "מס ההכנסה"),
                         ("210", "ביטוח הלאומי"), ("4890", "הנטו")]:
        assert token in OUTPUT, f"לא מצאתי את {label} בתלוש המודפס."


def test_effective_rate_printed():
    assert "18.5" in OUTPUT, (
        "לא מצאתי את שיעור הניכוי האפקטיבי בפלט."
    )


def test_raw_float_not_printed():
    """התלוש מוצג לבני אדם, ולכן עובר עיגול."""
    assert "210.00000000000003" not in OUTPUT, (
        "התלוש מציג את ביטוח הלאומי עם זנב ארוך של ספרות. "
        "סכום כסף שמוצג לאדם מעוגל — השאר את הערך המחושב במשתנה "
        "ועגל בהדפסה."
    )
