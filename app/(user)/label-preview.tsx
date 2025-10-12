import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts';
import { useEffect, useState, useRef } from 'react';
import { PrintService } from '@/services';
import { StorageService } from '@/storage';
import type { LabelFormat } from '@/types';
import * as Haptics from 'expo-haptics';
import { LabelView } from '@/components/LabelView';
import { captureRef } from 'react-native-view-shot';

export default function LabelPreviewScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const customerName = params.customerName as string;
  const line1 = params.line1 as string;
  const line2 = params.line2 as string;

  const [isPrinting, setIsPrinting] = useState(true);
  const labelViewRef = useRef<View>(null);

  useEffect(() => {
    printLabel();
  }, []);

  const printLabel = async () => {
    try {
      const printerIP = await StorageService.getSetting('printerIP');

      if (!printerIP) {
        // eslint-disable-next-line no-console
        console.log('No printer configured, skipping print');
        setIsPrinting(false);
        // Navigate back to menu after 2 seconds
        setTimeout(() => {
          router.replace('/(user)/');
        }, 2000);
        return;
      }

      // Wait for label to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture the label as an image
      if (!labelViewRef.current) {
        throw new Error('Label view not ready');
      }

      const imageUri = await captureRef(labelViewRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // eslint-disable-next-line no-console
      console.log('Printing to:', printerIP);
      // eslint-disable-next-line no-console
      console.log('Using captured image:', imageUri);

      const labelFormat: LabelFormat = { line1, line2 };

      await PrintService.printLabel(
        labelFormat,
        { ipAddress: printerIP, modelName: 'QL-810W' },
        imageUri
      );

      // eslint-disable-next-line no-console
      console.log('Print completed successfully');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate back to menu after successful print
      setTimeout(() => {
        router.replace('/(user)/');
      }, 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Print failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Navigate back to menu after error
      setTimeout(() => {
        router.replace('/(user)/');
      }, 2000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.TEXT_PRIMARY,
            fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
          },
        ]}
      >
        Label Preview
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: theme.colors.TEXT_SECONDARY,
            fontSize: theme.typography.FONT_SIZES.BODY,
          },
        ]}
      >
        Order for: {customerName}
      </Text>

      <View style={styles.imageContainer}>
        <LabelView
          ref={labelViewRef}
          labelFormat={{ line1, line2 }}
        />
      </View>

      {isPrinting && (
        <View style={styles.printingContainer}>
          <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
          <Text
            style={[
              styles.printingText,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            Printing...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  labelImage: {
    width: 732,
    height: 411,
  },
  printingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  printingText: {
    fontWeight: '600',
  },
});
