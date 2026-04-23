import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const { user, loading } = useAuth();
  const [safetyTimeout, setSafetyTimeout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setSafetyTimeout(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading || safetyTimeout) {
      SplashScreen.hideAsync().catch(() => {});

      // 🔥 الحل السحري لمنع الـ Crash
      setTimeout(() => {
        if (!user) {
          router.replace('/login');
          return;
        }

        if (user.status === 'pending') {
          router.replace('/pending');
        } else {
          router.replace('/(tabs)/academic');
        }
      }, 50); // ← delay بسيط يمنع الـ double navigation crash
    }
  }, [user, loading, safetyTimeout]);

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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#002147' },
  text: { color: '#fff', marginTop: 20, fontSize: 16, textAlign: 'center' }
});
