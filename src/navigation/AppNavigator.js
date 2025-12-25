import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; // Expo comes with icons built-in!

// Import our screens
import ExploreScreen from '../screens/ExploreScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Define the "Home" Stack
// This allows us to navigate from Explore -> Details
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Explore" component={ExploreScreen} options={{ title: 'Stocks App' }} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

// Define the Main Tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // We hide the tab header because the Stack handles titles
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          // Logic to show different icons for different tabs
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Watchlist') {
              iconName = focused ? 'list' : 'list-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}