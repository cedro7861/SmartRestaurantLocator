import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { Theme } from '../../lib/colors';
import { getNotifications, Notification } from '../../lib/api/notificationApi';

interface NotificationScreenProps {
  navigation: any;
  user: any;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation, user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, spacing, borderRadius, typography } = Theme;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationCard, { backgroundColor: colors.surface }]}>
      <View style={styles.notificationHeader}>
        <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.notificationContent, { color: colors.textSecondary }]}>
        {item.content}
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Stay updated with the latest news and announcements.
      </Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No notifications yet.
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
  notificationDate: {
    fontSize: Theme.typography.fontSize.sm,
  },
  notificationContent: {
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 22,
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

export default NotificationScreen;