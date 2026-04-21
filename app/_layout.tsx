import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AuthProvider } from '../src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// منع إخفاء شاشة البداية تلقائياً
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // أضف أي خطوط مخصصة هنا إذا كنت تستخدمها
  });

  useEffect(() => {
    if (loaded || error) {
      // إخفاء شاشة البداية فقط بعد تحميل الخطوط أو حدوث خطأ
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="pending" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="light" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
