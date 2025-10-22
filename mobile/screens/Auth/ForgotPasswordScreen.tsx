import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Theme } from '../../lib/colors';
import { requestPasswordReset } from '../../lib/api/userApi';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { colors, spacing, borderRadius, typography } = Theme;

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await requestPasswordReset({ email });

      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'If an account with this email exists, we have sent you a password reset link.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send reset email. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
          <Icon
            name="email-check"
            size={40}
            color={colors.success}
          />
        </View>

        {/* Success Message */}
        <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We've sent a password reset link to
        </Text>
        <Text style={[styles.email, { color: colors.primary }]}>{email}</Text>

        {/* Instructions */}
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          Click the link in the email to reset your password. The link will expire in 24 hours.
        </Text>

        {/* Back to Login */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.backButtonText, { color: colors.background }]}>Back to Login</Text>
        </TouchableOpacity>

        {/* Resend Email */}
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={() => {
            setEmailSent(false);
            setEmail('');
          }}
        >
          <Text style={[styles.resendText, { color: colors.primary }]}>
            Didn't receive the email? Try again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButtonTop}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Icon
          name="lock-reset"
          size={40}
          color={colors.primary}
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        No worries! Enter your email and we'll send you a reset link.
      </Text>

      {/* Email Input */}
      <TextInput
        style={[styles.input, {
          color: colors.text,
          borderColor: colors.border,
          backgroundColor: colors.surface
        }]}
        placeholder="Enter your email address"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.resetButton, {
          backgroundColor: loading ? colors.surface : colors.primary,
          borderColor: colors.primary
        }]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={[styles.resetButtonText, {
            color: loading ? colors.primary : colors.background
          }]}>
            Send Reset Link
          </Text>
        )}
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={[styles.loginLinkText, { color: colors.primary }]}>
          Remember your password? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xxl,
    justifyContent: 'center',
  },
  backButtonTop: {
    position: 'absolute',
    top: Theme.spacing.xl,
    left: Theme.spacing.lg,
    padding: Theme.spacing.sm,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
  email: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  instruction: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.lg,
  },
  resetButton: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  backButton: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  backButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  loginLink: {
    alignSelf: 'center',
    padding: Theme.spacing.sm,
  },
  loginLinkText: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  resendContainer: {
    alignSelf: 'center',
    padding: Theme.spacing.sm,
  },
  resendText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default ForgotPasswordScreen;