import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Theme } from '../../lib/colors';
import { getOwnerOrders, updateOrderStatus, Order } from '../../lib/api/orderApi';
import { getAvailableDeliveryPersons, assignDelivery, DeliveryPerson } from '../../lib/api/deliveryApi';

interface OrdersTabProps {
  navigation: any;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<number | null>(null);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      console.log('Loading orders for owner...');
      const data = await getOwnerOrders();
      console.log('Orders received:', data);
      console.log('Orders array length:', data?.length || 0);
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load orders. Please check your connection and try again.';
      Alert.alert('Error', errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders(); // Refresh orders
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const loadDeliveryPersons = async () => {
    try {
      const data = await getAvailableDeliveryPersons();
      setDeliveryPersons(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load delivery persons');
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrder || !selectedDeliveryPerson) return;

    try {
      await assignDelivery({
        order_id: selectedOrder.id,
        delivery_person_id: selectedDeliveryPerson,
      });
      Alert.alert('Success', 'Delivery person assigned successfully');
      setShowDeliveryModal(false);
      setSelectedOrder(null);
      setSelectedDeliveryPerson(null);
      loadOrders(); // Refresh orders
    } catch (error) {
      Alert.alert('Error', 'Failed to assign delivery person');
    }
  };

  const openDeliveryModal = async (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryPerson(null);
    await loadDeliveryPersons();
    setShowDeliveryModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Manage Orders</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No orders found for your restaurants.
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 12, marginTop: 8 }]}>
            If you expect to see orders, please check your restaurant setup or contact support.
          </Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
            <View style={styles.orderHeader}>
              <Text style={[styles.customerName, { color: colors.text }]}>
                {order.customer?.name || 'Unknown Customer'}
              </Text>
              <Text style={[styles.orderStatus, {
                color: order.status === 'delivered' ? colors.success :
                       order.status === 'pending' ? colors.warning : colors.primary
              }]}>
                {order.status}
              </Text>
            </View>
            <Text style={[styles.restaurantName, { color: colors.textSecondary }]}>
              {order.restaurant.name}
            </Text>
            <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
              {new Date(order.order_time).toLocaleString()}
            </Text>
            <View style={styles.orderDetails}>
              <Text style={[styles.orderType, { color: colors.primary }]}>
                📋 {order.order_type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={[styles.orderTotal, { color: colors.primary }]}>
                Total: RWF {parseFloat(order.total_price.toString()).toFixed(2)}
              </Text>
            </View>
            <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
              {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
            </Text>

            {order.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={() => handleUpdateStatus(order.id, 'confirmed')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  onPress={() => handleUpdateStatus(order.id, 'rejected')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'confirmed' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleUpdateStatus(order.id, 'preparing')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Start Preparing</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'preparing' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleUpdateStatus(order.id, 'ready')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Mark Ready</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'ready' && order.order_type === 'delivery' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => openDeliveryModal(order)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Assign Delivery Person</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'ready' && order.order_type === 'pickup' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={() => handleUpdateStatus(order.id, 'delivered')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Ready for Pickup</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'ready' && order.order_type === 'dine_in' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={() => handleUpdateStatus(order.id, 'delivered')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Table Ready</Text>
                </TouchableOpacity>
              </View>
            )}

            {order.status === 'delivering' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={() => handleUpdateStatus(order.id, 'delivered')}
                >
                  <Text style={[styles.actionButtonText, { color: colors.background }]}>Mark Delivered</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}

      {/* Delivery Assignment Modal */}
      <Modal
        visible={showDeliveryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeliveryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Assign Delivery Person
            </Text>

            {selectedOrder && (
              <View style={styles.modalOrderInfo}>
                <Text style={[styles.modalOrderText, { color: colors.text }]}>
                  Order #{selectedOrder.id} - {selectedOrder.customer?.name}
                </Text>
                <Text style={[styles.modalOrderText, { color: colors.textSecondary }]}>
                  {selectedOrder.restaurant.name} • RWF {parseFloat(selectedOrder.total_price.toString()).toFixed(2)}
                </Text>
              </View>
            )}

            <Text style={[styles.modalLabel, { color: colors.text }]}>Select Delivery Person:</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={selectedDeliveryPerson}
                onValueChange={(itemValue) => setSelectedDeliveryPerson(itemValue)}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.primary}
              >
                <Picker.Item label="Choose delivery person..." value={null} />
                {deliveryPersons.map((person) => (
                  <Picker.Item
                    key={person.user_id}
                    label={`${person.name} (${person.phone || 'No phone'})`}
                    value={person.user_id}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setShowDeliveryModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalAssignButton,
                  { backgroundColor: selectedDeliveryPerson ? colors.primary : colors.surface }
                ]}
                onPress={handleAssignDelivery}
                disabled={!selectedDeliveryPerson}
              >
                <Text style={[
                  styles.modalButtonText,
                  { color: selectedDeliveryPerson ? colors.background : colors.textSecondary }
                ]}>
                  Assign Delivery
                </Text>
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
  customerName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  restaurantName: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
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
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  orderType: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  orderTotal: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  orderItems: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.md,
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
  actionButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
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
    maxHeight: '70%',
    borderRadius: Theme.borderRadius.lg,
    elevation: 5,
    padding: Theme.spacing.lg,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  modalOrderInfo: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  modalOrderText: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  modalLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.lg,
  },
  picker: {
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  modalAssignButton: {
    // backgroundColor set in component
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default OrdersTab;