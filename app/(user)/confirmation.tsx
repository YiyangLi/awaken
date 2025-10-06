import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts';
import { useEffect } from 'react';

export default function ConfirmationScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  // Auto-redirect to main menu after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(user)/');
    }, 3000);

    return () => {clearTimeout(timer);};
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.successIcon,
            {
              backgroundColor: theme.colors.SUCCESS,
              ...theme.shadows.LG,
            },
          ]}
        >
          <Text
            style={[
              styles.checkmark,
              {
                fontSize: theme.typography.FONT_SIZES.TITLE * 3,
              },
            ]}
            accessibilityLabel="Success"
          >
            ✓
          </Text>
        </View>

        <Text
          style={[
            styles.confirmationText,
            {
              color: theme.colors.TEXT_PRIMARY,
              fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
            },
          ]}
          accessibilityRole="header"
          accessibilityLabel="Order confirmed"
        >
          Order Confirmed
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.TEXT_SECONDARY,
              fontSize: theme.typography.FONT_SIZES.BODY,
            },
          ]}
        >
          Returning to menu...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmationText: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
