import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { Theme } from '../../lib/colors';
import { getOwnerMenuItems, MenuItem } from '../../lib/api/menuApi';

interface OwnerDashboardProps {
  navigation: any;
  user: any;
  onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ navigation, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    if (activeTab === 'menu') {
      loadMenuItems();
    }
  }, [activeTab]);

  // Refresh menu items when returning to menu tab
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (activeTab === 'menu') {
        loadMenuItems();
      }
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const loadMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const data = await getOwnerMenuItems(2); // Hardcoded for now
      setMenuItems(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoadingMenu(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'restaurants':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Manage Restaurants</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Add, edit, and manage your restaurants here.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddRestaurant')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Add Restaurant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('ViewRestaurants')}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>View Restaurants</Text>
            </TouchableOpacity>
          </View>
        );
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Manage Orders</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              View and manage customer orders for your restaurants.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('ManageOrders')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>View All Orders</Text>
            </TouchableOpacity>
          </View>
        );
      case 'menu':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Manage Menu</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Add, edit, and manage menu items for your restaurants.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddMenuItem')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Add Menu Item</Text>
            </TouchableOpacity>

            {loadingMenu ? (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading menu items...</Text>
            ) : menuItems.length === 0 ? (
              <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                No menu items yet. Add your first menu item!
              </Text>
            ) : (
              <FlatList
                data={menuItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={[styles.menuItemCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.menuItemHeader}>
                      <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.menuItemPrice, { color: colors.primary }]}>${item.price}</Text>
                    </View>
                    <Text style={[styles.menuItemRestaurant, { color: colors.textSecondary }]}>
                      {item.restaurant?.name}
                    </Text>
                    {item.category && (
                      <Text style={[styles.menuItemCategory, { color: colors.textSecondary }]}>
                        {item.category}
                      </Text>
                    )}
                    {item.description && (
                      <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.menuItemActions}>
                      <TouchableOpacity
                        style={[styles.menuActionButton, { backgroundColor: colors.primary }]}
                        onPress={() => Alert.alert('Info', 'Edit functionality coming soon!')}
                      >
                        <Text style={[styles.menuActionText, { color: colors.background }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.menuActionButton, { backgroundColor: colors.error }]}
                        onPress={() => Alert.alert('Info', 'Delete functionality coming soon!')}
                      >
                        <Text style={[styles.menuActionText, { color: colors.background }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        );
      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              Manage your account settings and preferences.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Info', 'Profile settings coming soon!')}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Profile Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => Alert.alert('Info', 'Notification settings coming soon!')}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Notification Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.warning }]}
              onPress={() => Alert.alert('Info', 'Business analytics coming soon!')}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Business Analytics</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Owner Dashboard</Text>
      <Text style={[styles.welcome, { color: colors.text }]}>Welcome, {user?.name || 'User'}!</Text>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'restaurants' ? colors.primary : colors.textSecondary }]}>
            Restaurants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'orders' ? colors.primary : colors.textSecondary }]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'menu' ? colors.primary : colors.textSecondary }]}>
            Menu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'settings' ? colors.primary : colors.textSecondary }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={onLogout}>
        <Text style={[styles.logoutText, { color: colors.background }]}>Logout</Text>
      </TouchableOpacity>
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
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  welcome: {
    fontSize: Theme.typography.fontSize.lg,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: Theme.spacing.lg,
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
  logoutButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  logoutText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
  noItemsText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  menuItemCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  menuItemName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  menuItemRestaurant: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  menuItemCategory: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  menuItemDescription: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuActionButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  menuActionText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default OwnerDashboard;