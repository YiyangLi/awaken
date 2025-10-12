import type { Order, OrderItem } from '../types';

export interface LabelFormat {
  line1: string; // Customer name (max 20 chars)
  line2: string; // Drink summary (max 30 chars)
}

/**
 * Format order for Brother P-touch label printer
 * Label size: 2.4" × 1.1"
 * Line 1: Font 18, max 20 chars
 * Line 2: Font 12, max 30 chars
 */
export const formatLabelText = (order: Order): LabelFormat => {
  // Line 1: Customer name (truncate if > 20 chars)
  const line1 = truncateName(order.customerName, 20);

  // Line 2: Drink summary (first item only for simplicity)
  const firstItem = order.items[0];
  const line2 = firstItem ? formatDrinkSummary(firstItem, 30) : 'No items';

  return { line1, line2 };
};

/**
 * Truncate name with ellipsis if too long
 */
const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) {return name;}
  return `${name.substring(0, maxLength - 3)  }...`;
};

/**
 * Format drink with customizations
 * Uses abbreviations to fit in 30 chars
 */
const formatDrinkSummary = (item: OrderItem, maxLength: number): string => {
  const parts: string[] = [];

  // 1. Drink name (abbreviated)
  parts.push(abbreviateDrinkName(item));

  // 2. Extract customizations from selectedOptions
  const milk = getMilkType(item);
  const shots = getShots(item);
  const syrup = getSyrupFlavor(item);
  const isDirty = getIsDirty(item);
  const hasCream = getHasCream(item);

  // 3. Add customizations in priority order
  if (shots !== getDefaultShots(item.drinkName)) {
    parts.push(`${shots} shot${shots > 1 ? 's' : ''}`);
  }

  if (milk === 'oat') {
    parts.push('oat');
  }

  if (syrup) {
    parts.push(abbreviateSyrup(syrup));
  }

  if (isDirty) {
    parts.push('dirty');
  }

  if (hasCream) {
    parts.push('+cream');
  }

  // Join and truncate if needed
  let summary = parts.join(' ');
  if (summary.length > maxLength) {
    summary = `${summary.substring(0, maxLength - 3)  }...`;
  }

  return summary;
};

/**
 * Abbreviate drink names
 */
const abbreviateDrinkName = (item: OrderItem): string => {
  const name = item.drinkName.toLowerCase();
  const chocolate = getChocolateType(item);

  if (name.includes('mocha')) {return 'Mocha';}
  if (name.includes('chai')) {return 'Chai';}
  if (name.includes('latte')) {return 'Latte';}
  if (name.includes('hot chocolate')) {
    return chocolate === 'white' ? 'Y Choco' : 'H Choco';
  }
  if (name.includes('americano')) {return 'Americano';}
  if (name.includes('italian soda') || name.includes('soda')) {return 'Soda';}

  // Fallback: return original name (shouldn't happen)
  return item.drinkName;
};

/**
 * Abbreviate syrup names if needed
 */
const abbreviateSyrup = (syrup: string): string => {
  if (syrup.length <= 8) {return syrup;} // Short enough

  // Abbreviate long syrup names
  const abbrevMap: Record<string, string> = {
    Watermelon: 'Wtrm',
    Blueberry: 'Blbry',
    Strawberry: 'Strw',
  };

  return abbrevMap[syrup] ?? syrup.substring(0, 4);
};

// Helper functions to extract customizations from OrderItem
const getMilkType = (item: OrderItem): 'whole' | 'oat' | null => {
  const milkOption = item.selectedOptions.find((opt) => opt.id.startsWith('milk-'));
  if (!milkOption) {return null;}
  if (milkOption.id === 'milk-oat') {return 'oat';}
  if (milkOption.id === 'milk-whole') {return 'whole';}
  return null;
};

const getShots = (item: OrderItem): number => {
  const shotOption = item.selectedOptions.find((opt) => opt.id.startsWith('shots-'));
  if (!shotOption) {return 0;}
  const match = shotOption.id.match(/shots-(\d+)/);
  return match?.[1] ? parseInt(match[1], 10) : 0;
};

const getDefaultShots = (drinkName: string): number => {
  const name = drinkName.toLowerCase();
  if (name.includes('mocha') || name.includes('latte') || name.includes('americano')) {
    return 2; // Default for espresso drinks
  }
  return 0; // No default for other drinks
};

const getChocolateType = (item: OrderItem): 'regular' | 'white' | null => {
  const chocolateOption = item.selectedOptions.find((opt) => opt.id.startsWith('chocolate-'));
  if (!chocolateOption) {return null;}
  if (chocolateOption.id === 'chocolate-white') {return 'white';}
  if (chocolateOption.id === 'chocolate-regular') {return 'regular';}
  return null;
};

const getSyrupFlavor = (item: OrderItem): string | null => {
  const syrupOption = item.selectedOptions.find((opt) => opt.id.startsWith('syrup-'));
  if (!syrupOption) {return null;}
  // Extract syrup name from id (e.g., "syrup-Vanilla" -> "Vanilla")
  const match = syrupOption.id.match(/syrup-(.+)/);
  return match?.[1] ?? null;
};

const getIsDirty = (item: OrderItem): boolean => item.selectedOptions.some((opt) => opt.id === 'dirty');

const getHasCream = (item: OrderItem): boolean => item.selectedOptions.some((opt) => opt.id === 'cream');
