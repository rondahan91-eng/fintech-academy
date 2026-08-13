# פתרון ייחוס — שבוע 2
# לא נחשף לתלמידים. משמש לאימות שהטסטים עוברים על פתרון תקין.

# --- חלק א': החשבון של דנה ---

dana = Account(owner="דנה כהן", balance=2500)

dana.deposit(400)
dana.withdraw(120)

print("בעלת החשבון:", dana.owner())
print("יתרה:", dana.balance())


# --- חלק ב': יואב, והעברה ---

yoav = Account(owner="יואב לוי", balance=100)

dana.transfer_to(yoav, 50)

print()
print("היתרה של דנה אחרי ההעברה:", dana.balance())
print("היתרה של יואב אחרי ההעברה:", yoav.balance())


# --- חלק ג': משיכה גדולה מדי ---

yoav.withdraw(3000)

print()
print("היתרה של יואב:", yoav.balance())
print("ביתרת חובה?", yoav.is_overdrawn())
print()
print(yoav.statement())
