# פתרון ייחוס להרחבה — שבוע 3
#
# לא נחשף לתלמידים. ⚠️ **חייב לעבור את שתי קבוצות הבדיקות יחד** —
# tests_visible.py ו-tests_extension.py — כי בדפדפן הן רצות על אותה
# תוכנית. פתרון שעובר רק את בדיקות ההרחבה אינו מוכיח כלום, וזו
# בדיוק הטעות שהחביאה התנגשות בין ההעלאה השבועית להעלאה שבהרחבה.
#
#     py tools/check_extension.py 3

# --- חלק א': פתיחת התיק ---

customer_name = "רותם אזולאי"
account_number = "0521147"     # מחרוזת — האפס המוביל חייב להישמר
age = 34
gross_salary = 12500.5
is_active = False

print("=== תיק לקוח ===")
print("שם:", customer_name)
print("מספר חשבון:", account_number)
print("גיל:", age)
print("שכר ברוטו:", gross_salary)
print("חשבון פעיל:", is_active)

# --- חלק ב': בדיקת טיפוסים ---

print()
print("=== טיפוסי הנתונים ===")
print("שם:", type(customer_name))
print("מספר חשבון:", type(account_number))
print("גיל:", type(age))
print("שכר ברוטו:", type(gross_salary))
print("חשבון פעיל:", type(is_active))

# --- חלק ג': עדכון התיק ---

is_active = True
gross_salary = 13750.5

print()
print("=== התיק לאחר עדכון ===")
print("שם:", customer_name)
print("מספר חשבון:", account_number)
print("גיל:", age)
print("שכר ברוטו:", gross_salary)
print("חשבון פעיל:", is_active)

# ══ ההרחבה ══════════════════════════════════════════════════════════

# --- הרחבה, חלק א': התיק השני ---

customer2_name = "רן מזרחי"
customer2_account = "0783029"   # יתוקן בחלק ג' של ההרחבה
customer2_age = 51
customer2_salary = 21400.0
customer2_active = True
customer2_since = 2011
customer2_credit = False

print()
print("=== תיק לקוח · רן מזרחי ===")
print("שם:", customer2_name)
print("מספר חשבון:", customer2_account)
print("גיל:", customer2_age)
print("שכר ברוטו:", customer2_salary)
print("חשבון פעיל:", customer2_active)
print("שנת הצטרפות:", customer2_since)
print("ביקש אשראי:", customer2_credit)

# --- הרחבה, חלק ב': השוואת טיפוסים ---

print()
print("=== השוואת טיפוסים ===")
print("שם · רותם:", type(customer_name), "· רן:", type(customer2_name))
print("מספר חשבון · רותם:", type(account_number),
      "· רן:", type(customer2_account))
print("גיל · רותם:", type(age), "· רן:", type(customer2_age))
print("שכר · רותם:", type(gross_salary), "· רן:", type(customer2_salary))

# --- הרחבה, חלק ג': יום של שינויים ---

customer2_credit = True
age = 35                        # יום הולדת — ולא נגיעה בשכר
customer2_account = "0783092"   # שתי הספרות האחרונות התחלפו

print()
print("=== שני התיקים אחרי העדכונים ===")
print("שם:", customer_name)
print("מספר חשבון:", account_number)
print("גיל:", age)
print("שכר ברוטו:", gross_salary)
print("חשבון פעיל:", is_active)

print("שם:", customer2_name)
print("מספר חשבון:", customer2_account)
print("גיל:", customer2_age)
print("שכר ברוטו:", customer2_salary)
print("חשבון פעיל:", customer2_active)
print("שנת הצטרפות:", customer2_since)
print("ביקש אשראי:", customer2_credit)
