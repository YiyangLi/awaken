import { Stack, useRouter, useSegments } from 'expo-router';
import { useTheme, useAuth } from '@/contexts';
import { useEffect } from 'react';
import { ModeSwitch } from '@/components/navigation';

export default function AdminLayout() {
  const { theme } = useTheme();
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAdminGroup = segments[0] === '(admin)';

    if (inAdminGroup && !isAdmin) {
      router.replace('/(user)');
    }
  }, [isAdmin, isLoading, segments, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.SURFACE,
        },
        headerTintColor: theme.colors.TEXT_PRIMARY,
        headerTitleStyle: {
          fontSize: theme.typography.FONT_SIZES.HEADING,
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.colors.BACKGROUND,
        },
        headerRight: () => <ModeSwitch />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
