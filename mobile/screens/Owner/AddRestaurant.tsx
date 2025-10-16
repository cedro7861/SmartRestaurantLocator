import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '../../lib/colors';
import { createRestaurant } from '../../lib/api/restaurantApi';
import { useAuth } from '../../lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -1.9441,
    longitude: 30.0619,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
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
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
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
    const { coordinate } = event.nativeEvent;
    setFormData({
      ...formData,
      latitude: coordinate.latitude.toString(),
      longitude: coordinate.longitude.toString(),
    });
    setMapRegion({
      ...mapRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Restaurant Location</Text>
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Select your restaurant location on the map below.
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

export default AddRestaurant;