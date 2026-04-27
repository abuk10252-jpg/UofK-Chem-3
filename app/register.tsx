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
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../utils/api';

export default function RegisterScreen({ navigation }: any) {
  const { setUser, setToken } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الاسم');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال كلمة المرور');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('تنبيه', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('تنبيه', 'كلمات المرور غير متطابقة');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('تنبيه', 'البريد الإلكتروني غير صحيح');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await registerUser(name, email, password);

      if (response.ok && response.data?.user) {
        setUser(response.data.user);
        setToken(response.data.token);
        
        // ✅ إضافة تأخير قبل الانتقال
        Alert.alert('نجاح', 'تم إنشاء الحساب بنجاح', [
          {
            text: 'حسناً',
            onPress: () => {
              setTimeout(() => {
                navigation.navigate('Home');
              }, 500);
            },
          },
        ]);
      } else {
        Alert.alert('خطأ', response.error || 'فشل التسجيل');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>إنشاء حساب جديد</Text>

        {/* حقل الاسم */}
        <Text style={styles.label}>الاسم الكامل</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل اسمك الكامل"
          value={name}
          onChangeText={setName}
          editable={!loading}
          placeholderTextColor="#999"
        />

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
            placeholder="أدخل كلمة مرورك (8 أحرف على الأقل)"
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

        {/* حقل تأكيد كلمة المرور */}
        <Text style={styles.label}>تأكيد كلمة المرور</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="أعد إدخال كلمة مرورك"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.togglePassword}>
              {showConfirmPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* زر التسجيل */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>إنشاء حساب</Text>
          )}
        </TouchableOpacity>

        {/* رابط الدخول */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>لديك حساب بالفعل؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>تسجيل دخول</Text>
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
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
