import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useModal } from '../../hooks/useModal';
import LoadingSpinner from './LoadingSpinner';

const AuthGuard = ({ 
  children, 
  requireAuth = false,
  requireVerified = false,
  showLoading = true,
  onAuthRequired,
  message = "يجب تسجيل الدخول أولاً",
  actionText = "تسجيل الدخول"
}) => {
  const { currentUser, isLoadingUser, isAuthenticated, isVerified } = useAuth();
  const navigation = useNavigation();
  const { showInfo } = useModal();

  if (isLoadingUser && showLoading) {
    return <LoadingSpinner />;
  }

  // Check if authentication is required and user is not logged in
  if (requireAuth && !isAuthenticated) {
    showInfo(
      "تسجيل الدخول مطلوب",
      message,
      {
        actionText,
        onAction: () => {
          if (onAuthRequired) {
            onAuthRequired();
          } else {
            navigation.navigate('AuthStack', {
              screen: 'Login',
              params: {
                returnScreen: 'MainStack',
              },
            });
          }
        },
        autoClose: false
      }
    );
    return null;
  }

  // Check if verification is required and user is not verified
  if (requireVerified && isAuthenticated && !isVerified) {
    showInfo(
      "تأكيد الهاتف مطلوب",
      "يجب تأكيد رقم هاتفك قبل المتابعة",
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
    return null;
  }

  return children;
};

export default AuthGuard;