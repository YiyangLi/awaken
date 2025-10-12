import { captureRef } from 'react-native-view-shot';
// @ts-ignore - Brother printing library does not have TypeScript types
import { printImage, LabelSize, discoverPrinters, registerBrotherListener } from '@w3lcome/react-native-brother-printers';
import type { LabelFormat } from '@/types';
import * as Haptics from 'expo-haptics';

export interface PrinterConfig {
  ipAddress: string;
  modelName: 'QL-810W';
}

export interface BrotherPrinter {
  ipAddress: string;
  modelName: string;
  serialNumber?: string;
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
      // 1. Wait for view to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Capture label view as PNG image
      const imageUri = await captureRef(labelViewRef as never, {
        format: 'png',
        quality: 1.0,
        width: 732, // 2.44" at 300 DPI
        height: 411, // 1.37" at 300 DPI
        result: 'tmpfile', // Save to temp file for better compatibility
      });

      // eslint-disable-next-line no-console
      console.log('Label image generated:', imageUri);
      // eslint-disable-next-line no-console
      console.log('Label format:', _labelFormat);

      // 2. Create printer object for @w3lcome/react-native-brother-printers
      const printer: BrotherPrinter = {
        ipAddress: printerConfig.ipAddress,
        modelName: printerConfig.modelName,
      };

      // 3. Send image to printer via WiFi
      // Label size for 62mm × 34.88mm (2.44" × 1.37")
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await printImage(printer, imageUri, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        labelSize: LabelSize.LabelSizeRollW62RB
      });

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
   * Uses @w3lcome/react-native-brother-printers discovery API
   * @returns Promise that resolves with array of discovered printers
   */
  static async discoverPrinters(): Promise<BrotherPrinter[]> {
    return new Promise((resolve) => {
      const discoveredPrinters: BrotherPrinter[] = [];

      // Register listener for printer discovery results
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      registerBrotherListener('onDiscoverPrinters', (printers: BrotherPrinter[]) => {
        // eslint-disable-next-line no-console
        console.log('Discovered printers:', printers);
        discoveredPrinters.push(...printers);
        resolve(printers);
      });

      // Start printer discovery with IPv6 support
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      discoverPrinters({ V6: true });

      // Timeout after 10 seconds if no printers found
      setTimeout(() => {
        if (discoveredPrinters.length === 0) {
          // eslint-disable-next-line no-console
          console.log('No printers discovered within timeout');
          resolve([]);
        }
      }, 10000);
    });
  }

  /**
   * Test print with static image file
   * @param printerConfig - Printer configuration
   */
  static async testPrint(
    printerConfig: PrinterConfig
  ): Promise<void> {
    try {
      // Use the static test-label.png image directly
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const testImageUri = require('../../assets/images/test-label.png');

      // eslint-disable-next-line no-console
      console.log('Test image URI:', testImageUri);

      // Create printer object
      const printer: BrotherPrinter = {
        ipAddress: printerConfig.ipAddress,
        modelName: printerConfig.modelName,
      };

      // Print the test image
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await printImage(printer, testImageUri, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        labelSize: LabelSize.LabelSizeRollW62RB
      });

      // eslint-disable-next-line no-console
      console.log('Test print sent successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Test print error:', error);
      throw new Error(
        `Failed to print test label: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
