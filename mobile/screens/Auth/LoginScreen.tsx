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
// **ACTION REQUIRED:** You must install this library: npm install react-native-vector-icons
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { loginUser, LoginData } from "../../lib/api/userApi";

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

// --- Updated Styling to Match the Modern, Dark-Themed Image ---
const DARK_BG = "#12121e"; // Deep dark background
const INPUT_FIELD_BG = "#1f1f33"; // Slightly lighter dark for inputs/buttons
const BRAND_COLOR = "#4db6ac"; // Teal/Mint green for the main button
const TEXT_COLOR = "#FFFFFF"; // White text

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  // --- Icon Styles ---
  iconContainer: {
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: INPUT_FIELD_BG,
    justifyContent: "center",
    alignItems: "center",
    // Subtle shadow (to enhance the floating look)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconStyle: {
    transform: [{ rotate: "-15deg" }],
  },
  // --- Title Styles ---
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: TEXT_COLOR,
    lineHeight: 30,
  },
  // --- Input Styles (Base) ---
  input: {
    backgroundColor: INPUT_FIELD_BG,
    color: TEXT_COLOR,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  // --- Password Specific Styles (Combined with Eye Icon) ---
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_FIELD_BG,
    borderRadius: 10,
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    color: TEXT_COLOR,
    padding: 15,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 15,
  },
  // --- Forgot Password Styles ---
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: "#8e8e93",
    fontSize: 14,
  },
  // --- Log In Button Styles (Teal) ---
  loginButton: {
    backgroundColor: BRAND_COLOR,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: DARK_BG,
    fontSize: 18,
    fontWeight: "bold",
  },
  // --- OR Separator ---
  orText: {
    color: "#8e8e93",
    textAlign: "center",
    marginBottom: 20,
  },
  // --- Social Button Styles ---
  socialButton: {
    flexDirection: "row",
    backgroundColor: INPUT_FIELD_BG,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  socialIcon: {
    marginRight: 10,
    width: 25,
    textAlign: "center",
  },
  socialButtonText: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: 16,
    textAlign: "center",
    marginLeft: -35, // Adjust to center text despite the left-aligned icon
  },
  // --- Sign Up Link Styles ---
  signUpLink: {
    marginTop: 20,
    padding: 10,
    alignSelf: "center",
  },
  signUpText: {
    color: BRAND_COLOR,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
