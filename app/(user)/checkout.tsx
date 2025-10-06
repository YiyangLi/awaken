import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useCart } from '@/contexts';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { items, getTotal, createOrder } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [baristaName, setBaristaName] = useState('');

  // Helper function to format customization options for display
  const formatOptions = (item: typeof items[0]): string => {
    const parts: string[] = [];
    
    // Size is always 12oz now
    parts.push(item.size);
    
    // Milk (if applicable)
    if (item.milk) {
      parts.push(`${item.milk.charAt(0).toUpperCase() + item.milk.slice(1)} milk`);
    }
    
    // Shots (if applicable)
    if (item.shots !== undefined) {
      parts.push(`${item.shots} shot${item.shots !== 1 ? 's' : ''}`);
    }
    
    // Chocolate type (if applicable)
    if (item.chocolateType) {
      parts.push(item.chocolateType === 'white' ? 'White chocolate' : 'Chocolate');
    }
    
    // Syrup (if applicable)
    if (item.syrup) {
      parts.push(`${item.syrup} syrup`);
    }
    
    // Dirty (if applicable)
    if (item.isDirty) {
      parts.push('Dirty');
    }
    
    // Cream (if applicable)
    if (item.hasCream) {
      parts.push('With cream');
    }
    
    return parts.join(' • ');
  };

  const handleSubmitOrder = async () => {
    // Validate customer name
    if (customerName.trim().length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create order
      const order = await createOrder(customerName.trim(), customerPhone.trim() || undefined);

      // Format order number for display
      const orderNum = (order.id.split('-')[1] ?? '').substring(0, 6).toUpperCase();
      setOrderNumber(orderNum);

      // Format estimated time
      const estTime = order.estimatedCompletionTime;
      if (estTime) {
        const timeStr = estTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        setEstimatedTime(timeStr);
      }

      // Set barista name
      setBaristaName(order.assignedBarista ?? 'our barista');

      // Show confirmation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfirmation(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to submit order:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate back to menu
    router.replace('/(user)/');
  };

  // Order confirmation screen
  if (showConfirmation) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
        <ScrollView
          contentContainerStyle={styles.confirmationContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Success icon/header */}
          <View
            style={[
              styles.successHeader,
              {
                backgroundColor: theme.colors.SUCCESS,
                ...theme.shadows.LG,
              },
            ]}
          >
            <Text
              style={[
                styles.successIcon,
                {
                  fontSize: theme.typography.FONT_SIZES.TITLE * 2,
                },
              ]}
              accessibilityLabel="Order submitted successfully"
            >
              ✓
            </Text>
            <Text
              style={[
                styles.successTitle,
                {
                  fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
                },
              ]}
              accessibilityRole="header"
            >
              Order Confirmed!
            </Text>
          </View>

          {/* Order details */}
          <View
            style={[
              styles.confirmationCard,
              {
                backgroundColor: theme.colors.SURFACE,
                borderColor: theme.colors.DIVIDER,
                ...theme.shadows.MD,
              },
            ]}
          >
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              Order Number
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                {
                  color: theme.colors.PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.TITLE,
                },
              ]}
              accessibilityRole="text"
              accessibilityLabel={`Order number ${orderNumber}`}
            >
              #{orderNumber}
            </Text>
          </View>

          <View
            style={[
              styles.confirmationCard,
              {
                backgroundColor: theme.colors.SURFACE,
                borderColor: theme.colors.DIVIDER,
                ...theme.shadows.MD,
              },
            ]}
          >
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              Customer Name
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                {
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
            >
              {customerName}
            </Text>
          </View>

          <View
            style={[
              styles.confirmationCard,
              {
                backgroundColor: theme.colors.SURFACE,
                borderColor: theme.colors.DIVIDER,
                ...theme.shadows.MD,
              },
            ]}
          >
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              Estimated Ready Time
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                {
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
              accessibilityLabel={`Your order will be ready at approximately ${estimatedTime}`}
            >
              {estimatedTime}
            </Text>
          </View>

          <View
            style={[
              styles.confirmationCard,
              {
                backgroundColor: theme.colors.SURFACE,
                borderColor: theme.colors.DIVIDER,
                ...theme.shadows.MD,
              },
            ]}
          >
            <Text
              style={[
                styles.confirmationLabel,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              Prepared By
            </Text>
            <Text
              style={[
                styles.confirmationValue,
                {
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
            >
              {baristaName}
            </Text>
          </View>

          {/* Message */}
          <Text
            style={[
              styles.confirmationMessage,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            Thank you for your order! We&apos;ll call your name when it&apos;s ready.
          </Text>

          {/* Order Another button */}
          <Pressable
            onPress={handleOrderAnother}
            style={({ pressed }) => [
              styles.orderAnotherButton,
              {
                backgroundColor: theme.colors.PRIMARY,
                minHeight: theme.touchTargets.LARGE,
                ...theme.shadows.LG,
              },
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Order another drink"
            accessibilityHint="Return to menu to place a new order"
          >
            <Text
              style={[
                styles.orderAnotherButtonText,
                {
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
            >
              Order Another
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Checkout form screen
  const total = getTotal();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.checkoutHeader}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.TITLE,
              },
            ]}
            accessibilityRole="header"
          >
            Checkout
          </Text>
        </View>

        {/* Customer information section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
            accessibilityRole="header"
          >
            Customer Information
          </Text>

          {/* Name input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              Name (Required)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.SURFACE,
                  borderColor: theme.colors.DIVIDER,
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                  minHeight: theme.touchTargets.LARGE,
                },
              ]}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.TEXT_DISABLED}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="Customer name"
              accessibilityHint="Enter your name for the order"
            />
          </View>

          {/* Phone input (optional) */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              Phone Number (Optional)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.SURFACE,
                  borderColor: theme.colors.DIVIDER,
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                  minHeight: theme.touchTargets.LARGE,
                },
              ]}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="(555) 123-4567"
              placeholderTextColor={theme.colors.TEXT_DISABLED}
              keyboardType="phone-pad"
              returnKeyType="done"
              accessibilityLabel="Phone number"
              accessibilityHint="Optional phone number for order notifications"
            />
          </View>
        </View>

        {/* Order summary section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
            accessibilityRole="header"
          >
            Order Summary
          </Text>

          {/* Item count */}
          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: theme.colors.TEXT_SECONDARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {/* Items list */}
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemDetails}>
                <Text
                  style={[
                    styles.orderItemName,
                    {
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.BODY,
                    },
                  ]}
                >
                  {item.quantity}x {item.drinkName}
                </Text>
                <Text
                  style={[
                    styles.orderItemOptions,
                    {
                      color: theme.colors.TEXT_SECONDARY,
                      fontSize: theme.typography.FONT_SIZES.SMALL,
                    },
                  ]}
                >
                  {formatOptions(item)}
                </Text>
              </View>
              <Text
                style={[
                  styles.orderItemPrice,
                  {
                    color: theme.colors.TEXT_PRIMARY,
                    fontSize: theme.typography.FONT_SIZES.BODY,
                  },
                ]}
              >
                ${(item.totalPrice / 100).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Total */}
          <View
            style={[
              styles.totalRow,
              {
                borderTopColor: theme.colors.DIVIDER,
              },
            ]}
          >
            <Text
              style={[
                styles.totalLabel,
                {
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
            >
              Total
            </Text>
            <Text
              style={[
                styles.totalValue,
                {
                  color: theme.colors.PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
                },
              ]}
              accessibilityLabel={`Total amount: $${(total / 100).toFixed(2)}`}
            >
              ${(total / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Submit button */}
        <Pressable
          onPress={handleSubmitOrder}
          disabled={isSubmitting || customerName.trim().length === 0}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor:
                customerName.trim().length === 0
                  ? theme.colors.SURFACE
                  : theme.colors.PRIMARY,
              minHeight: theme.touchTargets.LARGE,
              ...theme.shadows.LG,
            },
            pressed && customerName.trim().length > 0 && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Submit order for $${(total / 100).toFixed(2)}`}
          accessibilityHint="Place your order and receive confirmation"
          accessibilityState={{
            disabled: isSubmitting || customerName.trim().length === 0,
          }}
        >
          <Text
            style={[
              styles.submitButtonText,
              {
                color:
                  customerName.trim().length === 0
                    ? theme.colors.TEXT_DISABLED
                    : '#FFFFFF',
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Order'}
          </Text>
        </Pressable>
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
    padding: 40,
    paddingBottom: 80,
  },
  checkoutHeader: {
    marginBottom: 32,
  },
  headerTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '500',
  },
  summaryRow: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
  },
  orderItemDetails: {
    flex: 1,
    marginRight: 16,
  },
  orderItemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  orderItemOptions: {
    fontWeight: '500',
  },
  orderItemPrice: {
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 2,
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalValue: {
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  confirmationContainer: {
    padding: 40,
    alignItems: 'center',
  },
  successHeader: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  successIcon: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  successTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmationCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 32,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  confirmationLabel: {
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationValue: {
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmationMessage: {
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 32,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  orderAnotherButton: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderAnotherButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});
