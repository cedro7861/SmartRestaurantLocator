import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../lib/colors';
import { getUsers, User, updateUser, deleteUser } from '../../lib/api/userApi';

interface AdminUsersTabProps {
  navigation: any;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
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
      loadUsers();
      setShowRoleModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUser(user.user_id, { status: newStatus });
      Alert.alert('Success', `${user.name} is now ${newStatus}`);
      loadUsers();
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
              loadUsers();
              setShowActionModal(false);
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

  const RoleSelectorModal = () => (
    <Modal
      visible={showRoleModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Change Role for {selectedUser?.name}
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Current role: {selectedUser?.role}
          </Text>
          
          <View style={styles.roleOptions}>
            {['customer', 'delivery', 'owner', 'admin'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  { 
                    backgroundColor: selectedUser?.role === role ? colors.primary + '20' : colors.background,
                    borderColor: getRoleColor(role)
                  }
                ]}
                onPress={() => selectedUser && handleRoleChange(selectedUser, role)}
                disabled={selectedUser?.role === role}
              >
                <View style={[styles.roleDot, { backgroundColor: getRoleColor(role) }]} />
                <Text style={[styles.roleOptionText, { color: colors.text }]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
                {selectedUser?.role === role && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.border }]}
            onPress={() => setShowRoleModal(false)}
          >
            <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ActionModal = () => (
    <Modal
      visible={showActionModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowActionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Manage {selectedUser?.name}
          </Text>
          
          <TouchableOpacity
            style={[styles.actionOption, { borderBottomColor: colors.border }]}
            onPress={() => {
              setShowActionModal(false);
              setShowRoleModal(true);
            }}
          >
            <Ionicons name="person" size={20} color={colors.primary} />
            <Text style={[styles.actionOptionText, { color: colors.text }]}>
              Change Role
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionOption, { borderBottomColor: colors.border }]}
            onPress={() => selectedUser && handleStatusToggle(selectedUser)}
          >
            <Ionicons 
              name={selectedUser?.status === 'active' ? 'eye-off' : 'eye'} 
              size={20} 
              color={selectedUser?.status === 'active' ? colors.warning : colors.success} 
            />
            <Text style={[styles.actionOptionText, { color: colors.text }]}>
              {selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'} User
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionOption, { borderBottomWidth: 0 }]}
            onPress={() => selectedUser && handleDeleteUser(selectedUser)}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
            <Text style={[styles.actionOptionText, { color: colors.error }]}>
              Delete User
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.border }]}
            onPress={() => setShowActionModal(false)}
          >
            <Text style={[styles.modalButtonText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.surface }]}
      onPress={() => {
        setSelectedUser(item);
        setShowActionModal(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.userMain}>
        <View style={styles.userAvatar}>
          <Text style={[styles.avatarText, { color: colors.background }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.userHeader}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                <Text style={[styles.roleBadgeText, { color: getRoleColor(item.role) }]}>
                  {item.role}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          {item.phone && (
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
          )}
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
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
      <Text style={[styles.title, { color: colors.text }]}>User Management</Text>

      {/* User Statistics */}
      <View style={styles.userStats}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{users.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {users.filter(u => u.status === 'active').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
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
        showsVerticalScrollIndicator={false}
      />

      <RoleSelectorModal />
      <ActionModal />
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
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginHorizontal: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.xs,
    marginTop: Theme.spacing.xs,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  userCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  userMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  avatarText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  userName: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginLeft: Theme.spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.xs,
  },
  roleBadgeText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Theme.spacing.xs,
  },
  statusBadgeText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  userPhone: {
    fontSize: Theme.typography.fontSize.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  roleOptions: {
    marginBottom: Theme.spacing.lg,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
  },
  roleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Theme.spacing.md,
  },
  roleOptionText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
  },
  actionOptionText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.md,
  },
  modalButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default AdminUsersTab;