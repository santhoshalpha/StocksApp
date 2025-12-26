export const MOCK_DATA = {
  top_gainers: [
    { ticker: "NVDA", price: "145.20", change_amount: "12.40", change_percentage: "9.35%" },
    { ticker: "TSLA", price: "220.15", change_amount: "10.15", change_percentage: "4.80%" },
    { ticker: "AMD", price: "110.50", change_amount: "5.50", change_percentage: "5.20%" },
    { ticker: "AMZN", price: "180.00", change_amount: "4.00", change_percentage: "2.25%" },
    { ticker: "MSFT", price: "405.00", change_amount: "8.50", change_percentage: "2.10%" },
    { ticker: "GOOGL", price: "175.40", change_amount: "3.20", change_percentage: "1.85%" },
    { ticker: "META", price: "485.20", change_amount: "15.30", change_percentage: "3.25%" },
    { ticker: "NFLX", price: "610.00", change_amount: "12.00", change_percentage: "2.00%" },
  ],
  top_losers: [
    { ticker: "INTC", price: "30.10", change_amount: "-2.40", change_percentage: "-7.30%" },
    { ticker: "PYPL", price: "55.20", change_amount: "-1.80", change_percentage: "-3.15%" },
    { ticker: "DIS", price: "88.90", change_amount: "-1.10", change_percentage: "-1.20%" },
    { ticker: "NKE", price: "90.00", change_amount: "-0.90", change_percentage: "-1.00%" },
    { ticker: "BA", price: "170.20", change_amount: "-4.50", change_percentage: "-2.55%" },
    { ticker: "SBUX", price: "75.40", change_amount: "-1.20", change_percentage: "-1.55%" },
  ]
};

export const MOCK_DETAILS = {
  Symbol: "MOCK",
  Name: "Mock Company Inc.",
  Description: "This is a fallback description used because the API rate limit was reached. This ensures your assignment demo continues smoothly without errors.",
  Industry: "Technology",
  Sector: "Software",
  Address: "123 Innovation Dr, Tech City, CA",
  MarketCapitalization: "2500000000000", 
  PERatio: "35.5",
  ForwardPE: "32.1",
  PEGRatio: "1.5",
  BookValue: "45.20",
  PriceToBookRatio: "12.4",
  EPS: "5.67",
  Beta: "1.25",
  "52WeekHigh": "150.00",
  "52WeekLow": "90.00",
  "50DayMovingAverage": "135.00",
  "200DayMovingAverage": "120.00",
  AnalystTargetPrice: "160.00",
  DividendYield: "0.005",
  DividendPerShare: "0.50",
  ExDividendDate: "2024-03-15",
  DividendDate: "2024-04-01",
  RevenueTTM: "80000000000",
  GrossProfitTTM: "45000000000",
  EBITDA: "30000000000",
  ProfitMargin: "0.25",
  FiscalYearEnd: "September"
};
export const generateMockChartData = (range) => {
  let points = 20; // Default (1D, 1M)
  
  //logic
  if (range === '1W') points = 7;
  else if (range === '3M') points = 50;
  else if (range === '6M') points = 80;
  else if (range === '1Y') points = 120; 

  const data = [];
  let basePrice = 150;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.45) * 5; 
    basePrice += change;
    data.push({
      value: basePrice,
      label: i.toString() //label for every point
    });
  }
  return data;
};