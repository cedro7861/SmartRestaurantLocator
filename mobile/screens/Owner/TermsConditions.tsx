import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Theme } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';

interface TermsConditionsProps {
  navigation: any;
}

const TermsConditions: React.FC<TermsConditionsProps> = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography } = Theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last updated: December 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            By accessing and using the Smart Restaurant Locator mobile application ("App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            2. Use License
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Permission is granted to temporarily download one copy of the App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Modify or copy the materials
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Use the materials for any commercial purpose or for any public display
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Attempt to decompile or reverse engineer any software contained in the App
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            3. Restaurant Owner Responsibilities
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            As a restaurant owner, you are responsible for:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Maintaining accurate and up-to-date restaurant information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Ensuring menu items are accurately priced and described
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Processing orders in a timely and professional manner
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Maintaining appropriate business licenses and permits
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Ensuring food safety and quality standards are met
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Providing accurate delivery time estimates
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            4. Service Description
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The Smart Restaurant Locator App provides restaurant owners with:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Restaurant profile management
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Menu management and pricing tools
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Order management and tracking
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Delivery coordination services
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Analytics and reporting tools
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            5. Payment Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            All payments for orders are processed securely through our payment gateway. Restaurant owners are responsible for setting competitive prices in Rwandan Francs (RWF). The platform may charge service fees for using the delivery coordination services.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            6. Content Ownership
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Restaurant owners retain ownership of their restaurant information, menu content, and branding. However, by using the platform, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content for the purpose of providing our services.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            7. Termination
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            8. Limitation of Liability
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            In no event shall Smart Restaurant Locator or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the App.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            9. Governing Law
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            These terms and conditions are governed by and construed in accordance with the laws of Rwanda, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            10. Contact Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Text>
          <Text style={[styles.contactInfo, { color: colors.primary }]}>
            Email: support@smartrestaurantlocator.rw{'\n'}
            Phone: +250 788 123 456{'\n'}
            Address: Kigali, Rwanda
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  contentCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lastUpdated: {
    fontSize: Theme.typography.fontSize.sm,
    fontStyle: 'italic',
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  paragraph: {
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
  },
  bulletPoint: {
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 24,
    marginLeft: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  contactInfo: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    lineHeight: 24,
    marginTop: Theme.spacing.sm,
  },
});

export default TermsConditions;