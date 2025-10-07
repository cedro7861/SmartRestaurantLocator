import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Theme } from '../../lib/colors';
import { getAllNotifications, createNotification, deleteNotification, Notification } from '../../lib/api/notificationApi';

interface ManageNotificationsProps {
  navigation: any;
  user: any;
}

const ManageNotifications: React.FC<ManageNotificationsProps> = ({ navigation, user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getAllNotifications();
      setNotifications(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await createNotification({ title: title.trim(), content: content.trim(), target_role: targetRole });
      Alert.alert('Success', 'Notification created successfully');
      setTitle('');
      setContent('');
      setTargetRole('all');
      setShowForm(false);
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to create notification');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(id);
              Alert.alert('Success', 'Notification deleted successfully');
              loadNotifications();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationCard, { backgroundColor: colors.surface }]}>
      <View style={styles.notificationHeader}>
        <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteNotification(item.notification_id)}
        >
          <Text style={[styles.deleteButtonText, { color: colors.background }]}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.notificationContent, { color: colors.textSecondary }]}>
        {item.content}
      </Text>
      <Text style={[styles.notificationMeta, { color: colors.textSecondary }]}>
        Target: {item.target_role} | Created: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Manage Notifications</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Create and manage system notifications for users.
      </Text>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={[styles.addButtonText, { color: colors.background }]}>
          {showForm ? 'Cancel' : 'Add New Notification'}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Notification Title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
            placeholder="Notification Content"
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
          />
          <View style={styles.roleSelector}>
            <Text style={[styles.roleLabel, { color: colors.text }]}>Target Role:</Text>
            {['all', 'customer', 'owner', 'delivery'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  { backgroundColor: targetRole === role ? colors.primary : colors.surface },
                  { borderColor: colors.border }
                ]}
                onPress={() => setTargetRole(role)}
              >
                <Text style={[
                  styles.roleOptionText,
                  { color: targetRole === role ? colors.background : colors.text }
                ]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.success }]}
            onPress={handleCreateNotification}
          >
            <Text style={[styles.createButtonText, { color: colors.background }]}>Create Notification</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>All Notifications</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No notifications yet. Create your first notification above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.notification_id.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  addButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  addButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  formCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
    height: 100,
    textAlignVertical: 'top',
  },
  roleSelector: {
    marginBottom: Theme.spacing.md,
  },
  roleLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.sm,
  },
  roleOption: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    marginRight: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  roleOptionText: {
    fontSize: Theme.typography.fontSize.sm,
  },
  createButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  listContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  notificationCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  notificationTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  deleteButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  notificationContent: {
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 22,
    marginBottom: Theme.spacing.sm,
  },
  notificationMeta: {
    fontSize: Theme.typography.fontSize.sm,
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
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
  },
});

export default ManageNotifications;