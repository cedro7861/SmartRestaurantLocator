import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { loginUser, LoginData } from "../../lib/api/userApi";
import { Theme } from "../../lib/colors";

interface LoginScreenProps {
  navigation: any;
  onLogin: (user: any, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLogin }) => {
  // Retaining your original state names for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // State required for the "eye" icon design element
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const loginData: LoginData = { email, password };
      console.log("Attempting login with:", loginData);
      const response = await loginUser(loginData);
      console.log("Login response:", response);
      onLogin(response.user, response.token);
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Login Failed", "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder functions for the new design elements
  const handleGoogleLogin = () =>
    Alert.alert("Social Login", "Google Sign-In Tapped");
  const handleFacebookLogin = () =>
    Alert.alert("Social Login", "Facebook Sign-In Tapped");
  const handleForgotPassword = () => navigation.navigate("ForgotPassword");

  return (
    <View style={styles.container}>
      {/* 1. App Icon Design */}
      <View style={styles.iconContainer}>
        <Icon
          name="silverware"
          size={40}
          color="#FFFFFF"
          style={styles.iconStyle}
        />
      </View>

      {/* 2. App Title Design */}
      <Text style={styles.appTitle}>Smart</Text>
      <Text style={styles.appTitle}>Restaurant</Text>
      <Text style={styles.appTitle}>Locator</Text>

      {/* 3. Email Input Design (Email or username) */}
      <TextInput
        style={[styles.input, { marginTop: 35 }]}
        placeholder="Email or username"
        placeholderTextColor="#8e8e93"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* 4. Password Input Design (With Eye Icon) */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#8e8e93"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#8e8e93"
          />
        </TouchableOpacity>
      </View>

      {/* 5. Forgot Password Link */}
      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* 6. Log In Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.loginButtonText}>Log in</Text>
        )}
      </TouchableOpacity>

      {/* 7. OR Separator */}
      <Text style={styles.orText}>OR</Text>

      {/* 8. Continue with Google Button */}
      <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
        <Icon
          name="google"
          size={20}
          color="#FFFFFF"
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* 9. Continue with Facebook Button */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={handleFacebookLogin}
      >
        <Icon
          name="facebook"
          size={20}
          color="#FFFFFF"
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Continue with Facebook</Text>
      </TouchableOpacity>

      {/* 10. Sign Up Link */}
      <TouchableOpacity
        style={styles.signUpLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.signUpText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Modern Color Theme ---
const { colors, spacing, borderRadius, typography } = Theme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  // --- Icon Styles ---
  iconContainer: {
    alignSelf: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    // Subtle shadow (to enhance the floating look)
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconStyle: {
    transform: [{ rotate: "-15deg" }],
  },
  // --- Title Styles ---
  appTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
    color: colors.text,
    lineHeight: 30,
  },
  // --- Input Styles (Base) ---
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.md,
  },
  // --- Password Specific Styles (Combined with Eye Icon) ---
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  passwordInput: {
    flex: 1,
    color: colors.text,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
  },
  passwordToggle: {
    padding: spacing.md,
  },
  // --- Forgot Password Styles ---
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  // --- Log In Button Styles (Teal) ---
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  // --- OR Separator ---
  orText: {
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  // --- Social Button Styles ---
  socialButton: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  socialIcon: {
    marginRight: spacing.sm,
    width: 25,
    textAlign: "center",
  },
  socialButtonText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    textAlign: "center",
    marginLeft: -35, // Adjust to center text despite the left-aligned icon
  },
  // --- Sign Up Link Styles ---
  signUpLink: {
    marginTop: spacing.lg,
    padding: spacing.sm,
    alignSelf: "center",
  },
  signUpText: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});

export default LoginScreen;
