import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../lib/colors';
import { getUsers, User, updateUser, deleteUser } from '../../lib/api/userApi';

interface AdminUsersTabProps {
  navigation: any;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ navigation }) => {
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
      console.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await updateUser(user.user_id, { role: newRole });
      Alert.alert('Success', `${user.name}'s role updated to ${newRole}`);
      loadUsers(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleStatusChange = async (user: User, newStatus: string) => {
    try {
      await updateUser(user.user_id, { status: newStatus });
      Alert.alert('Success', `${user.name} is now ${newStatus}`);
      loadUsers(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.user_id);
              Alert.alert('Success', `${user.name} has been deleted`);
              loadUsers(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return colors.error;
      case 'owner': return colors.warning;
      case 'delivery': return colors.primary;
      case 'customer': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? colors.success : colors.error;
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          {item.phone && (
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
          )}
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.userRole, { color: getRoleColor(item.role) }]}>
            {item.role}
          </Text>
          <Text style={[styles.userStatus, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {/* Role Change Buttons */}
        <View style={styles.roleButtons}>
          {item.role !== 'admin' && (
            <TouchableOpacity
              style={[styles.roleButton, { backgroundColor: colors.error }]}
              onPress={() => handleRoleChange(item, 'admin')}
            >
              <Text style={[styles.roleButtonText, { color: colors.background }]}>Make Admin</Text>
            </TouchableOpacity>
          )}
          {item.role !== 'owner' && (
            <TouchableOpacity
              style={[styles.roleButton, { backgroundColor: colors.warning }]}
              onPress={() => handleRoleChange(item, 'owner')}
            >
              <Text style={[styles.roleButtonText, { color: colors.background }]}>Make Owner</Text>
            </TouchableOpacity>
          )}
          {item.role !== 'delivery' && (
            <TouchableOpacity
              style={[styles.roleButton, { backgroundColor: colors.primary }]}
              onPress={() => handleRoleChange(item, 'delivery')}
            >
              <Text style={[styles.roleButtonText, { color: colors.background }]}>Make Delivery</Text>
            </TouchableOpacity>
          )}
          {item.role !== 'customer' && (
            <TouchableOpacity
              style={[styles.roleButton, { backgroundColor: colors.success }]}
              onPress={() => handleRoleChange(item, 'customer')}
            >
              <Text style={[styles.roleButtonText, { color: colors.background }]}>Make Customer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Toggle */}
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'active' ? styles.deactivateButton : styles.activateButton]}
          onPress={() => handleStatusChange(item, item.status === 'active' ? 'inactive' : 'active')}
        >
          <Ionicons
            name={item.status === 'active' ? 'eye-off' : 'eye'}
            size={16}
            color={colors.background}
          />
          <Text style={[styles.statusButtonText, { color: colors.background }]}>
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteUser(item)}
        >
          <Ionicons name="trash" size={16} color={colors.background} />
          <Text style={[styles.deleteButtonText, { color: colors.background }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Users Management</Text>

      {/* User Statistics */}
      <View style={styles.userStats}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{users.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {users.filter(u => u.status === 'active').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.error }]}>
            {users.filter(u => u.status === 'inactive').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Inactive</Text>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.user_id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
      />
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
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 80,
  },
  statNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  userCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  userEmail: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  userPhone: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  userRole: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    textTransform: 'capitalize',
    marginBottom: Theme.spacing.xs,
  },
  userStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  actionButtons: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.md,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.sm,
  },
  roleButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  roleButtonText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  activateButton: {
    backgroundColor: Theme.colors.success,
  },
  deactivateButton: {
    backgroundColor: Theme.colors.error,
  },
  statusButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  deleteButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default AdminUsersTab;