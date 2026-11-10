import { useState, useEffect, type ReactNode } from 'react';
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
import { useLocalSearchParams } from 'expo-router';
import { useStores } from '../../src/api/hooks';
import { Notice } from '../../src/components/StateView';
import { useTheme } from '../../src/site/SiteProvider';
import { SPACING } from '../../src/theme/theme';
import { API_BASE_URL, IS_USING_FALLBACK_BASE_URL } from '../../src/api/client';
import { readRouteParam } from '../../src/lib/params';

/**
 * Contact.
 *
 * /api/v1 is read-only (GET only) and this app has no other backend,
 * so the mobile contact form cannot transmit an enquiry by itself.
 * Instead, once the customer's details are valid, the "Submit" button
 * opens the studio website /contact page with the entered fields
 * pre-filled via query parameters. That is the ONLY channel that
 * actually delivers an enquiry (the web form POSTs through the
 * src/app/actions/createEnquiry.ts server action).
 *
 * If the app is using the localhost development fallback URL, the
 * button stays disabled for submission and the customer is directed to
 * the published store phone/email links instead.
 */
export default function ContactScreen() {
  const theme = useTheme();
  const stores = useStores();
  const params = useLocalSearchParams();
  const routeName = readRouteParam(params.name);
  const routeEmail = readRouteParam(params.email);
  const routeMessage = readRouteParam(params.message);

  const [name, setName] = useState(routeName ?? '');
  const [email, setEmail] = useState(routeEmail ?? '');
  const [message, setMessage] = useState(routeMessage ?? '');
  const [attempted, setAttempted] = useState(false);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (routeName) setName(routeName);
  }, [routeName]);
  useEffect(() => {
    if (routeEmail) setEmail(routeEmail);
  }, [routeEmail]);
  useEffect(() => {
    if (routeMessage) setMessage(routeMessage);
  }, [routeMessage]);

  const nameError = name.trim().length === 0 ? 'Please enter your name.' : null;
  const emailError = EMAIL_PATTERN.test(email.trim()) ? null : 'Please enter a valid email address.';
  const messageError = message.trim().length === 0 ? 'Please write a short message.' : null;
  const isValid = nameError === null && emailError === null && messageError === null;
  const canRedirect = isValid && !IS_USING_FALLBACK_BASE_URL;

  const contactStore =
    (stores.data ?? []).find(
      (store) => store.email !== null || store.phone !== null
    ) ?? null;

  const handleSubmit = () => {
    setAttempted(true);
    if (!canRedirect) return;
    const params = new URLSearchParams();
    params.set('name', name.trim());
    params.set('email', email.trim());
    params.set('message', message.trim());
    const url = `${API_BASE_URL}/contact?${params.toString()}`;
    setRedirected(true);
    void Linking.openURL(url).catch(() => setRedirected(false));
  };

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
          title="Enquiries are delivered through the studio website"
          message="The catalogue app is read-only. Submitting below opens Fashion Feet's published contact page with your name, email and message pre-filled so you can confirm and send in one tap."
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
            accessibilityState={{ disabled: !canRedirect }}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submit,
              {
                backgroundColor: canRedirect ? theme.primary : theme.surfaceMuted,
                borderRadius: theme.buttonRadius,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            disabled={!canRedirect}
          >
            <Text
              style={[
                styles.submitLabel,
                { color: canRedirect ? theme.onPrimary : theme.textMuted },
              ]}
            >
              {IS_USING_FALLBACK_BASE_URL
                ? 'Website contact not reachable in dev build'
                : 'Open contact page & send'}
            </Text>
          </Pressable>

          {IS_USING_FALLBACK_BASE_URL ? (
            <Text style={[styles.caption, { color: theme.textMuted }]}>
              This development build points at the Android emulator loopback
              address. Set EXPO_PUBLIC_API_BASE_URL to the published studio
              website domain and the button above will open the real contact
              form. In the meantime, use the official email channels below.
            </Text>
          ) : (
            <Text style={[styles.caption, { color: theme.textMuted }]}>
              Tapping opens the Fashion Feet website contact page in your
              browser with the fields above pre-filled — confirm and send
              there and the studio will receive your enquiry.
            </Text>
          )}

          {attempted && isValid && redirected ? (
            <Notice
              tone="info"
              title="Opening the website contact page…"
              message="Your enquiry is not sent from this app itself. Finish the
              one-tap confirm in the browser tab and the studio will reply
              via the email address you entered."
            />
          ) : null}
          {attempted && isValid && !IS_USING_FALLBACK_BASE_URL && !redirected ? (
            <Notice
              tone="warning"
              title="Browser could not be opened"
              message="Your details are valid, but the device would not open a
              browser window. Please use the direct email channels below, or
              visit the studio website's /contact page manually."
              actionLabel="Retry"
              onAction={handleSubmit}
            />
          ) : null}
          {attempted && !isValid ? (
            <Notice
              tone="warning"
              title="Please fix the highlighted fields"
              message="All three fields are required before the website contact
              page can open with your details pre-filled."
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
