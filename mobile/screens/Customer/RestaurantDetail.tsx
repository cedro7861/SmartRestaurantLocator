import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Theme } from '../../lib/colors';
import { getRestaurantById, Restaurant, MenuItem } from '../../lib/api/restaurantApi';
import { createOrder } from '../../lib/api/orderApi';

interface RestaurantDetailProps {
  navigation: any;
  route: any;
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ navigation, route }) => {
  const { restaurant: initialRestaurant } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number; preferences: string }>>([]);
  const [showCart, setShowCart] = useState(false);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurantDetails();
  }, []);

  const loadRestaurantDetails = async () => {
    try {
      const data = await getRestaurantById(initialRestaurant.id);
      setRestaurant(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderItem = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.item.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { item, quantity: 1, preferences: '' }]);
    }
    Alert.alert('Added to Cart', `${item.name} added to your cart`);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !restaurant) return;

    try {
      await createOrder({
        restaurant_id: restaurant.id,
        items: cart.map(cartItem => ({
          item_id: cartItem.item.id,
          quantity: cartItem.quantity,
          preferences: cartItem.preferences,
        })),
      });
      Alert.alert('Success', 'Order placed successfully!');
      setCart([]);
      setShowCart(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading restaurant details...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{restaurant.name}</Text>
      <Text style={[styles.location, { color: colors.textSecondary }]}>{restaurant.location}</Text>
      <Text style={[styles.contact, { color: colors.textSecondary }]}>{restaurant.contact_info}</Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu</Text>
      {restaurant.menu_items && restaurant.menu_items.length > 0 ? (
        restaurant.menu_items.map((item) => (
          <View key={item.id} style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>{item.description}</Text>
              <Text style={[styles.menuItemPrice, { color: colors.primary }]}>${item.price}</Text>
            </View>
            <TouchableOpacity
              style={[styles.orderButton, { backgroundColor: colors.primary }]}
              onPress={() => handleOrderItem(item)}
            >
              <Text style={[styles.orderButtonText, { color: colors.background }]}>Order</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={[styles.noMenuText, { color: colors.textSecondary }]}>No menu items available</Text>
      )}

      {cart.length > 0 && (
        <View style={[styles.cartSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cartTitle, { color: colors.text }]}>Your Cart ({cart.length} items)</Text>
          <Text style={[styles.cartTotal, { color: colors.primary }]}>Total: ${getTotalPrice().toFixed(2)}</Text>
          <TouchableOpacity
            style={[styles.viewCartButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowCart(!showCart)}
          >
            <Text style={[styles.viewCartText, { color: colors.text }]}>{showCart ? 'Hide Cart' : 'View Cart'}</Text>
          </TouchableOpacity>

          {showCart && (
            <View style={styles.cartItems}>
              {cart.map((cartItem, index) => (
                <View key={index} style={styles.cartItem}>
                  <Text style={[styles.cartItemName, { color: colors.text }]}>
                    {cartItem.item.name} x{cartItem.quantity}
                  </Text>
                  <Text style={[styles.cartItemPrice, { color: colors.primary }]}>
                    ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.placeOrderButton, { backgroundColor: colors.success }]}
                onPress={handlePlaceOrder}
              >
                <Text style={[styles.placeOrderText, { color: colors.background }]}>Place Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.background }]}>Back to Map</Text>
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
    marginBottom: Theme.spacing.sm,
  },
  location: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  contact: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  menuItemDescription: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  menuItemPrice: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  orderButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  orderButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  noMenuText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.md,
  },
  backButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  cartSection: {
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    elevation: 3,
  },
  cartTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
  },
  cartTotal: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  viewCartButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  viewCartText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  cartItems: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  cartItemName: {
    fontSize: Theme.typography.fontSize.md,
    flex: 1,
  },
  cartItemPrice: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  placeOrderButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  placeOrderText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  backButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default RestaurantDetail;