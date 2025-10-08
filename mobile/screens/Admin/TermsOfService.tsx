import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Theme } from '../../lib/colors';

interface TermsOfServiceProps {
  navigation: any;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ navigation }) => {
  const { colors, spacing, typography } = Theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>

        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last updated: October 8, 2025
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By accessing and using Smart Restaurant Locator, you accept and agree to be bound by
          the terms and provision of this agreement. If you do not agree to abide by the above
          terms, please do not use this service.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Use License</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Permission is granted to temporarily use Smart Restaurant Locator for personal,
          non-commercial transitory viewing only. This is the grant of a license, not a transfer
          of title, and under this license you may not:
          {'\n'}• Modify or copy the materials
          {'\n'}• Use the materials for any commercial purpose
          {'\n'}• Attempt to decompile or reverse engineer any software
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Accounts</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          When you create an account with us, you must provide information that is accurate,
          complete, and current at all times. You are responsible for safeguarding the password
          and for all activities that occur under your account.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Prohibited Uses</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You may not use our service:
          {'\n'}• For any unlawful purpose or to solicit others to perform unlawful acts
          {'\n'}• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
          {'\n'}• To infringe upon or violate our intellectual property rights or the intellectual property rights of others
          {'\n'}• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Content</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Our service allows you to post, link, store, share and otherwise make available certain
          information, text, graphics, or other material. You are responsible for content that you
          post to the service, including its legality, reliability, and appropriateness.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Termination</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We may terminate or suspend your account and bar access to the service immediately,
          without prior notice or liability, under our sole discretion, for any reason whatsoever
          and without limitation, including but not limited to a breach of the Terms.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          In no event shall Smart Restaurant Locator, nor its directors, employees, partners,
          agents, suppliers, or affiliates, be liable for any indirect, incidental, special,
          consequential, or punitive damages, including without limitation, loss of profits,
          data, use, goodwill, or other intangible losses.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Governing Law</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          These Terms shall be interpreted and governed by the laws of the jurisdiction in which
          Smart Restaurant Locator operates, without regard to its conflict of law provisions.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any
          time. If a revision is material, we will provide at least 30 days notice prior to any
          new terms taking effect.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Contact Information</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          If you have any questions about these Terms of Service, please contact us at:
          {'\n'}Email: legal@smartrestaurant.com
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

export default TermsOfService;