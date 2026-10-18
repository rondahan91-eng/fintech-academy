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
    """טבלת ההשוואה מודפסת, ארבע שורות"""
    # ⚠️ **נבדקות השורות עצמן ולא ספירת המילה class.** ספירה נכשלה
    #    אצל מי שהדפיס נכון בסדר אחר, והודעת הכישלון לא אמרה כלום.
    missing = [p for p in ["שם · רותם:", "מספר חשבון · רותם:",
                           "גיל · רותם:", "שכר · רותם:"]
               if p not in OUTPUT]
    assert not missing, (
        f"חסרות שורות בטבלת ההשוואה: {', '.join(missing)} — "
        "ראה את ארבע השורות לדוגמה בדף ההרחבה."
    )
    for line in LINES:
        if "· רותם:" in line:
            assert "· רן:" in line, (
                "כל שורה בטבלה מציגה את שני הלקוחות זה לצד זה: "
                f"בשורה '{line.strip()[:40]}' חסר החלק של רן."
            )


def test_credit_updated():
    """העדכון: רן ביקש אשראי"""
    assert VARS.get("customer2_credit") is True, (
        "customer2_credit אינו True בסוף התוכנית."
    )


def test_rotem_birthday():
    """העדכון: יום ההולדת של רותם"""
    assert VARS.get("age") == 35, (
        "age אינו 35 בסוף התוכנית. יום ההולדת מעדכן את המשתנה הקיים."
    )


def test_weekly_salary_untouched():
    """השכר של רותם נשאר כפי שהמשימה השבועית קבעה"""
    # ⚠️ **ההרחבה רצה לצד הבדיקות השבועיות, לא במקומן.** כל ערך
    #    שהמשימה השבועית מקבעת חייב לשרוד גם את ההרחבה — אחרת אין
    #    תוכנית שעוברת את שתי הקבוצות, וזה בדיוק מה שקרה כאן פעם
    #    אחת: ההרחבה ביקשה העלאה נוספת על אותו משתנה.
    assert VARS.get("gross_salary") == 13750.5, (
        "gross_salary השתנה. ההרחבה אינה נוגעת בשכר של רותם — "
        "ההעלאה שלה כבר בוצעה בחלק ג' של המשימה השבועית."
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
