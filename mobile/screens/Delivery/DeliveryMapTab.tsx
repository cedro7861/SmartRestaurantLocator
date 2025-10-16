import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAvailableDeliveries, Order } from '../../lib/api/orderApi';

interface DeliveryMapTabProps {
  navigation: any;
  user: any;
}

const DeliveryMapTab: React.FC<DeliveryMapTabProps> = ({ navigation, user }) => {
  const [availableDeliveries, setAvailableDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Order | null>(null);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadAvailableDeliveries();
  }, []);

  const loadAvailableDeliveries = async () => {
    setLoading(true);
    try {
      const data = await getAvailableDeliveries();
      setAvailableDeliveries(data || []);
    } catch (error) {
      console.log('Failed to load available deliveries:', error);
      Alert.alert('Error', 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = (order: Order) => {
    Alert.alert(
      'Accept Delivery',
      `Accept delivery for Order #${order.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Navigate back to deliveries tab and trigger accept
            navigation.goBack();
            // The accept logic will be handled in the main dashboard
          }
        }
      ]
    );
  };

  const renderDeliveryMarker = (order: Order, index: number) => (
    <TouchableOpacity
      key={order.id}
      style={[
        styles.marker,
        {
          backgroundColor: selectedDelivery?.id === order.id ? colors.primary : colors.warning,
          left: `${20 + (index * 15)}%`,
          top: `${30 + (index * 10)}%`,
        }
      ]}
      onPress={() => setSelectedDelivery(order)}
    >
      <Ionicons name="location" size={24} color={colors.background} />
      <Text style={[styles.markerText, { color: colors.background }]}>
        {order.id}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Delivery Map</Text>

      {/* Map Container (Simplified representation) */}
      <View style={[styles.mapContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.mapPlaceholder, { color: colors.textSecondary }]}>
          🗺️ Interactive Map View
        </Text>
        <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>
          Real map integration would go here
        </Text>

        {/* Simulated delivery markers */}
        {availableDeliveries.slice(0, 4).map((order, index) => renderDeliveryMarker(order, index))}

        {/* Current location marker */}
        <View style={[styles.currentLocation, { backgroundColor: colors.primary }]}>
          <Ionicons name="navigate" size={20} color={colors.background} />
        </View>
      </View>

      {/* Delivery Details */}
      {selectedDelivery && (
        <View style={[styles.deliveryDetails, { backgroundColor: colors.surface }]}>
          <View style={styles.deliveryHeader}>
            <Text style={[styles.deliveryTitle, { color: colors.text }]}>
              Order #{selectedDelivery.id}
            </Text>
            <TouchableOpacity onPress={() => setSelectedDelivery(null)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.deliveryInfo, { color: colors.textSecondary }]}>
            Customer: {selectedDelivery.customer?.name || 'N/A'}
          </Text>
          <Text style={[styles.deliveryInfo, { color: colors.textSecondary }]}>
            Restaurant: {selectedDelivery.restaurant?.name || 'N/A'}
          </Text>
          <Text style={[styles.deliveryAmount, { color: colors.primary }]}>
            ${typeof selectedDelivery.total_price === 'number' ?
              selectedDelivery.total_price.toFixed(2) :
              parseFloat(selectedDelivery.total_price || '0').toFixed(2)}
          </Text>

          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={() => handleAcceptDelivery(selectedDelivery)}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.background} />
            <Text style={[styles.acceptButtonText, { color: colors.background }]}>
              Accept Delivery
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Available Deliveries List */}
      <View style={styles.deliveriesList}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Available Deliveries ({availableDeliveries.length})
        </Text>
        {availableDeliveries.slice(0, 3).map((order) => (
          <TouchableOpacity
            key={order.id}
            style={[styles.deliveryItem, { backgroundColor: colors.surface }]}
            onPress={() => setSelectedDelivery(order)}
          >
            <View style={styles.deliveryItemLeft}>
              <Text style={[styles.deliveryItemTitle, { color: colors.text }]}>
                Order #{order.id}
              </Text>
              <Text style={[styles.deliveryItemSubtitle, { color: colors.textSecondary }]}>
                {order.restaurant?.name || 'Restaurant'} • ${typeof order.total_price === 'number' ?
                  order.total_price.toFixed(2) :
                  parseFloat(order.total_price || '0').toFixed(2)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
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
  mapContainer: {
    height: 300,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapPlaceholder: {
    fontSize: Theme.typography.fontSize.xl,
    textAlign: 'center',
  },
  mapSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  currentLocation: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  deliveryDetails: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  deliveryTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  deliveryInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  deliveryAmount: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  acceptButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.sm,
  },
  deliveriesList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  deliveryItemLeft: {
    flex: 1,
  },
  deliveryItemTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  deliveryItemSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs,
  },
});

export default DeliveryMapTab;