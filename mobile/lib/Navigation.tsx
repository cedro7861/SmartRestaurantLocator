import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "./AuthContext";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import Dashboard from "../screens/Admin/Dashboard";
import AdminUsersScreen from "../screens/Admin/AdminUsersTab";
import AdminRestaurantsTab from "../screens/Admin/AdminRestaurantsTab";
import AdminOrdersTab from "../screens/Admin/AdminOrdersTab";
import AdminSettingsTab from "../screens/Admin/AdminSettingsTab";
import AdminChangePassword from "../screens/Admin/AdminChangePassword";
import AdminLogout from "../screens/Admin/AdminLogout";
import ManageNotifications from "../screens/Admin/ManageNotifications";
import SystemHealthScreen from "../screens/Admin/SystemHealthScreen";
import AppConfiguration from "../screens/Admin/AppConfiguration";
import PrivacyPolicy from "../screens/Admin/PrivacyPolicy";
import TermsOfService from "../screens/Admin/TermsOfService";
import RestaurantTab from "../screens/Owner/RestaurantTab";
import OrdersTab from "../screens/Owner/OrdersTab";
import MenuTab from "../screens/Owner/MenuTab";
import SettingsTab from "../screens/Owner/SettingsTab";
import OwnerDashboard from "../screens/Owner/Dashboard";
import AddRestaurant from "../screens/Owner/AddRestaurant";
import ViewRestaurants from "../screens/Owner/ViewRestaurants";
import EditRestaurant from "../screens/Owner/EditRestaurant";
import AddMenuItem from "../screens/Owner/AddMenuItem";
import ManageOrders from "../screens/Owner/ManageOrders";
import DeliveryManagement from "../screens/Owner/DeliveryManagement";
import DeliveryDeliveriesTab from "../screens/Delivery/DeliveryDeliveriesTab";
import DeliveryHistoryTab from "../screens/Delivery/DeliveryHistoryTab";
import DeliveryEarningsTab from "../screens/Delivery/DeliveryEarningsTab";
import DeliverySettingsTab from "../screens/Delivery/DeliverySettingsTab";
import DeliveryMapTab from "../screens/Delivery/DeliveryMapTab";
import { DeliveryDashboard } from "../screens/Delivery";
import HomeScreen from "../screens/Customer/HomeScreen";
import MapScreen from "../screens/Customer/MapScreen";
import OrdersScreen from "../screens/Customer/OrdersScreen";
import RestaurantDetail from "../screens/Customer/RestaurantDetail";
import CustomerSettingsTab from "../screens/Customer/SettingsTab";
import LogoutScreen from "../screens/Customer/LogoutScreen";
import ProfileScreen from "../screens/Customer/ProfileScreen";
import ContactSupport from "../screens/Customer/ContactSupport";
import CustomerTermsConditions from "../screens/Customer/TermsConditions";
import OwnerTermsConditions from "../screens/Owner/TermsConditions";
import DeliveryTermsConditions from "../screens/Delivery/TermsConditions";

import OwnerProfileScreen from "../screens/Owner/ProfileScreen";
import { NotificationScreen } from "../screens/Notifications";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../lib/colors";

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
      <AdminStack.Screen
        name="ChangePassword"
        component={AdminChangePassword}
        options={{
          title: "Change Password",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      />

      <AdminStack.Screen
        name="AdminUsersScreen"
        component={AdminUsersScreen}
        options={{
          title: "Manage Users",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      />
      <AdminStack.Screen
        name="ManageNotifications"
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <ManageNotifications {...props} user={user} />}
      </AdminStack.Screen>
      <AdminStack.Screen
        name="AdminLogout"
        options={{
          title: "Logout",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <AdminLogout {...props} user={user} onLogout={logout} />}
      </AdminStack.Screen>
      <AdminStack.Screen
        name="SystemHealthScreen"
        component={SystemHealthScreen}
        options={{
          title: "System Health",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      />
      <AdminStack.Screen
        name="AppConfiguration"
        component={AppConfiguration}
        options={{
          title: "App Configuration",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      />
      <AdminStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          title: "Privacy Policy",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      />
      <AdminStack.Screen
        name="TermsOfService"
        component={TermsOfService}
        options={{
          title: "Terms of Service",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      />
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
      <OwnerStack.Screen
        name="DeliveryManagement"
        options={{
          title: "Delivery Management",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <DeliveryManagement {...props} user={user} />}
      </OwnerStack.Screen>
      <OwnerStack.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => (
          <ProfileScreen {...props} user={user} onLogout={logout} />
        )}
      </OwnerStack.Screen>
      <OwnerStack.Screen
        name="TermsConditions"
        options={{
          title: "Terms & Conditions",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
        component={OwnerTermsConditions}
      />
      <OwnerStack.Screen
        name="Notifications"
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
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

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Deliveries") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Earnings") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <DeliveryTab.Screen name="Home">
        {(props: any) => (
          <DeliveryDashboard
            {...props}
            user={user}
            onLogout={logout}
            activeTab="home"
          />
        )}
      </DeliveryTab.Screen>
      <DeliveryTab.Screen name="Deliveries">
        {(props: any) => <DeliveryDeliveriesTab {...props} user={user} />}
      </DeliveryTab.Screen>
      <DeliveryTab.Screen name="Earnings">
        {(props: any) => <DeliveryEarningsTab {...props} user={user} />}
      </DeliveryTab.Screen>
      <DeliveryTab.Screen name="Settings">
        {(props: any) => (
          <DeliverySettingsTab {...props} user={user} onLogout={logout} />
        )}
      </DeliveryTab.Screen>
    </DeliveryTab.Navigator>
  );
};

const DeliveryNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
      <DeliveryStack.Screen name="MainTabs" component={DeliveryTabNavigator} />
      <DeliveryStack.Screen
        name="DeliveryHistory"
        options={{
          title: "Delivery History",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <DeliveryHistoryTab {...props} user={user} />}
      </DeliveryStack.Screen>
      <DeliveryStack.Screen
        name="DeliveryMap"
        options={{
          title: "Delivery Map",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <DeliveryMapTab {...props} user={user} />}
      </DeliveryStack.Screen>
      <DeliveryStack.Screen
        name="TermsConditions"
        options={{
          title: "Terms & Conditions",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
        component={DeliveryTermsConditions}
      />
      <DeliveryStack.Screen
        name="Notifications"
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
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

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <CustomerTab.Screen name="Home">
        {(props: any) => (
          <HomeScreen
            {...props}
            user={user}
            onLogout={logout}
          />
        )}
      </CustomerTab.Screen>
      <CustomerTab.Screen name="Map">
        {(props: any) => (
          <MapScreen
            {...props}
            user={user}
          />
        )}
      </CustomerTab.Screen>
      <CustomerTab.Screen name="Orders">
        {(props: any) => (
          <OrdersScreen
            {...props}
            user={user}
          />
        )}
      </CustomerTab.Screen>
      <CustomerTab.Screen name="Settings">
        {(props: any) => (
          <CustomerSettingsTab {...props} user={user} onLogout={logout} />
        )}
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

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Restaurant") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Menu") {
            iconName = focused ? "fast-food" : "fast-food-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <OwnerTab.Screen name="Home">
        {(props: any) => (
          <OwnerDashboard
            {...props}
            user={user}
            onLogout={logout}
            activeTab="home"
          />
        )}
      </OwnerTab.Screen>
      <OwnerTab.Screen name="Restaurant">
        {(props: any) => <RestaurantTab {...props} user={user} />}
      </OwnerTab.Screen>
      <OwnerTab.Screen name="Orders" component={OrdersTab} />
      <OwnerTab.Screen name="Menu" component={MenuTab} />
      <OwnerTab.Screen name="Settings">
        {(props: any) => (
          <SettingsTab {...props} user={user} onLogout={logout} />
        )}
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

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Restaurants") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "clipboard" : "clipboard-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <AdminTab.Screen name="Home">
        {(props: any) => <Dashboard {...props} user={user} onLogout={logout} />}
      </AdminTab.Screen>
      <AdminTab.Screen name="Restaurants" component={AdminRestaurantsTab} />
      <AdminTab.Screen name="Orders" component={AdminOrdersTab} />
      <AdminTab.Screen name="Settings">
        {(props: any) => (
          <AdminSettingsTab {...props} user={user} onLogout={logout} />
        )}
      </AdminTab.Screen>
    </AdminTab.Navigator>
  );
};

const CustomerNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name="MainTabs" component={CustomerTabNavigator} />
      <CustomerStack.Screen
        name="RestaurantDetail"
        component={RestaurantDetail}
      />
      <CustomerStack.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <ProfileScreen {...props} user={user} />}
      </CustomerStack.Screen>
      <CustomerStack.Screen
        name="ContactSupport"
        options={{
          title: "Contact Support",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
        component={ContactSupport}
      />
      <CustomerStack.Screen
        name="Notifications"
        options={{
          title: "Notifications",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <NotificationScreen {...props} user={user} />}
      </CustomerStack.Screen>
      <CustomerStack.Screen
        name="TermsConditions"
        options={{
          title: "Terms & Conditions",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
        component={CustomerTermsConditions}
      />
      <CustomerStack.Screen
        name="LogoutScreen"
        options={{
          title: "Logout",
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: true,
        }}
      >
        {(props: any) => <LogoutScreen {...props} user={user} onLogout={logout} />}
      </CustomerStack.Screen>
    </CustomerStack.Navigator>
  );
};

const Navigation: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading component
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login">
            {(props: any) => <LoginScreen {...props} onLogin={login} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminNavigator key="admin" />;
      case "owner":
        return <OwnerNavigator key="owner" />;
      case "delivery":
        return <DeliveryNavigator key="delivery" />;
      case "customer":
      default:
        return <CustomerNavigator key="customer" />;
    }
  };

  return (
    <NavigationContainer>
      {renderDashboard()}
    </NavigationContainer>
  );
};

export default Navigation;