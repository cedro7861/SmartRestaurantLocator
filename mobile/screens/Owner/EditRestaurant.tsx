import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { updateRestaurant, Restaurant } from '../../lib/api/restaurantApi';

interface EditRestaurantProps {
  navigation: any;
  route: any;
}

const EditRestaurant: React.FC<EditRestaurantProps> = ({ navigation, route }) => {
  const { restaurant } = route.params;
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    location: restaurant.location || '',
    contact_info: restaurant.contact_info || '',
    latitude: restaurant.latitude?.toString() || '',
    longitude: restaurant.longitude?.toString() || '',
    image: restaurant.image || '',
    status: restaurant.status || 'open',
  });
  const [loading, setLoading] = useState(false);
  const { colors, spacing, borderRadius, typography } = Theme;

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Restaurant name is required');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Location is required');
      return false;
    }
    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      Alert.alert('Validation Error', 'Latitude must be a valid number');
      return false;
    }
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      Alert.alert('Validation Error', 'Longitude must be a valid number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateRestaurant(restaurant.id, {
        name: formData.name.trim(),
        location: formData.location.trim(),
        contact_info: formData.contact_info.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        image: formData.image.trim() || undefined,
        status: formData.status,
      });
      Alert.alert('Success', 'Restaurant updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Update restaurant error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = () => {
    const newStatus = formData.status === 'open' ? 'closed' : 'open';
    setFormData({ ...formData, status: newStatus });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Edit Restaurant</Text>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>
          Restaurant Name <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Enter restaurant name"
          placeholderTextColor={colors.textSecondary}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Location <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Enter location (e.g., Kigali, Rwanda)"
          placeholderTextColor={colors.textSecondary}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />

        <Text style={[styles.label, { color: colors.text }]}>Contact Info</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Enter phone number or email"
          placeholderTextColor={colors.textSecondary}
          value={formData.contact_info}
          onChangeText={(text) => setFormData({ ...formData, contact_info: text })}
          keyboardType="phone-pad"
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location Coordinates (Optional)</Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Update coordinates to show your restaurant on the map. You can find coordinates using Google Maps.
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Latitude</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="e.g., -1.9441"
          placeholderTextColor={colors.textSecondary}
          value={formData.latitude}
          onChangeText={(text) => setFormData({ ...formData, latitude: text })}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Longitude</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="e.g., 30.0619"
          placeholderTextColor={colors.textSecondary}
          value={formData.longitude}
          onChangeText={(text) => setFormData({ ...formData, longitude: text })}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Restaurant Image URL</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="https://example.com/restaurant-image.jpg"
          placeholderTextColor={colors.textSecondary}
          value={formData.image}
          onChangeText={(text) => setFormData({ ...formData, image: text })}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.text }]}>Restaurant Status</Text>
        <TouchableOpacity
          style={[styles.statusToggle, {
            backgroundColor: formData.status === 'open' ? colors.success : colors.error
          }]}
          onPress={toggleStatus}
        >
          <Text style={[styles.statusText, { color: colors.background }]}>
            {formData.status === 'open' ? '🟢 Open' : '🔴 Closed'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.background }]}>Update Restaurant</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.text }]}>Cancel</Text>
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
  form: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  note: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  statusToggle: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  statusText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  submitButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  submitButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  backButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  backButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default EditRestaurant;