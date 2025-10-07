import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Theme } from '../../lib/colors';

interface ContactSupportProps {
  navigation: any;
}

const ContactSupport: React.FC<ContactSupportProps> = ({ navigation }) => {
  const [contactMessage, setContactMessage] = useState('');
  const { colors, spacing, borderRadius, typography } = Theme;

  const handleContactSupport = async () => {
    if (!contactMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    // For now, just show a success message
    // In a real app, this would send the message to support
    Alert.alert('Success', 'Your message has been sent to support. We will get back to you soon!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    setContactMessage('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Contact Support</Text>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Need help? Send us a message and we'll get back to you as soon as possible.
        </Text>

        <TextInput
          style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
          placeholder="Describe your issue or question..."
          placeholderTextColor={colors.textSecondary}
          value={contactMessage}
          onChangeText={setContactMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleContactSupport}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>Send Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: Theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    fontSize: Theme.typography.fontSize.md,
    height: 120,
  },
  button: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  buttonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  cancelButton: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cancelButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default ContactSupport;