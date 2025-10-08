import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';

interface SystemHealthScreenProps {
  navigation: any;
}

const SystemHealthScreen: React.FC<SystemHealthScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { colors, spacing, borderRadius, typography } = Theme;

  // Mock health data
  const [healthData, setHealthData] = useState({
    server: { status: 'healthy', uptime: '5d 12h 30m', responseTime: '120ms' },
    database: { status: 'healthy', connections: 45, queriesPerSec: 1250 },
    api: { status: 'healthy', endpoints: 24, errors: 2 },
    memory: { used: 2.4, total: 8, percentage: 30 },
    cpu: { usage: 45 },
  });

  // Mock logs
  const [logs] = useState([
    { id: 1, timestamp: '2025-10-08 10:30:15', level: 'INFO', message: 'User login successful' },
    { id: 2, timestamp: '2025-10-08 10:29:45', level: 'WARN', message: 'High memory usage detected' },
    { id: 3, timestamp: '2025-10-08 10:28:20', level: 'ERROR', message: 'Database connection timeout' },
    { id: 4, timestamp: '2025-10-08 10:27:10', level: 'INFO', message: 'Order processed successfully' },
    { id: 5, timestamp: '2025-10-08 10:26:05', level: 'INFO', message: 'New user registered' },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setHealthData({
        ...healthData,
        cpu: { usage: Math.floor(Math.random() * 100) },
        memory: { ...healthData.memory, percentage: Math.floor(Math.random() * 100) },
      });
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return colors.success;
      case 'warning': return colors.warning;
      case 'critical': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'ERROR': return colors.error;
      case 'WARN': return colors.warning;
      case 'INFO': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const renderHealthCard = (title: string, data: any, icon: string) => (
    <View style={[styles.healthCard, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
            </Text>
            <Text style={[styles.metricValue, {
              color: key === 'status' ? getStatusColor(value as string) : colors.text
            }]}>
              {key === 'percentage' || key === 'usage' ? `${value}%` :
               key === 'used' || key === 'total' ? `${value}GB` : String(value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.title, { color: colors.text }]}>System Health & Logs</Text>

        {/* Health Metrics */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>System Health</Text>
        <View style={styles.healthGrid}>
          {renderHealthCard('Server', healthData.server, 'server-outline')}
          {renderHealthCard('Database', healthData.database, 'database-outline')}
          {renderHealthCard('API', healthData.api, 'cloud-outline')}
          {renderHealthCard('Memory', healthData.memory, 'bar-chart-outline')}
          {renderHealthCard('CPU', healthData.cpu, 'speedometer-outline')}
        </View>

        {/* System Logs */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent Logs</Text>
        <View style={[styles.logsContainer, { backgroundColor: colors.surface }]}>
          {logs.map((log) => (
            <View key={log.id} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Text style={[styles.logTimestamp, { color: colors.textSecondary }]}>
                  {log.timestamp}
                </Text>
                <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                  {log.level}
                </Text>
              </View>
              <Text style={[styles.logMessage, { color: colors.text }]}>{log.message}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => {/* Export logs */}}
          >
            <Ionicons name="download-outline" size={20} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>Export Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning }]}
            onPress={() => {/* Clear logs */}}
          >
            <Ionicons name="trash-outline" size={20} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>Clear Logs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  healthGrid: {
    marginBottom: Theme.spacing.lg,
  },
  healthCard: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  cardTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.bold,
    marginLeft: Theme.spacing.sm,
  },
  cardContent: {
    // Content styles
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xs,
  },
  metricLabel: {
    fontSize: Theme.typography.fontSize.sm,
  },
  metricValue: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  logsContainer: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  logEntry: {
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xs,
  },
  logTimestamp: {
    fontSize: Theme.typography.fontSize.xs,
  },
  logLevel: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  logMessage: {
    fontSize: Theme.typography.fontSize.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Theme.spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.xs,
  },
});

export default SystemHealthScreen;