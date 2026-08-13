# בדיקות גלויות — שבוע 2
# מכסות את חלק א' בלבד. חלקים ב' ו-ג' נבדקים רק בנסתרים.


def test_something_printed():
    assert OUTPUT.strip(), (
        "התוכנית לא הדפיסה כלום. ודא שיש פקודת print, ושלחצת על 'הרץ'."
    )


def test_dana_exists():
    assert "דנה כהן" in OUTPUT, (
        "לא מצאתי את השם של דנה בפלט. הדפסת את acc.owner()?"
    )


def test_dana_balance_after_ops():
    assert "2780" in OUTPUT.replace(",", ""), (
        "לא מצאתי את היתרה של דנה אחרי ההפקדה והמשיכה. "
        "בדוק שביצעת את שתי הפעולות ואז הדפסת את balance()."
    )
