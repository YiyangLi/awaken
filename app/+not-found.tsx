import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '@/contexts';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
        <Text style={[styles.title, {
          color: theme.colors.TEXT_PRIMARY,
          fontSize: theme.typography.FONT_SIZES.TITLE,
        }]}>
          Page Not Found
        </Text>

        <Text style={[styles.subtitle, {
          color: theme.colors.TEXT_SECONDARY,
          fontSize: theme.typography.FONT_SIZES.BODY,
        }]}>
          The page you&apos;re looking for doesn&apos;t exist
        </Text>

        <Link href="/" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.colors.PRIMARY,
                minHeight: theme.touchTargets.LARGE,
                ...theme.shadows.MD,
              },
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
            accessibilityHint="Navigate back to the home screen"
          >
            <Text style={[styles.buttonText, {
              color: '#FFFFFF',
              fontSize: theme.typography.FONT_SIZES.SUBHEADING,
            }]}>
              Go to Home
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
