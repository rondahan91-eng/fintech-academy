# בדיקות גלויות — שבוע 4
#
# ⛔ **שורה לכל חלק של המשימה.** מד ההתקדמות שהתלמיד רואה הוא מספר
#    הבדיקות שעברו, ולכן כיסוי חלקי משדר "סיימת" למי שסיים שליש.
#
# ⚠️ **חלק ג' נבדק מול החישוב ולא מול מספר קבוע.** השיעור האפקטיבי
#    נגזר מהערכים של התלמיד עצמו, ולכן מי שהקליד מספר במקום לחשב
#    ייתפס גם כאן ולא רק בנסתרות.
#
# זמין: OUTPUT · LINES · VARS


def test_something_printed():
    """התוכנית מדפיסה משהו"""
    assert OUTPUT.strip(), "התוכנית לא הדפיסה כלום."


# ── חלק א' ────────────────────────────────────────────────────────────

def test_commission_variables():
    """חלק א': משתני העמלה קיימים"""
    missing = [n for n in ["transfer_amount", "commission_rate", "commission"]
               if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_commission_rate_is_fraction():
    """חלק א': שיעור העמלה נכתב כחלק ממאה"""
    assert VARS.get("commission_rate") == 0.004, (
        "commission_rate: 0.4% נכתב כ-0.004"
    )


def test_commission_value():
    """חלק א': העמלה חושבה"""
    value = VARS.get("commission")
    assert value is not None and abs(value - 10.0) < 0.01, (
        f"commission יצא {value}. בדוק את ההכפלה מול סכום ההעברה."
    )


# ── חלק ב' ────────────────────────────────────────────────────────────

def test_payslip_variables():
    """חלק ב': משתני התלוש קיימים"""
    # ⚠️ הסדר כאן שונה מזה שבבדיקות הנסתרות **בכוונה**: שער הדליפה
    #    ב-build_app_content משווה שורות, ורשימה זהה הייתה נראית לו
    #    כמו העתקה של קובץ שאסור שיגיע לדפדפן.
    needed = ["gross_salary", "income_tax", "national_insurance",
              "net_salary", "tax_rate", "national_insurance_rate"]
    missing = [n for n in needed if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_rates_are_fractions():
    """חלק ב': שיעורי הניכוי נכתבו כחלק ממאה"""
    assert VARS.get("tax_rate") == 0.15, "tax_rate: 15% נכתב כ-0.15"
    assert VARS.get("national_insurance_rate") == 0.035, (
        "national_insurance_rate: 3.5% נכתב כ-0.035"
    )


def test_net_is_correct_amount():
    """חלק ב': הנטו חושב נכון"""
    value = VARS.get("net_salary")
    assert value is not None and abs(value - 4890.0) < 0.01, (
        f"net_salary יצא {value} ואמור לצאת 4890."
    )


def test_payslip_printed():
    """חלק ב': התלוש מודפס"""
    assert "6000" in OUTPUT and "4890" in OUTPUT, (
        "התלוש אמור להציג גם את הברוטו וגם את הנטו."
    )


# ── חלק ג' ────────────────────────────────────────────────────────────

def test_effective_rate_computed():
    """חלק ג': שיעור הניכוי חושב ועוגל"""
    rate = VARS.get("effective_rate")
    assert rate is not None, (
        "חסר המשתנה effective_rate. חלק ג' מבקש לחשב אותו ולשמור בו."
    )
    gross = VARS.get("gross_salary")
    tax = VARS.get("income_tax")
    ni = VARS.get("national_insurance")
    assert None not in (gross, tax, ni), (
        "כדי לחשב את שיעור הניכוי צריך את הברוטו ואת שני הניכויים."
    )
    expected = round((tax + ni) / gross * 100, 1)
    assert abs(rate - expected) < 0.05, (
        f"effective_rate יצא {rate} ולא מתאים לניכויים שחישבת. "
        "בדוק את הסוגריים בנוסחה ואת העיגול לספרה אחת."
    )


def test_effective_rate_printed():
    """חלק ג': שיעור הניכוי מודפס"""
    rate = VARS.get("effective_rate")
    assert rate is not None and str(rate) in OUTPUT, (
        "לא מצאתי את שיעור הניכוי בפלט. המשימה מבקשת גם להדפיס אותו."
    )
