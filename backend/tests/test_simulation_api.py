"""
Backend API Tests for Investment Simulation Features
Tests: Tax toggle, Exit costs, Mortgage/Annuity calculations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://roi-calc-preview.preview.emergentagent.com')


class TestSimulationAPI:
    """Tests for POST /api/calculator/simulation endpoint"""
    
    def test_simulation_basic(self):
        """Test basic simulation without tax or financing"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 100,
            "mortgage_rate": 3.5,
            "apply_tax": False,
            "tax_rate": 9,
            "exit_costs_percent": 3
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify basic response structure
        assert "total_investment" in data
        assert "irr_percent" in data
        assert "npv" in data
        assert "yearly_data" in data
        assert "tax_applied" in data
        assert "exit_costs" in data
        
        # Verify tax is not applied
        assert data["tax_applied"] == False
        assert data["total_tax_paid"] == 0
        
        # Verify debt is 0 when equity is 100%
        assert data["debt_amount"] == 0
        
        print(f"Basic simulation: IRR={data['irr_percent']}%, NPV={data['npv']}")
    
    def test_simulation_with_tax(self):
        """Test simulation with Montenegro 9% flat tax enabled"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 100,
            "mortgage_rate": 3.5,
            "apply_tax": True,
            "tax_rate": 9,
            "exit_costs_percent": 3
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify tax is applied
        assert data["tax_applied"] == True
        assert data["tax_rate_used"] == 9.0
        assert data["total_tax_paid"] > 0
        
        # Verify yearly data includes tax_amount
        assert len(data["yearly_data"]) == 10
        for year_data in data["yearly_data"]:
            assert "tax_amount" in year_data
            assert year_data["tax_amount"] > 0
        
        print(f"Tax simulation: total_tax_paid={data['total_tax_paid']}, tax_rate={data['tax_rate_used']}%")
    
    def test_simulation_with_custom_tax_rate(self):
        """Test simulation with custom tax rate (15%)"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 100,
            "mortgage_rate": 3.5,
            "apply_tax": True,
            "tax_rate": 15,
            "exit_costs_percent": 3
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        assert data["tax_applied"] == True
        assert data["tax_rate_used"] == 15.0
        
        print(f"Custom tax rate: tax_rate_used={data['tax_rate_used']}%")
    
    def test_simulation_with_exit_costs(self):
        """Test simulation with exit costs (broker fee)"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 100,
            "mortgage_rate": 3.5,
            "apply_tax": False,
            "tax_rate": 9,
            "exit_costs_percent": 5
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify exit costs are calculated
        assert data["exit_costs"] > 0
        
        # Exit costs should be approximately 5% of final property value
        expected_exit_costs = data["final_property_value"] * 0.05
        assert abs(data["exit_costs"] - expected_exit_costs) < 1  # Allow small rounding difference
        
        print(f"Exit costs: {data['exit_costs']} (5% of {data['final_property_value']})")
    
    def test_simulation_with_financing(self):
        """Test simulation with 70% equity (30% debt)"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 70,
            "mortgage_rate": 3.5,
            "apply_tax": False,
            "tax_rate": 9,
            "exit_costs_percent": 3
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify financing structure
        assert data["debt_amount"] > 0
        assert data["equity_invested"] > 0
        assert data["equity_invested"] < data["total_investment"]
        
        # Verify debt is 30% of total investment
        expected_debt = data["total_investment"] * 0.30
        assert abs(data["debt_amount"] - expected_debt) < 1
        
        # Verify yearly data includes mortgage_payment
        for year_data in data["yearly_data"]:
            assert "mortgage_payment" in year_data
            assert year_data["mortgage_payment"] > 0
        
        print(f"Financing: equity={data['equity_invested']}, debt={data['debt_amount']}")
    
    def test_simulation_with_tax_and_financing(self):
        """Test simulation with both tax and financing enabled"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 70,
            "mortgage_rate": 3.5,
            "apply_tax": True,
            "tax_rate": 9,
            "exit_costs_percent": 3
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify both tax and financing are applied
        assert data["tax_applied"] == True
        assert data["total_tax_paid"] > 0
        assert data["debt_amount"] > 0
        
        # Verify yearly data includes both tax_amount and mortgage_payment
        for year_data in data["yearly_data"]:
            assert year_data["tax_amount"] > 0
            assert year_data["mortgage_payment"] > 0
        
        # Verify cashflow is reduced by both tax and mortgage
        year1 = data["yearly_data"][0]
        expected_cashflow = year1["net_rental_income"] - year1["tax_amount"] - year1["mortgage_payment"]
        assert abs(year1["cashflow"] - expected_cashflow) < 1
        
        print(f"Tax+Financing: tax_paid={data['total_tax_paid']}, debt={data['debt_amount']}")
    
    def test_simulation_yearly_data_structure(self):
        """Test that yearly data has all required fields"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 70,
            "mortgage_rate": 3.5,
            "apply_tax": True,
            "tax_rate": 9,
            "exit_costs_percent": 3
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        required_fields = [
            "year", "gross_rent", "vacancy_loss", "running_costs",
            "net_rental_income", "tax_amount", "mortgage_payment",
            "cashflow", "cumulative_cashflow", "property_value",
            "equity_value", "total_return"
        ]
        
        for year_data in data["yearly_data"]:
            for field in required_fields:
                assert field in year_data, f"Missing field: {field}"
        
        print(f"Yearly data structure verified with {len(required_fields)} fields")
    
    def test_simulation_result_structure(self):
        """Test that simulation result has all required fields"""
        payload = {
            "purchase_price": 250000,
            "renovation_costs": 30000,
            "additional_costs_percent": 5,
            "monthly_rent": 1200,
            "vacancy_rate": 5,
            "running_costs_percent": 15,
            "rent_increase_percent": 3,
            "appreciation_percent": 4,
            "discount_rate": 4,
            "holding_period": 10,
            "equity_percent": 70,
            "mortgage_rate": 3.5,
            "apply_tax": True,
            "tax_rate": 9,
            "exit_costs_percent": 3
        }
        
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        
        required_fields = [
            "total_investment", "equity_invested", "debt_amount",
            "irr_percent", "equity_roi_percent", "npv",
            "total_profit", "total_cashflow", "final_property_value",
            "value_appreciation", "exit_costs", "total_tax_paid",
            "yearly_data", "average_annual_cashflow", "cashflow_yield_percent",
            "total_return_percent", "break_even_year", "tax_applied", "tax_rate_used"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"Result structure verified with {len(required_fields)} fields")


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        
        print("Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
