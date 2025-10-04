import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts';
import { BackButton } from './BackButton';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function NavigationHeader({
  title,
  subtitle,
  showBackButton = false,
  onBack,
}: NavigationHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, {
      backgroundColor: theme.colors.SURFACE,
      ...theme.shadows.SM,
    }]}>
      {showBackButton ? (
        <BackButton onPress={onBack ?? undefined} />
      ) : null}
      
      <View style={styles.titleContainer}>
        <Text style={[styles.title, {
          color: theme.colors.TEXT_PRIMARY,
          fontSize: theme.typography.FONT_SIZES.HEADING,
        }]}>
          {title}
        </Text>
        
        {subtitle ? (
          <Text style={[styles.subtitle, {
            color: theme.colors.TEXT_SECONDARY,
            fontSize: theme.typography.FONT_SIZES.CAPTION,
          }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  titleContainer: {
    marginTop: 8,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 4,
  },
});
