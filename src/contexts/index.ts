/**
 * Context exports for Awaken app
 * Elder-friendly centralized context management
 */

export { ThemeProvider, useTheme } from './ThemeContext';
export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';

// Modal system (from components, re-exported for convenience)
export { ModalProvider, useModal } from '../components/ModalProvider';
