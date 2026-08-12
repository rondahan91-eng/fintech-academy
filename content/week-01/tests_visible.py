# בדיקות גלויות — שבוע 1
# התלמיד מריץ אותן כמה שירצה. מכסות את המקרה הבסיסי בלבד.
#
# זמין לטסטים:  OUTPUT (כל הפלט כמחרוזת) · LINES (רשימת שורות)


def test_something_printed():
    assert OUTPUT.strip(), (
        "התוכנית לא הדפיסה כלום. ודא שיש בקוד לפחות פקודת print אחת, "
        "ושלחצת על 'הרץ'."
    )


def test_employee_id():
    assert "10427" in OUTPUT, (
        "לא מצאתי את מספר העובד 10427 בפלט."
    )


def test_gross():
    assert "6000" in OUTPUT, (
        "לא מצאתי את סכום הברוטו 6000 בפלט."
    )


def test_has_several_lines():
    real_lines = [ln for ln in LINES if ln.strip()]
    assert len(real_lines) >= 6, (
        f"מצאתי רק {len(real_lines)} שורות עם תוכן. "
        "כרטיס העובד והתלוש יחד אמורים לתפוס יותר. "
        "כל פרט בשורה נפרדת."
    )
