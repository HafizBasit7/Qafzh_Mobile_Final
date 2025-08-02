import React from 'react';
import { TouchableOpacity, Text, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PhoneLink = ({ 
  phoneNumber, 
  style, 
  textStyle, 
  showIcon = true, 
  iconSize = 16, 
  iconColor = '#02ff04',
  children 
}) => {
  const handlePhonePress = async () => {
    if (!phoneNumber) return;
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[^+\d]/g, '');
    const phoneUrl = `tel:${cleanPhone}`;
    
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('خطأ', 'لا يمكن فتح تطبيق المكالمات');
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء محاولة فتح المكالمة');
    }
  };

  return (
    <TouchableOpacity 
      style={[{ flexDirection: 'row', alignItems: 'center' }, style]}
      onPress={handlePhonePress}
      activeOpacity={0.7}
    >
      {showIcon && (
        <Ionicons 
          name="call" 
          size={iconSize} 
          color={iconColor} 
          style={{ marginRight: 4 }} 
        />
      )}
      {children || (
        <Text style={[{ color: iconColor, textDecorationLine: 'underline' }, textStyle]}>
          {phoneNumber}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PhoneLink; 