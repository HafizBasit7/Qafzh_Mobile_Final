import React from 'react';
import Toast, { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#00C851', backgroundColor: '#ffffff' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600'
      }}
      text2Style={{
        fontSize: 14
      }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#ff4444', backgroundColor: '#ffffff' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600'
      }}
      text2Style={{
        fontSize: 14
      }}
    />
  )
};

export const showToast = (type, title, message) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
};

export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toast config={toastConfig} />
    </>
  );
}; 