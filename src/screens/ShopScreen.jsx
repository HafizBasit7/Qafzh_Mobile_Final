import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  useWindowDimensions,
  Platform,
  SafeAreaView,
  Image,
  I18nManager
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useShops, useShop } from "../hooks/useShops";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ImageViewerModal from "../components/ImageViewerModal";

// Force RTL if not already set
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const ShopScreen = ({ navigation, route }) => {
  const { shopId } = route.params;
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { data: shopResponse, isLoading, isError, error } = useShop(shopId);

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const shop = shopResponse?.data || shopResponse || {};

  const handleCall = () => Linking.openURL(`tel:${shop?.phone}`);
  const handleDirections = () => {
    if (shop?.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${shop.location.latitude},${shop.location.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleSocialMedia = (url) => {
    if (url) Linking.openURL(url);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error?.message || t("SHOP.loadError")}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>{t("COMMON.BACK")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("SHOP.notFound")}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>{t("COMMON.BACK")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderWorkingHours = () => {
    if (!shop.workingHours) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("SHOP.workingHours")}</Text>
        <View style={styles.infoCard}>
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={20} color="#1877f2" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailText}>
                {shop.workingHours.openTime} - {shop.workingHours.closeTime}
              </Text>
            </View>
          </View>
          {shop.workingHours.workingDays?.length > 0 && (
            <View style={styles.workingDaysContainer}>
              {shop.workingHours.workingDays.map((day, index) => (
                <View key={index} style={styles.workingDayBadge}>
                  <Text style={styles.workingDayText}>{day}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSocialMedia = () => {
    if (!shop.socialMedia || Object.keys(shop.socialMedia).length === 0)
      return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("SHOP.socialMedia")}</Text>
        <View style={styles.infoCard}>
          <View style={styles.socialMediaContainer}>
            {shop.socialMedia.facebook && (
              <TouchableOpacity
                style={styles.socialMediaButton}
                onPress={() => handleSocialMedia(shop.socialMedia.facebook)}
              >
                <Ionicons name="logo-facebook" size={24} color="#1877f2" />
              </TouchableOpacity>
            )}
            {shop.socialMedia.instagram && (
              <TouchableOpacity
                style={styles.socialMediaButton}
                onPress={() => handleSocialMedia(shop.socialMedia.instagram)}
              >
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              </TouchableOpacity>
            )}
            {shop.socialMedia.twitter && (
              <TouchableOpacity
                style={styles.socialMediaButton}
                onPress={() => handleSocialMedia(shop.socialMedia.twitter)}
              >
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderImages = () => {
    if (!shop.images || shop.images.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("SHOP.gallery")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContainer}
        >
          {shop.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedImage(image);
                setImageViewerVisible(true);
              }}
            >
              <Image
                source={{ uri: image }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBrands = () => {
    if (!shop.brands || shop.brands.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("SHOP.brands")}</Text>
        <View style={styles.infoCard}>
          <View style={styles.brandsContainer}>
            {shop.brands.map((brand, index) => (
              <View key={index} style={styles.brandBadge}>
                <Text style={styles.brandText}>{brand}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderProductCategories = () => {
    if (!shop.productCategories || shop.productCategories.length === 0)
      return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("SHOP.productCategories")}</Text>
        <View style={styles.infoCard}>
          <View style={styles.categoriesContainer}>
            {shop.productCategories.map((category, index) => (
              <View key={index} style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderAdditionalInfo = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("SHOP.additionalInfo")}</Text>
        <View style={styles.infoCard}>
          {shop.establishedYear && (
            <View style={styles.detailRow}>
              <MaterialIcons name="business" size={20} color="#1877f2" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailText}>
                  {t("SHOP.establishedYear")}: {shop.establishedYear}
                </Text>
              </View>
            </View>
          )}
          {shop.licenseNumber && (
            <View style={styles.detailRow}>
              <MaterialIcons name="verified" size={20} color="#1877f2" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailText}>
                  {t("SHOP.licenseNumber")}: {shop.licenseNumber}
                </Text>
              </View>
            </View>
          )}
          {shop.website && (
            <View style={styles.detailRow}>
              <MaterialIcons name="language" size={20} color="#1877f2" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailText}>{shop.website}</Text>
              </View>
            </View>
          )}
          {shop.notes && (
            <View style={styles.detailRow}>
              <MaterialIcons name="notes" size={20} color="#1877f2" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailText}>{shop.notes}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={{ uri: shop.logoUrl || "https://via.placeholder.com/150" }}
            style={styles.shopLogo}
            resizeMode="cover"
          />
          <View style={styles.headerContent}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{shop.name}</Text>
              {shop.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={16} color="#10B981" />
                  <Text style={styles.verifiedText}>
                    {t("COMMON.VERIFIED")}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.location}>
              {shop.city}, {shop.governorate}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>{t("COMMON.CALL")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleDirections}
          >
            <Ionicons name="location-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>{t("SHOP.directions")}</Text>
          </TouchableOpacity>
        </View>

        {/* Services Section */}
        {shop.services && shop.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("SHOP.servicesProvided")}
            </Text>
            <View style={styles.infoCard}>
              <View style={styles.servicesContainer}>
                {shop.services.map((service, index) => (
                  <View key={index} style={styles.serviceBadge}>
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Working Hours */}
        {renderWorkingHours()}

        {/* Social Media */}
        {renderSocialMedia()}

        {/* Images */}
        {renderImages()}

        {/* Brands */}
        {renderBrands()}

        {/* Product Categories */}
        {renderProductCategories()}

        {/* Additional Info */}
        {renderAdditionalInfo()}
      </ScrollView>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUrl={selectedImage}
        onClose={() => setImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    paddingBottom: 20,
    direction: 'rtl',
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    
  },
  shopLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 16,
  },
  headerContent: {
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    textAlign: "center",
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#10B981",
    marginRight: 4,
  },
  location: {
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    
  },
  contactButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: "#1877f2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Tajawal-Bold",
    fontSize: 14,
    marginRight: 8,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "right",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    color: "#374151",
    textAlign: "right",
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceBadge: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  serviceText: {
    fontSize: 14,
    color: "#1877f2",
    fontFamily: "Tajawal-Medium",
  },
  workingDaysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  workingDayBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  workingDayText: {
    fontSize: 12,
    color: "#1877f2",
    fontFamily: "Tajawal-Medium",
  },

  socialMediaContainer: {
    flexDirection: "row",
    gap: 16,
  },
  socialMediaButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imagesContainer: {
    paddingRight: 20,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  brandsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  brandBadge: {
    backgroundColor: "#1877f2",
    borderColor: "#1877f2",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  brandText: {
    fontSize: 14,
    color: "#EFF6FF",
    fontFamily: "Tajawal-Medium",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryText: {
    fontSize: 14,
    color: "#1877f2",
    fontFamily: "Tajawal-Medium",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
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
});

export default ShopScreen;
