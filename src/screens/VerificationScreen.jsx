import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Keyboard
} from "react-native";

// Mock verification function
const verifyOTP = async (code) => {
  // Replace with your actual verification logic
  return code.length === 6; // Simple mock: just checks if 6 digits entered
};

export default function VerificationScreen({ route, navigation }) {
  const { productData, onVerificationSuccess } = route.params || {};
  const [code, setCode] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  useEffect(() => {
    // Combine OTP digits into single code whenever otp changes
    const combinedCode = otp.join('');
    setCode(combinedCode);
  }, [otp]);

  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerification = async () => {
    try {
      Keyboard.dismiss();
      
      if (code.length !== 6) {
        alert('الرجاء إدخال الكود المكون من 6 أرقام');
        return;
      }

      const isVerified = await verifyOTP(code);
      
      if (isVerified) {
        if (onVerificationSuccess) {
          onVerificationSuccess();
        } else {
          navigation.navigate("Marketplace");
        }
      } else {
        alert('كود التحقق غير صحيح');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('حدث خطأ أثناء التحقق');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        يرجى تأكيد رقم الهاتف لإتمام عملية النشر
      </Text>
      
      <View style={styles.otpContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={otp[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            selectTextOnFocus
            textAlign="center"
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.verifyButton}
        onPress={handleVerification}
      >
        <Text style={styles.verifyButtonText}>تأكيد</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Tajawal-Bold',
    color: '#333'
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f8f9fa'
  },
  verifyButton: {
    backgroundColor: '#16A34A',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Tajawal-Bold'
  }
});