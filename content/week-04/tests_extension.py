# בדיקות ההרחבה — שבוע 4
#
# ⚠️ **נבדק החישוב, לא המספר.** כל ערך נבדק מול המשתנים של התלמיד
#    עצמו, כך שמי שהקליד תוצאה נופל כאן בדיוק כמו בבדיקות השבועיות.
#
# זמין: OUTPUT · LINES · VARS

# ⚠️ **שני שמות לכל אחד משני המשתנים האלה, וזה תיקון ולא רשלנות.**
#    המשימה השבועית קוראת למשתנים gross_salary ו-net_salary, וההרחבה
#    ביקשה gross2 ו-net2 — בזמן ששני האחרים כן נגזרים מהשם השבועי
#    (income_tax → income_tax2). תלמיד שהסיק את הכלל נכון כתב
#    gross_salary2 ונפל על "חסר משתנה", כשהקוד שלו תקין.
#    השבוע כבר פתוח לכיתה, ולכן **שני השמות מתקבלים**: מי שכתב לפי
#    הכלל צודק, ומי שכתב לפי הטבלה אינו נשבר באמצע.
SECOND = [
    ("gross_salary2", "gross2"),
    ("income_tax2",),
    ("national_insurance2",),
    ("net_salary2", "net2"),
]


def _pick(names):
    """השם הראשון מבין החלופות שהתלמיד באמת הגדיר."""
    for n in names:
        if n in VARS:
            return n
    return None


def _num(name):
    names = (name,) if isinstance(name, str) else name
    found = _pick(names)
    assert found, f"לא מצאתי משתנה בשם {' או '.join(names)}."
    v = VARS.get(found)
    assert isinstance(v, (int, float)) and not isinstance(v, bool), (
        f"{found} אינו מספר."
    )
    return v


def test_second_employee_variables():
    """ארבעת משתני העובד השני קיימים"""
    missing = [" או ".join(opts) for opts in SECOND if not _pick(opts)]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_second_gross():
    """הברוטו של העובד השני"""
    assert _num(("gross_salary2", "gross2")) == 9400, (
        "הברוטו של העובד השני אינו הסכום שבמשימה."
    )


def test_second_deductions_computed():
    """הניכויים שלו חושבו מאותם שיעורים"""
    gross = _num(("gross_salary2", "gross2"))
    tax = _num("income_tax2")
    ni = _num("national_insurance2")
    rate = VARS.get("tax_rate")
    ni_rate = VARS.get("national_insurance_rate")
    assert rate and ni_rate, (
        "לא מצאתי את שיעורי הניכוי. ההרחבה משתמשת באותם משתנים."
    )
    assert abs(tax - gross * rate) < 0.01, (
        "income_tax2 אינו הברוטו של העובד השני כפול שיעור המס."
    )
    assert abs(ni - gross * ni_rate) < 0.01, (
        "national_insurance2 אינו הברוטו שלו כפול שיעור ביטוח לאומי."
    )


def test_second_net():
    """הנטו שלו חושב"""
    expected = _num(("gross_salary2", "gross2")) - _num("income_tax2") - _num("national_insurance2")
    assert abs(_num(("net_salary2", "net2")) - expected) < 0.01, (
        "net2 אינו הברוטו פחות שני הניכויים שחישבת."
    )


def test_second_payslip_printed():
    """התלוש השני מודפס באותן ארבע תוויות"""
    # ⚠️ **נספרות שורות שמתחילות בתווית ולא מופעים במחרוזת.** השורה
    #    "הפרש ברוטו:" מכילה את "ברוטו:", וספירה פשוטה הייתה סופרת
    #    אותה כתלוש שני.
    for lbl in ["ברוטו:", "מס הכנסה:", "ביטוח לאומי:", "נטו:"]:
        rows = [ln for ln in LINES if ln.strip().startswith(lbl)]
        assert len(rows) >= 2, (
            f"התווית '{lbl}' מופיעה בתחילת שורה פעם אחת בלבד. "
            "התלוש של העובד השני מודפס באותן ארבע תוויות."
        )


def test_difference_variables():
    """שני משתני ההפרש קיימים"""
    missing = [n for n in ["gross_diff", "net_diff"] if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_differences_computed():
    """ההפרשים חושבו מהמשתנים שלך"""
    expected_gross = _num(("gross_salary2", "gross2")) - _num("gross_salary")
    assert abs(_num("gross_diff") - expected_gross) < 0.01, (
        "gross_diff אינו הברוטו של העובד השני פחות הברוטו שלך."
    )
    expected_net = _num(("net_salary2", "net2")) - _num("net_salary")
    assert abs(_num("net_diff") - expected_net) < 0.01, (
        "net_diff אינו הנטו שלו פחות הנטו שלך."
    )


def test_difference_lines():
    """שתי שורות ההפרש מודפסות"""
    missing = [lbl for lbl in ["הפרש ברוטו:", "הפרש נטו:"] if lbl not in OUTPUT]
    assert not missing, f"חסרות שורות: {', '.join(missing)}"


def test_fees_exist():
    """שלוש העמלות קיימות"""
    missing = [n for n in ["fee_600", "fee_1000", "fee_2500"] if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_fee_below_threshold():
    """עמלה על סכום שמתחת לסף"""
    assert abs(_num("fee_600") - 4.9) < 0.01, (
        "fee_600 אינה העמלה הקבועה. 600 נמצא מתחת לסף."
    )


def test_fee_above_threshold():
    """עמלה על סכום שמעל הסף"""
    assert abs(_num("fee_2500") - 10.0) < 0.01, (
        "fee_2500 אינה 0.4% מהסכום."
    )


def test_fee_at_threshold_is_consistent():
    """ההחלטה על 1,000 בדיוק עקבית"""
    # ⚠️ **שתי התשובות מתקבלות.** המדיניות כתובה במילים "עד" ו"מעל",
    #    וההכרעה בגבול היא של התלמיד — כל עוד היא אחת משתיהן ולא
    #    מספר שלישי שנשלף מהאוויר.
    fee = _num("fee_1000")
    assert abs(fee - 4.9) < 0.01 or abs(fee - 4.0) < 0.01, (
        f"fee_1000 יצא {fee}. לפי המדיניות הוא יכול להיות העמלה "
        "הקבועה או 0.4% מהסכום — החלט, ושיהיה עקבי."
    )


def test_fees_printed():
    """שלוש שורות העמלה מודפסות"""
    missing = [lbl for lbl in ["עמלה על 600:", "עמלה על 1000:",
                               "עמלה על 2500:"]
               if lbl not in OUTPUT]
    assert not missing, (
        f"חסרות שורות: {', '.join(missing)} — "
        "ראה את טבלת התוויות בחלק ג' של ההרחבה."
    )
