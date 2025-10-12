import { captureRef } from 'react-native-view-shot';
// @ts-ignore - Brother printing library does not have TypeScript types
import BrotherPrint from 'react-native-brother-printing';
import type { LabelFormat } from '@/types';
import * as Haptics from 'expo-haptics';

export interface PrinterConfig {
  ipAddress: string;
  modelName: 'QL-810W';
}

/**
 * Print service for Brother QL-810W label printer
 * Handles WiFi printing, printer discovery, and error handling
 */
export class PrintService {
  /**
   * Print label to Brother QL-810W printer via WiFi
   * @param labelFormat - Formatted label data (line1: name, line2: drink)
   * @param printerConfig - Printer IP address and model
   * @param labelViewRef - Reference to LabelView component for image capture
   * @returns Promise that resolves when print is sent (doesn't wait for completion)
   */
  static async printLabel(
    _labelFormat: LabelFormat,
    printerConfig: PrinterConfig,
    labelViewRef: unknown
  ): Promise<void> {
    try {
      // 1. Capture label view as PNG image
      const imageUri = await captureRef(labelViewRef as never, {
        format: 'png',
        quality: 1.0,
        width: 732, // 2.44" at 300 DPI
        height: 411, // 1.37" at 300 DPI
      });

      // eslint-disable-next-line no-console
      console.log('Label image generated:', imageUri);

      // 2. Send image to printer via WiFi
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await BrotherPrint.printImageViaWifi(
        imageUri,
        printerConfig.ipAddress,
        printerConfig.modelName
      );

      // eslint-disable-next-line no-console
      console.log('Print sent to Brother QL-810W');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Print error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error(
        `Failed to print label: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Discover Brother printers on local WiFi network
   * Note: react-native-brother-printing v0.0.1 does not provide a discovery API
   * This method is not implemented - manual IP entry is required
   * @returns Empty array (discovery not supported by library)
   */
  static async discoverPrinters(): Promise<unknown[]> {
    // eslint-disable-next-line no-console
    console.log('Printer discovery not supported by react-native-brother-printing v0.0.1');
    // The library only supports direct IP address printing
    // Users must manually enter the printer IP address
    return [];
  }

  /**
   * Test print with sample data
   * @param printerConfig - Printer configuration
   * @param labelViewRef - Reference to LabelView component
   */
  static async testPrint(
    printerConfig: PrinterConfig,
    labelViewRef: unknown
  ): Promise<void> {
    const testLabel: LabelFormat = {
      line1: 'Test Order',
      line2: 'Mocha 2 shots',
    };

    await this.printLabel(testLabel, printerConfig, labelViewRef);
  }
}
