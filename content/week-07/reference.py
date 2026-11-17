# פתרון ייחוס — שבוע 7
#
# לא נחשף לתלמידים.
#
#     py tools/check_extension.py 7
#
# ⚠️ **הקלט מגיע מ-stdin.** הבודק מזין את meta.yml → stdin, ובדפדפן
#    זה טאב "קלט". חמש שורות, לפי הסדר.

# --- חלק א': קליטת הבקשה ---

name = input()
income = int(input())
amount = int(input())
months = int(input())
# ⚠️ שתי המרות: "0" כמחרוזת הוא True. קודם int, ואז bool.
has_account = bool(int(input()))

print("=== בקשת הלוואה ===")
print("שלום " + name + ", קיבלנו את הבקשה.")

# --- חלק ב': ההחזר המבוקש ---

monthly = amount / months

# --- חלק ג': הכלל של הבנק ---
# ⚠️ min במקום if. שליש מההכנסה, בשקלים שלמים.

max_monthly = income // 3
approved_monthly = min(monthly, max_monthly)

real_months = amount // approved_monthly
last_payment = amount % approved_monthly

print()
print("=== ההחלטה ===")
print("החזר מבוקש:", monthly)
print("החזר מאושר:", approved_monthly)
print("פריסה:", real_months, "תשלומים ועוד", last_payment)
