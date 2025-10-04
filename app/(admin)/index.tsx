import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useAuth } from '@/contexts';

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      <Text style={[styles.title, {
        color: theme.colors.TEXT_PRIMARY,
        fontSize: theme.typography.FONT_SIZES.HEADING,
      }]}>
        Admin Dashboard
      </Text>

      <Text style={[styles.subtitle, {
        color: theme.colors.TEXT_SECONDARY,
        fontSize: theme.typography.FONT_SIZES.BODY,
      }]}>
        Order management and settings coming soon in future tickets
      </Text>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.colors.ERROR,
            minHeight: theme.touchTargets.LARGE,
            ...theme.shadows.MD,
          },
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        accessibilityHint="Tap to logout from admin mode"
      >
        <Text style={[styles.buttonText, {
          color: '#FFFFFF',
          fontSize: theme.typography.FONT_SIZES.SUBHEADING,
        }]}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
