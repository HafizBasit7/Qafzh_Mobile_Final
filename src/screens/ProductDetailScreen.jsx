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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { getTranslatedType } from '../utils/productTypes';

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const { t } = useTranslation();

  const handleCallSeller = () => {
    Linking.openURL(`tel:${product.phone}`);
  };

  const handleWhatsApp = () => {
    if (product.whatsappPhone) {
      Linking.openURL(`https://wa.me/${product.whatsappPhone}`);
    }
  };

  const currencySymbol = product.currency === "YER" ? "﷼" : "$";

  // Format specifications for display
  const renderSpecifications = () => {
    if (!product.specifications) return null;

    return Object.entries(product.specifications).map(
      ([key, value]) =>
        value && (
          <View style={styles.specItem} key={key}>
            <Text style={styles.specLabel}>{t(`productSubmission.${key}`, key)}:</Text>
            <Text style={styles.specValue}>
              {value || t("PRODUCT.notSpecified")}
            </Text>
          </View>
        )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>تفاصيل المنتج</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Gallery */}
          <View style={styles.imageWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
            >
              {(product.images?.length
                ? product.images
                : ["https://via.placeholder.com/400"]
              ).map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={[styles.productImage, { width }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.headerRow}>
              <Text
                style={[styles.title, isSmallScreen && styles.smallTitle]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              {product.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.featuredText}>
                    {t("PRODUCT.featured")}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.price, isSmallScreen && styles.smallPrice]}>
                {product.price} {currencySymbol}
              </Text>
              {product.isNegotiable && (
                <Text style={styles.negotiableText}>
                  {t("PRODUCT.negotiable")}
                </Text>
              )}
            </View>

            {/* Basic Details */}
            <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
  <MaterialIcons name="category" size={18} color="#64748B" />
  <Text style={styles.detailLabel}>{t("PRODUCT.type")}</Text>
  <Text style={styles.detailValue}>
    {getTranslatedType(product.type, t)}
  </Text>
</View>

              <View style={styles.detailItem}>
                <MaterialIcons name="build" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>{t("PRODUCT.condition")}</Text>
                <Text
                  style={[
                    styles.detailValue,
                    product.condition === "New" && { color: "#10B981" },
                    product.condition === "Used" && { color: "#1877f2" },
                  ]}
                >
                  {product.condition === "New"
                    ? t("MARKETPLACE.NEW")
                    : product.condition === "Used"
                    ? t("MARKETPLACE.USED")
                    : product.condition}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="business-outline" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>{t("MARKETPLACE.BRAND")}</Text>
                <Text style={styles.detailValue}>
                  {product.brand || t("PRODUCT.notSpecified")}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={18} color="#64748B" />
                <Text style={styles.detailLabel}>{t("PRODUCT.location")}</Text>
                <Text style={styles.detailValue}>
                  {product.city}, {product.governorate}
                </Text>
              </View>
            </View>

            {/* Specifications Section */}
            {product.specifications && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isSmallScreen && styles.smallSectionTitle,
                  ]}
                >
                  {t("PRODUCT.specifications")}
                </Text>
                <View style={styles.specificationsContainer}>
                  {renderSpecifications()}
                </View>
              </View>
            )}

            {/* Description Section */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  isSmallScreen && styles.smallSectionTitle,
                ]}
              >
                {t("PRODUCT.details")}
              </Text>
              <Text style={styles.description}>
                {product.description || t("PRODUCT.noDescription")}
              </Text>
            </View>

            {/* Seller Information */}
            <View style={styles.sellerSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  isSmallScreen && styles.smallSectionTitle,
                ]}
              >
                {t("PRODUCT.sellerInfo")}
              </Text>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerText}>
                  <Text style={styles.sellerContact}>
                    <Ionicons name="call-outline" size={14} color="#1877f2" />{" "}
                    {product.phone}
                  </Text>
                  {product.whatsappPhone && (
                    <Text style={styles.sellerContact}>
                      <Ionicons
                        name="logo-whatsapp"
                        size={14}
                        color="#1877f2"
                      />{" "}
                      {product.whatsappPhone}
                    </Text>
                  )}
                  <Text style={styles.sellerLocation}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="#64748B"
                    />{" "}
                    {product.city}, {product.governorate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Product Status */}
            <View style={styles.statusSection}>
              <Text style={styles.statusItem}>
                <Text style={styles.statusLabel}>{t("PRODUCT.status")}:</Text>{" "}
                {product.status}
              </Text>
              <Text style={styles.statusItem}>
                <Text style={styles.statusLabel}>{t("PRODUCT.listedOn")}:</Text>{" "}
                {new Date(product.createdAt).toLocaleDateString()}
              </Text>
              {product.expiresAt && (
                <Text style={styles.statusItem}>
                  <Text style={styles.statusLabel}>
                    {t("PRODUCT.expiresOn")}:
                  </Text>{" "}
                  {new Date(product.expiresAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Fixed Action Bar */}
        <View style={styles.actionBar}>
          {/* <TouchableOpacity style={styles.saveButton}>
            <Ionicons name="bookmark-outline" size={22} color="#1877f2" />
          </TouchableOpacity> */}

          {product.whatsappPhone && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                isSmallScreen && styles.smallSecondaryButton,
              ]}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text
                style={[
                  styles.buttonText,
                  isSmallScreen && styles.smallButtonText,
                ]}
              >
                {t("PRODUCT.whatsapp")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSmallScreen && styles.smallPrimaryButton,
            ]}
            onPress={handleCallSeller}
          >
            <Ionicons name="call-outline" size={18} color="#FFFFFF" />
            <Text
              style={[
                styles.buttonText,
                isSmallScreen && styles.smallButtonText,
              ]}
            >
              {t("PRODUCT.callSeller")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 0,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1877f2",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#FFFFFF",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 100, // Space for action bar
  },
  imageWrapper: {
    height: 300,
    position: "relative",
    marginTop: 0,
  },
  imageGallery: {
    height: 300,
  },
  productImage: {
    height: 300,
  },
  imageIndicator: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginHorizontal: 4,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 24,
    marginTop: -20,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    textAlign: "right",
    flex: 1,
    lineHeight: 28,
  },
  smallTitle: {
    fontSize: 18,
  },
  verifiedBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#10B981",
    marginRight: 4,
  },
  price: {
    fontSize: 24,
    fontFamily: "Tajawal-Bold",
    color: "#1877f2",
    textAlign: "right",
    marginBottom: 20,
  },
  smallPrice: {
    fontSize: 20,
  },
  detailsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  detailItem: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // alignItems: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    marginTop: 8,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Tajawal-Medium",
    color: "#1E293B",
    marginTop: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "right",
  },
  smallSectionTitle: {
    fontSize: 15,
  },
  description: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    color: "#475569",
    lineHeight: 22,
    textAlign: "right",
    
  },
  sellerSection: {
    marginBottom: 20,
  },
  sellerInfo: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 14,
  },
  sellerText: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    textAlign: "right",
  },
  sellerLocation: {
    fontSize: 13,
    fontFamily: "Tajawal-Regular",
    color: "#1877f2",
    textAlign: "right",
    marginTop: 4,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  saveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#1877f2",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginLeft: 10,
  },
  smallPrimaryButton: {
    padding: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Tajawal-Bold",
    fontSize: 15,
    marginRight: 6,
  },
  smallPrimaryButtonText: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  negotiableText: {
    fontSize: 14,
    color: "#10B981",
    marginRight: 10,
    fontFamily: "Tajawal-Medium",
  },
  featuredBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  featuredText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#10B981",
    marginRight: 4,
  },
  specificationsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    
  },
  specItem: {
    // flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  specLabel: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#64748B",
  },
  specValue: {
    fontSize: 14,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
  },
  sellerContact: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#1E293B",
    textAlign: "right",
    marginBottom: 6,
  },
  statusSection: {
    marginTop: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
  },
  statusItem: {
    fontSize: 13,
    fontFamily: "Tajawal-Regular",
    color: "#475569",
    textAlign: "right",
    marginBottom: 6,
  },
  statusLabel: {
    fontFamily: "Tajawal-Medium",
    color: "#1E293B",
  },
  secondaryButton: {
    backgroundColor: "#10B981",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginLeft: 10,
    // flex: product.whatsappPhone ? 1 : 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Tajawal-Bold",
    fontSize: 15,
    marginRight: 6,
  },
  smallButtonText: {
    fontSize: 14,
  },
});
