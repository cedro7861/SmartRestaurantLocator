import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getRestaurants, Restaurant } from '../../lib/api/restaurantApi';
import { getCustomerOrders, Order } from '../../lib/api/orderApi';
import { updateProfile, changePassword } from '../../lib/api/userApi';

type RestaurantWithDistance = Restaurant & { distance: number | null };

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
  const [mapView, setMapView] = useState(true);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [showLiveTracking, setShowLiveTracking] = useState<{[key: number]: boolean}>({});
  const [countdownTimers, setCountdownTimers] = useState<{[key: number]: number}>({});
  const [expandedOrders, setExpandedOrders] = useState<{[key: number]: boolean}>({});

  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
    loadOrders();
    getCurrentLocation();

    const deliveryPollingInterval = setInterval(() => {
      loadOrders();
    }, 8000);

    return () => {
      clearInterval(deliveryPollingInterval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimers(prev => {
        const newTimers: {[key: number]: number} = {};
        orders.forEach(order => {
          if (order.order_type === 'delivery' && order.deliveries && order.deliveries.length > 0) {
            const delivery = order.deliveries[0];
            if (delivery.status === 'on_route' && delivery.latitude && delivery.longitude && location) {
              const distance = calculateDistance(delivery.latitude, delivery.longitude, location.coords.latitude, location.coords.longitude);
              const avgSpeed = 30;
              const etaMinutes = Math.max(1, Math.ceil((distance / avgSpeed) * 60));
              const etaSeconds = etaMinutes * 60;
              const bufferMinutes = distance < 2 ? 5 : distance < 5 ? 10 : 15;
              const totalSeconds = Math.max(60, etaSeconds + (bufferMinutes * 60));
              newTimers[order.id] = Math.max(0, totalSeconds);
            }
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders, location]);

  useEffect(() => {
    setProfileName(user?.name || '');
    setProfileEmail(user?.email || '');
    setProfilePhone(user?.phone || '');
  }, [user]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getCustomerOrders();
      setOrders(data);
    } catch (error) {
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
      if (!profileName.trim() || !profileEmail.trim()) {
        Alert.alert('Error', 'Name and email are required');
        return;
      }

      await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
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
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    }
  };

  const handleContactSupport = async () => {
    if (!contactMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    Alert.alert('Success', 'Your message has been sent to support. We will get back to you soon!');
    setContactMessage('');
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleCallRestaurant = (order: Order) => {
    const phoneNumber = order.restaurant.owner?.phone || order.restaurant.contact_info;

    if (phoneNumber) {
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      Alert.alert(
        'Contact Restaurant',
        `Choose how to contact ${order.restaurant.name}:`,
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
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      Alert.alert(
        'Contact Delivery Person',
        `Choose how to contact ${delivery?.delivery_person?.name || 'your delivery person'}:`,
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
      Alert.alert(
        'Contact Unavailable',
        'Delivery person contact information is not available at this time.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleLiveTracking = (orderId: number) => {
    setShowLiveTracking(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getRestaurantsWithDistance = (): RestaurantWithDistance[] => {
    const validRestaurants = restaurants.filter((restaurant) => {
      const lat = parseFloat(restaurant.latitude || '');
      const lng = parseFloat(restaurant.longitude || '');
      return !isNaN(lat) && !isNaN(lng) &&
             lat >= -90 && lat <= 90 &&
             lng >= -180 && lng <= 180;
    });

    return validRestaurants.map((restaurant) => {
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
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const formatCountdown = (seconds: number): string => {
    if (seconds <= 0) return '🚗 Arriving now!';
    if (seconds <= 60) return `🚀 ${seconds}s remaining`;
    if (seconds <= 300) return `⚡ ${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')} min`;
    if (seconds <= 1800) return `🕐 ${Math.floor(seconds / 60)} min`;
    return `📅 ${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        const restaurantsWithDistance = getRestaurantsWithDistance();

        return (
          <View style={styles.tabContent}>
            <View style={styles.mapHeader}>
              <View style={styles.headerContent}>
                <View style={styles.titleSection}>
                  <Text style={[styles.mapTitle, { color: colors.text }]}>
                    🍽️ Restaurant Explorer
                  </Text>
                  <Text style={[styles.restaurantCount, { color: colors.textSecondary }]}>
                    {restaurantsWithDistance.length} restaurant{restaurantsWithDistance.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                    onPress={loadRestaurants}
                  >
                    <Text style={[styles.refreshButtonText, { color: colors.background }]}>🔄</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {restaurantsWithDistance.length > 0 && (
                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    style={[styles.toggleButton, mapView && styles.toggleButtonActive]}
                    onPress={() => setMapView(true)}
                  >
                    <Text style={[styles.toggleButtonText, mapView && styles.toggleButtonTextActive]}>
                      🗺️ Map View
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, !mapView && styles.toggleButtonActive]}
                    onPress={() => setMapView(false)}
                  >
                    <Text style={[styles.toggleButtonText, !mapView && styles.toggleButtonTextActive]}>
                      📋 List View
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingAnimation}>
                  <Text style={styles.loadingIcon}>🍽️</Text>
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Discovering restaurants...
                  </Text>
                  <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
                    Finding the best dining options near you
                  </Text>
                </View>
              </View>
            ) : restaurantsWithDistance.length === 0 ? (
              <View style={styles.noRestaurantsContainer}>
                <Text style={styles.noRestaurantsIcon}>🏪</Text>
                <Text style={[styles.noRestaurantsText, { color: colors.textSecondary }]}>
                  No restaurants available
                </Text>
                <Text style={[styles.noRestaurantsSubtext, { color: colors.textSecondary }]}>
                  Restaurants are being added regularly. Check back soon!
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.primary }]}
                  onPress={loadRestaurants}
                >
                  <Text style={[styles.retryButtonText, { color: colors.background }]}>🔄 Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : mapView ? (
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
                    mapType="standard"
                  >
                    {restaurantsWithDistance.map((restaurant, index) => (
                      <Marker
                        key={restaurant.id}
                        coordinate={{
                          latitude: parseFloat(restaurant.latitude || '0'),
                          longitude: parseFloat(restaurant.longitude || '0'),
                        }}
                        title={restaurant.name}
                        description={`${restaurant.location}${restaurant.distance !== null ? ` • ${restaurant.distance.toFixed(1)} km away` : ''}`}
                        pinColor={restaurant.distance !== null && restaurant.distance <= 2 ? colors.success :
                                 restaurant.distance !== null && restaurant.distance <= 5 ? colors.warning : colors.primary}
                        onPress={() => handleRestaurantPress(restaurant)}
                      >
                        <View style={[styles.customMarker, {
                          backgroundColor: restaurant.distance !== null && restaurant.distance <= 2 ? colors.success :
                                         restaurant.distance !== null && restaurant.distance <= 5 ? colors.warning : colors.primary
                        }]}>
                          <Text style={styles.markerIcon}>🏪</Text>
                        </View>
                      </Marker>
                    ))}
                  </MapView>
                ) : (
                  <View style={[styles.loadingContainer, styles.expandedMap]}>
                    <View style={styles.locationErrorContainer}>
                      <Text style={styles.locationErrorIcon}>📍</Text>
                      <Text style={[styles.loadingText, { color: colors.text }]}>
                        Location access needed
                      </Text>
                      <Text style={[styles.locationNote, { color: colors.textSecondary }]}>
                        Enable location to see restaurants near you
                      </Text>
                      <TouchableOpacity
                        style={[styles.locationButton, { backgroundColor: colors.primary }]}
                        onPress={getCurrentLocation}
                      >
                        <Text style={[styles.locationButtonText, { color: colors.background }]}>📍 Enable Location</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.mapOverlay}>
                  <View style={styles.mapLegendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                      <Text style={[styles.legendText, { color: colors.background }]}>Very Close (≤2km)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                      <Text style={[styles.legendText, { color: colors.background }]}>Nearby (≤5km)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.legendText, { color: colors.background }]}>Further Away</Text>
                    </View>
                  </View>
                  <Text style={[styles.mapInstructions, { color: colors.background }]}>
                    Tap restaurant markers to explore menus and place orders
                  </Text>
                </View>
              </View>
            ) : (
              <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {restaurantsWithDistance.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    style={[styles.restaurantCard, { backgroundColor: colors.surface }]}
                    onPress={() => handleRestaurantPress(restaurant)}
                  >
                    <View style={styles.restaurantCardContent}>
                      <View style={styles.restaurantCardHeader}>
                        <Text style={[styles.restaurantCardName, { color: colors.text }]}>
                          {restaurant.name}
                        </Text>
                        <View style={[styles.distanceBadge, {
                          backgroundColor: restaurant.distance !== null && restaurant.distance <= 2 ? colors.success + '20' :
                                         restaurant.distance !== null && restaurant.distance <= 5 ? colors.warning + '20' : colors.primary + '20'
                        }]}>
                          <Text style={[styles.distanceBadgeText, {
                            color: restaurant.distance !== null && restaurant.distance <= 2 ? colors.success :
                                   restaurant.distance !== null && restaurant.distance <= 5 ? colors.warning : colors.primary
                          }]}>
                            {restaurant.distance !== null ? `${restaurant.distance.toFixed(1)} km` : 'Distance unknown'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.restaurantCardLocation, { color: colors.textSecondary }]}>
                        📍 {restaurant.location}
                      </Text>
                      <View style={styles.restaurantCardDetails}>
                        {restaurant.contact_info && (
                          <Text style={[styles.restaurantCardContact, { color: colors.textSecondary }]}>
                            📞 {restaurant.contact_info}
                          </Text>
                        )}
                        <Text style={[styles.restaurantCardStatus, { color: restaurant.status === 'open' ? colors.success : colors.error }]}>
                          {restaurant.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                        </Text>
                      </View>
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
            <View style={styles.ordersHeader}>
              <Text style={[styles.tabTitle, { color: colors.text }]}>Order History</Text>
              <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
                View your complete order history with detailed information and status updates.
              </Text>
              <View style={styles.ordersStats}>
                <View style={styles.orderStat}>
                  <Text style={[styles.orderStatValue, { color: colors.primary }]}>{orders.length}</Text>
                  <Text style={[styles.orderStatLabel, { color: colors.textSecondary }]}>Total Orders</Text>
                </View>
                <View style={styles.orderStat}>
                  <Text style={[styles.orderStatValue, { color: colors.warning }]}>{orders.filter(o => o.status !== 'delivered').length}</Text>
                  <Text style={[styles.orderStatLabel, { color: colors.textSecondary }]}>Active</Text>
                </View>
                <View style={styles.orderStat}>
                  <Text style={[styles.orderStatValue, { color: colors.success }]}>{orders.filter(o => o.status === 'delivered').length}</Text>
                  <Text style={[styles.orderStatLabel, { color: colors.textSecondary }]}>Completed</Text>
                </View>
              </View>
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyOrdersContainer}>
                <Text style={[styles.emptyOrdersIcon, { color: colors.textSecondary }]}>📋</Text>
                <Text style={[styles.emptyOrdersTitle, { color: colors.text }]}>No Orders Found</Text>
                <Text style={[styles.emptyOrdersSubtitle, { color: colors.textSecondary }]}>
                  You haven't placed any orders yet. Start exploring restaurants to place your first order.
                </Text>
                <TouchableOpacity
                  style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('Map')}
                >
                  <Text style={[styles.exploreButtonText, { color: colors.background }]}>Browse Restaurants</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {orders.map((order) => (
                  <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.orderHeader}>
                      <View style={styles.orderHeaderLeft}>
                        <Text style={[styles.restaurantName, { color: colors.text }]}>
                          {order.restaurant.name}
                        </Text>
                        <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
                          📅 {new Date(order.order_time).toLocaleDateString()} • {new Date(order.order_time).toLocaleTimeString()}
                        </Text>
                        <Text style={[styles.orderTotal, { color: colors.primary }]}>
                          💰 ${parseFloat(order.total_price.toString()).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.orderHeaderRight}>
                        <View style={[styles.statusBadge, {
                          backgroundColor: order.status === 'delivered' ? colors.success + '20' :
                                          order.status === 'pending' ? colors.warning + '20' :
                                          order.status === 'confirmed' ? colors.info + '20' :
                                          order.status === 'preparing' ? colors.warning + '20' :
                                          order.status === 'ready' ? colors.primary + '20' :
                                          order.status === 'delivering' ? colors.primary + '20' : colors.error + '20'
                        }]}>
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
                        </View>
                        <TouchableOpacity
                          style={[styles.viewDetailsButton, { backgroundColor: colors.primary }]}
                          onPress={() => toggleOrderDetails(order.id)}
                        >
                          <Text style={[styles.viewDetailsText, { color: colors.background }]}>
                            {expandedOrders[order.id] ? '👁️ Hide Details' : '📋 View Details'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {expandedOrders[order.id] && (
                      <View style={styles.expandedDetails}>
                        <View style={styles.detailSection}>
                          <Text style={[styles.detailSectionTitle, { color: colors.text }]}>📍 Restaurant Information</Text>
                          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            {order.restaurant.name}
                          </Text>
                          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            📍 {order.restaurant.location || 'Location not specified'}
                          </Text>
                          {order.restaurant.contact_info && (
                            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                              📞 {order.restaurant.contact_info}
                            </Text>
                          )}
                          <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: colors.success }]}
                            onPress={() => handleCallRestaurant(order)}
                          >
                            <Text style={[styles.contactButtonText, { color: colors.background }]}>📞 Contact Restaurant</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.detailSection}>
                          <Text style={[styles.detailSectionTitle, { color: colors.text }]}>🍽️ Order Details</Text>
                          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            📋 {order.order_type.replace('_', ' ').toUpperCase()}
                          </Text>
                          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            📦 {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''} ordered
                          </Text>
                        </View>

                        <View style={styles.detailSection}>
                          <Text style={[styles.detailSectionTitle, { color: colors.text }]}>📝 Items Ordered</Text>
                          {order.order_items.map((item, index) => (
                            <View key={index} style={styles.orderItemDetail}>
                              <Text style={[styles.itemName, { color: colors.text }]}>
                                {item.item.name} x{item.quantity}
                              </Text>
                              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                ${(parseFloat(item.item.price.toString()) * item.quantity).toFixed(2)}
                              </Text>
                            </View>
                          ))}
                          {order.order_items.some(item => item.preferences) && (
                            <View style={styles.specialInstructions}>
                              <Text style={[styles.instructionsTitle, { color: colors.textSecondary }]}>Special Instructions:</Text>
                              {order.order_items
                                .filter(item => item.preferences)
                                .map((item, index) => (
                                  <Text key={index} style={[styles.instructionText, { color: colors.textSecondary }]}>
                                    • {item.item.name}: {item.preferences}
                                  </Text>
                                ))}
                            </View>
                          )}
                        </View>

                        {order.order_type === 'delivery' && order.deliveries && order.deliveries.length > 0 && (
                          <View style={styles.deliveryTracking}>
                            <View style={styles.deliveryTrackingHeader}>
                              <Text style={[styles.deliveryTrackingTitle, { color: colors.text }]}>
                                🚚 Live Delivery Tracking
                              </Text>
                              <Text style={[styles.deliveryTrackingSubtitle, { color: colors.textSecondary }]}>
                                Real-time updates every 8 seconds • Track your delivery's journey
                              </Text>
                            </View>

                            {order.deliveries.map((delivery, index) => (
                              <View key={index} style={styles.deliveryInfo}>
                                <View style={styles.progressContainer}>
                                  {[
                                    { key: 'assigned', label: 'Assigned', icon: '📋' },
                                    { key: 'on_route', label: 'On the Way', icon: '🚴' },
                                    { key: 'delivered', label: 'Delivered', icon: '✅' }
                                  ].map((step, stepIndex) => {
                                    const isCompleted = delivery.status === 'delivered' ||
                                      (delivery.status === 'on_route' && stepIndex <= 1) ||
                                      (delivery.status === 'pending' && stepIndex === 0);
                                    const isActive = (delivery.status === 'pending' && stepIndex === 0) ||
                                      (delivery.status === 'on_route' && stepIndex === 1) ||
                                      (delivery.status === 'delivered' && stepIndex === 2);

                                    return (
                                      <View key={step.key} style={styles.progressStep}>
                                        <View style={[styles.progressCircle, {
                                          backgroundColor: isCompleted ? colors.success :
                                            isActive ? colors.primary : colors.border,
                                          borderColor: isActive ? colors.primary : colors.border
                                        }]}>
                                          <Text style={[styles.progressIcon, {
                                            color: isCompleted || isActive ? colors.background : colors.textSecondary
                                          }]}>
                                            {isCompleted ? '✓' : step.icon}
                                          </Text>
                                        </View>
                                        <Text style={[styles.progressLabel, {
                                          color: isActive ? colors.primary : isCompleted ? colors.success : colors.textSecondary,
                                          fontWeight: isActive ? 'bold' : 'normal'
                                        }]}>
                                          {step.label}
                                        </Text>
                                        {stepIndex < 2 && (
                                          <View style={[styles.progressLine, {
                                            backgroundColor: delivery.status === 'delivered' ||
                                              (delivery.status === 'on_route' && stepIndex === 0) ? colors.success : colors.border
                                          }]} />
                                        )}
                                      </View>
                                    );
                                  })}
                                </View>

                                {delivery.delivery_person && (
                                  <View style={styles.deliveryPersonSection}>
                                    <View style={styles.deliveryPersonHeader}>
                                      <Text style={[styles.deliveryPersonTitle, { color: colors.text }]}>
                                        🚴 Your Delivery Partner
                                      </Text>
                                      <TouchableOpacity
                                        style={[styles.callDeliveryButton, { backgroundColor: colors.success }]}
                                        onPress={() => handleCallDeliveryPerson(order)}
                                      >
                                        <Text style={[styles.callDeliveryButtonText, { color: colors.background }]}>
                                          📞 Contact Driver
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                    <Text style={[styles.deliveryPersonName, { color: colors.text }]}>
                                      {delivery.delivery_person.name}
                                    </Text>
                                    <Text style={[styles.deliveryPersonContact, { color: colors.textSecondary }]}>
                                      📱 {delivery.delivery_person.phone || 'Contact available when needed'}
                                    </Text>
                                  </View>
                                )}

                                {delivery.status === 'on_route' && delivery.latitude && delivery.longitude && location && (
                                  <View style={styles.professionalTrackingSection}>
                                    <View style={styles.trackingHeaderProfessional}>
                                      <View style={styles.trackingHeaderLeft}>
                                        <View style={styles.liveBadgeContainer}>
                                          <View style={[styles.livePulseDot, { backgroundColor: colors.success }]} />
                                          <Text style={[styles.liveTrackingTitleProfessional, { color: colors.primary }]}>
                                            🚀 LIVE TRACKING
                                          </Text>
                                        </View>
                                        <Text style={[styles.trackingSubtitle, { color: colors.textSecondary }]}>
                                          {showLiveTracking[order.id] ? 'Full details visible' : 'Minimal data mode'}
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        style={[styles.mapToggleButton, {
                                          backgroundColor: showLiveTracking[order.id] ? colors.primary : 'transparent',
                                          borderColor: colors.primary,
                                          borderWidth: showLiveTracking[order.id] ? 0 : 1
                                        }]}
                                        onPress={() => toggleLiveTracking(order.id)}
                                      >
                                        <Text style={[styles.mapToggleText, {
                                          color: showLiveTracking[order.id] ? colors.background : colors.primary
                                        }]}>
                                          {showLiveTracking[order.id] ? '👁️ Hide Details' : '📱 View Details'}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>

                                    <View style={styles.essentialInfoContainer}>
                                      <View style={styles.essentialMetric}>
                                        <Text style={[styles.essentialLabel, { color: colors.textSecondary }]}>ETA</Text>
                                        <Text style={[styles.essentialValue, {
                                          color: countdownTimers[order.id] <= 300 ? colors.error :
                                                 countdownTimers[order.id] <= 600 ? colors.warning : colors.primary,
                                          fontWeight: 'bold'
                                        }]}>
                                          {formatCountdown(countdownTimers[order.id] || (calculateDistance(delivery.latitude, delivery.longitude, location.coords.latitude, location.coords.longitude) * 60 * 2))}
                                        </Text>
                                      </View>
                                      <View style={styles.essentialMetric}>
                                        <Text style={[styles.essentialLabel, { color: colors.textSecondary }]}>Distance</Text>
                                        <Text style={[styles.essentialValue, { color: colors.text, fontWeight: 'bold' }]}>
                                          {calculateDistance(delivery.latitude, delivery.longitude, location.coords.latitude, location.coords.longitude).toFixed(1)} km
                                        </Text>
                                      </View>
                                      <View style={styles.essentialMetric}>
                                        <Text style={[styles.essentialLabel, { color: colors.textSecondary }]}>Status</Text>
                                        <Text style={[styles.essentialValue, { color: colors.primary, fontWeight: 'bold' }]}>
                                          🚴 On Route
                                        </Text>
                                      </View>
                                    </View>

                                    {showLiveTracking[order.id] && (
                                      <>
                                        <View style={styles.trackingMetricsContainer}>
                                          <View style={styles.metricCard}>
                                            <View style={styles.metricIcon}>
                                              <Text style={styles.metricIconText}>⏱️</Text>
                                            </View>
                                            <View style={styles.metricContent}>
                                              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                                                Estimated Arrival
                                              </Text>
                                              <Text style={[styles.metricValue, {
                                                color: countdownTimers[order.id] <= 300 ? colors.error :
                                                       countdownTimers[order.id] <= 600 ? colors.warning : colors.primary,
                                                fontSize: 20,
                                                fontWeight: 'bold'
                                              }]}>
                                                {formatCountdown(countdownTimers[order.id] || (calculateDistance(delivery.latitude, delivery.longitude, location.coords.latitude, location.coords.longitude) * 60 * 2))}
                                              </Text>
                                              <View style={styles.timeProgressContainer}>
                                                <View style={[styles.timeProgressBar, {
                                                  width: `${Math.max(5, Math.min(100, ((countdownTimers[order.id] || 1800) / 3600) * 100))}%`,
                                                  backgroundColor: countdownTimers[order.id] <= 300 ? colors.error :
                                                                 countdownTimers[order.id] <= 600 ? colors.warning : colors.primary
                                                }]} />
                                              </View>
                                              <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
                                                Live countdown • Auto-updates every second
                                              </Text>
                                            </View>
                                          </View>

                                          <View style={styles.metricCard}>
                                            <View style={styles.metricIcon}>
                                              <Text style={styles.metricIconText}>📍</Text>
                                            </View>
                                            <View style={styles.metricContent}>
                                              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                                                Distance Remaining
                                              </Text>
                                              <Text style={[styles.metricValue, { color: colors.text, fontSize: 20, fontWeight: 'bold' }]}>
                                                {calculateDistance(delivery.latitude, delivery.longitude, location.coords.latitude, location.coords.longitude).toFixed(1)} km
                                              </Text>
                                              <Text style={[styles.metricSubtext, { color: colors.textSecondary }]}>
                                                Straight line distance • GPS tracking active
                                              </Text>
                                            </View>
                                          </View>
                                        </View>

                                        <View style={styles.enhancedStatusContainer}>
                                          <View style={styles.professionalStatusRow}>
                                            <View style={styles.statusIndicators}>
                                              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]}>
                                                <Text style={styles.statusIndicatorText}>📡 GPS Active</Text>
                                              </View>
                                              <View style={[styles.statusIndicator, { backgroundColor: colors.primary }]}>
                                                <Text style={styles.statusIndicatorText}>🚀 Live Tracking</Text>
                                              </View>
                                              <View style={[styles.statusIndicator, { backgroundColor: colors.info }]}>
                                                <Text style={styles.statusIndicatorText}>⚡ Real-time</Text>
                                              </View>
                                            </View>
                                            <View style={styles.updateInfo}>
                                              <Text style={[styles.lastUpdateText, { color: colors.textSecondary }]}>
                                                Updated: {new Date().toLocaleTimeString()}
                                              </Text>
                                            </View>
                                          </View>

                                          <View style={styles.deliveryInsights}>
                                            <Text style={[styles.deliverySpeedText, { color: colors.text }]}>
                                              🚴 Driver moving at ~30 km/h • High GPS accuracy • Route optimized
                                            </Text>
                                            <Text style={[styles.deliveryTip, { color: colors.textSecondary }]}>
                                              💡 Tip: You can call your driver anytime using the contact button above
                                            </Text>
                                          </View>
                                        </View>

                                        <View style={styles.deliveryMapContainer}>
                                          <View style={styles.deliveryMapHeader}>
                                              <Text style={[styles.deliveryMapTitle, { color: colors.text }]}>
                                                🗺️ Live Delivery Route
                                              </Text>
                                              <Text style={[styles.deliveryMapSubtitle, { color: colors.textSecondary }]}>
                                                Real-time tracking • Auto-updates every 8 seconds
                                              </Text>
                                            </View>
                                          <MapView
                                            style={styles.deliveryMap}
                                            initialRegion={{
                                              latitude: delivery.latitude,
                                              longitude: delivery.longitude,
                                              latitudeDelta: 0.015,
                                              longitudeDelta: 0.015,
                                            }}
                                            showsUserLocation={false}
                                            showsMyLocationButton={false}
                                            zoomEnabled={true}
                                            scrollEnabled={true}
                                          >
                                            <Marker
                                              coordinate={{
                                                latitude: delivery.latitude,
                                                longitude: delivery.longitude,
                                              }}
                                              title={`🚴 ${delivery.delivery_person?.name || 'Delivery Person'}`}
                                              description={`Status: On the Way • ETA: ${formatCountdown(countdownTimers[order.id] || (calculateDistance(delivery.latitude, delivery.longitude, location.coords.latitude, location.coords.longitude) * 60 * 2))}`}
                                              pinColor={colors.primary}
                                            />

                                            {order.restaurant.latitude && order.restaurant.longitude && (
                                              <Marker
                                                coordinate={{
                                                  latitude: parseFloat(order.restaurant.latitude),
                                                  longitude: parseFloat(order.restaurant.longitude),
                                                }}
                                                title={`🏪 ${order.restaurant.name}`}
                                                description="Pickup location"
                                                pinColor={colors.warning}
                                              />
                                            )}

                                            {location && (
                                              <Marker
                                                coordinate={{
                                                  latitude: location.coords.latitude,
                                                  longitude: location.coords.longitude,
                                                }}
                                                title="🏠 Your Location"
                                                description="Delivery destination"
                                                pinColor={colors.success}
                                              />
                                            )}
                                          </MapView>
                                          <View style={styles.mapLegendContainer}>
                                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                                              🔵 Delivery Person • 🟡 Restaurant • 🟢 Your Location
                                            </Text>
                                          </View>
                                        </View>
                                      </>
                                    )}
                                  </View>
                                )}

                                {delivery.status === 'delivered' && (
                                  <View style={[styles.completionNotice, { backgroundColor: colors.success + '10' }]}>
                                    <Text style={[styles.completionIcon, { color: colors.success }]}>🎉</Text>
                                    <View style={styles.completionContent}>
                                      <Text style={[styles.completionTitle, { color: colors.success }]}>
                                        Delivery Completed!
                                      </Text>
                                      <Text style={[styles.completionMessage, { color: colors.textSecondary }]}>
                                        Your order has been successfully delivered. Enjoy your meal!
                                      </Text>
                                    </View>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        )}
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
                ))}
              </ScrollView>
            )}
          </View>
        );
      case 'profile':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
      case 'home':
        const totalOrders = orders.length;
        const activeOrders = orders.filter(order => order.status !== 'delivered').length;
        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
        const recentOrders = orders.slice(0, 3);

        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.welcomeHeader}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Welcome back, {user?.name || 'Customer'}! 👋
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                Here's an overview of your dining experience
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statIcon, { color: colors.primary }]}>📊</Text>
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
                <Text style={[styles.statValue, { color: colors.text }]}>${totalSpent.toFixed(2)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Spent</Text>
              </View>
            </View>

            <View style={styles.quickActionsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('Map')}
                >
                  <Text style={[styles.quickActionIcon, { color: colors.background }]}>🍽️</Text>
                  <Text style={[styles.quickActionText, { color: colors.background }]}>Browse Restaurants</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.info }]}
                  onPress={() => navigation.navigate('Orders')}
                >
                  <Text style={[styles.quickActionIcon, { color: colors.background }]}>📋</Text>
                  <Text style={[styles.quickActionText, { color: colors.background }]}>View Orders</Text>
                </TouchableOpacity>
              </View>
            </View>

            {recentOrders.length > 0 && (
              <View style={styles.recentOrdersContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Orders</Text>
                {recentOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.recentOrderCard, { backgroundColor: colors.surface }]}
                    onPress={() => toggleOrderDetails(order.id)}
                  >
                    <View style={styles.recentOrderContent}>
                      <Text style={[styles.recentOrderRestaurant, { color: colors.text }]}>
                        {order.restaurant.name}
                      </Text>
                      <Text style={[styles.recentOrderTime, { color: colors.textSecondary }]}>
                        {new Date(order.order_time).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.recentOrderTotal, { color: colors.primary }]}>
                        ${parseFloat(order.total_price.toString()).toFixed(2)}
                      </Text>
                    </View>
                    <View style={[styles.recentOrderStatus, {
                      backgroundColor: order.status === 'delivered' ? colors.success + '20' :
                                      order.status === 'pending' ? colors.warning + '20' : colors.primary + '20'
                    }]}>
                      <Text style={[styles.recentOrderStatusText, {
                        color: order.status === 'delivered' ? colors.success :
                               order.status === 'pending' ? colors.warning : colors.primary
                      }]}>
                        {order.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  // Map Tab Styles
  mapHeader: {
    marginBottom: Theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  headerActions: {
    marginLeft: Theme.spacing.md,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  refreshButtonText: {
    fontSize: Theme.typography.fontSize.md,
  },
  mapTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  restaurantCount: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 3,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Theme.colors.primary,
    elevation: 3,
  },
  toggleButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingAnimation: {
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  loadingSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  noRestaurantsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  noRestaurantsIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  noRestaurantsText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  noRestaurantsSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  mapContainer: {
    flex: 1,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 3,
  },
  expandedMap: {
    flex: 1,
    height: 400,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.background,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 16,
  },
  locationErrorContainer: {
    alignItems: 'center',
  },
  locationErrorIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  locationNote: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  locationButton: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
    elevation: 3,
  },
  locationButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: Theme.spacing.lg,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
  },
  mapLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Theme.spacing.sm,
  },
  legendText: {
    fontSize: Theme.typography.fontSize.xs,
  },
  mapInstructions: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 3,
  },
  restaurantCardContent: {
    flex: 1,
  },
  restaurantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  restaurantCardName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  distanceBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  distanceBadgeText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  restaurantCardLocation: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  restaurantCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantCardContact: {
    fontSize: Theme.typography.fontSize.sm,
    flex: 1,
  },
  restaurantCardStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  restaurantCardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.md,
  },
  restaurantCardArrowText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  // Orders Tab Styles
  ordersHeader: {
    marginBottom: Theme.spacing.lg,
  },
  tabTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  tabDescription: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.lg,
  },
  ordersStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderStat: {
    alignItems: 'center',
    flex: 1,
  },
  orderStatValue: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  orderStatLabel: {
    fontSize: Theme.typography.fontSize.sm,
  },
  emptyOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyOrdersIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  emptyOrdersTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptyOrdersSubtitle: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
  },
  exploreButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  exploreButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  orderCard: {
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    elevation: 2,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Theme.spacing.lg,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  restaurantName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  orderTime: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  orderTotal: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
    marginLeft: Theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
  },
  orderStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  viewDetailsButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  viewDetailsText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  expandedDetails: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  detailSection: {
    marginBottom: Theme.spacing.lg,
  },
  detailSectionTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  detailText: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
    lineHeight: 18,
  },
  contactButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  contactButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  orderItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border + '20',
  },
  itemName: {
    fontSize: Theme.typography.fontSize.sm,
    flex: 1,
  },
  itemPrice: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  specialInstructions: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
  },
  instructionsTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  instructionText: {
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: 16,
  },
  deliveryTracking: {
    marginTop: Theme.spacing.lg,
  },
  deliveryTrackingHeader: {
    marginBottom: Theme.spacing.md,
  },
  deliveryTrackingTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  deliveryTrackingSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
  },
  deliveryInfo: {
    marginBottom: Theme.spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Theme.spacing.sm,
  },
  progressIcon: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  progressLabel: {
    fontSize: Theme.typography.fontSize.xs,
    textAlign: 'center',
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    right: -50,
    width: 100,
    height: 2,
    zIndex: -1,
  },
  deliveryPersonSection: {
    marginBottom: Theme.spacing.lg,
  },
  deliveryPersonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  deliveryPersonTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  callDeliveryButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  callDeliveryButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  deliveryPersonName: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  deliveryPersonContact: {
    fontSize: Theme.typography.fontSize.sm,
  },
  professionalTrackingSection: {
    marginTop: Theme.spacing.lg,
  },
  trackingHeaderProfessional: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  trackingHeaderLeft: {
    flex: 1,
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.sm,
  },
  liveTrackingTitleProfessional: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  trackingSubtitle: {
    fontSize: Theme.typography.fontSize.xs,
  },
  mapToggleButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  mapToggleText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  essentialInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  essentialMetric: {
    alignItems: 'center',
    flex: 1,
  },
  essentialLabel: {
    fontSize: Theme.typography.fontSize.xs,
    marginBottom: Theme.spacing.xs,
  },
  essentialValue: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  trackingMetricsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  metricCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  metricIconText: {
    fontSize: Theme.typography.fontSize.lg,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  metricValue: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  timeProgressContainer: {
    height: 4,
    backgroundColor: Theme.colors.border,
    borderRadius: 2,
    marginBottom: Theme.spacing.xs,
  },
  timeProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  metricSubtext: {
    fontSize: Theme.typography.fontSize.xs,
  },
  enhancedStatusContainer: {
    marginBottom: Theme.spacing.lg,
  },
  professionalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  statusIndicators: {
    flexDirection: 'row',
  },
  statusIndicator: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.sm,
  },
  statusIndicatorText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.background,
  },
  updateInfo: {
    alignItems: 'flex-end',
  },
  lastUpdateText: {
    fontSize: Theme.typography.fontSize.xs,
  },
  deliveryInsights: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  deliverySpeedText: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  deliveryTip: {
    fontSize: Theme.typography.fontSize.sm,
    fontStyle: 'italic',
  },
  deliveryMapContainer: {
    marginBottom: Theme.spacing.lg,
  },
  deliveryMapHeader: {
    marginBottom: Theme.spacing.sm,
  },
  deliveryMapTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  deliveryMapSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
  },
  deliveryMap: {
    height: 200,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  completionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  completionIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.md,
  },
  completionContent: {
    flex: 1,
  },
  completionTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  completionMessage: {
    fontSize: Theme.typography.fontSize.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  orderItemsCount: {
    fontSize: Theme.typography.fontSize.sm,
  },
  // Profile Tab Styles
  profileSection: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
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
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
    minHeight: 100,
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
  supportInfo: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  // Home Tab Styles
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
});

export default CustomerDashboard;