import { Stack } from 'expo-router';
import { useTheme } from '@/contexts';
import { ModeSwitch } from '@/components/navigation';

export default function UserLayout() {
  const { theme } = useTheme();

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
          title: 'Menu',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="drink/[id]"
        options={{
          title: 'Customize Drink',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: 'Checkout',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: 'Review',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="confirmation"
        options={{
          title: 'Confirmation',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="label-preview"
        options={{
          title: 'Label Preview',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
