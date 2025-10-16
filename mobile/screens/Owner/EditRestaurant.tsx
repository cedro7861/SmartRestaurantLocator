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
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '../../lib/colors';
import { updateRestaurant, Restaurant } from '../../lib/api/restaurantApi';
import { Ionicons } from '@expo/vector-icons';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(restaurant.image || null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: restaurant.latitude || -1.9441,
    longitude: restaurant.longitude || 30.0619,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (restaurant.latitude && restaurant.longitude) {
      setMapRegion({
        latitude: parseFloat(restaurant.latitude.toString()),
        longitude: parseFloat(restaurant.longitude.toString()),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [restaurant.latitude, restaurant.longitude]);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to select restaurant location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      if (!restaurant.latitude || !restaurant.longitude) {
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFormData({ ...formData, image: result.assets[0].uri });
    }
  };

  const handleMapPress = (event: any) => {
    try {
      const { coordinate } = event.nativeEvent;
      if (coordinate && coordinate.latitude && coordinate.longitude) {
        const newRegion = {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setFormData({
          ...formData,
          latitude: coordinate.latitude.toString(),
          longitude: coordinate.longitude.toString(),
        });
        setMapRegion(newRegion);
      }
    } catch (error) {
      console.error('Error handling map press:', error);
      Alert.alert('Error', 'Failed to select location. Please try again.');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Restaurant name is required');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Location is required');
      return false;
    }
    if (formData.latitude && formData.latitude.trim() !== '' && isNaN(parseFloat(formData.latitude))) {
      Alert.alert('Validation Error', 'Latitude must be a valid number');
      return false;
    }
    if (formData.longitude && formData.longitude.trim() !== '' && isNaN(parseFloat(formData.longitude))) {
      Alert.alert('Validation Error', 'Longitude must be a valid number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        contact_info: formData.contact_info.trim() || undefined,
        image: formData.image.trim() || undefined,
        status: formData.status,
      };

      // Only include latitude and longitude if they are valid numbers
      if (formData.latitude && formData.latitude.trim() !== '' && !isNaN(parseFloat(formData.latitude))) {
        updateData.latitude = parseFloat(formData.latitude);
      }

      if (formData.longitude && formData.longitude.trim() !== '' && !isNaN(parseFloat(formData.longitude))) {
        updateData.longitude = parseFloat(formData.longitude);
      }

      await updateRestaurant(restaurant.id, updateData);
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Restaurant Location</Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Update your restaurant location on the map below.
        </Text>

        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowMap(true)}
        >
          <Ionicons name="map" size={24} color={colors.primary} />
          <Text style={[styles.mapButtonText, { color: colors.primary }]}>
            {formData.latitude && formData.longitude
              ? `Location Selected: ${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)}`
              : 'Select Location on Map'
            }
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {formData.latitude && formData.longitude && (
          <Text style={[styles.coordinatesText, { color: colors.textSecondary }]}>
            Coordinates: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
          </Text>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Restaurant Image</Text>
        <TouchableOpacity
          style={[styles.imageButton, { backgroundColor: colors.surface }]}
          onPress={pickImage}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={48} color={colors.textSecondary} />
              <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                Tap to select image
              </Text>
            </View>
          )}
        </TouchableOpacity>

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

      {/* Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Restaurant Location</Text>
            <TouchableOpacity onPress={() => setShowMap(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {formData.latitude && formData.longitude && (
              <Marker
                coordinate={{
                  latitude: parseFloat(formData.latitude),
                  longitude: parseFloat(formData.longitude),
                }}
                title="Restaurant Location"
                description="Selected location for your restaurant"
              />
            )}
          </MapView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowMap(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.background }]}>
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  mapButtonText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.md,
    marginLeft: Theme.spacing.sm,
  },
  coordinatesText: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.lg,
    fontStyle: 'italic',
  },
  imageButton: {
    height: 150,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.sm,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  map: {
    flex: 1,
  },
  modalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  modalButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default EditRestaurant;