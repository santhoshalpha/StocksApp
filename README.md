# StocksApp - Stock Tracking and Analysis

A professional React Native mobile application for tracking real-time stock market data, built with Expo. This app replicates key features of major trading platforms, featuring interactive charts, multi-watchlists, and robust error handling for demonstration purposes.

---

## Features

### 1. Explore and Discovery
* **Top Gainers and Losers:** Real-time list of market movers fetched from Alpha Vantage.
* **Smart Search:** Search functionality for stock symbols (e.g., "NVDA", "RELIANCE") with integrated logo fetching.
* **Dynamic Stock Cards:** UI components that fetch official company logos via the Parqet API, with an automatic fallback to text initials if logos are unavailable.

### 2. Detailed Stock Analysis
* **Interactive Charts:** Line graphs supporting multiple timeframes: 1D, 1W, 1M, 3M, 6M, 1Y.
* **Smart Axis Logic:** Custom logic dynamically adjusts X-axis label density. It ensures labels are fully visible on short timeframes (like 1 Week) while preventing overcrowding on long timeframes (like 1 Year).
* **Fundamentals:** Displays key financial metrics including P/E Ratio, Market Cap, Dividend Yield, and 52-Week High/Low.

### 3. Watchlist Management
* **Multi-Watchlist Support:** Users can create and manage multiple distinct watchlists.
* **Persistence:** All watchlist data is persisted locally using AsyncStorage, ensuring data remains available across app restarts.

### 4. Professional UI/UX
* **Seamless Splash Screen:** A custom animated splash screen that transitions smoothly from the native launch screen, eliminating white flashes during load.
* **Toast Notifications:** Professional toast messages provide user feedback for errors or status updates, replacing intrusive warning boxes.
* **Demo Mode:** A robust fallback system designed for presentations. If the API rate limit is reached, the app automatically switches to local Mock Data, ensuring the application never crashes during a demo.

---

## Tech Stack

* **Framework:** React Native (Expo SDK 54)
* **Language:** JavaScript
* **Navigation:** React Navigation (Native Stack and Bottom Tabs)
* **State Management:** React Context API
* **Local Storage:** @react-native-async-storage/async-storage
* **Charting:** react-native-chart-kit
* **Networking:** Fetch API
* **Build Tool:** EAS (Expo Application Services)

---

## Installation and Setup

1.  **Clone the repository**
    git clone https://github.com/your-username/stocksapp.git
    cd stocksapp

2.  **Install dependencies**
    npm install

3.  **Setup Environment Variables**
    Create a .env file in the root directory and add your Alpha Vantage API key:
    EXPO_PUBLIC_API_KEY=YOUR_API_KEY_HERE

4.  **Run the App**
    npx expo start --clear

---

## Building the APK (Android)

This project is configured for EAS Build to generate an installable APK for internal testing.

1.  **Install EAS CLI**
    npm install -g eas-cli

2.  **Login to Expo**
    eas login

3.  **Build the APK**
    eas build -p android --profile preview

---

## Technical Documentation

### Robust API Handling (Demo Mode)
To handle the strict rate limits of the Alpha Vantage free tier (5 calls/minute), the application implements a strict interceptor pattern. The `fetchFromApi` service detects rate limit errors and immediately triggers a fallback mechanism. This switches the data source to `src/constants/mockData.js` and notifies the user via a Toast message, allowing for uninterrupted navigation during testing or recording.

### Caching Strategy
To optimize network usage, the app implements a caching layer using AsyncStorage. Stock details and chart data are cached with a unique key format (`stock_cache_v9_strict_[SYMBOL]_[RANGE]`) and a 24-hour expiration. This prevents redundant network requests for recently viewed stocks.

### Chart Axis Optimization
A custom filtering logic was applied to the charting component to resolve common rendering issues with small datasets. For short timeframes (e.g., 1 Week), the logic forces the display of all labels. For larger datasets, it algorithmically selects labels at even intervals to maintain readability.

---

## Project Structure

* **assets/** - Static images including icons, splash screens, and logos.
* **src/api/** - Contains `stockService.js` for API calls, caching logic, and mock data fallbacks.
* **src/components/** - Reusable UI components such as `StockCard.js`.
* **src/constants/** - Static data files including `mockData.js`.
* **src/context/** - Global state management including `WatchlistContext.js`.
* **src/navigation/** - Navigation configuration for Tabs and Stacks.
* **src/screens/** - Main application screens (Explore, Details, Watchlist, Splash).
* **src/theme/** - Centralized styling and color definitions.
* **app.json** - Expo configuration including splash screen and package settings.
* **eas.json** - Build profiles for EAS.
