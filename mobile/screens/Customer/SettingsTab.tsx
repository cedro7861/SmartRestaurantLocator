import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView, // Use SafeAreaView for better layout on modern devices
  Alert,
} from "react-native";
// Assuming Theme is exported from the same location as Colors
import { Theme } from "../../lib/colors";
import { useTheme } from "../../lib/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

// --- Type Definitions (Kept from original) ---

interface SettingsTabProps {
  navigation: any;
  user: {
    name: string;
    email: string;
    role: string;
  }; // Defined user structure for the header
  onLogout: () => void;
}

// --- Component Start ---

const SettingsTab: React.FC<SettingsTabProps> = ({
  navigation,
  user,
  onLogout,
}) => {
  // Use theme context
  const { theme, mode, setMode, isDark } = useTheme();
  const { spacing, borderRadius, typography } = Theme;
  const colors = theme;

  // --- Setting Options Data ---

  const accountOptions = [
    {
      title: "Profile",
      icon: "person-outline",
      onPress: () => navigation.navigate("Profile"),
    },
    {
      title: "Change Password",
      icon: "lock-closed-outline",
      onPress: () => navigation.navigate("ChangePassword"),
    },
    {
      title: "Notifications",
      icon: "notifications-outline",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      title: "Theme",
      icon: isDark ? "moon-outline" : "sunny-outline",
      onPress: () => {
        const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
        setMode(nextMode);
      },
      subtitle: mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark',
    },
  ];

  const supportOptions = [
    {
      title: "Terms & Conditions",
      icon: "document-text-outline",
      onPress: () => navigation.navigate("TermsConditions"),
    },
    {
      title: "Contact Support",
      icon: "help-circle-outline",
      onPress: () => navigation.navigate("ContactSupport"),
    },
  ];

  // --- Helper Renderer Function ---

  const renderSettingItem = (
    item: (typeof accountOptions)[0], // Use any option type for flexibility
    index: number
  ) => (
    <TouchableOpacity
      key={index}
      // Apply surface color and full width border radius from theme
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          borderColor: colors.border,
        },
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        {/* Use a subtle background for the icon for visual pop */}
        <View
          style={[
            styles.iconBackground,
            { backgroundColor: colors.primaryLight + "30" }, // 30 is for 30% opacity
          ]}
        >
          <Ionicons name={item.icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  // --- Main Component Render ---

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
        <Text style={[styles.title, { color: colors.text }]}>
          Settings
        </Text>

        {/* PROFILE HEADER - New Component for Professional Look */}
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
                  backgroundColor: colors.customer,
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
        {/* END PROFILE HEADER */}

        {/* ACCOUNT SECTION */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Account
        </Text>
        <View style={styles.settingsList}>
          {accountOptions.map(renderSettingItem)}
        </View>

        {/* SUPPORT SECTION */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Support
        </Text>
        <View style={styles.settingsList}>
          {supportOptions.map(renderSettingItem)}
        </View>

        {/* LOGOUT BUTTON - Made prominent */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.error + "90", // Red with opacity
              borderRadius: borderRadius.md,
              marginTop: spacing.xl,
              marginBottom: spacing.xxl,
            },
          ]}
          onPress={() => {
            Alert.alert(
              'Logout Confirmation',
              'Are you sure you want to logout from your account?',
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Yes, Logout',
                  style: 'destructive',
                  onPress: () => {
                    onLogout();
                  }
                },
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.text} />
          <Text style={[styles.logoutText, { color: colors.text }]}>
            Logout
          </Text>
        </TouchableOpacity>

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
  title: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xl,
    textAlign: "center",
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
  // --- List & Item Styles ---
  sectionHeader: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    paddingLeft: Theme.spacing.sm,
    textTransform: "uppercase",
  },
  settingsList: {
    // Grouping list items with a subtle shadow/depth effect
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBackground: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.md,
  },
  settingTitle: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.regular,
    marginTop: 2,
  },
  // --- Logout Button Styles ---
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.md,
  },
  logoutText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginLeft: Theme.spacing.sm,
  },
  // --- Footer Style ---
  versionText: {
    fontSize: Theme.typography.fontSize.xs,
    textAlign: "center",
    paddingBottom: Theme.spacing.xl,
  },
});

export default SettingsTab;