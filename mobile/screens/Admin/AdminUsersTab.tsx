import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../lib/colors";
import { getUsers, User, updateUser, deleteUser, adminCreateUser } from "../../lib/api/userApi";

interface AdminUsersTabProps {
  navigation: any;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer'
  });
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const userData = await getUsers();
      console.log("Fetched users:", userData);

      if (Array.isArray(userData)) {
        setUsers(userData);
      } else {
        console.error("Invalid user data format:", userData);
        Alert.alert("Error", "Failed to load users: Invalid data format");
      }
    } catch (error: any) {
      console.error("Failed to load users:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Unknown error occurred";
      Alert.alert("Error", `Failed to load users: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadUsers(true);
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await updateUser(user.user_id, { role: newRole });
      Alert.alert("Success", `${user.name}'s role updated to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`);
      await loadUsers(); // Wait for reload to complete
      setShowRoleModal(false);
    } catch (error: any) {
      console.error("Role change error:", error);
      const errorMessage = error?.response?.data?.error || "Failed to update user role";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
    setShowEditModal(true);
    setShowActionModal(false);
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.user_id, editForm);
      Alert.alert("Success", `${editingUser.name}'s information has been updated`);
      await loadUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error("User edit error:", error);
      const errorMessage = error?.response?.data?.error || "Failed to update user information";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    try {
      await adminCreateUser(addForm);
      Alert.alert("Success", "User created successfully! Login credentials have been sent to their email.");
      await loadUsers();
      setShowAddModal(false);
      setAddForm({ name: '', email: '', phone: '', role: 'customer' });
    } catch (error: any) {
      console.error("User creation error:", error);
      const errorMessage = error?.response?.data?.error || "Failed to create user";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await updateUser(user.user_id, { status: newStatus });
      Alert.alert("Success", `${user.name} is now ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      await loadUsers(); // Wait for reload to complete
    } catch (error: any) {
      console.error("Status toggle error:", error);
      const errorMessage = error?.response?.data?.error || "Failed to update user status";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleDeleteUser = async (user: User) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}? This action cannot be undone and will permanently remove all associated data.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete User",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user.user_id);
              Alert.alert("Success", `${user.name} has been permanently deleted`);
              await loadUsers(); // Wait for reload to complete
              setShowActionModal(false);
            } catch (error: any) {
              console.error("Delete user error:", error);
              const errorMessage = error?.response?.data?.error || "Failed to delete user";
              Alert.alert("Error", errorMessage);
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return colors.error; // Red for admin (highest privilege)
      case "owner":
        return colors.warning; // Orange for restaurant owners
      case "delivery":
        return colors.primary; // Blue for delivery personnel
      case "customer":
        return colors.success; // Green for customers
      default:
        return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.success; // Green for active users
      case "inactive":
        return colors.error; // Red for inactive users
      case "not_verified":
        return colors.warning; // Orange for unverified users
      default:
        return colors.textSecondary;
    }
  };

  const RoleSelectorModal = () => (
    <Modal
      visible={showRoleModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Change Role for {selectedUser?.name}
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Current role: {selectedUser?.role}
          </Text>

          <View style={styles.roleOptions}>
            {["customer", "delivery", "owner", "admin"].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor:
                      selectedUser?.role === role
                        ? colors.primary + "20"
                        : colors.background,
                    borderColor: getRoleColor(role),
                  },
                ]}
                onPress={() =>
                  selectedUser && handleRoleChange(selectedUser, role)
                }
                disabled={selectedUser?.role === role}
              >
                <View
                  style={[
                    styles.roleDot,
                    { backgroundColor: getRoleColor(role) },
                  ]}
                />
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
            <Text style={[styles.modalButtonText, { color: colors.text }]}>
              Cancel
            </Text>
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
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Manage {selectedUser?.name}
          </Text>

          <TouchableOpacity
            style={[styles.actionOption, { borderBottomColor: colors.border }]}
            onPress={() => selectedUser && handleEditUser(selectedUser)}
          >
            <Ionicons name="create" size={20} color={colors.primary} />
            <Text style={[styles.actionOptionText, { color: colors.text }]}>
              Edit User Info
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

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
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionOption, { borderBottomColor: colors.border }]}
            onPress={() => selectedUser && handleStatusToggle(selectedUser)}
          >
            <Ionicons
              name={selectedUser?.status === "active" ? "eye-off" : "eye"}
              size={20}
              color={
                selectedUser?.status === "active"
                  ? colors.warning
                  : colors.success
              }
            />
            <Text style={[styles.actionOptionText, { color: colors.text }]}>
              {selectedUser?.status === "active" ? "Deactivate" : "Activate"}{" "}
              User
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
            <Text style={[styles.modalButtonText, { color: colors.text }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const EditUserModal = () => (
    <Modal
      visible={showEditModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface, maxWidth: 400 }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Edit User Information
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            {editingUser?.name} ({editingUser?.email})
          </Text>

          <View style={styles.editForm}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter full name"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
              value={editForm.email}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
              value={editForm.phone}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border, flex: 1, marginRight: spacing.xs }]}
              onPress={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, flex: 1, marginLeft: spacing.xs }]}
              onPress={handleSaveUserEdit}
            >
              <Text style={[styles.modalButtonText, { color: colors.background }]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const AddUserModal = () => (
    <Modal
      visible={showAddModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface, maxWidth: 400 }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Add New User
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Create a new user account with auto-generated credentials
          </Text>

          <View style={styles.editForm}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
            <TextInput
              style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
              value={addForm.name}
              onChangeText={(text) => setAddForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter full name"
              placeholderTextColor={colors.textSecondary}
              returnKeyType="next"
              blurOnSubmit={false}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address *</Text>
            <TextInput
              style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
              value={addForm.email}
              onChangeText={(text) => setAddForm(prev => ({ ...prev, email: text }))}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
              value={addForm.phone}
              onChangeText={(text) => setAddForm(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              returnKeyType="done"
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>User Role</Text>
            <View style={styles.roleSelector}>
              {["customer", "delivery", "owner"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleSelectOption,
                    {
                      backgroundColor: addForm.role === role ? colors.primary + "20" : colors.background,
                      borderColor: addForm.role === role ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setAddForm(prev => ({ ...prev, role }))}
                >
                  <Text style={[styles.roleSelectText, {
                    color: addForm.role === role ? colors.primary : colors.text
                  }]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border, flex: 1, marginRight: spacing.xs }]}
              onPress={() => {
                setShowAddModal(false);
                setAddForm({ name: '', email: '', phone: '', role: 'customer' });
              }}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, flex: 1, marginLeft: spacing.xs }]}
              onPress={handleAddUser}
            >
              <Text style={[styles.modalButtonText, { color: colors.background }]}>
                Create User
              </Text>
            </TouchableOpacity>
          </View>
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
            <Text style={[styles.userName, { color: colors.text }]}>
              {item.name}
            </Text>
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleColor(item.role) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    { color: getRoleColor(item.role) },
                  ]}
                >
                  {item.role}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + "20" },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {item.email}
          </Text>
          {item.phone && (
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
              {item.phone}
            </Text>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading users...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          User Management
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="person-add" size={20} color={colors.background} />
          <Text style={[styles.addButtonText, { color: colors.background }]}>Add User</Text>
        </TouchableOpacity>
      </View>

      {/* User Statistics */}
      <View style={styles.userStats}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {users.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Users
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {users.filter((u) => u.status === "active").length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {users.filter((u) => u.status === "not_verified").length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Pending
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.error }]}>
            {users.filter((u) => u.status === "inactive").length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Inactive
          </Text>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) =>
          item.user_id?.toString() || Math.random().toString()
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No users found
              </Text>
            </View>
          ) : null
        }
      />

      <RoleSelectorModal />
      <ActionModal />
      <EditUserModal />
      <AddUserModal />
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
    textAlign: "center",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.lg,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 70,
    alignItems: "center",
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginHorizontal: Theme.spacing.xs,
    marginVertical: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Theme.spacing.xs,
  },
  userName: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
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
    textTransform: "capitalize",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    textTransform: "capitalize",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  roleOptions: {
    marginBottom: Theme.spacing.lg,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
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
    textTransform: "capitalize",
  },
  actionOption: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    marginTop: Theme.spacing.md,
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginTop: Theme.spacing.md,
    textAlign: "center",
  },
  editForm: {
    marginBottom: Theme.spacing.lg,
  },
  inputLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    elevation: 2,
  },
  addButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.md,
  },
  roleSelectOption: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: Theme.spacing.xs,
  },
  roleSelectText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default AdminUsersTab;
