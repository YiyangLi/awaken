import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useCart } from '@/contexts';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import type { DrinkCategory } from '@/types';

// Default options for each drink type
const DEFAULT_OPTIONS: Record<DrinkCategory, {
  shots?: number;
  chocolateType?: 'regular' | 'white';
  syrup?: string | null;
  milk?: 'whole' | 'oat';
  hasCream?: boolean;
}> = {
  mocha: { shots: 2, chocolateType: 'regular', syrup: null, milk: 'whole' },
  'chai-latte': { shots: 0, milk: 'whole' },
  latte: { shots: 2, milk: 'whole' },
  'hot-chocolate': { chocolateType: 'regular', milk: 'whole' },
  americano: { shots: 2 },
  'italian-soda': { syrup: null, hasCream: true },
};

export default function ReviewScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { items, createOrder } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, redirect back to menu
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/(user)/');
    }
  }, [items, router]);

  /**
   * Get order customizations (returns empty array if all defaults)
   * Returns array of customization strings for display
   */
  const getOrderCustomizations = (item: typeof items[0]): string[] => {
    const category = item.drinkCategory as DrinkCategory;
    const defaults = DEFAULT_OPTIONS[category];

    if (!defaults) {
      // eslint-disable-next-line no-console
      console.error('No defaults found for category:', category);
      return [];
    }

    const customizations: string[] = [];

    // Check each option against defaults
    switch (category) {
      case 'mocha':
        if (item.shots !== undefined && item.shots !== defaults.shots) {
          customizations.push(`${item.shots} shot${item.shots !== 1 ? 's' : ''}`);
        }
        if (item.chocolateType !== undefined && item.chocolateType !== defaults.chocolateType) {
          customizations.push(item.chocolateType === 'white' ? 'white chocolate' : 'chocolate');
        }
        if (item.syrup !== undefined && item.syrup !== null && item.syrup !== defaults.syrup) {
          customizations.push(`${item.syrup} syrup`);
        }
        if (item.milk !== undefined && item.milk !== defaults.milk) {
          customizations.push(item.milk === 'oat' ? 'oat milk' : 'whole milk');
        }
        break;

      case 'chai-latte':
        // Special handling for "dirty" chai
        if (item.isDirty && item.shots === 2) {
          customizations.push('dirty');
        } else if (item.shots !== undefined && item.shots !== defaults.shots) {
          customizations.push(`${item.shots} shot${item.shots !== 1 ? 's' : ''}`);
        }
        if (item.milk !== undefined && item.milk !== defaults.milk) {
          customizations.push(item.milk === 'oat' ? 'oat milk' : 'whole milk');
        }
        break;

      case 'latte':
        if (item.shots !== undefined && item.shots !== defaults.shots) {
          customizations.push(`${item.shots} shot${item.shots !== 1 ? 's' : ''}`);
        }
        if (item.syrup !== undefined && item.syrup !== null) {
          customizations.push(`${item.syrup} syrup`);
        }
        if (item.milk !== undefined && item.milk !== defaults.milk) {
          customizations.push(item.milk === 'oat' ? 'oat milk' : 'whole milk');
        }
        break;

      case 'hot-chocolate':
        if (item.chocolateType !== undefined && item.chocolateType !== defaults.chocolateType) {
          customizations.push(item.chocolateType === 'white' ? 'white chocolate' : 'chocolate');
        }
        if (item.milk !== undefined && item.milk !== defaults.milk) {
          customizations.push(item.milk === 'oat' ? 'oat milk' : 'whole milk');
        }
        break;

      case 'americano':
        if (item.shots !== undefined && item.shots !== defaults.shots) {
          customizations.push(`${item.shots} shot${item.shots !== 1 ? 's' : ''}`);
        }
        break;

      case 'italian-soda':
        if (item.syrup !== undefined && item.syrup !== null && item.syrup !== defaults.syrup) {
          customizations.push(`${item.syrup} syrup`);
        }
        if (item.hasCream !== undefined && item.hasCream !== defaults.hasCream) {
          customizations.push(item.hasCream ? 'with cream' : 'no cream');
        }
        break;
    }

    return customizations;
  };

  const handlePlaceOrder = async () => {
    // Validate customer name
    if (customerName.trim().length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create order
      await createOrder(customerName.trim());

      // Navigate to confirmation screen
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(user)/confirmation');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to place order:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safety check - if no items, don't render (will redirect via useEffect)
  if (items.length === 0) {
    return null;
  }

  // Since we only have 1 item per order (based on requirements)
  const orderItem = items[0];
  if (!orderItem) {
    return null;
  }

  const customizations = getOrderCustomizations(orderItem);
  const isButtonEnabled = customerName.trim().length > 0 && !isSubmitting;

  // Debug logging
  // eslint-disable-next-line no-console
  console.log('Order item:', orderItem);
  // eslint-disable-next-line no-console
  console.log('Customizations:', customizations);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.BACKGROUND }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Order Detail */}
        <View style={styles.section}>
          {/* Drink name */}
          <Text
            style={[
              styles.drinkName,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
              },
            ]}
            accessibilityLabel={`Order: ${orderItem.drinkName}`}
          >
            {orderItem.drinkName}
          </Text>

          {/* Customizations (if any) */}
          {customizations.length > 0 && (
            <Text
              style={[
                styles.customizations,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
              accessibilityLabel={`Customizations: ${customizations.join(', ')}`}
            >
              {customizations.join(', ')}
            </Text>
          )}
        </View>

        {/* Customer Name Input and Submit Button Row */}
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.SURFACE,
                borderColor: theme.colors.DIVIDER,
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
                minHeight: theme.touchTargets.LARGE,
              },
            ]}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.TEXT_DISABLED}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            accessibilityLabel="Customer name"
            accessibilityHint="Required: Enter your name for the order"
            maxLength={20}
          />

          <Pressable
            onPress={handlePlaceOrder}
            disabled={!isButtonEnabled}
            style={({ pressed }) => [
              styles.placeOrderButton,
              {
                backgroundColor: isButtonEnabled ? theme.colors.PRIMARY : theme.colors.SURFACE,
                minHeight: theme.touchTargets.LARGE,
                ...theme.shadows.LG,
              },
              pressed && isButtonEnabled && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Place order"
            accessibilityHint="Confirm and place your order"
            accessibilityState={{
              disabled: !isButtonEnabled,
            }}
          >
            <Text
              style={[
                styles.placeOrderButtonText,
                {
                  color: isButtonEnabled ? '#FFFFFF' : theme.colors.TEXT_DISABLED,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
            >
              {isSubmitting ? 'Placing...' : 'Place Order'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  drinkName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  customizations: {
    fontWeight: '500',
    lineHeight: 28,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '500',
  },
  placeOrderButton: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
