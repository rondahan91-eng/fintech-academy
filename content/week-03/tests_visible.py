# בדיקות גלויות — שבוע 3
# התלמיד מריץ אותן כמה שירצה. מכסות את המקרה הבסיסי בלבד.
#
# זמין: OUTPUT · LINES · VARS


def test_variables_exist():
    required = ["customer_name", "account_number", "age", "gross_salary", "is_active"]
    missing = [n for n in required if n not in VARS]
    assert not missing, (
        f"חסרים משתנים: {', '.join(missing)}"
    )


def test_account_number_is_text():
    value = VARS.get("account_number")
    assert isinstance(value, str), (
        "account_number אינו מחרוזת. בדוק מה קרה לאפס המוביל."
    )


def test_something_printed():
    assert OUTPUT.strip(), "התוכנית לא הדפיסה כלום."


def test_types_printed():
    assert "class" in OUTPUT, (
        "לא מצאתי הדפסה של טיפוס. חלק ב' מבקש להשתמש ב-type()."
    )
