import { Stack } from 'expo-router';
import { ThemeProvider, AuthProvider } from '@/contexts';
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
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
