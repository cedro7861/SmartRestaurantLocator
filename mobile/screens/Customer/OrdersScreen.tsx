import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getCustomerOrders, Order } from '../../lib/api/orderApi';

interface OrdersScreenProps {
  navigation: any;
  user: any;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation, user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [showLiveTracking, setShowLiveTracking] = useState<{[key: number]: boolean}>({});
  const [countdownTimers, setCountdownTimers] = useState<{[key: number]: number}>({});
  const [expandedOrders, setExpandedOrders] = useState<{[key: number]: boolean}>({});

  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getCustomerOrders();
      setOrders(data || []);
      setError(null);
    } catch (error: any) {
      console.log('Failed to load orders:', error.message);
      setError(error.message || 'Failed to load orders');
      setOrders([]);

      // Show user-friendly error message
      const errorMessage = error.message?.includes('Network') ?
        'Network connection issue. Please check your internet and try again.' :
        'Unable to load your orders. Please try again in a moment.';

      Alert.alert(
        'Connection Issue',
        errorMessage,
        [
          { text: 'Retry', onPress: loadOrders },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
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
            text: 'Phone Call',
            onPress: async () => {
              const telUrl = `tel:${cleanPhoneNumber}`;
              try {
                await Linking.openURL(telUrl);
              } catch (error) {
                Alert.alert('Error', 'Unable to make phone call. Please check if your device supports phone calls.');
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
        'Restaurant contact information is not available at this time.',
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
            text: 'Phone Call',
            onPress: async () => {
              const telUrl = `tel:${cleanPhoneNumber}`;
              try {
                await Linking.openURL(telUrl);
              } catch (error) {
                Alert.alert('Error', 'Unable to make phone call. Please check if your device supports phone calls.');
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

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.errorTitle, { color: colors.text }]}>Connection Issue</Text>
            <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadOrders}
            >
              <Text style={[styles.retryButtonText, { color: colors.background }]}>🔄 Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
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
          <View>
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
                      💰 RWF {parseFloat(order.total_price.toString()).toFixed(2)}
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
                            RWF {(parseFloat(item.item.price.toString()) * item.quantity).toFixed(2)}
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
                    Total: RWF {parseFloat(order.total_price.toString()).toFixed(2)}
                  </Text>
                  <Text style={[styles.orderItemsCount, { color: colors.textSecondary }]}>
                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            ))}
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
  // Error handling styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  errorTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
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
});

export default OrdersScreen;