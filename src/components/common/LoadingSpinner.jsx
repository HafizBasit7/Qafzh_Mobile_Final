import React from 'react';
import { ActivityIndicator, View } from 'react-native';

const LoadingSpinner = ({ size = 'large', color = '#0066FF' }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default LoadingSpinner; 