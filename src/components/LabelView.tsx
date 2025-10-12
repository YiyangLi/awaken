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
 *
 * This component is rendered off-screen and captured as an image
 * for printing to the Brother label printer.
 */
export const LabelView = React.forwardRef<View, LabelViewProps>(
  ({ labelFormat }, ref) => (
    <View ref={ref} style={styles.labelContainer}>
      {/* Line 1: Customer Name (Font 18) */}
      <Text style={styles.customerName}>{labelFormat.line1}</Text>

      {/* Line 2: Drink Summary (Font 12) */}
      <Text style={styles.drinkSummary}>{labelFormat.line2}</Text>
    </View>
  )
);

LabelView.displayName = 'LabelView';

const styles = StyleSheet.create({
  labelContainer: {
    width: 732, // 2.44" at 300 DPI
    height: 411, // 1.37" at 300 DPI
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  customerName: {
    fontSize: 72, // 18pt × 4 (scale for 300 DPI)
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  drinkSummary: {
    fontSize: 48, // 12pt × 4 (scale for 300 DPI)
    fontWeight: '500',
    color: '#000000',
  },
});
