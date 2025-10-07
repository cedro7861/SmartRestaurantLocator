import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableDeliveries, getDeliveryHistory, updateOrderStatus, Order } from '../../lib/api/orderApi';

interface DeliveryDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ navigation, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('deliveries');
  const [availableDeliveries, setAvailableDeliveries] = useState<Order[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<Order[]>([]);
  const [currentDeliveries, setCurrentDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    if (activeTab === 'deliveries') {
      loadAvailableDeliveries();
    } else if (activeTab === 'history') {
      loadDeliveryHistory();
    }
  }, [activeTab]);

  const loadAvailableDeliveries = async () => {
    setLoading(true);
    try {
      const data = await getAvailableDeliveries();
      setAvailableDeliveries(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load available deliveries');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryHistory = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryHistory();
      setDeliveryHistory(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load delivery history');
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
          {item.status}
        </Text>
      </View>

      <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
        Customer: {item.customer?.name} ({item.customer?.phone})
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
      case 'deliveries':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Available Deliveries</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Orders ready for delivery. Accept them to start delivering.
            </Text>
            {loading ? (
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading deliveries...</Text>
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

            {currentDeliveries.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl }]}>
                  Current Deliveries
                </Text>
                <FlatList
                  data={currentDeliveries}
                  renderItem={renderDeliveryItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.listContainer}
                />
              </>
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
            {loading ? (
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading history...</Text>
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
        const totalEarnings = deliveryHistory.reduce((sum, order) => sum + order.total_price, 0);
        const completedDeliveries = deliveryHistory.length;
        const averageEarnings = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0;

        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Earnings</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Your delivery earnings and statistics.
            </Text>

            <View style={styles.earningsGrid}>
              <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningsNumber, { color: colors.primary }]}>${totalEarnings.toFixed(2)}</Text>
                <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
              </View>
              <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningsNumber, { color: colors.success }]}>{completedDeliveries}</Text>
                <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Deliveries</Text>
              </View>
              <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningsNumber, { color: colors.warning }]}>${averageEarnings.toFixed(2)}</Text>
                <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Avg per Delivery</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl }]}>
              Recent Earnings
            </Text>
            {deliveryHistory.slice(0, 5).map((order) => (
              <View key={order.id} style={[styles.earningsItem, { backgroundColor: colors.surface }]}>
                <View style={styles.earningsItemLeft}>
                  <Text style={[styles.earningsItemTitle, { color: colors.text }]}>
                    Order #{order.id}
                  </Text>
                  <Text style={[styles.earningsItemSubtitle, { color: colors.textSecondary }]}>
                    {new Date(order.order_time).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.earningsItemAmount, { color: colors.primary }]}>
                  ${order.total_price}
                </Text>
              </View>
            ))}
          </View>
        );
      case 'settings':
        const settingsOptions = [
          {
            title: 'Change Password',
            icon: 'lock-closed-outline',
            onPress: () => navigation.navigate('ChangePassword'),
          },
          {
            title: 'Notifications',
            icon: 'notifications-outline',
            onPress: () => navigation.navigate('Notifications'),
          },
          {
            title: 'Logout',
            icon: 'log-out-outline',
            onPress: onLogout,
          },
        ];

        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Manage your account and preferences.
            </Text>

            <View style={styles.settingsList}>
              {settingsOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.settingItem, { backgroundColor: colors.surface }]}
                  onPress={item.onPress}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Delivery Dashboard</Text>
      <Text style={[styles.welcome, { color: colors.text }]}>Welcome, {user?.name || 'User'}!</Text>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
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
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.typography.fontSize.md,
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
});

export default DeliveryDashboard;