import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../lib/colors';

interface AdminDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation, user, onLogout }) => {
  const { colors, spacing, borderRadius, typography } = Theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.admin }]}>Admin Dashboard</Text>
      <Text style={[styles.welcome, { color: colors.text }]}>Welcome, {user?.name || 'User'}!</Text>
      <Text style={[styles.role, { color: colors.textSecondary }]}>Role: {user?.role || 'Unknown'}</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserManagement')}>
          <Text style={styles.menuText}>Manage Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>System Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Reports</Text>
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
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  welcome: {
    fontSize: Theme.typography.fontSize.lg,
    marginBottom: Theme.spacing.sm,
  },
  role: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xxl,
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  menuText: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.text,
  },
  logoutButton: {
    backgroundColor: Theme.colors.error,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  logoutText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.fontSize.md,
  },
});

export default AdminDashboard;