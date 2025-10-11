import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getRestaurants, Restaurant } from '../../lib/api/restaurantApi';
import { getCustomerOrders, Order } from '../../lib/api/orderApi';
import { updateProfile, changePassword } from '../../lib/api/userApi';

type RestaurantWithDistance = Restaurant & { distance: number | null };

// Utility functions for distance calculation
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

interface CustomerDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
  activeTab: string;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ navigation, user, onLogout, activeTab }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(true); // Toggle between map and list view
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
    loadOrders();
    getCurrentLocation();

    // Set up polling for delivery updates every 30 seconds
    const deliveryPollingInterval = setInterval(() => {
      loadOrders();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(deliveryPollingInterval);
    };
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

  const handleUpdateProfile = async () => {
    try {
      const result = await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const handleContactSupport = async () => {
    if (!contactMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    // For now, just show a success message
    // In a real app, this would send the message to support
    Alert.alert('Success', 'Your message has been sent to support. We will get back to you soon!');
    setContactMessage('');
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleCallRestaurant = (order: Order) => {
    // Try owner's phone first, then restaurant contact_info as fallback
    const phoneNumber = order.restaurant.owner?.phone || order.restaurant.contact_info;

    if (phoneNumber) {
      // Clean the phone number (remove any non-numeric characters except +)
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
      const url = `tel:${cleanPhoneNumber}`;

      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      }).catch(() => {
        Alert.alert('Error', 'Unable to make phone call. Please check the phone number format.');
      });
    } else {
      Alert.alert(
        'Contact Unavailable',
        'Restaurant contact information is not available at this time. Please try again later or contact support.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCallDeliveryPerson = (order: Order) => {
    const delivery = order.deliveries?.[0];
    const phoneNumber = delivery?.delivery_person?.phone;

    if (phoneNumber) {
      // Clean the phone number (remove any non-numeric characters except +)
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
      const url = `tel:${cleanPhoneNumber}`;

      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      }).catch(() => {
        Alert.alert('Error', 'Unable to make phone call. Please check the phone number format.');
      });
    } else {
      Alert.alert(
        'Contact Unavailable',
        'Delivery person contact information is not available at this time.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        const validRestaurants = restaurants.filter((restaurant) => {
          const lat = parseFloat(restaurant.latitude || '');
          const lng = parseFloat(restaurant.longitude || '');
          return !isNaN(lat) && !isNaN(lng) &&
                  lat >= -90 && lat <= 90 &&
                  lng >= -180 && lng <= 180;
        });

        // Add distance to each restaurant and sort by distance
        const restaurantsWithDistance: RestaurantWithDistance[] = validRestaurants.map((restaurant) => {
          let distance: number | null = null;
          if (location) {
            const restLat = parseFloat(restaurant.latitude || '0');
            const restLng = parseFloat(restaurant.longitude || '0');
            distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              restLat,
              restLng
            );
          }
          return { ...restaurant, distance };
        }).sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

        return (
          <View style={[styles.tabContent, mapView && styles.mapTabContent]}>
            <View style={styles.mapHeader}>
              <Text style={[styles.mapTitle, { color: colors.text }]}>
                Nearby Restaurants
              </Text>
              <Text style={[styles.restaurantCount, { color: colors.textSecondary }]}>
                {restaurantsWithDistance.length} restaurant{restaurantsWithDistance.length !== 1 ? 's' : ''} found
              </Text>

              {restaurantsWithDistance.length > 0 && (
                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    style={[styles.toggleButton, mapView && styles.toggleButtonActive]}
                    onPress={() => setMapView(true)}
                  >
                    <Text style={[styles.toggleButtonText, mapView && styles.toggleButtonTextActive]}>
                      Map View
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, !mapView && styles.toggleButtonActive]}
                    onPress={() => setMapView(false)}
                  >
                    <Text style={[styles.toggleButtonText, !mapView && styles.toggleButtonTextActive]}>
                      List View
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {restaurantsWithDistance.length === 0 && !loading ? (
              <View style={styles.noRestaurantsContainer}>
                <Text style={[styles.noRestaurantsText, { color: colors.textSecondary }]}>
                  No restaurants with location data available
                </Text>
                <Text style={[styles.noRestaurantsSubtext, { color: colors.textSecondary }]}>
                  Check back later for restaurant locations
                </Text>
              </View>
            ) : mapView ? (
              // Map View
              <View style={styles.mapContainer}>
                {location ? (
                  <MapView
                    style={styles.expandedMap}
                    initialRegion={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                    showsUserLocation
                    showsMyLocationButton
                    showsCompass
                    zoomEnabled
                    scrollEnabled
                  >
                    {restaurantsWithDistance.map((restaurant) => (
                      <Marker
                        key={restaurant.id}
                        coordinate={{
                          latitude: parseFloat(restaurant.latitude || '0'),
                          longitude: parseFloat(restaurant.longitude || '0'),
                        }}
                        title={restaurant.name}
                        description={`${restaurant.location}${restaurant.distance !== null ? ` • ${restaurant.distance.toFixed(1)} km away` : ''} • Tap to view menu & order`}
                        pinColor={colors.primary}
                        onPress={() => handleRestaurantPress(restaurant)}
                      />
                    ))}
                  </MapView>
                ) : (
                  <View style={[styles.loadingContainer, styles.expandedMap]}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>
                      {loading ? 'Getting your location...' : 'Location not available'}
                    </Text>
                    {restaurantsWithDistance.length > 0 && (
                      <Text style={[styles.locationNote, { color: colors.textSecondary }]}>
                        Showing all restaurants on map
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.mapOverlay}>
                  <Text style={[styles.mapInstructions, { color: colors.textSecondary }]}>
                    Tap on restaurant markers to view menu and place orders
                  </Text>
                </View>
              </View>
            ) : (
              // List View
              <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {restaurantsWithDistance.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    style={[styles.restaurantCard, { backgroundColor: colors.surface }]}
                    onPress={() => handleRestaurantPress(restaurant)}
                  >
                    <View style={styles.restaurantCardContent}>
                      <Text style={[styles.restaurantCardName, { color: colors.text }]}>
                        {restaurant.name}
                      </Text>
                      <Text style={[styles.restaurantCardLocation, { color: colors.textSecondary }]}>
                        📍 {restaurant.location}
                      </Text>
                      {restaurant.distance !== null && (
                        <Text style={[styles.restaurantCardDistance, { color: colors.primary }]}>
                          📏 {restaurant.distance.toFixed(1)} km away
                        </Text>
                      )}
                      {restaurant.contact_info && (
                        <Text style={[styles.restaurantCardContact, { color: colors.textSecondary }]}>
                          📞 {restaurant.contact_info}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.restaurantCardArrow, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.restaurantCardArrowText, { color: colors.background }]}>
                        →
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        );
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>My Orders</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Your order history and current orders with real-time delivery tracking.
            </Text>
            {orders.length === 0 ? (
              <Text style={[styles.noOrdersText, { color: colors.textSecondary }]}>
                No orders yet. Start by exploring restaurants on the map!
              </Text>
            ) : (
              orders.map((order) => (
                <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <Text style={[styles.restaurantName, { color: colors.text }]}>
                        {order.restaurant.name}
                      </Text>
                      <Text style={[styles.restaurantLocation, { color: colors.textSecondary }]}>
                        📍 {order.restaurant.location || 'Location not specified'}
                      </Text>
                    </View>
                    <View style={styles.orderHeaderRight}>
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
                      <TouchableOpacity
                        style={[styles.callButton, { backgroundColor: colors.success }]}
                        onPress={() => handleCallRestaurant(order)}
                      >
                        <Text style={[styles.callButtonText, { color: colors.background }]}>
                          📞 Call
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
                      📅 {new Date(order.order_time).toLocaleDateString()} at {new Date(order.order_time).toLocaleTimeString()}
                    </Text>
                    <Text style={[styles.orderType, { color: colors.primary }]}>
                      📋 {order.order_type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.orderItemsSection}>
                    <Text style={[styles.orderItemsTitle, { color: colors.text }]}>Items Ordered:</Text>
                    {order.order_items.map((item, index) => (
                      <View key={index} style={styles.orderItem}>
                        <Text style={[styles.orderItemName, { color: colors.text }]}>
                          {item.item.name} x{item.quantity}
                        </Text>
                        <Text style={[styles.orderItemPrice, { color: colors.primary }]}>
                          ${(parseFloat(item.item.price.toString()) * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                    {order.order_items.some(item => item.preferences) && (
                      <View style={styles.orderPreferences}>
                        <Text style={[styles.orderPreferencesTitle, { color: colors.textSecondary }]}>
                          Special Instructions:
                        </Text>
                        {order.order_items
                          .filter(item => item.preferences)
                          .map((item, index) => (
                            <Text key={index} style={[styles.orderPreferenceText, { color: colors.textSecondary }]}>
                              • {item.item.name}: {item.preferences}
                            </Text>
                          ))}
                      </View>
                    )}
                  </View>

                  {/* Delivery Tracking for Delivery Orders */}
                  {order.order_type === 'delivery' && order.deliveries && order.deliveries.length > 0 && (
                    <View style={styles.deliveryTracking}>
                      <Text style={[styles.deliveryTrackingTitle, { color: colors.text }]}>
                        🚚 Delivery Tracking
                      </Text>
                      {order.deliveries.map((delivery, index) => (
                        <View key={index} style={styles.deliveryInfo}>
                          <View style={styles.deliveryStatusRow}>
                            <Text style={[styles.deliveryStatus, {
                              color: delivery.status === 'delivered' ? colors.success :
                                     delivery.status === 'on_route' ? colors.primary : colors.warning
                            }]}>
                              {delivery.status === 'pending' ? '⏳ Awaiting Assignment' :
                               delivery.status === 'on_route' ? '🚴 On the Way' :
                               delivery.status === 'delivered' ? '✅ Delivered' : delivery.status}
                            </Text>
                            {delivery.delivery_person && (
                              <TouchableOpacity
                                style={[styles.callDeliveryButton, { backgroundColor: colors.success }]}
                                onPress={() => handleCallDeliveryPerson(order)}
                              >
                                <Text style={[styles.callDeliveryButtonText, { color: colors.background }]}>
                                  📞 Call {delivery.delivery_person.name}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          {delivery.delivery_person && (
                            <Text style={[styles.deliveryPersonInfo, { color: colors.textSecondary }]}>
                              Delivery by: {delivery.delivery_person.name}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <Text style={[styles.orderTotal, { color: colors.primary }]}>
                      Total: ${parseFloat(order.total_price.toString()).toFixed(2)}
                    </Text>
                    <Text style={[styles.orderItemsCount, { color: colors.textSecondary }]}>
                      {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      case 'profile':
        return (
          <ScrollView style={styles.tabContent}>
            {/* Edit Profile */}
            <View style={styles.profileSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Edit Profile</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={profileName}
                onChangeText={setProfileName}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={profileEmail}
                onChangeText={setProfileEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Phone"
                placeholderTextColor={colors.textSecondary}
                value={profilePhone}
                onChangeText={setProfilePhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateProfile}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Update Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Change Password */}
            <View style={styles.profileSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Current Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="New Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Confirm New Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Change Password</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Support */}
            <View style={styles.profileSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Support</Text>
              <Text style={[styles.supportInfo, { color: colors.textSecondary }]}>
                Need help? Send us a message and we'll get back to you as soon as possible.
              </Text>
              <TextInput
                style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                placeholder="Describe your issue or question..."
                placeholderTextColor={colors.textSecondary}
                value={contactMessage}
                onChangeText={setContactMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleContactSupport}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Content */}
      {activeTab === 'map' && mapView ? (
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>
      ) : (
        <ScrollView style={styles.contentContainer}>
          {renderTabContent()}
        </ScrollView>
      )}

      {activeTab === 'profile' && (
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={onLogout}>
          <Text style={[styles.logoutText, { color: colors.background }]}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: Theme.spacing.lg,
  },
  mapTabContent: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  map: {
    width: '100%',
    height: 400,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  expandedMap: {
    flex: 1,
    width: '100%',
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
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
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
  orderHeaderLeft: {
    flex: 1,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  restaurantLocation: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  callButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.sm,
  },
  callButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  orderDetails: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  orderType: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginTop: Theme.spacing.xs,
  },
  orderItemsSection: {
    marginTop: Theme.spacing.md,
  },
  orderItemsTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    paddingLeft: Theme.spacing.md,
  },
  orderItemName: {
    fontSize: Theme.typography.fontSize.md,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  orderPreferences: {
    marginTop: Theme.spacing.sm,
    paddingLeft: Theme.spacing.md,
  },
  orderPreferencesTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  orderPreferenceText: {
    fontSize: Theme.typography.fontSize.sm,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  orderItemsCount: {
    fontSize: Theme.typography.fontSize.sm,
  },
  deliveryTracking: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  deliveryTrackingTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  deliveryInfo: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  deliveryStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  deliveryStatus: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  deliveryPersonInfo: {
    fontSize: Theme.typography.fontSize.sm,
  },
  callDeliveryButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  callDeliveryButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  logoutText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  profileSection: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
    height: 100,
  },
  supportInfo: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  mapHeader: {
    marginBottom: Theme.spacing.md,
  },
  mapTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  restaurantCount: {
    fontSize: Theme.typography.fontSize.md,
  },
  locationNote: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  noRestaurantsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  noRestaurantsText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  noRestaurantsSubtext: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
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
  viewToggle: {
    flexDirection: 'row',
    marginTop: Theme.spacing.md,
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
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    alignItems: 'center',
  },
  restaurantCardContent: {
    flex: 1,
  },
  restaurantCardName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  restaurantCardLocation: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  restaurantCardDistance: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  restaurantCardContact: {
    fontSize: Theme.typography.fontSize.sm,
  },
  restaurantCardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantCardArrowText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
});

export default CustomerDashboard;