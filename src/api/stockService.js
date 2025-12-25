import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_DATA } from '../constants/mockData'; 

// --- CONFIGURATION ---
const API_KEY = '6UBJIGIPKVTLMJBX'; // <--- PASTE YOUR KEY
const BASE_URL = 'https://www.alphavantage.co/query';

// --- CACHE ---
const CACHE_PREFIX = 'stock_cache_v9_strict_'; 
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 Hours

// --- HELPER: Cache ---
const getCachedData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (jsonValue != null) {
      const { timestamp, data } = JSON.parse(jsonValue);
      if (Date.now() - timestamp < CACHE_EXPIRY) return data;
    }
  } catch (e) { console.warn("Cache Error:", e); }
  return null;
};

const setCachedData = async (key, data) => {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch (e) { console.warn("Cache Save Error:", e); }
};

// --- HELPER: API ---
const fetchFromApi = async (params) => {
  try {
    const queryString = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
    const response = await fetch(`${BASE_URL}?${queryString}`);
    const data = await response.json();
    
    if (data.Information && data.Information.includes('rate limit')) {
      throw new Error('API_LIMIT_REACHED');
    }
    if (data['Error Message']) {
      throw new Error('API_ERROR');
    }
    
    return data;
  } catch (error) {
    console.error(`API Fail: ${params.function}`, error);
    throw error;
  }
};

// --- 1. DETAILS ---
export const fetchStockDetails = async (symbol) => {
  // 1. Check Cache
  const cached = await getCachedData(`details_${symbol}`);
  if (cached) return cached;

  try {
    // 2. Real API Call (Parallel)
    const [quoteData, overviewData] = await Promise.all([
      fetchFromApi({ function: 'GLOBAL_QUOTE', symbol }),
      fetchFromApi({ function: 'OVERVIEW', symbol })
    ]);

    const result = {
      ...overviewData, 
      Symbol: symbol,
      Name: overviewData.Name || symbol,
      Description: overviewData.Description || "Description unavailable.",
      price: quoteData['Global Quote']?.['05. price'] || "0.00",
      change_percentage: quoteData['Global Quote']?.['10. change percent'] || "0.00%"
    };

    // 3. Save to Cache on Success
    await setCachedData(`details_${symbol}`, result);
    return result;

  } catch (error) {
    console.warn(`Failed to fetch details for ${symbol}:`, error.message);
    return null; // Return null so UI shows empty state instead of fake data
  }
};

// --- 2. CHART ---
export const fetchChartData = async (symbol, range) => {
  const cacheKey = `chart_${symbol}_${range}`;
  
  // 1. Check Cache
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let functionName = 'TIME_SERIES_DAILY';
    let dataKey = 'Time Series (Daily)';
    
    if (range === '1D') {
      functionName = 'TIME_SERIES_INTRADAY'; 
      dataKey = 'Time Series (5min)';
    }

    const params = { function: functionName, symbol };
    if (range === '1D') params.interval = '5min';

    // 2. Real API Call
    const data = await fetchFromApi(params);
    const timeSeries = data[dataKey];

    if (!timeSeries) throw new Error("No Data Received");

    // 3. Process Data
    let formattedData = Object.keys(timeSeries).map(date => ({
        date: date,
        value: parseFloat(timeSeries[date]['4. close'])
    })).reverse();

    if (range === '1W') formattedData = formattedData.slice(-7);
    else if (range === '1M') formattedData = formattedData.slice(-22);
    else if (range === '3M') formattedData = formattedData.slice(-66);

    // 4. Nice Labels (Real Data Only)
    const result = formattedData.map(item => {
        let label = "";
        const dateStr = item.date;
        
        if (range === '1D') {
            label = dateStr.split(' ')[1]?.slice(0, 5) || ""; 
        } else if (range === '1W') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            label = days[new Date(dateStr).getUTCDay()]; 
        } else if (range === '1M') {
            const weekNum = Math.ceil(new Date(dateStr).getUTCDate() / 7);
            label = `W${weekNum}`;
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            label = months[new Date(dateStr).getUTCMonth()];
        }
        return { value: item.value, label: label };
    });

    // 5. Save to Cache
    await setCachedData(cacheKey, result);
    return result;

  } catch (error) {
    console.warn(`Failed to fetch chart for ${symbol}:`, error.message);
    return []; // Return empty array so chart is flat/empty, NO FAKE DATA
  }
};

// --- 3. TOP LISTS ---
export const fetchTopGainersLosers = async () => {
  const cached = await getCachedData('top_gainers_losers');
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

    await setCachedData('top_gainers_losers', result);
    return result;

  } catch (error) {
    // Only basic mock data if Top Gainers fails (to prevent empty home screen)
    return { 
      top_gainers: MOCK_DATA.top_gainers, 
      top_losers: MOCK_DATA.top_losers 
    };
  }
};

export const searchStocks = async (query) => {
  if (!query) return [];
  try {
    const data = await fetchFromApi({ function: 'SYMBOL_SEARCH', keywords: query });
    return data.bestMatches || [];
  } catch (e) { return []; }
};