import { Stack } from 'expo-router';
import { ThemeProvider, AuthProvider, CartProvider } from '@/contexts';
import { useEffect } from 'react';
import { seedInitialData, validateStoredData } from '@/storage';

export default function RootLayout() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await seedInitialData();
    await validateStoredData();
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
