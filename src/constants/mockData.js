// This mocks the response we expect from Alpha Vantage "Top Gainers/Losers" endpoint
export const MOCK_DATA = {
  top_gainers: [
    { ticker: "NVDA", price: "145.20", change_amount: "12.40", change_percentage: "9.35%" },
    { ticker: "TSLA", price: "220.15", change_amount: "10.15", change_percentage: "4.80%" },
    { ticker: "AMD", price: "110.50", change_amount: "5.50", change_percentage: "5.20%" },
    { ticker: "AMZN", price: "180.00", change_amount: "4.00", change_percentage: "2.25%" },
  ],
  top_losers: [
    { ticker: "INTC", price: "30.10", change_amount: "-2.40", change_percentage: "-7.30%" },
    { ticker: "PYPL", price: "55.20", change_amount: "-1.80", change_percentage: "-3.15%" },
    { ticker: "DIS", price: "88.90", change_amount: "-1.10", change_percentage: "-1.20%" },
    { ticker: "NKE", price: "90.00", change_amount: "-0.90", change_percentage: "-1.00%" },
  ]
};