import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from './AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import { AdminDashboard, UserManagement } from '../screens/Admin';
import { OwnerDashboard } from '../screens/Owner';
import { DeliveryDashboard } from '../screens/Delivery';
import { CustomerDashboard } from '../screens/Customer';

const AuthStack = createStackNavigator();
const AdminStack = createStackNavigator();
const OwnerStack = createStackNavigator();
const DeliveryStack = createStackNavigator();
const CustomerStack = createStackNavigator();

const AdminNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard">
        {(props: any) => <AdminDashboard {...props} user={user} onLogout={logout} />}
      </AdminStack.Screen>
      <AdminStack.Screen name="UserManagement" component={UserManagement} />
    </AdminStack.Navigator>
  );
};

const OwnerNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <OwnerStack.Navigator screenOptions={{ headerShown: false }}>
      <OwnerStack.Screen name="OwnerDashboard">
        {(props: any) => <OwnerDashboard {...props} user={user} onLogout={logout} />}
      </OwnerStack.Screen>
    </OwnerStack.Navigator>
  );
};

const DeliveryNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
      <DeliveryStack.Screen name="DeliveryDashboard">
        {(props: any) => <DeliveryDashboard {...props} user={user} onLogout={logout} />}
      </DeliveryStack.Screen>
    </DeliveryStack.Navigator>
  );
};

const CustomerNavigator = () => {
  const { user, logout } = useAuth();
  return (
    <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name="CustomerDashboard">
        {(props: any) => <CustomerDashboard {...props} user={user} onLogout={logout} />}
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