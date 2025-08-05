// screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  Switch
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../components/common/Toast";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../../../utils/upload";
import CustomModal from "../../components/common/CustomModal"
import { useModal } from "../../hooks/useModal";
const RegisterScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { register, isRegistering } = useAuth();
  const returnData = route.params?.returnData;
  const { modalState, showModal, hideModal } = useModal();
  const [isChecked, setIsChecked] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    // profileImageUrl: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsUploading(true);
        const imageUrl = await uploadImage(result.assets[0], result.assets[0].fileName || 'profile_image.jpg');
        setFormData((prev) => ({ ...prev, profileImageUrl: imageUrl }));
        // setIsUploading(false);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      showToast("error", "خطأ", "فشل في تحميل الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainStack'); // or a more appropriate screen
    }
  };


  const handleSubmit = async () => {
    if (!isChecked) { // Add this check
      showModal({
        type: "error",
        title: "خطأ",
        message: "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية",
        autoClose: true,
        duration: 3000,
      });
      return;
    }

    if (!formData.name.trim()) {
      showModal({
        type: "error",
        title: "خطأ",
        message: "يرجى إدخال اسمك",
        autoClose: true,
        duration: 3000,
      });
      return;
    }

    if (!formData.phone.trim()) {
      showModal({
        type: "error",
        title: "خطأ",
        message: "يرجى إدخال رقم هاتفك",
        autoClose: true,
        duration: 3000,
      });
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      showModal({
        type: "error",
        title: "خطأ",
        message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        autoClose: true,
        duration: 3000,
      });
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      showModal({
        type: "error",
        title: "كلمة مرور غير قوية",
        message: "يجب أن تحتوي كلمة المرور على حرف كبير، رقم، ورمز خاص",
        autoClose: true,
        duration: 3000,
      });
      return;
    }

    try {
      await register(formData); // await register.mutateAsync

      // Show success only if no error is thrown
      showModal({
        type: "success",
        title: "تم التسجيل",
        message: "تم إرسال رمز التحقق إلى رقم هاتفك",
        autoClose: true,
        duration: 1500,
      });

      setTimeout(() => {
        navigation.navigate("OtpVerif", {
          phone: formData.phone,
          returnData,
          isNewUser: true,
        });
      }, 1500);

    } catch (error) {
      console.log("❌ REGISTER ERROR:", JSON.stringify(error, null, 2));

      const message =
        error?.message ||
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.error ||
        "";

      if (message.toLowerCase().includes("already exists") || message.includes("موجود")) {
        showModal({
          type: "error",
          title: "المستخدم موجود",
          message: "هذا الرقم مسجل مسبقاً. هل تريد تسجيل الدخول بدلاً من ذلك؟",
          actionText: "تسجيل الدخول",
          onAction: () => {
            hideModal();
            navigation.navigate("Login");
          },
          autoClose: false,
        });
      } else {
        showModal({
          type: "error",
          title: "فشل التسجيل",
          message: message || "حدث خطأ أثناء التسجيل",
          autoClose: true,
          duration: 3000,
        });
      }
    }
  };





  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "null"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >

      <ScrollView 
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>◀ رجوع</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>إنشاء حساب</Text>
          <Text style={styles.subtitle}>يرجى ملء التفاصيل أدناه</Text>

          <View style={styles.form}>
            <TouchableOpacity 
              style={styles.imageUpload}
              onPress={handleImagePick}
              disabled={isUploading}
            >
              {formData.profileImageUrl ? (
                <Image 
                  source={{ uri: formData.profileImageUrl }} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  {isUploading ? (
                    <ActivityIndicator color="#1877f2" />
                  ) : (
                    <Text style={styles.uploadText}>{t('AUTH.UPLOAD_PHOTO')}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>الاسم الكامل</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="أدخل اسمك الكامل"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="+967-XXX-XXX-XXX"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                placeholder="كلمة المرور (مثال: User@1)"
                secureTextEntry
              />
              <Text style={styles.helperText}>
                يجب أن تحتوي على حرف كبير، رقم، ورمز خاص
              </Text>
            </View>

         {/* Replace the CheckBox component with this */}
<View style={styles.checkboxContainer}>
  <Switch
    value={isChecked}
    onValueChange={setIsChecked}
    trackColor={{ false: "#64748B", true: "#1877f2" }}
    thumbColor="#ffffff"
  />
 <Text style={styles.checkboxText}>
  أوافق على{' '}
  <Text 
    style={styles.linkText}
    onPress={() => navigation.navigate('TermsOfService')}
  >
    شروط الخدمة
  </Text>{' '}
  و{' '}
  <Text 
    style={styles.linkText}
    onPress={() => navigation.navigate('PrivacyPolicy')}
  >
    سياسة الخصوصية
  </Text>
</Text>
</View>

            <TouchableOpacity
              style={[
                styles.button,
                (isRegistering || isUploading || !isChecked) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isRegistering || isUploading || !isChecked}
            >
              {isRegistering ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>تسجيل</Text>
              )}
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
};

const styles = StyleSheet.create({
  linkText: {
    color: '#1877f2',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    // flex: 1,
    padding: 24,
   
  },
  backButton: {
    marginTop: 38,
    marginLeft:20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  // backButton: {
  //   position: 'absolute',
  //   top: 40,
  //   left: 24,
  //   zIndex: 10,
  // },
  backText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
    color: '#1877f2',
  },

  title: {
    fontSize: 28,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  imageUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  uploadText: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    color: "#1E293B",
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  checkboxText: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    color: "#475569",
  },
  
  button: {
    backgroundColor: "#1877f2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
  },
});

export default RegisterScreen;
