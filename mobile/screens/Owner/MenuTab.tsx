import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList, TextInput } from 'react-native';
import { Theme } from '../../lib/colors';
import { getOwnerMenuItems, MenuItem, updateMenuItem, deleteMenuItem } from '../../lib/api/menuApi';

interface MenuTabProps {
  navigation: any;
}

const MenuTab: React.FC<MenuTabProps> = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const data = await getOwnerMenuItems(2); // Using hardcoded user ID for now
      setMenuItems(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditDescription(item.description || '');
    setEditCategory(item.category || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      await updateMenuItem(editingItem.id, {
        name: editName,
        price: parseFloat(editPrice),
        description: editDescription,
        category: editCategory,
      });
      Alert.alert('Success', 'Menu item updated successfully');
      setEditingItem(null);
      loadMenuItems(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update menu item');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
    setEditDescription('');
    setEditCategory('');
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenuItem(item.id);
              Alert.alert('Success', 'Menu item deleted successfully');
              loadMenuItems(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Manage Menu</Text>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddMenuItem')}
      >
        <Text style={[styles.addButtonText, { color: colors.background }]}>Add Menu Item</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        {loadingMenu ? (
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading menu items...</Text>
        ) : menuItems.length === 0 ? (
          <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
            No menu items yet. Add your first menu item!
          </Text>
        ) : (
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.menuItemCard, { backgroundColor: colors.surface }]}>
                {editingItem?.id === item.id ? (
                  // Edit mode
                  <View>
                    <Text style={[styles.editLabel, { color: colors.text }]}>Name:</Text>
                    <TextInput
                      style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Item name"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={[styles.editLabel, { color: colors.text }]}>Price:</Text>
                    <TextInput
                      style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      placeholder="Price"
                      keyboardType="numeric"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={[styles.editLabel, { color: colors.text }]}>Description:</Text>
                    <TextInput
                      style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                      value={editDescription}
                      onChangeText={setEditDescription}
                      placeholder="Description"
                      multiline
                      placeholderTextColor={colors.textSecondary}
                    />
                    <Text style={[styles.editLabel, { color: colors.text }]}>Category:</Text>
                    <TextInput
                      style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                      value={editCategory}
                      onChangeText={setEditCategory}
                      placeholder="Category"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: colors.success }]}
                        onPress={handleSaveEdit}
                      >
                        <Text style={[styles.editButtonText, { color: colors.background }]}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: colors.error }]}
                        onPress={handleCancelEdit}
                      >
                        <Text style={[styles.editButtonText, { color: colors.background }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // View mode
                  <>
                    <View style={styles.menuItemHeader}>
                      <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.menuItemPrice, { color: colors.primary }]}>${item.price}</Text>
                    </View>
                    <Text style={[styles.menuItemRestaurant, { color: colors.textSecondary }]}>
                      {item.restaurant?.name}
                    </Text>
                    {item.category && (
                      <Text style={[styles.menuItemCategory, { color: colors.textSecondary }]}>
                        {item.category}
                      </Text>
                    )}
                    {item.description && (
                      <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.menuItemActions}>
                      <TouchableOpacity
                        style={[styles.menuActionButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleEditMenuItem(item)}
                      >
                        <Text style={[styles.menuActionText, { color: colors.background }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.menuActionButton, { backgroundColor: colors.error }]}
                        onPress={() => handleDeleteMenuItem(item)}
                      >
                        <Text style={[styles.menuActionText, { color: colors.background }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
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
  addButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    elevation: 3,
  },
  addButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
  noItemsText: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  menuItemCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
  },
  menuItemName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  menuItemRestaurant: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  menuItemCategory: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  menuItemDescription: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuActionButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  menuActionText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  editLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  editButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default MenuTab;