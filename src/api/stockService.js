import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REPLACE WITH YOUR KEY
const API_KEY = 'T86AT92YE9H3Q7J5'; 
const BASE_URL = 'https://www.alphavantage.co/query';

const CACHE_DURATION_LONG = 24 * 60 * 60 * 1000; 
const CACHE_DURATION_SHORT = 60 * 60 * 1000;

// --- 1. MOCK DATA (Use this when API fails) ---
const MOCK_GAINERS = {
  top_gainers: [
    { ticker: "AAPL", price: "175.00", change_percentage: "2.5%" },
    { ticker: "NVDA", price: "450.00", change_percentage: "5.1%" },
    { ticker: "TSLA", price: "240.00", change_percentage: "1.2%" },
  ],
  top_losers: [
    { ticker: "MSFT", price: "320.00", change_percentage: "-1.5%" },
    { ticker: "GOOGL", price: "130.00", change_percentage: "-0.8%" },
  ]
};

const MOCK_DETAILS = {
  info: {
    Symbol: "MOCK",
    Name: "Mock Company Inc (Limit Reached)",
    Description: "This data is shown because the API limit was reached. This ensures your UI still works for the assignment.",
    Exchange: "NASDAQ",
    Currency: "USD",
    Country: "USA",
    Sector: "Technology",
    Industry: "Consumer Electronics",
    MarketCapitalization: "2500000000000",
    PERatio: "25.5",
    Beta: "1.2",
    DividendYield: "0.005",
    "52WeekHigh": "200.00",
    "52WeekLow": "100.00",
    AnalystTargetPrice: "180.00"
  },
  prices: {
    "2023-12-01": { "4. close": "150.00" },
    "2023-11-30": { "4. close": "148.00" },
    "2023-11-29": { "4. close": "145.00" },
    "2023-11-28": { "4. close": "142.00" },
    "2023-11-27": { "4. close": "146.00" },
    "2023-11-26": { "4. close": "149.00" },
    "2023-11-25": { "4. close": "152.00" },
    "2023-11-24": { "4. close": "155.00" },
    "2023-11-23": { "4. close": "160.00" },
    "2023-11-22": { "4. close": "158.00" },
  }
};

// --- 2. CACHE LOGIC ---
const getCachedData = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp, duration } = JSON.parse(cached);
    if (Date.now() - timestamp < duration) return data;
    return null;
  } catch (e) { return null; }
};

const setCachedData = async (key, data, duration) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), duration }));
  } catch (e) { console.error("Cache Set Error", e); }
};

// --- 3. HELPER: Check for Limit ---
const isLimitReached = (data) => {
  return data.Note || data.Information || !data;
};

// --- 4. API FUNCTIONS ---

export const fetchTopGainersLosers = async () => {
  const cacheKey = 'top_gainers_losers';
  
  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // 2. Try API
    console.log("Fetching Gainers from API...");
    const response = await axios.get(`${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`);
    
    if (isLimitReached(response.data)) {
      console.warn("API Limit Hit - Using MOCK data");
      return MOCK_GAINERS; // FALLBACK
    }

    if (response.data.top_gainers) {
      await setCachedData(cacheKey, response.data, CACHE_DURATION_SHORT);
      return response.data;
    }
  } catch (error) {
    console.error("Network Error, using MOCK");
  }
  
  return MOCK_GAINERS; // Final Fallback
};

export const fetchStockDetails = async (symbol) => {
  const cacheKey = `details_${symbol}`;
  
  // 1. Try Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // 2. Try API
    console.log(`Fetching Details for ${symbol}...`);
    
    // We do ONE request at a time to be safer, instead of Promise.all
    const overview = await axios.get(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`);
    if (isLimitReached(overview.data)) throw new Error("Limit Reached");

    const daily = await axios.get(`${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`);
    if (isLimitReached(daily.data)) throw new Error("Limit Reached");

    const data = {
      info: overview.data,
      prices: daily.data['Time Series (Daily)'] || {}
    };

    if (data.info.Symbol) {
      await setCachedData(cacheKey, data, CACHE_DURATION_LONG);
      return data;
    }
  } catch (error) {
    console.warn(`API Limit/Error for ${symbol}, using MOCK.`);
  }

  // 3. Mock Fallback
  // We modify the mock name so you know it's fake in the UI
  const forcedMock = { ...MOCK_DETAILS };
  forcedMock.info.Symbol = symbol;
  forcedMock.info.Name = "MOCK DATA (" + symbol + ")";
  return forcedMock;
};

export const searchStocks = async (query) => {
  if (!query) return [];
  try {
    const response = await axios.get(`${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`);
    if (isLimitReached(response.data)) return [];
    return response.data.bestMatches || [];
  } catch (error) { return []; }
};