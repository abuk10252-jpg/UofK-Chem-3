import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';

// نمنع الإخفاء التلقائي عشان نتحكم إحنا
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const { user, loading } = useAuth();
  const [safetyTimeout, setSafetyTimeout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // عداد أمان إضافي (4 ثواني) لضمان دخول التطبيق
    const timer = setTimeout(() => {
      setSafetyTimeout(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading || safetyTimeout) {
      // إخفاء السبلاش سكرين فوراً
      SplashScreen.hideAsync().catch(() => {});

      if (!user) {
        router.replace('/login');
      } else if (user.status === 'pending') {
        router.replace('/pending');
      } else {
        router.replace('/(tabs)/academic');
      }
    }
  }, [user, loading, safetyTimeout]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#002147' 
  },
});
