import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../lib/colors';
import { getAllRestaurants, approveRestaurant, rejectRestaurant, Restaurant } from '../../lib/api/restaurantApi';

interface AdminRestaurantsTabProps {
  navigation: any;
}

const AdminRestaurantsTab: React.FC<AdminRestaurantsTabProps> = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const restaurantData = await getAllRestaurants();
      setRestaurants(restaurantData);
    } catch (error) {
      console.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRestaurant = async (restaurant: Restaurant) => {
    try {
      await approveRestaurant(restaurant.id);
      Alert.alert('Success', `${restaurant.name} has been approved`);
      loadRestaurants();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve restaurant');
    }
  };

  const handleRejectRestaurant = async (restaurant: Restaurant) => {
    Alert.alert(
      'Reject Restaurant',
      `Are you sure you want to reject ${restaurant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectRestaurant(restaurant.id);
              Alert.alert('Success', `${restaurant.name} has been rejected`);
              loadRestaurants();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject restaurant');
            }
          },
        },
      ]
    );
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={[styles.restaurantCard, { backgroundColor: colors.surface }]}>
      <View style={styles.restaurantHeader}>
        <Text style={[styles.restaurantName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.approvalStatus, {
            color: item.approved ? colors.success : colors.warning,
            backgroundColor: item.approved ? colors.success + '20' : colors.warning + '20'
          }]}>
            {item.approved ? 'Approved' : 'Pending'}
          </Text>
          <Text style={[styles.restaurantStatus, {
            color: item.status === 'open' ? colors.success : colors.error
          }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={[styles.restaurantLocation, { color: colors.textSecondary }]}>{item.location}</Text>
      <Text style={[styles.ownerInfo, { color: colors.textSecondary }]}>
        Owner: {item.owner?.name} ({item.owner?.email})
      </Text>
      <Text style={[styles.orderCount, { color: colors.primary }]}>
        Orders: {item._count?.orders || 0}
      </Text>

      {!item.approved && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.approveButton, { backgroundColor: colors.success }]}
            onPress={() => handleApproveRestaurant(item)}
          >
            <Ionicons name="checkmark" size={16} color={colors.background} />
            <Text style={[styles.buttonText, { color: colors.background }]}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: colors.error }]}
            onPress={() => handleRejectRestaurant(item)}
          >
            <Ionicons name="close" size={16} color={colors.background} />
            <Text style={[styles.buttonText, { color: colors.background }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Restaurant Management</Text>

      <View style={styles.restaurantStats}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{restaurants.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {restaurants.filter(r => r.approved).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {restaurants.filter(r => !r.approved).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
        </View>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  restaurantStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 80,
  },
  statNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  restaurantCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  restaurantName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  approvalStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
  },
  restaurantStatus: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  restaurantLocation: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  ownerInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  orderCount: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    flex: 1,
    marginRight: Theme.spacing.xs,
    justifyContent: 'center',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    flex: 1,
    marginLeft: Theme.spacing.xs,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default AdminRestaurantsTab;