import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts';

export default function Index() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const timer = setTimeout(() => {
      if (isAdmin) {
        router.replace('/(admin)');
      } else {
        router.replace('/(user)');
      }
    }, 0);

    return () => {clearTimeout(timer);};
  }, [isAdmin, router, isMounted]);

  return null;
}
