# פתרון ייחוס — שבוע 6
#
# לא נחשף לתלמידים. נבדק מול tests_visible.py:
#
#     py tools/check_extension.py 6

principal = 12000
annual_rate = 0.035
years = 4

# --- חלק א': ריבית פשוטה ---

simple_interest = principal * annual_rate * years
simple_total = principal + simple_interest

print("=== ריבית פשוטה ===")
print("ריבית פשוטה:", round(simple_interest, 2))
print("סך הכול פשוטה:", round(simple_total, 2))

# --- חלק ב': ריבית דריבית ---
# ⚠️ pow ולא **. שתיהן מחזירות אותו float, וההבדל הוא ברובריקה.

compound_total = principal * pow(1 + annual_rate, years)
compound_interest = compound_total - principal
gap = abs(compound_interest - simple_interest)

print()
print("=== ריבית דריבית ===")
print("ריבית דריבית:", round(compound_interest, 2))
print("סך הכול בדריבית:", round(compound_total, 2))
print("ההפרש:", round(gap, 2))

# --- חלק ג': תקרת התשלום ---
# ⚠️ min הוא תקרה, max הוא רצפה. אין if השבוע, ולא צריך.

cap = 1500

paid_now = min(compound_interest, cap)
left_for_next = max(compound_interest - paid_now, 0)

left_agorot = round(left_for_next * 100)
shekels, agorot = divmod(left_agorot, 100)

print()
print("=== ההעברה ===")
print("משולם עכשיו:", round(paid_now, 2))
print("נשאר להעברה הבאה:", round(left_for_next, 2))
print("שקלים:", shekels)
print("אגורות:", agorot)
