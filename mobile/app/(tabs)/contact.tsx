import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useStores } from '../../src/api/hooks';
import { Notice } from '../../src/components/StateView';
import { useTheme } from '../../src/site/SiteProvider';
import { SPACING } from '../../src/theme/theme';

/**
 * Contact.
 *
 * IMPORTANT, and stated on screen as well as here: /api/v1 is read-only (GET
 * only) and this app has no other backend, so the enquiry form does NOT send
 * anything anywhere. It validates locally and then says so. There is deliberately
 * no "message sent" confirmation, because nothing is sent.
 *
 * The real contact channels are the store phone/email/WhatsApp values published
 * by /api/v1/stores, which is why they are pulled in below.
 */
export default function ContactScreen() {
  const theme = useTheme();
  const stores = useStores();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [attempted, setAttempted] = useState(false);

  const nameError = name.trim().length === 0 ? 'Please enter your name.' : null;
  const emailError = EMAIL_PATTERN.test(email.trim()) ? null : 'Please enter a valid email address.';
  const messageError = message.trim().length === 0 ? 'Please write a short message.' : null;
  const isValid = nameError === null && emailError === null && messageError === null;

  const contactStore =
    (stores.data ?? []).find(
      (store) => store.email !== null || store.phone !== null || store.whatsapp !== null
    ) ?? null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Notice
          title="This form does not send anything yet"
          message="The public API this app talks to is read-only (GET only), so there is no endpoint to deliver an enquiry. Submitting below only checks your details on this device — nothing is transmitted and nothing is stored. Use the studio contact details in this screen instead."
        />

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.cardRadius },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>Write to the studio</Text>

          <Field label="Your name" error={attempted ? nameError : null}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={theme.textMuted}
              autoCorrect={false}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
          </Field>

          <Field label="Email" error={attempted ? emailError : null}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
          </Field>

          <Field label="Message" error={attempted ? messageError : null}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what you are looking for"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={5}
              style={[styles.input, styles.multiline, { borderColor: theme.border, color: theme.text }]}
            />
          </Field>

          <Pressable
            accessibilityRole="button"
            onPress={() => setAttempted(true)}
            style={({ pressed }) => [
              styles.submit,
              { backgroundColor: theme.primary, borderRadius: theme.buttonRadius, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.submitLabel, { color: theme.onPrimary }]}>Submit enquiry</Text>
          </Pressable>
          <Text style={[styles.caption, { color: theme.textMuted }]}>
            Submitting validates the form only. No message leaves this device.
          </Text>

          {attempted && isValid ? (
            <Notice
              tone="warning"
              title="Not sent"
              message="Your details are valid, but this build has nowhere to deliver them. Nothing was transmitted. Please use the phone, email or WhatsApp details below."
            />
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.cardRadius },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>Studio contact details</Text>
          {stores.status === 'loading' ? (
            <Text style={[styles.caption, { color: theme.textMuted }]}>Loading published stores…</Text>
          ) : null}
          {stores.error !== null ? (
            <Notice
              tone="warning"
              title="Contact details unavailable"
              message={stores.error.message}
              actionLabel="Retry"
              onAction={stores.reload}
            />
          ) : null}
          {stores.status === 'success' && contactStore === null ? (
            <Text style={[styles.caption, { color: theme.textMuted }]}>
              No store has published a phone number or email address yet. Please check the Stores and FAQ
              screens for what is available.
            </Text>
          ) : null}
          {contactStore !== null ? (
            <View style={styles.contactBlock}>
              <Text style={[styles.body, { color: theme.text }]}>{contactStore.name}</Text>
              <Text style={[styles.caption, { color: theme.textMuted }]}>
                {[contactStore.city, contactStore.state].filter(Boolean).join(', ')}
              </Text>
              {contactStore.phone ? (
                <ContactLink label={contactStore.phone} onPress={() => openLink(`tel:${contactStore.phone ?? ''}`)} />
              ) : null}
              {contactStore.email ? (
                <ContactLink
                  label={contactStore.email}
                  onPress={() => openLink(`mailto:${contactStore.email ?? ''}`)}
                />
              ) : null}
              {contactStore.whatsapp ? (
                <ContactLink
                  label={`WhatsApp ${contactStore.whatsapp}`}
                  onPress={() =>
                    openLink(`https://wa.me/${(contactStore.whatsapp ?? '').replace(/[^\d]/g, '')}`)
                  }
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function openLink(url: string): void {
  void Linking.openURL(url).catch(() => undefined);
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | null;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
      {children}
      {error !== null ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

function ContactLink({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
      <Text style={[styles.linkLabel, { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  card: {
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  field: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
  },
  submit: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
  },
  body: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactBlock: {
    gap: SPACING.xs,
  },
  link: {
    paddingVertical: SPACING.xs,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
