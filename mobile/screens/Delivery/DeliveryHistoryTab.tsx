import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Theme } from '../../lib/colors';
import { getDeliveryHistory, Order } from '../../lib/api/orderApi';

interface DeliveryHistoryTabProps {
  navigation: any;
  user: any;
}

const DeliveryHistoryTab: React.FC<DeliveryHistoryTabProps> = ({ navigation, user }) => {
  const [deliveryHistory, setDeliveryHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadDeliveryHistory();
  }, []);

  const loadDeliveryHistory = async () => {
    try {
      const data = await getDeliveryHistory();
      setDeliveryHistory(data);
    } catch (error) {
      console.error('Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalDeliveries = deliveryHistory.length;
    const totalEarnings = deliveryHistory.reduce((sum, order) => sum + order.total_price, 0);
    const averageEarnings = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;
    const todayDeliveries = deliveryHistory.filter(order => {
      const orderDate = new Date(order.order_time).toDateString();
      const today = new Date().toDateString();
      return orderDate === today;
    }).length;

    return { totalDeliveries, totalEarnings, averageEarnings, todayDeliveries };
  };

  const renderDeliveryItem = ({ item }: { item: Order }) => (
    <View style={[styles.deliveryCard, { backgroundColor: colors.surface }]}>
      <View style={styles.deliveryHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
        <Text style={[styles.deliveryStatus, {
          color: colors.success,
          backgroundColor: colors.success + '20'
        }]}>
          Delivered
        </Text>
      </View>

      <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
        Customer: {item.customer?.name}
      </Text>
      <Text style={[styles.restaurantInfo, { color: colors.textSecondary }]}>
        Restaurant: {item.restaurant.name}
      </Text>
      <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
        {new Date(item.order_time).toLocaleString()}
      </Text>
      <Text style={[styles.orderTotal, { color: colors.primary }]}>
        Earned: ${item.total_price}
      </Text>
      <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
        Items: {item.order_items.length}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading delivery history...</Text>
      </View>
    );
  }

  const stats = calculateStats();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Delivery History</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your completed deliveries and performance stats.
      </Text>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalDeliveries}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Deliveries</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>${stats.totalEarnings.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>${stats.averageEarnings.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg per Delivery</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.info }]}>{stats.todayDeliveries}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
        </View>
      </View>

      {/* Delivery History List */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Deliveries</Text>

      {deliveryHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No delivery history yet. Complete your first delivery!
          </Text>
        </View>
      ) : (
        <FlatList
          data={deliveryHistory}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}
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
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    width: '48%',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
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
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default DeliveryHistoryTab;