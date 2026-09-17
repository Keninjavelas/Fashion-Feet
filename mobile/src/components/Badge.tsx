import { StyleSheet, Text, View } from 'react-native';
import type { ProductFlags } from '../api/types';
import { useTheme } from '../site/SiteProvider';
import { SPACING } from '../theme/theme';

/**
 * Product flags and store statuses share one visual treatment. Flags are read
 * from `product.flags` — the four booleans the API actually publishes.
 */
export function readFlagLabels(flags: ProductFlags): string[] {
  const labels: string[] = [];
  if (flags.featured) labels.push('Featured');
  if (flags.bestSeller) labels.push('Bestseller');
  if (flags.newArrival) labels.push('New');
  if (flags.festivalExclusive) labels.push('Festival');
  return labels;
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'positive' }) {
  const theme = useTheme();
  const background = tone === 'accent' ? theme.gold : tone === 'positive' ? theme.primary : theme.surfaceMuted;
  const color = tone === 'neutral' ? theme.textMuted : theme.onPrimary;
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
