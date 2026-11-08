# פתרון ייחוס להרחבה — שבוע 6
#
# לא נחשף לתלמידים. ⚠️ **חייב לעבור את שתי קבוצות הבדיקות יחד** —
# tests_visible.py ו-tests_extension.py — כי בדפדפן הן רצות על אותה
# תוכנית.
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

compound_total = principal * pow(1 + annual_rate, years)
compound_interest = compound_total - principal
gap = abs(compound_interest - simple_interest)

print()
print("=== ריבית דריבית ===")
print("ריבית דריבית:", round(compound_interest, 2))
print("סך הכול בדריבית:", round(compound_total, 2))
print("ההפרש:", round(gap, 2))

# --- חלק ג': תקרת התשלום ---

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

# ══ ההרחבה ══════════════════════════════════════════════════════════

# --- הרחבה, חלק א': ארבעת הרבעונים ---

q1 = 3000
q2 = 2500
q3 = 4000
q4 = 1500

total_deposits = sum((q1, q2, q3, q4))
biggest = max(q1, q2, q3, q4)
smallest = min(q1, q2, q3, q4)
spread = biggest - smallest

print()
print("=== הרבעונים ===")
print("סך ההפקדות:", total_deposits)
print("הרבעון הגדול:", biggest)
print("הרבעון הקטן:", smallest)
print("ההפרש בין הרבעונים:", spread)

# --- הרחבה, חלק ב': הלקוח השני ---

principal2 = 8000
rate2 = 0.042
years2 = 6

compound_total2 = principal2 * pow(1 + rate2, years2)
compound_interest2 = compound_total2 - principal2

print()
print("=== הלקוח השני ===")
print("סך הכול · לקוח שני:", round(compound_total2, 2))
print("ריבית · לקוח שני:", round(compound_interest2, 2))

# --- הרחבה, חלק ג': מי עשה עסקה טובה יותר ---
# ⚠️ הקרן הקטנה יצאה עם התשואה הגדולה — אחוז אינו שקלים.

yield1 = round(compound_interest / principal * 100, 1)
yield2 = round(compound_interest2 / principal2 * 100, 1)
better = max(yield1, yield2)

print()
print("=== תשואה ===")
print("תשואה · ראשון:", yield1)
print("תשואה · שני:", yield2)
print("הגבוהה מביניהן:", better)
