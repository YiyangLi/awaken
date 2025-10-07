import { View, Text, StyleSheet, Pressable, FlatList, RefreshControl, TextInput } from 'react-native';
import { useTheme, useModal } from '@/contexts';
import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '@/src/storage/StorageService';
import type { Syrup } from '@/src/types';
import * as Haptics from 'expo-haptics';

export default function SyrupsManagementScreen() {
  const { theme } = useTheme();
  const { showConfirmation, showAlert } = useModal();

  const [syrups, setSyrups] = useState<Syrup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newSyrupName, setNewSyrupName] = useState('');

  // Load syrups from storage
  const loadSyrups = useCallback(async () => {
    try {
      const allSyrups = await StorageService.getSyrups();
      // Sort: Available first, then Sold Out, alphabetically within each group
      const sorted = allSyrups.sort((a, b) => {
        if (a.status === b.status) {
          return a.name.localeCompare(b.name);
        }
        return a.status === 'available' ? -1 : 1;
      });
      setSyrups(sorted);
    } catch (error) {
      console.error('Failed to load syrups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSyrups();
  }, [loadSyrups]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadSyrups();
  }, [loadSyrups]);

  // Add new syrup
  const handleAddSyrup = async () => {
    if (!newSyrupName || newSyrupName.trim().length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await StorageService.addSyrup({
        name: newSyrupName.trim(),
        status: 'available',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewSyrupName(''); // Clear input
      await loadSyrups();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to add syrup',
      });
    }
  };

  // Mark syrup as sold out
  const handleMarkSoldOut = (syrup: Syrup) => {
    showConfirmation({
      title: 'Mark as Sold Out?',
      message: `Mark "${syrup.name}" as sold out? It will be hidden from customer orders.`,
      confirmText: 'Mark Sold Out',
      confirmColor: theme.colors.WARNING,
      onConfirm: async () => {
        try {
          await StorageService.updateSyrupStatus(syrup.id, 'soldOut');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await loadSyrups();
        } catch (error) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          console.error('Failed to update syrup status:', error);
        }
      },
    });
  };

  // Mark syrup as available
  const handleMarkAvailable = async (syrup: Syrup) => {
    try {
      await StorageService.updateSyrupStatus(syrup.id, 'available');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadSyrups();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Failed to update syrup status:', error);
    }
  };

  // Delete syrup
  const handleDelete = (syrup: Syrup) => {
    showConfirmation({
      title: 'Delete Syrup?',
      message: `Delete "${syrup.name}"? This cannot be undone.\n\nExisting orders with this syrup will still show it in history.`,
      confirmText: 'Delete',
      confirmColor: theme.colors.ERROR,
      onConfirm: async () => {
        try {
          await StorageService.deleteSyrup(syrup.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await loadSyrups();
        } catch (error) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          console.error('Failed to delete syrup:', error);
        }
      },
    });
  };

  // Render syrup card
  const renderSyrupCard = ({ item }: { item: Syrup }) => {
    const isAvailable = item.status === 'available';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.SURFACE,
            ...theme.shadows.MD,
          },
        ]}
      >
        {/* Syrup Name and Status */}
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.syrupName,
              {
                color: theme.colors.TEXT_PRIMARY,
                fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
              },
            ]}
            accessibilityLabel={`${item.name} syrup`}
          >
            {item.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isAvailable ? theme.colors.SUCCESS : theme.colors.WARNING,
              },
            ]}
            accessibilityLabel={isAvailable ? 'Available' : 'Sold out'}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: '#FFFFFF',
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              {isAvailable ? 'Available' : 'Sold Out'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {isAvailable ? (
            <Pressable
              onPress={() => handleMarkSoldOut(item)}
              style={({ pressed }) => [
                styles.actionButton,
                styles.soldOutButton,
                {
                  backgroundColor: theme.colors.WARNING,
                  minHeight: theme.touchTargets.LARGE,
                },
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${item.name} as sold out`}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: '#FFFFFF',
                    fontSize: theme.typography.FONT_SIZES.BODY,
                  },
                ]}
              >
                Mark Sold Out
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => handleMarkAvailable(item)}
              style={({ pressed }) => [
                styles.actionButton,
                styles.availableButton,
                {
                  backgroundColor: theme.colors.SUCCESS,
                  minHeight: theme.touchTargets.LARGE,
                },
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${item.name} as available`}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: '#FFFFFF',
                    fontSize: theme.typography.FONT_SIZES.BODY,
                  },
                ]}
              >
                Mark Available
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => handleDelete(item)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              {
                backgroundColor: theme.colors.ERROR,
                minHeight: theme.touchTargets.LARGE,
              },
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: '#FFFFFF',
                  fontSize: theme.typography.FONT_SIZES.BODY,
                },
              ]}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
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
        No syrups yet
      </Text>
      <Text
        style={[
          styles.emptyStateSubtext,
          {
            color: theme.colors.TEXT_SECONDARY,
            fontSize: theme.typography.FONT_SIZES.BODY,
          },
        ]}
      >
        Enter a syrup name above to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
          >
            Loading syrups...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      {/* Add New Syrup Input Row */}
      <View style={styles.addSyrupRow}>
        <TextInput
          style={[
            styles.syrupInput,
            {
              backgroundColor: theme.colors.SURFACE,
              borderColor: theme.colors.DIVIDER,
              color: theme.colors.TEXT_PRIMARY,
              fontSize: theme.typography.FONT_SIZES.HEADING,
              minHeight: theme.touchTargets.LARGE,
            },
          ]}
          value={newSyrupName}
          onChangeText={setNewSyrupName}
          placeholder="Enter syrup name"
          placeholderTextColor={theme.colors.TEXT_DISABLED}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleAddSyrup}
          accessibilityLabel="New syrup name"
        />
        <Pressable
          onPress={handleAddSyrup}
          disabled={!newSyrupName.trim()}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: newSyrupName.trim() ? theme.colors.PRIMARY : theme.colors.SURFACE,
              minHeight: theme.touchTargets.LARGE,
              ...theme.shadows.LG,
            },
            pressed && newSyrupName.trim() && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add syrup"
          accessibilityState={{ disabled: !newSyrupName.trim() }}
        >
          <Text
            style={[
              styles.addButtonText,
              {
                color: newSyrupName.trim() ? '#FFFFFF' : theme.colors.TEXT_DISABLED,
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
          >
            Add
          </Text>
        </Pressable>
      </View>

      {/* Syrups List */}
      <FlatList
        data={syrups}
        renderItem={renderSyrupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontWeight: '600',
  },
  addSyrupRow: {
    flexDirection: 'row',
    gap: 12,
    margin: 24,
    alignItems: 'center',
  },
  syrupInput: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  syrupName: {
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusText: {
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutButton: {},
  availableButton: {},
  deleteButton: {},
  buttonText: {
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyStateText: {
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontWeight: '500',
  },
});
