import {
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useStores } from '../../src/api/hooks';
import type { Store } from '../../src/api/types';
import { Badge } from '../../src/components/Badge';
import { ProductImage } from '../../src/components/ProductImage';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/StateView';
import { storeStatusPresentation } from '../../src/lib/format';
import { useTheme } from '../../src/site/SiteProvider';
import { SPACING } from '../../src/theme/theme';

/**
 * Store locator. The API only publishes OPEN | COMING_SOON |
 * TEMPORARILY_CLOSED locations, and every optional field below is hidden when
 * absent rather than rendered empty.
 */
export default function StoresScreen() {
  const theme = useTheme();
  const stores = useStores();

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      data={stores.data ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <StoreCard store={item} />}
      ListEmptyComponent={
        stores.status === 'loading' ? (
          <LoadingState label="Loading stores…" />
        ) : stores.status === 'error' && stores.error !== null ? (
          <ErrorState error={stores.error} onRetry={stores.reload} />
        ) : (
          <EmptyState
            title="No stores listed yet"
            message="Published locations will appear here — including boutiques that are still marked as coming soon."
            actionLabel="Refresh"
            onAction={stores.reload}
          />
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={stores.refreshing}
          onRefresh={stores.reload}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    />
  );
}

function openLink(url: string): void {
  void Linking.openURL(url).catch(() => undefined);
}

function StoreCard({ store }: { store: Store }) {
  const theme = useTheme();
  const status = storeStatusPresentation(store.status);

  const addressParts = [store.street, store.city, store.state, store.pinCode, store.country].filter(
    (part): part is string => typeof part === 'string' && part.trim().length > 0
  );
  const address = addressParts.join(', ');
  const whatsappDigits = typeof store.whatsapp === 'string' ? store.whatsapp.replace(/[^\d+]/g, '') : '';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.cardRadius },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.name, { color: theme.text }]}>{store.name}</Text>
        <Badge
          label={status.label}
          tone={status.tone === 'positive' ? 'positive' : status.tone === 'neutral' ? 'accent' : 'neutral'}
        />
      </View>
      {store.type.trim().length > 0 ? (
        <Text style={[styles.meta, { color: theme.textMuted }]}>{store.type.replace(/_/g, ' ')}</Text>
      ) : null}
      {address.length > 0 ? <Text style={[styles.body, { color: theme.text }]}>{address}</Text> : null}
      {store.description ? (
        <Text style={[styles.body, { color: theme.textMuted }]}>{store.description}</Text>
      ) : null}
      {store.openingHours ? (
        <Text style={[styles.body, { color: theme.textMuted }]}>{`Hours: ${store.openingHours}`}</Text>
      ) : null}
      {store.accessibility ? (
        <Text style={[styles.body, { color: theme.textMuted }]}>{store.accessibility}</Text>
      ) : null}

      {store.photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
          {store.photos.map((photo, index) => (
            <View key={`${store.id}-photo-${index}`} style={styles.photo}>
              <ProductImage url={photo} height={120} borderRadius={theme.cardRadius} label={store.name} />
            </View>
          ))}
        </ScrollView>
      ) : null}

      {store.services.length > 0 ? (
        <View style={styles.tagRow}>
          {store.services.map((service) => (
            <View
              key={service}
              style={[styles.tag, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            >
              <Text style={[styles.tagLabel, { color: theme.text }]}>{service}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actionRow}>
        {store.phone ? (
          <StoreAction label="Call" onPress={() => openLink(`tel:${store.phone ?? ''}`)} />
        ) : null}
        {whatsappDigits.length > 0 ? (
          <StoreAction
            label="WhatsApp"
            onPress={() => openLink(`https://wa.me/${whatsappDigits.replace(/^\+/, '')}`)}
          />
        ) : null}
        {store.email ? (
          <StoreAction label="Email" onPress={() => openLink(`mailto:${store.email ?? ''}`)} />
        ) : null}
        {store.googleMapsUrl ? (
          <StoreAction label="Open in Maps" onPress={() => openLink(store.googleMapsUrl ?? '')} />
        ) : null}
      </View>
    </View>
  );
}

function StoreAction({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { borderColor: theme.primary, borderRadius: theme.buttonRadius, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.actionLabel, { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  card: {
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
  },
  photoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  photo: {
    width: 160,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  action: {
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
});
