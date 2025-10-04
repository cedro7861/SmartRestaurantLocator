import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../lib/colors';
import { getUsers, User, changePassword } from '../../lib/api/userApi';
import { getAllRestaurants, approveRestaurant, rejectRestaurant, Restaurant } from '../../lib/api/restaurantApi';
import { getAllOrders, updateOrderStatus, Order } from '../../lib/api/orderApi';

interface AdminDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation, user, onLogout }) => {
  const { colors, spacing, borderRadius, typography } = Theme;
  const [activeTab, setActiveTab] = useState('Users');
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const tabs = [
    { name: 'Users', icon: 'people', screen: 'UserManagement' },
    { name: 'Restaurants', icon: 'restaurant' },
    { name: 'Orders', icon: 'clipboard' },
    { name: 'Settings', icon: 'settings' },
  ];

  useEffect(() => {
    if (activeTab === 'Users') {
      loadUsers();
    } else if (activeTab === 'Restaurants') {
      loadRestaurants();
    } else if (activeTab === 'Orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await getUsers();
      setUsers(userData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const restaurantData = await getAllRestaurants();
      setRestaurants(restaurantData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const orderData = await getAllOrders();
      setOrders(orderData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRestaurant = async (restaurant: Restaurant) => {
    try {
      await approveRestaurant(restaurant.id);
      Alert.alert('Success', `${restaurant.name} has been approved`);
      loadRestaurants(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to approve restaurant');
    }
  };

  const handleRejectRestaurant = async (restaurant: Restaurant) => {
    Alert.alert(
      'Reject Restaurant',
      `Are you sure you want to reject ${restaurant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectRestaurant(restaurant.id);
              Alert.alert('Success', `${restaurant.name} has been rejected`);
              loadRestaurants(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to reject restaurant');
            }
          },
        },
      ]
    );
  };

  const handleUpdateOrderStatus = async (order: Order, newStatus: string) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      loadOrders(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
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

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.surface }]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.orderStatus, {
            color: item.status === 'delivered' ? colors.success :
                   item.status === 'preparing' ? colors.warning :
                   item.status === 'pending' ? colors.primary : colors.error,
            backgroundColor: item.status === 'delivered' ? colors.success + '20' :
                           item.status === 'preparing' ? colors.warning + '20' :
                           item.status === 'pending' ? colors.primary + '20' : colors.error + '20'
          }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
        Customer: {item.customer?.name} ({item.customer?.email})
      </Text>
      <Text style={[styles.restaurantInfo, { color: colors.textSecondary }]}>
        Restaurant: {item.restaurant.name}
      </Text>
      <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
        {new Date(item.order_time).toLocaleString()}
      </Text>
      <Text style={[styles.orderTotal, { color: colors.primary }]}>
        Total: ${item.total_price}
      </Text>
      <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
        Items: {item.order_items.length}
      </Text>

      {item.status !== 'delivered' && (
        <View style={styles.orderActions}>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.warning }]}
              onPress={() => handleUpdateOrderStatus(item, 'preparing')}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>Start Preparing</Text>
            </TouchableOpacity>
          )}
          {item.status === 'preparing' && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.success }]}
              onPress={() => handleUpdateOrderStatus(item, 'ready')}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>Mark Ready</Text>
            </TouchableOpacity>
          )}
          {item.status === 'ready' && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: colors.primary }]}
              onPress={() => handleUpdateOrderStatus(item, 'delivered')}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={[styles.restaurantCard, { backgroundColor: colors.surface }]}>
      <View style={styles.restaurantHeader}>
        <Text style={[styles.restaurantName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.approvalStatus, {
            color: item.approved ? colors.success : colors.warning,
            backgroundColor: item.approved ? colors.success + '20' : colors.warning + '20'
          }]}>
            {item.approved ? 'Approved' : 'Pending'}
          </Text>
          <Text style={[styles.restaurantStatus, {
            color: item.status === 'open' ? colors.success : colors.error
          }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.restaurantLocation, { color: colors.textSecondary }]}>{item.location}</Text>
      <Text style={[styles.ownerInfo, { color: colors.textSecondary }]}>
        Owner: {item.owner?.name} ({item.owner?.email})
      </Text>
      <Text style={[styles.orderCount, { color: colors.primary }]}>
        Orders: {item._count?.orders || 0}
      </Text>

      {!item.approved && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.approveButton, { backgroundColor: colors.success }]}
            onPress={() => handleApproveRestaurant(item)}
          >
            <Ionicons name="checkmark" size={16} color={colors.background} />
            <Text style={[styles.buttonText, { color: colors.background }]}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: colors.error }]}
            onPress={() => handleRejectRestaurant(item)}
          >
            <Ionicons name="close" size={16} color={colors.background} />
            <Text style={[styles.buttonText, { color: colors.background }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Users':
        return loading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.user_id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'Restaurants':
        return loading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading restaurants...</Text>
        ) : (
          <View>
            <View style={styles.restaurantStats}>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{restaurants.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {restaurants.filter(r => r.approved).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {restaurants.filter(r => !r.approved).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
              </View>
            </View>
            <FlatList
              data={restaurants}
              renderItem={renderRestaurant}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        );
      case 'Orders':
        return loading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
        ) : (
          <View>
            <View style={styles.restaurantStats}>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{orders.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Orders</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {orders.filter(o => o.status === 'pending').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {orders.filter(o => o.status === 'delivered').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Delivered</Text>
              </View>
            </View>
            <FlatList
              data={orders}
              renderItem={renderOrder}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        );
      case 'Settings':
        return (
          <View style={styles.settingsContainer}>
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
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleChangePassword}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>Change Password</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.admin }]}>Admin Dashboard</Text>
      <Text style={[styles.welcome, { color: colors.text }]}>Welcome, {user?.name || 'User'}!</Text>
      <Text style={[styles.role, { color: colors.textSecondary }]}>Role: {user?.role || 'Unknown'}</Text>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, activeTab === tab.name && styles.activeTab]}
            onPress={() => {
              if (tab.screen) {
                navigation.navigate(tab.screen);
              } else {
                setActiveTab(tab.name);
              }
            }}
          >
            <Ionicons name={tab.icon as any} size={24} color={activeTab === tab.name ? colors.background : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === tab.name && styles.activeTabText]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={onLogout}>
        <Ionicons name="log-out" size={20} color={colors.text} />
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
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.fontSize.md,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.lg,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  activeTab: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  activeTabText: {
    color: Theme.colors.background,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  content: {
    flex: 1,
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
  placeholderText: {
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.xl,
  },
  settingsContainer: {
    flex: 1,
    paddingTop: Theme.spacing.lg,
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
  button: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  buttonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  restaurantStats: {
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
  restaurantCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  restaurantName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  approvalStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
  },
  restaurantStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  restaurantLocation: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  ownerInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  orderCount: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    flex: 1,
    marginRight: Theme.spacing.xs,
    justifyContent: 'center',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    flex: 1,
    marginLeft: Theme.spacing.xs,
    justifyContent: 'center',
  },
  orderCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  orderId: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  orderStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    textTransform: 'uppercase',
  },
  customerInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  restaurantInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  orderTime: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  orderTotal: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  orderItems: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    minWidth: 100,
  },
});

export default AdminDashboard;