# src/services/

## Purpose

External service integrations for Awaken. Currently contains Brother P-touch printer integration for WiFi label printing.

## Key Files

### `PrintService.ts`
**Purpose**: Brother QL-810W label printer integration via WiFi

**Features**:
- WiFi printing to Brother QL-810W printer
- Printer discovery on local network
- Test print functionality
- Image capture and format conversion
- Error handling with helpful messages

**Dependencies**:
- `@w3lcome/react-native-brother-printers` - Brother printer native module
- `react-native-view-shot` - Component to image conversion
- `expo-file-system` - File system access for image caching
- `expo-haptics` - Haptic feedback

---

## API Reference

### Types

#### `PrinterConfig`
```typescript
interface PrinterConfig {
  ipAddress: string;    // e.g., '192.168.1.100'
  modelName: 'QL-810W'; // Fixed model
}
```

#### `BrotherPrinter`
```typescript
interface BrotherPrinter {
  ipAddress: string;
  modelName: string;
  serialNumber?: string;
}
```

---

### Methods

#### `printLabel(labelFormat, printerConfig, imageUriOrRef)`
```typescript
await PrintService.printLabel(
  labelFormat,              // LabelFormat with line1, line2
  printerConfig,            // PrinterConfig with IP and model
  imageUriOrRef             // Pre-captured image URI or ref to capture
);
```

**Parameters**:
- `labelFormat: LabelFormat` - Customer name and drink summary
- `printerConfig: PrinterConfig` - Printer IP address and model
- `imageUriOrRef: string | unknown` - Either:
  - Pre-captured image URI (`string`)
  - React ref to LabelView component (for fallback capture)

**Process**:
1. Check if image URI is provided (preferred) or need to capture from ref
2. If ref: Wait 1 second for component render, then capture with `react-native-view-shot`
3. Create printer object with IP and model
4. Send image to printer via WiFi using Brother SDK
5. Log success or throw error with helpful message

**Label Size**: Uses `LabelSize.LabelSizeRollW62RB` (62mm roll, 2.44" × 1.37")

**Image Format**:
- Format: PNG
- Quality: 1.0 (maximum)
- Result: tmpfile (temporary file path)
- Dimensions: 732px × 411px (300 DPI)

**Error Handling**:
- Logs all steps for debugging
- Throws descriptive errors: `"Failed to print label: <reason>"`
- Network errors, printer offline, etc. are caught and re-thrown

**Example**:
```typescript
const labelFormat = formatLabelText(order);
const printerConfig = { ipAddress: '192.168.1.100', modelName: 'QL-810W' };

// Option 1: Pre-captured image URI (recommended)
const imageUri = await captureRef(labelRef);
await PrintService.printLabel(labelFormat, printerConfig, imageUri);

// Option 2: Pass ref (fallback)
await PrintService.printLabel(labelFormat, printerConfig, labelRef);
```

---

#### `discoverPrinters()`
```typescript
const printers = await PrintService.discoverPrinters();
// Returns BrotherPrinter[] (IP, model, serial)
```

**Process**:
1. Register listener for printer discovery events
2. Start network scan with IPv6 support
3. Collect discovered printers
4. Timeout after 10 seconds if no printers found
5. Return array of discovered printers

**Return Value**:
- Array of `BrotherPrinter` objects
- Empty array if timeout or no printers found

**Network Requirements**:
- App and printer must be on same WiFi network
- IPv6 support enabled
- Printer must be powered on and connected to WiFi

**Example**:
```typescript
const printers = await PrintService.discoverPrinters();

if (printers.length === 0) {
  Alert.alert('No Printers Found', 'Make sure printer is on WiFi');
} else {
  // printers[0].ipAddress
  setPrinterIP(printers[0].ipAddress);
}
```

---

#### `testPrint(printerConfig)`
```typescript
await PrintService.testPrint(printerConfig);
```

**Purpose**: Print static test image to verify printer connectivity

**Process**:
1. Resolve test image asset (`assets/images/test-label.png`)
2. Get HTTP URI from Metro bundler (dev) or bundled asset path (release)
3. Download image to cache directory (dev mode only)
4. Send image to printer via WiFi
5. Haptic feedback on success/error

**Image Details**:
- Source: `require('../../assets/images/test-label.png')`
- Label size: 62mm roll (2.44" × 1.37")

**Error Handling**:
- Logs all steps (URI resolution, download, print)
- Haptic success notification on print
- Haptic error notification on failure
- Throws descriptive error: `"Failed to print test label: <reason>"`

**Example**:
```typescript
const handleTestPrint = async () => {
  try {
    await PrintService.testPrint(printerConfig);
    Alert.alert('Success', 'Test label printed');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## Implementation Details

### Brother Printer SDK

**Native Module**: `@w3lcome/react-native-brother-printers`

**Key Functions**:
- `printImage(printer, imageUri, options)` - Send image to printer
- `discoverPrinters({ V6: true })` - Scan network for printers
- `registerBrotherListener(event, callback)` - Listen for printer events
- `LabelSize.LabelSizeRollW62RB` - 62mm roll constant

**TypeScript Notes**:
- Library does not have TypeScript types
- All imports use `// @ts-ignore` suppressions
- Type safety provided by wrapper methods

---

### Image Handling

**Development Mode** (Metro bundler):
- Static assets served via HTTP URL
- Must download to local file before printing
- Uses `expo-file-system` for download

**Release Mode** (Production build):
- Assets bundled in app binary
- Local file path available directly
- No download needed

**Code Pattern**:
```typescript
const resolvedAsset = Image.resolveAssetSource(testImageSource);

if (resolvedAsset.uri.startsWith('http')) {
  // Development: Download from Metro
  const localUri = `${cacheDirectory}test-label.png`;
  const downloadResult = await downloadAsync(resolvedAsset.uri, localUri);
  imageUri = downloadResult.uri;
} else {
  // Release: Use bundled path
  imageUri = resolvedAsset.uri;
}
```

---

### Haptic Feedback

**Success**:
```typescript
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

**Error**:
```typescript
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

**Elder-friendly**: Tactile confirmation of print operations

---

## Git History

- **841f5be** - Stable version with reliable printing
- **6450e4c** - Final polish on print workflow
- **a334f65** - Initial blank label printing
- **ac49c0a** - LCC_10: Print service implementation

---

## Usage Examples

### Complete Print Workflow
```tsx
const LabelPreviewScreen = () => {
  const labelRef = useRef<View>(null);
  const [labelFormat, setLabelFormat] = useState<LabelFormat>(...);
  const [printerIP, setPrinterIP] = useState('');

  const handlePrint = async () => {
    try {
      // 1. Capture label as image
      const imageUri = await captureRef(labelRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // 2. Create printer config
      const printerConfig = {
        ipAddress: printerIP,
        modelName: 'QL-810W',
      };

      // 3. Print label
      await PrintService.printLabel(labelFormat, printerConfig, imageUri);

      Alert.alert('Success', 'Label printed');
    } catch (error) {
      Alert.alert('Print Error', error.message);
    }
  };

  return (
    <View>
      <LabelView ref={labelRef} labelFormat={labelFormat} />
      <Pressable onPress={handlePrint}>
        <Text>Print Label</Text>
      </Pressable>
    </View>
  );
};
```

### Printer Discovery
```tsx
const SettingsScreen = () => {
  const [printers, setPrinters] = useState<BrotherPrinter[]>([]);
  const [scanning, setScanning] = useState(false);

  const handleDiscover = async () => {
    setScanning(true);
    const discovered = await PrintService.discoverPrinters();
    setPrinters(discovered);
    setScanning(false);

    if (discovered.length > 0) {
      // Auto-select first printer
      await StorageService.saveSetting('printerIP', discovered[0].ipAddress);
    }
  };

  return (
    <View>
      <Pressable onPress={handleDiscover} disabled={scanning}>
        <Text>{scanning ? 'Scanning...' : 'Find Printers'}</Text>
      </Pressable>

      {printers.map(printer => (
        <Text key={printer.ipAddress}>
          {printer.modelName} - {printer.ipAddress}
        </Text>
      ))}
    </View>
  );
};
```

### Test Print
```tsx
const TestPrintButton = () => {
  const [printerIP, setPrinterIP] = useState('');

  const handleTestPrint = async () => {
    if (!printerIP) {
      Alert.alert('Error', 'Please set printer IP first');
      return;
    }

    try {
      const printerConfig = {
        ipAddress: printerIP,
        modelName: 'QL-810W',
      };

      await PrintService.testPrint(printerConfig);
      Alert.alert('Success', 'Test label printed');
    } catch (error) {
      Alert.alert('Print Error', error.message);
    }
  };

  return (
    <Pressable onPress={handleTestPrint}>
      <Text>Test Print</Text>
    </Pressable>
  );
};
```

---

## Related Files

- **Components**: `src/components/LabelView.tsx` - Renders label for printing
- **Utils**: `src/utils/labelFormatter.ts` - Formats order for label
- **Storage**: `src/storage/StorageService.ts` - Saves printer IP
- **Types**: `src/types/index.ts` - LabelFormat interface

---

## Troubleshooting

### Common Issues

**"No printers found"**
- Ensure printer is powered on
- Check WiFi connection (same network as phone)
- Wait full 10 seconds for scan timeout
- Try manual IP entry if discovery fails

**"Failed to print label"**
- Verify printer IP address is correct
- Check printer is online (ping IP from another device)
- Ensure label roll is installed correctly
- Try test print with static image

**"Failed to resolve test image asset"**
- Ensure `assets/images/test-label.png` exists
- Check image is 732px × 411px PNG
- Verify image is included in app bundle

**Image capture fails**
- Ensure LabelView is fully rendered before capture
- Wait 1 second after component mount
- Check view has `collapsable={false}` prop
- Verify ref is attached correctly

---

## Testing Notes

- Requires physical Brother QL-810W printer
- WiFi network access needed
- Test on iOS device (not simulator - no printer access)
- Verify label size matches printer roll (62mm)
- Test both development and release builds (different image paths)
- Haptic feedback only works on physical device
- Network discovery timeout is 10 seconds (patience required)

---

## Future Enhancements

- Support for multiple printer models
- Bluetooth printing option
- Print queue for offline scenarios
- Print history/reprint functionality
- Label template customization
- Batch printing support
