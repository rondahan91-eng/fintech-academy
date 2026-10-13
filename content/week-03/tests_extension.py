# בדיקות ההרחבה — שבוע 3
#
# ⚠️ **גלויות לתלמיד שקיבל את ההרחבה.** הן נשלחות אליו יחד עם המשימה
#    הנוספת, ומשמשות אותו כמד התקדמות — בדיוק כמו הבדיקות של המשימה
#    השבועית.
#
# זמין: OUTPUT · LINES · VARS

SECOND = ["customer2_name", "customer2_account", "customer2_age",
          "customer2_salary", "customer2_active", "customer2_since",
          "customer2_credit"]


def test_second_customer_variables():
    """שבעת המשתנים של הלקוח השני קיימים"""
    missing = [n for n in SECOND if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_second_account_is_text():
    """מספר החשבון של הלקוח השני נשמר כטקסט"""
    assert isinstance(VARS.get("customer2_account"), str), (
        "customer2_account אינו מחרוזת. אותו שיקול כמו בלקוח הראשון."
    )


def test_since_is_whole_number():
    """שנת ההצטרפות נשמרת כמספר שלם"""
    value = VARS.get("customer2_since")
    assert isinstance(value, int) and not isinstance(value, bool), (
        "customer2_since אינו מספר שלם. שנה היא כמות שסופרים בה, "
        "לא מזהה."
    )


def test_credit_is_boolean():
    """בקשת האשראי נשמרת כערך בוליאני"""
    assert isinstance(VARS.get("customer2_credit"), bool), (
        "customer2_credit אינו בוליאני. שאלה שהתשובה לה כן או לא."
    )


def test_second_card_labels():
    """הכרטיס השני מודפס באותה תבנית"""
    missing = [label for label in ["שנת הצטרפות:", "ביקש אשראי:"]
               if label not in OUTPUT]
    assert not missing, (
        f"חסרות תוויות בכרטיס השני: {', '.join(missing)}"
    )
    assert "רן מזרחי" in OUTPUT, "לא מצאתי את שם הלקוח השני בפלט."


def test_type_table_printed():
    """טבלת ההשוואה מודפסת"""
    # ארבעה שדות × שני לקוחות = שמונה הדפסות טיפוס לפחות, בנוסף
    # לחמש של המשימה השבועית.
    assert OUTPUT.count("class") >= 13, (
        "לא מצאתי את טבלת ההשוואה. היא מציגה את הטיפוס של ארבעה "
        "שדות אצל שני הלקוחות."
    )


def test_credit_updated():
    """העדכון: רן ביקש אשראי"""
    assert VARS.get("customer2_credit") is True, (
        "customer2_credit אינו True בסוף התוכנית."
    )


def test_rotem_second_raise():
    """העדכון: ההעלאה הנוספת של רותם"""
    assert VARS.get("gross_salary") == 14200.5, (
        "gross_salary אינו מחזיק את השכר שאחרי ההעלאה הנוספת."
    )


def test_account_number_corrected():
    """העדכון: מספר החשבון השגוי תוקן"""
    assert VARS.get("customer2_account") == "0783092", (
        "customer2_account אינו המספר המתוקן. שים לב לשתי הספרות "
        "האחרונות, ולאפס שבהתחלה."
    )


def test_both_cards_reprinted():
    """שני הכרטיסים מודפסים שוב בסוף"""
    assert OUTPUT.count("רותם אזולאי") >= 3, (
        "הכרטיס של רותם אמור להופיע שלוש פעמים: פתיחה, עדכון, "
        "ועדכון ההרחבה."
    )
    assert OUTPUT.count("רן מזרחי") >= 2, (
        "הכרטיס של רן אמור להופיע פעמיים: פתיחה ואחרי העדכונים."
    )
