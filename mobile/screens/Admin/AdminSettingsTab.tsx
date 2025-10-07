import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';

interface AdminSettingsTabProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ navigation, user, onLogout }) => {
  const { colors, spacing, borderRadius, typography } = Theme;

  const settingsOptions = [
    {
      title: 'Change Password',
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      title: 'Manage Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('ManageNotifications'),
    },
    {
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: onLogout,
    },
  ];

  const renderSettingItem = (item: typeof settingsOptions[0], index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={item.onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon as any} size={24} color={colors.primary} />
        <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Manage your account and system settings.
      </Text>

      <View style={styles.settingsList}>
        {settingsOptions.map(renderSettingItem)}
      </View>
    </ScrollView>
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
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  settingsList: {
    marginTop: Theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: Theme.typography.fontSize.md,
    marginLeft: Theme.spacing.md,
  },
});

export default AdminSettingsTab;