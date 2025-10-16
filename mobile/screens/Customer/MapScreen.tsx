import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Theme } from '../../lib/colors';
import { getRestaurants, Restaurant } from '../../lib/api/restaurantApi';

type RestaurantWithDistance = Restaurant & { distance: number | null };

interface MapScreenProps {
  navigation: any;
  user: any;
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation, user }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(true);

  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
    getCurrentLocation();
  }, []);

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

  const restaurantsWithDistance = getRestaurantsWithDistance();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
              {restaurantsWithDistance.map((restaurant) => (
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
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Very Close (≤2km)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Nearby (≤5km)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Further Away</Text>
              </View>
            </View>
            <Text style={[styles.mapInstructions, { color: colors.textSecondary }]}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  mapHeader: {
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
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
  mapLegend: {
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
    color: Theme.colors.background,
  },
  mapInstructions: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    color: Theme.colors.background,
  },
  listContainer: {
    flex: 1,
    padding: Theme.spacing.lg,
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
});

export default MapScreen;