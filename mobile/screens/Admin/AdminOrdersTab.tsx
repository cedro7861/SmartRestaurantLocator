import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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
      const orderData = await getAllOrders();
      setOrders(orderData);
    } catch (error) {
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (order: Order, newStatus: string) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status');
    }
  };

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Order Management</Text>

      <View style={styles.orderStats}>
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
    textAlign: 'center',
  },
  orderStats: {
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
  listContainer: {
    paddingBottom: Theme.spacing.xl,
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
  statusContainer: {
    alignItems: 'flex-end',
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
  buttonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default AdminOrdersTab;