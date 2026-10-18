# פתרון ייחוס להרחבה — שבוע 4
#
# לא נחשף לתלמידים. ⚠️ **חייב לעבור את שתי קבוצות הבדיקות יחד** —
# tests_visible.py ו-tests_extension.py — כי בדפדפן הן רצות על אותה
# תוכנית.
#
#     py tools/check_extension.py 4

# --- חלק א': עמלת העברה ---

transfer_amount = 2500
commission_rate = 0.004
commission = transfer_amount * commission_rate

print("=== עמלת העברה ===")
print("סכום ההעברה:", transfer_amount)
print("עמלה:", commission)

# --- חלק ב': התלוש ---

gross_salary = 6000
tax_rate = 0.15
national_insurance_rate = 0.035

income_tax = gross_salary * tax_rate
national_insurance = gross_salary * national_insurance_rate
net_salary = gross_salary - income_tax - national_insurance

print()
print("=== תלוש משכורת ===")
print("ברוטו:", gross_salary)
print("מס הכנסה:", round(income_tax, 2))
print("ביטוח לאומי:", round(national_insurance, 2))
print("נטו:", round(net_salary, 2))

# --- חלק ג': שיעור הניכוי האפקטיבי ---

effective_rate = round((income_tax + national_insurance) / gross_salary * 100, 1)

print()
print("שיעור ניכוי אפקטיבי:", effective_rate)

# ══ ההרחבה ══════════════════════════════════════════════════════════

# --- הרחבה, חלק א': העובד השני ---
# ⚠️ אותם משתני שיעור, לא מספרים חדשים.

gross2 = 9400
income_tax2 = gross2 * tax_rate
national_insurance2 = gross2 * national_insurance_rate
net2 = gross2 - income_tax2 - national_insurance2

print()
print("=== תלוש משכורת · העובד השני ===")
print("ברוטו:", gross2)
print("מס הכנסה:", round(income_tax2, 2))
print("ביטוח לאומי:", round(national_insurance2, 2))
print("נטו:", round(net2, 2))

# --- הרחבה, חלק ב': ההפרש ---

print()
print("הפרש ברוטו:", round(gross2 - gross_salary, 2))
print("הפרש נטו:", round(net2 - net_salary, 2))

# --- הרחבה, חלק ג': עמלה מדורגת ---
# ‏1,000 בדיוק נופל ב"עד" — העמלה הקבועה. ההחלטה עקבית לכל אורך הקוד.

fee_600 = 4.9
fee_1000 = 4.9
fee_2500 = 2500 * commission_rate

print()
print("=== עמלות ===")
print("עמלה על 600:", fee_600)
print("עמלה על 1000:", fee_1000)
print("עמלה על 2500:", fee_2500)
