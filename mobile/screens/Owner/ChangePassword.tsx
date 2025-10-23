import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';
import { changePassword } from '../../lib/api/userApi';

interface ChangePasswordProps {
  navigation: any;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { colors, spacing, borderRadius, typography } = Theme;

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return colors.error;
    if (strength <= 3) return colors.warning;
    return colors.success;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Current Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Ionicons
              name={showCurrentPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="New Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {newPassword.length > 0 && (
          <View style={styles.strengthContainer}>
            <Text style={[styles.strengthText, { color: colors.textSecondary }]}>
              Password Strength:
            </Text>
            <Text style={[styles.strengthValue, { color: getStrengthColor(getPasswordStrength(newPassword)) }]}>
              {getStrengthText(getPasswordStrength(newPassword))}
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: loading ? colors.textSecondary : colors.primary }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {loading ? 'Changing...' : 'Change Password'}
          </Text>
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
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    paddingRight: Theme.spacing.xl, // Space for eye icon
    fontSize: Theme.typography.fontSize.md,
  },
  eyeIcon: {
    position: 'absolute',
    right: Theme.spacing.md,
    top: Theme.spacing.md,
    padding: Theme.spacing.xs,
  },
  strengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
  },
  strengthText: {
    fontSize: Theme.typography.fontSize.sm,
  },
  strengthValue: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
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

export default ChangePassword;