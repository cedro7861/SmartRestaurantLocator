import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList, TextInput } from 'react-native';
import { Theme } from '../../lib/colors';
import { getOwnerMenuItems, MenuItem, updateMenuItem, deleteMenuItem } from '../../lib/api/menuApi';
import { updateProfile, changePassword } from '../../lib/api/userApi';
import { getOwnerOrders, Order } from '../../lib/api/orderApi';

interface OwnerDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ navigation, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    if (activeTab === 'menu') {
      loadMenuItems();
    } else if (activeTab === 'settings') {
      loadOrdersForAnalytics();
    }
  }, [activeTab]);

  // Refresh menu items when returning to menu tab
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (activeTab === 'menu') {
        loadMenuItems();
      }
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const loadMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const data = await getOwnerMenuItems(2); // Hardcoded for now
      setMenuItems(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoadingMenu(false);
    }
  };

  const loadOrdersForAnalytics = async () => {
    try {
      const data = await getOwnerOrders();
      setOrders(data);
    } catch (error) {
      console.log('Failed to load orders for analytics');
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditDescription(item.description || '');
    setEditCategory(item.category || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      await updateMenuItem(editingItem.id, {
        name: editName,
        price: parseFloat(editPrice),
        description: editDescription,
        category: editCategory,
      });
      Alert.alert('Success', 'Menu item updated successfully');
      setEditingItem(null);
      loadMenuItems(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update menu item');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
    setEditDescription('');
    setEditCategory('');
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenuItem(item.id);
              Alert.alert('Success', 'Menu item deleted successfully');
              loadMenuItems(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    try {
      const result = await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
      });
      Alert.alert('Success', 'Profile updated successfully');
      // Update the user context if needed
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const calculateAnalytics = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    return { totalOrders, totalRevenue, completedOrders, pendingOrders };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'restaurants':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Manage Restaurants</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Add, edit, and manage your restaurants here.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddRestaurant')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Add Restaurant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('ViewRestaurants')}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>View Restaurants</Text>
            </TouchableOpacity>
          </View>
        );
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Manage Orders</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              View and manage customer orders for your restaurants.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('ManageOrders')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>View All Orders</Text>
            </TouchableOpacity>
          </View>
        );
      case 'menu':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Manage Menu</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Add, edit, and manage menu items for your restaurants.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddMenuItem')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Add Menu Item</Text>
            </TouchableOpacity>

            {loadingMenu ? (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading menu items...</Text>
            ) : menuItems.length === 0 ? (
              <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                No menu items yet. Add your first menu item!
              </Text>
            ) : (
              <FlatList
                data={menuItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={[styles.menuItemCard, { backgroundColor: colors.surface }]}>
                    {editingItem?.id === item.id ? (
                      // Edit mode
                      <View>
                        <Text style={[styles.editLabel, { color: colors.text }]}>Name:</Text>
                        <TextInput
                          style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                          value={editName}
                          onChangeText={setEditName}
                          placeholder="Item name"
                          placeholderTextColor={colors.textSecondary}
                        />
                        <Text style={[styles.editLabel, { color: colors.text }]}>Price:</Text>
                        <TextInput
                          style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                          value={editPrice}
                          onChangeText={setEditPrice}
                          placeholder="Price"
                          keyboardType="numeric"
                          placeholderTextColor={colors.textSecondary}
                        />
                        <Text style={[styles.editLabel, { color: colors.text }]}>Description:</Text>
                        <TextInput
                          style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                          value={editDescription}
                          onChangeText={setEditDescription}
                          placeholder="Description"
                          multiline
                          placeholderTextColor={colors.textSecondary}
                        />
                        <Text style={[styles.editLabel, { color: colors.text }]}>Category:</Text>
                        <TextInput
                          style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                          value={editCategory}
                          onChangeText={setEditCategory}
                          placeholder="Category"
                          placeholderTextColor={colors.textSecondary}
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: colors.success }]}
                            onPress={handleSaveEdit}
                          >
                            <Text style={[styles.editButtonText, { color: colors.background }]}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: colors.error }]}
                            onPress={handleCancelEdit}
                          >
                            <Text style={[styles.editButtonText, { color: colors.background }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // View mode
                      <>
                        <View style={styles.menuItemHeader}>
                          <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                          <Text style={[styles.menuItemPrice, { color: colors.primary }]}>${item.price}</Text>
                        </View>
                        <Text style={[styles.menuItemRestaurant, { color: colors.textSecondary }]}>
                          {item.restaurant?.name}
                        </Text>
                        {item.category && (
                          <Text style={[styles.menuItemCategory, { color: colors.textSecondary }]}>
                            {item.category}
                          </Text>
                        )}
                        {item.description && (
                          <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                            {item.description}
                          </Text>
                        )}
                        <View style={styles.menuItemActions}>
                          <TouchableOpacity
                            style={[styles.menuActionButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleEditMenuItem(item)}
                          >
                            <Text style={[styles.menuActionText, { color: colors.background }]}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.menuActionButton, { backgroundColor: colors.error }]}
                            onPress={() => handleDeleteMenuItem(item)}
                          >
                            <Text style={[styles.menuActionText, { color: colors.background }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        );
      case 'settings':
        const analytics = calculateAnalytics();
        return (
          <ScrollView style={styles.tabContent}>
            {/* Profile Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Settings</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={profileName}
                onChangeText={setProfileName}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={profileEmail}
                onChangeText={setProfileEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Phone"
                placeholderTextColor={colors.textSecondary}
                value={profilePhone}
                onChangeText={setProfilePhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateProfile}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Update Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Password Change */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Current Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="New Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Confirm New Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Change Password</Text>
              </TouchableOpacity>
            </View>

            {/* Notification Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Settings</Text>
              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Enable Notifications</Text>
                <TouchableOpacity
                  style={[styles.toggle, notificationsEnabled && styles.toggleActive]}
                  onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Email Notifications</Text>
                <TouchableOpacity
                  style={[styles.toggle, emailNotifications && styles.toggleActive]}
                  onPress={() => setEmailNotifications(!emailNotifications)}
                >
                  <View style={[styles.toggleKnob, emailNotifications && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>Push Notifications</Text>
                <TouchableOpacity
                  style={[styles.toggle, pushNotifications && styles.toggleActive]}
                  onPress={() => setPushNotifications(!pushNotifications)}
                >
                  <View style={[styles.toggleKnob, pushNotifications && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Business Analytics */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Analytics</Text>
              <View style={styles.analyticsGrid}>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.analyticsNumber, { color: colors.primary }]}>{analytics.totalOrders}</Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Total Orders</Text>
                </View>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.analyticsNumber, { color: colors.success }]}>${analytics.totalRevenue.toFixed(2)}</Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
                </View>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.analyticsNumber, { color: colors.success }]}>{analytics.completedOrders}</Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Completed</Text>
                </View>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.analyticsNumber, { color: colors.warning }]}>{analytics.pendingOrders}</Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Pending</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Owner Dashboard</Text>
      <Text style={[styles.welcome, { color: colors.text }]}>Welcome, {user?.name || 'User'}!</Text>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'restaurants' ? colors.primary : colors.textSecondary }]}>
            Restaurants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'orders' ? colors.primary : colors.textSecondary }]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'menu' ? colors.primary : colors.textSecondary }]}>
            Menu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'settings' ? colors.primary : colors.textSecondary }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={onLogout}>
        <Text style={[styles.logoutText, { color: colors.background }]}>Logout</Text>
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
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: Theme.spacing.lg,
  },
  tabTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  tabDescription: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xl,
  },
  actionButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  logoutButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  logoutText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
  noItemsText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  menuItemCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  menuItemName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  menuItemRestaurant: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  menuItemCategory: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  menuItemDescription: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuActionButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  menuActionText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  editLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  editButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  settingsSection: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  toggleLabel: {
    fontSize: Theme.typography.fontSize.md,
  },
  toggle: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Theme.colors.primary,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.background,
  },
  toggleKnobActive: {
    backgroundColor: Theme.colors.background,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  analyticsNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  analyticsLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
});

export default OwnerDashboard;