import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts';
import { StorageService } from '@/storage';
import * as Haptics from 'expo-haptics';
import {
  filterOrdersByDateRange,
  calculateInventoryStats,
  formatDateRange,
  type DateRangeFilter,
  type InventoryStats,
} from '@/utils/inventory';

/**
 * Inventory Analysis Dashboard
 *
 * Simple form-based inventory list with date range filter buttons.
 * Shows only non-zero values for easy scanning.
 *
 * Elder-friendly features:
 * - Large text (24pt labels, 28pt values)
 * - 5 filter buttons (Today, This Week, This Month, 3 Months, This Year)
 * - Simple list format (no complex cards)
 * - Pull-to-refresh
 */
export default function InventoryScreen() {
  const { theme } = useTheme();

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('today');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<InventoryStats | null>(null);

  // Load orders and calculate stats on mount and filter changes
  useEffect(() => {
    loadAndCalculateStats();
  }, [dateFilter]);

  /**
   * Load orders from storage and calculate statistics
   */
  const loadAndCalculateStats = async () => {
    try {
      const allOrders = await StorageService.getOrders();
      const filtered = filterOrdersByDateRange(allOrders, dateFilter);
      const calculatedStats = calculateInventoryStats(filtered);

      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setStats(null);
    }
  };

  /**
   * Pull-to-refresh handler
   */
  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await loadAndCalculateStats();
    setRefreshing(false);
  };

  /**
   * Render date filter pill button
   */
  const renderDateFilterPill = (filter: DateRangeFilter, label: string) => {
    const isSelected = dateFilter === filter;

    return (
      <Pressable
        key={filter}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setDateFilter(filter);
        }}
        style={({ pressed }) => [
          styles.filterPill,
          {
            backgroundColor: isSelected
              ? theme.colors.PRIMARY
              : theme.colors.SURFACE,
            borderColor: isSelected
              ? theme.colors.PRIMARY
              : theme.colors.DIVIDER,
            minHeight: theme.touchTargets.COMFORTABLE, // 56pt
            borderRadius: 28,
            paddingHorizontal: theme.spacing.MD,
            paddingVertical: theme.spacing.SM,
            borderWidth: 2,
            marginRight: theme.spacing.SM,
            marginBottom: theme.spacing.SM,
            ...theme.shadows.SM,
          },
          pressed && styles.filterPillPressed,
        ]}
        accessibilityLabel={`Show orders from ${label}`}
        accessibilityState={{ selected: isSelected }}
        accessibilityRole="button"
      >
        <Text
          style={{
            color: isSelected ? '#FFFFFF' : theme.colors.TEXT_PRIMARY,
            fontSize: theme.typography.FONT_SIZES.BODY,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  /**
   * Render a single inventory item row
   */
  const renderInventoryItem = (label: string, value: number) => {
    if (value === 0) {return null;}

    return (
      <View
        key={label}
        style={[
          styles.itemRow,
          {
            paddingVertical: theme.spacing.MD,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.DIVIDER,
          },
        ]}
      >
        <Text
          style={[
            styles.itemLabel,
            {
              fontSize: 24,
              color: theme.colors.TEXT_PRIMARY,
              fontWeight: '600',
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.itemValue,
            {
              fontSize: 28,
              color: theme.colors.PRIMARY,
              fontWeight: '700',
            },
          ]}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.BACKGROUND },
      ]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Date Range Filter Pills */}
      <View
        style={[
          styles.filterContainer,
          {
            padding: theme.spacing.MD,
            flexDirection: 'row',
            flexWrap: 'wrap',
          },
        ]}
      >
        {renderDateFilterPill('today', 'Today')}
        {renderDateFilterPill('week', 'This Week')}
        {renderDateFilterPill('month', 'This Month')}
        {renderDateFilterPill('threeMonths', '3 Months')}
        {renderDateFilterPill('year', 'This Year')}
      </View>

      {/* Date Range Display */}
      <View
        style={{
          paddingHorizontal: theme.spacing.MD,
          marginBottom: theme.spacing.MD,
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.FONT_SIZES.BODY,
            color: theme.colors.TEXT_SECONDARY,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {formatDateRange(dateFilter)}
        </Text>
      </View>

      {/* Inventory List */}
      {stats && stats.totalOrders > 0 ? (
        <View
          style={[
            styles.inventoryList,
            {
              marginHorizontal: theme.spacing.MD,
              backgroundColor: theme.colors.SURFACE,
              borderRadius: 12,
              padding: theme.spacing.MD,
              ...theme.shadows.SM,
            },
          ]}
        >
          {/* Orders */}
          {renderInventoryItem('Orders', stats.totalOrders)}

          {/* Espresso */}
          {renderInventoryItem('Espresso', stats.shots.total)}

          {/* Whole Milk */}
          {renderInventoryItem('Whole Milk', stats.milk.whole)}

          {/* Oat Milk */}
          {renderInventoryItem('Oat Milk', stats.milk.oat)}

          {/* Regular Chocolate */}
          {renderInventoryItem('Regular Chocolate', stats.chocolate.regular)}

          {/* White Chocolate */}
          {renderInventoryItem('White Chocolate', stats.chocolate.white)}

          {/* Chai (includes both regular and dirty) */}
          {renderInventoryItem(
            'Chai',
            stats.other.regularChai + stats.other.dirtyChai
          )}

          {/* Cream */}
          {renderInventoryItem('Cream', stats.other.withCream)}

          {/* Syrups (dynamic based on usage) */}
          {Object.entries(stats.syrups)
            .filter(([, count]) => count > 0) // Only show syrups with usage
            .sort(([, a], [, b]) => b - a) // Sort by usage (highest first)
            .map(([syrupName, count]) =>
              renderInventoryItem(`${syrupName} Syrup`, count)
            )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyTitle,
              {
                fontSize: theme.typography.FONT_SIZES.HEADING,
                color: theme.colors.TEXT_PRIMARY,
                fontWeight: '700',
                marginBottom: theme.spacing.SM,
              },
            ]}
          >
            No Orders Found
          </Text>
          <Text
            style={[
              styles.emptyMessage,
              {
                fontSize: theme.typography.FONT_SIZES.BODY,
                color: theme.colors.TEXT_SECONDARY,
                textAlign: 'center',
              },
            ]}
          >
            No orders found in the selected date range.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  filterContainer: {
    marginTop: 16,
  },
  filterPill: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  inventoryList: {
    // Styles applied inline with theme
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    flex: 1,
  },
  itemValue: {
    // Styles applied inline with theme
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    // Styles applied inline with theme
  },
  emptyMessage: {
    // Styles applied inline with theme
  },
});
