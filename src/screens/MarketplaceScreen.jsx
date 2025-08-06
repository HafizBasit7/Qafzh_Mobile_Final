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
import { Picker } from '@react-native-picker/picker';
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
  { id: "Inverter", name: "انفرترات", icon: "chip" },
  { id: "Battery", name: "بطاريات", icon: "car-battery" },
  { id: "Panel bases", name: "قواعد ألواح", icon: "format-align-bottom" }, // new
  { id: "Accessory", name: "اكسسوارات", icon: "tools" },
  { id: "Other", name: "أخرى", icon: "shape" }, // new
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
          <MaterialIcons name="location-on" size={18} color="#1877f2" />
          <Text style={styles.governorateFilterText}>
            {filters.governorate || "كل المحافظات"}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1877f2" />
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
                <MaterialIcons name="check" size={20} color="#1877f2" />
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
        <ActivityIndicator size="small" color="#1877f2" />
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
        colors={["#1877f2", "#1877f2"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {/* <Image source={Logo} style={styles.logo} /> */}
              <Text style={styles.title}>السوق الشمسي</Text>
            </View>

        
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
                color="#1877f2"
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
                      color={activeTab === item.id ? "#FFFFFF" : "#1877f2"}
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

  // const renderBanner = () => (
  //   <TouchableOpacity
  //     style={styles.bannerContainer}
  //     activeOpacity={0.9}
  //     onPress={() => navigation.navigate("OffersTab")}
  //   >
  //     <Image
  //       source={require("../../assets/images/solar1.jpg")}
  //       style={styles.bannerImage}
  //       resizeMode="cover"
  //     />
  //     <LinearGradient
  //       colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
  //       style={styles.bannerOverlay}
  //       start={{ x: 0, y: 0 }}
  //       end={{ x: 0, y: 1 }}
  //     >
  //       <View style={styles.bannerContent}>
  //         <Text style={styles.bannerTitle}>خصومات تصل إلى 30%</Text>
  //         <Text style={styles.bannerSubtitle}>
  //           احصل على أفضل العروض على الأنظمة الشمسية
  //         </Text>
  //         <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate("OffersTab")}>
  //           <Text style={styles.bannerButtonText}>تسوق الآن</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </LinearGradient>S
  //   </TouchableOpacity>
  // );


 
 
  const ITEMS_PER_PAGE = 6;


  const renderProductTypeTabs = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const flatListRef = useRef(null);

    if (activeTab !== "products") return null;

    const totalPages = Math.ceil(PRODUCT_TYPES.length / ITEMS_PER_PAGE);

    const paginatedTypes = Array.from({ length: totalPages }).map((_, i) =>
      PRODUCT_TYPES.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE)
    );

    const handleScroll = (event) => {
      const page = Math.round(event.nativeEvent.contentOffset.x / width);
      setCurrentPage(page);
    };

    const renderPage = ({ item }) => (
      <View style={styles.gridPage}>
        {item.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.gridCard,
              activeProductType === type.id && styles.activeGridCard,
            ]}
            onPress={() => handleProductTypeChange(type.id)}
          >
            <MaterialCommunityIcons
              name={type.icon}
              size={24}
              color={activeProductType === type.id ? "#fff" : "#1877f2"}
              style={{ marginBottom: 8 }}
            />
            <Text
              style={[
                styles.gridCardText,
                activeProductType === type.id && styles.activeGridCardText,
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    return (
      <View>
        <FlatList
          ref={flatListRef}
          data={paginatedTypes}
          renderItem={renderPage}
          keyExtractor={(_, index) => `page-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Dot Pagination */}
        <View style={styles.dotContainer}>
          {paginatedTypes.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setCurrentPage(index);
                flatListRef.current.scrollToIndex({ index, animated: true });
              }}
              style={[
                styles.dot,
                currentPage === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };


  const renderQuickFilters = () => {
    if (activeTab !== "products") return null;
  
    const QUICK_FILTERS = [
      { id: "newest", name: "الأحدث" },
      { id: "price_asc", name: "السعر من الأقل" },
      { id: "price_desc", name: "السعر من الأعلى" },
      // { id: "nearby", name: "القريب منك" },
    ];
  
    return (
      
      <View style={styles.quickFiltersContainerDropdown}>
        <Picker
          selectedValue={filters.sortBy}
          onValueChange={(itemValue) =>
            setFilters({ ...filters, sortBy: itemValue })
          }
          style={styles.picker}
          dropdownIconColor="#1877f2"
        >
          {QUICK_FILTERS.map((filter) => (
            <Picker.Item key={filter.id} label={filter.name} value={filter.id} />
          ))}
        </Picker>

        
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
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          key={activeTab} // Simplified key since we're using single column for all
          data={activeData.data}
          renderItem={({ item }) => {
            switch (activeTab) {
              case "products":
                return (
                  <View style={styles.singleColumnItem}>
                    <ProductCard product={item} />
                  </View>
                );
              case "engineers":
                return (
                  <View style={styles.singleColumnItem}>
                    <EngineerCard engineer={item} />
                  </View>
                );
              case "shops":
                return (
                  <View style={styles.singleColumnItem}>
                    <ShopCard shop={item} />
                  </View>
                );
              default:
                return null;
            }
          }}
          keyExtractor={(item) => item._id || item.id}
          numColumns={1} // Force single column for all tabs
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          initialNumToRender={10} // Show more items initially
          maxToRenderPerBatch={10} // Render more items per batch
          windowSize={10} // Increase render window
          removeClippedSubviews={false} // Prevent clipping issues
          refreshControl={
            <RefreshControl
              refreshing={activeData.isLoading}
              onRefresh={activeData.refetch}
              colors={["#1877f2"]}
              tintColor="#1877f2"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    );
  };

  const renderFiltersRow = () => {
    if (activeTab !== "products") return null;
  
    return (
      <View style={styles.filtersRow}>
        <View style={styles.governorateFilterWrapper}>{renderGovernorateFilter()}</View>
        <View style={styles.quickFilterDropdownWrapper}>{renderQuickFilters()}</View>
      </View>
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
              {/* {renderBanner()} */}
              {/* {renderCategoryTabs()} */}
              {renderProductTypeTabs()}
              {renderFiltersRow()}

            </>
          }
          ListFooterComponent={renderContent()}
          refreshControl={
            <RefreshControl
              refreshing={activeData.isLoading}
              onRefresh={activeData.refetch}
              colors={["#1877f2"]}
              tintColor="#1877f2"
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
  filtersRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 15,
  paddingVertical: 10,
  gap: 10,
},

governorateFilterWrapper: {
  flex: 1,
},

quickFilterDropdownWrapper: {
  flex: 1,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 10,
  backgroundColor: "#F3F4F6",
  justifyContent: "center",
  paddingLeft: 5,
  height:33
},

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
    paddingTop: 15,
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
    width: 54,
    height: 54,
    marginRight: 8,
    maxHeight: 64,
    resizeMode: 'contain',
  },


  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    // marginLeft:160,
    marginBottom:10,
    // flexDirection: "row",
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
    backgroundColor: "#1877f2",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
    // borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  activeCategoryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#1877f2",
  },
  categoryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 5,
    fontFamily: "Tajawal-Medium",
  },
  activeCategoryButtonText: {
    color: "#1877f2",
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
    backgroundColor: "#1877f2",
    borderColor: "#1877f2",
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
  // quickFiltersContainerDropdown: {
  //   backgroundColor: "#FFFFFF",
  //   paddingHorizontal: 15,
  //   paddingVertical: 5,
  //   // borderBottomWidth: 1,
  // //   borderBottomColor: "#E5E7EB",
  // },
  
  picker: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Tajawal-Medium",
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
    color: "#1877f2",
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
    backgroundColor: "#1877f2",
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
    paddingHorizontal: 5,
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
    color: "#1877f2",
  },
  governorateItemSeparator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  gridPage: {
    width: width,
    flexDirection: "row",
    flexWrap: "wrap",
    // justifyContent: "center",
    paddingVertical: 5,
  },

  gridCard: {
    width: "30%",
    margin: "1.66%",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  activeGridCard: {
    backgroundColor: "#1877f2",
  },

  gridCardText: {
    fontSize: 13,
    color: "#1877f2",
    textAlign: "center",
  },

  activeGridCardText: {
    color: "#fff",
  },

  dotContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },

  activeDot: {
    backgroundColor: "#1877f2",
    width: 10,
    height: 10,
  },



});