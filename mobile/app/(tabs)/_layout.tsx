import { Tabs } from 'expo-router';
import { useTheme } from '../../src/site/SiteProvider';

/**
 * Five customer-facing destinations. No authentication gate and no privileged
 * destination exists anywhere in this app — every screen reads public data.
 */
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Fashion Feet', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarLabel: 'Shop' }} />
      <Tabs.Screen name="stores" options={{ title: 'Stores', tabBarLabel: 'Stores' }} />
      <Tabs.Screen name="faq" options={{ title: 'FAQ', tabBarLabel: 'FAQ' }} />
      <Tabs.Screen name="contact" options={{ title: 'Contact', tabBarLabel: 'Contact' }} />
    </Tabs>
  );
}
