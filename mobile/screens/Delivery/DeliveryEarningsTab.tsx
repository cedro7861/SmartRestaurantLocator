import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Theme } from '../../lib/colors';
import { getDeliveryHistory, Order } from '../../lib/api/orderApi';

interface DeliveryEarningsTabProps {
  navigation: any;
  user: any;
}

interface DailyEarning {
  date: string;
  earnings: number;
  deliveries: number;
}

interface EarningsStats {
  totalEarnings: number;
  completedDeliveries: number;
  averageEarnings: number;
  dailyEarnings: DailyEarning[];
  weeklyEarnings: number;
}

const DeliveryEarningsTab: React.FC<DeliveryEarningsTabProps> = ({ navigation, user }) => {
  const [deliveryHistory, setDeliveryHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadDeliveryHistory();
  }, []);

  const loadDeliveryHistory = async () => {
    try {
      const data = await getDeliveryHistory();
      setDeliveryHistory(data || []);
    } catch (error) {
      console.error('Failed to load delivery history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEarningsStats = (): EarningsStats => {
    const deliveryFee = 5; // $5 per delivery
    const completedDeliveries = deliveryHistory.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    ).length;
    
    const totalEarnings = completedDeliveries * deliveryFee;
    const averageEarnings = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 0;

    // Calculate earnings by day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    const dailyEarnings = last7Days.map(date => {
      const dayOrders = deliveryHistory.filter(order => {
        if (!order.order_time) return false;
        const orderDate = new Date(order.order_time);
        return orderDate.toDateString() === date && 
               (order.status === 'delivered' || order.status === 'completed');
      });
      return {
        date,
        earnings: dayOrders.length * deliveryFee,
        deliveries: dayOrders.length
      };
    });

    // Calculate earnings by week (current week)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const currentWeek = deliveryHistory.filter(order => {
      if (!order.order_time) return false;
      const orderDate = new Date(order.order_time);
      return orderDate >= weekStart && 
             (order.status === 'delivered' || order.status === 'completed');
    });
    
    const weeklyEarnings = currentWeek.length * deliveryFee;

    return {
      totalEarnings,
      completedDeliveries,
      averageEarnings,
      dailyEarnings,
      weeklyEarnings
    };
  };

  const renderEarningsItem = ({ item }: { item: DailyEarning }) => (
    <View style={[styles.earningsItem, { backgroundColor: colors.surface }]}>
      <View style={styles.earningsItemLeft}>
        <Text style={[styles.earningsItemTitle, { color: colors.text }]}>
          {new Date(item.date).toLocaleDateString(undefined, { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        <Text style={[styles.earningsItemSubtitle, { color: colors.textSecondary }]}>
          {item.deliveries} {item.deliveries === 1 ? 'delivery' : 'deliveries'}
        </Text>
      </View>
      <Text style={[styles.earningsItemAmount, { color: colors.primary }]}>
        ${item.earnings.toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { 
        backgroundColor: colors.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text, marginTop: spacing.md }]}>
          Loading earnings...
        </Text>
      </View>
    );
  }

  const stats = calculateEarningsStats();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Earnings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your delivery earnings and statistics
      </Text>

      {/* Main Statistics */}
      <View style={styles.earningsGrid}>
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.earningsNumber, { color: colors.primary }]}>
            ${stats.totalEarnings.toFixed(2)}
          </Text>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>
            Total Earnings
          </Text>
        </View>
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.earningsNumber, { color: colors.success }]}>
            {stats.completedDeliveries}
          </Text>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>
            Completed Deliveries
          </Text>
        </View>
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.earningsNumber, { color: colors.warning }]}>
            ${stats.averageEarnings.toFixed(2)}
          </Text>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>
            Avg per Delivery
          </Text>
        </View>
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.earningsNumber, { color: colors.info }]}>
            ${stats.weeklyEarnings.toFixed(2)}
          </Text>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>
            This Week
          </Text>
        </View>
      </View>

      {/* Daily Earnings */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Daily Earnings (Last 7 Days)
      </Text>
      <FlatList
        data={stats.dailyEarnings}
        renderItem={renderEarningsItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No deliveries in the last 7 days
            </Text>
          </View>
        }
      />

      {/* Performance Insights */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Performance Insights
      </Text>
      <View style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.insightsText, { color: colors.text }]}>
          💡 <Text style={{ fontWeight: 'bold' }}>Tip:</Text> Focus on high-traffic areas during peak hours to maximize earnings.
        </Text>
        <Text style={[styles.insightsText, { color: colors.text }]}>
          📈 Your average earnings per delivery is ${stats.averageEarnings.toFixed(2)}.
        </Text>
        <Text style={[styles.insightsText, { color: colors.text }]}>
          🎯 You've completed {stats.completedDeliveries} {stats.completedDeliveries === 1 ? 'delivery' : 'deliveries'} total.
        </Text>
        {stats.weeklyEarnings > 0 && (
          <Text style={[styles.insightsText, { color: colors.text }]}>
            ⭐ Great job! You've earned ${stats.weeklyEarnings.toFixed(2)} this week.
          </Text>
        )}
      </View>
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
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xl,
  },
  earningsCard: {
    width: '48%',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  earningsNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  earningsLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
  insightsCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  insightsText: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
  emptyState: {
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
  },
});

export default DeliveryEarningsTab;