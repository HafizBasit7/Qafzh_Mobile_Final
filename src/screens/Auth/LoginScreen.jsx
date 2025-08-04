import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/common/CustomModal';

export default function LoginScreen({ navigation }) {
  const { login, isLoggingIn, isAuthenticated, refreshAuthState } = useAuth();
  const { modalState, hideModal, showModal } = useModal();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  // Navigate back when successfully logged in
  useEffect(() => {
    console.log('LoginScreen - Auth state changed:', { isAuthenticated });
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to MainStack');
      // Force refresh auth state and navigate back
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainStack" }],
        });
      }, 1500); // Give time to see success message
    }
  }, [isAuthenticated, navigation]);


  const handleBack = () => {
    navigation.navigate('MainStack')
    // if (navigation.canGoBack()) {
    //   navigation.goBack();
    // } else {
    //   navigation.navigate('MainStack'); // or a more appropriate screen
    // }
  };
  
  const handleLogin = async () => {
    const phone = formData.phone.trim();
    const password = formData.password.trim();
  
    if (!phone || !password) return;
  
    try {
      const result = await login({ phone, password });
  
      if (result?.data?.token && result?.data?.user) {
        showModal({
          type: 'success',
          title: 'تم تسجيل الدخول',
          message: 'مرحباً بك، تم تسجيل الدخول بنجاح',
          autoClose: true,
          duration: 1500,
        });
      } else {
        showModal({
          type: 'error',
          title: 'فشل تسجيل الدخول',
          message: result?.message || 'الرجاء التحقق من البيانات المدخلة',
          autoClose: true,
          duration: 3000,
        });
      }
    } catch (error) {
      showModal({
        type: 'error',
        title: 'خطأ في تسجيل الدخول',
        message: error?.message || 'تعذر تسجيل الدخول. تأكد من بياناتك.',
        autoClose: true,
        duration: 3000,
      });
    }
  };
  
  

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const isFormValid = formData.phone.trim() && formData.password.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
  <Text style={styles.backText}>◀ رجوع</Text>
</TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>مرحباً بعودتك</Text>
          <Text style={styles.subtitle}>سجل دخولك للمتابعة</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                placeholder="+967xxxxxxxxx"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                style={styles.input}
                placeholder="أدخل كلمة المرور"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, (!isFormValid || isLoggingIn) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={!isFormValid || isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
              <Text style={styles.registerText}>
                ليس لديك حساب؟{' '}
                <Text style={styles.registerHighlight}>إنشاء حساب</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomModal
        visible={modalState.visible}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={hideModal}
        actionText={modalState.actionText}
        onAction={modalState.onAction}
        autoClose={modalState.autoClose}
        duration={modalState.duration}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    color: '#475569',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    color: '#1E293B',
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    zIndex: 10,
  },
  
  backText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
    color: '#2e7d32',
  },  
  buttonDisabled: {
    // backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    color: '#64748B',
  },
  registerHighlight: {
    color: '#2e7d32',
    fontFamily: 'Tajawal-Bold',
  },
});
