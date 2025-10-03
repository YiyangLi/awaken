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

## Development Workflow

### Agent-Based Development Process

This project uses a structured workflow with specialized Claude Code agents to ensure consistent, accessible development.

#### **Agents and Responsibilities**

1. **@agent-mobile-architect**
   - Analyzes the development roadmap (`.claude/roadmap/2025.md`)
   - Reviews the changelog (`.claude/context/changelog.md`) for progress tracking
   - Assigns tickets from `.claude/tickets/` to appropriate agents
   - Provides technical guidance and architectural decisions
   - Ensures tickets are properly scoped and dependencies are clear

2. **@agent-react-native-accessibility-engineer**
   - Implements assigned tickets with accessibility focus
   - Prioritizes elder-friendly design patterns
   - Ensures WCAG compliance and large touch targets (44pt minimum)
   - Updates the changelog after completing work
   - Provides implementation summaries and next steps

#### **Development Flow**

**Trigger Command**: `"let's work on ticket LCC_X"`

When this command is given, Claude Code automatically executes the following workflow:

```
📋 STEP 1: Ticket Analysis (@agent-mobile-architect)
1. Read the requested ticket from `.claude/tickets/LCC_X.md`
2. Check ticket dependencies ("Blocked by: LCC_Y")
3. If dependencies exist, verify completion in `.claude/context/changelog.md`
4. Review current project status from changelog
5. Determine if ticket requirements need updates based on project evolution
6. Assign ticket to @agent-react-native-accessibility-engineer with context

📋 STEP 2: Implementation (@agent-react-native-accessibility-engineer)  
1. Receive ticket assignment with dependency status
2. Implement the assigned ticket with accessibility focus
3. Ensure elder-friendly design patterns (44pt touch targets, high contrast)
4. Run quality checks (TypeScript, ESLint with jsx-a11y rules)
5. Update `.claude/context/changelog.md` with:
   - Ticket completion status
   - Implementation details
   - Accessibility considerations
   - Verification results
   - Next steps

📊 Progress Tracking:
- Automatic dependency checking prevents blocked work
- Changelog maintains comprehensive development history
- Each ticket completion updates project status
```

**Key Automation Features**:
- ✅ Automatic dependency verification via changelog review
- ✅ Context-aware ticket assignment with current project state
- ✅ Seamless handoff between architect and engineer agents
- ✅ Integrated quality assurance and documentation updates

#### **Ticket Management**

- **Location**: `.claude/tickets/LCC_X.md`
- **Format**: Agile tickets with acceptance criteria
- **Dependencies**: Clearly marked with "Blocked by: LCC_X"
- **Status**: Tracked through changelog entries
- **Naming**: LCC (Large Coffee Cart) followed by sequential number

#### **Quality Assurance**

Every implementation must include:
- ✅ TypeScript compilation without errors
- ✅ ESLint passing (including accessibility rules)
- ✅ Elder-friendly design verification
- ✅ Touch target size compliance (44pt minimum)
- ✅ High contrast accessibility standards

## Development Notes

- Uses strict TypeScript configuration
- ESLint configured with accessibility rules (jsx-a11y)
- Manual testing required with focus on elder user experience
- Focus on iOS platform with Android compatibility through React Native
- Offline-first approach for coffee cart operations