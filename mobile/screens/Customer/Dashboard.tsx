import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getRestaurants, Restaurant } from '../../lib/api/restaurantApi';
import { getCustomerOrders, Order } from '../../lib/api/orderApi';

interface CustomerDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ navigation, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('map');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
    loadOrders();
    getCurrentLocation();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurants');
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getCustomerOrders();
      setOrders(data);
    } catch (error) {
      // Orders might fail if not authenticated, but don't show error
      console.log('Failed to load orders');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show nearby restaurants');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <View style={styles.tabContent}>
            {location ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                showsUserLocation
              >
                {restaurants
                  .filter((restaurant) => {
                    const lat = restaurant.latitude;
                    const lng = restaurant.longitude;
                    return lat != null && lng != null &&
                           typeof lat === 'number' && typeof lng === 'number' &&
                           !isNaN(lat) && !isNaN(lng) &&
                           lat >= -90 && lat <= 90 &&
                           lng >= -180 && lng <= 180;
                  })
                  .map((restaurant) => (
                    <Marker
                      key={restaurant.id}
                      coordinate={{
                        latitude: restaurant.latitude!,
                        longitude: restaurant.longitude!,
                      }}
                      title={restaurant.name}
                      description={restaurant.location}
                      onPress={() => handleRestaurantPress(restaurant)}
                    />
                  ))}
              </MapView>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  {loading ? 'Getting your location...' : 'Location not available'}
                </Text>
              </View>
            )}
          </View>
        );
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>My Orders</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Your order history and current orders.
            </Text>
            {orders.length === 0 ? (
              <Text style={[styles.noOrdersText, { color: colors.textSecondary }]}>
                No orders yet. Start by exploring restaurants on the map!
              </Text>
            ) : (
              orders.map((order) => (
                <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.orderHeader}>
                    <Text style={[styles.restaurantName, { color: colors.text }]}>
                      {order.restaurant.name}
                    </Text>
                    <Text style={[styles.orderStatus, {
                      color: order.status === 'delivered' ? colors.success :
                             order.status === 'pending' ? colors.warning : colors.primary
                    }]}>
                      {order.status}
                    </Text>
                  </View>
                  <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
                    {new Date(order.order_time).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.orderTotal, { color: colors.primary }]}>
                    Total: ${order.total_price}
                  </Text>
                  <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        );
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Manage your account settings and preferences.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Info', 'Profile editing coming soon!')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => Alert.alert('Info', 'Password change coming soon!')}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.warning }]}
              onPress={() => Alert.alert('Info', 'Support contact coming soon!')}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Customer Dashboard</Text>
      <Text style={[styles.welcome, { color: colors.text }]}>Welcome, {user?.name || 'User'}!</Text>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'map' ? colors.primary : colors.textSecondary }]}>
            Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'orders' ? colors.primary : colors.textSecondary }]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'profile' ? colors.primary : colors.textSecondary }]}>
            Profile
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
  map: {
    width: '100%',
    height: 400,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
  logoutButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  noOrdersText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
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
  restaurantName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
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
  },
  logoutText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default CustomerDashboard;