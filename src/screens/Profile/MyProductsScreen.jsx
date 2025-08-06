import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Image,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useProducts } from "../../hooks/useProducts";
import EmptyState from "../../components/EmptyState";
import CustomModal from "../../components/common/CustomModal";
import PhoneLink from "../../components/PhoneLink";

const { width } = Dimensions.get('window');

const MyProductsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  const {
    products,
    totalCount,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    deleteProduct,
    isDeleting,
  } = useProducts({ user_products: true });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      productId: product._id,
      product: product 
    });
  };

  const handleDelete = (productId) => {
    setSelectedProductId(productId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (deleteProduct && selectedProductId) {
      deleteProduct(selectedProductId);
    }
    setDeleteModalVisible(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "decimal",  
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageWrapper}>
          <Image
            source={{ uri: item.images?.[0] || "https://via.placeholder.com/300" }}
            style={styles.cardImage}
          />
        </View>
        
        <View style={styles.textContent}>
          <View style={styles.topRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name || t("MARKETPLACE.UNTITLED_PRODUCT")}
            </Text>

            {item.brand && (
              <Text style={styles.cardBrand} numberOfLines={1}>
                {item.brand}
              </Text>
            )}

            <Text style={styles.cardPrice}>
              {formatPrice(item.price)} {t("CURRENCIES.YER")}
            </Text>
          </View>

          <View style={styles.middleRow}>
            {(item.governorate || item.city) && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {[item.city, item.governorate].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}

            {item.phone && (
              <PhoneLink
                phoneNumber={item.phone}
                style={styles.phoneLink}
                textStyle={styles.phoneText}
                iconSize={12}
                showIcon={true}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Overlay buttons */}
      <View style={styles.overlayButtons}>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.status === 'approved' ? '#10B981' : '#F59E0B' }
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'approved' ? t("COMMON.VERIFIED") : t("COMMON.PENDING")}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
          disabled={isDeleting}
        >
          {isDeleting && selectedProductId === item._id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!hasNextPage) return null;
    return (
      <View style={styles.footer}>
        {isFetchingNextPage && (
          <ActivityIndicator size="large" color="#1877f2" />
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="error"
        title={t("COMMON.ERROR")}
        message={error?.message || t("COMMON.DEFAULT_ERROR_MESSAGE")}
        actionText={t("COMMON.RETRY")}
        onAction={refetch}
      />
    );
  }

  if (!products || products.length === 0) {
    
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Feather name="arrow-left" size={24} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {t("MY_PRODUCTS.TITLE")}
              </Text>
            </View>
      <EmptyState
        icon="inventory"
        title={t("MY_PRODUCTS.EMPTY_TITLE")}
        message={t("MY_PRODUCTS.EMPTY_MESSAGE")}
        actionText={t("MY_PRODUCTS.ADD_PRODUCT")}
        onAction={() => navigation.navigate("ProductSubmission")}
      />
       </View>
    </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t("MY_PRODUCTS.TITLE")}
            <Text style={styles.productCount}> ({totalCount})</Text>
          </Text>
        </View>
        
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1877f2"]}
              tintColor="#1877f2"
            />
          }
          showsVerticalScrollIndicator={false}
          // Added key to prevent numColumns warning
          key="single-column-list"
        />

        <CustomModal
          visible={deleteModalVisible}
          type="error"
          title={t('deleteConfirmation.title')}
          message={t('deleteConfirmation.message')}
          onClose={() => setDeleteModalVisible(false)}
          actionText={t('deleteConfirmation.confirm')}
          onAction={confirmDelete}
          autoClose={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F8FAFC'
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    color: "#1E293B",
    textAlign: 'center'
  },
  productCount: {
    color: "#64748B",
    fontFamily: 'Tajawal-Medium'
  },
  listContent: {
    paddingBottom: 20,
  },
  cardContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    position: 'relative',
  },
  cardContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  cardImageWrapper: {
    width: 100,
    height: 95,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    marginLeft: 12,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textContent: {
    flex: 1,
  },
  topRow: {
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#1877f2",
    marginBottom: 4,
    textAlign: "right",
  },
  cardBrand: {
    fontSize: 12,
    fontFamily: "Tajawal-Regular",
    color: "#6B7280",
    marginBottom: 2,
    textAlign: "right",
  },
  cardPrice: {
    fontSize: 15,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "right",
  },
  middleRow: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Tajawal-Regular",
    color: "#6B7280",
    textAlign: "right",
    flexShrink: 1,
  },
  phoneLink: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 4,
  },
  phoneText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#4B5563",
    textAlign: "right",
  },
  overlayButtons: {
    position: 'absolute',
    left: 16,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Tajawal-Medium',
    color: '#FFFFFF',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
});

export default MyProductsScreen;