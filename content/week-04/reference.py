# פתרון ייחוס — שבוע 4
# לא נחשף לתלמידים.

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
