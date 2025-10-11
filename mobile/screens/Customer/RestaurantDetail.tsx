import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number; preferences: string; orderType: 'pickup' | 'delivery' | 'dine_in'; tableType?: string; persons?: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dine_in'>('delivery');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalOrderType, setModalOrderType] = useState<'pickup' | 'delivery' | 'dine_in'>('delivery');
  const [modalTableType, setModalTableType] = useState<'indoor' | 'outdoor'>('indoor');
  const [modalPersons, setModalPersons] = useState(1);
  const [modalPreferences, setModalPreferences] = useState('');
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
    setSelectedItem(item);
    setModalQuantity(1);
    setModalOrderType('delivery');
    setModalTableType('indoor');
    setModalPersons(1);
    setModalPreferences('');
    setShowOrderModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    let preferences = modalPreferences;
    if (modalOrderType === 'dine_in') {
      preferences = `Table: ${modalTableType}, Persons: ${modalPersons}${preferences ? `\n${preferences}` : ''}`;
    }

    const cartItem = {
      item: selectedItem,
      quantity: modalQuantity,
      preferences,
      orderType: modalOrderType,
      tableType: modalOrderType === 'dine_in' ? modalTableType : undefined,
      persons: modalOrderType === 'dine_in' ? modalPersons : undefined,
    };

    setCart([...cart, cartItem]);
    setShowOrderModal(false);
    Alert.alert('Added to Cart', `${selectedItem.name} added to your cart`);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !restaurant) return;

    // Use the orderType from the first cart item (assuming all same)
    const orderType = cart[0].orderType;

    try {
      await createOrder({
        restaurant_id: restaurant.id,
        items: cart.map(cartItem => ({
          item_id: cartItem.item.id,
          quantity: cartItem.quantity,
          preferences: cartItem.preferences + (cartItem.tableType ? `\nTable Type: ${cartItem.tableType}` : ''),
        })),
        order_type: orderType,
      });
      Alert.alert('Success', `Order placed successfully for ${orderType.replace('_', ' ')}!`);
      setCart([]);
      setShowCart(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + (parseFloat(cartItem.item.price.toString()) * cartItem.quantity), 0);
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
              <Text style={[styles.menuItemPrice, { color: colors.primary }]}>${parseFloat(item.price.toString()).toFixed(2)}</Text>
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
                  <View style={styles.cartItemDetails}>
                    <Text style={[styles.cartItemName, { color: colors.text }]}>
                      {cartItem.item.name} x{cartItem.quantity}
                    </Text>
                    <Text style={[styles.cartItemType, { color: colors.textSecondary }]}>
                      {cartItem.orderType.replace('_', ' ')}
                      {cartItem.tableType ? ` • ${cartItem.tableType}` : ''}
                      {cartItem.persons ? ` • ${cartItem.persons} person${cartItem.persons !== 1 ? 's' : ''}` : ''}
                    </Text>
                    {cartItem.preferences ? (
                      <Text style={[styles.cartItemPreferences, { color: colors.textSecondary }]}>
                        Note: {cartItem.preferences}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.cartItemPrice, { color: colors.primary }]}>
                    ${(parseFloat(cartItem.item.price.toString()) * cartItem.quantity).toFixed(2)}
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

      {/* Order Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Order {selectedItem?.name}
              </Text>

              {/* Quantity */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Quantity</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                    onPress={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  >
                    <Text style={[styles.quantityButtonText, { color: colors.background }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: colors.text }]}>{modalQuantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                    onPress={() => setModalQuantity(modalQuantity + 1)}
                  >
                    <Text style={[styles.quantityButtonText, { color: colors.background }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Order Type */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Order Type</Text>
                <View style={styles.orderTypeOptions}>
                  {(['delivery', 'pickup', 'dine_in'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.modalOrderTypeOption, modalOrderType === type && styles.modalOrderTypeSelected]}
                      onPress={() => setModalOrderType(type)}
                    >
                      <Text style={[styles.modalOrderTypeIcon, { color: modalOrderType === type ? colors.background : colors.primary }]}>
                        {type === 'delivery' ? '🚚' : type === 'pickup' ? '🥡' : '🍽️'}
                      </Text>
                      <Text style={[styles.modalOrderTypeText, { color: modalOrderType === type ? colors.background : colors.text }]}>
                        {type.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Table Preferences for Dine-in */}
              {modalOrderType === 'dine_in' && (
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Table Preferences</Text>

                  {/* Table Type */}
                  <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerLabel, { color: colors.text }]}>Table Location</Text>
                    <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
                      <Picker
                        selectedValue={modalTableType}
                        onValueChange={(itemValue) => setModalTableType(itemValue)}
                        style={[styles.picker, { color: colors.text }]}
                        dropdownIconColor={colors.primary}
                      >
                        <Picker.Item label="Indoor" value="indoor" />
                        <Picker.Item label="Outdoor" value="outdoor" />
                      </Picker>
                    </View>
                  </View>

                  {/* Number of Persons */}
                  <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerLabel, { color: colors.text }]}>Number of Persons</Text>
                    <View style={styles.personsSelector}>
                      <TouchableOpacity
                        style={[styles.personButton, { backgroundColor: colors.primary }]}
                        onPress={() => setModalPersons(Math.max(1, modalPersons - 1))}
                      >
                        <Text style={[styles.personButtonText, { color: colors.background }]}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.personText, { color: colors.text }]}>{modalPersons}</Text>
                      <TouchableOpacity
                        style={[styles.personButton, { backgroundColor: colors.primary }]}
                        onPress={() => setModalPersons(Math.min(20, modalPersons + 1))}
                      >
                        <Text style={[styles.personButtonText, { color: colors.background }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Special Instructions */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Special Instructions</Text>
                <TextInput
                  style={[styles.modalTextInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Any special requests or preferences..."
                  placeholderTextColor={colors.textSecondary}
                  value={modalPreferences}
                  onChangeText={setModalPreferences}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Buttons - Fixed at bottom */}
            <View style={[styles.modalButtons, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setShowOrderModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalAddButton, { backgroundColor: colors.primary }]}
                onPress={handleAddToCart}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  cartItemType: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  cartItemPreferences: {
    fontSize: Theme.typography.fontSize.sm,
    fontStyle: 'italic',
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
  orderTypeSection: {
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  orderTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
  },
  orderTypeOption: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.xs,
    backgroundColor: Theme.colors.background,
  },
  orderTypeOptionSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  orderTypeIcon: {
    fontSize: Theme.typography.fontSize.xl,
    marginBottom: Theme.spacing.xs,
  },
  orderTypeText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: Theme.borderRadius.lg,
    elevation: 5,
  },
  modalScrollContent: {
    padding: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: Theme.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  quantityText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginHorizontal: Theme.spacing.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  modalOrderTypeOption: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.xs,
    backgroundColor: Theme.colors.background,
  },
  modalOrderTypeSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  modalOrderTypeIcon: {
    fontSize: Theme.typography.fontSize.xl,
    marginBottom: Theme.spacing.xs,
  },
  modalOrderTypeText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  tableTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableTypeOption: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
    backgroundColor: Theme.colors.background,
  },
  tableTypeSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  tableTypeText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  modalTextInput: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    marginTop: Theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.sm,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  modalAddButton: {
    // backgroundColor set in component
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  pickerContainer: {
    marginBottom: Theme.spacing.lg,
  },
  pickerLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
  },
  picker: {
    height: 50,
  },
  personsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.sm,
  },
  personButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  personText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginHorizontal: Theme.spacing.lg,
    minWidth: 30,
    textAlign: 'center',
  },
});

export default RestaurantDetail;