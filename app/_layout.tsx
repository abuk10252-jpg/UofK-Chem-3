import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// يجب أن يكون خارج أي كومبوننت
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return <Slot />;
}
