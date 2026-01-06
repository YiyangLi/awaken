# src/components/

## Purpose

Reusable UI components for the Awaken coffee ordering app. Contains both generic UI components and specialized components like label printing views and modals.

## Key Files

### `LabelView.tsx`
**Purpose**: Renders coffee order labels for Brother QL-810W printer
**Key Features**:
- Physical size: 2.44" × 1.37" (62mm × 34.88mm)
- Rendered at 300 DPI = 732px × 411px
- Two-line format: Customer name (Font 18) + Drink summary (Font 12)
- Designed for off-screen rendering and image capture via `react-native-view-shot`
- Uses forwardRef for parent component to trigger image capture

**Implementation Details**:
- Line 1: Customer name, 72pt font (18pt × 4 for 300 DPI), bold
- Line 2: Drink summary, 48pt font (12pt × 4 for 300 DPI), medium weight
- White background with precise padding for label alignment

**Git History**:
- `6450e4c` - Final polish for printing functionality
- `ac49c0a` - Work on LCC_10 (label printing)

### `ModalProvider.tsx`
**Purpose**: Centralized modal system with elder-friendly design
**Key Features**:
- **Modal Types**: confirmation, alert, loading, form
- **Accessibility**: Large touch targets (44pt minimum), haptic feedback, screen reader support
- **Stack-based**: Supports multiple modals in sequence
- **Elder-friendly**: High contrast, large text, clear visual feedback

**API**:
```typescript
const { showConfirmation, showAlert, showLoading, showForm, hideModal } = useModal();

// Confirmation modal
showConfirmation({
  title: 'Delete Order?',
  message: 'This action cannot be undone',
  onConfirm: () => { /* delete logic */ },
  confirmText: 'Delete',
  cancelText: 'Cancel',
});

// Alert modal
showAlert({
  title: 'Success',
  message: 'Order created successfully',
  buttonText: 'OK',
});

// Loading modal
showLoading({
  title: 'Printing...',
  message: 'Please wait',
});

// Form modal
showForm({
  title: 'Enter Customer Name',
  placeholder: 'Name',
  initialValue: '',
  onSubmit: (value) => { /* submit logic */ },
});
```

**Implementation Details**:
- Uses React Context for app-wide access
- Modal stack allows multiple modals in sequence
- Backdrop press closes modal (except loading type)
- KeyboardAvoidingView for form modals on iOS
- All buttons have minimum 44pt touch targets
- Haptic feedback on all interactions

**Git History**:
- `6450e4c` - Final polish on modal interactions
- `30f8322` - LCC_16 and LCC_17 (modal system enhancements)
- `5cb5e39` - LCC_11 and LCC_12 (initial modal implementation)

### `navigation/NavigationHeader.tsx`
**Purpose**: Elder-friendly navigation header with optional back button
**Key Features**:
- Large text for title and subtitle
- Optional back button with haptic feedback
- Theme-aware styling
- Elevated surface with shadow for visual depth

**Props**:
```typescript
interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}
```

**Git History**:
- `e732781` - LCC_8 (navigation system)

### `navigation/BackButton.tsx`
**Purpose**: Accessible back navigation button
**Key Features**:
- Minimum 44pt touch target (comfortable size)
- Haptic feedback on press
- Accessibility labels and hints
- Uses Expo Router for navigation by default
- Custom onPress callback support

**Git History**:
- `aff48fc` - LCC_10B refinements
- `e732781` - LCC_8 (navigation system)

### `navigation/ModeSwitch.tsx`
**Purpose**: Toggle between User and Admin modes
**Key Features**:
- Password authentication for admin mode
- Animated shake on incorrect password
- Inline password input with confirm/cancel buttons
- Haptic feedback for all interactions
- Theme-aware colors (Primary for User, Error for Admin)

**Implementation Details**:
- Uses AuthContext for login/logout
- Stores admin session in UserPreferences
- Password validation with visual feedback
- Auto-navigates to appropriate route group on mode switch

**Git History**:
- `aff48fc` - LCC_10B (mode switching refinements)
- `e732781` - LCC_8 (initial navigation)

## Folder Structure

```
src/components/
├── LabelView.tsx          # Brother printer label rendering
├── ModalProvider.tsx      # Modal system with useModal hook
├── navigation/
│   ├── BackButton.tsx     # Accessible back navigation
│   ├── ModeSwitch.tsx     # User/Admin mode toggle
│   ├── NavigationHeader.tsx # Page header with title
│   └── index.ts           # Navigation component exports
└── index.ts               # Main component exports
```

## Design Patterns

### Elder-Friendly Principles
1. **Large Touch Targets**: Minimum 44pt (comfortable: 56pt, large: 64pt)
2. **High Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
3. **Haptic Feedback**: Every interactive element provides tactile feedback
4. **Clear Visual States**: Pressed states with opacity and scale transforms
5. **Accessibility Labels**: All interactive elements have proper ARIA roles

### Component Architecture
- **Forwardable Refs**: LabelView uses forwardRef for parent access
- **Context Integration**: Components consume theme, auth, modal contexts
- **TypeScript Strict**: All props and state fully typed
- **Expo Router Integration**: Navigation components work with file-based routing

## Usage Examples

### Using ModalProvider
```tsx
// In _layout.tsx
<ModalProvider>
  <Stack />
</ModalProvider>

// In any component
const { showConfirmation } = useModal();

const handleDelete = () => {
  showConfirmation({
    title: 'Delete this item?',
    message: 'This cannot be undone',
    onConfirm: async () => {
      await deleteItem();
    },
  });
};
```

### Using LabelView
```tsx
const labelRef = useRef<View>(null);

const printLabel = async () => {
  const imageUri = await captureRef(labelRef, {
    format: 'png',
    quality: 1.0,
  });

  await PrintService.printLabel(labelFormat, printerConfig, imageUri);
};

return (
  <LabelView ref={labelRef} labelFormat={labelFormat} />
);
```

## Related Tickets

- **LCC_8**: Navigation system (NavigationHeader, BackButton, ModeSwitch)
- **LCC_10**: Label printing (LabelView initial implementation)
- **LCC_10B**: Label printing refinements (navigation polish)
- **LCC_11**: Modal system foundation
- **LCC_12**: Modal form inputs
- **LCC_16**: Modal enhancements
- **LCC_17**: Modal accessibility improvements

## Testing Notes

- Manual testing required for haptic feedback (physical device only)
- Label printing requires actual Brother QL-810W printer
- Modal accessibility tested with VoiceOver on iOS
- Touch target sizes verified with iOS Accessibility Inspector
