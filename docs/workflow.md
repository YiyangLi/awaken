# Awaken - Development Workflow

## Agent-Based Development Process

This project uses **Claude Code** with specialized agents for consistent, accessible development. This workflow is defined in `CLAUDE.md`.

---

## Development Agents

### 1. @agent-mobile-architect
**Responsibilities**:
- Analyzes development roadmap (`.claude/roadmap/2025.md`)
- Reviews changelog for progress tracking
- Assigns tickets from `.claude/tickets/` to engineers
- Provides technical guidance and architectural decisions
- Ensures proper ticket scoping and dependency management

### 2. @agent-react-native-accessibility-engineer
**Responsibilities**:
- Implements assigned tickets with accessibility focus
- Prioritizes elder-friendly design patterns
- Ensures WCAG compliance and 44pt touch targets
- Updates changelog with implementation details
- Provides summaries and next steps

---

## Ticket Workflow

### Trigger Command
```
"let's work on ticket LCC_X"
```

### Automated Process

#### Step 1: Ticket Analysis (@agent-mobile-architect)
1. Read ticket from `.claude/tickets/LCC_X.md`
2. Check dependencies ("Blocked by: LCC_Y")
3. Verify completion in `.claude/context/changelog.md`
4. Review current project status
5. Update requirements based on project evolution
6. Assign to engineer with full context

#### Step 2: Implementation (@agent-react-native-accessibility-engineer)
1. Receive ticket with dependency status
2. Implement with accessibility focus
3. Ensure elder-friendly patterns (44pt targets, high contrast)
4. Run quality checks (TypeScript + ESLint)
5. Update documentation per Changelog Workflow

---

## Changelog Workflow

### Two-Tier Documentation System

**Structure**:
- `.claude/context/changelog.md` - Compact summary (3-4 lines per ticket)
- `.claude/context/ticket-details/LCC_XX.md` - Detailed notes (optional)

### When Completing a Ticket

#### 1. Add Compact Summary to changelog.md
```markdown
## [LCC_XX] - YYYY-MM-DD - Ticket Title
**Files**: Key files created/modified
**Summary**: 1-2 sentence overview
**Key Features**: Bullet points of main functionality
[Details →](./ticket-details/LCC_XX.md)
```

#### 2. Create Detailed File (Optional)
Use `.claude/context/ticket-details/LCC_14.md` as template

**Create detailed file for**:
- ✅ Complex implementation (>100 lines changed)
- ✅ Bug fixes needing documentation
- ✅ Architectural decisions
- ✅ Multiple iterations or refinements

**Skip detailed file for**:
- ⚠️ Simple config changes
- ⚠️ Trivial updates (<20 lines)
- ⚠️ Minor fixes without technical complexity

#### 3. Detail File Template
```markdown
# LCC_XX: Title

**Date**: YYYY-MM-DD
**Status**: Complete
**Story Points**: X
**Priority**: High/Medium/Low
**Implemented by**: Name

## Overview
## What Was Implemented
## Technical Implementation
## Bug Fixes (if applicable)
## Files Created/Modified
## Verification Results
## Elder-Friendly Features
## Next Steps
```

---

## Quality Assurance Checklist

### Pre-Commit Checks
```bash
# TypeScript compilation
npm run type-check

# Linting (including accessibility)
npm run lint

# Combined check
npm run check
```

### Every Implementation Must Include
- ✅ TypeScript compilation without errors
- ✅ ESLint passing (including jsx-a11y rules)
- ✅ Elder-friendly design verification
- ✅ Touch target compliance (44pt minimum)
- ✅ High contrast accessibility standards
- ✅ Manual testing with VoiceOver (iOS)

---

## Git Workflow

### Branch Strategy
```
main                    # Production-ready code
  └── feature/LCC_XX    # Feature branches
  └── fix/bug-name      # Bug fix branches
```

### Commit Convention
```
feat: Add modal system for confirmations
fix: Correct cart clearing when switching drinks
docs: Update architecture documentation
refactor: Simplify order display logic
style: Format code per ESLint rules
test: Add storage integration tests
```

### Creating a Pull Request
```bash
# Ensure changes are committed
git add .
git commit -m "feat: your feature description"

# Push branch
git push origin feature/LCC_XX

# Create PR (if using gh CLI)
gh pr create --title "LCC_XX: Title" --body "Description"
```

---

## Code Review Process

### Reviewer Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (including accessibility)
- [ ] Touch targets meet 44pt minimum
- [ ] Text is readable (minimum 20pt body text)
- [ ] High contrast maintained
- [ ] Haptic feedback where appropriate
- [ ] Accessibility attributes present
- [ ] Error handling implemented
- [ ] Code follows project patterns
- [ ] Documentation updated

### Accessibility Review
- [ ] VoiceOver tested
- [ ] accessibilityRole on interactive elements
- [ ] accessibilityLabel for clarity
- [ ] accessibilityHint for guidance
- [ ] accessibilityState for dynamic states

---

## Testing Workflow

### Manual Testing (Current)
1. **iOS Simulator Testing**
   ```bash
   npm run ios
   ```

2. **VoiceOver Testing**
   - Enable VoiceOver: Cmd + F5
   - Navigate with swipe gestures
   - Verify all labels and hints

3. **Visual Testing**
   - Check touch target sizes (44pt+)
   - Verify text readability
   - Test high contrast mode
   - Check color combinations

### Automated Testing (LCC_15 - Future)
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage

# E2E tests (future)
npm run test:e2e
```

---

## Issue Resolution Workflow

### Bug Report Format
```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Device: iPhone 14 Simulator
- iOS: 17.0
- App Version: 1.0.0

## Screenshots
[If applicable]
```

### Fix Workflow
1. Create branch: `fix/bug-description`
2. Reproduce bug locally
3. Implement fix
4. Add test (if applicable)
5. Verify fix
6. Update changelog
7. Create PR

---

## Release Workflow (Future)

### Version Numbering
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features
- **Patch** (0.0.1): Bug fixes

### Release Steps
1. Update version in `package.json`
2. Update `CHANGELOG.md` with release notes
3. Create git tag: `git tag v1.0.0`
4. Build production app
5. Submit to App Store
6. Monitor for issues

---

## Documentation Workflow

### When to Update Docs

**setup.md** - Update when:
- Adding new dependencies
- Changing setup steps
- Adding environment variables
- Updating build process

**architecture.md** - Update when:
- Adding new systems/patterns
- Changing data models
- Modifying architecture
- Adding new dependencies

**workflow.md** - Update when:
- Changing development process
- Adding new workflows
- Updating quality standards
- Modifying testing approach

**CLAUDE.md** - Update when:
- Changing agent workflow
- Adding new project context
- Updating development commands
- Modifying directory structure

---

## Ticket Management

### Ticket Location
`.claude/tickets/LCC_X.md`

### Ticket Format
```markdown
# LCC_X: Title

## Description
What needs to be done

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Dependencies
Blocked by: LCC_Y

## Story Points
1-13 (Fibonacci)

## Priority
High/Medium/Low
```

### Ticket States
- **Not Started**: In `.claude/tickets/`, not in changelog
- **In Progress**: Assigned to agent, being implemented
- **Complete**: Entry in changelog, detailed file created
- **Blocked**: Waiting on dependencies

---

## Development Best Practices

### Code Organization
```typescript
// 1. Imports (grouped)
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts';

// 2. Types/Interfaces
interface Props { ... }

// 3. Component
export function Component({ ... }: Props) {
  // 4. Hooks
  const { theme } = useTheme();

  // 5. State
  const [value, setValue] = useState('');

  // 6. Effects
  useEffect(() => { ... }, []);

  // 7. Handlers
  const handlePress = () => { ... };

  // 8. Render
  return ( ... );
}

// 9. Styles
const styles = StyleSheet.create({ ... });
```

### Elder-Friendly Patterns
```tsx
// Large touch targets
<Pressable
  style={{
    minHeight: theme.touchTargets.LARGE,  // 44pt
    minWidth: theme.touchTargets.LARGE,
  }}
>

// High contrast
<Text style={{
  color: theme.colors.TEXT_PRIMARY,
  backgroundColor: theme.colors.SURFACE,
}}>

// Large text
<Text style={{
  fontSize: theme.typography.FONT_SIZES.HEADING,  // 28pt
}}>

// Haptic feedback
<Pressable
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleAction();
  }}
>
```

### Accessibility Patterns
```tsx
// Button
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Add to cart"
  accessibilityHint="Double tap to add this drink to your order"
>

// Header
<Text accessibilityRole="header">

// Form field
<TextInput
  accessibilityLabel="Customer name"
  accessibilityHint="Enter your name for the order"
/>
```

---

## Performance Guidelines

### Optimization Checklist
- [ ] Use React.memo for expensive components
- [ ] Implement useCallback for event handlers
- [ ] Use useMemo for expensive calculations
- [ ] Avoid inline functions in render
- [ ] Debounce frequent updates
- [ ] Lazy load heavy components
- [ ] Optimize images with Expo Image
- [ ] Batch AsyncStorage operations

### Performance Targets
- Screen transition: < 300ms
- Touch response: < 100ms
- Storage operations: < 200ms
- App launch: < 2s

---

## Accessibility Guidelines

### WCAG 2.1 Compliance
- **Level A**: Minimum (all must pass)
- **Level AA**: Target standard
- **Level AAA**: Aspirational

### Key Requirements
- Contrast ratio: 4.5:1 minimum (AA)
- Touch targets: 44pt × 44pt minimum
- Text size: 20pt body, 28pt headings
- Focus indicators: Clearly visible
- Error messages: Descriptive and helpful
- Time limits: None or adjustable

---

## Resources

### Internal Documentation
- [Setup Guide](./setup.md)
- [Architecture](./architecture.md)
- [Changelog](../.claude/context/changelog.md)
- [Ticket Details](../.claude/context/ticket-details/)

### External Resources
- [Expo Docs](https://docs.expo.dev/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS HIG](https://developer.apple.com/design/human-interface-guidelines/)

---

## Quick Reference

### Essential Commands
```bash
# Development
npm start              # Start dev server
npm run ios           # iOS simulator
npm run check         # Type check + lint

# Quality
npm run type-check    # TypeScript only
npm run lint          # ESLint only
npm run lint:fix      # Auto-fix linting

# Maintenance
npx expo start --clear  # Clear cache
npm run clean          # Clean install
```

### Key Files
- `CLAUDE.md` - Claude Code instructions
- `.claude/context/changelog.md` - Development history
- `.claude/tickets/` - Task specifications
- `/docs/` - Technical documentation
- `/src/config/` - App configuration

### Default Credentials
- Admin PIN: 1234
