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
    const timer = setTimeout(() => {
      setSafetyTimeout(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading || safetyTimeout) {
      SplashScreen.hideAsync().catch(() => {});

      if (!user && (loading === false || safetyTimeout)) {
        router.replace('/login');
      } else if (user) {
        if (user.status === 'pending') {
          router.replace('/pending');
        } else {
          router.replace('/(tabs)/academic');
        }
      }
    }
  }, [user, loading, safetyTimeout]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D4AF37" />
      <Text style={{ color: '#fff', marginTop: 20, fontSize: 16, textAlign: 'center' }}>
        جاري التأكد من تسجيلك أو الاتصال بالإنترنت...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#002147' },
});
