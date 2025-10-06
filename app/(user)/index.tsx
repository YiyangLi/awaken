import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts';
import { useEffect, useState } from 'react';
import { StorageService } from '@/storage';
import type { Drink } from '@/types';
import * as Haptics from 'expo-haptics';

const DRINK_COLORS = {
  mocha: '#8B4513',
  'chai-latte': '#D2691E',
  latte: '#DEB887',
  'hot-chocolate': '#A0522D',
  americano: '#654321',
  'italian-soda': '#FF6B9D',
} as const;

const DRINK_SUBTITLES = {
  mocha: 'Rich chocolate espresso',
  'chai-latte': 'Spiced tea blend',
  latte: 'Smooth & creamy',
  'hot-chocolate': 'Sweet & warm',
  americano: 'Bold & strong',
  'italian-soda': 'Fizzy & fruity',
} as const;

const DRINK_DISPLAY_NAMES = {
  mocha: 'Mocha',
  'chai-latte': 'Chai Latte',
  latte: 'Latte',
  'hot-chocolate': 'Hot Chocolate',
  americano: 'Americano',
  'italian-soda': 'Italian Soda',
} as const;

export default function MenuScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [drinks, setDrinks] = useState<Drink[]>([]);

  useEffect(() => {
    loadDrinks();
  }, []);

  const loadDrinks = async () => {
    const loadedDrinks = await StorageService.getDrinks();
    setDrinks(loadedDrinks);
  };

  const handleDrinkPress = (drinkId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(user)/drink/${drinkId}`);
  };

  const renderDrinkButton = (drink: Drink) => {
    const backgroundColor = DRINK_COLORS[drink.category as keyof typeof DRINK_COLORS] || theme.colors.PRIMARY;
    const displayName = DRINK_DISPLAY_NAMES[drink.category as keyof typeof DRINK_DISPLAY_NAMES] || drink.name;
    const subtitle = DRINK_SUBTITLES[drink.category as keyof typeof DRINK_SUBTITLES] || drink.description;

    return (
      <Pressable
        key={drink.id}
        onPress={() => {handleDrinkPress(drink.id);}}
        style={({ pressed }) => [
          styles.drinkButton,
          {
            backgroundColor,
            minHeight: theme.touchTargets.LARGE * 3,
            ...theme.shadows.LG,
          },
          pressed && styles.drinkButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${displayName} - ${subtitle}`}
        accessibilityHint="Tap to customize and order this drink"
      >
        <Text style={[styles.drinkName, {
          fontSize: theme.typography.FONT_SIZES.TITLE,
        }]}>
          {displayName}
        </Text>
        <Text style={[styles.drinkSubtitle, {
          fontSize: theme.typography.FONT_SIZES.BODY,
        }]}>
          {subtitle}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      {drinks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {
            color: theme.colors.TEXT_SECONDARY,
            fontSize: theme.typography.FONT_SIZES.HEADING,
          }]}>
            No drinks available
          </Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            {drinks.slice(0, 3).map(renderDrinkButton)}
          </View>
          <View style={styles.row}>
            {drinks.slice(3, 6).map(renderDrinkButton)}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 40,
    flex: 1,
  },
  drinkButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  drinkButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  drinkName: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  drinkSubtitle: {
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
