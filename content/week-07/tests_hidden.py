# בדיקות נסתרות — שבוע 7
# קובעות ניקוד. לא נחשפות לתלמיד אלא בקניית הפריט מהחנות.
#
# זמין: OUTPUT · LINES · VARS
#
# ⚠️ **הציר הוא הטיפוס.** ‏input() מחזיר מחרוזת, ותלמיד שלא המיר
#    מקבל "15000". על מחרוזות // ו-% זורקים שגיאה, אבל min **עובד**
#    ומשווה לפי סדר אלפביתי — כלומר התוכנית רצה ונותנת שטות.
#
# ⚠️ **נוסח שונה מהבדיקות הגלויות בכוונה.** שער הדליפה ב-
#    build_app_content.py מחפש שורות של הקובץ הזה בתוך החבילה
#    שנשלחת לדפדפן, ושורה זהה לשורה גלויה נספרת כדליפה.

TOL = 0.01

NEEDED = ["name", "income", "amount", "months", "has_account",
          "monthly", "max_monthly", "approved_monthly",
          "real_months", "last_payment"]


def _v(key):
    assert key in VARS, (
        f"לא מצאתי משתנה בשם {key}. השמות חייבים להיות מדויקים."
    )
    return VARS[key]


def _is_int(key):
    got = _v(key)
    assert isinstance(got, int) and not isinstance(got, bool), (
        f"{key} הוא {type(got).__name__}. נדרש מספר שלם."
    )
    return got


def test_every_variable_exists():
    absent = [k for k in NEEDED if k not in VARS]
    assert not absent, f"חסרים משתנים: {', '.join(absent)}"


# --- הקליטה וההמרות ---

def test_input_was_converted():
    trio = (_is_int("income"), _is_int("amount"), _is_int("months"))
    assert trio == (4200, 15000, 10), (
        f"הנתונים שנקלטו הם {trio} במקום (4200, 15000, 10)."
    )


def test_name_kept_as_text():
    got = _v("name")
    assert isinstance(got, str) and got.strip() == "דנה לוי", (
        f"name הוא {got!r}."
    )


def test_flag_is_true_boolean():
    got = _v("has_account")
    assert isinstance(got, bool), (
        f"has_account הוא {type(got).__name__}. "
        "מחרוזת לא ריקה תמיד אמת — קודם int ואז bool."
    )
    assert got is True


# --- החישוב ---

def test_requested_payment():
    assert abs(_v("monthly") - 1500.0) < TOL, (
        f"monthly יצא {_v('monthly')} במקום 1500.0."
    )


def test_cap_value_and_type():
    assert _is_int("max_monthly") == 1400, (
        f"max_monthly יצא {_v('max_monthly')} במקום 1400."
    )


def test_cap_actually_bound():
    # הלקוחה ביקשה יותר מהמותר, ולכן המאושר הוא התקרה ולא הבקשה.
    assert abs(_v("approved_monthly") - 1400) < TOL, (
        f"approved_monthly יצא {_v('approved_monthly')} במקום 1400."
    )
    assert _v("approved_monthly") <= _v("max_monthly") + TOL


def test_schedule_values():
    assert abs(_v("real_months") - 10) < TOL, (
        f"real_months יצא {_v('real_months')} במקום 10."
    )
    assert abs(_v("last_payment") - 1000) < TOL, (
        f"last_payment יצא {_v('last_payment')} במקום 1000."
    )


def test_schedule_is_consistent():
    built = _v("real_months") * _v("approved_monthly") + _v("last_payment")
    assert abs(built - _v("amount")) < TOL, (
        f"הפריסה מסתכמת ב-{built} ולא ב-{_v('amount')}."
    )


# --- הפלט ---

def test_output_lines():
    wanted = ("שלום", "דנה לוי", "החזר מבוקש:", "החזר מאושר:", "פריסה:")
    absent = [w for w in wanted if w not in OUTPUT]
    assert not absent, f"חסר בפלט: {', '.join(absent)}"


def test_schedule_line_shows_both_numbers():
    """שורת הפריסה מציגה את מספר התשלומים ואת התשלום האחרון"""
    row = [ln for ln in LINES if ln.strip().startswith("פריסה:")]
    assert row, "לא מצאתי שורה שמתחילה ב-'פריסה:'"
    text = row[0]
    assert "10" in text and "1000" in text, (
        f"שורת הפריסה היא '{text.strip()}' וחסר בה אחד משני המספרים."
    )
