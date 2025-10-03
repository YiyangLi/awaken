# Awaken ☕

An elder-friendly iOS coffee ordering app designed for coffee carts and small coffee shops. Built with React Native and Expo, Awaken provides a simple, accessible interface for customers to order their favorite drinks with easy customization options.

## 🎯 Project Overview

Awaken is specifically designed for:
- **Elder customers** with large, accessible UI components
- **Coffee cart operations** with offline-first functionality
- **Simple drink ordering** with intuitive customization
- **Barista workflow** with admin management features

### Key Features

- **6 Drink Categories**: Mocha, Chai Latte, Latte, Hot Chocolate, Americano, Italian Soda
- **Elder-Friendly Design**: Large text, high contrast, touch-friendly buttons
- **Dual Mode Interface**: User mode for ordering, Admin mode for management
- **Local Data Storage**: No internet required, works offline
- **Barista Management**: Admin can manage staff and view order analytics
- **Future Label Printing**: Prepared for integration with label printers

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage for local data persistence
- **State Management**: React Context API (planned)
- **UI Framework**: Custom accessible components
- **Platform**: iOS-focused (with potential Android expansion)

### Project Structure
```
awaken/
├── app/                    # Expo Router pages
│   ├── (user)/            # User mode screens
│   ├── (admin)/           # Admin mode screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components (buttons, inputs)
│   ├── drink/            # Drink-specific components
│   └── admin/            # Admin-specific components
├── services/             # Business logic and data services
│   ├── storage.ts        # AsyncStorage wrapper
│   ├── orders.ts         # Order management
│   └── config.ts         # Configuration management
├── types/                # TypeScript type definitions
├── assets/               # Images, fonts, icons
├── config/               # Configuration files
│   └── config.json       # App configuration
└── .claude/              # Development documentation
    └── roadmap/          # Project roadmaps
```

### Data Flow
```
User Input → Validation → Business Logic → Local Storage → UI Update
     ↑                                                        ↓
Admin Mode ← Authentication ← Config Service ← Data Service
```

### Core Data Models
```typescript
interface Order {
  id: string;
  customerName: string;
  drink: Drink;
  barista: string;
  timestamp: Date;
  status: 'pending' | 'completed';
}

interface Drink {
  category: DrinkCategory;
  options: Record<string, number | boolean | string>;
  specialInstructions?: string;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.4 or higher
- iOS Simulator (Xcode) or physical iOS device
- Expo CLI installed globally: `npm install -g @expo/cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:YiyangLi/awaken.git
   cd awaken
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on iOS Simulator**
   ```bash
   npx expo start --ios
   ```

### Development Workflow

#### Running the App
- **iOS Simulator**: `npx expo start --ios`
- **Development Build**: `npx expo start --dev-client`
- **Web**: `npx expo start --web` (for testing only)

#### Project Setup Commands
```bash
# Reset to fresh project structure
npm run reset-project

# Clear Expo cache
npx expo start --clear

# Type checking
npx tsc --noEmit

# Linting (to be configured)
npm run lint
```

## 🧪 Testing

### Manual Testing
- Test on various iOS devices and screen sizes
- Verify accessibility features with VoiceOver
- Test touch interactions for elder users
- Validate offline functionality

### Testing Checklist
- [ ] Large button touch targets (minimum 44pt)
- [ ] High contrast text and UI elements
- [ ] Offline data persistence
- [ ] Admin password protection
- [ ] Order flow completion
- [ ] Barista assignment functionality

## 📋 Configuration

### App Configuration
The app uses a configuration file at `config/config.json`:

```json
{
  "adminPassword": "your-admin-password",
  "defaultBaristas": ["Tina", "Maggie", "Bryant"],
  "appSettings": {
    "fontSize": "large",
    "theme": "high-contrast"
  }
}
```

### Environment Setup
- Ensure iOS development environment is properly configured
- Install Xcode and iOS Simulator
- Configure code signing for device testing

## 🎨 Design Guidelines

### Accessibility Requirements
- **Minimum Touch Target**: 44pt (iOS Human Interface Guidelines)
- **Text Size**: Large, scalable text (minimum 18pt)
- **Color Contrast**: WCAG AA compliant (4.5:1 ratio)
- **Navigation**: Simple, linear flow with clear back buttons

### Elder-Friendly Design Principles
- Large, clearly labeled buttons
- High contrast color schemes
- Minimal cognitive load per screen
- Clear visual feedback for all interactions
- Simple, familiar UI patterns

## 📖 Development Resources

### Expo Documentation
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based navigation
- [AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/) - Local data storage
- [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) - Secure storage for passwords

### iOS Design Guidelines
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Accessibility Guidelines](https://developer.apple.com/accessibility/)

### Project Documentation
- [Development Roadmap](.claude/roadmap/2025.md) - Detailed project timeline and phases
- [GitHub Repository](https://github.com/YiyangLi/awaken) - Source code and issues

## 🤝 Contributing

### Development Process
1. Check the roadmap for current phase priorities
2. Create feature branches from `main`
3. Test thoroughly on iOS devices
4. Ensure accessibility compliance
5. Update documentation as needed

### Code Style
- TypeScript for all new code
- Follow React Native best practices
- Use meaningful component and function names
- Comment complex business logic

## 📞 Support

For questions about the project:
- Check the [roadmap documentation](.claude/roadmap/2025.md)
- Review existing GitHub issues
- Test thoroughly before reporting bugs

## 📄 License

This project is private and proprietary. All rights reserved.

---

**Built with ❤️ for coffee lovers and accessibility**
