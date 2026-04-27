import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { loginUser } from '../../src/utils/api';

export default function LoginScreen({ navigation }: any) {
  const { setUser, setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // بيانات المسؤول للاختبار
  const adminEmail = 'abuk10252@gmail.com';
  const adminPassword = 'Aaabus06555$';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);

    try {
      // التحقق إذا كان دخول المسؤول
      if (email === adminEmail && password === adminPassword) {
        const adminUser = {
          uid: 'admin-user',
          email: adminEmail,
          name: 'المسؤول',
          role: 'admin',
        };

        const mockToken = 'admin-token-12345';

        // ✅ حفظ البيانات في State
        setUser(adminUser);
        setToken(mockToken);

        // ✅ حفظ البيانات في AsyncStorage (سيتم عبر AuthContext)
        Alert.alert('نجاح', 'تم الدخول كمسؤول');
        return;
      }

      // دخول عادي عبر API
      const response = await loginUser(email, password);

      if (response.ok && response.data?.user) {
        setUser(response.data.user);
        setToken(response.data.token);
        Alert.alert('نجاح', 'تم الدخول بنجاح');
      } else {
        Alert.alert('خطأ', response.error || 'فشل الدخول');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setEmail(adminEmail);
    setPassword(adminPassword);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>تسجيل الدخول</Text>

        {/* حقل البريد الإلكتروني */}
        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل بريدك الإلكتروني"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
          placeholderTextColor="#999"
        />

        {/* حقل كلمة المرور */}
        <Text style={styles.label}>كلمة المرور</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="أدخل كلمة مرورك"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.togglePassword}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* زر الدخول */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>دخول</Text>
          )}
        </TouchableOpacity>

        {/* زر دخول المسؤول للاختبار */}
        <TouchableOpacity
          style={styles.adminButton}
          onPress={handleAdminLogin}
          disabled={loading}
        >
          <Text style={styles.adminButtonText}>تسجيل دخول المسؤول (اختبار)</Text>
        </TouchableOpacity>

        {/* رابط التسجيل الجديد */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ليس لديك حساب؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>إنشاء حساب</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  togglePassword: {
    paddingRight: 12,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
