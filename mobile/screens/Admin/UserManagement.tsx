import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { getUsers, User } from '../../lib/api/userApi';

interface UserManagementProps {
  navigation: any;
}

const UserManagement: React.FC<UserManagementProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userData = await getUsers();
      setUsers(userData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
      <Text style={[styles.userRole, {
        color: typeof colors[item.role as keyof typeof colors] === 'string'
          ? colors[item.role as keyof typeof colors] as string
          : colors.primary
      }]}>
        {item.role}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.admin }]}>User Management</Text>

      {loading ? (
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.background }]}>Back to Dashboard</Text>
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
  loadingText: {
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.md,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  userCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  userName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  userEmail: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  userRole: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.xs,
    textTransform: 'capitalize',
  },
  backButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  backButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default UserManagement;