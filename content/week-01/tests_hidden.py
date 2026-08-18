# בדיקות נסתרות — שבוע 1
# קובעות ניקוד. לא נחשפות לתלמיד אלא בקניית הפריט מהחנות.
#
# כלל ניסוח: הודעת כישלון אומרת מה חסר — לעולם לא איך לתקן.

import re


def _numbers_in_output():
    """כל המספרים שהופיעו בפלט, בלי תלות בפסיקים או ברווחים."""
    cleaned = OUTPUT.replace(",", "")
    return [int(n) for n in re.findall(r"\d+", cleaned)]


# --- חלק א': כרטיס עובד ---

def test_employee_id_present():
    assert 10427 in _numbers_in_output(), (
        "לא מצאתי את מספר העובד בפלט."
    )


def test_role_present():
    assert "מפתח זוטר" in OUTPUT, (
        "לא מצאתי את התפקיד בכרטיס העובד."
    )


def test_department_present():
    assert "מערכות ליבה" in OUTPUT, (
        "לא מצאתי את המחלקה בכרטיס העובד."
    )


# --- חלק ב': תלוש ---

def test_gross_present():
    assert 6000 in _numbers_in_output(), (
        "לא מצאתי את סכום הברוטו בתלוש."
    )


def test_income_tax_present():
    assert 900 in _numbers_in_output(), (
        "לא מצאתי את סכום מס ההכנסה בתלוש."
    )


def test_national_insurance_present():
    assert 210 in _numbers_in_output(), (
        "לא מצאתי את סכום ביטוח הלאומי בתלוש."
    )


def test_net_is_correct():
    """הבדיקה היחידה שדורשת חשיבה ולא העתקה."""
    nums = _numbers_in_output()
    assert 4890 in nums, (
        "סכום הנטו שהדפסת אינו נכון. "
        "הנטו הוא מה שנשאר מהברוטו אחרי שמורידים את כל הניכויים — "
        "בדוק שהורדת את שניהם."
    )


# --- מבנה ---

def test_lines_are_separate():
    """שבעה פרטים לפחות, כל אחד בשורה משלו."""
    real_lines = [ln for ln in LINES if ln.strip()]
    assert len(real_lines) >= 7, (
        f"מצאתי {len(real_lines)} שורות עם תוכן, ומצופות לפחות 7. "
        "כל פרט אמור להיות בשורה נפרדת."
    )


def test_net_not_on_same_line_as_gross():
    """מונע 'print(6000, 900, 210, 4890)' כפתרון בשורה אחת."""
    for line in LINES:
        digits = re.findall(r"\d+", line.replace(",", ""))
        assert len(digits) < 3, (
            "מצאתי שורה אחת שמכילה שלושה מספרים או יותר. "
            "תלוש משכורת מציג כל שורה בנפרד — ברוטו, כל ניכוי, ונטו."
        )
