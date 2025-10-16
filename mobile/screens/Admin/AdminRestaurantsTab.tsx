import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, RefreshControl, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../lib/colors';
import { getAllRestaurants, approveRestaurant, rejectRestaurant, deleteRestaurant, Restaurant } from '../../lib/api/restaurantApi';

interface AdminRestaurantsTabProps {
  navigation: any;
}

const AdminRestaurantsTab: React.FC<AdminRestaurantsTabProps> = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'open' | 'closed'>('all');
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchQuery, filterStatus]);

  const loadRestaurants = async () => {
    try {
      const restaurantData = await getAllRestaurants();
      setRestaurants(restaurantData);
    } catch (error) {
      console.error('Failed to load restaurants');
      Alert.alert('Error', 'Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRestaurants();
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.owner?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterStatus) {
      case 'approved':
        filtered = filtered.filter(r => r.approved);
        break;
      case 'pending':
        filtered = filtered.filter(r => !r.approved);
        break;
      case 'open':
        filtered = filtered.filter(r => r.status === 'open');
        break;
      case 'closed':
        filtered = filtered.filter(r => r.status === 'closed');
        break;
      default:
        break;
    }

    setFilteredRestaurants(filtered);
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

  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    Alert.alert(
      'Delete Restaurant',
      `Are you sure you want to permanently delete "${restaurant.name}"?\n\nThis action cannot be undone and will remove all associated data including orders and menu items.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurant(restaurant.id);
              Alert.alert('Success', `${restaurant.name} has been permanently deleted`);
              loadRestaurants();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete restaurant');
            }
          },
        },
      ]
    );
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View style={[styles.restaurantCard, { backgroundColor: colors.surface }]}>
      <View style={styles.restaurantHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={[styles.restaurantName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.restaurantLocation, { color: colors.textSecondary }]}>
            📍 {item.location}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.approvalBadge, {
            backgroundColor: item.approved ? colors.success + '20' : colors.warning + '20'
          }]}>
            <Text style={[styles.approvalStatus, {
              color: item.approved ? colors.success : colors.warning
            }]}>
              {item.approved ? '✓ Approved' : '⏳ Pending'}
            </Text>
          </View>
          <View style={[styles.statusBadge, {
            backgroundColor: item.status === 'open' ? colors.success + '20' : colors.error + '20'
          }]}>
            <Text style={[styles.restaurantStatus, {
              color: item.status === 'open' ? colors.success : colors.error
            }]}>
              {item.status === 'open' ? '🟢 Open' : '🔴 Closed'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.restaurantDetails}>
        <Text style={[styles.ownerInfo, { color: colors.textSecondary }]}>
          👤 Owner: {item.owner?.name}
        </Text>
        <Text style={[styles.ownerEmail, { color: colors.textSecondary }]}>
          ✉️ {item.owner?.email}
        </Text>
        <Text style={[styles.orderCount, { color: colors.primary }]}>
          📊 Orders: {item._count?.orders || 0}
        </Text>
        {item.contact_info && (
          <Text style={[styles.contactInfo, { color: colors.textSecondary }]}>
            📞 {item.contact_info}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        {!item.approved ? (
          <>
            <TouchableOpacity
              style={[styles.approveButton, { backgroundColor: colors.success }]}
              onPress={() => handleApproveRestaurant(item)}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.background} />
              <Text style={[styles.buttonText, { color: colors.background }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, { backgroundColor: colors.error }]}
              onPress={() => handleRejectRestaurant(item)}
            >
              <Ionicons name="close-circle" size={18} color={colors.background} />
              <Text style={[styles.buttonText, { color: colors.background }]}>Reject</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Edit', 'Edit functionality coming soon')}
            >
              <MaterialIcons name="edit" size={18} color={colors.background} />
              <Text style={[styles.buttonText, { color: colors.background }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={() => handleDeleteRestaurant(item)}
            >
              <MaterialIcons name="delete-forever" size={18} color={colors.background} />
              <Text style={[styles.buttonText, { color: colors.background }]}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🏪 Restaurant Management</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage restaurant approvals, view statistics, and maintain platform quality
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search restaurants, owners, locations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { key: 'all', label: 'All', icon: 'restaurant' },
            { key: 'approved', label: 'Approved', icon: 'checkmark-circle' },
            { key: 'pending', label: 'Pending', icon: 'time' },
            { key: 'open', label: 'Open', icon: 'storefront' },
            { key: 'closed', label: 'Closed', icon: 'storefront-outline' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                filterStatus === filter.key && styles.filterButtonActive,
                { backgroundColor: filterStatus === filter.key ? colors.primary : colors.surface }
              ]}
              onPress={() => setFilterStatus(filter.key as any)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={filterStatus === filter.key ? colors.background : colors.textSecondary}
              />
              <Text style={[
                styles.filterButtonText,
                { color: filterStatus === filter.key ? colors.background : colors.textSecondary }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.restaurantStats}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{filteredRestaurants.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Filtered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {filteredRestaurants.filter(r => r.approved).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {filteredRestaurants.filter(r => !r.approved).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.info }]}>
            {filteredRestaurants.filter(r => r.status === 'open').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Open</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingAnimation}>
            <Text style={styles.loadingIcon}>🏪</Text>
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading restaurants...
            </Text>
            <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
              Fetching restaurant data from database
            </Text>
          </View>
        </View>
      ) : filteredRestaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            {searchQuery || filterStatus !== 'all' ? '🔍' : '🏪'}
          </Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {searchQuery || filterStatus !== 'all' ? 'No restaurants found' : 'No restaurants available'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Restaurants will appear here once they register'
            }
          </Text>
          {(searchQuery || filterStatus !== 'all') && (
            <TouchableOpacity
              style={[styles.clearFiltersButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
            >
              <Text style={[styles.clearFiltersText, { color: colors.background }]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
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
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: 18,
  },
  searchContainer: {
    marginBottom: Theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.typography.fontSize.md,
    paddingVertical: Theme.spacing.xs,
  },
  filterContainer: {
    marginBottom: Theme.spacing.lg,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterButtonActive: {
    borderColor: Theme.colors.primary,
  },
  filterButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
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
    minWidth: 70,
    elevation: 2,
  },
  statNumber: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.typography.fontSize.xs,
    marginTop: Theme.spacing.xs,
    textTransform: 'uppercase',
    fontWeight: Theme.typography.fontWeight.medium,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    lineHeight: 18,
  },
  clearFiltersButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    elevation: 3,
  },
  clearFiltersText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  restaurantCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  restaurantName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  restaurantLocation: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  approvalBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  approvalStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  restaurantStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  restaurantDetails: {
    marginBottom: Theme.spacing.lg,
  },
  ownerInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  ownerEmail: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  orderCount: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  contactInfo: {
    fontSize: Theme.typography.fontSize.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    justifyContent: 'center',
    elevation: 2,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    justifyContent: 'center',
    elevation: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    justifyContent: 'center',
    elevation: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
  },
});

export default AdminRestaurantsTab;