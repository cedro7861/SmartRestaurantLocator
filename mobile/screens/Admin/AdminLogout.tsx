import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Theme } from "../../lib/colors";
import { Ionicons } from "@expo/vector-icons";

interface AdminLogoutProps {
  navigation: any;
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

const AdminLogout: React.FC<AdminLogoutProps> = ({ navigation, user, onLogout }) => {
  const { colors, spacing, borderRadius, typography } = Theme;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: onLogout },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.lg },
        ]}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>
          Logout Confirmation
        </Text>

        {/* PROFILE HEADER */}
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: colors.surface, borderRadius: borderRadius.lg },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, { color: colors.text }]}>
              {user.name[0]}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.name}
            </Text>
            <Text
              style={[styles.userEmail, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {user.email}
            </Text>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: colors.admin,
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <Text style={[styles.roleText, { color: colors.text }]}>
                {user.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            You are about to logout from the admin dashboard. Make sure all your work is saved.
          </Text>

          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: colors.error, borderRadius: borderRadius.lg },
            ]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.background} />
            <Text style={[styles.logoutButtonText, { color: colors.background }]}>
              Confirm Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.text} />
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Footer */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          App Version 1.0.0 (Build 42)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet (Updated to use Theme values consistently) ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.sm,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: Theme.typography.fontSize.md,
    marginLeft: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  // --- Profile Header Styles ---
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.round,
    backgroundColor: Theme.colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  avatarText: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  userEmail: {
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.xs,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
  },
  roleText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    textTransform: "uppercase",
  },
  content: {
    alignItems: "center",
  },
  message: {
    fontSize: Theme.typography.fontSize.md,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
    paddingHorizontal: Theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    width: "80%",
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.sm,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.lg,
    borderWidth: 1,
    width: "80%",
  },
  cancelButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    marginLeft: Theme.spacing.sm,
  },
  // --- Footer Style ---
  versionText: {
    fontSize: Theme.typography.fontSize.xs,
    textAlign: "center",
    paddingBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
  },
});

export default AdminLogout;