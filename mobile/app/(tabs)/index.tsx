import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCategories, useProductFeed } from '../../src/api/hooks';
import type { Product, SiteHomepageSection } from '../../src/api/types';
import { Chip } from '../../src/components/Chip';
import { ProductCard } from '../../src/components/ProductCard';
import { ProductImage } from '../../src/components/ProductImage';
import { SectionHeading } from '../../src/components/SectionHeading';
import { EmptyState, ErrorState, LoadingState, Notice } from '../../src/components/StateView';
import { nativeRouteForCta } from '../../src/lib/cta';
import { useSiteConfig, useTheme } from '../../src/site/SiteProvider';
import { SPACING } from '../../src/theme/theme';

/**
 * Home = the merchandiser-authored hero from /api/v1/site + products from
 * /api/v1/products. The two are independent: if /site fails, the catalogue still
 * renders (with a notice); if the catalogue fails, the hero still renders.
 *
 * "Featured" here means `flags.featured`, which the API publishes. The products
 * endpoint has no featured filter parameter, so the flag is applied client-side
 * to the first page — and when nothing is flagged the newest arrivals are shown
 * under an honest heading instead of pretending to be featured.
 */
export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const site = useSiteConfig();
  const categories = useCategories();
  const feed = useProductFeed({ category: null, occasion: null, query: '' });

  const heroSection = useMemo<SiteHomepageSection | null>(() => {
    const hero = site.sections.find((section) => section.type === 'HERO_BANNER');
    if (hero) return hero;
    return site.sections.length > 0 ? site.sections[0] : null;
  }, [site.sections]);

  const featured = useMemo(() => feed.items.filter((item) => item.flags.featured), [feed.items]);
  const highlights: Product[] = featured.length > 0 ? featured : feed.items.slice(0, 8);
  const highlightHeading = featured.length > 0 ? 'Featured pieces' : 'Latest additions';
  const highlightSubtitle =
    featured.length > 0
      ? 'Flagged as featured by the studio.'
      : feed.items.length > 0
        ? 'The most recent pieces in the catalogue.'
        : null;

  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((category) => ({ value: category.slug, label: category.name })),
    [categories.data]
  );

  const refreshAll = () => {
    feed.reload();
    site.reload();
    categories.reload();
  };

  const listHeader = (
    <View style={styles.header}>
      {heroSection !== null ? (
        <Hero section={heroSection} />
      ) : site.error !== null ? (
        <Notice
          tone="warning"
          title="Storefront content unavailable"
          message={site.error.message}
          actionLabel="Retry"
          onAction={site.reload}
        />
      ) : (
        <LoadingState label="Loading the storefront…" />
      )}

      {categories.error !== null ? (
        <Notice
          tone="warning"
          title="Categories unavailable"
          message={categories.error.message}
          actionLabel="Retry"
          onAction={categories.reload}
        />
      ) : null}

      {categoryOptions.length > 0 ? (
        <View style={styles.categoryStrip}>
          <Text style={[styles.stripLabel, { color: theme.textMuted }]}>Shop by category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {categoryOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={false}
                onPress={() => router.push(`/shop?category=${encodeURIComponent(option.value)}`)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {feed.error !== null && feed.items.length > 0 ? (
        <Notice
          tone="warning"
          title="Showing the last loaded page"
          message={feed.error.message}
          actionLabel="Retry"
          onAction={feed.reload}
        />
      ) : null}

      <SectionHeading
        eyebrow="Fashion Feet"
        title={highlightHeading}
        subtitle={highlightSubtitle}
      />
    </View>
  );

  const listEmpty =
    feed.status === 'loading' ? (
      <LoadingState label="Loading the collection…" />
    ) : feed.status === 'error' && feed.error !== null ? (
      <ErrorState error={feed.error} onRetry={feed.reload} />
    ) : (
      <EmptyState
        title="Nothing published yet"
        message="The catalogue is empty right now. Pull down to refresh, or browse again in a moment."
        actionLabel="Refresh"
        onAction={feed.reload}
      />
    );

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      data={highlights}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={feed.refreshing || site.refreshing || categories.refreshing}
          onRefresh={refreshAll}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    />
  );
}

function Hero({ section }: { section: SiteHomepageSection }) {
  const theme = useTheme();
  const router = useRouter();
  const route = nativeRouteForCta(section.ctaLink);
  const hasImage = typeof section.image === 'string' && section.image.trim().length > 0;
  const hasCta = route !== null && typeof section.ctaText === 'string' && section.ctaText.trim().length > 0;

  return (
    <View style={[styles.hero, { borderRadius: theme.cardRadius }]}>
      {hasImage ? <ProductImage url={section.image} height={200} label={section.title} /> : null}
      <View style={[styles.heroBody, { backgroundColor: theme.primary }]}>
        {section.badge ? (
          <Text style={[styles.heroBadge, { color: theme.gold }]}>{section.badge.toUpperCase()}</Text>
        ) : null}
        <Text style={[styles.heroTitle, { color: theme.onPrimary }]}>{section.title}</Text>
        {section.subtitle ? (
          <Text style={[styles.heroSubtitle, { color: theme.onPrimary }]}>{section.subtitle}</Text>
        ) : null}
        {section.description ? (
          <Text style={[styles.heroDescription, { color: theme.onPrimary }]}>{section.description}</Text>
        ) : null}
        {hasCta && route !== null && section.ctaText !== undefined ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(route)}
            style={({ pressed }) => [
              styles.heroCta,
              { backgroundColor: theme.gold, borderRadius: theme.buttonRadius, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.heroCtaLabel, { color: theme.onPrimary }]}>{section.ctaText}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  header: {
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  gridRow: {
    gap: SPACING.md,
  },
  hero: {
    overflow: 'hidden',
  },
  heroBody: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.9,
  },
  heroCta: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  heroCtaLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryStrip: {
    gap: SPACING.sm,
  },
  stripLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
