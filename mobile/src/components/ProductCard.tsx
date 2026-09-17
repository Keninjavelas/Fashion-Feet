import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../api/types';
import { useTheme } from '../site/SiteProvider';
import { SPACING } from '../theme/theme';
import { Badge, readFlagLabels } from './Badge';
import { PriceBlock } from './PriceBlock';
import { ProductImage } from './ProductImage';

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const theme = useTheme();
  const flagLabels = readFlagLabels(product.flags);
  const firstImage = product.images.length > 0 ? product.images[0] : null;

  const metaParts: string[] = [product.category];
  if (product.gender.length > 0) metaParts.push(product.gender);
  if (product.occasion !== null && product.occasion.length > 0) metaParts.push(product.occasion);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${metaParts.join(', ')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: theme.cardRadius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <ProductImage url={firstImage} height={150} label={product.title} />
      <View style={styles.body}>
        {flagLabels.length > 0 ? (
          <View style={styles.badges}>
            {flagLabels.map((label) => (
              <Badge key={label} label={label} tone={label === 'Featured' ? 'accent' : 'neutral'} />
            ))}
          </View>
        ) : null}
        <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
          {product.title}
        </Text>
        <Text numberOfLines={1} style={[styles.meta, { color: theme.textMuted }]}>
          {metaParts.join(' · ')}
        </Text>
        <PriceBlock product={product} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    overflow: 'hidden',
  },
  body: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    minHeight: 38,
  },
  meta: {
    fontSize: 11,
  },
});
