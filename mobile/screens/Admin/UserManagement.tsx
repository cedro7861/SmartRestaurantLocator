import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../../lib/colors';
import { getUsers, User, createUser, updateUser } from '../../lib/api/userApi';

interface UserManagementProps {
  navigation: any;
}

const UserManagement: React.FC<UserManagementProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    status: 'active',
  });
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
      status: user.status || 'active',
    });
    setEditModalVisible(true);
  };

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      status: 'active',
    });
    setAddModalVisible(true);
  };

  const handleDeactivateUser = async (user: User) => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use user_id instead of id
              await updateUser(user.user_id, { status: 'inactive' });
              loadUsers();
              Alert.alert('Success', 'User deactivated successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate user');
            }
          },
        },
      ]
    );
  };

  const handleSubmitEdit = async () => {
    if (!editingUser) return;
    try {
      // Use user_id instead of id
      await updateUser(editingUser.user_id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
      });
      setEditModalVisible(false);
      loadUsers();
      Alert.alert('Success', 'User updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleSubmitAdd = async () => {
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      });
      setAddModalVisible(false);
      loadUsers();
      Alert.alert('Success', 'User added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
    }
  };

  // Calculate user statistics
  const userStats = {
    total: users.length,
    active: users.filter(user => user.status === 'active').length,
    inactive: users.filter(user => user.status === 'inactive').length,
    customer: users.filter(user => user.role === 'customer').length,
    admin: users.filter(user => user.role === 'admin').length,
    delivery: users.filter(user => user.role === 'delivery').length,
    owner: users.filter(user => user.role === 'owner').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.error;
      case 'intervention': return colors.warning;
      case 'not_verified': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return colors.error;
      case 'owner': return colors.warning;
      case 'delivery': return colors.info;
      case 'customer': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const renderUserRow = (user: User, index: number) => (
    <View key={user.user_id?.toString() || index} style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.nameCell, { color: colors.text }]}>
        {user.name}
      </Text>
      <Text style={[styles.tableCell, { color: colors.text }]}>
        {user.email}
      </Text>
      <Text style={[styles.tableCell, { color: colors.text }]}>
        {user.phone || 'N/A'}
      </Text>
      <Text style={[styles.tableCell, { color: getRoleColor(user.role) }]}>
        {user.role}
      </Text>
      <Text style={[styles.tableCell, { color: getStatusColor(user.status || 'active') }]}>
        {user.status || 'Active'}
      </Text>
      <View style={styles.actionsCell}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEditUser(user)}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeactivateUser(user)}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>Deactivate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Manage Users</Text>

      {/* User Overview Section */}
      <View style={styles.overviewSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>User Overview</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Total Users</Text>
        
        <View style={styles.statsGrid}>
          <StatCard title="Active" value={userStats.active} color={colors.success} />
          <StatCard title="Inactive" value={userStats.inactive} color={colors.error} />
        </View>
        
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, marginTop: spacing.lg }]}>By Role</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Customer" value={userStats.customer} color={colors.success} />
          <StatCard title="Admin" value={userStats.admin} color={colors.error} />
          <StatCard title="Delivery" value={userStats.delivery} color={colors.info} />
          <StatCard title="Owner" value={userStats.owner} color={colors.warning} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.success }]}
        onPress={handleAddUser}
      >
        <Text style={[styles.addButtonText, { color: colors.background }]}>Add New User</Text>
      </TouchableOpacity>

      {/* Users Table Section */}
      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { color: colors.textSecondary }]}>
            Show {users.length} entries
          </Text>
        </View>

        {/* Table Headers */}
        <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: colors.surface }]}>
          <Text style={[styles.tableHeaderCell, styles.nameCell, { color: colors.text }]}>Name</Text>
          <Text style={[styles.tableHeaderCell, { color: colors.text }]}>Email</Text>
          <Text style={[styles.tableHeaderCell, { color: colors.text }]}>Phone</Text>
          <Text style={[styles.tableHeaderCell, { color: colors.text }]}>Role</Text>
          <Text style={[styles.tableHeaderCell, { color: colors.text }]}>Status</Text>
          <Text style={[styles.tableHeaderCell, { color: colors.text }]}>Actions</Text>
        </View>

        {/* Table Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
          </View>
        ) : (
          <>
            {users.map((user, index) => renderUserRow(user, index))}
            
            {/* Table Footer */}
            <View style={styles.tableFooter}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Showing 1 to {users.length} of {users.length} entries
              </Text>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.background }]}>Back to Dashboard</Text>
      </TouchableOpacity>

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit User</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Name"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Phone"
              placeholderTextColor={colors.textSecondary}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <Picker
              selectedValue={formData.role}
              onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Customer" value="customer" />
              <Picker.Item label="Delivery" value="delivery" />
              <Picker.Item label="Owner" value="owner" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
            <Picker
              selectedValue={formData.status}
              onValueChange={(itemValue) => setFormData({ ...formData, status: itemValue })}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Active" value="active" />
              <Picker.Item label="Inactive" value="inactive" />
              <Picker.Item label="Not Verified" value="not_verified" />
            </Picker>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmitEdit}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add User Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New User</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Name"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Phone"
              placeholderTextColor={colors.textSecondary}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <Picker
              selectedValue={formData.role}
              onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Customer" value="customer" />
              <Picker.Item label="Delivery" value="delivery" />
              <Picker.Item label="Owner" value="owner" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmitAdd}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  overviewSection: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  statTitle: {
    fontSize: Theme.typography.fontSize.sm,
  },
  tableSection: {
    marginBottom: Theme.spacing.xl,
  },
  tableHeader: {
    marginBottom: Theme.spacing.md,
  },
  tableHeaderText: {
    fontSize: Theme.typography.fontSize.sm,
  },
  tableHeaderRow: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border + '30',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    paddingHorizontal: Theme.spacing.xs,
  },
  tableCell: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    paddingHorizontal: Theme.spacing.xs,
  },
  nameCell: {
    flex: 1.2,
  },
  actionsCell: {
    flex: 1.5,
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  actionButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    minWidth: 60,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  tableFooter: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Theme.typography.fontSize.sm,
  },
  loadingContainer: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    elevation: 5,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
  picker: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderColor: Theme.colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default UserManagement;