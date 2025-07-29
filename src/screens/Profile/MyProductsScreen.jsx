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
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/ProductCard";
import EmptyState from "../../components/EmptyState";
import CustomModal from "../../components/common/CustomModal";


const { width } = Dimensions.get('window');
  const CARD_MARGIN = 4;
  const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / 2;


const MyProductsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  console.log('🔐 MyProductsScreen - Requesting user products via token');
  
  // Use user_products flag to get only authenticated user's products
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

  // const handleDelete = (productId) => {
  //   Alert.alert(
  //     "تأكيد الحذف", 
  //     "هل أنت متأكد من حذف هذا المنتج؟", 
  //     [
  //       {
  //         text: "إلغاء",
  //         style: "cancel",
  //       },
  //       {
  //         text: "حذف",
  //         onPress: () => {
  //           if (deleteProduct) {
  //             deleteProduct(productId);
  //           } else {
  //             console.error('Delete function not available');
  //           }
  //         },
  //         style: "destructive",
  //       },
  //     ]
  //   );
  // };

const handleDelete = (productId) => {
  console.log('🔐 MyProductsScreen - Deleting product:', productId);
  setSelectedProductId(productId);
  setDeleteModalVisible(true);
};

const confirmDelete = () => {
  if (deleteProduct && selectedProductId) {
    deleteProduct(selectedProductId);
  }
  setDeleteModalVisible(false);
};

  const renderItem = ({ item, index  }) => (
    <View style={[styles.productContainer,  index % 2 === 0 ? { marginRight: CARD_MARGIN } : null ]}>
      <TouchableOpacity onPress={() => handleProductPress(item)} activeOpacity={0.95}>
        <ProductCard product={item} />
      </TouchableOpacity>
      
      <View style={styles.cardOverlay}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'approved' ? '#10B981' : '#F59E0B' }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'approved' ? 'مقبول' : 'قيد المراجعة'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteIcon}
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
          <ActivityIndicator size="large" color="#16A34A" />
        )}
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="error"
        title="خطأ"
        message={error?.message || "حدث خطأ أثناء تحميل المنتجات"}
        actionText="إعادة المحاولة"
        onAction={refetch}
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon="inventory"
        title="لا توجد منتجات"
        message="لم تقم بنشر أي منتجات بعد. ابدأ بإضافة منتجك الأول!"
        actionText="إضافة منتج"
        onAction={() => navigation.navigate("ProductSubmission")}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>منتجاتي
        <Text style={styles.productCount}> ({totalCount})</Text>
        </Text>
      </View>
      
      <FlatList
        data={products}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#16A34A"]}
            tintColor="#16A34A"
          />
        }
        showsVerticalScrollIndicator={false}
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
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Tajawal-Bold',
    color: "#1E293B",
    textAlign: 'center'
  },
  productCount: {
    color: "#64748B",
    fontFamily: 'Tajawal-Medium'
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN, // Only side margins
    paddingTop: 12,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  productContainer: {
    // width: CARD_WIDTH,
    // backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 6,
    // elevation: 3,
    // borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  productCard: {
    width: '100%',
  },
  cardOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: 'Tajawal-Bold',
    includeFontPadding: false,
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#991B1B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
});

export default MyProductsScreen;
