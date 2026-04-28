import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
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
        
        // التحقق من وجود Token أو انتهاء التحميل
        if (!isLoading) {
          await SplashScreen.hideAsync();
          
          // إذا لم يوجد token، انتقل لصفحة Login
          if (!savedToken && !token) {
            router.replace('/(auth)/login');
          }
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
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
