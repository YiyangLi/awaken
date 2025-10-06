import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts';
import * as Haptics from 'expo-haptics';

interface BackButtonProps {
  label?: string;
  onPress?: (() => void) | undefined;
}

export function BackButton({ label = 'Back', onPress }: BackButtonProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: theme.touchTargets.COMFORTABLE,
          minWidth: theme.touchTargets.COMFORTABLE,
        },
        pressed && styles.buttonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Navigate back to the previous screen"
    >
      <Text style={[styles.text, {
        color: theme.colors.PRIMARY,
        fontSize: theme.typography.FONT_SIZES.BODY,
      }]}>
        ← {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
});
