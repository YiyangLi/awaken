import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { StorageService } from '../storage';
import { THEMES } from '../config';

/**
 * Available theme names for elder-friendly customization
 */
type ThemeName = 'DEFAULT' | 'DARK' | 'HIGH_CONTRAST' | 'LARGE_TEXT';

/**
 * Theme structure interface
 * Defines the shape of a theme object without enforcing literal types
 */
interface Theme {
  colors: {
    BACKGROUND: string;
    SURFACE: string;
    SURFACE_ELEVATED: string;
    PRIMARY: string;
    PRIMARY_DARK: string;
    PRIMARY_LIGHT: string;
    SECONDARY: string;
    ACCENT: string;
    TEXT_PRIMARY: string;
    TEXT_SECONDARY: string;
    TEXT_DISABLED: string;
    DIVIDER: string;
    ERROR: string;
    WARNING: string;
    SUCCESS: string;
    INFO: string;
  };
  typography: {
    FONT_SIZES: {
      CAPTION: number;
      SMALL: number;
      BODY: number;
      SUBHEADING: number;
      HEADING: number;
      LARGE_HEADING: number;
      TITLE: number;
    };
    LINE_HEIGHTS: {
      TIGHT: number;
      NORMAL: number;
      RELAXED: number;
      LOOSE: number;
    };
    FONT_WEIGHTS: {
      NORMAL: string;
      MEDIUM: string;
      SEMIBOLD: string;
      BOLD: string;
    };
  };
  spacing: {
    XS: number;
    SM: number;
    MD: number;
    LG: number;
    XL: number;
    XXL: number;
    XXXL: number;
  };
  touchTargets: {
    MINIMUM: number;
    COMFORTABLE: number;
    LARGE: number;
  };
  shadows: typeof THEMES.DEFAULT.shadows;
  borderRadius: typeof THEMES.DEFAULT.borderRadius;
}

/**
 * Context value interface for theme management
 * Provides current theme, theme name, setter, and loading state
 */
interface ThemeContextValue {
  /** Current theme object with colors, typography, spacing, etc. */
  theme: Theme;
  /** Name of the currently active theme */
  themeName: ThemeName;
  /** Function to change the active theme */
  setTheme: (name: ThemeName) => void;
  /** Loading state while theme preference is being retrieved from storage */
  isLoading: boolean;
}

/**
 * React Context for theme management
 * Elder-friendly: Provides centralized theme access throughout the app
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Props for ThemeProvider component
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * 
 * Manages theme state and persistence for the entire application.
 * Elder-friendly features:
 * - Automatic persistence via StorageService
 * - Graceful fallback to DEFAULT theme on errors
 * - Loading state prevents flash of wrong theme
 * - No crashes on storage errors
 * 
 * @param children - React children to wrap with theme context
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>('DEFAULT');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Load theme preference from storage
   * Elder-friendly: Uses StorageService from LCC_4 with graceful fallback
   */
  const loadThemePreference = async () => {
    try {
      const settings = await StorageService.getSettings();
      
      if (settings?.userPreferences?.theme) {
        // Validate theme name to prevent errors from corrupted storage
        const savedTheme = settings.userPreferences.theme;
        if (savedTheme === 'DEFAULT' || savedTheme === 'DARK' || 
            savedTheme === 'HIGH_CONTRAST' || savedTheme === 'LARGE_TEXT') {
          setThemeName(savedTheme);
        }
      }
    } catch (error) {
      // Elder-friendly: Log error but gracefully fallback to DEFAULT
      // eslint-disable-next-line no-console
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set theme and persist preference to storage
   * Elder-friendly: Automatic persistence without user intervention
   * 
   * @param name - Theme name to activate
   */
  const setThemeWithPersistence = async (name: ThemeName) => {
    try {
      // Update UI immediately for responsive feedback
      setThemeName(name);
      
      // Persist theme preference via StorageService
      const settings = await StorageService.getSettings();
      
      if (settings) {
        // Update existing settings
        await StorageService.saveSettings({
          ...settings,
          userPreferences: {
            ...settings.userPreferences,
            theme: name,
          },
        });
      } else {
        // Create new settings if none exist
        // This handles the first-time user experience gracefully
        const defaultSettings = {
          userPreferences: {
            fontSize: 'large' as const,
            highContrastMode: false,
            theme: name,
            voiceAnnouncements: true,
            hapticFeedback: true,
          },
          cartConfig: {
            name: 'Awaken Coffee Cart',
            isOpen: true,
            menu: [],
            defaultPrepTime: 5,
            taxRate: 0.0875,
            currencySymbol: '$',
          },
          version: '1.0.0',
          lastUpdated: new Date(),
        };
        
        await StorageService.saveSettings(defaultSettings);
      }
    } catch (error) {
      // Elder-friendly: Log error but don't throw
      // Theme is still updated in UI even if persistence fails
      // eslint-disable-next-line no-console
      console.error('Failed to persist theme preference:', error);
    }
  };

  // Get the actual theme object based on current theme name
  const theme = THEMES[themeName];

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        themeName, 
        setTheme: setThemeWithPersistence, 
        isLoading 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme context
 * 
 * Elder-friendly: Simple API for consuming theme in components
 * Throws helpful error if used outside ThemeProvider
 * 
 * @returns ThemeContextValue with theme, themeName, setTheme, and isLoading
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme } = useTheme();
 *   
 *   return (
 *     <View style={{ backgroundColor: theme.colors.BACKGROUND }}>
 *       <Text style={{ color: theme.colors.TEXT_PRIMARY }}>
 *         Hello World
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
