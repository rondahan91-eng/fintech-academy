# בדיקות גלויות — שבוע 4
# זמין: OUTPUT · LINES · VARS


def test_variables_exist():
    required = ["commission", "income_tax", "national_insurance",
                "net_salary", "effective_rate"]
    missing = [n for n in required if n not in VARS]
    assert not missing, f"חסרים משתנים: {', '.join(missing)}"


def test_rates_are_fractions():
    assert VARS.get("tax_rate") == 0.15, "tax_rate: 15% נכתב כ-0.15"
    assert VARS.get("commission_rate") == 0.004, "commission_rate: 0.4% נכתב כ-0.004"


def test_net_is_correct_amount():
    value = VARS.get("net_salary")
    assert value is not None and abs(value - 4890.0) < 0.01, (
        f"net_salary יצא {value} ואמור לצאת 4890."
    )


def test_payslip_printed():
    assert "6000" in OUTPUT and "4890" in OUTPUT, (
        "התלוש אמור להציג גם את הברוטו וגם את הנטו."
    )
