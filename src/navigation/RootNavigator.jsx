import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/common/CustomModal';

import MainStack from './MainStack';
import AuthStack from './AuthStack';
import { navigationRef } from './navigationHelper';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { modalState, hideModal } = useModal();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="MainStack"
        >
          {/* Main app stack - always default */}
          <Stack.Screen name="MainStack" component={MainStack} />
          
          {/* Auth stack - modal for when login is needed */}
          <Stack.Screen 
            name="AuthStack" 
            component={AuthStack}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Global Modal */}
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
    </SafeAreaView>
  );
}