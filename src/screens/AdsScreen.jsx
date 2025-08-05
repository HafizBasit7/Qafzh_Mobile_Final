import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAllAds } from '../services/api';

const AdsScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const { t } = useTranslation();
  const [adsData, setAdsData] = useState({
    ads: [],
    total: 0,
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAds = useCallback(async () => {
    try {
      const response = await getAllAds();
      setAdsData({
        ads: response.data || [],
        total: response.total || 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      setAdsData((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch ads',
      }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch ads when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchAds();
      
      // Optional: Set up polling for real-time updates
      const interval = setInterval(fetchAds, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }, [fetchAds])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAds();
  }, [fetchAds]);

  const handleAdPress = (link) => {
    if (link) {
      Linking.openURL(link).catch((err) =>
        console.error('Failed to open URL:', err)
      );
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (adsData.loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877f2" />
      </View>
    );
  }

  if (adsData.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{adsData.error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchAds}
        >
          <Text style={styles.retryButtonText}>{t('ADS.RETRY')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAdItem = ({ item }) => (
    <View style={styles.adContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.adImage} />
      <View style={styles.adDetails}>
        <Text style={styles.adTitle}>{item.title}</Text>
        
        {item.description && (
          <Text style={styles.adDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.adMeta}>
          <Text style={styles.adStatus}>
            <Text style={styles.metaLabel}>{t('ADS.STATUS')}: </Text>
            {item.active ? t('ADS.ACTIVE') : t('ADS.INACTIVE')}
          </Text>
          <Text style={styles.adDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {item.phone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call-outline" size={16} color="#FFFFFF" />
            <Text style={styles.callButtonText}>{t('ADS.CALL')}</Text>
          </TouchableOpacity>
        )}

        {item.link && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => handleAdPress(item.link)}
          >
            <Text style={styles.linkButtonText}>{t('ADS.VISIT_LINK')}</Text>
            <Ionicons name="open-outline" size={16} color="#1877f2" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>{t('ADS.TITLE')}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1877f2']}
              tintColor="#1877f2"
            />
          }
        >
          {/* Ads List */}
          <FlatList
            data={adsData.ads}
            renderItem={renderAdItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#64748B"
                />
                <Text style={styles.emptyText}>{t('ADS.NONE_FOUND')}</Text>
              </View>
            }
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1877f2',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Medium',
    color: '#1E293B',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  adContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  adImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  adDetails: {
    padding: 16,
  },
  adTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'left',
  },
  adDescription: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'left',
  },
  adMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaLabel: {
    fontFamily: 'Tajawal-Medium',
    color: '#64748B',
  },
  adStatus: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    color: '#1E293B',
  },
  adDate: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    color: '#64748B',
  },
  callButton: {
    backgroundColor: '#1877f2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Tajawal-Bold',
    fontSize: 14,
    marginLeft: 8,
  },
  linkButton: {
    borderWidth: 1,
    borderColor: '#1877f2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  linkButtonText: {
    color: '#1877f2',
    fontFamily: 'Tajawal-Bold',
    fontSize: 14,
    marginRight: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: '#64748B',
    marginTop: 16,
  },
});

export default AdsScreen;