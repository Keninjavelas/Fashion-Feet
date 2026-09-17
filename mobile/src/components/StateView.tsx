import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL, type ApiError } from '../api/client';
import { useTheme } from '../site/SiteProvider';
import { SPACING } from '../theme/theme';

/**
 * The three states every data-backed screen must be able to render:
 * loading, empty and error. Keeping them in one place is what stops a screen
 * from ever falling through to a blank view.
 */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={theme.primary} />
      <Text style={[styles.mutedText, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function describeError(error: ApiError): { title: string; hint: string | null } {
  if (error.status === 429) {
    const hint =
      error.retryAfterSeconds === null
        ? 'The API is rate-limiting this device. Please wait a moment before trying again.'
        : `The API is rate-limiting this device. Try again in about ${error.retryAfterSeconds} seconds.`;
    return { title: 'Too many requests', hint };
  }
  if (error.status === 404) return { title: 'Not found', hint: null };
  if (error.status >= 500) {
    return { title: 'The server had a problem', hint: 'This is on the API side, not your connection.' };
  }
  if (error.status === 0) {
    return { title: 'Cannot reach the API', hint: `Base URL in use: ${API_BASE_URL}` };
  }
  return { title: 'Something went wrong', hint: null };
}

export function ErrorState({
  error,
  onRetry,
  title,
}: {
  error: ApiError;
  onRetry?: (() => void) | undefined;
  title?: string | undefined;
}) {
  const theme = useTheme();
  const described = describeError(error);
  return (
    <View style={styles.centered}>
      <Text style={[styles.stateTitle, { color: theme.text }]}>{title ?? described.title}</Text>
      <Text style={[styles.stateBody, { color: theme.textMuted }]}>{error.message}</Text>
      {described.hint !== null ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>{described.hint}</Text>
      ) : null}
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, borderRadius: theme.buttonRadius, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
}) {
  const theme = useTheme();
  return (
    <View style={styles.centered}>
      <Text style={[styles.stateTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.stateBody, { color: theme.textMuted }]}>{message}</Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, borderRadius: theme.buttonRadius, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * A non-blocking message. Used when part of a screen failed but the rest is
 * still worth showing (a stale page, a rate-limit notice).
 */
export function Notice({
  tone = 'info',
  title,
  message,
  actionLabel,
  onAction,
}: {
  tone?: 'info' | 'warning';
  title: string;
  message: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
}) {
  const theme = useTheme();
  const accent = tone === 'warning' ? theme.danger : theme.gold;
  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: theme.surface, borderColor: theme.border, borderLeftColor: accent, borderRadius: theme.cardRadius },
      ]}
    >
      <Text style={[styles.noticeTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.stateBody, { color: theme.textMuted }]}>{message}</Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.linkButton}>
          <Text style={[styles.linkLabel, { color: theme.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
  },
  mutedText: {
    fontSize: 13,
  },
  button: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: SPACING.xs,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  notice: {
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
