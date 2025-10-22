import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../../lib/colors';
import { getUsers, User, changePassword } from '../../lib/api/userApi';
import { getAllRestaurants, approveRestaurant, rejectRestaurant, updateRestaurant, Restaurant } from '../../lib/api/restaurantApi';
import { getAllOrders, updateOrderStatus, Order } from '../../lib/api/orderApi';

interface AdminDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation, user, onLogout }) => {
  const { colors, spacing, borderRadius, typography } = Theme;
  const [activeTab, setActiveTab] = useState('Home');
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editContactInfo, setEditContactInfo] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const tabs = [
    { name: 'Home', icon: 'home' },
    { name: 'Users', icon: 'people', screen: 'UserManagement' },
    { name: 'Restaurants', icon: 'restaurant' },
    { name: 'Orders', icon: 'clipboard' },
    { name: 'Settings', icon: 'settings' },
  ];

  useEffect(() => {
    if (activeTab === 'Home') {
      loadDashboardData();
    } else if (activeTab === 'Users') {
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
      console.log('Failed to load orders:', error);
      // Don't show alert for orders loading, just log it
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all data for dashboard overview
      const [userData, restaurantData, orderData] = await Promise.all([
        getUsers(),
        getAllRestaurants(),
        getAllOrders()
      ]);
      setUsers(userData);
      setRestaurants(restaurantData);
      setOrders(orderData);
    } catch (error) {
      console.log('Failed to load dashboard data:', error);
      // Don't show alert for dashboard data loading, just log it
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

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setEditName(restaurant.name);
    setEditLocation(restaurant.location || '');
    setEditContactInfo(restaurant.contact_info || '');
    setEditStatus(restaurant.status);
    setShowEditModal(true);
  };

  const handleSaveRestaurantEdit = async () => {
    if (!editingRestaurant) return;

    try {
      await updateRestaurant(editingRestaurant.id, {
        name: editName,
        location: editLocation,
        contact_info: editContactInfo,
        status: editStatus,
      });
      Alert.alert('Success', 'Restaurant updated successfully');
      setShowEditModal(false);
      setEditingRestaurant(null);
      loadRestaurants(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update restaurant');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingRestaurant(null);
    setEditName('');
    setEditLocation('');
    setEditContactInfo('');
    setEditStatus('');
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
        Total: RWF {item.total_price}
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

      <View style={styles.actionButtons}>
        {!item.approved && (
          <>
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
          </>
        )}
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEditRestaurant(item)}
        >
          <Ionicons name="pencil" size={16} color={colors.background} />
          <Text style={[styles.buttonText, { color: colors.background }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        // Calculate comprehensive dashboard statistics
        const totalUsers = users.length;
        const totalRestaurants = restaurants.length;
        const approvedRestaurants = restaurants.filter(r => r.approved).length;
        const pendingRestaurants = restaurants.filter(r => !r.approved).length;
        const openRestaurants = restaurants.filter(r => r.status === 'open').length;
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const preparingOrders = orders.filter(o => o.status === 'preparing').length;
        const readyOrders = orders.filter(o => o.status === 'ready').length;
        const deliveringOrders = orders.filter(o => o.status === 'delivering').length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);

        // Calculate additional metrics
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const ordersToday = orders.filter(o => {
          const orderDate = new Date(o.order_time);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        }).length;
        const revenueToday = orders.filter(o => {
          const orderDate = new Date(o.order_time);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        }).reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);

        // Recent activity (last 5 orders)
        const recentOrders = orders.slice(0, 5);

        // System health indicators
        const activeDeliveries = orders.filter(o => o.status === 'delivering' || o.status === 'ready').length;
        const systemHealth = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100) : 100;

        return (
          <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
            {/* Welcome Header */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                🏢 System Overview
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                Comprehensive analytics and platform insights at a glance
              </Text>
            </View>

            {/* Key Performance Indicators */}
            <View style={styles.statsSection}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>📊 Key Performance Indicators</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.adminStatCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="people" size={32} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{totalUsers}</Text>
                  <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Registered Users</Text>
                </View>
                <View style={[styles.adminStatCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="restaurant" size={32} color={colors.success} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{totalRestaurants}</Text>
                  <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Total Restaurants</Text>
                </View>
                <View style={[styles.adminStatCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="clipboard" size={32} color={colors.warning} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{totalOrders}</Text>
                  <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Total Orders</Text>
                </View>
                <View style={[styles.adminStatCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="cash" size={32} color={colors.info} />
                  <Text style={[styles.statValue, { color: colors.text }]}>RWF {totalRevenue.toFixed(2)}</Text>
                  <Text style={[styles.adminStatLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
                </View>
              </View>
            </View>

            {/* Today's Performance */}
            <View style={styles.todaySection}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>📈 Today's Performance</Text>
              <View style={styles.todayGrid}>
                <View style={[styles.todayCard, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="today" size={24} color={colors.primary} />
                  <Text style={[styles.todayValue, { color: colors.primary }]}>{ordersToday}</Text>
                  <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Orders Today</Text>
                </View>
                <View style={[styles.todayCard, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="wallet" size={24} color={colors.success} />
                  <Text style={[styles.todayValue, { color: colors.success }]}>RWF {revenueToday.toFixed(2)}</Text>
                  <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Revenue Today</Text>
                </View>
                <View style={[styles.todayCard, { backgroundColor: colors.warning + '15' }]}>
                  <Ionicons name="trending-up" size={24} color={colors.warning} />
                  <Text style={[styles.todayValue, { color: colors.warning }]}>RWF {avgOrderValue.toFixed(2)}</Text>
                  <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Avg Order Value</Text>
                </View>
              </View>
            </View>

            {/* Restaurant Ecosystem */}
            <View style={styles.restaurantStatusSection}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>🏪 Restaurant Ecosystem</Text>
              <View style={styles.statusGrid}>
                <View style={[styles.statusCard, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.statusValue, { color: colors.success }]}>{approvedRestaurants}</Text>
                  <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Approved</Text>
                </View>
                <View style={[styles.statusCard, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.statusValue, { color: colors.warning }]}>{pendingRestaurants}</Text>
                  <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Pending Approval</Text>
                </View>
                <View style={[styles.statusCard, { backgroundColor: colors.info + '20' }]}>
                  <Text style={[styles.statusValue, { color: colors.info }]}>{openRestaurants}</Text>
                  <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Currently Open</Text>
                </View>
              </View>
            </View>

            {/* Order Lifecycle */}
            <View style={styles.orderStatusSection}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>🚚 Order Lifecycle</Text>
              <View style={styles.lifecycleGrid}>
                <View style={[styles.lifecycleCard, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.lifecycleValue, { color: colors.warning }]}>{pendingOrders}</Text>
                  <Text style={[styles.lifecycleLabel, { color: colors.textSecondary }]}>Pending</Text>
                </View>
                <View style={[styles.lifecycleCard, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.lifecycleValue, { color: colors.primary }]}>{preparingOrders}</Text>
                  <Text style={[styles.lifecycleLabel, { color: colors.textSecondary }]}>Preparing</Text>
                </View>
                <View style={[styles.lifecycleCard, { backgroundColor: colors.info + '20' }]}>
                  <Text style={[styles.lifecycleValue, { color: colors.info }]}>{readyOrders}</Text>
                  <Text style={[styles.lifecycleLabel, { color: colors.textSecondary }]}>Ready</Text>
                </View>
                <View style={[styles.lifecycleCard, { backgroundColor: colors.info + '20' }]}>
                  <Text style={[styles.lifecycleValue, { color: colors.info }]}>{deliveringOrders}</Text>
                  <Text style={[styles.lifecycleLabel, { color: colors.textSecondary }]}>Delivering</Text>
                </View>
                <View style={[styles.lifecycleCard, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.lifecycleValue, { color: colors.success }]}>{deliveredOrders}</Text>
                  <Text style={[styles.lifecycleLabel, { color: colors.textSecondary }]}>Delivered</Text>
                </View>
                <View style={[styles.lifecycleCard, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.lifecycleValue, { color: colors.error }]}>{cancelledOrders}</Text>
                  <Text style={[styles.lifecycleLabel, { color: colors.textSecondary }]}>Cancelled</Text>
                </View>
              </View>
            </View>

            {/* System Health */}
            <View style={styles.healthSection}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>⚡ System Health</Text>
              <View style={styles.healthGrid}>
                <View style={[styles.healthCard, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="bicycle" size={24} color={colors.primary} />
                  <Text style={[styles.healthValue, { color: colors.primary }]}>{activeDeliveries}</Text>
                  <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Active Deliveries</Text>
                </View>
                <View style={[styles.healthCard, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                  <Text style={[styles.healthValue, { color: colors.success }]}>{systemHealth.toFixed(1)}%</Text>
                  <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Success Rate</Text>
                </View>
                <View style={[styles.healthCard, { backgroundColor: colors.warning + '15' }]}>
                  <Ionicons name="time" size={24} color={colors.warning} />
                  <Text style={[styles.healthValue, { color: colors.warning }]}>{orders.filter(o => o.status !== 'delivered').length}</Text>
                  <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Orders in Progress</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={[styles.adminSectionTitle, { color: colors.text }]}>⚡ Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
                  onPress={() => setActiveTab('Users')}
                >
                  <Ionicons name="people" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>Manage Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.success }]}
                  onPress={() => setActiveTab('Restaurants')}
                >
                  <Ionicons name="restaurant" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>Review Restaurants</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.warning }]}
                  onPress={() => setActiveTab('Orders')}
                >
                  <Ionicons name="clipboard" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>Process Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.info }]}
                  onPress={() => setActiveTab('Settings')}
                >
                  <Ionicons name="settings" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>System Settings</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Activity */}
            {recentOrders.length > 0 && (
              <View style={styles.recentActivitySection}>
                <Text style={[styles.adminSectionTitle, { color: colors.text }]}>📋 Recent Activity</Text>
                {recentOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.recentOrderCard, { backgroundColor: colors.surface }]}
                    onPress={() => setActiveTab('Orders')}
                  >
                    <View style={styles.recentOrderLeft}>
                      <Text style={[styles.recentOrderTitle, { color: colors.text }]}>
                        Order #{order.id}
                      </Text>
                      <Text style={[styles.recentOrderSubtitle, { color: colors.textSecondary }]}>
                        {order.customer?.name} • {order.restaurant.name}
                      </Text>
                      <Text style={[styles.recentOrderTime, { color: colors.textSecondary }]}>
                        {new Date(order.order_time).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.recentOrderRight}>
                      <View style={[styles.miniStatusBadge, {
                        backgroundColor: order.status === 'delivered' ? colors.success + '20' :
                                        order.status === 'preparing' ? colors.warning + '20' :
                                        order.status === 'pending' ? colors.primary + '20' :
                                        order.status === 'ready' ? colors.info + '20' :
                                        order.status === 'delivering' ? colors.info + '20' : colors.error + '20'
                      }]}>
                        <Text style={[styles.miniStatusText, {
                          color: order.status === 'delivered' ? colors.success :
                                 order.status === 'preparing' ? colors.warning :
                                 order.status === 'pending' ? colors.primary :
                                 order.status === 'ready' ? colors.info :
                                 order.status === 'delivering' ? colors.info : colors.error
                        }]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>
                      <Text style={[styles.recentOrderAmount, { color: colors.primary }]}>
                        RWF {parseFloat(order.total_price.toString()).toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        );
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

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Edit Restaurant Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Restaurant</Text>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Restaurant Name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter restaurant name"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Enter location"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Info</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={editContactInfo}
              onChangeText={setEditContactInfo}
              placeholder="Enter contact information"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Status</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={editStatus}
                onValueChange={(itemValue) => setEditStatus(itemValue)}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.primary}
              >
                <Picker.Item label="Select status..." value="" />
                <Picker.Item label="Open" value="open" />
                <Picker.Item label="Closed" value="closed" />
                <Picker.Item label="Temporarily Closed" value="temporarily_closed" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={handleCancelEdit}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveRestaurantEdit}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
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
  editButton: {
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
  // Admin Home Dashboard Styles
  homeContainer: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  welcomeSection: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary + '10',
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.primary + '20',
  },
  welcomeTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: Theme.typography.fontSize.md,
  },
  statsSection: {
    marginBottom: Theme.spacing.xl,
  },
  adminSectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  adminStatCard: {
    width: '48%',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  adminStatLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  restaurantStatusSection: {
    marginBottom: Theme.spacing.xl,
  },
  orderStatusSection: {
    marginBottom: Theme.spacing.xl,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  statusLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  quickActionsSection: {
    marginBottom: Theme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  quickActionText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  recentActivitySection: {
    marginBottom: Theme.spacing.xl,
  },
  recentOrderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recentOrderLeft: {
    flex: 1,
  },
  recentOrderTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  recentOrderSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
  },
  recentOrderRight: {
    alignItems: 'flex-end',
  },
  miniStatusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  miniStatusText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  recentOrderAmount: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  // Today's Performance Section
  todaySection: {
    marginBottom: Theme.spacing.xl,
  },
  todayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  todayValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  todayLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  // Order Lifecycle Section
  lifecycleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lifecycleCard: {
    width: '31%',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  lifecycleValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  lifecycleLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  // System Health Section
  healthSection: {
    marginBottom: Theme.spacing.xl,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  healthValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  healthLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  recentOrderTime: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: Theme.borderRadius.lg,
    elevation: 5,
    padding: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.lg,
  },
  picker: {
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.sm,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  modalSaveButton: {
    // backgroundColor set in component
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default AdminDashboard;