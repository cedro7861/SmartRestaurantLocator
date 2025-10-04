import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { getOwnerOrders, updateOrderStatus, Order } from '../../lib/api/orderApi';

interface ManageOrdersProps {
  navigation: any;
}

const ManageOrders: React.FC<ManageOrdersProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOwnerOrders();
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders(); // Refresh orders
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Manage Orders</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No orders found for your restaurants.
          </Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.orderHeader}>
              <Text style={[styles.customerName, { color: colors.text }]}>
                {order.customer?.name || 'Unknown Customer'}
              </Text>
              <Text style={[styles.orderStatus, {
                color: order.status === 'delivered' ? colors.success :
                       order.status === 'pending' ? colors.warning : colors.primary
              }]}>
                {order.status}
              </Text>
            </View>
            <Text style={[styles.restaurantName, { color: colors.textSecondary }]}>
              {order.restaurant.name}
            </Text>
            <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
              {new Date(order.order_time).toLocaleString()}
            </Text>
            <Text style={[styles.orderTotal, { color: colors.primary }]}>
              Total: ${order.total_price}
            </Text>
            <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
              {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
            </Text>

            {order.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={() => handleUpdateStatus(order.id, 'confirmed')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={() => handleUpdateStatus(order.id, 'rejected')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'confirmed' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleUpdateStatus(order.id, 'preparing')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Start Preparing</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'preparing' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleUpdateStatus(order.id, 'ready')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Mark Ready</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'ready' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleUpdateStatus(order.id, 'delivering')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Start Delivery</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'delivering' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={() => handleUpdateStatus(order.id, 'delivered')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Mark Delivered</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.background }]}>Back to Dashboard</Text>
      </TouchableOpacity>
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
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
  },
  orderCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  customerName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  restaurantName: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  orderStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
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
    marginBottom: Theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  backButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  backButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
});

export default ManageOrders;