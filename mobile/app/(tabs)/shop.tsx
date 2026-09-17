import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCategories, useOccasions, useProductFeed, PRODUCT_PAGE_SIZE } from '../../src/api/hooks';
import { ChipRow } from '../../src/components/Chip';
import { ProductCard } from '../../src/components/ProductCard';
import { EmptyState, ErrorState, LoadingState, Notice } from '../../src/components/StateView';
import { readRouteParam } from '../../src/lib/params';
import { useDebouncedValue } from '../../src/lib/useDebouncedValue';
import { useTheme } from '../../src/site/SiteProvider';
import { SPACING } from '../../src/theme/theme';

/**
 * Shop = the catalogue, filtered by category and occasion and paged with
 * limit/offset. Filters are sent as the slug or name the API accepts, and a
 * filter the API does not recognise yields an empty page — which is rendered as
 * "No matches", never as an unfiltered list.
 */
export default function ShopScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const routeCategory = readRouteParam(params.category);
  const routeOccasion = readRouteParam(params.occasion);

  const [category, setCategory] = useState<string | null>(routeCategory);
  const [occasion, setOccasion] = useState<string | null>(routeOccasion);
  const [searchText, setSearchText] = useState('');
  const query = useDebouncedValue(searchText, 400);

  // Arriving from Home with ?category=… (or ?occasion=…) applies that filter.
  useEffect(() => {
    if (routeCategory !== null) setCategory(routeCategory);
  }, [routeCategory]);
  useEffect(() => {
    if (routeOccasion !== null) setOccasion(routeOccasion);
  }, [routeOccasion]);

  const categories = useCategories();
  const occasions = useOccasions();
  const feed = useProductFeed({ category, occasion, query });

  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((item) => ({ value: item.slug, label: item.name })),
    [categories.data]
  );
  const occasionOptions = useMemo(
    () => (occasions.data ?? []).map((item) => ({ value: item.slug, label: item.name })),
    [occasions.data]
  );

  const hasActiveFilters = category !== null || occasion !== null || searchText.trim().length > 0;
  const clearFilters = () => {
    setCategory(null);
    setOccasion(null);
    setSearchText('');
  };

  const listHeader = (
    <View style={styles.header}>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search the catalogue"
        placeholderTextColor={theme.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search products"
        style={[
          styles.search,
          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
        ]}
      />

      {categories.error !== null ? (
        <Notice
          tone="warning"
          title="Categories unavailable"
          message={categories.error.message}
          actionLabel="Retry"
          onAction={categories.reload}
        />
      ) : null}
      {occasionOptions.length > 0 ? (
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: theme.textMuted }]}>Occasion</Text>
          <ChipRow
            allLabel="All occasions"
            options={occasionOptions}
            selectedValue={occasion}
            onSelect={setOccasion}
          />
        </View>
      ) : null}
      {occasionOptions.length === 0 && occasions.status === 'loading' ? (
        <Text style={[styles.filterLabel, { color: theme.textMuted }]}>Loading occasions…</Text>
      ) : null}
      {occasions.error !== null ? (
        <Notice
          tone="warning"
          title="Occasions unavailable"
          message={occasions.error.message}
          actionLabel="Retry"
          onAction={occasions.reload}
        />
      ) : null}

      {categoryOptions.length > 0 ? (
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: theme.textMuted }]}>Category</Text>
          <ChipRow
            allLabel="All categories"
            options={categoryOptions}
            selectedValue={category}
            onSelect={setCategory}
          />
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

      <View style={styles.resultRow}>
        <Text style={[styles.resultText, { color: theme.textMuted }]}>
          {feed.status === 'success'
            ? `${feed.items.length} of ${feed.total} ${feed.total === 1 ? 'piece' : 'pieces'}`
            : hasActiveFilters
              ? 'Filtering…'
              : 'Loading catalogue…'}
        </Text>
        {hasActiveFilters ? (
          <Pressable accessibilityRole="button" onPress={clearFilters} style={styles.clearButton}>
            <Text style={[styles.clearLabel, { color: theme.primary }]}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const listEmpty =
    feed.status === 'loading' ? (
      <LoadingState label="Loading the catalogue…" />
    ) : feed.status === 'error' && feed.error !== null ? (
      <ErrorState error={feed.error} onRetry={feed.reload} />
    ) : hasActiveFilters ? (
      <EmptyState
        title="No matches"
        message="No published pieces match these filters. Try a different occasion or category, or clear the filters."
        actionLabel="Clear filters"
        onAction={clearFilters}
      />
    ) : (
      <EmptyState
        title="Nothing published yet"
        message="There are no published products in the catalogue right now."
        actionLabel="Refresh"
        onAction={feed.reload}
      />
    );

  const listFooter = (
    <View style={styles.footer}>
      {feed.loadingMore ? <ActivityIndicator color={theme.primary} /> : null}
      {!feed.loadingMore && feed.hasMore ? (
        <Pressable
          accessibilityRole="button"
          onPress={feed.loadMore}
          style={({ pressed }) => [
            styles.loadMore,
            {
              backgroundColor: theme.surface,
              borderColor: theme.primary,
              borderRadius: theme.buttonRadius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.loadMoreLabel, { color: theme.primary }]}>
            {`Load ${PRODUCT_PAGE_SIZE} more`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      data={feed.items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      onEndReachedThreshold={0.6}
      onEndReached={feed.loadMore}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={feed.refreshing}
          onRefresh={feed.reload}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  header: {
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 15,
  },
  filterGroup: {
    gap: SPACING.xs,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultText: {
    fontSize: 12,
  },
  clearButton: {
    paddingVertical: SPACING.xs,
  },
  clearLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridRow: {
    gap: SPACING.md,
  },
  footer: {
    paddingTop: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadMore: {
    borderWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  loadMoreLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
