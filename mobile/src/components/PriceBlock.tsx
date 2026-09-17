import { StyleSheet, Text, View } from 'react-native';
import type { Product } from '../api/types';
import { formatPrice } from '../lib/format';
import { useTheme } from '../site/SiteProvider';
import { SPACING } from '../theme/theme';

/**
 * Price rendering, driven only by the contract:
 *   effectivePrice  what the customer pays (server-derived, never re-derived here)
 *   price           the list price, struck through only when a promo is cheaper
 *   discount        optional percentage the server already computed
 */
export function PriceBlock({ product, size = 'card' }: { product: Product; size?: 'card' | 'detail' }) {
  const theme = useTheme();
  const hasPromo = product.promoPrice !== null && product.promoPrice < product.price;
  const priceText = size === 'detail' ? styles.detailPrice : styles.cardPrice;
  const strikeText = size === 'detail' ? styles.detailStrike : styles.cardStrike;

  return (
    <View style={styles.row}>
      <Text style={[priceText, { color: theme.text }]}>{formatPrice(product.effectivePrice)}</Text>
      {hasPromo ? (
        <Text style={[strikeText, { color: theme.textMuted }]}>{formatPrice(product.price)}</Text>
      ) : null}
      {hasPromo && product.discount !== null && product.discount > 0 ? (
        <Text style={[styles.discount, { color: theme.primary }]}>{`${Math.round(product.discount)}% off`}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardStrike: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailStrike: {
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 12,
    fontWeight: '700',
  },
});
