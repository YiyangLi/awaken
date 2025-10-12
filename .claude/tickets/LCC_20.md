# LCC_20: Brother QL-810W Direct Print Integration

## Description
Integrate Brother QL-810W WiFi label printer with React Native/Expo to enable direct printing from the app. When an order is submitted, the app generates a label image from the formatted order data (LCC_19) and sends it to the printer via WiFi, then immediately redirects to the main menu without waiting for print completion.

**Primary Target Platform**: Android (Amazon Fire HD 10 tablet)
**Secondary Platform**: iOS (iPad) - optional, can be added later

> **Note**: See `.claude/context/ios-vs-android-comparison.md` for detailed platform differences

## Business Context
Coffee cart operators need seamless label printing during order submission. The current flow requires manual export or separate printing steps. Direct integration with the Brother QL-810W printer will:
- **Eliminate Manual Steps**: Automatically print labels on order submission
- **Improve Speed**: Baristas don't manually copy order details to labels
- **Reduce Errors**: Direct data transfer from app to printer
- **Maintain Flow**: Customer experience isn't interrupted (async printing)

The QL-810W supports WiFi connectivity, making it ideal for coffee cart operations where the printer can stay connected to a mobile hotspot or local network.

## Printer Specifications

### Brother QL-810W
- **Model**: QL-810W (Ultra-fast Label Printer)
- **Connectivity**: WiFi (Infrastructure mode or Wireless Direct)
- **Speed**: Up to 110 standard address labels per minute
- **Label Size**: 2.44" × 1.37" (62mm × 34.88mm)
- **Supported Formats**: PDF, JPEG, BMP, PNG, raster (PRN)
- **Print Settings**: Scale to Fit, print entire image
- **SDK Support**: iOS, Android, Windows (native SDKs available)

### Connection Details
- **Method**: WiFi (Infrastructure mode recommended)
- **IP Address**: Dynamic (discovered via printer search) or static (configured)
- **Port**: Network port (default: 9100)
- **Model Identifier**: `Model.QL_810W` in Brother SDK

## Technical Research Summary

### React Native Libraries Available

**Option 1: react-native-brother-printing** (Recommended)
- **GitHub**: https://github.com/IvanStoilov/react-native-brother-printing
- **Supports**: QL-820NWB, QL-1110NWB, QL series (including QL-810W)
- **Connectivity**: Bluetooth and WiFi
- **Wrapper**: Native iOS/Android Brother SDK wrapper
- **WiFi Function**: `printImageViaWifi(imageUri, ipAddress, modelName)`
- **Pros**:
  - Active maintenance
  - Supports WiFi directly
  - Clear API for image printing
  - Handles printer discovery

**Option 2: react-native-brother-printers**
- **GitHub**: https://github.com/Avery246813579/react-native-brother-printers
- **Supports**: QL series printers
- **Connectivity**: Network, WiFi, Bluetooth, USB OTG
- **Functions**: Printer discovery, print with label specs
- **Pros**:
  - Comprehensive printer discovery
  - Label size configuration
- **Cons**:
  - Less documentation than Option 1

**Recommendation**: Use `react-native-brother-printing` for cleaner WiFi API and better documentation.

### Integration Approach

Since this is an Expo project, we need to use **Expo Development Build** or **EAS Build** to integrate native modules:

1. **Install react-native-brother-printing** (requires native module support)
2. **Create custom Expo development build** (Expo Go won't work due to native code)
3. **Configure iOS/Android native settings** (Brother SDK permissions)
4. **Implement printer discovery** (search for QL-810W on WiFi network)
5. **Generate label image** (use React Native Canvas or WebView to render formatted text)
6. **Send to printer** (via `printImageViaWifi()`)
7. **Handle errors** (printer offline, connection issues)

### Image Generation Strategy

Brother printers accept image formats (JPEG, PNG). We need to convert the formatted label text (from LCC_19) into an image:

**Options**:
1. **react-native-view-shot**: Capture a React Native View as image
2. **react-native-canvas**: Draw text on canvas, export as image
3. **WebView + HTML Canvas**: Render label in WebView, capture as image

**Recommendation**: Use `react-native-view-shot` to capture a styled View component containing the label text. This is the most React Native-native approach and ensures consistent rendering.

## Acceptance Criteria

### Printer Integration Setup
- [ ] Install `react-native-brother-printing` package
- [ ] Create Expo custom development build (not Expo Go)
- [ ] Configure iOS permissions (Bonjour services, local network)
- [ ] Configure Android permissions (WiFi, network state)
- [ ] Implement printer discovery function (search WiFi network)
- [ ] Store printer IP address in app settings (AsyncStorage)

### Label Image Generation
- [ ] Install `react-native-view-shot` for image capture
- [ ] Create `LabelView` component that renders `LabelFormat` (line1, line2)
- [ ] Style LabelView to match physical label dimensions (2.44" × 1.37")
- [ ] Font sizes: 18pt for line1 (name), 12pt for line2 (drink)
- [ ] Capture LabelView as PNG image using `react-native-view-shot`
- [ ] Image resolution: 300 DPI or higher for clarity

### Print Function Implementation (`src/services/PrintService.ts`)
- [ ] Create `PrintService` class with WiFi printing methods
- [ ] `printLabel(labelFormat: LabelFormat, printerIP: string): Promise<void>`
- [ ] Generate label image from LabelFormat
- [ ] Send image to printer via `printImageViaWifi()`
- [ ] Handle errors: printer offline, network issues, invalid IP
- [ ] Return promise immediately (don't wait for print completion)

### UI Integration
- [ ] Update `app/(user)/review.tsx` to call print service after order submission
- [ ] Flow: Submit → Create Order → Print Label (async) → Redirect to Menu
- [ ] Add printer settings screen in admin (`app/(admin)/printer.tsx`)
- [ ] Printer settings: IP address input, test print button, printer status
- [ ] Show toast notification if print fails (don't block user)

### Error Handling
- [ ] Graceful fallback if printer is offline (order still submitted)
- [ ] User-friendly error messages ("Printer not found. Order saved.")
- [ ] Retry logic for transient network errors (1 retry, then fail)
- [ ] Haptic feedback on print success/failure
- [ ] Log print errors for troubleshooting

### Testing
- [ ] Test printer discovery on WiFi network
- [ ] Test print with simple order (1 item, short name)
- [ ] Test print with complex order (max characters, customizations)
- [ ] Test error handling (printer offline, wrong IP, WiFi disconnected)
- [ ] Test concurrent prints (multiple orders in quick succession)
- [ ] Verify label readability (fonts, alignment, size)

## Technical Implementation

### Step 1: Install Dependencies

```bash
# Install react-native-brother-printing (native module)
npm install react-native-brother-printing

# Install react-native-view-shot for image generation
npm install react-native-view-shot

# Rebuild Expo development build (required for native modules)
npx expo prebuild
npx expo run:android --device  # Primary: Android (Fire HD 10)
# npx expo run:ios --device    # Optional: iOS (iPad) - add later if needed
```

**Note**: This requires ejecting from Expo Go to a custom development build. Expo Go does not support native modules like Brother SDK.

**Android Setup** (Fire HD 10):
1. Enable Developer Options: Settings → Device Options → About → Tap "Serial Number" 7 times
2. Enable ADB: Settings → Device Options → Developer Options → Enable "ADB"
3. Enable Unknown Sources: Settings → Device Options → Developer Options → Enable "Apps from Unknown Sources"
4. Connect Fire tablet via USB
5. Check connection: `adb devices`

### Step 2: Configure Native Permissions

**Option A: Configure via `app.json` (Recommended)**

Add to your `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_WIFI_STATE",
        "CHANGE_WIFI_STATE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSBonjourServices": [
          "_pdl-datastream._tcp",
          "_printer._tcp"
        ],
        "NSLocalNetworkUsageDescription": "Awaken needs access to your local network to discover and print to Brother printers."
      }
    }
  }
}
```

**Option B: Manual Configuration** (if `app.json` doesn't work)

**Android (`android/app/src/main/AndroidManifest.xml`)**:
```xml
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**iOS (`ios/YourApp/Info.plist`)** (optional, for future iOS support):
```xml
<key>NSBonjourServices</key>
<array>
  <string>_pdl-datastream._tcp</string>
  <string>_printer._tcp</string>
</array>
<key>NSLocalNetworkUsageDescription</key>
<string>Awaken needs access to your local network to discover and print to Brother printers.</string>
```

**Why different?**
- **Android**: Needs WiFi state permissions (granted at install time)
- **iOS**: Needs Bonjour service discovery permissions (user must approve at runtime)

### Step 3: Create Label View Component

**File**: `src/components/LabelView.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LabelFormat } from '@/types';

interface LabelViewProps {
  labelFormat: LabelFormat;
}

/**
 * Label view component for Brother QL-810W printer
 * Physical size: 2.44" × 1.37" (62mm × 34.88mm)
 * Rendered at 300 DPI = 732px × 411px
 */
export const LabelView = React.forwardRef<View, LabelViewProps>(
  ({ labelFormat }, ref) => {
    return (
      <View ref={ref} style={styles.labelContainer}>
        {/* Line 1: Customer Name (Font 18) */}
        <Text style={styles.customerName}>{labelFormat.line1}</Text>

        {/* Line 2: Drink Summary (Font 12) */}
        <Text style={styles.drinkSummary}>{labelFormat.line2}</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  labelContainer: {
    width: 732,  // 2.44" at 300 DPI
    height: 411, // 1.37" at 300 DPI
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  customerName: {
    fontSize: 72,  // 18pt × 4 (scale for 300 DPI)
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  drinkSummary: {
    fontSize: 48,  // 12pt × 4 (scale for 300 DPI)
    fontWeight: '500',
    color: '#000000',
  },
});
```

### Step 4: Create Print Service

**File**: `src/services/PrintService.ts`

```typescript
import { captureRef } from 'react-native-view-shot';
import BrotherPrint from 'react-native-brother-printing';
import type { LabelFormat } from '@/types';
import * as Haptics from 'expo-haptics';

export interface PrinterConfig {
  ipAddress: string;
  modelName: 'QL-810W';
}

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
    labelViewRef: any
  ): Promise<void> {
    try {
      // 1. Capture label view as PNG image
      const imageUri = await captureRef(labelViewRef, {
        format: 'png',
        quality: 1.0,
        width: 732,  // 2.44" at 300 DPI
        height: 411, // 1.37" at 300 DPI
      });

      console.log('Label image generated:', imageUri);

      // 2. Send image to printer via WiFi
      await BrotherPrint.printImageViaWifi(
        imageUri,
        printerConfig.ipAddress,
        printerConfig.modelName
      );

      console.log('Print sent to Brother QL-810W');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Print error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw new Error(
        `Failed to print label: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Discover Brother printers on local WiFi network
   * @returns Array of discovered printers with IP addresses
   */
  static async discoverPrinters(): Promise<any[]> {
    try {
      const printers = await BrotherPrint.discover();
      console.log('Discovered printers:', printers);
      return printers;
    } catch (error) {
      console.error('Printer discovery error:', error);
      return [];
    }
  }

  /**
   * Test print with sample data
   * @param printerConfig - Printer configuration
   * @param labelViewRef - Reference to LabelView component
   */
  static async testPrint(
    printerConfig: PrinterConfig,
    labelViewRef: any
  ): Promise<void> {
    const testLabel: LabelFormat = {
      line1: 'Test Order',
      line2: 'Mocha 2 shots',
    };

    await this.printLabel(testLabel, printerConfig, labelViewRef);
  }
}
```

### Step 5: Update Review Screen with Print Integration

**File**: `app/(user)/review.tsx`

```typescript
import { useRef } from 'react';
import { formatLabelText } from '@/utils/labelFormatter';
import { PrintService } from '@/services/PrintService';
import { LabelView } from '@/components/LabelView';
import { StorageService } from '@/storage/StorageService';

export default function ReviewScreen() {
  // ... existing state

  // Hidden label view for image capture
  const labelViewRef = useRef<View>(null);
  const [labelFormat, setLabelFormat] = useState<LabelFormat | null>(null);

  const handlePlaceOrder = async () => {
    if (!customerName || customerName.trim().length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order
      const order: Order = {
        id: `order_${Date.now()}`,
        customerName: customerName.trim(),
        items: cartItems,
        totalAmount: calculateTotal(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.saveOrder(order);

      // 2. Format label
      const formatted = formatLabelText(order);
      setLabelFormat(formatted);

      // 3. Print label (async, don't wait)
      const printerIP = await StorageService.getSetting('printerIP');
      if (printerIP && labelViewRef.current) {
        PrintService.printLabel(
          formatted,
          { ipAddress: printerIP, modelName: 'QL-810W' },
          labelViewRef.current
        ).catch((error) => {
          // Show error but don't block user flow
          console.error('Print failed:', error);
          // Optional: Show toast notification
        });
      }

      // 4. Clear cart and redirect (immediately)
      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(user)/confirmation');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: 'Error',
        message: 'Failed to place order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ... existing UI */}

      {/* Hidden label view for printing (off-screen) */}
      <View style={{ position: 'absolute', left: -10000 }}>
        {labelFormat && <LabelView ref={labelViewRef} labelFormat={labelFormat} />}
      </View>
    </View>
  );
}
```

### Step 6: Create Admin Printer Settings Screen

**File**: `app/(admin)/printer.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { PrintService } from '@/services/PrintService';
import { StorageService } from '@/storage/StorageService';
import { LabelView } from '@/components/LabelView';
import { useModal } from '@/contexts';
import * as Haptics from 'expo-haptics';

export default function PrinterSettingsScreen() {
  const [printerIP, setPrinterIP] = useState('');
  const [savedIP, setSavedIP] = useState<string | null>(null);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const labelViewRef = useRef<View>(null);
  const { showAlert } = useModal();

  useEffect(() => {
    loadPrinterIP();
  }, []);

  const loadPrinterIP = async () => {
    const ip = await StorageService.getSetting('printerIP');
    if (ip) {
      setSavedIP(ip);
      setPrinterIP(ip);
    }
  };

  const handleSaveIP = async () => {
    if (!printerIP) return;

    try {
      await StorageService.saveSetting('printerIP', printerIP);
      setSavedIP(printerIP);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert({ title: 'Success', message: 'Printer IP address saved.' });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({ title: 'Error', message: 'Failed to save IP address.' });
    }
  };

  const handleDiscoverPrinters = async () => {
    setIsDiscovering(true);
    try {
      const printers = await PrintService.discoverPrinters();
      setDiscoveredPrinters(printers);
      if (printers.length === 0) {
        showAlert({ title: 'No Printers Found', message: 'No Brother printers found on the network.' });
      }
    } catch (error) {
      showAlert({ title: 'Discovery Failed', message: 'Could not search for printers.' });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleTestPrint = async () => {
    if (!savedIP) {
      showAlert({ title: 'No Printer', message: 'Please save a printer IP address first.' });
      return;
    }

    try {
      await PrintService.testPrint(
        { ipAddress: savedIP, modelName: 'QL-810W' },
        labelViewRef.current
      );
      showAlert({ title: 'Test Print Sent', message: 'Check your printer for the test label.' });
    } catch (error) {
      showAlert({ title: 'Print Failed', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Printer IP Address</Text>

      <View style={styles.ipRow}>
        <TextInput
          style={styles.ipInput}
          value={printerIP}
          onChangeText={setPrinterIP}
          placeholder="e.g., 192.168.1.100"
          keyboardType="decimal-pad"
        />
        <Pressable onPress={handleSaveIP} style={styles.saveButton}>
          <Text>Save</Text>
        </Pressable>
      </View>

      {savedIP && (
        <Text style={styles.savedIP}>Saved: {savedIP}</Text>
      )}

      <Pressable onPress={handleDiscoverPrinters} disabled={isDiscovering} style={styles.discoverButton}>
        <Text>{isDiscovering ? 'Searching...' : 'Discover Printers'}</Text>
      </Pressable>

      {discoveredPrinters.length > 0 && (
        <FlatList
          data={discoveredPrinters}
          keyExtractor={(item) => item.ipAddress}
          renderItem={({ item }) => (
            <Pressable onPress={() => setPrinterIP(item.ipAddress)} style={styles.printerCard}>
              <Text>{item.modelName}</Text>
              <Text>{item.ipAddress}</Text>
            </Pressable>
          )}
        />
      )}

      <Pressable onPress={handleTestPrint} style={styles.testButton}>
        <Text>Test Print</Text>
      </Pressable>

      {/* Hidden label view for test printing */}
      <View style={{ position: 'absolute', left: -10000 }}>
        <LabelView ref={labelViewRef} labelFormat={{ line1: 'Test Order', line2: 'Mocha 2 shots' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  ipRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  ipInput: { flex: 1, borderWidth: 2, borderRadius: 16, padding: 16 },
  saveButton: { borderRadius: 16, padding: 20, backgroundColor: '#007AFF' },
  savedIP: { fontSize: 16, color: '#666', marginBottom: 24 },
  discoverButton: { borderRadius: 16, padding: 20, backgroundColor: '#34C759', marginBottom: 24 },
  testButton: { borderRadius: 16, padding: 20, backgroundColor: '#FF9500' },
  printerCard: { borderWidth: 2, borderRadius: 16, padding: 16, marginBottom: 12 },
});
```

### Step 7: Update Storage Service with Printer Settings

**File**: `src/storage/StorageService.ts`

```typescript
// Add to existing StorageService class

async getSetting(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`@awaken:settings:${key}`);
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    return null;
  }
}

async saveSetting(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`@awaken:settings:${key}`, value);
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
    throw error;
  }
}
```

### Step 8: Update Admin Layout with Printer Settings Route

**File**: `app/(admin)/_layout.tsx`

```typescript
<Stack.Screen
  name="printer"
  options={{
    title: 'Printer Settings',
    headerShown: true,
  }}
/>
```

**File**: `app/(admin)/index.tsx`

```typescript
// Add printer settings button
<Pressable
  onPress={() => router.push('/(admin)/printer')}
  style={styles.settingsButton}
>
  <Text>Printer Settings</Text>
</Pressable>
```

## Files to Create/Modify

### New Files
1. **`src/components/LabelView.tsx`** - Label rendering component (732×411px at 300 DPI)
2. **`src/services/PrintService.ts`** - Print service with WiFi printing functions
3. **`app/(admin)/printer.tsx`** - Admin printer settings screen

### Modified Files
4. **`app/(user)/review.tsx`** - Add print function call after order submission
5. **`app/(admin)/_layout.tsx`** - Add printer route
6. **`app/(admin)/index.tsx`** - Add printer settings button
7. **`src/storage/StorageService.ts`** - Add getSetting/saveSetting methods
8. **`package.json`** - Add react-native-brother-printing, react-native-view-shot

## Dependencies

**Blocked by**:
- LCC_19 (Label Formatter - must be implemented first)

**Uses**:
- LCC_4 (StorageService)
- LCC_11 (Modal System)
- LCC_19 (formatLabelText function, LabelFormat type)

**NPM Packages**:
- `react-native-brother-printing` (Brother SDK wrapper)
- `react-native-view-shot` (Image capture from React Native views)

## Story Points
8 (Complex native module integration + image generation + error handling)

## Priority
High (Core feature for coffee cart operations)

## Elder-Friendly Design Requirements

- [ ] Simple printer setup (IP address input with discovery)
- [ ] Test print button with clear feedback
- [ ] Automatic printing (no manual steps during order flow)
- [ ] Error messages are user-friendly ("Printer not found" not "ETIMEDOUT")
- [ ] Orders still saved even if print fails (graceful degradation)
- [ ] Large touch targets (64pt) for printer settings buttons
- [ ] High contrast printer status indicators

## Expo Configuration Notes

### Important: Expo Go Limitation
**Expo Go does NOT support native modules like Brother SDK.** You must use a custom Expo development build:

```bash
# Option 1: Local development build
npx expo prebuild
npx expo run:ios  # or npx expo run:android

# Option 2: EAS Build (cloud-based)
npm install -g eas-cli
eas build --profile development --platform ios
```

### app.json Configuration
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-view-shot",
        {
          "enableFreeze": true
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSBonjourServices": ["_pdl-datastream._tcp", "_printer._tcp"],
        "NSLocalNetworkUsageDescription": "Awaken needs access to your local network to discover and print to Brother printers."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_WIFI_STATE",
        "CHANGE_WIFI_STATE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

## Testing Notes

### Platform-Specific Testing

#### Android (Fire HD 10) - Primary Testing
- [ ] App installs successfully via USB (`npx expo run:android --device`)
- [ ] App installs successfully via APK file transfer
- [ ] Printer discovery via NSD (Network Service Discovery)
- [ ] WiFi printing with Fire tablet + printer on same network
- [ ] Manual IP address entry (if discovery fails on Fire OS)
- [ ] Label image generation at 300 DPI
- [ ] Print queue handling (multiple orders)
- [ ] Error handling (printer offline, wrong IP, WiFi disconnected)
- [ ] ADB logcat debugging works
- [ ] No app expiry (runs indefinitely)

**Debugging Commands** (Android):
```bash
# View all logs
adb logcat

# Filter for React Native logs
adb logcat | grep -i "ReactNativeJS"

# Filter for Brother printer logs
adb logcat | grep -i "BrotherPrint"

# Combined filter
adb logcat | grep -E "(ReactNativeJS|BrotherPrint|Error)"

# Clear logs and start fresh
adb logcat -c && adb logcat
```

#### iOS (iPad) - Optional Testing (If Needed Later)
- [ ] App installs successfully via Xcode
- [ ] Developer certificate trusted on iPad
- [ ] Printer discovery via Bonjour (mDNS)
- [ ] WiFi printing with iPad + printer on same network
- [ ] Local network permission approved by user
- [ ] Test 7-day expiry (free Apple ID) or 1-year (paid)

**Debugging Commands** (iOS):
```bash
# View logs from connected iPad
npx react-native log-ios

# Or use Xcode: Window → Devices and Simulators → Select iPad → Console
```

### Manual Testing Checklist (Cross-Platform)
- [ ] Printer discovery finds QL-810W on WiFi
- [ ] Save printer IP address persists after app restart
- [ ] Test print generates readable label
- [ ] Order submission triggers print automatically
- [ ] Print failure doesn't block order submission
- [ ] Redirect to menu happens immediately (doesn't wait for print)
- [ ] Label image quality is clear (300 DPI)
- [ ] Fonts render correctly (18pt name, 12pt drink)
- [ ] Character limits respected (20 chars line1, 30 chars line2)
- [ ] Network disconnection handled gracefully

### Edge Cases
- [ ] Printer offline during order submission
- [ ] Wrong IP address configured
- [ ] WiFi disconnected mid-print
- [ ] Multiple orders submitted quickly (print queue)
- [ ] Very long customer name (truncation)
- [ ] Complex drink with many customizations
- [ ] Fire OS WiFi stack quirks (NSD may behave differently)
- [ ] Router blocks mDNS/Bonjour (manual IP entry fallback)

## Known Limitations & Future Enhancements

### Current Limitations
- Requires custom Expo development build (not Expo Go)
- Printer IP must be manually entered or discovered
- No automatic reconnection if printer disconnects
- Print status not tracked (fire-and-forget)

### Future Enhancements (Post-v1)
- [ ] Bluetooth printing support (in addition to WiFi)
- [ ] Automatic printer reconnection on network change
- [ ] Print queue management (retry failed prints)
- [ ] Print history log (success/failure tracking)
- [ ] Multiple printer support (switch between printers)
- [ ] Print preview before sending
- [ ] QR code generation on labels (for order tracking)
- [ ] Barcode support (customer ID, order number)
- [ ] Label template customization (admin configurable)
- [ ] Printer status monitoring (ink, paper, errors)

## User Story

**As a** coffee cart barista
**I want to** automatically print order labels when customers place orders
**So that** I don't have to manually write or copy order details onto labels

**Acceptance**: When a customer named "Sarah" orders a "Latte, oat milk, vanilla" and clicks "Place Order", the app:
1. Creates the order in the system
2. Formats the label text ("Sarah" / "Latte oat vanilla")
3. Generates a label image (732×411px PNG)
4. Sends the image to the Brother QL-810W printer via WiFi
5. Immediately redirects to the main menu (doesn't wait for print completion)
6. If the printer is offline, the order is still saved and the barista is notified

The label prints automatically without any manual intervention from the barista or customer.

## Implementation Approach

### Phase 1: Android Development (Fire HD 10)
**Recommended order**:
1. Configure Android permissions in `app.json`
2. Install dependencies (`react-native-brother-printing`, `react-native-view-shot`)
3. Run `npx expo prebuild` to generate native folders
4. Build for Android: `npx expo run:android --device`
5. Test on Fire HD 10 tablet
6. Implement printer discovery (may need manual IP fallback for Fire OS)
7. Implement image generation and printing
8. Debug with `adb logcat`
9. Test thoroughly on Fire HD 10

### Phase 2: iOS Support (Optional - If Needed Later)
**Only if customers need iPad version**:
1. Add iOS permissions to `app.json`
2. Build for iOS: `npx expo run:ios --device`
3. Test on iPad with free or paid Apple Developer account
4. Verify Bonjour discovery works
5. Handle 7-day expiry (free) or 1-year validity (paid)

### Code Reusability
- ✅ **95% of code is platform-agnostic** (TypeScript/React Native)
- ✅ **PrintService.ts is identical** on both platforms
- ✅ **LabelView.tsx is identical** on both platforms
- ✅ **Only configuration files differ** (app.json, AndroidManifest.xml, Info.plist)

### Platform Comparison
See `.claude/context/ios-vs-android-comparison.md` for detailed differences between iOS and Android implementations.

## Notes

- This ticket depends on LCC_19 being implemented first (label formatter)
- Brother SDK requires native module integration (not available in Expo Go)
- Print function is fire-and-forget (async, no wait) to maintain fast user flow
- Printer IP address is stored in AsyncStorage (admin configurable)
- Label image is rendered off-screen (hidden View) and captured as PNG
- WiFi is the primary connection method (Bluetooth can be added later)
- Error handling prioritizes order submission over printing (print failures don't block orders)
- Label size calculation: 2.44" × 1.37" at 300 DPI = 732px × 411px
- **Primary target**: Amazon Fire HD 10 tablet (Android/Fire OS)
- **Secondary target**: iPad (iOS) - optional, can be added later with minimal changes
