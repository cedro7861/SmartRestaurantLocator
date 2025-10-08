import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Theme } from '../../lib/colors';

interface PrivacyPolicyProps {
  navigation: any;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ navigation }) => {
  const { colors, spacing, typography } = Theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>

        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last updated: October 8, 2025
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We collect information you provide directly to us, such as when you create an account,
          make a reservation, or contact us for support. This may include your name, email address,
          phone number, and payment information.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We use the information we collect to provide, maintain, and improve our services,
          process transactions, send you technical notices and support messages, and communicate
          with you about products, services, and promotional offers.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Information Sharing</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We do not sell, trade, or otherwise transfer your personal information to third parties
          without your consent, except as described in this policy. We may share your information
          with trusted third-party service providers who assist us in operating our website and
          conducting our business.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Security</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We implement appropriate security measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction. However, no method of
          transmission over the internet is 100% secure.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Your Rights</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You have the right to access, update, or delete your personal information. You may also
          opt out of receiving promotional communications from us by following the unsubscribe
          instructions in those communications.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Cookies</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We use cookies and similar technologies to enhance your experience on our platform,
          analyze usage, and assist in our marketing efforts. You can control cookie settings
          through your browser preferences.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Changes to This Policy</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We may update this Privacy Policy from time to time. We will notify you of any changes
          by posting the new policy on this page and updating the "Last updated" date.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          If you have any questions about this Privacy Policy, please contact us at:
          {'\n'}Email: privacy@smartrestaurant.com
          {'\n'}Phone: +1 (555) 123-4567
        </Text>
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
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  lastUpdated: {
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  paragraph: {
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
  },
});

export default PrivacyPolicy;