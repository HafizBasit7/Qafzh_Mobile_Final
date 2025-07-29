import { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ProductCard from "../components/ProductCard";
import ShopCard from "../components/ShopCard";
import EngineerCard from "../components/EngineerCard";
import MarketplaceFilter from "../components/MarketplaceFilter";
import CustomModal from "../components/common/CustomModal";
import { navigate } from "../navigation/navigationHelper";
import { useTranslation } from "react-i18next";
import { useProducts } from "../hooks/useProducts";
import { useEngineers } from "../hooks/useEngineers";
import { useShops } from "../hooks/useShops";
import { useAuth } from "../hooks/useAuth";
import { useModal } from "../hooks/useModal";
import { useDebounce } from "../hooks/useDebounce";
import { searchAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

// Mobile dimensions
const { width } = Dimensions.get("window");

export default function MarketplaceScreen() {
  const { t } = useTranslation();
  const { currentUser, isAuthenticated } = useAuth();
  const { modalState, hideModal, showError } = useModal();
  
  const [activeTab, setActiveTab] = useState("products");
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: { data: [], total: 0 },
    engineers: { data: [], total: 0 },
    shops: { data: [], total: 0 },
    ads: { data: [], total: 0 }
  });
  
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [filters, setFilters] = useState({
    productType: "",
    condition: "",
    governorate: "",
    sortBy: "newest",
  });

  // Debounced search value
  const debouncedSearchText = useDebounce(searchText, 500);

  // Build filter parameters for API
  const buildFilterParams = useCallback(() => {
    const params = {};
    
    if (debouncedSearchText.trim()) {
      params.search_keyword = debouncedSearchText.trim();
    }
    
    if (filters.productType && filters.productType !== 'all') {
      params.type = filters.productType;
    }
    
    if (filters.condition && filters.condition !== 'all') {
      params.condition = filters.condition;
    }
    
    if (filters.governorate && filters.governorate !== 'all') {
      params.governorate = filters.governorate;
    }
    
    // Handle sorting
    if (filters.sortBy === 'price_asc') {
      params.sortBy = 'price';
      params.sortOrder = 'asc';
    } else if (filters.sortBy === 'price_desc') {
      params.sortBy = 'price';
      params.sortOrder = 'desc';
    } else if (filters.sortBy === 'name') {
      params.sortBy = 'name';
      params.sortOrder = 'asc';
    } else {
      params.sortBy = 'createdAt';
      params.sortOrder = 'desc';
    }
    
    return params;
  }, [debouncedSearchText, filters]);

  // Unified search effect
  useEffect(() => {
    const performUnifiedSearch = async () => {
      if (!debouncedSearchText.trim()) {
        setSearchResults({
          products: { data: [], total: 0 },
          engineers: { data: [], total: 0 },
          shops: { data: [], total: 0 },
          ads: { data: [], total: 0 }
        });
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchAPI.searchAll(buildFilterParams());
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        // Instead of showing annoying modal, just set empty results
        setSearchResults({
          products: { data: [], total: 0 },
          engineers: { data: [], total: 0 },
          shops: { data: [], total: 0 },
          ads: { data: [], total: 0 }
        });
      } finally {
        setIsSearching(false);
      }
    };

    performUnifiedSearch();
  }, [debouncedSearchText, buildFilterParams]);

  // Data hooks for non-search scenarios
  const productsHook = useProducts(debouncedSearchText ? {} : buildFilterParams());
  const engineersHook = useEngineers(debouncedSearchText ? {} : { search_keyword: debouncedSearchText });
  const shopsHook = useShops(debouncedSearchText ? {} : { search_keyword: debouncedSearchText });

  // Handle filter application
  const handleFiltersApply = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleTabChange = (tabId) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setActiveTab(tabId));
  };

  // Get active data based on search state and current tab
  const getActiveData = () => {
    const isSearchMode = debouncedSearchText.trim() !== '';
    
    if (isSearchMode) {
      // Use search results
      switch (activeTab) {
        case "products":
          return {
            data: searchResults.products.data,
            isLoading: isSearching,
            isError: false,
            error: null,
            hasNextPage: false, // Search doesn't support pagination yet
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            refetch: () => {},
            total: searchResults.products.total,
          };
        case "engineers":
          return {
            data: searchResults.engineers.data,
            isLoading: isSearching,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            refetch: () => {},
            total: searchResults.engineers.total,
          };
        case "shops":
          return {
            data: searchResults.shops.data,
            isLoading: isSearching,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            refetch: () => {},
            total: searchResults.shops.total,
          };
        default:
          return {
            data: [],
            isLoading: false,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            refetch: () => {},
            total: 0,
          };
      }
    } else {
      // Use regular hooks
      switch (activeTab) {
        case "products":
          return {
            data: productsHook.products,
            isLoading: productsHook.isLoading,
            isError: productsHook.isError,
            error: productsHook.error,
            hasNextPage: productsHook.hasNextPage,
            fetchNextPage: productsHook.fetchNextPage,
            isFetchingNextPage: productsHook.isFetchingNextPage,
            refetch: productsHook.refetch,
            total: productsHook.totalCount,
          };
        case "engineers":
          return {
            data: engineersHook.engineers || [],
            isLoading: engineersHook.isLoading,
            isError: engineersHook.isError,
            error: engineersHook.error,
            hasNextPage: engineersHook.hasNextPage,
            fetchNextPage: engineersHook.fetchNextPage,
            isFetchingNextPage: engineersHook.isFetchingNextPage,
            refetch: engineersHook.refetch,
            total: engineersHook.totalCount || 0,
          };
        case "shops":
          return {
            data: shopsHook.shops || [],
            isLoading: shopsHook.isLoading,
            isError: shopsHook.isError,
            error: shopsHook.error,
            hasNextPage: shopsHook.hasNextPage,
            fetchNextPage: shopsHook.fetchNextPage,
            isFetchingNextPage: shopsHook.isFetchingNextPage,
            refetch: shopsHook.refetch,
            total: shopsHook.totalCount || 0,
          };
        default:
          return {
            data: [],
            isLoading: false,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => {},
            isFetchingNextPage: false,
            refetch: () => {},
            total: 0,
          };
      }
    }
  };

  const activeData = getActiveData();

  const handleLoadMore = () => {
    if (activeData.hasNextPage && !activeData.isFetchingNextPage) {
      activeData.fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!activeData.hasNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#16A34A" />
      </View>
    );
  };

  const renderEmptyState = () => {
    // Determine the appropriate message based on context
    let iconName = 'search-off';
    let message = 'لا توجد نتائج للبحث';
    let subMessage = 'جرب تغيير كلمات البحث أو الفلاتر';
    
    if (!debouncedSearchText) {
      switch (activeTab) {
        case 'products':
          iconName = 'inventory-2';
          message = 'لا توجد منتجات متاحة حالياً';
          subMessage = 'سيتم إضافة المزيد من المنتجات قريباً';
          break;
        case 'engineers':
          iconName = 'engineering';
          message = 'لا توجد مهندسين مسجلين حالياً';
          subMessage = '';
          break;
        case 'shops':
          iconName = 'store';
          message = 'لا توجد متاجر مسجلة حالياً';
          subMessage = '';
          break;
      }
    }
  
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name={iconName} size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>{message}</Text>
        {subMessage ? <Text style={styles.emptySubtext}>{subMessage}</Text> : null}
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={64} color="#EF4444" />
      <Text style={styles.errorText}>
        {activeData.error?.message || "حدث خطأ أثناء جلب البيانات"}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={activeData.refetch}>
        <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
      </TouchableOpacity>
    </View>
  );

  const getId = (item) => item?._id || item?.id;

  // Get tabs with search results counts
  const categories = [
    {
      id: "products",
      name: "المنتجات",
      icon: "solar-panel-large",
      // count: activeData.total || 0,
    },
    {
      id: "engineers",
      name: "المهندسين", 
      icon: "account-hard-hat",
      // count: debouncedSearchText ? searchResults.engineers.total : (engineersHook.totalCount || 0),
    },
    {
      id: "shops",
      name: "المتاجر",
      icon: "store",
      // count: debouncedSearchText ? searchResults.shops.total : (shopsHook.totalCount || 0),
    },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["#16A34A", "#15803D"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          {/* Top Row - Title and Location */}
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>السوق الشمسي</Text>
              <Text style={styles.subtitle}>
                {debouncedSearchText ? `نتائج البحث: "${debouncedSearchText}"` : "اكتشف المنتجات والخدمات الشمسية"}
              </Text>
            </View>
            <View style={styles.locationTag}>
              <Ionicons name="location-sharp" size={10} color="#FFFFFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                اليمن
              </Text>
            </View>
          </View>

          {/* Bottom Row - Search and Filter */}
          <View style={styles.actionsRow}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInput}>
                <MaterialIcons name="search" size={20} color="#FFFFFF" />
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="ابحث عن منتج أو خدمة..."
                  placeholderTextColor="#94A3B8"
                  value={searchText}
                  onChangeText={setSearchText}
                  returnKeyType="search"
                  textAlign="right"
                />
                {isSearching && (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.filterIcon}
              onPress={() => setShowFilters(true)}
            >
              <MaterialIcons name="tune" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <Image
        source={require("../../assets/images/solar1.jpg")}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
        style={styles.bannerOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>خصومات تصل إلى 30%</Text>
          <Text style={styles.bannerSubtitle}>
            احصل على أفضل العروض على الأنظمة الشمسية
          </Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>تسوق الآن</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategoryTabs = () => (
    <View style={styles.tabsContainer}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryTab,
              activeTab === item.id && styles.activeCategoryTab,
            ]}
            onPress={() => handleTabChange(item.id)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={activeTab === item.id ? "#FFFFFF" : "#16A34A"}
            />
            <Text
              style={[
                styles.categoryTabText,
                activeTab === item.id && styles.activeCategoryTabText,
              ]}
            >
              {item.name}
            </Text>
            <View
              style={[
                styles.categoryBadge,
                activeTab === item.id && styles.activeCategoryBadge,
              ]}
            >
              <Text
                style={[
                  styles.categoryBadgeText,
                  activeTab === item.id && styles.activeCategoryBadgeText,
                ]}
              >
                {item.count}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderSection = (
    type,
    data = [],
    titleKey,
    detailScreen,
    CardComponent
  ) => {
    const shouldRender = activeTab === "all" || activeTab === type;
    if (!shouldRender) return null;

    const sectionData = Array.isArray(data) ? data : [];
    const showEmptyState = !activeData.isLoading && sectionData.length === 0;
    const showHeader = activeTab === "all" && sectionData.length > 0;

    const typeConfig = {
      products: {
        numColumns: 2,
        cardStyle: styles.productCard,
        detailKey: "product",

        additionalProps: (item) => ({
          // Ensure all product fields are passed
          name: item?.name,
          price: item?.price,
          currency: item?.currency,
          images: item?.images,
          type: item?.type,
          condition: item?.condition,
          location:
            item?.governorate || item?.city
              ? `${item?.governorate || ""}${
                  item?.governorate && item?.city ? ", " : ""
                }${item?.city || ""}`
              : "",
          isNegotiable: item?.isNegotiable,
        }),
      },
      shops: {
        numColumns: 1,
        cardStyle: styles.fullWidthCard,
        detailKey: "shop",
      },
      engineers: {
        numColumns: 1,
        cardStyle: styles.fullWidthCard,
        detailKey: "engineer",
      },
    };

    const { numColumns, cardStyle, detailKey } = typeConfig[type];

    return (
      <View style={styles.section}>
        {showHeader && (
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>{t(titleKey)}</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab(type)}>
              <Text style={styles.seeAllText}>{t("COMMON.SEE_ALL")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showEmptyState ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {t(`MARKETPLACE.NO_${type.toUpperCase()}`)}
            </Text>
          </View>
        ) : (
          <FlatList
            data={sectionData}
            renderItem={({ item }) => {
              if (!item) return null;

              const detailProps = { [detailKey]: item };

              return (
                <TouchableOpacity
                  onPress={() => navigate(detailScreen, detailProps)}
                  style={cardStyle}
                >
                  <CardComponent {...detailProps} />
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) =>
              item?.id || item?._id || Math.random().toString()
            }
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
            scrollEnabled={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              activeData.isFetchingNextPage ? (
                <ActivityIndicator size="small" style={styles.loader} />
              ) : null
            }
          />
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (activeData.isLoading && !activeData.data.length) {
      return <LoadingSpinner />;
    }

    if (activeData.isError) {
      return renderError();
    }

    if (activeData.data.length === 0) {
      return renderEmptyState();
    }

    // Render current tab data
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          key={`${activeTab}-${activeTab === "products" ? "2" : "1"}`} // Force re-render when numColumns changes
          data={activeData.data}
          renderItem={({ item }) => {
            switch (activeTab) {
              case "products":
                return <ProductCard product={item} />;
              case "engineers":
                return <EngineerCard engineer={item} />;
              case "shops":
                return <ShopCard shop={item} />;
              default:
                return null;
            }
          }}
          keyExtractor={(item) => item._id || item.id}
          numColumns={activeTab === "products" ? 2 : 1}
          columnWrapperStyle={activeTab === "products" ? styles.columnWrapper : null}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={activeData.isLoading}
              onRefresh={activeData.refetch}
              colors={["#16A34A"]}
              tintColor="#16A34A"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      
      <View style={styles.container}>
        <FlatList
          data={[]}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderBanner()}
              {renderCategoryTabs()}
            </>
          }
          ListFooterComponent={renderContent()}
          refreshControl={
            <RefreshControl
              refreshing={activeData.isLoading}
              onRefresh={activeData.refetch}
              colors={["#16A34A"]}
              tintColor="#16A34A"
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <MarketplaceFilter
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleFiltersApply}
          initialFilters={filters}
        />
      </View>

      {/* Custom Modal */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 10,
    paddingTop: 0,
  },
  headerGradient: {
    paddingTop: 25,
    paddingBottom: 15,
  },
  header: {
    paddingHorizontal: 15,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)", 
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    textAlign: "right",
    paddingVertical: 0,
  },
  actionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 5,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    maxWidth: 120,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 3,
    fontFamily: "Tajawal-Medium",
    numberOfLines: 1,
  },
  tabsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabsScrollContent: {
    paddingHorizontal: 15,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: "#16A34A",
  },
  categoryTabText: {
    fontSize: 12,
    color: "#16A34A",
    marginHorizontal: 5,
  },
  activeCategoryTabText: {
    color: "#FFFFFF",
  },
  categoryBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeCategoryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  categoryBadgeText: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "bold",
  },
  activeCategoryBadgeText: {
    color: "#FFFFFF",
  },
  contentContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  seeAllText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "500",
  },
  productCard: {
    flex: 1,
    margin: 5,
    maxWidth: "50%",
  },
  fullWidthCard: {
    marginBottom: 10,
  },
  tabletCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  footerLoader: {
    paddingVertical: 10,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 5,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  bannerContainer: {
    height: 180,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContent: {
    alignItems: "center",
    padding: 24,
  },
  bannerTitle: {
    fontSize: 22,
    fontFamily: "Tajawal-Bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    fontSize: 15,
    fontFamily: "Tajawal-Regular",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  bannerButton: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerButtonText: {
    color: "#FFFFFF",
    fontFamily: "Tajawal-Bold",
    fontSize: 15,
  },
  actionButtons: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20, // Add some padding at the bottom for the footer
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Tajawal-Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
