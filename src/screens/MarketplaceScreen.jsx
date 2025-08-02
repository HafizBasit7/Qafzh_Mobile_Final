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
  ScrollView,
  Modal,
  TouchableWithoutFeedback
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
import Logo from "../../assets/images/Logo.png"
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const governorates = [
  {
    name: "أبين",
    cities: ["زنجبار", "خنفر", "لودر", "مودية", "سيبان", "أحور"]
  },
  {
    name: "عدن",
    cities: ["كريتر", "المعلا", "التواهي", "الشيخ عثمان", "المنصورة", "دار سعد", "البريقة", "خور مكسر"]
  },
  {
    name: "البيضاء",
    cities: ["البيضاء", "رداع", "مكيراس", "ناطع", "سباح", "ولد ربيع", "الصومعة", "الزاهر"]
  },
  {
    name: "الضالع",
    cities: ["الضالع", "دمت", "قعطبة", "الأزارق", "جحاف", "الحصين", "الشعيب", "جبن"]
  },
  {
    name: "الحديدة",
    cities: ["الحديدة", "باجل", "الخوخة", "اللُحية", "الصليف", "بيت الفقيه", "زبيد", "المنصورية", "التحيتا", "حيس", "المغلاف", "الجراحي", "كمران", "الدريهمي", "القناوص", "وادي مور", "الزيدية", "التحيتا", "الخوخة", "حرف سفيان", "الشمايتين", "المراوعة", "بُرع"]
  },
  {
    name: "الجوف",
    cities: ["الحزم", "خب والشعف", "برط العنان", "الخلق", "المطمة", "الغيل", "رجوزة", "الزاهر", "الحميدات", "خب والشعف", "المتون"]
  },
  {
    name: "المهرة",
    cities: ["الغيضة", "سيحوت", "قشن", "المسيلة", "حوف", "منعر", "شحن", "حَصوين", "فرطك"]
  },
  {
    name: "المحويت",
    cities: ["المحويت", "الخبت", "حفاش", "شبام كوكبان", "ملحان", "بني سعد", "الرجم", "الطويلة", "الرُجم"]
  },
  {
    name: "أمانة العاصمة",
    cities: ["المدينة القديمة", "السبعين", "معين", "التحرير", "الثورة", "شعوب", "السبعين", "بني الحارث", "الوحدة", "آزال"]
  },
  {
    name: "عمران",
    cities: ["عمران", "ريدة", "حرف سفيان", "خارف", "القفلة", "السودة", "بني صريم", "مسور", "عيال سريح", "جبل عيال يزيد", "ثلاء", "حبور ظليمة", "السود", "المدان", "سوير", "شهيد ناجي", "ذي بين"]
  },
  {
    name: "ذمار",
    cities: ["ذمار", "عنس", "الحداء", "ميفعة عنس", "عتمة", "جهران", "دوران عنس", "مغرب عنس", "المنار", "وصاب السافل", "وصاب العالي", "جبل الشرق"]
  },
  {
    name: "حضرموت",
    cities: ["المكلا", "سيئون", "الشحر", "تريم", "شبام", "وادي حضرموت", "قطن", "يابوث", "حجر الصيعر", "دوعن", "الريدة", "القطن", "عمد", "رخية", "ثمود", "سيح الأر", "العبر", "مأرب الوادي", "حورة", "زمخ ومنوخ", "الوديعة", "غيل باوزير", "هجم", "مكيراس", "الريدة وقصيعر", "الديس", "رممة", "المكلا", "مكيراس", "القائمة", "السوم", "الروضة", "الثلوث", "التنعيم", "برهوت", "يشبم"]
  },
  {
    name: "حجة",
    cities: ["حجة", "عبس", "حرض", "ميدي", "مستباء", "أفلح اليمن", "قفل شمر", "نجرة", "بكيل المير", "الجميمة", "المفتاح", "الشغادرة", "وشحة", "كُحلان الشرف", "كعيدنة", "أفلح الشام", "بني قيس", "شهارة", "السلام", "أوبينة", "ريف حجة", "أسلم", "لاعة", "المغربة", "الشاهل", "كُشر"]
  },
  {
    name: "إب",
    cities: ["إب", "جبلة", "بعدان", "حبيش", "السياني", "المشنة", "السبرة", "مذيخرة", "القفر", "يافع", "النادرة", "ذي السفال", "العدين", "حزم العدين", "فرع العدين", "السدة", "الشاعر", "المخادر", "الرُضمة"]
  },
  {
    name: "لحج",
    cities: ["الحوطة", "تبن", "الحليمين", "ردفان", "يهر", "الوديعة", "القبيطة", "المضاربة ورأس العارة", "الملاح", "المقاطرة", "طور الباحة", "يافع", "الحد", "السعيد"]
  },
  {
    name: "مأرب",
    cities: ["مأرب", "صرواح", "رغوان", "ماهلية", "حريب", "الجوبة", "بدبدة", "رحبة", "حريب القراميش", "مجزر", "العبدية", "مدغل", "جبل مراد", "رحبة"]
  },
  {
    name: "ريمة",
    cities: ["الجبين", "بلاد الطعام", "كُسمة", "السلفية", "مُزهر", "السلفية"]
  },
  {
    name: "صعدة",
    cities: ["صعدة", "حيدان", "كتاف والبقع", "الظاهر", "رازح", "الحشوة", "مجزر", "سحار", "كتاف", "الصفراء", "شدا", "قطابر", "باقم", "منبه", "غمر", "ساقين", "البقع", "البقع"]
  },
  {
    name: "صنعاء",
    cities: ["سنحان", "خولان", "بني مطر", "الحصن", "جحانة", "همدان", "نهم", "بني حشيش", "مناخة", "همدان", "صعفان", "أرحب", "الطيال", "بلاد الروس", "الحيمة الخارجية", "بني ضبيان"]
  },
  {
    name: "شبوة",
    cities: ["عتق", "الروضة", "ميفعة", "نصاب", "مرخة السفلى", "مرخة العليا", "حطيب", "عسيلان", "رضوم", "جردان", "ضَهر", "بيحان", "عين", "السعيد", "عرمة", "الطلح", "حبّان"]
  },
  {
    name: "سقطرى",
    cities: ["حديبو", "مومي", "قلنسية", "عبد الكوري"]
  },
  {
    name: "تعز",
    cities: ["تعز", "التربة", "صبر الموادم", "الشمايتين", "دمنت خدير", "الوازعية", "شرعب الرونة", "شرعب السلام", "جبل حبشي", "المظفر", "القاهرة", "صالة", "مقبنة", "المسراخ", "موزع", "الصلو", "سامع", "المعافر", "المخا", "ذباب", "برة", "حيفان", "ماوية", "المواسط"]
  }
];




// Product types for the new tabs
const PRODUCT_TYPES = [
  { id: "all", name: "الكل", icon: "apps" },
  { id: "Panel", name: "ألواح شمسية", icon: "solar-panel" },
  { id: "Inverter", name: "انفرترات", icon: "flash" },
  { id: "Battery", name: "بطاريات", icon: "battery" },
  // { id: "Accessory", name: "اكسسوارات", icon: "cable" },
];

export default function MarketplaceScreen({ navigation }) {
  const { t } = useTranslation();
  const { currentUser, isAuthenticated } = useAuth();
  const { modalState, hideModal, showError } = useModal();
  const [showGovernorateModal, setShowGovernorateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductType, setActiveProductType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("كل اليمن");
  const [showCategories, setShowCategories] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: { data: [], total: 0 },
    engineers: { data: [], total: 0 },
    shops: { data: [], total: 0 },
    ads: { data: [], total: 0 }
  });


  const renderGovernorateFilter = () => {
    if (activeTab !== "products") return null;

    return (
      <View style={styles.governorateFilterContainer}>
        <TouchableOpacity
          style={styles.governorateFilterButton}
          onPress={() => setShowGovernorateModal(true)}
        >
          <MaterialIcons name="location-on" size={18} color="#02ff04" />
          <Text style={styles.governorateFilterText}>
            {filters.governorate || "كل المحافظات"}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#02ff04" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderGovernorateModal = () => (
    <Modal
      visible={showGovernorateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowGovernorateModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowGovernorateModal(false)}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.governorateModalContainer}>
        <View style={styles.governorateModalHeader}>
          <Text style={styles.governorateModalTitle}>اختر المحافظة</Text>
          <TouchableOpacity onPress={() => setShowGovernorateModal(false)}>
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={[{ name: "كل المحافظات" }, ...governorates]}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.governorateItem,
                filters.governorate === item.name && styles.selectedGovernorateItem
              ]}
              onPress={() => {
                setFilters({
                  ...filters,
                  governorate: item.name === "كل المحافظات" ? "" : item.name,
                  city: ""
                });
                setShowGovernorateModal(false);
              }}
            >
              <Text
                style={[
                  styles.governorateItemText,
                  filters.governorate === item.name && styles.selectedGovernorateItemText
                ]}
              >
                {item.name}
              </Text>
              {filters.governorate === item.name && (
                <MaterialIcons name="check" size={20} color="#02ff04" />
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.governorateItemSeparator} />}
          contentContainerStyle={styles.governorateModalContent}
        />
      </View>
    </Modal>
  );

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [filters, setFilters] = useState({
    productType: "",
    condition: "",
    governorate: "",
    city: "",
    sortBy: "newest",
    priceRange: [0, 10000],
  });

  // Get cities based on selected governorate
  const getCities = () => {
    if (!filters.governorate) return [];
    const selectedGov = governorates.find(gov => gov.name === filters.governorate);
    return selectedGov ? selectedGov.cities : [];
  };

  const debouncedSearchText = useDebounce(searchText, 500);

  const buildFilterParams = useCallback(() => {
    const params = {};

    if (debouncedSearchText.trim()) {
      params.search_keyword = debouncedSearchText.trim();
    }

    if (activeProductType !== "all") {
      params.type = activeProductType;
    } else if (filters.productType && filters.productType !== "all") {
      params.type = filters.productType;
    }

    if (filters.condition && filters.condition !== "all") {
      params.condition = filters.condition;
    }

    if (filters.governorate && filters.governorate !== "all") {
      params.governorate = filters.governorate;
    }

    if (filters.city && filters.city !== "all") {
      params.city = filters.city;
    }

    if (filters.priceRange) {
      params.minPrice = filters.priceRange[0];
      params.maxPrice = filters.priceRange[1];
    }

    if (filters.sortBy === "price_asc") {
      params.sortBy = "price";
      params.sortOrder = "asc";
    } else if (filters.sortBy === "price_desc") {
      params.sortBy = "price";
      params.sortOrder = "desc";
    } else if (filters.sortBy === "name") {
      params.sortBy = "name";
      params.sortOrder = "asc";
    } else {
      params.sortBy = "createdAt";
      params.sortOrder = "desc";
    }

    return params;
  }, [debouncedSearchText, filters, activeProductType]);

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
        console.error("Search error:", error);
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

  const productsHook = useProducts(debouncedSearchText ? {} : buildFilterParams());
  const engineersHook = useEngineers(debouncedSearchText ? {} : { search_keyword: debouncedSearchText });
  const shopsHook = useShops(debouncedSearchText ? {} : { search_keyword: debouncedSearchText });

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

  const handleProductTypeChange = (typeId) => {
    setActiveProductType(typeId);
  };

  const getActiveData = () => {
    const isSearchMode = debouncedSearchText.trim() !== "";

    if (isSearchMode) {
      switch (activeTab) {
        case "products":
          return {
            data: searchResults.products.data,
            isLoading: isSearching,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => { },
            isFetchingNextPage: false,
            refetch: () => { },
            total: searchResults.products.total,
          };
        case "engineers":
          return {
            data: searchResults.engineers.data,
            isLoading: isSearching,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => { },
            isFetchingNextPage: false,
            refetch: () => { },
            total: searchResults.engineers.total,
          };
        case "shops":
          return {
            data: searchResults.shops.data,
            isLoading: isSearching,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => { },
            isFetchingNextPage: false,
            refetch: () => { },
            total: searchResults.shops.total,
          };
        default:
          return {
            data: [],
            isLoading: false,
            isError: false,
            error: null,
            hasNextPage: false,
            fetchNextPage: () => { },
            isFetchingNextPage: false,
            refetch: () => { },
            total: 0,
          };
      }
    } else {
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
            fetchNextPage: () => { },
            isFetchingNextPage: false,
            refetch: () => { },
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
        <ActivityIndicator size="small" color="#02ff04" />
      </View>
    );
  };

  const renderEmptyState = () => {
    let iconName = "search-off";
    let message = "لا توجد نتائج للبحث";
    let subMessage = "جرب تغيير كلمات البحث أو الفلاتر";

    if (!debouncedSearchText) {
      switch (activeTab) {
        case "products":
          iconName = "inventory-2";
          message = "لا توجد منتجات متاحة حالياً";
          subMessage = "سيتم إضافة المزيد من المنتجات قريباً";
          break;
        case "engineers":
          iconName = "engineering";
          message = "لا توجد مهندسين مسجلين حالياً";
          subMessage = "";
          break;
        case "shops":
          iconName = "store";
          message = "لا توجد متاجر مسجلة حالياً";
          subMessage = "";
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

  const categories = [
    {
      id: "products",
      name: "المنتجات",
      icon: "solar-panel-large",
    },
    {
      id: "engineers",
      name: "المهندسين",
      icon: "account-hard-hat",
    },
    {
      id: "shops",
      name: "المتاجر",
      icon: "store",
    },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["#02ff04", "#02ff04"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Image source={Logo} style={styles.logo} />
              <Text style={styles.title}>السوق الشمسي</Text>
            </View>

            <TouchableOpacity
              style={styles.locationTag}
              onPress={() => setShowGovernorateModal(true)}
            >
              <Ionicons name="location-sharp" size={14} color="#FFFFFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {selectedLocation}
              </Text>
            </TouchableOpacity>
          </View>


          <View style={styles.searchRow}>
            <TouchableOpacity
              style={styles.searchContainer}
              onPress={() => setShowCategories(!showCategories)}
            >
              <MaterialIcons name="category" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchTextInput}
                placeholder="ابحث عن منتج أو خدمة..."
                placeholderTextColor="#94A3B8"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                textAlign="right"
              />
              <MaterialIcons
                name="search"
                size={20}
                color="#02ff04"
                style={styles.searchIcon}
              />
            </View>
          </View>

          {showCategories && (
            <View style={styles.categoriesContainer}>
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      activeTab === item.id && styles.activeCategoryButton
                    ]}
                    onPress={() => handleTabChange(item.id)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={18}
                      color={activeTab === item.id ? "#FFFFFF" : "#02ff04"}
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        activeTab === item.id && styles.activeCategoryButtonText
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderBanner = () => (
    <TouchableOpacity
      style={styles.bannerContainer}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("OffersTab")}
    >
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
          <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate("OffersTab")}>
            <Text style={styles.bannerButtonText}>تسوق الآن</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
              color={activeTab === item.id ? "#FFFFFF" : "#02ff04"}
            />
            <Text
              style={[
                styles.categoryTabText,
                activeTab === item.id && styles.activeCategoryTabText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderProductTypeTabs = () => {
    if (activeTab !== "products") return null;

    return (
      <View style={styles.productTypeTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productTypeTabsScroll}
        >
          {PRODUCT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.productTypeTab,
                activeProductType === type.id && styles.activeProductTypeTab,
              ]}
              onPress={() => handleProductTypeChange(type.id)}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={18}
                color={activeProductType === type.id ? "#FFFFFF" : "#02ff04"}
              />
              <Text
                style={[
                  styles.productTypeTabText,
                  activeProductType === type.id && styles.activeProductTypeTabText,
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Corrected quick filters component
  const renderQuickFilters = () => {
    if (activeTab !== "products") return null;

    const QUICK_FILTERS = [
      { id: "newest", name: "الأحدث" },
      { id: "price_asc", name: "السعر من الأقل" },
      { id: "price_desc", name: "السعر من الأعلى" },
      // { id: "nearby", name: "القريب منك" },
    ];

    return (
      <View style={styles.quickFiltersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersScroll}
        >
          {QUICK_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.quickFilter,
                filters.sortBy === filter.id && styles.activeQuickFilter,
              ]}
              onPress={() => setFilters({ ...filters, sortBy: filter.id })}
            >
              <Text
                style={[
                  styles.quickFilterText,
                  filters.sortBy === filter.id && styles.activeQuickFilterText,
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          key={`${activeTab}-${activeTab === "products" ? "2" : "1"}`}
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
              colors={["#02ff04"]}
              tintColor="#02ff04"
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
              {/* {renderCategoryTabs()} */}
              {renderProductTypeTabs()}
              {renderQuickFilters()}
              {renderGovernorateFilter()}
            </>
          }
          ListFooterComponent={renderContent()}
          refreshControl={
            <RefreshControl
              refreshing={activeData.isLoading}
              onRefresh={activeData.refetch}
              colors={["#02ff04"]}
              tintColor="#02ff04"
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
        {renderGovernorateModal()}

        <MarketplaceFilter
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleFiltersApply}
          initialFilters={filters}
          governorates={governorates}
        />
      </View>

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
    backgroundColor: "#F5F7FA",
  },
  headerContainer: {
    marginBottom: 10,
    paddingTop: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 15,
  },
  header: {
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    minHeight: 30, // Ensures consistent header height
  },
  

  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 64,
    height: 64,
    marginRight: 8,
    maxHeight: 64,
    resizeMode: 'contain',
  },
  

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },

  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 5,
  },
  searchContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 45,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  searchTextInput: {
    flex: 1,
    color: "#1F2937",
    fontSize: 13,
    fontFamily: "Tajawal-Medium",
    textAlign: "right",
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 10,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 5,
    fontFamily: "Tajawal-Medium",
    maxWidth: 120,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoriesList: {
    paddingBottom: 2,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#02ff04",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
    // borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  activeCategoryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#02ff04",
  },
  categoryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 5,
    fontFamily: "Tajawal-Medium",
  },
  activeCategoryButtonText: {
    color: "#02ff04",
  },
  productTypeTabsContainer: {
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productTypeTabsScroll: {
    paddingHorizontal: 15,
  },
  productTypeTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
    // borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeProductTypeTab: {
    backgroundColor: "#02ff04",
    borderColor: "#02ff04",
  },
  productTypeTabText: {
    fontSize: 13,
    color: "#4B5563",
    marginHorizontal: 5,
    fontFamily: "Tajawal-Medium",
  },
  activeProductTypeTabText: {
    color: "#FFFFFF",
  },
  quickFiltersContainer: {
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  quickFiltersScroll: {
    paddingHorizontal: 15,
  },
  quickFilter: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
    // borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeQuickFilter: {
    backgroundColor: "#02ff04",
    borderColor: "#02ff04",
  },
  quickFilterText: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Tajawal-Medium",
  },
  activeQuickFilterText: {
    color: "#FFFFFF",
  },
  bannerContainer: {
    height: 150,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    justifyContent: "flex-end",
    padding: 20,
  },
  bannerContent: {
    alignItems: "flex-end",
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#FFFFFF",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 15,
    lineHeight: 20,
    textAlign: "right",
  },
  bannerButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 25,
    alignSelf: "flex-end",
  },
  bannerButtonText: {
    color: "#02ff04",
    fontFamily: "Tajawal-Bold",
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    fontFamily: 'Tajawal-Regular',
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Tajawal-Medium",
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: "#02ff04",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Tajawal-Bold",
    fontSize: 14,
  },
  governorateFilterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    // borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  governorateFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  governorateFilterText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Tajawal-Medium",
    color: "#1F2937",
    marginHorizontal: 8,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  governorateModalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  governorateModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  governorateModalTitle: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#1F2937",
  },
  governorateModalContent: {
    paddingHorizontal: 16,
  },
  governorateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  selectedGovernorateItem: {
    backgroundColor: "#F0FDF4",
  },
  governorateItemText: {
    fontSize: 16,
    fontFamily: "Tajawal-Medium",
    color: "#1F2937",
  },
  selectedGovernorateItemText: {
    color: "#02ff04",
  },
  governorateItemSeparator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
});