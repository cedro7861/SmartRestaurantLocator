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
            2. Delivery Personnel Responsibilities
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            As a delivery personnel, you are responsible for:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Maintaining valid identification and transportation documents
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Delivering orders safely, promptly, and in good condition
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Maintaining professional conduct with customers and restaurant staff
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Reporting any issues with orders immediately through the app
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Following traffic laws and safety regulations at all times
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Keeping delivery vehicle in good working condition
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            3. Service Description
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The Smart Restaurant Locator App provides delivery personnel with:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Real-time delivery assignments and tracking
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • GPS navigation and route optimization
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Earnings tracking and payment processing
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Customer communication tools
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Delivery history and performance analytics
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            4. Payment Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Delivery personnel will receive payment for completed deliveries according to the platform's fee structure. Payments are processed weekly and may be subject to service fees. All earnings are displayed in Rwandan Francs (RWF) and are paid through approved payment methods.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            5. Insurance and Liability
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Delivery personnel are responsible for maintaining adequate insurance coverage for their vehicle and activities. The platform provides basic liability coverage for deliveries, but delivery personnel remain responsible for any negligence or misconduct during delivery activities.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            6. Code of Conduct
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Delivery personnel must maintain professional standards including:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Courteous and respectful communication
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Proper handling of food and beverages
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Accurate delivery of orders as described
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Timely responses to customer inquiries
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            7. Termination
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may terminate or suspend your account and delivery privileges immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            8. Limitation of Liability
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            In no event shall Smart Restaurant Locator or its suppliers be liable for any damages arising out of the use or inability to use the delivery services, including but not limited to lost earnings or delivery-related incidents.
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