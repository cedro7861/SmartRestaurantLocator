import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getOwnerDeliveries, assignDelivery, reassignDelivery, DeliveryPerson, Delivery, getAvailableDeliveryPersons } from '../../lib/api/deliveryApi';
import { getOwnerReadyOrders, Order } from '../../lib/api/orderApi';

interface DeliveryManagementProps {
  navigation: any;
  user: any;
}


const DeliveryManagement: React.FC<DeliveryManagementProps> = ({ navigation, user }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show delivery locations');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading delivery management data...');

      const [deliveriesData, ordersData, personsData] = await Promise.all([
        getOwnerDeliveries(),
        getOwnerReadyOrders(),
        getAvailableDeliveryPersons()
      ]);

      console.log('Deliveries loaded:', deliveriesData.length);
      console.log('Available orders loaded:', ordersData.length);
      console.log('Delivery persons loaded:', personsData.length);

      setDeliveries(deliveriesData);
      setAvailableOrders(ordersData);
      setDeliveryPersons(personsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDelivery = async (orderId: number, deliveryPersonId: number) => {
    try {
      await assignDelivery({ order_id: orderId, delivery_person_id: deliveryPersonId });
      Alert.alert('Success', 'Delivery assigned successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to assign delivery');
    }
  };

  const handleReassignDelivery = async (deliveryId: number, newDeliveryPersonId: number) => {
    try {
      await reassignDelivery({ delivery_id: deliveryId, new_delivery_person_id: newDeliveryPersonId });
      Alert.alert('Success', 'Delivery reassigned successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to reassign delivery');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const getNearbyDeliveryPersons = (restaurantLat: number, restaurantLng: number, maxDistance: number = 10) => {
    return deliveryPersons.filter(person => {
      // In a real app, you'd have delivery person locations
      // For now, assume they're at various locations
      if (currentLocation) {
        const distance = calculateDistance(
          restaurantLat, restaurantLng,
          currentLocation.coords.latitude, currentLocation.coords.longitude
        );
        return distance <= maxDistance;
      }
      return true;
    });
  };

  const renderDeliveryItem = ({ item }: { item: Delivery }) => (
    <View style={[styles.deliveryCard, { backgroundColor: colors.surface }]}>
      <View style={styles.deliveryHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.order.id}</Text>
        <Text style={[styles.deliveryStatus, {
          color: item.status === 'delivered' ? colors.success :
                 item.status === 'on_route' ? colors.primary : colors.warning,
          backgroundColor: item.status === 'delivered' ? colors.success + '20' :
                         item.status === 'on_route' ? colors.primary + '20' : colors.warning + '20'
        }]}>
          {item.status.replace('_', ' ')}
        </Text>
      </View>

      <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
        👤 {item.order.customer.name}
      </Text>
      <Text style={[styles.restaurantInfo, { color: colors.textSecondary }]}>
        🏪 {item.order.restaurant.name}
      </Text>

      {item.delivery_person && (
        <Text style={[styles.deliveryPersonInfo, { color: colors.textSecondary }]}>
          🚴 {item.delivery_person.name}
        </Text>
      )}

      <View style={styles.actionButtons}>
        {item.delivery_person && (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              // Show delivery person selection for reassignment
              const nearbyPersons = getNearbyDeliveryPersons(
                parseFloat(item.order.restaurant.latitude || '0'),
                parseFloat(item.order.restaurant.longitude || '0')
              );
              Alert.alert(
                'Reassign Delivery',
                'Select new delivery person',
                nearbyPersons.map(person => ({
                  text: person.name,
                  onPress: () => handleReassignDelivery(item.delivery_id, person.user_id)
                })).concat([{ text: 'Cancel', onPress: () => Promise.resolve() }])
              );
            }}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Reassign</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => {
    const nearbyPersons = getNearbyDeliveryPersons(
      parseFloat(item.restaurant.latitude || '0'),
      parseFloat(item.restaurant.longitude || '0')
    );

    return (
      <View style={[styles.orderCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
        <Text style={[styles.customerInfo, { color: colors.textSecondary }]}>
          👤 {item.customer?.name || 'Unknown Customer'}
        </Text>
        <Text style={[styles.restaurantInfo, { color: colors.textSecondary }]}>
          🏪 {item.restaurant.name}
        </Text>
        <Text style={[styles.orderTotal, { color: colors.primary }]}>
          💰 ${parseFloat(item.total_price.toString()).toFixed(2)}
        </Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => {
            if (nearbyPersons.length === 0) {
              Alert.alert('No Delivery Persons', 'No delivery persons available nearby');
              return;
            }
            Alert.alert(
              'Assign Delivery',
              'Select delivery person',
              nearbyPersons.map(person => ({
                text: person.name,
                onPress: () => handleAssignDelivery(item.id, person.user_id)
              })).concat([{ text: 'Cancel', onPress: () => Promise.resolve() }])
            );
          }}
        >
          <Text style={[styles.actionButtonText, { color: colors.background }]}>Assign Delivery</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading delivery management...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Delivery Management</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Monitor and assign deliveries
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={loadData}
        >
          <Text style={[styles.refreshButtonText, { color: colors.background }]}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'list' && styles.toggleButtonTextActive]}>
            📋 List View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'map' && styles.toggleButtonTextActive]}>
            🗺️ Map View
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {availableOrders.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                📦 Ready for Delivery ({availableOrders.length})
              </Text>
              {availableOrders.map((item) => (
                <View key={item.id}>
                  {renderOrderItem({ item })}
                </View>
              ))}
            </>
          )}

          {deliveries.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.warning, marginTop: spacing.lg }]}>
                🚚 Active Deliveries ({deliveries.length})
              </Text>
              {deliveries.map((item) => (
                <View key={item.delivery_id}>
                  {renderDeliveryItem({ item })}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.mapContainer}>
          {currentLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              showsUserLocation
              showsMyLocationButton
              showsCompass
              zoomEnabled
              scrollEnabled
            >
              {/* Delivery Persons */}
              {deliveryPersons.map((person) => (
                <Marker
                  key={person.user_id}
                  coordinate={{
                    latitude: currentLocation.coords.latitude + (person.user_id % 10) * 0.005,
                    longitude: currentLocation.coords.longitude + (person.user_id % 10) * 0.005,
                  }}
                  title={person.name}
                  description="Delivery Person"
                  pinColor="blue"
                />
              ))}

              {/* Restaurants with ready orders */}
              {availableOrders.map((order) => {
                const lat = parseFloat(order.restaurant.latitude || '0');
                const lng = parseFloat(order.restaurant.longitude || '0');
                if (lat && lng) {
                  return (
                    <Marker
                      key={order.id}
                      coordinate={{ latitude: lat, longitude: lng }}
                      title={order.restaurant.name}
                      description={`Ready order #${order.id}`}
                      pinColor="orange"
                    />
                  );
                }
                return null;
              })}
            </MapView>
          ) : (
            <View style={[styles.loadingContainer, styles.map]}>
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading map...</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: Theme.typography.fontSize.lg,
  },
  viewToggle: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  toggleButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Theme.colors.background,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  deliveryCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 2,
  },
  orderCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
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
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  restaurantInfo: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  deliveryPersonInfo: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.sm,
  },
  orderTotal: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DeliveryManagement;