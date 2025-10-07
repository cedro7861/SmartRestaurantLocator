import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Theme } from '../../lib/colors';
import AddRestaurant from './AddRestaurant';
import ViewRestaurants from './ViewRestaurants';

const TopTab = createMaterialTopTabNavigator();

interface RestaurantTabProps {
  navigation: any;
  user: any;
}

const RestaurantTab: React.FC<RestaurantTabProps> = ({ navigation, user }) => {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textSecondary,
        tabBarIndicatorStyle: { backgroundColor: Theme.colors.primary },
        tabBarStyle: { backgroundColor: Theme.colors.background },
        tabBarLabelStyle: { fontWeight: 'bold' },
      }}
    >
      <TopTab.Screen
        name="AddRestaurant"
        component={AddRestaurant}
        options={{ title: 'Add Restaurant' }}
      />
      <TopTab.Screen
        name="ViewRestaurants"
        component={ViewRestaurants}
        options={{ title: 'View Restaurants' }}
      />
    </TopTab.Navigator>
  );
};

export default RestaurantTab;