import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useProduct } from '../../src/api/hooks';
import { Badge, readFlagLabels } from '../../src/components/Badge';
import { PriceBlock } from '../../src/components/PriceBlock';
import { ProductImage } from '../../src/components/ProductImage';
import { SectionHeading } from '../../src/components/SectionHeading';
import { ErrorState, LoadingState } from '../../src/components/StateView';
import { formatDate } from '../../src/lib/format';
import { readRouteParam } from '../../src/lib/params';
import { useTheme } from '../../src/site/SiteProvider';
import { SPACING } from '../../src/theme/theme';

/**
 * Product detail, looked up by cuid id OR by sku — the API has no slug field.
 *
 * Every optional block (sizes, colours, material, care, craftsmanship, size
 * guide, images) is rendered only when the API actually returned data for it.
 * The seeded catalogue currently has no sizes and no colours, so those sections
 * are expected to be absent — that is a valid state, not an error.
 */
export default function ProductDetailScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const idOrSku = readRouteParam(params.id);
  const product = useProduct(idOrSku);
  const [activeImage, setActiveImage] = useState(0);

  const data = product.data;
  const images = data?.images ?? [];
  const pageWidth = Math.max(width - SPACING.lg * 2, 1);

  return (
    <>
      <Stack.Screen options={{ title: data?.title ?? 'Product' }} />
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.content}
        testID="product-detail-scroll"
      >
        {product.status === 'loading' ? <LoadingState label="Loading product…" /> : null}

        {product.status === 'error' && product.error !== null ? (
          <ErrorState
            error={product.error}
            onRetry={product.reload}
            title={product.error.status === 404 ? 'Product not found' : undefined}
          />
        ) : null}

        {data !== null ? (
          <>
            {images.length > 0 ? (
              <View style={styles.carousel}>
                <FlatList
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(url, index) => `${index}-${url}`}
                  onMomentumScrollEnd={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    setActiveImage(Math.min(Math.max(Math.round(offsetX / pageWidth), 0), images.length - 1));
                  }}
                  renderItem={({ item }) => (
                    <View style={{ width: pageWidth }}>
                      <ProductImage
                        url={item}
                        height={320}
                        borderRadius={theme.cardRadius}
                        label={data.title}
                      />
                    </View>
                  )}
                />
                {images.length > 1 ? (
                  <View style={styles.dots}>
                    {images.map((url, index) => (
                      <View
                        key={`dot-${index}-${url}`}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: index === activeImage ? theme.primary : theme.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            ) : (
              <ProductImage url={null} height={240} borderRadius={theme.cardRadius} label={data.title} />
            )}

            <View style={styles.headerBlock}>
              <View style={styles.badgeRow}>
                {readFlagLabels(data.flags).map((label) => (
                  <Badge key={label} label={label} tone={label === 'Featured' ? 'accent' : 'neutral'} />
                ))}
              </View>
              <Text style={[styles.title, { color: theme.text }]}>{data.title}</Text>
              <Text style={[styles.meta, { color: theme.textMuted }]}>
                {[data.category, data.gender, data.occasion].filter(Boolean).join(' · ')}
              </Text>
              <PriceBlock product={data} size="detail" />
            </View>

            <Text style={[styles.description, { color: theme.text }]}>{data.description}</Text>

            {data.craftsmanship ? (
              <View
                style={[
                  styles.note,
                  { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.cardRadius },
                ]}
              >
                <SectionHeading title="Craftsmanship" />
                <Text style={[styles.noteBody, { color: theme.textMuted }]}>{data.craftsmanship}</Text>
              </View>
            ) : null}

            {/* Sizes and colours hide themselves when the API returns none. */}
            {data.sizes.length > 0 ? (
              <View style={styles.section}>
                <SectionHeading title="Available sizes" />
                <View style={styles.tagRow}>
                  {data.sizes.map((size) => (
                    <Tag key={`size-${size}`} label={size} />
                  ))}
                </View>
              </View>
            ) : null}

            {data.colors.length > 0 ? (
              <View style={styles.section}>
                <SectionHeading title="Available colours" />
                <View style={styles.tagRow}>
                  {data.colors.map((color) => (
                    <Tag key={`color-${color}`} label={color} />
                  ))}
                </View>
              </View>
            ) : null}

            {data.sizes.length > 0 || data.colors.length > 0 ? (
              <Text style={[styles.caption, { color: theme.textMuted }]}>
                Sizes and colours are listed for information. This app is a browsing companion only — it
                does not place orders.
              </Text>
            ) : null}

            {data.sizeGuide ? (
              <View style={styles.section}>
                <SectionHeading title="Size guide" />
                <Text style={[styles.noteBody, { color: theme.textMuted }]}>{data.sizeGuide}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <SectionHeading title="Details" />
              <DetailRow label="Category" value={data.category} />
              <DetailRow label="Gender" value={data.gender} />
              {data.occasion ? <DetailRow label="Occasion" value={data.occasion} /> : null}
              {data.material ? <DetailRow label="Material" value={data.material} /> : null}
              {data.care ? <DetailRow label="Care" value={data.care} /> : null}
              {data.sku ? <DetailRow label="SKU" value={data.sku} /> : null}
              {formatDate(data.createdAt) !== null ? (
                <DetailRow label="Added" value={formatDate(data.createdAt) ?? ''} />
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

function Tag({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
      <Text style={[styles.tagLabel, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  carousel: {
    gap: SPACING.sm,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  headerBlock: {
    gap: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  meta: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  note: {
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  noteBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    gap: SPACING.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});
