import { useState } from 'react';
import { StyleSheet, Text, View, type ImageStyle, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { resolveImageUrl } from '../api/client';
import { useTheme } from '../site/SiteProvider';

/**
 * A catalogue image with an honest placeholder.
 *
 * Products can legitimately have zero images (and the response may point at a
 * server-relative path), so this never renders a broken empty box: it renders
 * either the image or a labelled placeholder, and flips to the placeholder if
 * the file itself fails to load.
 */
export function ProductImage({
  url,
  height,
  borderRadius = 0,
  label,
}: {
  url: string | null | undefined;
  height: number;
  borderRadius?: number;
  label: string;
}) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(url);

  const viewFrame: ViewStyle = {
    width: '100%',
    height,
    borderRadius,
    backgroundColor: theme.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const imageFrame: ImageStyle = { width: '100%', height, borderRadius };

  if (resolved === null || failed) {
    return (
      <View style={viewFrame}>
        <Text style={[styles.placeholder, { color: theme.textMuted }]}>
          {failed ? 'Image unavailable' : 'No image yet'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={resolved}
      style={imageFrame}
      contentFit="cover"
      transition={150}
      accessibilityLabel={label}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    fontSize: 12,
    textAlign: 'center',
  },
});
