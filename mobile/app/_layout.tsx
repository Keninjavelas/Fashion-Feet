import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SiteProvider, useTheme } from '../src/site/SiteProvider';

/**
 * App shell: site configuration (brand tokens + homepage composition) is fetched
 * once here and shared with every screen, so no screen talks to /api/v1/site
 * directly and no screen hardcodes a colour.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SiteProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SiteProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
    </Stack>
  );
}
