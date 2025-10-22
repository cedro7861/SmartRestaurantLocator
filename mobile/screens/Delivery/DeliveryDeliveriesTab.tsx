import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getDeliveryPersonDeliveries, updateDeliveryStatus, Delivery } from '../../lib/api/deliveryApi';

interface DeliveryDeliveriesTabProps {
  navigation: any;
  user: any;
}

const DeliveryDeliveriesTab: React.FC<DeliveryDeliveriesTabProps> = ({ navigation, user }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadDeliveries();
    getCurrentLocation();
  }, []);

  // Start/stop location tracking based on active deliveries
  useEffect(() => {
    const hasActiveDeliveries = deliveries.some(d => d.status === 'on_route');

    if (hasActiveDeliveries && !locationUpdateInterval) {
      // Start location updates for active deliveries
      startLocationTracking();
    } else if (!hasActiveDeliveries && locationUpdateInterval) {
      // Stop location updates when no active deliveries
      stopLocationTracking();
    }

    return () => {
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, [deliveries]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show delivery routes on map');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);

      // Start watching location for real-time updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setCurrentLocation(newLocation);
        }
      );

      // Store subscription for cleanup
      return () => locationSubscription.remove();
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const startLocationTracking = () => {
    console.log('Starting location tracking for active deliveries');
    const interval = setInterval(async () => {
      try {
        if (currentLocation) {
          // Update location for all active deliveries
          const activeDeliveries = deliveries.filter(d => d.status === 'on_route');
          for (const delivery of activeDeliveries) {
            await updateDeliveryStatus(delivery.delivery_id, {
              status: 'on_route', // Keep status the same
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude
            });
          }
        }
      } catch (error) {
        console.error('Error updating delivery location:', error);
      }
    }, 30000); // Update every 30 seconds

    setLocationUpdateInterval(interval);
  };

  const stopLocationTracking = () => {
    console.log('Stopping location tracking');
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      setLocationUpdateInterval(null);
    }
  };

  const loadDeliveries = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      }
      console.log('Loading deliveries for user:', user?.name || 'Unknown');
      const data = await getDeliveryPersonDeliveries();
      console.log('Received deliveries:', data.length);
      setDeliveries(data);
    } catch (error: any) {
      console.error('Error loading deliveries:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load deliveries. Please check your connection and try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDeliveries(true);
  };

  const handleUpdateDeliveryStatus = async (deliveryId: number, newStatus: 'pending' | 'on_route' | 'delivered') => {
    try {
      let locationData: { latitude?: number; longitude?: number } = {};

      // Include current location for 'on_route' status to enable live tracking
      if (newStatus === 'on_route' && currentLocation) {
        locationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        };
      }

      await updateDeliveryStatus(deliveryId, {
        status: newStatus,
        ...locationData
      });

      Alert.alert('Success', `Delivery status updated to ${newStatus.replace('_', ' ')}`);
      loadDeliveries(); // Refresh deliveries
    } catch (error) {
      Alert.alert('Error', 'Failed to update delivery status');
    }
  };

  const handleCallCustomer = (delivery: Delivery) => {
    const phoneNumber = delivery.order.customer?.phone;
    if (phoneNumber) {
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Show modern communication options
      Alert.alert(
        'Contact Customer',
        `Choose how to contact ${delivery.order.customer?.name || 'the customer'}:`,
        [
          {
            text: 'WhatsApp',
            onPress: async () => {
              const whatsappUrl = `whatsapp://send?phone=${cleanPhoneNumber}`;
              try {
                const supported = await Linking.canOpenURL(whatsappUrl);
                if (supported) {
                  await Linking.openURL(whatsappUrl);
                } else {
                  // Fallback to WhatsApp web
                  const webWhatsappUrl = `https://wa.me/${cleanPhoneNumber}`;
                  await Linking.openURL(webWhatsappUrl);
                }
              } catch (error) {
                Alert.alert('Error', 'Unable to open WhatsApp. Please make sure it\'s installed.');
              }
            }
          },
          {
            text: 'SMS',
            onPress: async () => {
              const smsUrl = `sms:${cleanPhoneNumber}`;
              try {
                const supported = await Linking.canOpenURL(smsUrl);
                if (supported) {
                  await Linking.openURL(smsUrl);
                } else {
                  Alert.alert('Error', 'SMS is not supported on this device');
                }
              } catch (error) {
                Alert.alert('Error', 'Unable to send SMS. Please check the phone number format.');
              }
            }
          },
          {
            text: 'Phone Call',
            onPress: async () => {
              const telUrl = `tel:${cleanPhoneNumber}`;
              try {
                await Linking.openURL(telUrl);
              } catch (error) {
                Alert.alert('Error', 'Unable to make phone call. Please check if your device supports phone calls or try WhatsApp/SMS instead.');
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      Alert.alert('Contact Unavailable', 'Customer contact information is not available.');
    }
  };

  const handleCallRestaurant = (delivery: Delivery) => {
    const phoneNumber = delivery.order.restaurant.contact_info;
    if (phoneNumber) {
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Show modern communication options
      Alert.alert(
        'Contact Restaurant',
        `Choose how to contact ${delivery.order.restaurant.name}:`,
        [
          {
            text: 'WhatsApp',
            onPress: async () => {
              const whatsappUrl = `whatsapp://send?phone=${cleanPhoneNumber}`;
              try {
                const supported = await Linking.canOpenURL(whatsappUrl);
                if (supported) {
                  await Linking.openURL(whatsappUrl);
                } else {
                  // Fallback to WhatsApp web
                  const webWhatsappUrl = `https://wa.me/${cleanPhoneNumber}`;
                  await Linking.openURL(webWhatsappUrl);
                }
              } catch (error) {
                Alert.alert('Error', 'Unable to open WhatsApp. Please make sure it\'s installed.');
              }
            }
          },
          {
            text: 'SMS',
            onPress: async () => {
              const smsUrl = `sms:${cleanPhoneNumber}`;
              try {
                const supported = await Linking.canOpenURL(smsUrl);
                if (supported) {
                  await Linking.openURL(smsUrl);
                } else {
                  Alert.alert('Error', 'SMS is not supported on this device');
                }
              } catch (error) {
                Alert.alert('Error', 'Unable to send SMS. Please check the phone number format.');
              }
            }
          },
          {
            text: 'Phone Call',
            onPress: async () => {
              const telUrl = `tel:${cleanPhoneNumber}`;
              try {
                await Linking.openURL(telUrl);
              } catch (error) {
                Alert.alert('Error', 'Unable to make phone call. Please check if your device supports phone calls or try WhatsApp/SMS instead.');
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      Alert.alert('Contact Unavailable', 'Restaurant contact information is not available.');
    }
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
        👤 {item.order.customer?.name}
      </Text>
      <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
        📞 {item.order.customer?.phone || 'No phone'}
      </Text>
      <Text style={[styles.restaurantInfo, { color: colors.textSecondary }]}>
        🏪 {item.order.restaurant.name}
      </Text>
      <Text style={[styles.restaurantAddress, { color: colors.textSecondary }]}>
        📍 {item.order.restaurant.location || 'Address not available'}
      </Text>
      <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
        🕒 {new Date(item.order.order_time).toLocaleString()}
      </Text>
      <Text style={[styles.orderTotal, { color: colors.primary }]}>
        💰 Total: RWF {parseFloat(item.order.total_price.toString()).toFixed(2)}
      </Text>
      <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
        📦 {item.order.order_items.length} item{item.order.order_items.length !== 1 ? 's' : ''}
      </Text>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => handleUpdateDeliveryStatus(item.delivery_id, 'on_route')}
          >
            <Text style={[styles.actionButtonText, { color: colors.background }]}>Start Delivery</Text>
          </TouchableOpacity>
        )}

        {item.status === 'on_route' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.successButton]}
            onPress={() => handleUpdateDeliveryStatus(item.delivery_id, 'delivered')}
          >
            <Text style={[styles.actionButtonText, { color: colors.background }]}>Mark Delivered</Text>
          </TouchableOpacity>
        )}

        {item.status === 'delivered' && (
          <Text style={[styles.completedText, { color: colors.success }]}>
            ✅ Delivery Completed
          </Text>
        )}
      </View>

      <View style={styles.contactButtons}>
        <TouchableOpacity
          style={[styles.contactButton, { borderColor: colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 3 }]}
          onPress={() => handleCallCustomer(item)}
        >
          <Text style={[styles.contactButtonText, { color: colors.primary }]}>📱 Contact Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, { borderColor: colors.primaryDark, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 3 }]}
          onPress={() => handleCallRestaurant(item)}
        >
          <Text style={[styles.contactButtonText, { color: colors.primaryDark }]}>🏪 Contact Restaurant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading deliveries...</Text>
      </View>
    );
  }

  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
  const activeDeliveries = deliveries.filter(d => d.status === 'on_route');
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>My Deliveries</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your assigned delivery orders
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={[styles.refreshButtonText, { color: colors.background }]}>
            {refreshing ? '🔄' : '🔄'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      {deliveries.length > 0 && (
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
      )}

      {deliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            🚚 No Deliveries Yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You don't have any deliveries assigned at the moment.{'\n'}
            New deliveries will appear here automatically.{'\n\n'}
            If you believe you should have deliveries assigned,{'\n'}
            try refreshing or contact support.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={[styles.retryButtonText, { color: colors.background }]}>
              🔄 Refresh
            </Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === 'list' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {pendingDeliveries.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                🟡 Pending Deliveries ({pendingDeliveries.length})
              </Text>
              {pendingDeliveries.map((item) => (
                <View key={item.delivery_id}>
                  {renderDeliveryItem({ item })}
                </View>
              ))}
            </>
          )}

          {activeDeliveries.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: spacing.lg }]}>
                🚚 Active Deliveries ({activeDeliveries.length})
              </Text>
              {activeDeliveries.map((item) => (
                <View key={item.delivery_id}>
                  {renderDeliveryItem({ item })}
                </View>
              ))}
            </>
          )}

          {completedDeliveries.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.success, marginTop: spacing.lg }]}>
                ✅ Completed Deliveries ({completedDeliveries.length})
              </Text>
              {completedDeliveries.map((item) => (
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
              {/* Current Location Marker */}
              <Marker
                coordinate={{
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                }}
                title="Your Location"
                description="Current position"
                pinColor="blue"
              />

              {/* Delivery Route Markers */}
              {deliveries.map((delivery) => {
                const restaurantLat = parseFloat(delivery.order.restaurant.latitude || '0');
                const restaurantLng = parseFloat(delivery.order.restaurant.longitude || '0');

                // Check if restaurant has valid coordinates
                const hasValidRestaurantCoords = restaurantLat !== 0 && restaurantLng !== 0;

                if (!hasValidRestaurantCoords) {
                  return null; // Skip deliveries without restaurant coordinates
                }

                // For demo purposes, create customer location near restaurant
                // In production, this would come from customer address geocoding
                const customerLat = restaurantLat + 0.005 + (delivery.delivery_id % 10) * 0.001;
                const customerLng = restaurantLng + 0.005 + (delivery.delivery_id % 10) * 0.001;

                return (
                  <React.Fragment key={delivery.delivery_id}>
                    {/* Restaurant Marker */}
                    <Marker
                      coordinate={{
                        latitude: restaurantLat,
                        longitude: restaurantLng,
                      }}
                      title={`🏪 ${delivery.order.restaurant.name}`}
                      description={`Pickup location • Order #${delivery.order.id}`}
                      pinColor="green"
                    />

                    {/* Customer Marker */}
                    <Marker
                      coordinate={{
                        latitude: customerLat,
                        longitude: customerLng,
                      }}
                      title={`🏠 ${delivery.order.customer.name}`}
                      description={`Delivery location • ${delivery.status.replace('_', ' ')} • Tap for details`}
                      pinColor={delivery.status === 'delivered' ? 'gray' :
                               delivery.status === 'on_route' ? 'orange' : 'red'}
                      onPress={() => setSelectedDelivery(delivery)}
                    />

                    {/* Route Line for active deliveries */}
                    {delivery.status !== 'delivered' && (
                      <Polyline
                        coordinates={[
                          { latitude: restaurantLat, longitude: restaurantLng },
                          { latitude: customerLat, longitude: customerLng },
                        ]}
                        strokeColor={delivery.status === 'on_route' ? '#FF6B35' : '#4CAF50'}
                        strokeWidth={3}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </MapView>
          ) : (
            <View style={[styles.loadingContainer, styles.map]}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Getting your location for map view...
              </Text>
            </View>
          )}

          <View style={styles.mapOverlay}>
            <Text style={[styles.mapInstructions, { color: colors.textSecondary }]}>
              🟢 Green: Restaurant pickup locations{'\n'}
              🟠 Orange: Active deliveries{'\n'}
              🔴 Red: Pending deliveries{'\n'}
              ⚫ Gray: Completed deliveries{'\n'}
              🔵 Blue: Your current location
            </Text>
          </View>

          {/* Delivery Details Modal */}
          {selectedDelivery && (
            <View style={styles.deliveryDetailsModal}>
              <View style={[styles.deliveryDetailsCard, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Order #{selectedDelivery.order.id} Details
                  </Text>
                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: colors.primary }]}
                    onPress={() => setSelectedDelivery(null)}
                  >
                    <Text style={[styles.closeButtonText, { color: colors.background }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                  <Text style={[styles.detailValue, {
                    color: selectedDelivery.status === 'delivered' ? colors.success :
                           selectedDelivery.status === 'on_route' ? colors.primary : colors.warning
                  }]}>
                    {selectedDelivery.status.replace('_', ' ').toUpperCase()}
                  </Text>

                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedDelivery.order.customer.name}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                    📞 {selectedDelivery.order.customer.phone || 'No phone'}
                  </Text>

                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Restaurant</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedDelivery.order.restaurant.name}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                    📍 {selectedDelivery.order.restaurant.location || 'Address not available'}
                  </Text>

                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Order Details</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    🕒 {new Date(selectedDelivery.order.order_time).toLocaleString()}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    💰 Total: RWF {parseFloat(selectedDelivery.order.total_price.toString()).toFixed(2)}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    📦 {selectedDelivery.order.order_items.length} items
                  </Text>

                  <View style={styles.modalActions}>
                    {selectedDelivery.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.primaryButton]}
                        onPress={() => {
                          handleUpdateDeliveryStatus(selectedDelivery.delivery_id, 'on_route');
                          setSelectedDelivery(null);
                        }}
                      >
                        <Text style={[styles.actionButtonText, { color: colors.background }]}>Start Delivery</Text>
                      </TouchableOpacity>
                    )}

                    {selectedDelivery.status === 'on_route' && (
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.successButton]}
                        onPress={() => {
                          handleUpdateDeliveryStatus(selectedDelivery.delivery_id, 'delivered');
                          setSelectedDelivery(null);
                        }}
                      >
                        <Text style={[styles.actionButtonText, { color: colors.background }]}>Mark Delivered</Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.modalContactButtons}>
                      <TouchableOpacity
                        style={[styles.modalContactButton, { borderColor: colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 3 }]}
                        onPress={() => handleCallCustomer(selectedDelivery)}
                      >
                        <Text style={[styles.contactButtonText, { color: colors.primary }]}>📱 Customer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalContactButton, { borderColor: colors.primaryDark, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 3 }]}
                        onPress={() => handleCallRestaurant(selectedDelivery)}
                      >
                        <Text style={[styles.contactButtonText, { color: colors.primaryDark }]}>🏪 Restaurant</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
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
    marginLeft: Theme.spacing.md,
  },
  refreshButtonText: {
    fontSize: Theme.typography.fontSize.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.xl,
  },
  retryButton: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  retryButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
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
  listContainer: {
    paddingBottom: Theme.spacing.xl,
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
  customerPhone: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  restaurantInfo: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  restaurantAddress: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
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
  actionButtons: {
    marginBottom: Theme.spacing.md,
  },
  actionButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  successButton: {
    backgroundColor: Theme.colors.success,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.background,
  },
  completedText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
    padding: Theme.spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  contactButtonText: {
    fontSize: Theme.typography.fontSize.sm,
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
  mapOverlay: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapInstructions: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  deliveryDetailsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deliveryDetailsCard: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: Theme.borderRadius.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  modalContent: {
    padding: Theme.spacing.lg,
  },
  detailLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  detailValue: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  modalActions: {
    marginTop: Theme.spacing.lg,
  },
  modalActionButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  modalContactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
  },
  modalContactButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});

export default DeliveryDeliveriesTab;