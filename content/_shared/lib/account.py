"""
מחלקת Account — מודול הליבה של הבנק.

קוד תשתית. **התלמיד משתמש במחלקה ואינו כותב אותה** — כתיבת מחלקות
היא פרק 8 בסילבוס, כיתה יא'.

הפלטפורמה מזריקה את הקובץ לסביבת ההרצה לפני קוד התלמיד. הממשק
מתועד לתלמיד ב-content/week-02/task.md; המימוש עצמו אינו מוצג לו,
כי הוא עושה שימוש ב-self, ב-__init__ ובתחביר מחלקה שטרם נלמדו.

סעיפי הסילבוס שהמחלקה משרתת: פרק 1, סעיפים 6, 7 (ללא ההיבט המרחבי),
8, 9.
"""


class Account:
    """חשבון בנק. כל מופע מנהל יתרה והיסטוריית תנועות משלו."""

    def __init__(self, owner, balance=0):
        self._owner = owner
        self._balance = balance
        self._history = [f'פתיחת חשבון ביתרה {balance} ש"ח']

    # --- שאילתות ---

    def owner(self):
        """שם בעל החשבון."""
        return self._owner

    def balance(self):
        """היתרה הנוכחית. עשויה להיות שלילית."""
        return self._balance

    def is_overdrawn(self):
        """האם החשבון ביתרת חובה."""
        return self._balance < 0

    def statement(self):
        """תדפיס חשבון מלא, כמחרוזת מרובת שורות."""
        line = "-" * 32
        rows = "\n".join(self._history)
        return (
            f"תדפיס חשבון — {self._owner}\n"
            f"{line}\n"
            f"{rows}\n"
            f"{line}\n"
            f'יתרה: {self._balance} ש"ח'
        )

    # --- פעולות ---

    def deposit(self, amount):
        """הפקדה לחשבון."""
        self._balance += amount
        self._history.append(f'הפקדה {amount} ש"ח')

    def withdraw(self, amount):
        """משיכה מהחשבון. מותרת גם אל תוך יתרת חובה."""
        self._balance -= amount
        self._history.append(f'משיכה {amount} ש"ח')

    def transfer_to(self, other, amount):
        """העברה לחשבון אחר. מעדכנת את שני החשבונות."""
        self._balance -= amount
        self._history.append(f'העברה ל{other.owner()} — {amount} ש"ח')

        other._balance += amount
        other._history.append(f'העברה מ{self._owner} — {amount} ש"ח')
