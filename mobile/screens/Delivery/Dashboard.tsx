import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList, TextInput } from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableDeliveries, getDeliveryHistory, updateOrderStatus, Order } from '../../lib/api/orderApi';
import { changePassword } from '../../lib/api/userApi';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDeliveryPersonDeliveries } from '../../lib/api/deliveryApi';

interface DeliveryDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ navigation, user, onLogout }) => {
   const [activeTab, setActiveTab] = useState('home');
   const [availableDeliveries, setAvailableDeliveries] = useState<Order[]>([]);
   const [deliveryHistory, setDeliveryHistory] = useState<Order[]>([]);
   const [currentDeliveries, setCurrentDeliveries] = useState<Order[]>([]);
   const [loading, setLoading] = useState(false);
   const [settingsLoading, setSettingsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [location, setLocation] = useState<Location.LocationObject | null>(null);
   const [mapView, setMapView] = useState(false);
   const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    // Get current location for map functionality
    getCurrentLocation();

    if (activeTab === 'home') {
      loadDashboardData();
    } else if (activeTab === 'deliveries') {
      loadAvailableDeliveries();
    } else if (activeTab === 'history') {
      loadDeliveryHistory();
    } else if (activeTab === 'earnings') {
      loadDeliveryHistory(); // For earnings calculations
    }
  }, [activeTab]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadAvailableDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableDeliveries();
      setAvailableDeliveries(data || []);
    } catch (error) {
      console.log('Failed to load available deliveries:', error);
      setError('Failed to load available deliveries');
      setAvailableDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

   const loadDeliveryHistory = async () => {
     setLoading(true);
     setError(null);
     try {
       const data = await getDeliveryHistory();
       setDeliveryHistory(data || []);
     } catch (error) {
       console.log('Failed to load delivery history:', error);
       setError('Failed to load delivery history');
       setDeliveryHistory([]);
     } finally {
       setLoading(false);
     }
   };

   const loadDashboardData = async () => {
     setLoading(true);
     setError(null);
     try {
       const [availableData, historyData] = await Promise.all([
         getAvailableDeliveries(),
         getDeliveryHistory()
       ]);
       setAvailableDeliveries(availableData || []);
       setDeliveryHistory(historyData || []);
     } catch (error) {
       console.log('Failed to load dashboard data:', error);
       setError('Failed to load dashboard data');
       setAvailableDeliveries([]);
       setDeliveryHistory([]);
     } finally {
       setLoading(false);
     }
   };

  const handleAcceptDelivery = async (order: Order) => {
     try {
       await updateOrderStatus(order.id, 'delivering');
       Alert.alert('Success', 'Delivery accepted! Order is now out for delivery.');
       setCurrentDeliveries([...currentDeliveries, { ...order, status: 'delivering' }]);
       loadAvailableDeliveries(); // Refresh available deliveries
       loadDashboardData(); // Refresh dashboard data
     } catch (error) {
       Alert.alert('Error', 'Failed to accept delivery');
     }
   };

   const handleCompleteDelivery = async (order: Order) => {
     try {
       await updateOrderStatus(order.id, 'delivered');
       Alert.alert('Success', 'Delivery completed successfully!');
       setCurrentDeliveries(currentDeliveries.filter(o => o.id !== order.id));
       loadDeliveryHistory(); // Refresh history
       loadDashboardData(); // Refresh dashboard data
     } catch (error) {
       Alert.alert('Error', 'Failed to complete delivery');
     }
   };

  const renderDeliveryItem = ({ item }: { item: Order }) => (
     <View style={[styles.deliveryCard, { backgroundColor: colors.surface }]}>
       <View style={styles.deliveryHeader}>
         <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
         <Text style={[styles.deliveryStatus, {
           color: item.status === 'delivered' ? colors.success :
                   item.status === 'delivering' ? colors.primary : colors.warning,
           backgroundColor: item.status === 'delivered' ? colors.success + '20' :
                           item.status === 'delivering' ? colors.primary + '20' : colors.warning + '20'
         }]}>
           {item.status === 'ready' ? 'Ready for Delivery' :
            item.status === 'delivering' ? 'Out for Delivery' :
            item.status === 'delivered' ? 'Delivered' : item.status}
         </Text>
       </View>

       <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
         Customer: {item.customer?.name || 'N/A'} {item.customer?.phone ? `(${item.customer.phone})` : ''}
       </Text>
       <Text style={[styles.restaurantInfo, { color: colors.textSecondary }]}>
         Restaurant: {item.restaurant?.name || 'N/A'}
       </Text>
       <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
         {item.order_time ? new Date(item.order_time).toLocaleString() : 'N/A'}
       </Text>
       <Text style={[styles.orderTotal, { color: colors.primary }]}>
         Total: ${typeof item.total_price === 'number' ? item.total_price.toFixed(2) : parseFloat(item.total_price || '0').toFixed(2)}
       </Text>
       <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
         Items: {item.order_items?.length || 0}
       </Text>

       {item.status === 'ready' && (
         <TouchableOpacity
           style={[styles.actionButton, { backgroundColor: colors.primary }]}
           onPress={() => handleAcceptDelivery(item)}
         >
           <Text style={[styles.actionButtonText, { color: colors.background }]}>Accept Delivery</Text>
         </TouchableOpacity>
       )}

       {item.status === 'delivering' && (
         <TouchableOpacity
           style={[styles.actionButton, { backgroundColor: colors.success }]}
           onPress={() => handleCompleteDelivery(item)}
         >
           <Text style={[styles.actionButtonText, { color: colors.background }]}>Mark Delivered</Text>
         </TouchableOpacity>
       )}
     </View>
   );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        // Calculate delivery statistics
        const totalDeliveries = deliveryHistory.length;
        const availableDeliveriesCount = availableDeliveries.length;
        const currentDeliveriesCount = currentDeliveries.length;
        const totalEarnings = deliveryHistory.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
        const todayDeliveries = deliveryHistory.filter(order =>
          new Date(order.order_time).toDateString() === new Date().toDateString()
        ).length;
        const todayEarnings = deliveryHistory
          .filter(order => new Date(order.order_time).toDateString() === new Date().toDateString())
          .reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);


        return (
          <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
            {/* Welcome Header */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Welcome, {user?.name}
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                Delivery Management Dashboard
              </Text>
            </View>

            {/* Current Active Delivery - Show if any */}
            {currentDeliveries.length > 0 && (
              <View style={styles.currentDeliverySection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Delivery</Text>
                {currentDeliveries.map((order) => (
                  <View key={order.id} style={[styles.currentDeliveryCard, { backgroundColor: colors.primary + '10' }]}>
                    <View style={styles.currentDeliveryHeader}>
                      <Ionicons name="navigate" size={24} color={colors.primary} />
                      <Text style={[styles.currentDeliveryTitle, { color: colors.text }]}>
                        Order #{order.id}
                      </Text>
                      <View style={[styles.deliveryStatusBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.deliveryStatusText, { color: colors.primary }]}>
                          🚴 Delivering
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.currentDeliveryInfo, { color: colors.textSecondary }]}>
                      Customer: {order.customer?.name || 'N/A'} • {order.customer?.phone || 'N/A'}
                    </Text>
                    <Text style={[styles.currentDeliveryInfo, { color: colors.textSecondary }]}>
                      Restaurant: {order.restaurant?.name || 'N/A'}
                    </Text>
                    <Text style={[styles.currentDeliveryAmount, { color: colors.primary }]}>
                      ${typeof order.total_price === 'number' ? order.total_price.toFixed(2) : parseFloat(order.total_price || '0').toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={[styles.completeDeliveryButton, { backgroundColor: colors.success }]}
                      onPress={() => handleCompleteDelivery(order)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={colors.background} />
                      <Text style={[styles.completeDeliveryText, { color: colors.background }]}>
                        Mark as Delivered
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Today's Summary */}
            <View style={styles.todaySummarySection}>
              <View style={styles.todaySummaryGrid}>
                <View style={[styles.todaySummaryCard, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="bicycle" size={32} color={colors.primary} />
                  <Text style={[styles.todaySummaryValue, { color: colors.primary }]}>{todayDeliveries}</Text>
                  <Text style={[styles.todaySummaryLabel, { color: colors.textSecondary }]}>Today's Deliveries</Text>
                </View>
                <View style={[styles.todaySummaryCard, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="cash" size={32} color={colors.success} />
                  <Text style={[styles.todaySummaryValue, { color: colors.success }]}>${todayEarnings.toFixed(2)}</Text>
                  <Text style={[styles.todaySummaryLabel, { color: colors.textSecondary }]}>Today's Earnings</Text>
                </View>
              </View>
            </View>

            {/* Delivery Overview */}
            <View style={styles.deliveryOverviewSection}>
              <View style={styles.deliveryOverviewGrid}>
                <TouchableOpacity style={[styles.deliveryOverviewCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('earnings')}>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                  <Text style={[styles.deliveryOverviewValue, { color: colors.text }]}>{totalDeliveries}</Text>
                  <Text style={[styles.deliveryOverviewLabel, { color: colors.textSecondary }]}>Total Deliveries</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deliveryOverviewCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('deliveries')}>
                  <Ionicons name="time" size={32} color={colors.warning} />
                  <Text style={[styles.deliveryOverviewValue, { color: colors.text }]}>{availableDeliveriesCount}</Text>
                  <Text style={[styles.deliveryOverviewLabel, { color: colors.textSecondary }]}>Available Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deliveryOverviewCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('deliveries')}>
                  <Ionicons name="navigate" size={32} color={colors.primary} />
                  <Text style={[styles.deliveryOverviewValue, { color: colors.text }]}>{currentDeliveriesCount}</Text>
                  <Text style={[styles.deliveryOverviewLabel, { color: colors.textSecondary }]}>Active Deliveries</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deliveryOverviewCard, { backgroundColor: colors.surface }]} onPress={() => setActiveTab('earnings')}>
                  <Ionicons name="wallet" size={32} color={colors.info} />
                  <Text style={[styles.deliveryOverviewValue, { color: colors.text }]}>${totalEarnings.toFixed(2)}</Text>
                  <Text style={[styles.deliveryOverviewLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
                  onPress={() => setActiveTab('deliveries')}
                >
                  <Ionicons name="list" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>View Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.success }]}
                  onPress={() => setActiveTab('earnings')}
                >
                  <Ionicons name="cash" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>View Earnings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.info }]}
                  onPress={() => navigation.navigate('DeliveryHistory')}
                >
                  <Ionicons name="time" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>Delivery History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.warning }]}
                  onPress={() => setActiveTab('settings')}
                >
                  <Ionicons name="settings" size={24} color={colors.background} />
                  <Text style={[styles.quickActionText, { color: colors.background }]}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
      case 'deliveries':
        return (
          <View style={styles.tabContent}>
            <View style={styles.deliveriesHeader}>
              <Text style={[styles.tabTitle, { color: colors.text }]}>Available Deliveries</Text>
              <TouchableOpacity
                style={[styles.mapButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('DeliveryMap')}
              >
                <Ionicons name="map" size={20} color={colors.background} />
                <Text style={[styles.mapButtonText, { color: colors.background }]}>View Map</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Orders ready for delivery. Accept them to start delivering.
            </Text>

            {/* Current Deliveries First */}
            {currentDeliveries.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl }]}>
                  Current Deliveries ({currentDeliveries.length})
                </Text>
                <FlatList
                  data={currentDeliveries}
                  renderItem={renderDeliveryItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.listContainer}
                />
              </>
            )}

            {/* Available Deliveries */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl }]}>
              Available Orders ({availableDeliveries.length})
            </Text>
            {loading ? (
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading deliveries...</Text>
            ) : error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : availableDeliveries.length === 0 ? (
              <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                No deliveries available at the moment.
              </Text>
            ) : (
              <FlatList
                data={availableDeliveries}
                renderItem={renderDeliveryItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        );
      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Delivery History</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Your completed deliveries and performance stats.
            </Text>

            {/* Summary Stats */}
            {deliveryHistory.length > 0 && (
              <View style={styles.historySummary}>
                <View style={styles.summaryGrid}>
                  <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{deliveryHistory.length}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Deliveries</Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                      ${deliveryHistory.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0).toFixed(2)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
                  </View>
                  <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryValue, { color: colors.warning }]}>
                      ${(deliveryHistory.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0) / deliveryHistory.length).toFixed(2)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg per Delivery</Text>
                  </View>
                </View>
              </View>
            )}

            {loading ? (
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading history...</Text>
            ) : error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : deliveryHistory.length === 0 ? (
              <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                No delivery history yet.
              </Text>
            ) : (
              <FlatList
                data={deliveryHistory}
                renderItem={renderDeliveryItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        );
      case 'earnings':
        const earningsTotal = deliveryHistory.reduce((sum, order) => {
          const price = order.total_price || 0;
          return sum + (typeof price === 'number' ? price : parseFloat(price) || 0);
        }, 0);
        const completedDeliveries = deliveryHistory.length;
        const averageEarnings = completedDeliveries > 0 ? earningsTotal / completedDeliveries : 0;

        // Calculate weekly/monthly earnings
        const today = new Date();
        const thisWeek = deliveryHistory.filter(order => {
          const orderDate = new Date(order.order_time);
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        });
        const thisMonth = deliveryHistory.filter(order => {
          const orderDate = new Date(order.order_time);
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          return orderDate >= monthAgo;
        });

        const weeklyEarnings = thisWeek.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
        const monthlyEarnings = thisMonth.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);

        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Earnings Overview</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Track your delivery earnings and performance metrics.
            </Text>

            {/* Main Earnings Stats */}
            <View style={styles.earningsGrid}>
              <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningsNumber, { color: colors.primary }]}>${earningsTotal.toFixed(2)}</Text>
                <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
              </View>
              <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningsNumber, { color: colors.success }]}>{completedDeliveries}</Text>
                <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Total Deliveries</Text>
              </View>
              <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningsNumber, { color: colors.warning }]}>${averageEarnings.toFixed(2)}</Text>
                <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Avg per Delivery</Text>
              </View>
            </View>

            {/* Period Earnings */}
            <View style={styles.periodEarningsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Earnings by Period</Text>
              <View style={styles.periodGrid}>
                <View style={[styles.periodCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.periodValue, { color: colors.info }]}>${weeklyEarnings.toFixed(2)}</Text>
                  <Text style={[styles.periodLabel, { color: colors.textSecondary }]}>This Week</Text>
                  <Text style={[styles.periodSubtext, { color: colors.textSecondary }]}>{thisWeek.length} deliveries</Text>
                </View>
                <View style={[styles.periodCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.periodValue, { color: colors.info }]}>${monthlyEarnings.toFixed(2)}</Text>
                  <Text style={[styles.periodLabel, { color: colors.textSecondary }]}>This Month</Text>
                  <Text style={[styles.periodSubtext, { color: colors.textSecondary }]}>{thisMonth.length} deliveries</Text>
                </View>
              </View>
            </View>

            {/* Recent Earnings */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl }]}>
              Recent Earnings
            </Text>
            {deliveryHistory.length === 0 ? (
              <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                No earnings yet. Complete your first delivery to start earning!
              </Text>
            ) : (
              deliveryHistory.slice(0, 10).map((order) => (
                <View key={order.id} style={[styles.earningsItem, { backgroundColor: colors.surface }]}>
                  <View style={styles.earningsItemLeft}>
                    <Text style={[styles.earningsItemTitle, { color: colors.text }]}>
                      Order #{order.id}
                    </Text>
                    <Text style={[styles.earningsItemSubtitle, { color: colors.textSecondary }]}>
                      {new Date(order.order_time).toLocaleDateString()} • {order.restaurant?.name || 'N/A'}
                    </Text>
                  </View>
                  <Text style={[styles.earningsItemAmount, { color: colors.primary }]}>
                    ${typeof order.total_price === 'number' ? order.total_price.toFixed(2) : parseFloat(order.total_price || '0').toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        );
      case 'settings':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Manage your account and preferences.
            </Text>

            {/* Profile Information */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Name:</Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>{user?.name || 'N/A'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Email:</Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>{user?.email || 'N/A'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Phone:</Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>{user?.phone || 'N/A'}</Text>
              </View>
            </View>

            {/* Change Password Section */}
            <View style={styles.changePasswordSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                Update your password to keep your account secure.
              </Text>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Current Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
                <TextInput
                  style={[styles.passwordInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="New Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
                <TextInput
                  style={[styles.passwordInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Confirm New Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.changePasswordButton, { backgroundColor: colors.primary }]}
                onPress={() => Alert.alert('Success', 'Password updated successfully!')}
              >
                <Text style={[styles.changePasswordButtonText, { color: colors.background }]}>
                  Update Password
                </Text>
              </TouchableOpacity>
            </View>

            {/* App Settings */}
            <View style={styles.otherSettingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>

              <View style={styles.settingsList}>
                <TouchableOpacity
                  style={[styles.settingItem, { backgroundColor: colors.surface }]}
                  onPress={() => Alert.alert('Info', 'Notifications feature coming soon!')}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingItem, { backgroundColor: colors.surface }]}
                  onPress={() => Alert.alert('Info', 'Location permissions are managed by your device settings.')}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="location-outline" size={24} color={colors.primary} />
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Location Services</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingItem, { backgroundColor: colors.surface }]}
                  onPress={() => Alert.alert('Info', 'Help & Support feature coming soon!')}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Help & Support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingItem, { backgroundColor: colors.error + '10' }]}
                  onPress={onLogout}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    <Text style={[styles.settingTitle, { color: colors.error }]}>Logout</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.error} />
                </TouchableOpacity>
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
      <Text style={[styles.title, { color: colors.text }]}>Delivery Dashboard</Text>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'home' ? colors.primary : colors.textSecondary }]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'deliveries' && styles.activeTab]}
          onPress={() => setActiveTab('deliveries')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'deliveries' ? colors.primary : colors.textSecondary }]}>
            Deliveries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'history' ? colors.primary : colors.textSecondary }]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'earnings' ? colors.primary : colors.textSecondary }]}>
            Earnings
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
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.md,
  },
  noItemsText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
    color: Theme.colors.error,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  deliveryCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  orderId: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  deliveryStatus: {
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
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  earningsCard: {
    width: '48%',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  earningsNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  earningsLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  earningsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  earningsItemLeft: {
    flex: 1,
  },
  earningsItemTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  earningsItemSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  earningsItemAmount: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
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
  // Delivery Home Dashboard Styles
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
  todaySummarySection: {
    marginBottom: Theme.spacing.xl,
  },
  todaySummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todaySummaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todaySummaryValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  todaySummaryLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: Theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
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
  statLabel: {
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
  recentDeliveryCard: {
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
  recentDeliveryLeft: {
    flex: 1,
  },
  recentDeliveryTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  recentDeliverySubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  recentDeliveryDate: {
    fontSize: Theme.typography.fontSize.sm,
  },
  recentDeliveryRight: {
    alignItems: 'flex-end',
  },
  deliveryStatusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  deliveryStatusText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  recentDeliveryAmount: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  // Current Delivery Styles
  currentDeliverySection: {
    marginBottom: Theme.spacing.xl,
  },
  currentDeliveryCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.primary + '30',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  currentDeliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  currentDeliveryTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  currentDeliveryInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  currentDeliveryAmount: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  completeDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeDeliveryText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.sm,
  },
  // Map and Deliveries Header Styles
  deliveriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
  },
  // System Overview Styles
  systemOverviewSection: {
    marginBottom: Theme.spacing.xl,
  },
  systemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  systemCard: {
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
  systemValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  systemLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  // Performance Metrics Styles
  performanceSection: {
    marginBottom: Theme.spacing.xl,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceCard: {
    flex: 1,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  performanceTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.sm,
  },
  performanceValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  performanceSubtext: {
    fontSize: Theme.typography.fontSize.sm,
  },
  // Delivery Overview Styles
  deliveryOverviewSection: {
    marginBottom: Theme.spacing.xl,
  },
  deliveryOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deliveryOverviewCard: {
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
  deliveryOverviewValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  deliveryOverviewLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  // Customer Insights Styles
  customerInsightsSection: {
    marginBottom: Theme.spacing.xl,
  },
  customerInsightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  customerInsightCard: {
    width: '48%',
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customerInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  customerInsightTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.sm,
  },
  customerInsightValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  customerInsightSubtext: {
    fontSize: Theme.typography.fontSize.sm,
  },
  // Change Password Styles
  changePasswordSection: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionDescription: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  passwordInputContainer: {
    marginBottom: Theme.spacing.lg,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.md,
  },
  changePasswordButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  changePasswordButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  otherSettingsSection: {
    marginBottom: Theme.spacing.xl,
  },
  // History Summary Styles
  historySummary: {
    marginBottom: Theme.spacing.xl,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  // Period Earnings Styles
  periodEarningsSection: {
    marginBottom: Theme.spacing.xl,
  },
  periodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  periodLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  periodSubtext: {
    fontSize: Theme.typography.fontSize.sm,
  },
  // Profile Info Styles
  settingsSection: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border + '30',
  },
  profileLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  profileValue: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default DeliveryDashboard;