import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFaqs } from '../../src/api/hooks';
import type { Faq } from '../../src/api/types';
import { Badge } from '../../src/components/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/StateView';
import { useTheme } from '../../src/site/SiteProvider';
import { SPACING } from '../../src/theme/theme';

/**
 * FAQ accordion. Answers live in the API response, so expanding a row is purely
 * local state — no request per question.
 */
export default function FaqScreen() {
  const theme = useTheme();
  const faqs = useFaqs();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      data={faqs.data ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FaqRow
          faq={item}
          expanded={expandedId === item.id}
          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
        />
      )}
      ListHeaderComponent={
        faqs.data !== null && faqs.data.length > 0 ? (
          <Text style={[styles.count, { color: theme.textMuted }]}>
            {`${faqs.data.length} ${faqs.data.length === 1 ? 'answer' : 'answers'}`}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        faqs.status === 'loading' ? (
          <LoadingState label="Loading questions…" />
        ) : faqs.status === 'error' && faqs.error !== null ? (
          <ErrorState error={faqs.error} onRetry={faqs.reload} />
        ) : (
          <EmptyState
            title="No questions published yet"
            message="The studio has not published any answers. Try the Contact screen to reach them directly."
            actionLabel="Refresh"
            onAction={faqs.reload}
          />
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={faqs.refreshing}
          onRefresh={faqs.reload}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    />
  );
}

function FaqRow({ faq, expanded, onToggle }: { faq: Faq; expanded: boolean; onToggle: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.cardRadius },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.questionRow, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={styles.questionText}>
          <Text style={[styles.question, { color: theme.text }]}>{faq.question}</Text>
          <View style={styles.tagRow}>
            {faq.isPinned ? <Badge label="Pinned" tone="accent" /> : null}
            {faq.category.trim().length > 0 ? <Badge label={faq.category} /> : null}
          </View>
        </View>
        <Text style={[styles.caret, { color: theme.primary }]}>{expanded ? '–' : '+'}</Text>
      </Pressable>
      {expanded ? (
        <Text style={[styles.answer, { color: theme.textMuted, borderTopColor: theme.border }]}>
          {faq.answer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  count: {
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  questionText: {
    flex: 1,
    gap: SPACING.sm,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  caret: {
    fontSize: 20,
    fontWeight: '700',
  },
  answer: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
});
