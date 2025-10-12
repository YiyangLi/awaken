import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { View, Alert } from 'react-native';
import { StorageService } from '../storage';
import { APP_CONFIG } from '../config';
import { PrintService } from '../services/PrintService';
import { formatLabelText } from '../utils/labelFormatter';
import { LabelView } from '../components/LabelView';
import type { Order, OrderItem, OrderStatus } from '../types';
import { DrinkOptionType } from '../types'; // eslint-disable-line no-duplicate-imports

/**
 * Cart item interface for managing items before order creation
 * Updated to support drink-specific customizations
 */
interface CartItem {
  /** Unique identifier for this cart item */
  id: string;
  /** Reference to the drink ID */
  drinkId: string;
  /** Display name of the drink */
  drinkName: string;
  /** Drink category for color coding */
  drinkCategory: string;
  /** Quantity of this drink */
  quantity: number;
  /** Size (hardcoded to 12oz currently) */
  size: string;
  /** Selected milk option (whole, oat) - optional (not for Americano/Italian Soda) */
  milk?: 'whole' | 'oat';
  /** Espresso shots (0-4) - optional (Mocha, Chai, Latte, Americano) */
  shots?: number;
  /** Chocolate type (regular, white) - optional (Mocha, Hot Chocolate) */
  chocolateType?: 'regular' | 'white';
  /** Syrup flavor - optional (Mocha, Latte, Italian Soda) */
  syrup?: string;
  /** Make it dirty checkbox - optional (Chai Latte only) */
  isDirty?: boolean;
  /** Add cream checkbox - optional (Italian Soda only) */
  hasCream?: boolean;
  /** Base drink price in cents */
  basePrice: number;
  /** Total price for this item including options */
  totalPrice: number;
}

/**
 * Context value interface for cart management
 */
interface CartContextValue {
  /** Current items in the cart */
  items: CartItem[];
  /** Add item to cart */
  addItem: (item: CartItem) => void;
  /** Update item quantity */
  updateQuantity: (itemId: string, quantity: number) => void;
  /** Remove item from cart */
  removeItem: (itemId: string) => void;
  /** Clear all items from cart */
  clearCart: () => void;
  /** Get total number of items in cart */
  getTotalItems: () => number;
  /** Get subtotal in cents */
  getSubtotal: () => number;
  /** Get tax amount in cents */
  getTax: () => number;
  /** Get total with tax in cents */
  getTotal: () => number;
  /** Create order from cart items */
  createOrder: (customerName: string, customerPhone?: string) => Promise<Order>;
}

/**
 * React Context for cart management
 * Elder-friendly: Simple shopping cart with clear total calculations
 */
const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * Props for CartProvider component
 */
interface CartProviderProps {
  children: ReactNode;
}

/**
 * Cart Provider Component
 * 
 * Manages shopping cart state for the coffee ordering flow.
 * Elder-friendly features:
 * - Simple add/remove operations
 * - Clear price calculations
 * - Automatic subtotal and tax computation
 * - Order creation and persistence
 * 
 * @param children - React children to wrap with cart context
 */
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const labelViewRef = useRef<View>(null);

  /**
   * Add item to cart
   * Elder-friendly: Combines items with same configuration automatically
   */
  const addItem = useCallback((item: CartItem) => {
    setItems((prevItems) => {
      // Check if item with same configuration already exists
      const existingItemIndex = prevItems.findIndex(
        (i) =>
          i.drinkId === item.drinkId &&
          i.size === item.size &&
          i.milk === item.milk &&
          i.shots === item.shots &&
          i.chocolateType === item.chocolateType &&
          i.syrup === item.syrup &&
          i.isDirty === item.isDirty &&
          i.hasCream === item.hasCream
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity;
          const unitPrice = item.basePrice; // All customizations are FREE
          const newTotalPrice = unitPrice * newQuantity;
          
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            totalPrice: newTotalPrice,
          };
        }
        
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  /**
   * Update item quantity
   * Elder-friendly: Simple quantity adjustment with bounds checking
   */
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      // Remove item if quantity is 0 or negative
      removeItem(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const unitPrice = item.basePrice; // All customizations are FREE
          return {
            ...item,
            quantity,
            totalPrice: unitPrice * quantity,
          };
        }
        return item;
      })
    );
  }, [removeItem]);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Get total number of items in cart
   */
  const getTotalItems = useCallback(() => items.reduce((total, item) => total + item.quantity, 0), [items]);

  /**
   * Get subtotal in cents
   */
  const getSubtotal = useCallback(() => items.reduce((total, item) => total + item.totalPrice, 0), [items]);

  /**
   * Get tax amount in cents
   */
  const getTax = useCallback(() => Math.round(getSubtotal() * APP_CONFIG.PRICING.DEFAULT_TAX_RATE), [getSubtotal]);

  /**
   * Get total with tax in cents
   */
  const getTotal = useCallback(() => getSubtotal() + getTax(), [getSubtotal, getTax]);

  /**
   * Create order from cart items
   * Elder-friendly: Automatic order creation with barista assignment
   */
  const createOrder = useCallback(
    async (customerName: string, customerPhone?: string): Promise<Order> => {
      // Generate unique order ID
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date();

      // Convert cart items to order items
      const orderItems: OrderItem[] = items.map((cartItem) => {
        const selectedOptions: {
          id: string;
          name: string;
          additionalCost: number;
          type: DrinkOptionType;
          isAvailable: boolean;
        }[] = [];

        // Size (always 12oz)
        selectedOptions.push({
          id: `size-${cartItem.size}`,
          name: cartItem.size,
          additionalCost: 0,
          type: DrinkOptionType.SIZE,
          isAvailable: true,
        });

        // Milk (if applicable)
        if (cartItem.milk) {
          selectedOptions.push({
            id: `milk-${cartItem.milk}`,
            name: `${cartItem.milk.charAt(0).toUpperCase() + cartItem.milk.slice(1)} milk`,
            additionalCost: 0,
            type: DrinkOptionType.MILK,
            isAvailable: true,
          });
        }

        // Shots (if applicable)
        if (cartItem.shots !== undefined) {
          selectedOptions.push({
            id: `shots-${cartItem.shots}`,
            name: `${cartItem.shots} shot${cartItem.shots !== 1 ? 's' : ''}`,
            additionalCost: 0,
            type: DrinkOptionType.EXTRAS,
            isAvailable: true,
          });
        }

        // Chocolate type (if applicable)
        if (cartItem.chocolateType) {
          selectedOptions.push({
            id: `chocolate-${cartItem.chocolateType}`,
            name: cartItem.chocolateType === 'white' ? 'White chocolate' : 'Chocolate',
            additionalCost: 0,
            type: DrinkOptionType.EXTRAS,
            isAvailable: true,
          });
        }

        // Syrup (if applicable)
        if (cartItem.syrup) {
          selectedOptions.push({
            id: `syrup-${cartItem.syrup}`,
            name: `${cartItem.syrup} syrup`,
            additionalCost: 0,
            type: DrinkOptionType.EXTRAS,
            isAvailable: true,
          });
        }

        // Dirty (if applicable)
        if (cartItem.isDirty) {
          selectedOptions.push({
            id: 'dirty',
            name: 'Dirty',
            additionalCost: 0,
            type: DrinkOptionType.EXTRAS,
            isAvailable: true,
          });
        }

        // Cream (if applicable)
        if (cartItem.hasCream) {
          selectedOptions.push({
            id: 'cream',
            name: 'With cream',
            additionalCost: 0,
            type: DrinkOptionType.EXTRAS,
            isAvailable: true,
          });
        }

        return {
          id: cartItem.id,
          drinkId: cartItem.drinkId,
          drinkName: cartItem.drinkName,
          quantity: cartItem.quantity,
          selectedOptions,
          totalPrice: cartItem.totalPrice,
        };
      });

      // Assign a random barista from the default list
      const randomBarista =
        APP_CONFIG.BARISTAS[Math.floor(Math.random() * APP_CONFIG.BARISTAS.length)];

      // Calculate estimated completion time
      const estimatedTime = new Date(
        now.getTime() + APP_CONFIG.ORDERS.DEFAULT_PREP_TIME_MINUTES * 60 * 1000
      );

      // Create order object
      const order: Order = {
        id: orderId,
        customerName,
        ...(customerPhone && { customerPhone }),
        items: orderItems,
        totalAmount: getTotal(),
        status: 'pending' as OrderStatus,
        createdAt: now,
        updatedAt: now,
        ...(randomBarista && { assignedBarista: randomBarista }),
        estimatedCompletionTime: estimatedTime,
      };

      // Save order to storage
      try {
        const existingOrders = await StorageService.getOrders();
        await StorageService.saveOrders([...existingOrders, order]);
      } catch (error) {
        // Elder-friendly: Log error but don't throw
        // Order is still created and returned to UI
        // eslint-disable-next-line no-console
        console.error('Failed to save order to storage:', error);
      }

      // Print label (if printer is configured)
      try {
        const printerIP = await StorageService.getSetting('printerIP');

        if (printerIP && labelViewRef.current) {
          // Format the label text from the order
          const labelFormat = formatLabelText(order);

          // eslint-disable-next-line no-console
          console.log('Printing label:', labelFormat);
          // eslint-disable-next-line no-console
          console.log('Printer IP:', printerIP);

          // Print the label
          await PrintService.printLabel(
            labelFormat,
            { ipAddress: printerIP, modelName: 'QL-810W' },
            labelViewRef.current
          );

          // eslint-disable-next-line no-console
          console.log('Label printed successfully');
        } else {
          // eslint-disable-next-line no-console
          console.log('Skipping print - printer not configured or label view not ready');
          // eslint-disable-next-line no-console
          console.log('printerIP:', printerIP);
          // eslint-disable-next-line no-console
          console.log('labelViewRef.current:', labelViewRef.current);
        }
      } catch (printError) {
        // eslint-disable-next-line no-console
        console.error('Failed to print label:', printError);
        // Show alert but don't prevent order from completing
        Alert.alert(
          'Print Failed',
          'The label could not be printed, but your order was placed successfully.',
          [{ text: 'OK' }]
        );
      }

      // Clear cart after order creation
      clearCart();

      return order;
    },
    [items, getTotal, clearCart]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalItems,
        getSubtotal,
        getTax,
        getTotal,
        createOrder,
      }}
    >
      {children}
      {/* Hidden label view for printing - positioned off-screen */}
      <View style={{ position: 'absolute', left: -10000, top: -10000 }}>
        <LabelView
          ref={labelViewRef}
          labelFormat={{ line1: 'Loading...', line2: 'Please wait' }}
        />
      </View>
    </CartContext.Provider>
  );
}

/**
 * Custom hook to access cart context
 * 
 * Elder-friendly: Simple API for consuming cart in components
 * 
 * @returns CartContextValue with cart items and operations
 * @throws Error if used outside CartProvider
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
