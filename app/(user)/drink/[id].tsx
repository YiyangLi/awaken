import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useTheme, useCart } from '@/contexts';
import { useEffect, useState, useLayoutEffect } from 'react';
import { StorageService } from '@/storage';
import { APP_CONFIG } from '@/config';
import type { Drink, DrinkCategory } from '@/types';
import * as Haptics from 'expo-haptics';

const DRINK_DISPLAY_NAMES = {
  mocha: 'Mocha',
  'chai-latte': 'Chai Latte',
  latte: 'Latte',
  'hot-chocolate': 'Hot Chocolate',
  americano: 'Americano',
  'italian-soda': 'Italian Soda',
} as const;

export default function DrinkDetailScreen() {
  const { theme } = useTheme();
  const { addItem, clearCart } = useCart();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [drink, setDrink] = useState<Drink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Customization options (drink-specific)
  const [selectedMilk, setSelectedMilk] = useState<'whole' | 'oat'>('whole');
  const [shots, setShots] = useState<number>(APP_CONFIG.CUSTOMIZATION.SHOTS.DEFAULT);
  const [chocolateType, setChocolateType] = useState<'regular' | 'white'>('regular');
  const [selectedSyrup, setSelectedSyrup] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false); // Default false (No Espresso)
  const [hasCream, setHasCream] = useState(true); // Default to true (with cream)

  useEffect(() => {
    loadDrink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Update navigation title with drink name
  useLayoutEffect(() => {
    if (drink) {
      const displayName = DRINK_DISPLAY_NAMES[drink.category as keyof typeof DRINK_DISPLAY_NAMES] ?? drink.name;
      navigation.setOptions({
        title: `Customize ${displayName}`,
      });
    }
  }, [drink, navigation]);

  const loadDrink = async () => {
    try {
      const drinks = await StorageService.getDrinks();
      const foundDrink = drinks.find((d) => d.id === id);
      setDrink(foundDrink ?? null);
      
      // Set drink-specific defaults
      if (foundDrink) {
        // Chai Latte starts with No Espresso (0 shots, not dirty)
        if (foundDrink.category === 'chai-latte') {
          setIsDirty(false);
          setShots(0);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load drink:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShotsChange = (delta: number) => {
    const category = drink?.category;
    const minShots = category === 'chai-latte' ? 0 : 1;
    const maxShots = APP_CONFIG.CUSTOMIZATION.SHOTS.MAX;
    
    const newShots = shots + delta;
    if (newShots >= minShots && newShots <= maxShots) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShots(newShots);
      
      // For Chai Latte: update dirty status based on shots
      if (category === 'chai-latte') {
        if (newShots === 0) {
          setIsDirty(false); // No shots = No Espresso
        } else {
          setIsDirty(true); // Has shots = Dirty
        }
      }
    }
  };

  const toggleDirty = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newDirty = !isDirty;
    setIsDirty(newDirty);
    
    if (newDirty) {
      // Making it dirty: set to default shots (2)
      setShots(APP_CONFIG.CUSTOMIZATION.SHOTS.DEFAULT);
    } else {
      // Making it not dirty: set shots to 0 (No Espresso)
      setShots(0);
    }
  };

  const toggleChocolateType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChocolateType((prev) => (prev === 'regular' ? 'white' : 'regular'));
  };

  const toggleCream = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHasCream((prev) => !prev);
  };

  const handleSyrupSelect = (syrup: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSyrup(selectedSyrup === syrup ? null : syrup);
  };

  const handleReview = () => {
    if (!drink) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Clear cart first (only 1 item per order)
    clearCart();

    // Create cart item with drink-specific customizations (quantity always 1)
    const cartItem: {
      id: string;
      drinkId: string;
      drinkName: string;
      drinkCategory: DrinkCategory;
      quantity: number;
      size: string;
      milk?: 'whole' | 'oat';
      shots?: number;
      chocolateType?: 'regular' | 'white';
      syrup?: string;
      isDirty?: boolean;
      hasCream?: boolean;
      basePrice: number;
      totalPrice: number;
    } = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      drinkId: drink.id,
      drinkName: DRINK_DISPLAY_NAMES[drink.category as keyof typeof DRINK_DISPLAY_NAMES] ?? drink.name,
      drinkCategory: drink.category,
      quantity: 1, // Always 1 - each order is for one drink
      size: APP_CONFIG.CUSTOMIZATION.DEFAULT_SIZE,
      basePrice: drink.basePrice,
      totalPrice: drink.basePrice, // quantity is always 1
    };

    // Add optional properties only if they apply
    if (needsMilk(drink.category)) {
      cartItem.milk = selectedMilk;
    }
    if (needsShots(drink.category)) {
      cartItem.shots = shots;
    }
    if (needsChocolateType(drink.category)) {
      cartItem.chocolateType = chocolateType;
    }
    if (needsSyrup(drink.category) && selectedSyrup) {
      cartItem.syrup = selectedSyrup;
    }
    if (drink.category === 'chai-latte') {
      cartItem.isDirty = isDirty;
    }
    if (drink.category === 'italian-soda') {
      cartItem.hasCream = hasCream;
    }

    addItem(cartItem);
    router.push('/(user)/review');
  };

  // Helper functions to determine what options each drink needs
  const needsMilk = (category: DrinkCategory): boolean =>
    ['mocha', 'chai-latte', 'latte', 'hot-chocolate'].includes(category);

  const needsShots = (category: DrinkCategory): boolean =>
    ['mocha', 'chai-latte', 'latte', 'americano'].includes(category);

  const needsChocolateType = (category: DrinkCategory): boolean =>
    ['mocha', 'hot-chocolate'].includes(category);

  const needsSyrup = (category: DrinkCategory): boolean =>
    ['mocha', 'latte', 'italian-soda'].includes(category);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
        <Text
          style={[
            styles.loadingText,
            {
              color: theme.colors.TEXT_SECONDARY,
              fontSize: theme.typography.FONT_SIZES.BODY,
            },
          ]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  if (!drink) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
        <Text
          style={[
            styles.errorText,
            {
              color: theme.colors.ERROR,
              fontSize: theme.typography.FONT_SIZES.BODY,
            },
          ]}
        >
          Drink not found
        </Text>
      </View>
    );
  }

  const displayName = DRINK_DISPLAY_NAMES[drink.category as keyof typeof DRINK_DISPLAY_NAMES] ?? drink.name;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mocha: 3-card row layout */}
        {drink.category === 'mocha' && (
          <View style={styles.threeCardRow}>
            {/* Milk toggle card */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMilk(selectedMilk === 'whole' ? 'oat' : 'whole');
              }}
              style={({ pressed }) => [
                styles.compactCard,
                {
                  backgroundColor: selectedMilk === 'whole' ? '#FFFFFF' : '#FFF8DC',
                  borderColor: theme.colors.DIVIDER,
                  minHeight: 192,
                  ...theme.shadows.MD,
                },
                pressed && styles.optionCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${selectedMilk === 'whole' ? 'Whole' : 'Oat'} milk, tap to switch`}
            >
              <Text
                style={[
                  styles.compactCardLabel,
                  {
                    color: theme.colors.TEXT_PRIMARY,
                    fontSize: theme.typography.FONT_SIZES.HEADING,
                  },
                ]}
              >
                {selectedMilk === 'whole' ? 'Whole Milk' : 'Oat Milk'}
              </Text>
              <Text
                style={[
                  styles.compactCardSubtitle,
                  {
                    color: theme.colors.TEXT_SECONDARY,
                    fontSize: theme.typography.FONT_SIZES.SMALL,
                  },
                ]}
              >
                (tap to switch)
              </Text>
            </Pressable>

            {/* Shots card */}
            <View
              style={[
                styles.compactCard,
                {
                  backgroundColor: `rgba(101, 67, 33, ${0.1 + (shots * 0.15)})`,
                  borderColor: theme.colors.DIVIDER,
                  minHeight: 192,
                  ...theme.shadows.MD,
                },
              ]}
            >
              <Text
                style={[
                  styles.compactCardTitle,
                  {
                    color: theme.colors.TEXT_SECONDARY,
                    fontSize: theme.typography.FONT_SIZES.BODY,
                  },
                ]}
              >
                Shots
              </Text>
              <View style={styles.shotsControls}>
                <Pressable
                  onPress={() => {handleShotsChange(-1);}}
                  disabled={shots <= 1}
                  style={({ pressed }) => [
                    styles.compactButton,
                    {
                      backgroundColor: shots <= 1 ? theme.colors.SURFACE : theme.colors.PRIMARY,
                      minWidth: theme.touchTargets.COMFORTABLE,
                      minHeight: theme.touchTargets.COMFORTABLE,
                      ...theme.shadows.SM,
                    },
                    pressed && shots > 1 && styles.quantityButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease shots"
                >
                  <Text
                    style={[
                      styles.compactButtonText,
                      {
                        color: shots <= 1 ? theme.colors.TEXT_DISABLED : '#FFFFFF',
                        fontSize: theme.typography.FONT_SIZES.HEADING,
                      },
                    ]}
                  >
                    −
                  </Text>
                </Pressable>

                <Text
                  style={[
                    styles.shotsValue,
                    {
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.TITLE,
                    },
                  ]}
                >
                  {shots}
                </Text>

                <Pressable
                  onPress={() => {handleShotsChange(1);}}
                  disabled={shots >= APP_CONFIG.CUSTOMIZATION.SHOTS.MAX}
                  style={({ pressed }) => [
                    styles.compactButton,
                    {
                      backgroundColor:
                        shots >= APP_CONFIG.CUSTOMIZATION.SHOTS.MAX
                          ? theme.colors.SURFACE
                          : theme.colors.PRIMARY,
                      minWidth: theme.touchTargets.COMFORTABLE,
                      minHeight: theme.touchTargets.COMFORTABLE,
                      ...theme.shadows.SM,
                    },
                    pressed && shots < APP_CONFIG.CUSTOMIZATION.SHOTS.MAX && styles.quantityButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Increase shots"
                >
                  <Text
                    style={[
                      styles.compactButtonText,
                      {
                        color:
                          shots >= APP_CONFIG.CUSTOMIZATION.SHOTS.MAX
                            ? theme.colors.TEXT_DISABLED
                            : '#FFFFFF',
                        fontSize: theme.typography.FONT_SIZES.HEADING,
                      },
                    ]}
                  >
                    +
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Chocolate type toggle card */}
            <Pressable
              onPress={toggleChocolateType}
              style={({ pressed }) => [
                styles.compactCard,
                {
                  backgroundColor: chocolateType === 'regular' ? '#8B4513' : '#FFFFFF',
                  borderColor: theme.colors.DIVIDER,
                  minHeight: 192,
                  ...theme.shadows.MD,
                },
                pressed && styles.optionCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${chocolateType === 'regular' ? 'Chocolate' : 'White Chocolate'}, tap to switch`}
            >
              <Text
                style={[
                  styles.compactCardLabel,
                  {
                    color: chocolateType === 'regular' ? '#FFFFFF' : theme.colors.TEXT_PRIMARY,
                    fontSize: theme.typography.FONT_SIZES.HEADING,
                  },
                ]}
              >
                {chocolateType === 'regular' ? 'Chocolate' : 'White Chocolate'}
              </Text>
              <Text
                style={[
                  styles.compactCardSubtitle,
                  {
                    color: chocolateType === 'regular' ? 'rgba(255, 255, 255, 0.7)' : theme.colors.TEXT_SECONDARY,
                    fontSize: theme.typography.FONT_SIZES.SMALL,
                  },
                ]}
              >
                (tap to switch)
              </Text>
            </Pressable>
          </View>
        )}

        {/* Chai Latte: 3-card row layout */}
        {drink.category === 'chai-latte' && (
          <View style={styles.threeCardRow}>
            {/* Milk toggle card */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMilk(selectedMilk === 'whole' ? 'oat' : 'whole');
              }}
              style={({ pressed }) => [
                styles.compactCard,
                {
                  backgroundColor: selectedMilk === 'whole' ? '#FFFFFF' : '#FFF8DC',
                  borderColor: theme.colors.DIVIDER,
                  minHeight: 192,
                  ...theme.shadows.MD,
                },
                pressed && styles.optionCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${selectedMilk === 'whole' ? 'Whole' : 'Oat'} milk, tap to switch`}
            >
              <Text style={[styles.compactCardLabel, { color: theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.HEADING }]}>
                {selectedMilk === 'whole' ? 'Whole Milk' : 'Oat Milk'}
              </Text>
              <Text style={[styles.compactCardSubtitle, { color: theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.SMALL }]}>
                (tap to switch)
              </Text>
            </Pressable>

            {/* Shots card */}
            <View style={[styles.compactCard, { backgroundColor: `rgba(101, 67, 33, ${0.1 + (shots * 0.15)})`, borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }]}>
              <Text style={[styles.compactCardTitle, { color: theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.BODY }]}>Shots</Text>
              <View style={styles.shotsControls}>
                <Pressable onPress={() => {handleShotsChange(-1);}} disabled={shots <= 0} style={({ pressed }) => [styles.compactButton, { backgroundColor: shots <= 0 ? theme.colors.SURFACE : theme.colors.PRIMARY, minWidth: theme.touchTargets.COMFORTABLE, minHeight: theme.touchTargets.COMFORTABLE, ...theme.shadows.SM }, pressed && shots > 0 && styles.quantityButtonPressed]} accessibilityRole="button" accessibilityLabel="Decrease shots">
                  <Text style={[styles.compactButtonText, { color: shots <= 0 ? theme.colors.TEXT_DISABLED : '#FFFFFF', fontSize: theme.typography.FONT_SIZES.HEADING }]}>−</Text>
                </Pressable>
                <Text style={[styles.shotsValue, { color: theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.TITLE }]}>{shots}</Text>
                <Pressable onPress={() => {handleShotsChange(1);}} disabled={shots >= 4} style={({ pressed }) => [styles.compactButton, { backgroundColor: shots >= 4 ? theme.colors.SURFACE : theme.colors.PRIMARY, minWidth: theme.touchTargets.COMFORTABLE, minHeight: theme.touchTargets.COMFORTABLE, ...theme.shadows.SM }, pressed && shots < 4 && styles.quantityButtonPressed]} accessibilityRole="button" accessibilityLabel="Increase shots">
                  <Text style={[styles.compactButtonText, { color: shots >= 4 ? theme.colors.TEXT_DISABLED : '#FFFFFF', fontSize: theme.typography.FONT_SIZES.HEADING }]}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Dirty toggle card */}
            <Pressable onPress={toggleDirty} style={({ pressed }) => [styles.compactCard, { backgroundColor: isDirty ? '#8B4513' : theme.colors.SURFACE, borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }, pressed && styles.optionCardPressed]} accessibilityRole="button" accessibilityLabel={`${isDirty ? 'Dirty' : 'No Espresso'}, tap to switch`}>
              <Text style={[styles.compactCardLabel, { color: isDirty ? '#FFFFFF' : theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.HEADING }]}>
                {isDirty ? 'Dirty' : 'No Espresso'}
              </Text>
              <Text style={[styles.compactCardSubtitle, { color: isDirty ? 'rgba(255, 255, 255, 0.7)' : theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.SMALL }]}>
                (tap to switch)
              </Text>
            </Pressable>
          </View>
        )}

        {/* Latte: 2-card row layout */}
        {drink.category === 'latte' && (
          <View style={styles.threeCardRow}>
            {/* Milk toggle card */}
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedMilk(selectedMilk === 'whole' ? 'oat' : 'whole'); }} style={({ pressed }) => [styles.compactCard, { backgroundColor: selectedMilk === 'whole' ? '#FFFFFF' : '#FFF8DC', borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }, pressed && styles.optionCardPressed]} accessibilityRole="button" accessibilityLabel={`${selectedMilk === 'whole' ? 'Whole' : 'Oat'} milk, tap to switch`}>
              <Text style={[styles.compactCardLabel, { color: theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.HEADING }]}>{selectedMilk === 'whole' ? 'Whole Milk' : 'Oat Milk'}</Text>
              <Text style={[styles.compactCardSubtitle, { color: theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.SMALL }]}>(tap to switch)</Text>
            </Pressable>

            {/* Shots card */}
            <View style={[styles.compactCard, { backgroundColor: `rgba(101, 67, 33, ${0.1 + (shots * 0.15)})`, borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }]}>
              <Text style={[styles.compactCardTitle, { color: theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.BODY }]}>Shots</Text>
              <View style={styles.shotsControls}>
                <Pressable onPress={() => {handleShotsChange(-1);}} disabled={shots <= 1} style={({ pressed }) => [styles.compactButton, { backgroundColor: shots <= 1 ? theme.colors.SURFACE : theme.colors.PRIMARY, minWidth: theme.touchTargets.COMFORTABLE, minHeight: theme.touchTargets.COMFORTABLE, ...theme.shadows.SM }, pressed && shots > 1 && styles.quantityButtonPressed]} accessibilityRole="button" accessibilityLabel="Decrease shots">
                  <Text style={[styles.compactButtonText, { color: shots <= 1 ? theme.colors.TEXT_DISABLED : '#FFFFFF', fontSize: theme.typography.FONT_SIZES.HEADING }]}>−</Text>
                </Pressable>
                <Text style={[styles.shotsValue, { color: theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.TITLE }]}>{shots}</Text>
                <Pressable onPress={() => {handleShotsChange(1);}} disabled={shots >= 4} style={({ pressed }) => [styles.compactButton, { backgroundColor: shots >= 4 ? theme.colors.SURFACE : theme.colors.PRIMARY, minWidth: theme.touchTargets.COMFORTABLE, minHeight: theme.touchTargets.COMFORTABLE, ...theme.shadows.SM }, pressed && shots < 4 && styles.quantityButtonPressed]} accessibilityRole="button" accessibilityLabel="Increase shots">
                  <Text style={[styles.compactButtonText, { color: shots >= 4 ? theme.colors.TEXT_DISABLED : '#FFFFFF', fontSize: theme.typography.FONT_SIZES.HEADING }]}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Empty placeholder for 3-column grid balance */}
            <View style={{ flex: 1 }} />
          </View>
        )}

        {/* Hot Chocolate: 2-card row layout */}
        {drink.category === 'hot-chocolate' && (
          <View style={styles.threeCardRow}>
            {/* Milk toggle card */}
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedMilk(selectedMilk === 'whole' ? 'oat' : 'whole'); }} style={({ pressed }) => [styles.compactCard, { backgroundColor: selectedMilk === 'whole' ? '#FFFFFF' : '#FFF8DC', borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }, pressed && styles.optionCardPressed]} accessibilityRole="button" accessibilityLabel={`${selectedMilk === 'whole' ? 'Whole' : 'Oat'} milk, tap to switch`}>
              <Text style={[styles.compactCardLabel, { color: theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.HEADING }]}>{selectedMilk === 'whole' ? 'Whole Milk' : 'Oat Milk'}</Text>
              <Text style={[styles.compactCardSubtitle, { color: theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.SMALL }]}>(tap to switch)</Text>
            </Pressable>

            {/* Chocolate type toggle card */}
            <Pressable onPress={toggleChocolateType} style={({ pressed }) => [styles.compactCard, { backgroundColor: chocolateType === 'regular' ? '#8B4513' : '#FFFFFF', borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }, pressed && styles.optionCardPressed]} accessibilityRole="button" accessibilityLabel={`${chocolateType === 'regular' ? 'Chocolate' : 'White Chocolate'}, tap to switch`}>
              <Text style={[styles.compactCardLabel, { color: chocolateType === 'regular' ? '#FFFFFF' : theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.HEADING }]}>{chocolateType === 'regular' ? 'Chocolate' : 'White Chocolate'}</Text>
              <Text style={[styles.compactCardSubtitle, { color: chocolateType === 'regular' ? 'rgba(255, 255, 255, 0.7)' : theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.SMALL }]}>(tap to switch)</Text>
            </Pressable>

            {/* Empty placeholder for 3-column grid balance */}
            <View style={{ flex: 1 }} />
          </View>
        )}

        {/* Americano: 1-card centered layout */}
        {drink.category === 'americano' && (
          <View style={styles.threeCardRow}>
            {/* Shots card (centered) */}
            <View style={[styles.compactCard, { backgroundColor: `rgba(101, 67, 33, ${0.1 + (shots * 0.15)})`, borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }]}>
              <Text style={[styles.compactCardTitle, { color: theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.BODY }]}>Shots</Text>
              <View style={styles.shotsControls}>
                <Pressable onPress={() => {handleShotsChange(-1);}} disabled={shots <= 1} style={({ pressed }) => [styles.compactButton, { backgroundColor: shots <= 1 ? theme.colors.SURFACE : theme.colors.PRIMARY, minWidth: theme.touchTargets.COMFORTABLE, minHeight: theme.touchTargets.COMFORTABLE, ...theme.shadows.SM }, pressed && shots > 1 && styles.quantityButtonPressed]} accessibilityRole="button" accessibilityLabel="Decrease shots">
                  <Text style={[styles.compactButtonText, { color: shots <= 1 ? theme.colors.TEXT_DISABLED : '#FFFFFF', fontSize: theme.typography.FONT_SIZES.HEADING }]}>−</Text>
                </Pressable>
                <Text style={[styles.shotsValue, { color: theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.TITLE }]}>{shots}</Text>
                <Pressable onPress={() => {handleShotsChange(1);}} disabled={shots >= 4} style={({ pressed }) => [styles.compactButton, { backgroundColor: shots >= 4 ? theme.colors.SURFACE : theme.colors.PRIMARY, minWidth: theme.touchTargets.COMFORTABLE, minHeight: theme.touchTargets.COMFORTABLE, ...theme.shadows.SM }, pressed && shots < 4 && styles.quantityButtonPressed]} accessibilityRole="button" accessibilityLabel="Increase shots">
                  <Text style={[styles.compactButtonText, { color: shots >= 4 ? theme.colors.TEXT_DISABLED : '#FFFFFF', fontSize: theme.typography.FONT_SIZES.HEADING }]}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Empty placeholders for 3-column grid balance */}
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1 }} />
          </View>
        )}

        {/* Italian Soda: 1-card layout */}
        {drink.category === 'italian-soda' && (
          <View style={styles.threeCardRow}>
            {/* Cream toggle card */}
            <Pressable onPress={toggleCream} style={({ pressed }) => [styles.compactCard, { backgroundColor: hasCream ? '#FFFACD' : theme.colors.SURFACE, borderColor: theme.colors.DIVIDER, minHeight: 192, ...theme.shadows.MD }, pressed && styles.optionCardPressed]} accessibilityRole="button" accessibilityLabel={`${hasCream ? 'With Cream' : 'No Cream'}, tap to switch`}>
              <Text style={[styles.compactCardLabel, { color: theme.colors.TEXT_PRIMARY, fontSize: theme.typography.FONT_SIZES.HEADING }]}>{hasCream ? 'With Cream' : 'No Cream'}</Text>
              <Text style={[styles.compactCardSubtitle, { color: theme.colors.TEXT_SECONDARY, fontSize: theme.typography.FONT_SIZES.SMALL }]}>(tap to switch)</Text>
            </Pressable>

            {/* Empty placeholders for 3-column grid balance */}
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1 }} />
          </View>
        )}

        {/* Syrup selection (for Mocha, Latte, Italian Soda) */}
        {needsSyrup(drink.category) && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.TEXT_PRIMARY,
                  fontSize: theme.typography.FONT_SIZES.HEADING,
                },
              ]}
            >
              Syrup Flavor (Optional)
            </Text>
            <View style={styles.optionRow}>
              {APP_CONFIG.CUSTOMIZATION.SYRUP_FLAVORS.map((syrup) => {
                const isSelected = selectedSyrup === syrup;
                return (
                  <Pressable
                    key={syrup}
                    onPress={() => {handleSyrupSelect(syrup);}}
                    style={({ pressed }) => [
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? theme.colors.PRIMARY_LIGHT : theme.colors.SURFACE,
                        borderColor: isSelected ? theme.colors.PRIMARY : theme.colors.DIVIDER,
                        borderWidth: isSelected ? 4 : 2,
                        minHeight: theme.touchTargets.LARGE * 2,
                        ...theme.shadows.MD,
                      },
                      pressed && styles.optionCardPressed,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${syrup} syrup`}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isSelected ? theme.colors.PRIMARY : theme.colors.TEXT_PRIMARY,
                          fontSize: theme.typography.FONT_SIZES.SUBHEADING,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {syrup}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Review button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.BACKGROUND,
            borderTopColor: theme.colors.DIVIDER,
            ...theme.shadows.LG,
          },
        ]}
      >
        <Pressable
          onPress={handleReview}
          style={({ pressed }) => [
            styles.addToCartButton,
            {
              backgroundColor: theme.colors.PRIMARY,
              minHeight: theme.touchTargets.LARGE,
              ...theme.shadows.MD,
            },
            pressed && styles.addToCartButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Review ${displayName} order`}
        >
          <Text
            style={[
              styles.addToCartText,
              {
                fontSize: theme.typography.FONT_SIZES.HEADING,
              },
            ]}
          >
            Review
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
  scrollContent: {
    padding: 40,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 20,
  },
  // New compact 3-card layout (matching main menu grid)
  threeCardRow: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 40,
  },
  compactCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCardTitle: {
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  compactCardLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  compactCardSubtitle: {
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  shotsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  shotsValue: {
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'center',
  },
  compactButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButtonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 40,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  optionLabel: {
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  quantityButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  quantityButtonText: {
    fontWeight: '700',
  },
  quantityValue: {
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 20,
  },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontWeight: '600',
  },
  toggleButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  toggleHint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
    borderTopWidth: 1,
  },
  addToCartButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  addToCartText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
  },
});
