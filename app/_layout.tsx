import { Stack } from 'expo-router';
import { ThemeProvider, AuthProvider, CartProvider } from '@/contexts';
import { ModalProvider } from '@/components/ModalProvider';
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
          <ModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </ModalProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
