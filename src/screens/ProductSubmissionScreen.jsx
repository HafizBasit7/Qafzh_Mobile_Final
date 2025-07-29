import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { useModal } from '../hooks/useModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { governorates } from '../../data/governorates';
import { uploadImage } from '../../utils/upload';
import CustomModal from '../components/common/CustomModal';
import EmptyState from '../components/EmptyState';

const colors = {
  primary: '#2E7D32',
  primaryLight: '#81C784',
  background: '#F5F5F5',
  white: '#FFFFFF',
  textPrimary: '#212121',
  border: '#E0E0E0',
  error: '#D32F2F',
};

const ProductSubmissionScreen = () => {
  const { t } = useTranslation();
  const { currentUser, isAuthenticated, isVerified } = useAuth();
  const { createProduct, isCreating } = useProducts();
  const { modalState, hideModal, showSuccess, showError, showWarning, showInfo } = useModal();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const navigation = useNavigation();
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Panel',
    condition: 'New',
    brand: '',
    model: '',
    price: '',
    currency: 'USD',
    phone: currentUser?.phone || '',
    whatsappPhone: '',
    governorate: "Sana'a",
    city: '',
    locationText: '',
    images: [],
    specifications: {
      power: '',
      voltage: '',
      capacity: '',
      warranty: ''
    },
    isNegotiable: false
  });
  
  // Check auth when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setHasCheckedAuth(true);
      
      if (!isAuthenticated) {
        // Not logged in - redirect to login
        showInfo(
          "تسجيل الدخول مطلوب",
          "يجب تسجيل الدخول أولاً لنشر المنتجات",
          {
            actionText: "تسجيل الدخول",
            onAction: () => {
              navigation.navigate('AuthStack', {
                screen: 'Login',
              });
            },
            autoClose: false
          }
        );
      } else if (isAuthenticated && !isVerified) {
        // Logged in but not verified - redirect to verification
        showInfo(
          "تأكيد الهاتف مطلوب", 
          "يجب تأكيد رقم هاتفك قبل نشر المنتجات",
          {
            actionText: "تأكيد الهاتف",
            onAction: () => {
              navigation.navigate('AuthStack', {
                screen: 'OTPVerification',
                params: {
                  phone: currentUser?.phone,
                },
              });
            },
            autoClose: false
          }
        );
      }
    }, [isAuthenticated, isVerified, showInfo, navigation, currentUser])
  );

  // Product types and conditions data
  const productTypes = [
    { label: 'لوح شمسي', value: 'Panel' },
    { label: 'انفرتر', value: 'Inverter' },
    { label: 'بطارية', value: 'Battery' },
    { label: 'اكسسوار', value: 'Accessory' },
    { label: 'كابل', value: 'Cable' },
    { label: 'متحكم', value: 'Controller' },
    { label: 'شاشة مراقبة', value: 'Monitor' },
    { label: 'أخرى', value: 'Other' }
  ];

  const conditions = [
    { label: 'جديد', value: 'New' },
    { label: 'مستعمل', value: 'Used' },
    { label: 'يحتاج إصلاح', value: 'Needs Repair' },
    { label: 'مُجدد', value: 'Refurbished' }
  ];

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showWarning('إذن مطلوب', 'نحتاج إذن للوصول إلى الصور');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && Array.isArray(result.assets) && result.assets.length > 0) {
        try {
          const uploadPromises = result.assets.map(async (asset) => {
            const imageUrl = await uploadImage(asset, asset.fileName || 'product_image.jpg');
            return imageUrl;
          });

          const imageUrls = await Promise.all(uploadPromises);
          
          setFormData(prevData => ({
            ...prevData,
            images: [...(prevData.images || []), ...imageUrls]
          }));

          showSuccess('تم الرفع', 'تم رفع الصورة بنجاح');
        } catch (error) {
          showError('فشل الرفع', 'فشل في رفع الصورة، يرجى المحاولة مرة أخرى');
          console.error('Image upload error:', error);
        }
      }
    } catch (error) {
      showError('خطأ', 'حدث خطأ أثناء اختيار الصورة');
      console.error('Image picker error:', error);
    }
  };

  const removeImage = (index) => {
    if (formData.images && Array.isArray(formData.images) && index >= 0 && index < formData.images.length) {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData({ ...formData, images: newImages });
    }
  };

  const handleSpecChange = (field, value) => {
    setFormData({
      ...formData,
      specifications: {
        ...formData.specifications,
        [field]: value
      }
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showError('خطأ في البيانات', 'اسم المنتج مطلوب');
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      showError('خطأ في البيانات', 'يرجى إدخال سعر صحيح');
      return false;
    }
    if (!formData.phone.trim()) {
      showError('خطأ في البيانات', 'رقم الهاتف مطلوب');
      return false;
    }
    if (!formData.governorate.trim()) {
      showError('خطأ في البيانات', 'المحافظة مطلوبة');
      return false;
    }
    if (!formData.city.trim()) {
      showError('خطأ في البيانات', 'المدينة مطلوبة');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createProduct({
        ...formData,
        price: parseFloat(formData.price),
        userId: currentUser.id || currentUser?._id
      });
      
      // Success is handled by the mutation's onSuccess callback
      navigation.goBack();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Submission error:', error);
    }
  };

  // Show appropriate screen based on auth state
  if (hasCheckedAuth && !isAuthenticated) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="تسجيل الدخول مطلوب"
          subtitle="يجب تسجيل الدخول أولاً لنشر المنتجات"
          iconName="login"
          actionText="تسجيل الدخول"
          onAction={() => {
            navigation.navigate('AuthStack', {
              screen: 'Login',
            });
          }}
        />
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
      </View>
    );
  }

  if (hasCheckedAuth && isAuthenticated && !isVerified) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="تأكيد الهاتف مطلوب"
          subtitle="يجب تأكيد رقم هاتفك قبل نشر المنتجات"
          iconName="phone"
          actionText="تأكيد الهاتف"
          onAction={() => {
            navigation.navigate('AuthStack', {
              screen: 'OTPVerification',
              params: {
                phone: currentUser?.phone,
              },
            });
          }}
        />
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
      </View>
    );
  }

  // Don't render form if auth check hasn't completed yet
  if (!hasCheckedAuth) {
    return null;
  }
  
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
     <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>نشر منتج جديد</Text>
      
      {/* Basic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>اسم المنتج *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="أدخل اسم المنتج"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>الوصف</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholder="وصف تفصيلي للمنتج"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>نوع المنتج</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(itemValue) => setFormData({...formData, type: itemValue})}
              style={styles.picker}
            >
              {productTypes && productTypes.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>الحالة</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.condition}
              onValueChange={(value) => setFormData({ ...formData, condition: value })}
              style={styles.picker}
            >
              {conditions && conditions.map((condition) => (
                <Picker.Item key={condition.value} label={condition.label} value={condition.value} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>الماركة</Text>
          <TextInput
            style={styles.input}
            value={formData.brand}
            onChangeText={(text) => setFormData({...formData, brand: text})}
            placeholder="ماركة المنتج"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>الموديل</Text>
          <TextInput
            style={styles.input}
            value={formData.model}
            onChangeText={(text) => setFormData({...formData, model: text})}
            placeholder="موديل المنتج"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      
      {/* Pricing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التسعير</Text>
        
        <View style={styles.row}>
          <View style={{ flex: 0.7 }}>
            <Text style={styles.label}>السعر *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(text) => setFormData({...formData, price: text})}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          
          <View style={{ flex: 0.3, marginLeft: 10 }}>
            <Text style={styles.label}>العملة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.currency}
                onValueChange={(itemValue) => setFormData({...formData, currency: itemValue})}
                style={styles.picker}
              >
                <Picker.Item label="ريال يمني" value="YER" />
                <Picker.Item label="دولار" value="USD" />
                <Picker.Item label="ريال سعودي" value="SAR" />
                <Picker.Item label="يورو" value="EUR" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>قابل للتفاوض</Text>
          <Switch
            value={formData.isNegotiable}
            onValueChange={(value) => setFormData({...formData, isNegotiable: value})}
            trackColor={{ false: "#E0E0E0", true: colors.primaryLight }}
            thumbColor={formData.isNegotiable ? colors.primary : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات التواصل</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>رقم الهاتف *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            placeholder="+967xxxxxxxxx"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>رقم الواتساب</Text>
          <TextInput
            style={styles.input}
            value={formData.whatsappPhone}
            onChangeText={(text) => setFormData({...formData, whatsappPhone: text})}
            placeholder="+967xxxxxxxxx"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Location Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الموقع</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>المحافظة *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.governorate}
              onValueChange={(value) => setFormData({ ...formData, governorate: value })}
              style={styles.picker}
            >
              {governorates && governorates.map((gov) => (
                <Picker.Item key={gov} label={gov} value={gov} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>المدينة *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({...formData, city: text})}
            placeholder="اسم المدينة"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>تفاصيل الموقع</Text>
          <TextInput
            style={styles.input}
            value={formData.locationText}
            onChangeText={(text) => setFormData({...formData, locationText: text})}
            placeholder="تفاصيل إضافية عن الموقع"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Images Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الصور</Text>
        
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <AntDesign name="plus" size={20} color={colors.primary} />
          <Text style={styles.imagePickerText}>إضافة صورة</Text>
        </TouchableOpacity>

        <View style={styles.imageGrid}>
          {(formData.images && Array.isArray(formData.images)) ? formData.images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => removeImage(index)}
              >
                <AntDesign name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )) : null}
        </View>
      </View>

      {/* Specifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المواصفات التقنية</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>القدرة (واط)</Text>
          <TextInput
            style={styles.input}
            value={formData.specifications.power}
            onChangeText={(text) => handleSpecChange('power', text)}
            placeholder="مثال: 300W"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الجهد (فولت)</Text>
          <TextInput
            style={styles.input}
            value={formData.specifications.voltage}
            onChangeText={(text) => handleSpecChange('voltage', text)}
            placeholder="مثال: 12V"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>السعة</Text>
          <TextInput
            style={styles.input}
            value={formData.specifications.capacity}
            onChangeText={(text) => handleSpecChange('capacity', text)}
            placeholder="مثال: 100Ah"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الضمان</Text>
          <TextInput
            style={styles.input}
            value={formData.specifications.warranty}
            onChangeText={(text) => handleSpecChange('warranty', text)}
            placeholder="مثال: سنتان"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, isCreating && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isCreating}
      >
        <Text style={styles.submitButtonText}>
          {isCreating ? 'جاري النشر...' : 'نشر المنتج'}
        </Text>
      </TouchableOpacity>

      {/* Custom Modal */}
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
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Tajawal-Bold',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'right',
    fontFamily: 'Tajawal-Bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: 'Tajawal-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
     textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  imagePickerText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductSubmissionScreen;