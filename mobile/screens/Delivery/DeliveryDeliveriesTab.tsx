import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Theme } from '../../lib/colors';
import { getAvailableDeliveries, updateOrderStatus, Order } from '../../lib/api/orderApi';

interface DeliveryDeliveriesTabProps {
  navigation: any;
  user: any;
}

const DeliveryDeliveriesTab: React.FC<DeliveryDeliveriesTabProps> = ({ navigation, user }) => {
  const [availableDeliveries, setAvailableDeliveries] = useState<Order[]>([]);
  const [currentDeliveries, setCurrentDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadAvailableDeliveries();
  }, []);

  const loadAvailableDeliveries = async () => {
    try {
      const data = await getAvailableDeliveries();
      setAvailableDeliveries(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load available deliveries');
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
      loadAvailableDeliveries(); // Refresh available deliveries
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading deliveries...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Available Deliveries</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Orders ready for delivery. Accept them to start delivering.
      </Text>

      {availableDeliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No deliveries available at the moment.
          </Text>
        </View>
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
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
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
  actionButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default DeliveryDeliveriesTab;