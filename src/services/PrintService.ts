import { captureRef } from 'react-native-view-shot';
import { Image } from 'react-native';
import { downloadAsync, cacheDirectory } from 'expo-file-system/legacy';
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
    labelFormat: LabelFormat,
    printerConfig: PrinterConfig,
    imageUriOrRef: string | unknown
  ): Promise<void> {
    try {
      // eslint-disable-next-line no-console
      console.log('Printing label with format:', labelFormat);

      let imageUri: string;

      // Check if we have a pre-captured image URI or need to capture
      if (typeof imageUriOrRef === 'string') {
        imageUri = imageUriOrRef;
        // eslint-disable-next-line no-console
        console.log('Using pre-captured image URI:', imageUri);
      } else {
        // Fallback: capture from ref
        // eslint-disable-next-line no-console
        console.log('Capturing image from ref...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        imageUri = await captureRef(imageUriOrRef as never, {
          format: 'png',
          quality: 1.0,
          result: 'tmpfile',
        });

        // eslint-disable-next-line no-console
        console.log('Captured image URI:', imageUri);
      }

      // Create printer object
      const printer: BrotherPrinter = {
        ipAddress: printerConfig.ipAddress,
        modelName: printerConfig.modelName,
      };

      // Send image to printer via WiFi
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await printImage(printer, imageUri, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        labelSize: LabelSize.LabelSizeRollW62RB
      });

      // eslint-disable-next-line no-console
      console.log('Print sent to Brother QL-810W');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Print error:', error);
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
      // Resolve the static test-label.png image to get HTTP URI
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const testImageSource = require('../../assets/images/test-label.png');
      const resolvedAsset = Image.resolveAssetSource(testImageSource);

      if (!resolvedAsset || !resolvedAsset.uri) {
        throw new Error('Failed to resolve test image asset');
      }

      // eslint-disable-next-line no-console
      console.log('HTTP URI:', resolvedAsset.uri);
      // eslint-disable-next-line no-console
      console.log('Image dimensions:', resolvedAsset.width, 'x', resolvedAsset.height);

      let imageUri: string;

      // In Release builds, resolvedAsset.uri might be a local file path already
      // Check if it's an HTTP URL or a local file path
      if (resolvedAsset.uri.startsWith('http://') || resolvedAsset.uri.startsWith('https://')) {
        // Development mode: Download from Metro bundler
        const localUri = `${cacheDirectory}test-label.png`;

        // eslint-disable-next-line no-console
        console.log('Downloading image from Metro to:', localUri);

        const downloadResult = await downloadAsync(
          resolvedAsset.uri,
          localUri
        );

        if (!downloadResult || !downloadResult.uri) {
          throw new Error('Failed to download test image from Metro bundler');
        }

        imageUri = downloadResult.uri;
        // eslint-disable-next-line no-console
        console.log('Downloaded to:', imageUri);
      } else {
        // Release mode: Use bundled asset path directly
        imageUri = resolvedAsset.uri;
        // eslint-disable-next-line no-console
        console.log('Using bundled asset path:', imageUri);
      }

      // Create printer object
      const printer: BrotherPrinter = {
        ipAddress: printerConfig.ipAddress,
        modelName: printerConfig.modelName,
      };

      // Print the test image using local file path
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await printImage(printer, imageUri, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        labelSize: LabelSize.LabelSizeRollW62RB
      });

      // eslint-disable-next-line no-console
      console.log('Test print sent successfully');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Test print error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error(
        `Failed to print test label: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
