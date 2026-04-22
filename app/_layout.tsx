import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// بنمنع الشاشة من الإخفاء التلقائي عشان نتحكم فيها إحنا
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { loading } = useAuth();

  useEffect(() => {
    // لو الـ Auth خلص تحميل، أو مر زمن معين، بنخفي الشاشة
    if (!loading) {
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync().catch(() => {});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
