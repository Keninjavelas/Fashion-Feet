import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../site/SiteProvider';
import { SPACING } from '../theme/theme';

export interface ChipOption {
  /** Value sent to the API (category/occasion slug or name). */
  value: string;
  label: string;
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? theme.onPrimary : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Horizontal, single-select filter row. `selectedValue === null` means "no
 * filter", which is what the API does when the parameter is omitted.
 */
export function ChipRow({
  allLabel,
  options,
  selectedValue,
  onSelect,
}: {
  allLabel: string;
  options: ChipOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      <Chip label={allLabel} selected={selectedValue === null} onPress={() => onSelect(null)} />
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={selectedValue === option.value}
          onPress={() => onSelect(selectedValue === option.value ? null : option.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
