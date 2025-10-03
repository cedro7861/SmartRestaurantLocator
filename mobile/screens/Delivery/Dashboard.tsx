import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DeliveryDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ navigation, user, onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {user?.name || 'User'}!</Text>
      <Text style={styles.role}>Role: {user?.role || 'Unknown'}</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Active Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Delivery History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Earnings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 18,
    marginBottom: 10,
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  menuText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DeliveryDashboard;