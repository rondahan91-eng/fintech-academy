# פתרון ייחוס — שבוע 5
# לא נחשף לתלמידים. משמש לאימות שהטסטים עוברים על פתרון תקין.

# --- חלק א': הפריסה ---

purchase_amount = 4850
payments_count = 6

payment = purchase_amount // payments_count     # המנה השלמה — 808
remainder = purchase_amount % payments_count    # מה שנשאר — 2

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
