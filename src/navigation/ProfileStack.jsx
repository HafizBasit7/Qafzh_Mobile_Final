import React, { useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../hooks/useModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import ProfileScreen from '../screens/Profile/ProfileScreen';
import MyProductsScreen from '../screens/Profile/MyProductsScreen';
import UpdateProfileScreen from '../screens/Profile/UpdateProfileScreen';
import LikedPostsScreen from '../screens/Profile/LikedPostsScreen';
import EmptyState from '../components/EmptyState';
import CustomModal from '../components/common/CustomModal';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const { currentUser, isAuthenticated, isVerified } = useAuth();
  const { modalState, hideModal, showInfo } = useModal();
  const navigation = useNavigation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check auth when stack is focused
  useFocusEffect(
    React.useCallback(() => {
      setHasCheckedAuth(true);
      
      if (!isAuthenticated) {
        // Not logged in - redirect to login
        showInfo(
          "تسجيل الدخول مطلوب",
          "يجب تسجيل الدخول لعرض الملف الشخصي",
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
          "يجب تأكيد رقم هاتفك لعرض الملف الشخصي",
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

  // Show login prompt if not authenticated
  if (hasCheckedAuth && !isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <EmptyState
          title="تسجيل الدخول مطلوب"
          subtitle="يجب تسجيل الدخول لعرض الملف الشخصي"
          iconName="person"
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

  // Show verification prompt if logged in but not verified
  if (hasCheckedAuth && isAuthenticated && !isVerified) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <EmptyState
          title="تأكيد الهاتف مطلوب"
          subtitle="يجب تأكيد رقم هاتفك لعرض الملف الشخصي"
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

  // Don't render stack if auth check hasn't completed yet
  if (!hasCheckedAuth) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MyProducts" component={MyProductsScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="LikedPosts" component={LikedPostsScreen} />
    </Stack.Navigator>
  );
}