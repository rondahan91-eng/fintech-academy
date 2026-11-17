# פתרון ייחוס להרחבה — שבוע 7
#
# ⚠️ **חייב לעבור את שתי קבוצות הבדיקות יחד.**
#
#     py tools/check_extension.py 7

# --- חלק א': קליטת הבקשה ---

name = input()
income = int(input())
amount = int(input())
months = int(input())
has_account = bool(int(input()))

print("=== בקשת הלוואה ===")
print("שלום " + name + ", קיבלנו את הבקשה.")

# --- חלק ב': ההחזר המבוקש ---

monthly = amount / months

# --- חלק ג': הכלל של הבנק ---

max_monthly = income // 3
approved_monthly = min(monthly, max_monthly)

real_months = amount // approved_monthly
last_payment = amount % approved_monthly

print()
print("=== ההחלטה ===")
print("החזר מבוקש:", monthly)
print("החזר מאושר:", approved_monthly)
print("פריסה:", real_months, "תשלומים ועוד", last_payment)

# ══ ההרחבה ══════════════════════════════════════════════════════════
# ⚠️ שלוש הקריאות האלה חייבות לבוא אחרי החמש שלמעלה — input קורא
#    את השורה הבאה בתור.

income2 = int(input())
amount2 = int(input())
months2 = int(input())

monthly2 = amount2 / months2
max_monthly2 = income2 // 3
approved_monthly2 = min(monthly2, max_monthly2)

real_months2 = amount2 // approved_monthly2
last_payment2 = amount2 % approved_monthly2

print()
print("=== הבקשה השנייה ===")
print("החזר מאושר · שני:", approved_monthly2)
print("פריסה · שני:", real_months2, "תשלומים ועוד", last_payment2)
