import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useCart } from '@/contexts';
import * as Haptics from 'expo-haptics';

// Drink color mapping (must match other screens)
const DRINK_COLORS = {
  mocha: '#8B4513',
  'chai-latte': '#D2691E',
  latte: '#DEB887',
  'hot-chocolate': '#A0522D',
  americano: '#654321',
  'italian-soda': '#FF6B9D',
} as const;

export default function CartScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal } = useCart();

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

  const handleQuantityChange = (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateQuantity(itemId, newQuantity);
    } else if (newQuantity < 1) {
      // Remove item if quantity goes to 0
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      removeItem(itemId);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeItem(itemId);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(user)/checkout');
  };

  const handleContinueShopping = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
              },
            ]}
            accessibilityRole="header"
          >
            Your Cart is Empty
          </Text>
          <Text
            style={[
              styles.emptyText,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            Add some delicious drinks to get started!
          </Text>
          <Pressable
            onPress={handleContinueShopping}
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: theme.colors.PRIMARY,
                minHeight: theme.touchTargets.LARGE,
                ...theme.shadows.MD,
              },
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue shopping"
            accessibilityHint="Return to menu to add drinks"
          >
            <Text
              style={[
                styles.continueButtonText,
                {
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
            >
              Browse Menu
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.SURFACE,
            borderBottomColor: theme.colors.DIVIDER,
            ...theme.shadows.SM,
          },
        ]}
      >
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
          Your Order
        </Text>
      </View>

      {/* Cart items */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => {
          const drinkColor =
            DRINK_COLORS[item.drinkCategory as keyof typeof DRINK_COLORS] ??
            theme.colors.PRIMARY;

          return (
            <View
              key={item.id}
              style={[
                styles.cartItem,
                {
                  backgroundColor: theme.colors.SURFACE,
                  borderColor: theme.colors.DIVIDER,
                  ...theme.shadows.MD,
                },
              ]}
            >
              {/* Color indicator bar */}
              <View
                style={[
                  styles.colorBar,
                  {
                    backgroundColor: drinkColor,
                  },
                ]}
                accessibilityElementsHidden
              />

              {/* Item details */}
              <View style={styles.itemDetails}>
                <Text
                  style={[
                    styles.itemName,
                    {
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.HEADING,
                    },
                  ]}
                  accessibilityRole="header"
                >
                  {item.drinkName}
                </Text>
                <Text
                  style={[
                    styles.itemOptions,
                    {
                      color: theme.colors.TEXT_SECONDARY,
                      fontSize: theme.typography.FONT_SIZES.BODY,
                    },
                  ]}
                >
                  {formatOptions(item)}
                </Text>
              </View>

              {/* Quantity controls */}
              <View style={styles.quantityContainer}>
                <Pressable
                  onPress={() => {handleQuantityChange(item.id, item.quantity, -1);}}
                  style={({ pressed }) => [
                    styles.quantityButton,
                    {
                      backgroundColor: theme.colors.PRIMARY,
                      minWidth: theme.touchTargets.COMFORTABLE,
                      minHeight: theme.touchTargets.COMFORTABLE,
                      ...theme.shadows.SM,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease quantity"
                  accessibilityHint={`Current quantity is ${item.quantity}`}
                >
                  <Text
                    style={[
                      styles.quantityButtonText,
                      {
                        fontSize: theme.typography.FONT_SIZES.TITLE,
                      },
                    ]}
                  >
                    -
                  </Text>
                </Pressable>

                <View
                  style={[
                    styles.quantityDisplay,
                    {
                      backgroundColor: theme.colors.BACKGROUND,
                      borderColor: theme.colors.DIVIDER,
                      minWidth: theme.touchTargets.LARGE,
                    },
                  ]}
                  accessibilityRole="text"
                  accessibilityLabel={`Quantity: ${item.quantity}`}
                >
                  <Text
                    style={[
                      styles.quantityText,
                      {
                        color: theme.colors.TEXT_PRIMARY,
                        fontSize: theme.typography.FONT_SIZES.HEADING,
                      },
                    ]}
                  >
                    {item.quantity}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {handleQuantityChange(item.id, item.quantity, 1);}}
                  disabled={item.quantity >= 10}
                  style={({ pressed }) => [
                    styles.quantityButton,
                    {
                      backgroundColor:
                        item.quantity >= 10 ? theme.colors.SURFACE : theme.colors.PRIMARY,
                      minWidth: theme.touchTargets.COMFORTABLE,
                      minHeight: theme.touchTargets.COMFORTABLE,
                      ...theme.shadows.SM,
                    },
                    pressed && item.quantity < 10 && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                  accessibilityHint={`Current quantity is ${item.quantity}`}
                  accessibilityState={{ disabled: item.quantity >= 10 }}
                >
                  <Text
                    style={[
                      styles.quantityButtonText,
                      {
                        color: item.quantity >= 10 ? theme.colors.TEXT_DISABLED : '#FFFFFF',
                        fontSize: theme.typography.FONT_SIZES.TITLE,
                      },
                    ]}
                  >
                    +
                  </Text>
                </Pressable>
              </View>

              {/* Item price and remove button */}
              <View style={styles.itemFooter}>
                <Text
                  style={[
                    styles.itemPrice,
                    {
                      color: theme.colors.PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.HEADING,
                    },
                  ]}
                  accessibilityLabel={`Item total: $${(item.totalPrice / 100).toFixed(2)}`}
                >
                  ${(item.totalPrice / 100).toFixed(2)}
                </Text>

                <Pressable
                  onPress={() => {handleRemoveItem(item.id);}}
                  style={({ pressed }) => [
                    styles.removeButton,
                    {
                      backgroundColor: theme.colors.ERROR,
                      minHeight: theme.touchTargets.MINIMUM,
                      ...theme.shadows.SM,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.drinkName} from cart`}
                  accessibilityHint="Tap to delete this item from your order"
                >
                  <Text
                    style={[
                      styles.removeButtonText,
                      {
                        fontSize: theme.typography.FONT_SIZES.BODY,
                      },
                    ]}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Order summary footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.SURFACE,
            borderTopColor: theme.colors.DIVIDER,
            ...theme.shadows.LG,
          },
        ]}
      >
        {/* Subtotal */}
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
            Subtotal
          </Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
            accessibilityLabel={`Subtotal: $${(subtotal / 100).toFixed(2)}`}
          >
            ${(subtotal / 100).toFixed(2)}
          </Text>
        </View>

        {/* Tax */}
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
            Tax (8.75%)
          </Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
            accessibilityLabel={`Tax: $${(tax / 100).toFixed(2)}`}
          >
            ${(tax / 100).toFixed(2)}
          </Text>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            {
              backgroundColor: theme.colors.DIVIDER,
            },
          ]}
          accessibilityElementsHidden
        />

        {/* Total */}
        <View style={styles.summaryRow}>
          <Text
            style={[
              styles.totalLabel,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
            accessibilityRole="header"
          >
            Total
          </Text>
          <Text
            style={[
              styles.totalValue,
              {
                color: theme.colors.PRIMARY,
                fontSize: theme.typography.FONT_SIZES.TITLE,
              },
            ]}
            accessibilityLabel={`Order total: $${(total / 100).toFixed(2)}`}
          >
            ${(total / 100).toFixed(2)}
          </Text>
        </View>

        {/* Checkout button */}
        <Pressable
          onPress={handleCheckout}
          style={({ pressed }) => [
            styles.checkoutButton,
            {
              backgroundColor: theme.colors.PRIMARY,
              minHeight: theme.touchTargets.LARGE,
              ...theme.shadows.LG,
            },
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Checkout for $${(total / 100).toFixed(2)}`}
          accessibilityHint="Proceed to enter customer information and submit order"
        >
          <Text
            style={[
              styles.checkoutButtonText,
              {
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
          >
            Checkout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontWeight: '500',
    marginBottom: 40,
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 48,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderBottomWidth: 2,
  },
  headerTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 40,
    gap: 24,
  },
  cartItem: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    marginBottom: 24,
  },
  colorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: '100%',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  itemDetails: {
    marginBottom: 20,
    paddingLeft: 16,
  },
  itemName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  itemOptions: {
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  quantityButton: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  quantityDisplay: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
  },
  itemPrice: {
    fontWeight: '700',
  },
  removeButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 40,
    paddingVertical: 32,
    borderTopWidth: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  summaryValue: {
    fontWeight: '600',
  },
  divider: {
    height: 2,
    marginVertical: 16,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalValue: {
    fontWeight: '700',
  },
  checkoutButton: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
