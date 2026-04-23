import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync();
    }, 1200);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Slot />

      {!ready && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#002147',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center' }}>
            Designed by the Academic Office – Chemical Engineering Class 23.5
          </Text>
        </View>
      )}
    </View>
  );
}
