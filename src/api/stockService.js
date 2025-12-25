import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_DATA } from '../constants/mockData'; // Keep as fallback

// --- CONFIGURATION ---
const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE'; // <--- PASTE YOUR KEY HERE
const BASE_URL = 'https://www.alphavantage.co/query';

// --- CACHE KEYS & EXPIRY ---
const CACHE_PREFIX = 'stock_cache_';
const HOME_CACHE_EXPIRY = 6 * 60 * 60 * 1000; // 6 Hours

// --- HELPER: Manage Cache ---
const getCachedData = async (key, expiryTime = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (jsonValue != null) {
      const { timestamp, data } = JSON.parse(jsonValue);
      // If expiryTime is provided, check it. Otherwise, assume valid (like for charts/details)
      if (!expiryTime || (Date.now() - timestamp < expiryTime)) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Cache Read Error:", e);
  }
  return null;
};

const setCachedData = async (key, data) => {
  try {
    const entry = { timestamp: Date.now(), data };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    console.warn("Cache Save Error:", e);
  }
};

// --- HELPER: API Request ---
const fetchFromApi = async (params) => {
  try {
    const queryString = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
    const response = await fetch(`${BASE_URL}?${queryString}`);
    const data = await response.json();
    
    // Handle Alpha Vantage Rate Limits
    if (data.Information && data.Information.includes('rate limit')) {
      throw new Error('API_LIMIT_REACHED');
    }
    // Handle specific API errors
    if (data['Error Message']) {
      throw new Error('API_ERROR');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${params.function}):`, error);
    throw error;
  }
};

// --- 1. TOP GAINERS & LOSERS ---
export const fetchTopGainersLosers = async () => {
  // Try Cache First
  const cached = await getCachedData('top_gainers_losers', HOME_CACHE_EXPIRY);
  if (cached) return cached;

  try {
    const data = await fetchFromApi({ function: 'TOP_GAINERS_LOSERS' });
    
    const result = {
      top_gainers: (data.top_gainers || []).map(item => ({
        ticker: item.ticker,
        price: item.price,
        change_amount: item.change_amount,
        change_percentage: item.change_percentage,
      })),
      top_losers: (data.top_losers || []).map(item => ({
        ticker: item.ticker,
        price: item.price,
        change_amount: item.change_amount,
        change_percentage: item.change_percentage,
      }))
    };

    // Save to Cache
    await setCachedData('top_gainers_losers', result);
    return result;

  } catch (error) {
    console.warn("Falling back to mock data for Home Screen");
    return { 
      top_gainers: MOCK_DATA.top_gainers, 
      top_losers: MOCK_DATA.top_losers 
    };
  }
};

// --- 2. SEARCH ---
export const searchStocks = async (query) => {
  if (!query) return [];
  try {
    const data = await fetchFromApi({ 
      function: 'SYMBOL_SEARCH', 
      keywords: query 
    });
    return data.bestMatches || [];
  } catch (error) {
    return [];
  }
};

// --- 3. STOCK DETAILS (Info + Price Only) ---
export const fetchStockDetails = async (symbol) => {
  // Check cache (we cache details aggressively to save credits)
  const cached = await getCachedData(`details_${symbol}`);
  if (cached) return cached;

  try {
    // Parallel Fetch: Quote (Price) + Overview (Metadata)
    const [quoteData, overviewData] = await Promise.all([
      fetchFromApi({ function: 'GLOBAL_QUOTE', symbol }),
      fetchFromApi({ function: 'OVERVIEW', symbol })
    ]);

    const quote = quoteData['Global Quote'] || {};
    const overview = overviewData || {};

    const result = {
      Symbol: symbol,
      Name: overview.Name || symbol,
      Description: overview.Description || "No description available.",
      MarketCapitalization: overview.MarketCapitalization || "-",
      PERatio: overview.PERatio || "-",
      "52WeekHigh": overview['52WeekHigh'] || "-",
      "52WeekLow": overview['52WeekLow'] || "-",
      Sector: overview.Sector || "-",
      // Real-time price data
      price: quote['05. price'] || "0.00",
      change_percentage: quote['10. change percent'] || "0.00%"
    };

    // Save to cache
    await setCachedData(`details_${symbol}`, result);
    return result;

  } catch (error) {
    console.warn(`Error fetching details for ${symbol}:`, error);
    return null;
  }
};

// --- 4. CHART DATA (With Range Logic) ---
export const fetchChartData = async (symbol, range) => {
  const cacheKey = `chart_${symbol}_${range}`;
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let functionName = 'TIME_SERIES_DAILY';
    let dataKey = 'Time Series (Daily)';
    
    // Determine API Function based on Range
    if (range === '1D') {
      functionName = 'TIME_SERIES_INTRADAY'; 
      dataKey = 'Time Series (5min)';
    } else if (range === '1Y') {
      functionName = 'TIME_SERIES_WEEKLY';
      dataKey = 'Weekly Time Series';
    }

    const params = { function: functionName, symbol };
    if (range === '1D') params.interval = '5min';

    console.log(`[API] Fetching Chart: ${range} for ${symbol}`);
    const data = await fetchFromApi(params);
    const timeSeries = data[dataKey];

    if (!timeSeries) throw new Error("No chart data received");

    // Convert Object to Array: [{ date: '...', value: 120.50 }]
    let formattedData = Object.keys(timeSeries).map(date => ({
        date: date,
        value: parseFloat(timeSeries[date]['4. close'])
    }));

    // Sort: Oldest to Newest (for Graph)
    formattedData.reverse();

    // FILTERING LOGIC based on Range
    if (range === '1W') {
       formattedData = formattedData.slice(-7); // Last 7 points
    } else if (range === '1M') {
       formattedData = formattedData.slice(-22); // ~1 Month trading days
    } else if (range === '3M') {
       formattedData = formattedData.slice(-66); // ~3 Months
    } else if (range === '1D') {
        // Filter for only "Today's" date if possible, or just take last 78 points (trading day)
        const lastDate = formattedData[formattedData.length-1].date.split(' ')[0];
        formattedData = formattedData.filter(item => item.date.includes(lastDate));
    }
    // 1Y is Weekly, so we keep all ~52 points returned.

    // Format Labels (Sparse labels for UI)
    const result = formattedData.map(item => {
        let label = "";
        // Simple label formatting
        if (range === '1D') label = item.date.split(' ')[1].slice(0, 5); // "14:30"
        else label = item.date.slice(5); // "12-25"
        return { value: item.value, label: label };
    });

    await setCachedData(cacheKey, result);
    return result;

  } catch (error) {
    console.error("Chart fetch error:", error);
    return []; // Return empty array so UI shows flat line instead of crash
  }
};