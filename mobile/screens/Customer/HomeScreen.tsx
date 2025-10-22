import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../lib/colors';
import { getCustomerOrders, Order } from '../../lib/api/orderApi';
import { getRestaurants, Restaurant } from '../../lib/api/restaurantApi';

interface HomeScreenProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersData, restaurantsData] = await Promise.all([
        getCustomerOrders(),
        getRestaurants()
      ]);
      setOrders(ordersData || []);
      setRestaurants(restaurantsData || []);
    } catch (error: any) {
      console.log('Failed to load dashboard data:', error.message);
      setOrders([]);
      setRestaurants([]);
      // Don't show alert on home screen to avoid interrupting user experience
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive dashboard metrics
  const totalOrders = orders.length;
  const activeOrders = orders.filter(order => order.status !== 'delivered').length;
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const recentOrders = orders.slice(0, 3);
  const availableRestaurants = restaurants.filter(r => r.status === 'open').length;
  const totalRestaurants = restaurants.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeHeader}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            🍽️ Welcome back, {user?.name || 'Customer'}!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Your personalized dining dashboard with real-time insights
          </Text>
        </View>

        {/* Key Statistics */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Your Dining Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statIcon, { color: colors.primary }]}>📋</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{totalOrders}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Orders</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statIcon, { color: colors.warning }]}>⏳</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{activeOrders}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Orders</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statIcon, { color: colors.success }]}>💰</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>RWF {totalSpent.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Spent</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statIcon, { color: colors.info }]}>📊</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>RWF {avgOrderValue.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Order</Text>
            </View>
          </View>
        </View>

        {/* Platform Overview */}
        <View style={styles.platformSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏪 Platform Overview</Text>
          <View style={styles.platformGrid}>
            <View style={[styles.platformCard, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.platformIcon, { color: colors.primary }]}>🏪</Text>
              <Text style={[styles.platformValue, { color: colors.primary }]}>{totalRestaurants}</Text>
              <Text style={[styles.platformLabel, { color: colors.textSecondary }]}>Total Restaurants</Text>
            </View>
            <View style={[styles.platformCard, { backgroundColor: colors.success + '15' }]}>
              <Text style={[styles.platformIcon, { color: colors.success }]}>🟢</Text>
              <Text style={[styles.platformValue, { color: colors.success }]}>{availableRestaurants}</Text>
              <Text style={[styles.platformLabel, { color: colors.textSecondary }]}>Open Now</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={[styles.quickActionIcon, { color: colors.background }]}>🗺️</Text>
              <Text style={[styles.quickActionText, { color: colors.background }]}>Find Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.success }]}
              onPress={() => navigation.navigate('Orders')}
            >
              <Text style={[styles.quickActionIcon, { color: colors.background }]}>📋</Text>
              <Text style={[styles.quickActionText, { color: colors.background }]}>Track Orders</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {recentOrders.length > 0 && (
          <View style={styles.recentOrdersContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 Recent Activity</Text>
            {recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.recentOrderCard, { backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('Orders')}
              >
                <View style={styles.recentOrderContent}>
                  <Text style={[styles.recentOrderRestaurant, { color: colors.text }]}>
                    {order.restaurant.name}
                  </Text>
                  <Text style={[styles.recentOrderTime, { color: colors.textSecondary }]}>
                    {new Date(order.order_time).toLocaleDateString()} • {new Date(order.order_time).toLocaleTimeString()}
                  </Text>
                  <Text style={[styles.recentOrderTotal, { color: colors.primary }]}>
                    RWF {parseFloat(order.total_price.toString()).toFixed(2)} • {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[styles.recentOrderStatus, {
                  backgroundColor: order.status === 'delivered' ? colors.success + '20' :
                                 order.status === 'preparing' ? colors.warning + '20' :
                                 order.status === 'ready' ? colors.info + '20' :
                                 order.status === 'delivering' ? colors.info + '20' :
                                 order.status === 'pending' ? colors.primary + '20' : colors.error + '20'
                }]}>
                  <Text style={[styles.recentOrderStatusText, {
                    color: order.status === 'delivered' ? colors.success :
                           order.status === 'preparing' ? colors.warning :
                           order.status === 'ready' ? colors.info :
                           order.status === 'delivering' ? colors.info :
                           order.status === 'pending' ? colors.primary : colors.error
                  }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {totalOrders === 0 && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>🍽️</Text>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Start Your Dining Journey</Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
              Discover amazing restaurants and place your first order
            </Text>
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={[styles.exploreButtonText, { color: colors.background }]}>Explore Restaurants</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
  welcomeHeader: {
    marginBottom: Theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: Theme.typography.fontSize.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.sm,
  },
  statValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.sm,
  },
  quickActionText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  recentOrdersContainer: {
    marginBottom: Theme.spacing.xl,
  },
  recentOrderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  recentOrderContent: {
    flex: 1,
  },
  recentOrderRestaurant: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  recentOrderTime: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  recentOrderTotal: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  recentOrderStatus: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  recentOrderStatusText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  // Enhanced Stats Section
  statsSection: {
    marginBottom: Theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Platform Overview Section
  platformSection: {
    marginBottom: Theme.spacing.xl,
  },
  platformGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  platformIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.sm,
  },
  platformValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  platformLabel: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
  },
  exploreButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    elevation: 3,
  },
  exploreButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default HomeScreen;