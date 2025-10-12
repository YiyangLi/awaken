import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme, useModal } from '@/contexts';
import { PrintService } from '../../src/services/PrintService';
import { StorageService } from '@/storage';
import { LabelView } from '@/components/LabelView';
import * as Haptics from 'expo-haptics';
import type { LabelFormat } from '@/types';

export default function PrinterSettingsScreen() {
  const { theme } = useTheme();
  const { showAlert } = useModal();

  const [printerIP, setPrinterIP] = useState('');
  const [savedIP, setSavedIP] = useState<string | null>(null);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<unknown[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [testLabel] = useState<LabelFormat>({
    line1: 'Test Order',
    line2: 'Mocha 2 shots',
  });

  const labelViewRef = useRef<View>(null);

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
    if (!printerIP || printerIP.trim().length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: 'Invalid IP',
        message: 'Please enter a valid IP address.',
      });
      return;
    }

    try {
      await StorageService.saveSetting('printerIP', printerIP.trim());
      setSavedIP(printerIP.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert({
        title: 'Success',
        message: 'Printer IP address saved.',
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: 'Error',
        message: 'Failed to save IP address.',
      });
    }
  };

  const handleDiscoverPrinters = async () => {
    setIsDiscovering(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const printers = await PrintService.discoverPrinters();
      setDiscoveredPrinters(printers);

      if (printers.length === 0) {
        showAlert({
          title: 'No Printers Found',
          message:
            'No Brother printers found on the network. Make sure the printer is turned on and connected to the same WiFi network.',
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: 'Discovery Failed',
        message: 'Could not search for printers. Please check your WiFi connection.',
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleTestPrint = async () => {
    if (!savedIP) {
      showAlert({
        title: 'No Printer',
        message: 'Please save a printer IP address first.',
      });
      return;
    }

    if (!labelViewRef.current) {
      showAlert({
        title: 'Error',
        message: 'Label view not ready. Please try again.',
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await PrintService.testPrint(
        { ipAddress: savedIP, modelName: 'QL-810W' },
        labelViewRef.current
      );
      showAlert({
        title: 'Test Print Sent',
        message: 'Check your printer for the test label.',
      });
    } catch (error) {
      showAlert({
        title: 'Print Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to print. Make sure the printer is on and connected.',
      });
    }
  };

  const handleSelectPrinter = (printer: { ipAddress?: string }) => {
    if (printer.ipAddress) {
      setPrinterIP(printer.ipAddress);
      Haptics.selectionAsync();
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.BACKGROUND }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Section: Printer IP Address */}
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.TEXT_PRIMARY,
            fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
          },
        ]}
      >
        Printer IP Address
      </Text>

      <View style={styles.ipRow}>
        <TextInput
          style={[
            styles.ipInput,
            {
              backgroundColor: theme.colors.SURFACE,
              borderColor: theme.colors.DIVIDER,
              color: theme.colors.TEXT_PRIMARY,
              fontSize: theme.typography.FONT_SIZES.BODY,
            },
          ]}
          value={printerIP}
          onChangeText={setPrinterIP}
          placeholder="e.g., 192.168.1.100"
          placeholderTextColor={theme.colors.TEXT_DISABLED}
          keyboardType="decimal-pad"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Printer IP address"
          accessibilityHint="Enter the IP address of your Brother QL-810W printer"
        />

        <Pressable
          onPress={handleSaveIP}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: theme.colors.PRIMARY,
              minHeight: theme.touchTargets.LARGE,
              ...theme.shadows.MD,
            },
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save IP address"
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            Save
          </Text>
        </Pressable>
      </View>

      {savedIP && (
        <Text
          style={[
            styles.savedIP,
            {
              color: theme.colors.SUCCESS,
              fontSize: theme.typography.FONT_SIZES.BODY,
            },
          ]}
        >
          ✓ Saved: {savedIP}
        </Text>
      )}

      {/* Section: Printer Discovery */}
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.TEXT_PRIMARY,
            fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
            marginTop: 40,
          },
        ]}
      >
        Discover Printers
      </Text>

      <Pressable
        onPress={handleDiscoverPrinters}
        disabled={isDiscovering}
        style={({ pressed }) => [
          styles.discoverButton,
          {
            backgroundColor: isDiscovering
              ? theme.colors.SURFACE
              : theme.colors.SECONDARY,
            minHeight: theme.touchTargets.LARGE,
            ...theme.shadows.MD,
          },
          pressed && !isDiscovering && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Discover printers"
        accessibilityState={{ disabled: isDiscovering }}
      >
        {isDiscovering ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#FFFFFF" />
            <Text
              style={[
                styles.buttonText,
                {
                  color: theme.colors.TEXT_DISABLED,
                  fontSize: theme.typography.FONT_SIZES.BODY,
                  marginLeft: 12,
                },
              ]}
            >
              Searching...
            </Text>
          </View>
        ) : (
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            Search for Printers
          </Text>
        )}
      </Pressable>

      {/* Discovered Printers List */}
      {discoveredPrinters.length > 0 && (
        <View style={styles.printersSection}>
          <Text
            style={[
              styles.subsectionTitle,
              {
                color: theme.colors.TEXT_SECONDARY,
                fontSize: theme.typography.FONT_SIZES.BODY,
              },
            ]}
          >
            Found {discoveredPrinters.length} printer{discoveredPrinters.length > 1 ? 's' : ''}:
          </Text>

          <FlatList
            data={discoveredPrinters}
            keyExtractor={(item, index) =>
              (item as { ipAddress?: string }).ipAddress ?? `printer-${index}`
            }
            renderItem={({ item }) => {
              const printer = item as { ipAddress?: string; modelName?: string };
              return (
                <Pressable
                  onPress={() => {
                    handleSelectPrinter(printer);
                  }}
                  style={({ pressed }) => [
                    styles.printerCard,
                    {
                      backgroundColor: theme.colors.SURFACE,
                      borderColor: theme.colors.DIVIDER,
                      ...theme.shadows.SM,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select printer ${
                    printer.modelName ?? 'Unknown'
                  } at ${printer.ipAddress ?? 'Unknown IP'}`}
                >
                  <Text
                    style={[
                      styles.printerModel,
                      {
                        color: theme.colors.TEXT_PRIMARY,
                        fontSize: theme.typography.FONT_SIZES.BODY,
                      },
                    ]}
                  >
                    {printer.modelName ?? 'Brother Printer'}
                  </Text>
                  <Text
                    style={[
                      styles.printerIP,
                      {
                        color: theme.colors.TEXT_SECONDARY,
                        fontSize: theme.typography.FONT_SIZES.SMALL,
                      },
                    ]}
                  >
                    {printer.ipAddress ?? 'Unknown IP'}
                  </Text>
                </Pressable>
              );
            }}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Section: Test Print */}
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.TEXT_PRIMARY,
            fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
            marginTop: 40,
          },
        ]}
      >
        Test Print
      </Text>

      <Pressable
        onPress={handleTestPrint}
        disabled={!savedIP}
        style={({ pressed }) => [
          styles.testButton,
          {
            backgroundColor: savedIP ? theme.colors.WARNING : theme.colors.SURFACE,
            minHeight: theme.touchTargets.LARGE,
            ...theme.shadows.MD,
          },
          pressed && savedIP && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Test print"
        accessibilityState={{ disabled: !savedIP }}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: savedIP ? '#FFFFFF' : theme.colors.TEXT_DISABLED,
              fontSize: theme.typography.FONT_SIZES.BODY,
            },
          ]}
        >
          Print Test Label
        </Text>
      </Pressable>

      {!savedIP && (
        <Text
          style={[
            styles.helpText,
            {
              color: theme.colors.TEXT_SECONDARY,
              fontSize: theme.typography.FONT_SIZES.SMALL,
            },
          ]}
        >
          Save a printer IP address first to enable test printing
        </Text>
      )}

      {/* Hidden label view for printing */}
      <View style={styles.hiddenView}>
        <LabelView ref={labelViewRef} labelFormat={testLabel} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  ipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  ipInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedIP: {
    fontWeight: '600',
    marginBottom: 16,
  },
  discoverButton: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printersSection: {
    marginTop: 8,
  },
  printerCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  printerModel: {
    fontWeight: '700',
    marginBottom: 4,
  },
  printerIP: {
    fontWeight: '500',
  },
  testButton: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  helpText: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  hiddenView: {
    position: 'absolute',
    left: -10000,
    top: -10000,
  },
});
