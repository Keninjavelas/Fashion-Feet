import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../site/SiteProvider';
import { SPACING } from '../theme/theme';

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string | null | undefined;
  eyebrow?: string | null | undefined;
}) {
  const theme = useTheme();
  const hasSubtitle = typeof subtitle === 'string' && subtitle.trim().length > 0;
  const hasEyebrow = typeof eyebrow === 'string' && eyebrow.trim().length > 0;

  return (
    <View style={styles.wrapper}>
      {hasEyebrow ? (
        <Text style={[styles.eyebrow, { color: theme.gold }]}>{eyebrow.toUpperCase()}</Text>
      ) : null}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {hasSubtitle ? <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.xs,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
});
