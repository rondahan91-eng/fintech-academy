# בדיקות ההרחבה — שבוע 5
#
# ⚠️ **גלויות לתלמיד שקיבל את ההרחבה.** הן נשלחות אליו יחד עם המשימה
#    הנוספת ומשמשות אותו כמד התקדמות, בדיוק כמו הבדיקות השבועיות.
#
# ⚠️ **הן רצות לצד הבדיקות השבועיות על אותה תוכנית.** כל ערך שהמשימה
#    השבועית מקבעת חייב לשרוד גם כאן — ראה tools/check_extension.py.
#
# זמין: OUTPUT · LINES · VARS

SECOND = ["purchase_amount2", "payments_count2", "payment2", "remainder2",
          "first_payment2", "check_total2"]


def _get(name):
    assert name in VARS, f"לא מצאתי משתנה בשם {name}."
    return VARS[name]


def _whole(name):
    value = _get(name)
    assert isinstance(value, int) and not isinstance(value, bool), (
        f"{name} הוא {type(value).__name__} ולא מספר שלם. "
        "‏// מחזיר שלם; / מחזיר עשרוני."
    )
    return value


def test_second_variables():
    """ששת משתני הלקוח השני קיימים"""
    missing = [n for n in SECOND if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_second_source_data():
    """הנתונים של הלקוח השני"""
    assert _get("purchase_amount2") == 7230, "purchase_amount2 אינו הסכום שבהרחבה."
    assert _get("payments_count2") == 8, "payments_count2 אינו מספר התשלומים שבהרחבה."


def test_second_split():
    """הפריסה השנייה חושבה ב-// וב-%"""
    amount = _get("purchase_amount2")
    count = _get("payments_count2")
    assert _whole("payment2") == amount // count, (
        f"payment2 יצא {_get('payment2')}, והמנה השלמה היא {amount // count}."
    )
    assert _whole("remainder2") == amount % count, (
        f"remainder2 יצא {_get('remainder2')}, והשארית היא {amount % count}."
    )


def test_second_first_payment():
    """התשלום הראשון בולע את השארית"""
    assert _whole("first_payment2") == _get("payment2") + _get("remainder2"), (
        "first_payment2 אינו התשלום הרגיל ועוד השארית."
    )


def test_second_check_total():
    """הסכום השני חוזר מהפריסה בדיוק"""
    expected = _get("first_payment2") + _get("payment2") * (_get("payments_count2") - 1)
    assert _get("check_total2") == expected, (
        "check_total2 אינו מורכב מהתשלום הראשון ומשאר התשלומים."
    )
    assert _get("check_total2") == _get("purchase_amount2"), (
        f"check_total2 יצא {_get('check_total2')} וסכום הרכישה השני הוא "
        f"{_get('purchase_amount2')}. הפריסה מאבדת או ממציאה כסף."
    )


def test_second_labels():
    """התלוש השני מודפס באותן תוויות"""
    # ⚠️ נספרות שורות שמתחילות בתווית, כי השורות של חלק ב' מכילות
    #    את אותן מילים ("תשלום רגיל · ראשון:") והיו נספרות פעמיים.
    for lbl in ["תשלום רגיל:", "שארית:", "תשלום ראשון:", "סך הכול:"]:
        rows = [ln for ln in LINES if ln.strip().startswith(lbl)]
        assert len(rows) >= 2, (
            f"התווית '{lbl}' מופיעה בתחילת שורה פעם אחת בלבד. "
            "הפריסה של הלקוח השני מודפסת באותן תוויות."
        )


def test_compare_lines():
    """שתי שורות ההשוואה מודפסות"""
    missing = [p for p in ["תשלום רגיל · ראשון:", "שארית · ראשון:"]
               if p not in OUTPUT]
    assert not missing, (
        f"חסרות שורות בהשוואה: {', '.join(missing)} — "
        "ראה את שתי השורות לדוגמה בדף ההרחבה."
    )
    for line in LINES:
        if "· ראשון:" in line:
            assert "· שני:" in line, (
                "כל שורת השוואה מציגה את שתי הפריסות זו מול זו: "
                f"בשורה '{line.strip()[:40]}' חסר החלק של השני."
            )


def test_fee_variables():
    """שני משתני העמלה קיימים"""
    missing = [n for n in ["fee_times", "payments_without_fee"] if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_fee_counts():
    """העמלה נספרה ב-// וב-%"""
    count = _get("payments_count2")
    assert _whole("fee_times") == count // 3, (
        f"fee_times יצא {_get('fee_times')}. על כל שלושה תשלומים "
        f"מתוך {count} נגבית עמלה אחת."
    )
    assert _whole("payments_without_fee") == count % 3, (
        f"payments_without_fee יצא {_get('payments_without_fee')}, "
        f"והשארית של {count} בשלוש היא {count % 3}."
    )


def test_fee_labels():
    """שתי שורות העמלה מודפסות"""
    missing = [lbl for lbl in ["עמלות טיפול:", "תשלומים בלי עמלה:"]
               if lbl not in OUTPUT]
    assert not missing, f"חסרות שורות: {', '.join(missing)}"


def test_weekly_split_untouched():
    """הפריסה הראשונה נשארה כפי שהמשימה השבועית קבעה"""
    # ⚠️ ההרחבה מוסיפה לקוח שני ואינה נוגעת בראשון. בלי הבדיקה הזאת
    #    תלמיד שישכתב את המשתנים הקיימים יפיל את הבדיקות השבועיות
    #    בלי להבין למה.
    assert _get("payment") == 808 and _get("remainder") == 2, (
        "הפריסה של הלקוח הראשון השתנתה. ההרחבה מוסיפה לקוח שני "
        "ואינה נוגעת בראשון."
    )
