import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import ExploreScreen from '../screens/ExploreScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import DetailsScreen from '../screens/DetailsScreen';
import ViewAllScreen from '../screens/ViewAllScreen'; // <--- Import this

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      {/* Explore is the main page */}
      <Stack.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ headerShown: false }} // Hide default header to use our custom one
      />
      
      {/* Details page */}
      <Stack.Screen name="Details" component={DetailsScreen} />
      
      {/* View All page */}
      <Stack.Screen 
        name="ViewAll" 
        component={ViewAllScreen} 
        options={({ route }) => ({ title: route.params.title })} // Dynamic title (e.g., "Top Gainers")
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, 
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Watchlist') iconName = focused ? 'list' : 'list-outline';
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