import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [safetyTimeout, setSafetyTimeout] = useState(false);

  // Safety timeout في حالة تأخر الـ Auth
  useEffect(() => {
    const timer = setTimeout(() => setSafetyTimeout(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // التحكم في إخفاء Splash + الـ Navigation
  useEffect(() => {
    if (loading && !safetyTimeout) return;

    // إخفاء الـ Splash Screen
    SplashScreen.hideAsync().catch(() => {});

    // تأخير بسيط لتجنب Double Navigation Crash
    const navigationTimer = setTimeout(() => {
      if (!user) {
        router.replace('/login');
        return;
      }

      if (user.status === 'pending') {
        router.replace('/pending');
      } else {
        router.replace('/(tabs)/academic');
      }
    }, 80);

    return () => clearTimeout(navigationTimer);
  }, [user, loading, safetyTimeout, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D4AF37" />
      <Text style={styles.text}>
        جاري التأكد من تسجيلك أو الاتصال بالإنترنت...
      </Text>
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
  text: { 
    color: '#fff', 
    marginTop: 20, 
    fontSize: 16, 
    textAlign: 'center',
    paddingHorizontal: 20 
  }
});
