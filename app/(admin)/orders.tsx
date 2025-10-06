import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts';
import { useModal } from '@/components/ModalProvider';
import { StorageService } from '@/storage';
import { OrderStatus, type Order } from '@/types';
import * as Haptics from 'expo-haptics';

/**
 * Order Management Dashboard for Admin
 *
 * Elder-friendly admin interface for managing coffee orders with:
 * - Responsive 2-column grid on iPad landscape
 * - Color-coded order cards by status
 * - Quick action buttons for status updates
 * - Search and filter capabilities
 * - Modal confirmations for critical actions
 * - VoiceOver accessibility throughout
 */
export default function OrdersScreen() {
  const { theme } = useTheme();
  const { showConfirmation } = useModal();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('today');

  // Detect iPad landscape for responsive grid
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const isLandscapeGrid = windowWidth >= 1024;
  const numColumns = isLandscapeGrid ? 2 : 1;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  // Load orders when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  // Apply filters when orders, statusFilter, searchQuery, or dateFilter change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, statusFilter, searchQuery, dateFilter]);

  /**
   * Load orders from storage
   * Elder-friendly: Graceful error handling
   */
  const loadOrders = async () => {
    try {
      const loadedOrders = await StorageService.getOrders();
      // Sort by creation date (newest first)
      const sortedOrders = loadedOrders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load orders:', error);
    }
  };

  /**
   * Apply filters to orders
   * Filters by status, search query, and date range
   */
  const applyFilters = () => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter (customer name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(query)
      );
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (dateFilter === 'today') {
      filtered = filtered.filter(order =>
        new Date(order.createdAt) >= today
      );
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(order =>
        new Date(order.createdAt) >= weekAgo
      );
    }

    setFilteredOrders(filtered);
  };

  /**
   * Pull-to-refresh handler
   * Elder-friendly: Haptic feedback confirms action
   */
  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  /**
   * Update order status
   * Elder-friendly: Automatic persistence
   */
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      );

      await StorageService.saveOrders(updatedOrders);
      setOrders(updatedOrders);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update order status:', error);
    }
  };

  /**
   * Handle cancel order action with confirmation modal
   * Elder-friendly: Clear warning before destructive action
   */
  const handleCancelOrder = (orderId: string) => {
    showConfirmation({
      title: 'Cancel Order?',
      message: 'This order will be marked as cancelled and cannot be undone.',
      confirmText: 'Cancel Order',
      cancelText: 'Keep Order',
      confirmColor: theme.colors.ERROR,
      onConfirm: async () => {
        await updateOrderStatus(orderId, OrderStatus.CANCELLED);
      },
    });
  };

  /**
   * Get status color based on order status
   * Elder-friendly: High contrast color coding
   */
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return theme.colors.WARNING;
      case OrderStatus.IN_PROGRESS:
        return theme.colors.INFO;
      case OrderStatus.READY:
        return theme.colors.SUCCESS;
      case OrderStatus.COMPLETED:
        return theme.colors.TEXT_DISABLED;
      case OrderStatus.CANCELLED:
        return theme.colors.ERROR;
      default:
        return theme.colors.TEXT_SECONDARY;
    }
  };

  /**
   * Get status badge text
   * Elder-friendly: Clear, readable status labels
   */
  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.IN_PROGRESS:
        return 'In Progress';
      case OrderStatus.READY:
        return 'Ready';
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  /**
   * Get count of orders by status
   */
  const getStatusCount = (status: OrderStatus | 'all'): number => {
    if (status === 'all') {
      return orders.length;
    }
    return orders.filter(order => order.status === status).length;
  };

  /**
   * Format timestamp for display
   * Elder-friendly: Readable time format
   */
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return orderDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  /**
   * Render order card
   * Elder-friendly: Large touch targets, clear visual hierarchy
   */
  const renderOrderCard = ({ item: order }: { item: Order }) => {
    const statusColor = getStatusColor(order.status);
    const statusLabel = getStatusLabel(order.status);
    const canTransition = [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.READY].includes(order.status);

    // Get next status and action label
    let nextStatus: OrderStatus | null = null;
    let nextActionLabel = '';

    if (order.status === OrderStatus.PENDING) {
      nextStatus = OrderStatus.IN_PROGRESS;
      nextActionLabel = 'Start';
    } else if (order.status === OrderStatus.IN_PROGRESS) {
      nextStatus = OrderStatus.READY;
      nextActionLabel = 'Ready';
    } else if (order.status === OrderStatus.READY) {
      nextStatus = OrderStatus.COMPLETED;
      nextActionLabel = 'Complete';
    }

    return (
      <View
        style={[
          styles.orderCard,
          {
            backgroundColor: theme.colors.SURFACE,
            borderLeftColor: statusColor,
            marginHorizontal: theme.spacing.MD,
            marginBottom: theme.spacing.XXL,
            ...theme.shadows.MD,
          },
        ]}
        accessibilityLabel={`Order from ${order.customerName}, ${order.items.length} item${order.items.length > 1 ? 's' : ''}, status ${statusLabel}${order.assignedBarista ? `, assigned to ${order.assignedBarista}` : ''}`}
        accessibilityRole="button"
      >
        {/* Header with customer name and timestamp */}
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.customerName,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: 24,
                fontWeight: '700',
              },
            ]}
            numberOfLines={1}
          >
            {order.customerName}
          </Text>
          <Text
            style={[
              styles.timestamp,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            {formatTimestamp(order.createdAt)}
          </Text>
        </View>

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusColor,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: '#FFFFFF',
                fontSize: theme.typography.FONT_SIZES.BODY,
                fontWeight: '700',
              },
            ]}
          >
            {statusLabel}
          </Text>
        </View>

        {/* Drink list */}
        <View style={styles.drinkList}>
          {order.items.map((item, index) => (
            <Text
              key={index}
              style={[
                styles.drinkItem,
                {
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              {item.quantity}x {item.drinkName}
            </Text>
          ))}
        </View>

        {/* Assigned barista */}
        {order.assignedBarista && (
          <Text
            style={[
              styles.barista,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            Barista: {order.assignedBarista}
          </Text>
        )}

        {/* Quick action buttons */}
        {canTransition && (
          <View style={styles.actionButtons}>
            {nextStatus && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  updateOrderStatus(order.id, nextStatus);
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.primaryAction,
                  {
                    backgroundColor: theme.colors.PRIMARY,
                    minHeight: 64,
                    ...theme.shadows.SM,
                  },
                  pressed && styles.buttonPressed,
                ]}
                accessibilityLabel={`Mark order as ${getStatusLabel(nextStatus)}`}
                accessibilityHint="Double tap to update order status"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: '#FFFFFF',
                      fontSize: theme.typography.FONT_SIZES.HEADING,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {nextActionLabel}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleCancelOrder(order.id);
              }}
              style={({ pressed }) => [
                styles.actionButton,
                styles.secondaryAction,
                {
                  backgroundColor: theme.colors.SURFACE,
                  borderColor: theme.colors.ERROR,
                  borderWidth: 2,
                  minHeight: 64,
                  ...theme.shadows.SM,
                },
                pressed && styles.buttonPressed,
              ]}
              accessibilityLabel="Cancel order"
              accessibilityHint="Double tap to cancel this order"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: theme.colors.ERROR,
                    fontSize: theme.typography.FONT_SIZES.HEADING,
                    fontWeight: '700',
                  },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  /**
   * Render filter pill button
   * Elder-friendly: 56pt height, clear selection state
   */
  const renderFilterPill = (
    status: OrderStatus | 'all',
    label: string
  ) => {
    const isSelected = statusFilter === status;
    const count = getStatusCount(status);

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStatusFilter(status);
        }}
        style={({ pressed }) => [
          styles.filterPill,
          {
            backgroundColor: isSelected ? theme.colors.PRIMARY : theme.colors.SURFACE,
            borderColor: isSelected ? theme.colors.PRIMARY : theme.colors.DIVIDER,
            minHeight: 56,
            ...theme.shadows.SM,
          },
          pressed && styles.buttonPressed,
        ]}
        accessibilityLabel={`Filter by ${label}, ${count} order${count !== 1 ? 's' : ''}`}
        accessibilityState={{ selected: isSelected }}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.filterPillText,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.TEXT_PRIMARY,
              fontSize: theme.typography.FONT_SIZES.BODY,
              fontWeight: '600',
            },
          ]}
        >
          {label} ({count})
        </Text>
      </Pressable>
    );
  };

  /**
   * Render date filter pill
   */
  const renderDateFilterPill = (
    filter: 'today' | 'week' | 'all',
    label: string
  ) => {
    const isSelected = dateFilter === filter;

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setDateFilter(filter);
        }}
        style={({ pressed }) => [
          styles.filterPill,
          {
            backgroundColor: isSelected ? theme.colors.SECONDARY : theme.colors.SURFACE,
            borderColor: isSelected ? theme.colors.SECONDARY : theme.colors.DIVIDER,
            minHeight: 56,
            ...theme.shadows.SM,
          },
          pressed && styles.buttonPressed,
        ]}
        accessibilityLabel={`Show orders from ${label}`}
        accessibilityState={{ selected: isSelected }}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.filterPillText,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.TEXT_PRIMARY,
              fontSize: theme.typography.FONT_SIZES.BODY,
              fontWeight: '600',
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  /**
   * Render empty state
   * Elder-friendly: Helpful context-aware message
   */
  const renderEmptyState = () => {
    let message = 'No orders found';

    if (searchQuery.trim()) {
      message = `No orders found for "${searchQuery}"`;
    } else if (statusFilter !== 'all') {
      message = `No ${getStatusLabel(statusFilter).toLowerCase()} orders`;
    } else if (dateFilter === 'today') {
      message = 'No orders today';
    } else if (dateFilter === 'week') {
      message = 'No orders this week';
    }

    return (
      <View style={styles.emptyState}>
        <Text
          style={[
            styles.emptyStateText,
            {
              color: theme.colors.TEXT_SECONDARY,
              fontSize: theme.typography.FONT_SIZES.HEADING,
            },
          ]}
        >
          {message}
        </Text>
        <Text
          style={[
            styles.emptyStateHint,
            {
              color: theme.colors.TEXT_DISABLED,
              fontSize: theme.typography.FONT_SIZES.BODY,
            },
          ]}
        >
          Try adjusting your filters
        </Text>
      </View>
    );
  };

  // Key extractor for FlatList to force re-render on column change
  const keyExtractor = (item: Order) => `${item.id}-${numColumns}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      {/* Search bar */}
      <View style={[styles.searchContainer, { paddingHorizontal: theme.spacing.MD }]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.SURFACE,
              borderColor: theme.colors.DIVIDER,
              color: theme.colors.TEXT_PRIMARY,
              fontSize: theme.typography.FONT_SIZES.BODY,
              minHeight: 56,
              ...theme.shadows.SM,
            },
          ]}
          placeholder="Search by customer name..."
          placeholderTextColor={theme.colors.TEXT_DISABLED}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search orders by customer name"
          accessibilityRole="search"
        />
      </View>

      {/* Status filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.filterRow,
          { paddingHorizontal: theme.spacing.MD },
        ]}
      >
        {renderFilterPill('all', 'All')}
        {renderFilterPill(OrderStatus.PENDING, 'Pending')}
        {renderFilterPill(OrderStatus.IN_PROGRESS, 'In Progress')}
        {renderFilterPill(OrderStatus.READY, 'Ready')}
        {renderFilterPill(OrderStatus.COMPLETED, 'Completed')}
      </ScrollView>

      {/* Date range filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.filterRow,
          { paddingHorizontal: theme.spacing.MD },
        ]}
      >
        {renderDateFilterPill('today', 'Today')}
        {renderDateFilterPill('week', 'This Week')}
        {renderDateFilterPill('all', 'All Time')}
      </ScrollView>

      {/* Orders list */}
      <FlatList
        key={numColumns} // Force re-render when columns change
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.PRIMARY}
            accessibilityLabel="Pull to refresh orders"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInput: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  filterPill: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillText: {
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  orderCard: {
    flex: 1,
    borderLeftWidth: 6,
    borderRadius: 16,
    padding: 24,
    minHeight: 220,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    flex: 1,
    marginRight: 12,
  },
  timestamp: {
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    textAlign: 'center',
  },
  drinkList: {
    marginBottom: 12,
  },
  drinkItem: {
    fontWeight: '500',
    marginBottom: 4,
  },
  barista: {
    fontWeight: '500',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryAction: {
    // Styles applied inline
  },
  secondaryAction: {
    // Styles applied inline
  },
  actionButtonText: {
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
