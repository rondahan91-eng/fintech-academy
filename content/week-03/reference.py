# פתרון ייחוס — שבוע 3
# לא נחשף לתלמידים. משמש לאימות שהטסטים עוברים על פתרון תקין.

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
