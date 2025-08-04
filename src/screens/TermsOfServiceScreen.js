// screens/TermsOfServiceScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  I18nManager 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TermsOfServiceScreen = () => {
  const navigation = useNavigation();
  
  // Sample terms content (replace with your actual terms)
  const termsContent = `
  المادة 1: التعريفات
  يقصد بالمصطلحات التالية حيثما وردت في هذه الشروط المعاني المبينة أمامها:
  
  المادة 2: نطاق الخدمة
  توفر المنصة خدمات [وصف الخدمات] للمستخدمين وفقاً للشروط والأحكام المذكورة هنا.
  
  المادة 3: الالتزامات
  يلتزم المستخدم بعدم استخدام المنصة لأي أغراض غير مشروعة أو مخالفة للقوانين المحلية.
  
  المادة 4: المسؤولية
  لا تتحمل المنصة أي مسؤولية عن أي أضرار ناتجة عن سوء استخدام الخدمة.
  
  المادة 5: التعديلات
  تحتفظ المنصة بحقها في تعديل هذه الشروط في أي وقت، وسيتم إشعار المستخدمين بالتغييرات.
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>شروط الخدمة</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.content}>
          {termsContent}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backText: {
    fontSize: 16,
    color: '#1877f2',
    fontFamily: 'Tajawal-Bold',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
    marginRight: 20, // Balance the back button space
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    lineHeight: 28, // Increased for better Arabic readability
    textAlign: 'right',
    color: '#334155',
  },
});

export default TermsOfServiceScreen;