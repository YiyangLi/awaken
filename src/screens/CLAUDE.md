# src/screens/

## Purpose

Placeholder directory for future screen components. Currently empty as all screens are implemented in the `app/` directory using Expo Router's file-based routing system.

## Current State

This directory contains only an `index.ts` export file with no actual screen components. All screens are located in `app/` following Expo Router conventions.

## Why This Exists

The `src/screens/` directory was created during initial project setup following standard React Native project structure. However, Expo Router's file-based routing system makes this directory redundant.

## Actual Screen Locations

All screens are in the `app/` directory:

### User Screens (`app/(user)/`)
- `app/(user)/index.tsx` - User home screen (drink menu)
- `app/(user)/customize.tsx` - Drink customization screen
- `app/(user)/review.tsx` - Order review screen
- `app/(user)/label-preview.tsx` - Label preview and print screen

### Admin Screens (`app/(admin)/`)
- `app/(admin)/index.tsx` - Admin dashboard (order management)
- `app/(admin)/inventory.tsx` - Inventory analysis screen
- `app/(admin)/settings.tsx` - Printer settings and syrup management

## Architecture Decision

**Expo Router File-Based Routing** is used instead of traditional screen components because:

1. **Simpler Navigation**: Route structure mirrors file structure
2. **Type Safety**: Automatic route parameter typing
3. **Deep Linking**: Built-in support for URL schemes
4. **Code Splitting**: Automatic screen lazy loading
5. **Elder-Friendly**: Clear, linear navigation flow

## Git History

- **a19a324** - Initial commit: Empty screens directory created

## Future Considerations

This directory could be repurposed for:
- **Shared Screen Components**: Reusable screen-level components (if needed)
- **Screen Templates**: Base screen layouts (if patterns emerge)
- **Legacy Support**: If migrating from older navigation system

However, current best practice with Expo Router is to keep all screens in `app/`.

## Related Documentation

For screen implementation details, see:
- **Expo Router Screens**: `app/` directory
- **Navigation Types**: `src/types/navigation.ts`
- **Route Groups**: `app/(user)/` and `app/(admin)/`
