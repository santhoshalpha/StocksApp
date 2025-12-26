import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { MOCK_DATA, MOCK_DETAILS, generateMockChartData } from '../constants/mockData'; 

const API_KEY = process.env.EXPO_PUBLIC_API_KEY; 
const BASE_URL = 'https://www.alphavantage.co/query';
const CACHE_PREFIX = 'stock_cache_v9_strict_'; 
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; 

const showToast = (message, subMessage) => {
  if (Toast && Toast.show) {
    Toast.show({ type: 'info', text1: message, text2: subMessage, position: 'top', visibilityTime: 4000 });
  }
};

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

const fetchFromApi = async (params) => {
  try {
    const queryString = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
    const response = await fetch(`${BASE_URL}?${queryString}`);
    const data = await response.json();
    if (data.Information && data.Information.includes('rate limit')) throw new Error('API_LIMIT_REACHED');
    if (data['Error Message']) throw new Error('API_ERROR');
    if (Object.keys(data).length === 0) throw new Error('EMPTY_DATA');
    return data;
  } catch (error) { throw error; }
};

//details for detilas page
export const fetchStockDetails = async (symbol) => {
  const cached = await getCachedData(`details_${symbol}`);
  if (cached) return cached;
  try {
    const overviewData = await fetchFromApi({ function: 'OVERVIEW', symbol });
    const result = {
      ...overviewData, 
      Symbol: symbol,
      Name: overviewData.Name || symbol,
      Description: overviewData.Description || "Description unavailable.",
    };
    await setCachedData(`details_${symbol}`, result);
    return result;
  } catch (error) {
    showToast(`Demo Mode: ${symbol}`, "Limit Reached - Using Mock Details");
    return { ...MOCK_DETAILS, Symbol: symbol, Name: `${symbol} (Demo)`, price: "150.25", change_percentage: "1.5%" };
  }
};

//graph
export const fetchChartData = async (symbol, range) => {
  const cacheKey = `chart_${symbol}_${range}`;
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

    const data = await fetchFromApi(params);
    const timeSeries = data[dataKey];
    if (!timeSeries) throw new Error("No Data Received");

    let formattedData = Object.keys(timeSeries).map(date => ({
        date: date,
        value: parseFloat(timeSeries[date]['4. close'])
    })).reverse();

    //range params
    if (range === '1D') formattedData = formattedData.slice(-40);
    else if (range === '1W') formattedData = formattedData.slice(-7);
    else if (range === '1M') formattedData = formattedData.slice(-22);
    else if (range === '3M') formattedData = formattedData.slice(-66);
    else if (range === '6M') formattedData = formattedData.slice(-132);
    else if (range === '1Y') formattedData = formattedData.slice(-260);

    //labelling
    const result = formattedData.map((item, index) => {
        let label = "";
        const dateStr = item.date;
        
        try {
            if (range === '1D') {
                //splits
                const parts = dateStr.split(' ');
                if (parts.length > 1) {
                    label = parts[1].slice(0, 5); 
                } else {
                    // Fallback if no time component exists
                    label = dateStr.slice(5); // 10-25
                }
            } else if (range === '1W') {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                label = days[new Date(dateStr).getUTCDay()]; 
            } else if (range === '1M') {
                 const d = new Date(dateStr);
                 const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                 label = `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
            } else {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                label = months[new Date(dateStr).getUTCMonth()];
            }
        } catch (e) {
            //fall back to use index
            label = `${index}`;
        }
        
        // safetly label
        return { value: item.value, label: label || "?" };
    });

    await setCachedData(cacheKey, result);
    return result;

  } catch (error) {
    return generateMockChartData(range);
  }
};

//top gainer and loser
export const fetchTopGainersLosers = async () => {
  const cached = await getCachedData('top_gainers_losers');
  if (cached) return cached;
  try {
    const data = await fetchFromApi({ function: 'TOP_GAINERS_LOSERS' });
    const result = {
      top_gainers: (data.top_gainers || []).map(item => ({ ticker: item.ticker, price: item.price, change_percentage: item.change_percentage })),
      top_losers: (data.top_losers || []).map(item => ({ ticker: item.ticker, price: item.price, change_percentage: item.change_percentage }))
    };
    await setCachedData('top_gainers_losers', result);
    return result;
  } catch (error) {
    showToast("Demo Mode", "Home Screen Mock Data Active");
    return { top_gainers: MOCK_DATA.top_gainers, top_losers: MOCK_DATA.top_losers };
  }
};

export const searchStocks = async (query) => {
  if (!query) return [];
  try {
    const data = await fetchFromApi({ function: 'SYMBOL_SEARCH', keywords: query });
    return data.bestMatches || [];
  } catch (e) { 
    return [{ "1. symbol": query.toUpperCase(), "2. name": `${query.toUpperCase()} Corp (Demo)` }];
  }
};