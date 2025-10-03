# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Awaken is an elder-friendly iOS coffee ordering app built with React Native and Expo. It's designed for coffee carts and small coffee shops with offline-first functionality and accessibility features.

## Common Development Commands

### Running the App
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android
npx expo start --android

# Run on web (testing only)
npx expo start --web

# Clear Expo cache
npx expo start --clear
```

### Code Quality
```bash
# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

### Project Management
```bash
# Reset project to blank state (removes current implementation)
npm run reset-project
```

## Architecture

### Technology Stack
- **Framework**: React Native with Expo ~54.0.12
- **Navigation**: Expo Router (file-based routing)
- **TypeScript**: Strict mode enabled
- **Storage**: AsyncStorage for local data persistence (planned)
- **State Management**: React Context API (planned)
- **Icons**: SF Symbols (iOS) with Material Icons fallback

### Key Directories
- `app/` - Expo Router pages with file-based routing
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript interfaces and types
- `src/config/` - App configuration
- `src/storage/` - Data persistence logic
- `src/utils/` - Utility functions
- `assets/` - Images, icons, and static resources

### Design Principles
- Elder-friendly design with large touch targets (minimum 44pt)
- High contrast color schemes for accessibility
- Simple, linear navigation flow
- Large text and clear visual feedback

## Development Notes

- Uses strict TypeScript configuration
- ESLint configured with Expo's recommended settings
- No existing test framework - manual testing required
- Focus on iOS platform with Android compatibility through React Native
- Offline-first approach for coffee cart operations