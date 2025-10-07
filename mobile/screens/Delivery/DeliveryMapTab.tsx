import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Theme } from '../../lib/colors';
import { getAvailableDeliveries, Order } from '../../lib/api/orderApi';

interface DeliveryMapTabProps {
  navigation: any;
  user: any;
}

const DeliveryMapTab: React.FC<DeliveryMapTabProps> = ({ navigation, user }) => {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const data = await getAvailableDeliveries();
      setDeliveries(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryColor = (status: string) => {
    switch (status) {
      case 'ready': return colors.warning;
      case 'delivering': return colors.primary;
      case 'delivered': return colors.success;
      default: return colors.error;
    }
  };

  const getDeliveryIcon = (status: string) => {
    switch (status) {
      case 'ready': return '📦';
      case 'delivering': return '🚚';
      case 'delivered': return '✅';
      default: return '❌';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading deliveries...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Delivery Map</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -1.2864, // Kigali coordinates as default
          longitude: 36.8172,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {deliveries.map((delivery, index) => (
          <Marker
            key={delivery.id}
            coordinate={{
              latitude: -1.2864 + (index * 0.01), // Spread markers slightly for demo
              longitude: 36.8172 + (index * 0.01),
            }}
            pinColor={getDeliveryColor(delivery.status)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={[styles.calloutTitle, { color: colors.text }]}>
                  {getDeliveryIcon(delivery.status)} Order #{delivery.id}
                </Text>
                <Text style={[styles.calloutSubtitle, { color: colors.textSecondary }]}>
                  {delivery.restaurant.name}
                </Text>
                <Text style={[styles.calloutInfo, { color: colors.textSecondary }]}>
                  Location: {delivery.restaurant.location || 'Not specified'}
                </Text>
                <Text style={[styles.calloutInfo, { color: colors.textSecondary }]}>
                  Customer: {delivery.customer?.name}
                </Text>
                <Text style={[styles.calloutInfo, { color: colors.primary }]}>
                  ${delivery.total_price}
                </Text>
                <Text style={[styles.calloutStatus, {
                  color: getDeliveryColor(delivery.status),
                  backgroundColor: getDeliveryColor(delivery.status) + '20'
                }]}>
                  {delivery.status}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>📦</Text>
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Ready</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>🚚</Text>
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Delivering</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendIcon}>✅</Text>
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Delivered</Text>
        </View>
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
    marginBottom: Theme.spacing.md,
  },
  map: {
    flex: 1,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  callout: {
    width: 200,
    padding: Theme.spacing.sm,
  },
  calloutTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  calloutSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  calloutInfo: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  calloutStatus: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: Theme.typography.fontSize.lg,
    marginBottom: Theme.spacing.xs,
  },
  legendText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default DeliveryMapTab;