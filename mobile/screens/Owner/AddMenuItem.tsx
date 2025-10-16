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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '../../lib/colors';
import { createMenuItem } from '../../lib/api/menuApi';
import { getOwnerRestaurants, Restaurant } from '../../lib/api/restaurantApi';
import { useAuth } from '../../lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface AddMenuItemProps {
  navigation: any;
}

const AddMenuItem: React.FC<AddMenuItemProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    restaurant_id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      setLoadingRestaurants(false);
      return;
    }

    try {
      const data = await getOwnerRestaurants(user.id);
      setRestaurants(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, restaurant_id: data[0].id.toString() }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurants');
    } finally {
      setLoadingRestaurants(false);
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

  const validateForm = () => {
    if (!formData.restaurant_id) {
      Alert.alert('Validation Error', 'Please select a restaurant');
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Menu item name is required');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createMenuItem({
        restaurant_id: parseInt(formData.restaurant_id),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        category: formData.category.trim() || undefined,
        image: formData.image.trim() || undefined,
      });
      Alert.alert('Success', 'Menu item added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Add menu item error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRestaurants) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading restaurants...</Text>
      </View>
    );
  }

  if (restaurants.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>No restaurants found. Please add a restaurant first.</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.background }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add Menu Item</Text>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>
          Select Restaurant <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
          <Picker
            selectedValue={formData.restaurant_id}
            onValueChange={(itemValue) => setFormData({ ...formData, restaurant_id: itemValue })}
            style={[styles.picker, { color: colors.text }]}
          >
            {restaurants.map((restaurant) => (
              <Picker.Item key={restaurant.id} label={restaurant.name} value={restaurant.id.toString()} />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>
          Item Name <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Enter menu item name"
          placeholderTextColor={colors.textSecondary}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
          placeholder="Enter item description (optional)"
          placeholderTextColor={colors.textSecondary}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Price <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="e.g., Pizza, Burgers, Drinks"
          placeholderTextColor={colors.textSecondary}
          value={formData.category}
          onChangeText={(text) => setFormData({ ...formData, category: text })}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: colors.text }]}>Menu Item Image</Text>
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
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.background }]}>Add Menu Item</Text>
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
    marginBottom: Theme.spacing.lg,
    fontSize: Theme.typography.fontSize.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    fontSize: Theme.typography.fontSize.md,
    minHeight: 80,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
  },
  picker: {
    height: 50,
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
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.md,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
});

export default AddMenuItem;