
# StocksApp - Stock Tracking and Analysis

A professional React Native mobile application for tracking real-time stock market data, built with Expo. This app replicates key features of major platforms like Groww, featuring interactive charts, watchlists, and robust error handling for demonstration purposes.

---

## Features

### 1. Explore and Discovery

* **Top Gainers and Losers:** Real-time list of market movers.
* **Smart Search:** Search for any stock (e.g., "NVDA", "Reliance") with logo integration.
* **Stock Cards:** Dynamic logo fetching (via Parqet API) with automatic fallback to text initials if logos are missing.

### 2. Detailed Stock Analysis

* **Interactive Charts:** Line graphs supporting multiple timeframes: 1D, 1W, 1M, 3M, 6M, 1Y.
* **Smart Axis Logic:** The X-axis dynamically adjusts density to ensure labels are always visible (prevents missing axis labels on short ranges like 1 Week).
* **Fundamentals:** Displays key metrics like P/E Ratio, Market Cap, Dividend Yield, 52W High/Low, and more.

### 3. Watchlist Management

* **Multi-Watchlist Support:** Create and manage multiple watchlists (e.g., "Tech Stocks", "Long Term").
* **Persistence:** All data is saved locally using AsyncStorage, so watchlists remain after closing the app.

### 4. Professional UI/UX

* **Animated Splash Screen:** Custom animated intro that seamlessly transitions from the native launch screen.
* **Toast Notifications:** Replaced yellow warnings with professional toast messages for errors or status updates.
* **Demo Mode:** A robust fallback system. If the Alpha Vantage API rate limit is hit, the app silently switches to Mock Data so the user experience never crashes.

---

## Tech Stack

* **Framework:** React Native (Expo SDK 54)
* **Language:** JavaScript
* **Navigation:** React Navigation (Native Stack and Bottom Tabs)
* **State Management:** React Context API (WatchlistContext)
* **Local Storage:** @react-native-async-storage/async-storage
* **Charting:** react-native-chart-kit
* **Networking:** Fetch API with Alpha Vantage
* **Build Tool:** EAS (Expo Application Services)

---

## Installation and Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/stocksapp.git
cd stocksapp

```


2. **Install dependencies:**
```bash
npm install

```


3. **Setup Environment Variables:**
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_KEY=YOUR_ALPHA_VANTAGE_KEY

```


4. **Run the App:**
```bash
npx expo start --clear

```



---

## Building the APK (Android)

This project is configured for EAS Build to generate an installable APK for testing.

1. **Install EAS CLI:**
```bash
npm install -g eas-cli

```


2. **Login to Expo:**
```bash
eas login

```


3. **Build the APK:**
```bash
eas build -p android --profile preview

```


*This uses the `preview` profile in `eas.json` to generate a universal `.apk` instead of an App Bundle.*

---

## Technical Documentation

### 1. Robust API Handling (Demo Mode)

The Alpha Vantage free tier has strict rate limits (5 calls/min). To ensure the app remains functional during demonstrations:

* **Interceptor:** The `fetchFromApi` function in `stockService.js` detects Rate Limit errors.
* **Fallback:** If a limit is hit, it triggers a Toast notification ("Demo Mode Active") and returns locally stored Mock Data (`src/constants/mockData.js`).
* **Result:** Users can browse stocks seamlessly; the app switches between Real and Mock data instantly as needed.

### 2. Caching Strategy

To conserve API calls:

* **Key Format:** `stock_cache_v9_strict_[SYMBOL]_[RANGE]`
* **Expiry:** Data is cached for 24 Hours.
* **Logic:** Before making a network request, the app checks AsyncStorage. If valid data exists, it loads instantly.

### 3. Chart Axis Fix

A common issue with charting libraries is disappearing X-axis labels on small datasets (like "1 Week").

* **Implementation:** In `DetailsScreen.js`, a custom filter logic was applied.
* **Logic:** If data points are fewer than 12 (Short range), show all labels. If data points are greater than 12 (Long range), show every Nth label. This guarantees the graph always looks populated.

### 4. Seamless Splash Screen

To achieve a professional launch without a white flash:

1. **Native Splash (app.json):** Configured with a Dark Background (#121212) and the static Logo.
2. **Animated Splash (AnimatedSplashScreen.js):** A React component that mimics the native screen perfectly, then runs a Scale and Fade animation.
3. **Result:** The user sees one continuous logo that animates open.

---

## Project Structure

```
StocksApp/
├── assets/                 # Images (Icons, Splash, Logos)
├── src/
│   ├── api/
│   │   └── stockService.js # API calls, Caching, and Mock Fallback logic
│   ├── components/
│   │   └── StockCard.js    # Reusable card with Logo fetching
│   ├── constants/
│   │   └── mockData.js     # Fallback data for Demo Mode
│   ├── context/
│   │   └── WatchlistContext.js # Global state for saved stocks
│   ├── navigation/
│   │   └── AppNavigator.js # Tab and Stack navigators
│   ├── screens/
│   │   ├── AnimatedSplashScreen.js # Custom Intro Animation
│   │   ├── ExploreScreen.js        # Home: Search, Top Lists
│   │   ├── DetailsScreen.js        # Charts and Fundamentals
│   │   ├── WatchlistScreen.js      # User's saved lists
│   │   └── ViewAllScreen.js        # Grid view for lists
│   └── theme/
├── app.json                # Expo Configuration (Splash, Package Name)
├── eas.json                # Build Configuration (APK settings)
└── App.js                  # Entry point

```
