# בדיקות נסתרות — שבוע 2
#
# ההגנה המרכזית: המשימה נותנת פעולות ולא תוצאות, והבדיקות דורשות את
# הפלט של statement(). אי אפשר לנחש את ניסוחו — אפשר רק לזמן אותו.

import re


def _numbers():
    """כל המספרים בפלט, כולל שליליים, בלי תלות בפסיקים."""
    return [int(n) for n in re.findall(r"-?\d+", OUTPUT.replace(",", ""))]


# --- חלק א' ---

def test_dana_owner():
    assert "דנה כהן" in OUTPUT, (
        "לא מצאתי את שם בעלת החשבון הראשון בפלט."
    )


def test_dana_after_deposit_and_withdraw():
    assert 2780 in _numbers(), (
        "לא מצאתי את היתרה של דנה אחרי ההפקדה והמשיכה. "
        "ודא שביצעת את שתי הפעולות לפני שהדפסת."
    )


# --- חלק ב' ---
#
# אין כאן טסט לשם של יואב. המשימה לא מבקשת להדפיס אותו, ולכן טסט
# כזה היה דורש משהו שלא נכתב ב-task.md. שמו מאומת ממילא בכותרת
# התדפיס בחלק ג'. (כלל 3 ב-content/_schema/README.md)


def test_dana_after_transfer():
    assert 2730 in _numbers(), (
        "לא מצאתי את היתרה של דנה אחרי ההעברה."
    )


def test_yoav_after_transfer():
    assert 150 in _numbers(), (
        "לא מצאתי את היתרה של יואב אחרי ההעברה. "
        "בדוק לאיזה כיוון בוצעה ההעברה."
    )


# --- חלק ג' ---

def test_yoav_final_balance_is_negative():
    nums = _numbers()
    assert -2850 in nums, (
        "לא מצאתי את היתרה של יואב אחרי המשיכה הגדולה. "
        "שים לב שהיא אמורה להיות שלילית."
        + (" מצאתי 2850 בלי מינוס — בדוק מה בדיוק הדפסת."
           if 2850 in nums else "")
    )


def test_overdrawn_reported():
    assert "True" in OUTPUT, (
        "לא מצאתי את התוצאה של is_overdrawn() בפלט. "
        "הפעולה מחזירה ערך — צריך להדפיס אותו."
    )


# --- ההגנה: התדפיס המלא ---

def test_statement_header():
    assert "תדפיס חשבון" in OUTPUT, (
        "לא מצאתי את התדפיס המלא של יואב. "
        "צריך להדפיס את התוצאה של statement()."
    )


def test_statement_contains_history():
    """היסטוריית התנועות יכולה להגיע רק מזימון statement()."""
    assert "פתיחת חשבון ביתרה 100" in OUTPUT, (
        "התדפיס של יואב חסר את שורת פתיחת החשבון. "
        "ודא שהדפסת את statement() של החשבון הנכון."
    )
    assert "העברה מדנה כהן" in OUTPUT, (
        "התדפיס של יואב חסר את שורת ההעברה שקיבל מדנה."
    )
    assert 'משיכה 3000 ש"ח' in OUTPUT, (
        "התדפיס של יואב חסר את שורת המשיכה."
    )


def test_used_the_class_not_arithmetic():
    """
    התדפיס מכיל שורות שנוצרות רק בתוך המחלקה. אם הן קיימות —
    התלמיד באמת זימן פעולות ולא חישב בראש והדפיס מספרים.
    """
    markers = ["תדפיס חשבון", "פתיחת חשבון ביתרה", "יתרה:"]
    missing = [m for m in markers if m not in OUTPUT]
    assert not missing, (
        "התדפיס המלא לא הופיע בפלט. המשימה דורשת להריץ את הפעולות "
        "על העצם ולא לחשב את התוצאות בעצמך."
    )
