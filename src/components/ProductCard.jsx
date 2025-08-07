import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,

} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import PhoneLink from './PhoneLink';
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');
// const cardWidth = (width - 48) / 2; // 2 cards per row with margins

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const navigation = useNavigation();

  if (!product) return null;

  const handlePress = () => {
    navigation.navigate('ProductDetail', { product });
  };

  const CURRENCY_SYMBOLS = {
    YER: "﷼",          // Northern Yemeni Rial
    YER_SOUTH: "﷼ ج",  // Southern Yemeni Rial (with ج for جنوبي)
    USD: "$",          // US Dollar
    SAR: "ر.س"        // Saudi Riyal
  };

const formatPrice = (price, currency = 'YER', isSouthern = false) => {
  const symbol = isSouthern ? CURRENCY_SYMBOLS.YER_SOUTH : CURRENCY_SYMBOLS[currency];
  return `${price} ${symbol}`;
};

  const renderImage = () => {
    if (imageError) {
      return (
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="broken-image" size={32} color="#CBD5E1" />
          <Text style={styles.placeholderText}>لا توجد صورة</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: product.images?.[0] || "https://via.placeholder.com/300",
          }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator color="#02ff04" size="large" />
          </View>
        )}

        {/* Condition Badge */}
        {/* <View
          style={[styles.conditionBadge, styles[`${product.condition}Badge`]]}
        >
          <Text
            style={[styles.conditionText, styles[`${product.condition}Text`]]}
          >
            {t(`CONDITIONS.${product.condition.toUpperCase()}`)}
          </Text>
        </View> */}
      </View>
    );
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new': return '#10B981';
      case 'used': return '#F59E0B';
      case 'needs repair': return '#EF4444';
      case 'refurbished': return '#8B5CF6';
      default: return '#F59E0B';
    }
  };

  const getConditionText = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new': return t('MARKETPLACE.NEW');
      case 'used': return t('MARKETPLACE.USED');
      case 'needs repair': return t('MARKETPLACE.NEEDS_REPAIR');
      case 'refurbished': return t('MARKETPLACE.REFURBISHED');
      default: return condition || t('MARKETPLACE.CONDITION_UNKNOWN');
    }
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
      <View style={styles.cardImageWrapper}>
        <Image
          source={{ uri: product.images?.[0] || "https://via.placeholder.com/300" }}
          style={styles.cardImage}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator color="#1877f2" size="small" />
          </View>
        )}
      </View>
  
      <View style={styles.cardContent}>
  <View style={styles.topRow}>
    <Text style={styles.cardTitle} numberOfLines={1}>
      {product.name || t("MARKETPLACE.UNTITLED_PRODUCT")}
    </Text>

    {product.brand && (
      <Text style={styles.cardBrand} numberOfLines={1}>
        {product.brand}
      </Text>
    )}

<Text style={styles.cardPrice}>
  {formatPrice(
    product.price,           // Original price value
    product.currency,        // Currency code (YER/USD/SAR)
    product.region === 'south' // Boolean for southern
  )}
</Text>

{(product.isNegotiable || product.negotiable) && (
    <View style={styles.negotiableBadge}>
      <Text style={styles.negotiableText}>
        {t("productSubmission.negotiable")}
      </Text>
    </View>
  )}


  </View>

  <View style={styles.middleRow}>
    {(product.governorate || product.city) && (
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={12} color="#6B7280" />
        <Text style={styles.metaText} numberOfLines={1}>
          {[product.city, product.governorate].filter(Boolean).join(", ")}
        </Text>
      </View>
    )}

    {product.phone && (
      <PhoneLink
        phoneNumber={product.phone}
        style={styles.phoneLink}
        textStyle={styles.phoneText}
        iconSize={12}
        showIcon={true}
      />
    )}
  </View>

<View style={styles.bottomRow}>
  {product.status === "approved" ? (
    <View style={styles.verifiedBadge}>
      {/* <Ionicons name="checkmark-done-outline" size={12} color="#309c78" /> */}
      <Text style={styles.verifiedText}>{t("COMMON.VERIFIED")}</Text>
    </View>
  ) : (
    <View style={styles.pendingBadge}>
      <Ionicons name="time-outline" size={12} color="#F59E0B" />
      <Text style={styles.pendingText}>{t("COMMON.PENDING")}</Text>
    </View>
  )}
</View>




</View>

    </TouchableOpacity>
  );
  
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    width: "100%", // full width row
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
  
  imageLoader: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  cardContent: {
    flex: 1,
  justifyContent: "space-between",
  // gap: 6,
  // paddingTop: 4,
  // paddingBottom: 2,
  },
  topRow: {
  gap: 4,
},

middleRow: {
  // gap: 4,
  // marginTop: 4,
},

bottomRow: {
  marginTop: 6,
  flexDirection: 'row-reverse',
  alignItems: 'left',
},
pendingBadge: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  backgroundColor: "#F3F4F6", // light gray
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
},

pendingText: {
  fontSize: 11,
  fontFamily: "Tajawal-Medium",
  color: "#9CA3AF", // gray text
},

  
  cardTitle: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#309c78",
    marginBottom: 4,
    textAlign: "left",
  },
  
  cardBrand: {
    fontSize: 12,
    fontFamily: "Tajawal-Regular",
    color: "#6B7280",
    marginBottom: 2,
    textAlign: "left",
  },
  
  cardPrice: {
    fontSize: 15,
    fontFamily: "Tajawal-Bold",
    color: "#309c78",
    marginBottom: 4,
    textAlign: "left",
  },
  
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "right",
    gap: 4,
    marginBottom: 2,
  },
  
  metaText: {
    fontSize: 12,
    fontFamily: "Tajawal-Regular",
    color: "#6B7280",
    textAlign: "left",
    flexShrink: 1,
  },
  
  phoneLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  
  phoneText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#4B5563",
    textAlign: "left",
  },
  
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    // width: cardWidth, // Apply cardWidth to container
    marginHorizontal: 8, // Add some horizontal margin
    marginVertical: 8, // Add some vertical margin
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    backgroundColor: "#F8FAFC",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 8,
    fontFamily: "Tajawal-Regular",
  },

  conditionBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newBadge: {
    backgroundColor: "#DCFCE7",
  },
  usedBadge: {
    backgroundColor: "#DBEAFE",
  },
  needs_repairBadge: {
    backgroundColor: "#FEE2E2",
  },
  conditionText: {
    fontSize: 11,
    fontFamily: "Tajawal-Bold",
  },
  newText: {
    color: "#1877f2",
  },
  usedText: {
    color: "#1E40AF",
  },
  needs_repairText: {
    color: "#DC2626",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "left",
    lineHeight: 20,
  },
  priceSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 4,
  },

  negotiableBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    // flexDirection:"row-reverse"
  },
  negotiableText: {
    fontSize: 11,
    fontFamily: "Tajawal-Medium",
    color: "#1877f2",
    // alignItems:"left"
  },
  locationContainer: {
    flexDirection: "row-reverse",
    alignItems: "left",
    gap: 6,
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    flex: 1,
    textAlign: "left",
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "left",
    justifyContent: "left",
  },
  // verifiedBadge: {
  //   flexDirection: "row-reverse",
  //   alignItems: "center",
  //   gap: 4,
  //   backgroundColor: "#10B981",
  //   paddingHorizontal: 8,
  //   paddingVertical: 4,
  //   borderRadius: 8,
  // },
  verifiedText: {
    fontSize: 11,
    fontFamily: "Tajawal-Medium",
    color: "#309c78",
  },
  spacer: {
    flex: 1,
  },
  typeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontFamily: "Tajawal-Medium",
    color: "#475569",
  },
  // New styles for PhoneLink
  phoneContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  phoneText: {
    fontSize: 13,
    fontFamily: 'Tajawal-Medium',
    color: '#4B5563',
  },
  brand: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default ProductCard;
