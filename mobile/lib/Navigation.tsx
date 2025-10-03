import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from './AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AdminDashboard from '../screens/RoleBased/AdminDashboard';
import OwnerDashboard from '../screens/RoleBased/OwnerDashboard';
import DeliveryDashboard from '../screens/RoleBased/DeliveryDashboard';
import CustomerDashboard from '../screens/RoleBased/CustomerDashboard';

const Stack = createStackNavigator();

const Navigation: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <Stack.Screen name="AdminDashboard">
          {(props) => <AdminDashboard {...props} user={user} onLogout={logout} />}
        </Stack.Screen>;
      case 'owner':
        return <Stack.Screen name="OwnerDashboard">
          {(props) => <OwnerDashboard {...props} user={user} onLogout={logout} />}
        </Stack.Screen>;
      case 'delivery':
        return <Stack.Screen name="DeliveryDashboard">
          {(props) => <DeliveryDashboard {...props} user={user} onLogout={logout} />}
        </Stack.Screen>;
      case 'customer':
      default:
        return <Stack.Screen name="CustomerDashboard">
          {(props) => <CustomerDashboard {...props} user={user} onLogout={logout} />}
        </Stack.Screen>;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          renderDashboard()
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={login} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;