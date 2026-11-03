# פתרון ייחוס להרחבה — שבוע 5
#
# לא נחשף לתלמידים. ⚠️ **חייב לעבור את שתי קבוצות הבדיקות יחד** —
# tests_visible.py ו-tests_extension.py — כי בדפדפן הן רצות על אותה
# תוכנית.
#
#     py tools/check_extension.py 5

# --- חלק א': הפריסה ---

purchase_amount = 4850
payments_count = 6

payment = purchase_amount // payments_count
remainder = purchase_amount % payments_count

print("=== פריסה לתשלומים ===")
print("סכום הרכישה:", purchase_amount)
print("מספר תשלומים:", payments_count)
print("תשלום רגיל:", payment)
print("שארית:", remainder)

# --- חלק ב': לאן הולכת השארית ---

first_payment = payment + remainder
check_total = first_payment + payment * (payments_count - 1)

print()
print("=== בדיקת הפריסה ===")
print("תשלום ראשון:", first_payment)
print("סך הכול:", check_total)

# --- חלק ג': אגורות ---

total_agorot = 128745

shekels = total_agorot // 100
agorot = total_agorot % 100

print()
print("=== פירוק אגורות ===")
print("שקלים:", shekels)
print("אגורות:", agorot)

# ══ ההרחבה ══════════════════════════════════════════════════════════

# --- הרחבה, חלק א': לקוח שני ---

purchase_amount2 = 7230
payments_count2 = 7

payment2 = purchase_amount2 // payments_count2
remainder2 = purchase_amount2 % payments_count2
first_payment2 = payment2 + remainder2
check_total2 = first_payment2 + payment2 * (payments_count2 - 1)

print()
print("=== פריסה · הלקוח השני ===")
print("תשלום רגיל:", payment2)
print("שארית:", remainder2)
print("תשלום ראשון:", first_payment2)
print("סך הכול:", check_total2)

# --- הרחבה, חלק ב': השוואה ---

print()
print("=== השוואה ===")
print("תשלום רגיל · ראשון:", payment, "· שני:", payment2)
print("שארית · ראשון:", remainder, "· שני:", remainder2)

# --- הרחבה, חלק ג': עמלת טיפול ---
# ⚠️ אותם אופרטורים, אבל כאן סופרים אירועים בתוך טווח ולא מחלקים כסף.

fee_times = payments_count2 // 3
payments_without_fee = payments_count2 % 3

print()
print("=== עמלת טיפול ===")
print("עמלות טיפול:", fee_times)
print("תשלומים בלי עמלה:", payments_without_fee)
