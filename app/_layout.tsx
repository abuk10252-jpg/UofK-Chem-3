import { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// منع إخفاء Splash Screen تلقائياً
SplashScreen.preventAutoHideAsync().catch(() => {});

// مكون للتحقق من الـ Token
function RootLayoutContent() {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        
        // إخفاء Splash Screen بعد التحقق
        if (savedToken || !isLoading) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Error checking token:', error);
        await SplashScreen.hideAsync();
      }
    };

    checkToken();
  }, [token, isLoading]);

  // عرض Loading بينما نتحقق من الـ Token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
