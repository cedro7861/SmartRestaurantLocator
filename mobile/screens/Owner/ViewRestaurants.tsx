import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { getOwnerRestaurants, deleteRestaurant, updateRestaurant, Restaurant } from '../../lib/api/restaurantApi';
import { useAuth } from '../../lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface ViewRestaurantsProps {
  navigation: any;
}

const ViewRestaurants: React.FC<ViewRestaurantsProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const data = await getOwnerRestaurants(user.id);
      setRestaurants(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    navigation.navigate('EditRestaurant', { restaurant });
  };

  const handleToggleStatus = async (restaurant: Restaurant) => {
    const newStatus = restaurant.status === 'open' ? 'closed' : 'open';
    try {
      await updateRestaurant(restaurant.id, { status: newStatus });
      Alert.alert('Success', `Restaurant is now ${newStatus}`);
      loadRestaurants(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update restaurant status');
    }
  };

  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    if (restaurant.approved) {
      Alert.alert(
        'Cannot Delete',
        'This restaurant is approved. Please contact admin to remove it.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Restaurant',
      `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurant(restaurant.id);
              Alert.alert('Success', 'Restaurant deleted successfully');
              loadRestaurants(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete restaurant');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Your Restaurants</Text>

      {restaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No restaurants found. Add your first restaurant!
          </Text>
        </View>
      ) : (
        restaurants.map((restaurant) => (
          <View key={restaurant.id} style={styles.restaurantCard}>
            <Image
              source={restaurant.image ? { uri: restaurant.image } : require('../../assets/icon.png')}
              style={styles.restaurantImage}
              resizeMode="cover"
              onError={(error) => {
                console.warn('Image load error for restaurant:', restaurant.id, error.nativeEvent.error);
              }}
            />
            <View style={styles.restaurantContent}>
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantHeader}>
                  <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
                  <View style={styles.statusBadges}>
                    <Text style={[styles.approvalStatus, {
                      color: restaurant.approved ? colors.success : colors.warning,
                      backgroundColor: restaurant.approved ? colors.success + '20' : colors.warning + '20'
                    }]}>
                      {restaurant.approved ? 'Approved' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.restaurantLocation, { color: colors.textSecondary }]}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} /> {restaurant.location || 'Location not specified'}
                </Text>
                <Text style={[styles.restaurantContact, { color: colors.textSecondary }]}>
                  <Ionicons name="call" size={16} color={colors.textSecondary} /> {restaurant.contact_info || 'No contact info'}
                </Text>
                {restaurant.latitude && restaurant.longitude && (
                  <Text style={[styles.restaurantCoordinates, { color: colors.textSecondary }]}>
                    <Ionicons name="navigate" size={16} color={colors.textSecondary} /> {parseFloat(restaurant.latitude).toFixed(4)}, {parseFloat(restaurant.longitude).toFixed(4)}
                  </Text>
                )}
                <View style={styles.restaurantStats}>
                  <Text style={[styles.statText, { color: colors.primary }]}>
                    <Ionicons name="stats-chart" size={16} color={colors.primary} /> Orders: {restaurant._count?.orders || 0}
                  </Text>
                  <Text style={[styles.restaurantStatus, {
                    color: restaurant.status === 'open' ? colors.success : colors.error
                  }]}>
                    {restaurant.status === 'open' ? '🟢 Open' : '🔴 Closed'}
                  </Text>
                </View>
                </View>
              </View>
              <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => handleEditRestaurant(restaurant)}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, {
                  backgroundColor: restaurant.status === 'open' ? colors.success : colors.warning
                }]}
                onPress={() => handleToggleStatus(restaurant)}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>
                  {restaurant.status === 'open' ? 'Close' : 'Open'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => handleDeleteRestaurant(restaurant)}
              >
                <Text style={[styles.actionButtonText, { color: colors.background }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.background }]}>Back to Dashboard</Text>
      </TouchableOpacity>
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
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
  },
  restaurantCard: {
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
  },
  restaurantContent: {
    padding: Theme.spacing.lg,
  },
  restaurantInfo: {
    marginBottom: Theme.spacing.md,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  restaurantName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  statusBadges: {
    alignItems: 'flex-end',
  },
  approvalStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    textTransform: 'uppercase',
  },
  restaurantLocation: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantContact: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantCoordinates: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  statusButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  backButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  backButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
});

export default ViewRestaurants;