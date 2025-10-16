import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../lib/colors';
import { getAllOrders, updateOrderStatus, Order } from '../../lib/api/orderApi';

interface AdminOrdersTabProps {
  navigation: any;
}

const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await getAllOrders();
      setOrders(orderData || []);
    } catch (error: any) {
      console.error('Failed to load orders:', error.message);
      setOrders([]);
      Alert.alert(
        'Connection Issue',
        'Unable to load system orders. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: loadOrders },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (order: Order, newStatus: string) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      loadOrders();
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update order status:', error.message);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>📋</Text>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
            Fetching all order data from the system
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>📋 Order Management</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Monitor and manage all orders across the platform
          </Text>
        </View>

        <View style={styles.orderStats}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statIcon, { color: colors.primary }]}>📊</Text>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{orders.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Orders</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statIcon, { color: colors.warning }]}>⏳</Text>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {orders.filter(o => o.status === 'pending').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statIcon, { color: colors.success }]}>✅</Text>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {orders.filter(o => o.status === 'delivered').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Delivered</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statIcon, { color: colors.info }]}>👨‍🍳</Text>
            <Text style={[styles.statNumber, { color: colors.info }]}>
              {orders.filter(o => o.status === 'preparing').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Preparing</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>All Orders</Text>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={loadOrders}
          >
            <Text style={[styles.refreshButtonText, { color: colors.background }]}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Orders Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Orders will appear here once customers start placing them
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.id}</Text>
                    <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
                      📅 {new Date(order.order_time).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: order.status === 'delivered' ? colors.success + '20' :
                                   order.status === 'pending' ? colors.warning + '20' :
                                   order.status === 'confirmed' ? colors.info + '20' :
                                   order.status === 'preparing' ? colors.warning + '20' :
                                   order.status === 'ready' ? colors.primary + '20' :
                                   order.status === 'delivering' ? colors.primary + '20' : colors.error + '20'
                  }]}>
                    <Text style={[styles.orderStatus, {
                      color: order.status === 'delivered' ? colors.success :
                             order.status === 'pending' ? colors.warning :
                             order.status === 'confirmed' ? colors.info :
                             order.status === 'preparing' ? colors.warning :
                             order.status === 'ready' ? colors.primary :
                             order.status === 'delivering' ? colors.primary : colors.error
                    }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.customerSection}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>👤 Customer</Text>
                  <Text style={[styles.customerInfo, { color: colors.text }]}>
                    {order.customer?.name}
                  </Text>
                  <Text style={[styles.customerContact, { color: colors.textSecondary }]}>
                    {order.customer?.email} • {order.customer?.phone || 'No phone'}
                  </Text>
                </View>

                <View style={styles.restaurantSection}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>🏪 Restaurant</Text>
                  <Text style={[styles.restaurantInfo, { color: colors.text }]}>
                    {order.restaurant.name}
                  </Text>
                  <Text style={[styles.restaurantDetails, { color: colors.textSecondary }]}>
                    📍 {order.restaurant.location || 'Location not specified'}
                  </Text>
                  {order.restaurant.contact_info && (
                    <Text style={[styles.restaurantDetails, { color: colors.textSecondary }]}>
                      📞 {order.restaurant.contact_info}
                    </Text>
                  )}
                  {order.restaurant.owner && (
                    <Text style={[styles.ownerInfo, { color: colors.textSecondary }]}>
                      👨‍💼 Owner: {order.restaurant.owner.name}
                    </Text>
                  )}
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>🍽️ Order Type:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {order.order_type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>📦 Items:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>💰 Total:</Text>
                    <Text style={[styles.orderTotal, { color: colors.primary }]}>
                      ${parseFloat(order.total_price.toString()).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {order.status !== 'delivered' && (
                  <View style={styles.orderActions}>
                    <Text style={[styles.actionsLabel, { color: colors.textSecondary }]}>Update Status:</Text>
                    <View style={styles.actionButtons}>
                      {order.status === 'pending' && (
                        <TouchableOpacity
                          style={[styles.statusButton, { backgroundColor: colors.warning }]}
                          onPress={() => handleUpdateOrderStatus(order, 'preparing')}
                        >
                          <Text style={[styles.buttonText, { color: colors.background }]}>👨‍🍳 Start Preparing</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'preparing' && (
                        <TouchableOpacity
                          style={[styles.statusButton, { backgroundColor: colors.success }]}
                          onPress={() => handleUpdateOrderStatus(order, 'ready')}
                        >
                          <Text style={[styles.buttonText, { color: colors.background }]}>✅ Mark Ready</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'ready' && (
                        <TouchableOpacity
                          style={[styles.statusButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleUpdateOrderStatus(order, 'delivered')}
                        >
                          <Text style={[styles.buttonText, { color: colors.background }]}>🚚 Mark Delivered</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  loadingSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  header: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
  },
  orderStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    minWidth: 80,
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.sm,
  },
  statNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  refreshButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    elevation: 2,
  },
  refreshButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  ordersList: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  orderCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  orderTime: {
    fontSize: Theme.typography.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  orderStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  customerSection: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
  },
  sectionLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  customerInfo: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  customerContact: {
    fontSize: Theme.typography.fontSize.sm,
  },
  restaurantSection: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
  },
  restaurantInfo: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  restaurantDetails: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  ownerInfo: {
    fontSize: Theme.typography.fontSize.sm,
    fontStyle: 'italic',
  },
  orderDetails: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  detailLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: Theme.typography.fontSize.sm,
  },
  orderTotal: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  orderActions: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
  },
  actionsLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.xs,
    marginVertical: Theme.spacing.xs,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default AdminOrdersTab;