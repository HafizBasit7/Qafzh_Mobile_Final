import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Linking, 
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Image
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  const contactMethods = [
    {
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/+967-783990304')
    },
    {
      name: 'Email',
      icon: 'mail-outline',
      color: '#D44638',
      action: () => Linking.openURL('customer@solarharaj.com')
    },
    {
      name: 'Phone',
      icon: 'call-outline',
      color: '#34B7F1',
      action: () => Linking.openURL('tel:+967-783990304')
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('help.title')}</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>

        {/* App Logo & Slogan */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets//images/mylogo.png')} 
            style={styles.logo}
          />
          <Text style={styles.slogan}>حراج الطاقة الشمسية</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.aboutTitle')}</Text>
          <Text style={styles.sectionText}>
            {t('help.aboutText')}
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.featuresTitle')}</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>{t('help.feature1')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>{t('help.feature2')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>{t('help.feature3')}</Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.contactTitle')}</Text>
          <Text style={styles.sectionText}>
            {t('help.contactText')}
          </Text>
          
          <View style={styles.contactButtons}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.contactButton, { backgroundColor: method.color }]}
                onPress={method.action}
              >
                <Ionicons name={method.icon} size={20} color="white" />
                <Text style={styles.contactButtonText}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} شمسي. {t('help.rightsReserved')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain'
  },
  slogan: {
    fontSize: 18,
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center'
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 15
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555'
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    flexWrap: 'wrap'
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    minWidth: 150,
    justifyContent: 'center'
  },
  contactButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold'
  },
  footerText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20
  }
});

export default HelpScreen;