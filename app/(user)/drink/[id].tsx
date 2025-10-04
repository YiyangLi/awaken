import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts';

export default function DrinkDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      <Text style={[styles.text, {
        color: theme.colors.TEXT_PRIMARY,
        fontSize: theme.typography.FONT_SIZES.BODY,
      }]}>
        Drink customization screen for drink ID: {id}
      </Text>
      <Text style={[styles.subtitle, {
        color: theme.colors.TEXT_SECONDARY,
        fontSize: theme.typography.FONT_SIZES.CAPTION,
      }]}>
        Coming soon in future tickets
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
});
