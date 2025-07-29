import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import RegisterScreen from '../screens/Auth/RegisterScreen';
import OtpVerif from '../screens/Auth/OtpVerif';
import LoginScreen from '../screens/Auth/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpVerif" component={OtpVerif} />
    </Stack.Navigator>
  );
}