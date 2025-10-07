import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AdminUsersTab from '../screens/Admin/AdminUsersTab';
import AdminRestaurantsTab from '../screens/Admin/AdminRestaurantsTab';
import AdminOrdersTab from '../screens/Admin/AdminOrdersTab';
import AdminSettingsTab from '../screens/Admin/AdminSettingsTab';
import AdminChangePassword from '../screens/Admin/AdminChangePassword';
import ManageNotifications from '../screens/Admin/ManageNotifications';
import RestaurantTab from '../screens/Owner/RestaurantTab';
import OrdersTab from '../screens/Owner/OrdersTab';
import MenuTab from '../screens/Owner/MenuTab';
import SettingsTab from '../screens/Owner/SettingsTab';
import AddRestaurant from '../screens/Owner/AddRestaurant';
import ViewRestaurants from '../screens/Owner/ViewRestaurants';
import EditRestaurant from '../screens/Owner/EditRestaurant';
import AddMenuItem from '../screens/Owner/AddMenuItem';
import ManageOrders from '../screens/Owner/ManageOrders';
import ChangePassword from '../screens/Owner/ChangePassword';
import DeliveryDeliveriesTab from '../screens/Delivery/DeliveryDeliveriesTab';
import DeliveryHistoryTab from '../screens/Delivery/DeliveryHistoryTab';
import DeliveryEarningsTab from '../screens/Delivery/DeliveryEarningsTab';
import DeliverySettingsTab from '../screens/Delivery/DeliverySettingsTab';
import DeliveryChangePassword from '../screens/Delivery/DeliveryChangePassword';
import { CustomerDashboard } from '../screens/Customer';
import RestaurantDetail from '../screens/Customer/RestaurantDetail';
import CustomerSettingsTab from '../screens/Customer/SettingsTab';
import ProfileScreen from '../screens/Customer/ProfileScreen';
import CustomerChangePassword from '../screens/Customer/CustomerChangePassword';
import ContactSupport from '../screens/Customer/ContactSupport';
import OwnerProfileScreen from '../screens/Owner/ProfileScreen';
import { NotificationScreen } from '../screens/Notifications';
import { Ionicons } from '@expo/vector-icons';

const AuthStack = createStackNavigator();
const AdminStack = createStackNavigator();
const AdminTab = createBottomTabNavigator();
const OwnerStack = createStackNavigator();
const OwnerTab = createBottomTabNavigator();
const DeliveryStack = createStackNavigator();
const DeliveryTab = createBottomTabNavigator();
const CustomerStack = createStackNavigator();
const CustomerTab = createBottomTabNavigator();

const AdminNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="MainTabs" component={AdminTabNavigator} />
      <AdminStack.Screen name="ChangePassword" component={AdminChangePassword} />
      <AdminStack.Screen name="ManageNotifications">
        {(props: any) => <ManageNotifications {...props} user={user} />}
      </AdminStack.Screen>
    </AdminStack.Navigator>
  );
};

const OwnerNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <OwnerStack.Navigator screenOptions={{ headerShown: false }}>
      <OwnerStack.Screen name="MainTabs" component={OwnerTabNavigator} />
      <OwnerStack.Screen name="AddRestaurant" component={AddRestaurant} />
      <OwnerStack.Screen name="ViewRestaurants" component={ViewRestaurants} />
      <OwnerStack.Screen name="EditRestaurant" component={EditRestaurant} />
      <OwnerStack.Screen name="AddMenuItem" component={AddMenuItem} />
      <OwnerStack.Screen name="ManageOrders" component={ManageOrders} />
      <OwnerStack.Screen name="Profile">
        {(props: any) => <ProfileScreen {...props} user={user} onLogout={logout} />}
      </OwnerStack.Screen>
      <OwnerStack.Screen name="ChangePassword" component={ChangePassword} />
      <OwnerStack.Screen name="Notifications">
        {(props: any) => <NotificationScreen {...props} user={user} />}
      </OwnerStack.Screen>
    </OwnerStack.Navigator>
  );
};

const DeliveryTabNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <DeliveryTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Deliveries') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <DeliveryTab.Screen name="Deliveries">
        {(props: any) => <DeliveryDeliveriesTab {...props} user={user} />}
      </DeliveryTab.Screen>
      <DeliveryTab.Screen name="History">
        {(props: any) => <DeliveryHistoryTab {...props} user={user} />}
      </DeliveryTab.Screen>
      <DeliveryTab.Screen name="Earnings">
        {(props: any) => <DeliveryEarningsTab {...props} user={user} />}
      </DeliveryTab.Screen>
      <DeliveryTab.Screen name="Settings">
        {(props: any) => <DeliverySettingsTab {...props} user={user} onLogout={logout} />}
      </DeliveryTab.Screen>
    </DeliveryTab.Navigator>
  );
};

const DeliveryNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
      <DeliveryStack.Screen name="MainTabs" component={DeliveryTabNavigator} />
      <DeliveryStack.Screen name="ChangePassword" component={DeliveryChangePassword} />
      <DeliveryStack.Screen name="Notifications">
        {(props: any) => <NotificationScreen {...props} user={user} />}
      </DeliveryStack.Screen>
    </DeliveryStack.Navigator>
  );
};

const CustomerTabNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <CustomerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <CustomerTab.Screen name="Map">
        {(props: any) => <CustomerDashboard {...props} user={user} onLogout={logout} activeTab="map" />}
      </CustomerTab.Screen>
      <CustomerTab.Screen name="Orders">
        {(props: any) => <CustomerDashboard {...props} user={user} onLogout={logout} activeTab="orders" />}
      </CustomerTab.Screen>
      <CustomerTab.Screen name="Settings">
        {(props: any) => <CustomerSettingsTab {...props} user={user} onLogout={logout} />}
      </CustomerTab.Screen>
    </CustomerTab.Navigator>
  );
};

const OwnerTabNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <OwnerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Restaurant') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'fast-food' : 'fast-food-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <OwnerTab.Screen name="Restaurant">
        {(props: any) => <RestaurantTab {...props} user={user} />}
      </OwnerTab.Screen>
      <OwnerTab.Screen name="Orders" component={OrdersTab} />
      <OwnerTab.Screen name="Menu" component={MenuTab} />
      <OwnerTab.Screen name="Settings">
        {(props: any) => <SettingsTab {...props} user={user} onLogout={logout} />}
      </OwnerTab.Screen>
    </OwnerTab.Navigator>
  );
};

const AdminTabNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Restaurants') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <AdminTab.Screen name="Users" component={AdminUsersTab} />
      <AdminTab.Screen name="Restaurants" component={AdminRestaurantsTab} />
      <AdminTab.Screen name="Orders" component={AdminOrdersTab} />
      <AdminTab.Screen name="Settings">
        {(props: any) => <AdminSettingsTab {...props} user={user} onLogout={logout} />}
      </AdminTab.Screen>
    </AdminTab.Navigator>
  );
};

const CustomerNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name="MainTabs" component={CustomerTabNavigator} />
      <CustomerStack.Screen name="RestaurantDetail" component={RestaurantDetail} />
      <CustomerStack.Screen name="Profile">
        {(props: any) => <ProfileScreen {...props} user={user} />}
      </CustomerStack.Screen>
      <CustomerStack.Screen name="ChangePassword" component={CustomerChangePassword} />
      <CustomerStack.Screen name="ContactSupport" component={ContactSupport} />
      <CustomerStack.Screen name="Notifications">
        {(props: any) => <NotificationScreen {...props} user={user} />}
      </CustomerStack.Screen>
    </CustomerStack.Navigator>
  );
};

const Navigation: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login">
            {(props: any) => <LoginScreen {...props} onLogin={login} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminNavigator key="admin" />;
      case 'owner':
        return <OwnerNavigator key="owner" />;
      case 'delivery':
        return <DeliveryNavigator key="delivery" />;
      case 'customer':
      default:
        return <CustomerNavigator key="customer" />;
    }
  };

  return (
    <NavigationContainer>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Dashboard" component={renderDashboard} />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;