# Awaken - Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (macOS only) - via Xcode
- **Android Studio** (for Android development)
- **Git** for version control

### Recommended Tools
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - React Native Tools
  - Expo Tools

---

## Initial Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd awaken
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Verify Installation
```bash
# Check TypeScript compilation
npm run type-check

# Check linting
npm run lint

# Run both checks
npm run check
```

---

## Running the App

### Development Server
```bash
# Start Expo development server
npm start
# or
npx expo start
```

### Platform-Specific

#### iOS (macOS only)
```bash
npm run ios
# or
npx expo start --ios
```

#### Android
```bash
npm run android
# or
npx expo start --android
```

#### Web (Testing Only)
```bash
npm run web
# or
npx expo start --web
```

---

## Project Structure

```
awaken/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (user)/            # User mode screens
│   │   ├── index.tsx      # Menu screen
│   │   ├── drink/[id].tsx # Drink customization
│   │   ├── review.tsx     # Order review
│   │   └── confirmation.tsx
│   ├── (admin)/           # Admin mode screens
│   └── _layout.tsx        # Root layout
│
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ModalProvider.tsx
│   │   └── navigation/
│   ├── contexts/          # React Context providers
│   │   ├── ThemeContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── config/            # App configuration
│   │   ├── app.ts         # Drinks, customization options
│   │   └── theme.ts       # Theme definitions
│   ├── storage/           # AsyncStorage wrapper
│   │   ├── StorageService.ts
│   │   └── migrations.ts
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Utility functions
│   │   └── validation.ts
│   └── hooks/             # Custom React hooks
│
├── assets/                # Images, icons, fonts
├── docs/                  # Documentation
├── .claude/               # Claude Code context
│   ├── context/           # Development history
│   │   ├── changelog.md
│   │   └── ticket-details/
│   ├── tickets/           # Task specifications
│   └── roadmap/           # Project roadmap
│
└── CLAUDE.md              # Claude Code instructions
```

---

## Development Workflow

### Code Quality

#### TypeScript Type Checking
```bash
# One-time check
npm run type-check

# Watch mode
npm run type-check:watch
```

#### Linting
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Accessibility-specific linting
npm run lint:a11y
```

#### Combined Checks
```bash
npm run check  # Runs type-check + lint
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Ensure TypeScript types are correct
   - Add accessibility attributes
   - Test on iOS simulator

3. **Run quality checks**
   ```bash
   npm run check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Configuration

### Environment Variables
Currently, the app doesn't use environment variables. All configuration is in:
- `/src/config/app.ts` - App settings, drinks menu, customization options
- `/src/config/theme.ts` - Theme colors, typography, spacing

### Modifying the Menu
Edit `/src/config/app.ts`:
```typescript
export const APP_CONFIG = {
  DRINKS: [
    {
      id: 'mocha',
      name: 'Mocha',
      category: DrinkCategory.MOCHA,
      basePrice: 550, // Price in cents
      // ...
    },
  ],
  // ...
};
```

### Changing Theme Colors
Edit `/src/config/theme.ts`:
```typescript
export const THEMES = {
  DEFAULT: {
    colors: {
      PRIMARY: '#8B4513',      // Main brown
      BACKGROUND: '#FDF6E3',   // Cream
      // ...
    },
  },
};
```

---

## Troubleshooting

### Clear Cache Issues
```bash
# Clear Expo cache
npx expo start --clear

# Clean install
npm run clean

# Full reset
npm run reset
```

### iOS Build Issues
```bash
# Clear iOS build
cd ios && pod install && cd ..
npx expo prebuild --platform ios --clean
```

### TypeScript Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Metro Bundler Issues
```bash
# Kill all node processes
killall -9 node

# Restart development server
npx expo start --clear
```

---

## Testing

### Manual Testing Checklist
- [ ] Test on iOS simulator (primary platform)
- [ ] Verify large touch targets (44pt minimum)
- [ ] Check text readability (large fonts)
- [ ] Test with VoiceOver (iOS accessibility)
- [ ] Verify haptic feedback works
- [ ] Test offline functionality

### Accessibility Testing
- Enable VoiceOver on iOS
- Navigate through the app using VoiceOver
- Ensure all interactive elements are accessible
- Verify button labels are descriptive

---

## Common Tasks

### Adding a New Drink
1. Add drink definition to `/src/config/app.ts`
2. Add drink category to enum in `/src/types/index.ts` (if new category)
3. Update customization screen to handle new options
4. Test thoroughly

### Adding a New Screen
1. Create file in `/app/(user)/` or `/app/(admin)/`
2. Follow file-based routing convention
3. Add to navigation layout if needed
4. Ensure accessibility attributes

### Adding a New Context
1. Create context file in `/src/contexts/`
2. Export from `/src/contexts/index.ts`
3. Add provider to root layout
4. Use hook throughout app

---

## Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/)

### Accessibility
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Internal Docs
- [Architecture Overview](./architecture.md)
- [Development Workflow](./workflow.md)
- [Changelog](./.claude/context/changelog.md)

---

## Getting Help

### Internal Resources
- Check `CLAUDE.md` for Claude Code workflow
- Review ticket details in `.claude/context/ticket-details/`
- Consult the changelog for recent changes

### External Resources
- Expo Discord
- React Native Community
- Stack Overflow (react-native tag)

---

## Quick Reference

### Essential Commands
```bash
# Development
npm start                    # Start dev server
npm run ios                  # Run on iOS
npm run android              # Run on Android

# Code Quality
npm run type-check          # TypeScript check
npm run lint                # ESLint check
npm run check               # Both checks

# Maintenance
npm run clean               # Clean install
npx expo start --clear      # Clear cache
```

### Important Files
- `CLAUDE.md` - Claude Code instructions
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Linting rules
- `/src/config/app.ts` - App configuration
- `/src/config/theme.ts` - Theme settings

### Default Credentials
- **Admin PIN**: 1234
- **User Mode**: No login required
