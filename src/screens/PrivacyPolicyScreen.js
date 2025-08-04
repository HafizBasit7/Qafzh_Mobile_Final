// screens/PrivacyPolicyScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  
  // Sample privacy policy content (replace with your actual policy)
  const privacyContent = `
  سياسة الخصوصية
  
  المادة 1: جمع المعلومات
  نقوم بجمع المعلومات التالية عند استخدامك للتطبيق:
  - المعلومات الشخصية التي تزودنا بها مباشرة
  - بيانات الاستخدام التلقائية
  - معلومات الجهاز
  
  المادة 2: استخدام البيانات
  نستخدم البيانات المجمعة للأغراض التالية:
  - تقديم الخدمات وتحسينها
  - التواصل مع المستخدمين
  - تحسين تجربة المستخدم
  
  المادة 3: حماية البيانات
  نلتزم بحماية بياناتك الشخصية من خلال:
  - تشفير البيانات الحساسة
  - تقييد الوصول للمعلومات
  - تحديث إجراءات الأمان بانتظام
  
  المادة 4: مشاركة البيانات
  لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
  - عند الحصول على موافقتك
  - عند الالتزام القانوني
  - مع مزودي الخدمات الذين يعملون نيابة عننا
  
  المادة 5: حقوق المستخدم
  لديك الحق في:
  - الوصول لبياناتك
  - تصحيح المعلومات
  - طلب حذف بياناتك
  - الاعتراض على معالجة البيانات
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
        <Text style={styles.headerTitle}>سياسة الخصوصية</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.content}>
          {privacyContent}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reuse the same styles as TermsOfServiceScreen for consistency
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
    marginRight: 20,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    lineHeight: 28,
    textAlign: 'right',
    color: '#334155',
  },
});

export default PrivacyPolicyScreen;