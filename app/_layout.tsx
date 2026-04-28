import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleNavigation = async () => {
      try {
        await SplashScreen.hideAsync();

        // التأكد من حالة المستخدم والملاحة
        if (loading) {
          return;
        }

        if (!user) {
          router.replace('/login');
        } else if (user.role === 'admin') {
          router.replace('/admin');
        } else if (user.status === 'pending') {
          router.replace('/pending');
        } else if (user.status === 'approved') {
          router.replace('/(tabs)/academic');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    handleNavigation();
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B3A4B' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
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
