import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface OwnerDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ navigation, user, onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owner Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {user.name}!</Text>
      <Text style={styles.role}>Role: {user.role}</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Manage Restaurant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>View Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Menu Management</Text>
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

export default OwnerDashboard;