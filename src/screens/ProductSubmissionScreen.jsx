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
  Modal,
  FlatList
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { useModal } from '../hooks/useModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import governorates from '../../data/governorates'; // Updated import
import { uploadImage } from '../../utils/upload';
import CustomModal from '../components/common/CustomModal';
import EmptyState from '../components/EmptyState';
import { MaterialIcons } from '@expo/vector-icons';

const colors = {
  primary: '#1877f2',
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
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showGovernorateModal, setShowGovernorateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
 






  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const initialFormState = ({
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
    governorate: "",
    city: '',
    locationText: '',
    images: [],
    isNegotiable: false
  });

  // State for available cities based on selected governorate
  const [availableCities, setAvailableCities] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);


   // Reset form when tab loses focus
   useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This cleanup function runs when the screen loses focus
        setFormData(initialFormState);
        setAvailableCities([]);
      };
    }, []) // Empty dependency array means this effect runs only once on mount
  );


  
  
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

  // Update available cities when governorate changes
  useEffect(() => {
    if (formData.governorate) {
      const selectedGovernorate = governorates.find(gov => gov.name === formData.governorate);
      if (selectedGovernorate) {
        setAvailableCities(selectedGovernorate.cities || []);
        // Reset city selection when governorate changes
        setFormData(prev => ({ ...prev, city: '' }));
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.governorate]);

  // Product types and conditions data
  const productTypes = [
    { label: 'لوح شمسي', value: 'Panel' },
    { label: 'انفرتر', value: 'Inverter' },
    { label: 'بطارية', value: 'Battery' },
    { label: 'قواعدألواح', value: 'Panel bases' },
    { label: 'اكسسوار', value: 'Accessory' },
    { label: 'أخرى', value: 'Other' }
  ];

  const conditions = [
    { label: 'جديد', value: 'New' },
    { label: 'مستعمل', value: 'Used' },
    { label: 'يحتاج إصلاح', value: 'Needs Repair' },
    { label: 'مُجدد', value: 'Refurbished' }
  ];

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showWarning('إذن مطلوب', 'نحتاج إذن لاستخدام الكاميرا');
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const imageUrl = await uploadImage(result.assets[0], result.assets[0].fileName || 'camera_image.jpg');
        setFormData((prevData) => ({
          ...prevData,
          images: [...(prevData.images || []), imageUrl],
        }));
        showSuccess('تم الرفع', 'تم التقاط الصورة ورفعها بنجاح');
      } catch (error) {
        showError('خطأ', 'فشل رفع الصورة من الكاميرا');
        console.error('Upload error:', error);
      }
    }
  };
  

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showWarning('إذن مطلوب', 'نحتاج إذن للوصول إلى الصور');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
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

      showSuccess(
        "تم نشر المنتج",
        "تمت إضافة المنتج بنجاح إلى السوق"
      );
      
      // Success is handled by the mutation's onSuccess callback
      setTimeout(() => {
        navigation.goBack();
      }, 2000); // Wait 2 seconds before navigating back
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
  <TouchableOpacity 
    style={styles.currencySelector} // Reusing currency selector style
    onPress={() => setShowTypeModal(true)}
  >
    <Text style={styles.currencyText}>
      {productTypes.find(t => t.value === formData.type)?.label || 'اختر نوع المنتج'}
    </Text>
    <MaterialIcons name="arrow-drop-down" size={24} color="#64748B" />
  </TouchableOpacity>
</View>

{/* Product Type Selection Modal */}
{/* Product Type Selection Modal */}
<Modal
  visible={showTypeModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setShowTypeModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.currencyModal}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>اختر نوع المنتج</Text>
        <TouchableOpacity 
          onPress={() => setShowTypeModal(false)}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
        >
          <Text>
            <MaterialIcons name="close" size={24} color="#64748B" />
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={productTypes}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.currencyOption,
              formData.type === item.value && styles.selectedOption
            ]}
            onPress={() => {
              setFormData({...formData, type: item.value});
              setShowTypeModal(false);
            }}
          >
            <Text style={styles.optionText}>{item.label}</Text>
            {formData.type === item.value && (
              <Text>
                <MaterialIcons name="check" size={20} color="#1877f2" />
              </Text>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  </View>
</Modal>
        
<View style={styles.inputGroup}>
  <Text style={styles.label}>الحالة</Text>
  <TouchableOpacity 
    style={styles.currencySelector}
    onPress={() => setShowConditionModal(true)}
  >
    <Text style={styles.currencyText}>
      {conditions.find(c => c.value === formData.condition)?.label || 'اختر الحالة'}
    </Text>
    <MaterialIcons name="arrow-drop-down" size={24} color="#64748B" />
  </TouchableOpacity>
</View>
{/* Condition Selection Modal */}
<Modal
  visible={showConditionModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setShowConditionModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.currencyModal}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>اختر حالة المنتج</Text>
        <TouchableOpacity 
          onPress={() => setShowConditionModal(false)}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
        >
          <Text>
            <MaterialIcons name="close" size={24} color="#64748B" />
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conditions}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.currencyOption,
              formData.condition === item.value && styles.selectedOption
            ]}
            onPress={() => {
              setFormData({...formData, condition: item.value});
              setShowConditionModal(false);
            }}
          >
            <Text style={styles.optionText}>{item.label}</Text>
            {formData.condition === item.value && (
              <Text>
                <MaterialIcons name="check" size={20} color="#1877f2" />
              </Text>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  </View>
</Modal>
        
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
          
          <View style={styles.currencyContainer}>
  <Text style={styles.sectionLabel}>العملة</Text>
  
  <TouchableOpacity 
    style={styles.currencySelector}
    onPress={() => setShowCurrencyModal(true)}
  >
    <Text style={styles.currencyText}>
      {formData.currency === 'YER' ? 'ريال يمني شمال' : 'ريال يمني جنوب'}
    </Text>
    <MaterialIcons name="arrow-drop-down" size={24} color="#64748B" />
  </TouchableOpacity>

  {/* Currency Selection Modal */}
  <Modal
    visible={showCurrencyModal}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowCurrencyModal(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.currencyModal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>اختر العملة</Text>
          <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
            <MaterialIcons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={[
            { label: 'ريال يمني شمال', value: 'YER' },
            { label: 'ريال يمني جنوب', value: 'YERR' },
            { label: 'ريال سعودي', value: 'SAR' },
            { label: 'دولار أمريكي', value: 'USD' }
          ]}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.currency === item.value && styles.selectedOption
              ]}
              onPress={() => {
                setFormData({...formData, currency: item.value});
                setShowCurrencyModal(false);
              }}
            >
              <Text style={styles.optionText}>{item.label}</Text>
              {formData.currency === item.value && (
                <MaterialIcons name="check" size={20} color="#1877f2" />
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  </Modal>
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
  <TouchableOpacity 
    style={styles.currencySelector} // Reusing the same style
    onPress={() => setShowGovernorateModal(true)}
  >
    <Text style={styles.currencyText}>
      {formData.governorate || 'اختر المحافظة'}
    </Text>
    <MaterialIcons name="arrow-drop-down" size={24} color="#64748B" />
  </TouchableOpacity>
</View>

{/* Governorate Selection Modal */}
<Modal
  visible={showGovernorateModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setShowGovernorateModal(false)}
>
  <View style={styles.LocmodalOverlay}>
    <View style={styles.currencyModal}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>اختر المحافظة</Text>
        <TouchableOpacity 
          onPress={() => setShowGovernorateModal(false)}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
        >
          <Text>
            <MaterialIcons name="close" size={24} color="#64748B" />
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={governorates}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.currencyOption,
              formData.governorate === item.name && styles.selectedOption
            ]}
            onPress={() => {
              setFormData({
                ...formData, 
                governorate: item.name,
                city: '' // Reset city when governorate changes
              });
              setShowGovernorateModal(false);
            }}
          >
            <Text style={styles.optionText}>{item.name}</Text>
            {formData.governorate === item.name && (
              <Text>
                <MaterialIcons name="check" size={20} color="#1877f2" />
              </Text>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  </View>
</Modal>

<View style={styles.inputGroup}>
  <Text style={styles.label}>المدينة *</Text>
  <TouchableOpacity 
    style={[
      styles.currencySelector,
      !formData.governorate && { opacity: 0.6 }
    ]}
    onPress={() => {
      if (formData.governorate) {
        setShowCityModal(true);
      }
    }}
    disabled={!formData.governorate}
  >
    <Text style={styles.currencyText}>
      {formData.city || (
        formData.governorate 
          ? "اختر المدينة" 
          : "اختر المحافظة أولاً"
      )}
    </Text>
    <MaterialIcons name="arrow-drop-down" size={24} color="#64748B" />
  </TouchableOpacity>
  
  {!formData.governorate && (
    <Text style={styles.helperText}>يرجى اختيار المحافظة أولاً</Text>
  )}
</View>

{/* City Selection Modal */}
<Modal
  visible={showCityModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setShowCityModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.currencyModal}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          {formData.governorate 
            ? `مدن ${formData.governorate}`
            : "اختر المدينة"}
        </Text>
        <TouchableOpacity 
          onPress={() => setShowCityModal(false)}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
        >
          <Text>
            <MaterialIcons name="close" size={24} color="#64748B" />
          </Text>
        </TouchableOpacity>
      </View>

      {availableCities.length > 0 ? (
        <FlatList
          data={availableCities}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.currencyOption,
                formData.city === item && styles.selectedOption
              ]}
              onPress={() => {
                setFormData({...formData, city: item});
                setShowCityModal(false);
              }}
            >
              <Text style={styles.optionText}>{item}</Text>
              {formData.city === item && (
                <Text>
                  <MaterialIcons name="check" size={20} color="#1877f2" />
                </Text>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="location-off" size={40} color="#9CA3AF" />
          <Text style={styles.emptyText}>لا توجد مدن متاحة</Text>
        </View>
      )}
    </View>
  </View>
</Modal>

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
          <AntDesign name="plus" size={20} color={colors.white} />
          <Text style={styles.imagePickerText}>إضافة صورة</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
    <Ionicons name="camera-outline" size={20} color={colors.white} />
    <Text style={styles.imagePickerText}>الكاميرا</Text>
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
    textAlign: 'left',
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
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
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
    backgroundColor:"#1877f2",
    
  },
  imagePickerText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    color:"#fff"
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
  currencyContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  currencyText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  LocmodalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  currencyModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    maxHeight: '50%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: '#1F2937',
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  selectedOption: {
    backgroundColor: '#F5F8FF',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
});

export default ProductSubmissionScreen;