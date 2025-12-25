import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 1. EXPANDED MOCK DATA (To make View All & Search work) ---
const MOCK_GAINERS = [
  { ticker: "NVDA", price: "880.15", change_amount: "125.40", change_percentage: "16.35%", name: "NVIDIA Corp" },
  { ticker: "SMCI", price: "980.50", change_amount: "110.20", change_percentage: "12.50%", name: "Super Micro Computer" },
  { ticker: "ARM", price: "145.20", change_amount: "15.40", change_percentage: "11.20%", name: "Arm Holdings" },
  { ticker: "AMD", price: "180.50", change_amount: "12.30", change_percentage: "7.30%", name: "Advanced Micro Devices" },
  { ticker: "PLTR", price: "25.40", change_amount: "1.80", change_percentage: "7.15%", name: "Palantir Technologies" },
  { ticker: "DELL", price: "120.10", change_amount: "7.50", change_percentage: "6.65%", name: "Dell Technologies" },
  { ticker: "COIN", price: "245.80", change_amount: "14.20", change_percentage: "6.15%", name: "Coinbase Global" },
  { ticker: "META", price: "495.20", change_amount: "25.30", change_percentage: "5.40%", name: "Meta Platforms" },
  { ticker: "NFLX", price: "610.00", change_amount: "28.50", change_percentage: "4.90%", name: "Netflix Inc" },
  { ticker: "TSLA", price: "175.40", change_amount: "7.80", change_percentage: "4.65%", name: "Tesla Inc" },
];

const MOCK_LOSERS = [
  { ticker: "PANW", price: "280.50", change_amount: "-25.40", change_percentage: "-8.35%", name: "Palo Alto Networks" },
  { ticker: "SNOW", price: "160.20", change_amount: "-12.50", change_percentage: "-7.25%", name: "Snowflake Inc" },
  { ticker: "LULU", price: "385.40", change_amount: "-28.10", change_percentage: "-6.80%", name: "Lululemon Athletica" },
  { ticker: "NKE", price: "92.50", change_amount: "-5.80", change_percentage: "-5.90%", name: "Nike Inc" },
  { ticker: "BA", price: "185.20", change_amount: "-10.50", change_percentage: "-5.35%", name: "Boeing Company" },
  { ticker: "AAPL", price: "168.50", change_amount: "-5.20", change_percentage: "-3.00%", name: "Apple Inc" },
  { ticker: "DIS", price: "110.50", change_amount: "-2.30", change_percentage: "-2.05%", name: "Walt Disney Co" },
  { ticker: "PYPL", price: "62.40", change_amount: "-1.10", change_percentage: "-1.75%", name: "PayPal Holdings" },
  { ticker: "SQ", price: "75.20", change_amount: "-1.20", change_percentage: "-1.60%", name: "Block Inc" },
  { ticker: "HOOD", price: "18.50", change_amount: "-0.25", change_percentage: "-1.45%", name: "Robinhood Markets" },
];

// Combine for searching
const ALL_MOCK_STOCKS = [...MOCK_GAINERS, ...MOCK_LOSERS];

// Helper to simulate network delay (makes the app feel real)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 2. SERVICE FUNCTIONS ---

export const fetchTopGainersLosers = async () => {
  await delay(500); // Simulate loading
  return {
    top_gainers: MOCK_GAINERS,
    top_losers: MOCK_LOSERS
  };
};

export const fetchStockDetails = async (symbol) => {
  await delay(500); // Simulate loading

  // 1. Try to find the stock in our list to get real-ish price
  const stock = ALL_MOCK_STOCKS.find(s => s.ticker === symbol) || { 
    ticker: symbol, 
    price: "150.00", 
    name: "Mock Company" 
  };

  // 2. Generate a mock chart (Historical Data) based on current price
  const currentPrice = parseFloat(stock.price);
  const mockPrices = {};
  
  // Generate last 10 days of data
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random fluctuation +/- 5%
    const randomFactor = 0.95 + Math.random() * 0.10; 
    const historyPrice = (currentPrice * randomFactor).toFixed(2);
    
    mockPrices[dateStr] = { "4. close": historyPrice };
  }

  // 3. Return the structure expected by DetailsScreen
  return {
    info: {
      Symbol: stock.ticker,
      Name: stock.name,
      Description: "This is a mock description generated for development purposes. The Alpha Vantage API limit was likely reached, so we are serving this data locally.",
      Exchange: "NASDAQ",
      Currency: "USD",
      Country: "USA",
      Sector: "Technology",
      Industry: "Consumer Electronics",
      MarketCapitalization: "2.5T",
      PERatio: "25.5",
      Beta: "1.2",
      DividendYield: "0.005",
      "52WeekHigh": (currentPrice * 1.2).toFixed(2),
      "52WeekLow": (currentPrice * 0.8).toFixed(2),
      AnalystTargetPrice: (currentPrice * 1.1).toFixed(2)
    },
    prices: mockPrices
  };
};

export const searchStocks = async (query) => {
  await delay(300); // Simulate network delay
  
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Filter our mock list
  const results = ALL_MOCK_STOCKS.filter(stock => 
    stock.ticker.toLowerCase().includes(lowerQuery) || 
    stock.name.toLowerCase().includes(lowerQuery)
  );

  // Map to the format expected by the API (so we don't break the UI)
  return results.map(item => ({
    "1. symbol": item.ticker,
    "2. name": item.name,
    "3. type": "Equity",
    "4. region": "United States",
    "5. marketOpen": "09:30",
    "6. marketClose": "16:00",
    "7. timezone": "UTC-04",
    "8. currency": "USD",
    "9. matchScore": "1.0000"
  }));
};