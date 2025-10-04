import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { StorageService } from '@/storage';
import { APP_CONFIG } from '@/config';

interface AuthContextValue {
  isAdmin: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const settings = await StorageService.getSettings();
      const isAdminSession = settings?.userPreferences?.isAdminSession ?? false;
      setIsAdmin(isAdminSession);
    } catch (error) {
      console.error('Failed to load auth state:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string): Promise<boolean> => {
    const isValid = password === APP_CONFIG.ADMIN.DEFAULT_PASSWORD;
    
    if (isValid) {
      setIsAdmin(true);
      
      try {
        const settings = await StorageService.getSettings();
        await StorageService.saveSettings({
          ...(settings ?? {
            version: APP_CONFIG.VERSION,
            userPreferences: {
              fontSize: 'large',
              highContrastMode: false,
              voiceAnnouncements: true,
              hapticFeedback: true,
            },
            cartConfig: {
              name: APP_CONFIG.CART.DEFAULT_NAME,
              isOpen: true,
              menu: [],
              defaultPrepTime: APP_CONFIG.ORDERS.DEFAULT_PREP_TIME_MINUTES,
              taxRate: APP_CONFIG.PRICING.DEFAULT_TAX_RATE,
              currencySymbol: APP_CONFIG.PRICING.CURRENCY_SYMBOL,
            },
            lastUpdated: new Date(),
          }),
          userPreferences: {
            ...(settings?.userPreferences ?? {
              fontSize: 'large',
              highContrastMode: false,
              voiceAnnouncements: true,
              hapticFeedback: true,
            }),
            isAdminSession: true,
          },
        });
      } catch (error) {
        console.error('Failed to save admin session:', error);
      }
    }
    
    return isValid;
  };

  const logout = async () => {
    setIsAdmin(false);
    
    try {
      const settings = await StorageService.getSettings();
      if (settings) {
        await StorageService.saveSettings({
          ...settings,
          userPreferences: {
            ...settings.userPreferences,
            isAdminSession: false,
          },
        });
      }
    } catch (error) {
      console.error('Failed to clear admin session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
