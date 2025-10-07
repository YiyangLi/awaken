/**
 * Inventory Analysis Utilities
 *
 * Calculation functions for analyzing order history and ingredient consumption.
 * Helps coffee cart operators plan inventory based on actual usage patterns.
 */

import type { Order, OrderItem } from '../types';

/**
 * Date range filter types
 */
export type DateRangeFilter = 'today' | 'week' | 'month' | 'threeMonths' | 'year';

/**
 * Comprehensive inventory statistics interface
 */
export interface InventoryStats {
  /** Total number of orders in the selected date range */
  totalOrders: number;

  /** Count of drinks by name */
  drinkCounts: { [drinkName: string]: number };

  /** Milk usage breakdown */
  milk: {
    whole: number;
    oat: number;
  };

  /** Espresso shots statistics */
  shots: {
    total: number;
    byDrink: { [drinkName: string]: number };
  };

  /** Chocolate usage breakdown */
  chocolate: {
    regular: number;
    white: number;
  };

  /** Syrup consumption by flavor (dynamic based on available syrups) */
  syrups: { [syrupName: string]: number };

  /** Other ingredients */
  other: {
    regularChai: number;  // Regular chai (not dirty)
    dirtyChai: number;    // Dirty chai (with shots)
    withCream: number;
  };
}

/**
 * Extract milk type from order item's selected options
 *
 * @param item - Order item with selected customizations
 * @returns Milk type ('whole', 'oat') or null if no milk
 */
const getMilkType = (item: OrderItem): 'whole' | 'oat' | null => {
  const milkOption = item.selectedOptions.find(opt => opt.id.startsWith('milk-'));
  if (!milkOption) {return null;}

  if (milkOption.id === 'milk-whole') {return 'whole';}
  if (milkOption.id === 'milk-oat') {return 'oat';}
  return null;
};

/**
 * Extract espresso shot count from order item's selected options
 *
 * @param item - Order item with selected customizations
 * @returns Number of shots (0-4)
 */
const getShots = (item: OrderItem): number => {
  const shotOption = item.selectedOptions.find(opt => opt.id.startsWith('shots-'));
  if (!shotOption) {return 0;}

  // Extract number from "shots-2" -> 2
  const match = shotOption.id.match(/shots-(\d+)/);
  return match?.[1] ? parseInt(match[1], 10) : 0;
};

/**
 * Extract chocolate type from order item's selected options
 *
 * @param item - Order item with selected customizations
 * @returns Chocolate type ('regular', 'white') or null
 */
const getChocolateType = (item: OrderItem): 'regular' | 'white' | null => {
  const chocolateOption = item.selectedOptions.find(opt =>
    opt.id.startsWith('chocolate-')
  );
  if (!chocolateOption) {return null;}

  if (chocolateOption.id === 'chocolate-regular') {return 'regular';}
  if (chocolateOption.id === 'chocolate-white') {return 'white';}
  return null;
};

/**
 * Extract syrup flavor from order item's selected options
 *
 * @param item - Order item with selected customizations
 * @returns Syrup flavor ('vanilla', 'caramel', 'hazelnut') or null
 */
const getSyrupType = (item: OrderItem): string | null => {
  const syrupOption = item.selectedOptions.find(opt => opt.id.startsWith('syrup-'));
  if (!syrupOption) {return null;}

  // Extract syrup name from "syrup-vanilla" -> "vanilla"
  const match = syrupOption.id.match(/syrup-(.+)/);
  return match?.[1] ?? null;
};

/**
 * Check if drink is a Dirty Chai
 *
 * @param item - Order item with selected customizations
 * @returns True if drink is dirty
 */
const isDirty = (item: OrderItem): boolean => item.selectedOptions.some(opt => opt.id === 'dirty');

/**
 * Check if drink has cream (Italian Soda)
 *
 * @param item - Order item with selected customizations
 * @returns True if cream is added
 */
const hasCream = (item: OrderItem): boolean => item.selectedOptions.some(opt => opt.id === 'cream');

/**
 * Filter orders by date range
 * Reuses pattern from LCC_13 order management dashboard
 *
 * @param orders - All orders to filter
 * @param filter - Date range filter type
 * @returns Filtered orders within the specified date range
 */
export const filterOrdersByDateRange = (
  orders: Order[],
  filter: DateRangeFilter
): Order[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return orders.filter(order => new Date(order.createdAt) >= today);

    case 'week': {
      // Last 7 days
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orders.filter(order => new Date(order.createdAt) >= weekAgo);
    }

    case 'month': {
      // First day of current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return orders.filter(order => new Date(order.createdAt) >= monthStart);
    }

    case 'threeMonths': {
      // Last 3 months (90 days)
      const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return orders.filter(order => new Date(order.createdAt) >= threeMonthsAgo);
    }

    case 'year': {
      // First day of current year
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return orders.filter(order => new Date(order.createdAt) >= yearStart);
    }

    default:
      return orders;
  }
};

/**
 * Calculate comprehensive inventory statistics from orders
 *
 * Aggregates all ingredient usage across all orders in the provided list.
 * Elder-friendly: Clear categorization for easy inventory planning.
 *
 * @param orders - Filtered orders to analyze
 * @returns Comprehensive statistics for inventory planning
 */
export const calculateInventoryStats = (orders: Order[]): InventoryStats => {
  const stats: InventoryStats = {
    totalOrders: orders.length,
    drinkCounts: {},
    milk: { whole: 0, oat: 0 },
    shots: { total: 0, byDrink: {} },
    chocolate: { regular: 0, white: 0 },
    syrups: {},
    other: { regularChai: 0, dirtyChai: 0, withCream: 0 },
  };

  // Iterate through all orders and their items
  orders.forEach(order => {
    order.items.forEach(item => {
      const qty = item.quantity;

      // Count drinks by name
      stats.drinkCounts[item.drinkName] =
        (stats.drinkCounts[item.drinkName] || 0) + qty;

      // Count milk usage
      const milk = getMilkType(item);
      if (milk === 'whole') {stats.milk.whole += qty;}
      if (milk === 'oat') {stats.milk.oat += qty;}

      // Count espresso shots
      const shots = getShots(item);
      if (shots > 0) {
        stats.shots.total += shots * qty;
        stats.shots.byDrink[item.drinkName] =
          (stats.shots.byDrink[item.drinkName] || 0) + (shots * qty);
      }

      // Count chocolate usage
      const chocolate = getChocolateType(item);
      if (chocolate === 'regular') {stats.chocolate.regular += qty;}
      if (chocolate === 'white') {stats.chocolate.white += qty;}

      // Count syrup consumption (dynamic for all syrup flavors)
      const syrup = getSyrupType(item);
      if (syrup) {
        stats.syrups[syrup] = (stats.syrups[syrup] || 0) + qty;
      }

      // Count chai orders
      // Chai Latte is identified by drink name
      const isChaiLatte = item.drinkName.toLowerCase().includes('chai');
      if (isChaiLatte) {
        if (isDirty(item)) {
          stats.other.dirtyChai += qty;
        } else {
          stats.other.regularChai += qty;
        }
      }

      // Count cream (Italian Soda)
      if (hasCream(item)) {stats.other.withCream += qty;}
    });
  });

  return stats;
};

/**
 * Format date range for display
 * Elder-friendly: Clear, readable date range descriptions
 *
 * @param filter - Date range filter type
 * @returns Human-readable date range string
 */
export const formatDateRange = (filter: DateRangeFilter): string => {
  const now = new Date();

  switch (filter) {
    case 'today':
      return now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    case 'month':
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    case 'threeMonths': {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return `${threeMonthsAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    case 'year':
      return now.toLocaleDateString('en-US', { year: 'numeric' });

    default:
      return 'All Time';
  }
};
