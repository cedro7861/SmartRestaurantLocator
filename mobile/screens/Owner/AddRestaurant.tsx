import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { createRestaurant } from '../../lib/api/restaurantApi';
import { useAuth } from '../../lib/AuthContext';

interface AddRestaurantProps {
  navigation: any;
  route: any;
}

const AddRestaurant: React.FC<AddRestaurantProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_info: '',
    latitude: '',
    longitude: '',
    image: '',
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
      await createRestaurant({
        name: formData.name.trim(),
        location: formData.location.trim(),
        contact_info: formData.contact_info.trim() || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        image: formData.image.trim() || undefined,
        owner_id: user?.id,
      });
      Alert.alert('Success', 'Restaurant added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Add restaurant error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add New Restaurant</Text>

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
          Add coordinates to show your restaurant on the map. You can find coordinates using Google Maps.
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

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: loading ? colors.textSecondary : colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={[styles.submitButtonText, { color: colors.background }]}>
            {loading ? 'Adding...' : 'Add Restaurant'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.error }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.background }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
    flex: 1,
  },
  label: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
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
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    fontSize: Theme.typography.fontSize.md,
  },
  submitButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  submitButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  cancelButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default AddRestaurant;