import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getRestaurants, Restaurant } from '../../lib/api/restaurantApi';
import { getCustomerOrders, Order } from '../../lib/api/orderApi';
import { updateProfile, changePassword } from '../../lib/api/userApi';

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

        return (
          <View style={[styles.tabContent, mapView && styles.mapTabContent]}>
            <View style={styles.mapHeader}>
              <Text style={[styles.mapTitle, { color: colors.text }]}>
                Nearby Restaurants
              </Text>
              <Text style={[styles.restaurantCount, { color: colors.textSecondary }]}>
                {validRestaurants.length} restaurant{validRestaurants.length !== 1 ? 's' : ''} found
              </Text>

              {validRestaurants.length > 0 && (
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

            {validRestaurants.length === 0 && !loading ? (
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
                    {validRestaurants.map((restaurant) => (
                      <Marker
                        key={restaurant.id}
                        coordinate={{
                          latitude: parseFloat(restaurant.latitude || '0'),
                          longitude: parseFloat(restaurant.longitude || '0'),
                        }}
                        title={restaurant.name}
                        description={`${restaurant.location} • Tap to view menu & order`}
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
                    {validRestaurants.length > 0 && (
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
                {validRestaurants.map((restaurant) => (
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