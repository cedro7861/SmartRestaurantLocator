import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';

interface AppConfigurationProps {
  navigation: any;
}

const AppConfiguration: React.FC<AppConfigurationProps> = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography } = Theme;

  // Mock configuration data
  const [config, setConfig] = useState({
    apiEndpoint: 'https://api.smartrestaurant.com',
    enableNotifications: true,
    enableLocationServices: true,
    maxOrdersPerHour: 100,
    maintenanceMode: false,
    debugMode: false,
    cacheExpiryHours: 24,
    maxImageSize: 5, // MB
  });

  const [tempConfig, setTempConfig] = useState(config);

  const handleSave = () => {
    // Validate inputs
    if (!tempConfig.apiEndpoint.trim()) {
      Alert.alert('Error', 'API Endpoint cannot be empty');
      return;
    }
    if (tempConfig.maxOrdersPerHour < 1) {
      Alert.alert('Error', 'Max orders per hour must be at least 1');
      return;
    }

    setConfig(tempConfig);
    Alert.alert('Success', 'Configuration saved successfully');
  };

  const handleReset = () => {
    setTempConfig(config);
  };

  const updateConfig = (key: string, value: any) => {
    setTempConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderTextInput = (label: string, key: string, placeholder: string, keyboardType: 'default' | 'numeric' = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
        value={String(tempConfig[key as keyof typeof tempConfig])}
        onChangeText={(text) => {
          const value = keyboardType === 'numeric' ? parseInt(text) || 0 : text;
          updateConfig(key, value);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderSwitch = (label: string, key: string, description?: string) => (
    <View style={styles.switchGroup}>
      <View style={styles.switchContent}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={tempConfig[key as keyof typeof tempConfig] as boolean}
        onValueChange={(value) => updateConfig(key, value)}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={tempConfig[key as keyof typeof tempConfig] ? colors.primary : colors.textSecondary}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Application Configuration</Text>

        {/* API Settings */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>API Settings</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderTextInput('API Endpoint', 'apiEndpoint', 'https://api.example.com')}
        </View>

        {/* Feature Toggles */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Features</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderSwitch('Enable Notifications', 'enableNotifications', 'Allow push notifications')}
          {renderSwitch('Enable Location Services', 'enableLocationServices', 'Use GPS for location-based features')}
          {renderSwitch('Maintenance Mode', 'maintenanceMode', 'Put app in maintenance mode')}
          {renderSwitch('Debug Mode', 'debugMode', 'Enable debug logging')}
        </View>

        {/* Limits & Quotas */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Limits & Quotas</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderTextInput('Max Orders Per Hour', 'maxOrdersPerHour', '100', 'numeric')}
          {renderTextInput('Cache Expiry (Hours)', 'cacheExpiryHours', '24', 'numeric')}
          {renderTextInput('Max Image Size (MB)', 'maxImageSize', '5', 'numeric')}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Ionicons name="save-outline" size={20} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
            onPress={handleReset}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.warning + '20' }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Changes will take effect after app restart. Some settings may require server restart.
          </Text>
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
  section: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  inputLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    marginBottom: Theme.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.md,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm,
  },
  switchContent: {
    flex: 1,
  },
  switchLabel: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  switchDescription: {
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.xs / 2,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.lg,
  },
  infoText: {
    fontSize: Theme.typography.fontSize.sm,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
});

export default AppConfiguration;