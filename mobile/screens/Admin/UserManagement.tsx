import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { getUsers, createUser, updateUser, deleteUser, User, CreateUserData } from '../../lib/api/userApi';

interface UserManagementProps {
  navigation: any;
}

const UserManagement: React.FC<UserManagementProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData & { status?: string }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    status: 'active',
  });

  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'customer',
      status: 'active',
    });
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createUser(formData);
      Alert.alert('Success', 'User created successfully');
      setShowAddModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }
      await updateUser(editingUser.user_id, updateData);
      Alert.alert('Success', 'User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUser(user.user_id, { status: newStatus });
      Alert.alert('Success', `User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.user_id);
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
        <Text style={[styles.userRole, {
          color: item.role === 'admin' ? colors.error :
                 item.role === 'owner' ? colors.primary : colors.success
        }]}>
          {item.role}
        </Text>
        <Text style={[styles.userStatus, {
          color: item.status === 'active' ? colors.success : colors.warning
        }]}>
          {item.status}
        </Text>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEditUser(item)}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, {
            backgroundColor: item.status === 'active' ? colors.warning : colors.success
          }]}
          onPress={() => handleToggleStatus(item)}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUserForm = (isEdit: boolean = false) => (
    <ScrollView style={styles.modalContent}>
      <Text style={[styles.modalTitle, { color: colors.text }]}>
        {isEdit ? 'Edit User' : 'Add New User'}
      </Text>

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Full Name"
        placeholderTextColor={colors.textSecondary}
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {!isEdit && (
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />
      )}

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Phone (optional)"
        placeholderTextColor={colors.textSecondary}
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />

      <Text style={[styles.label, { color: colors.text }]}>Role</Text>
      <View style={styles.roleContainer}>
        {['admin', 'owner', 'delivery', 'customer'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleButton,
              {
                backgroundColor: formData.role === role ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setFormData({ ...formData, role })}
          >
            <Text style={[
              styles.roleButtonText,
              { color: formData.role === role ? colors.background : colors.text }
            ]}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: colors.surface }]}
          onPress={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setEditingUser(null);
            resetForm();
          }}
        >
          <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: colors.primary }]}
          onPress={isEdit ? handleUpdateUser : handleAddUser}
        >
          <Text style={[styles.modalButtonText, { color: colors.background }]}>
            {isEdit ? 'Update' : 'Add'} User
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={[styles.addButtonText, { color: colors.background }]}>Add New User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
      />

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            {renderUserForm(false)}
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            {renderUserForm(true)}
          </View>
        </View>
      </Modal>
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
  addButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  addButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  usersList: {
    paddingBottom: Theme.spacing.xl,
  },
  userCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  userInfo: {
    marginBottom: Theme.spacing.md,
  },
  userName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  userEmail: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  userRole: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  userStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
  label: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.lg,
  },
  roleButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    marginRight: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  roleButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
  },
  modalButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default UserManagement;