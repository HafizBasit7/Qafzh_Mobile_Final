import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useEngineers, useEngineer } from "../hooks/useEngineers";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ImageViewerModal from "../components/ImageViewerModal";

const { width } = Dimensions.get("window");

const EngineerDetailScreen = ({ navigation, route }) => {
  const { engineerId } = route.params;
  const { t } = useTranslation();
  const {
    data: engineerResponse,
    isLoading,
    isError,
    error,
  } = useEngineer(engineerId);

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const engineer = engineerResponse?.data || engineerResponse || {};

  const handleCall = () => Linking.openURL(`tel:${engineer?.phone}`);
  const handleWhatsApp = () =>
    Linking.openURL(`https://wa.me/${engineer?.whatsappPhone}`);
  const handleEmail = () => Linking.openURL(`mailto:${engineer?.email}`);

  const formatWorkingDays = (days) => {
    if (!days) return t("ENGINEER.notAvailable");
    return days.join(", ");
  };

  const renderCertification = ({ item }) => (
    <View style={styles.certificationCard}>
      <View style={styles.certificationHeader}>
        <MaterialIcons name="school" size={20} color="#2e7d32" />
        <Text style={styles.certificationName}>{item.name}</Text>
      </View>
      <Text style={styles.certificationDetail}>{item.issuedBy}</Text>
      <Text style={styles.certificationDetail}>
        {t("ENGINEER.issued")}: {new Date(item.issuedDate).toLocaleDateString()}
      </Text>
      {item.expiryDate && (
        <Text style={styles.certificationDetail}>
          {t("ENGINEER.expires")}:{" "}
          {new Date(item.expiryDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderPortfolioImage = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedImage(item);
        setImageViewerVisible(true);
      }}
    >
      <Image
        source={{ uri: item }}
        style={styles.portfolioImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error?.message || t("ENGINEER.loadError")}
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

  if (!engineer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("ENGINEER.notFound")}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>{t("COMMON.BACK")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={{
              uri:
                engineer.profileImageUrl || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.headerContent}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{engineer.name}</Text>
              {engineer.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={16} color="#10B981" />
                  <Text style={styles.verifiedText}>
                    {t("COMMON.VERIFIED")}
                  </Text>
                </View>
              )}
              {engineer.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.featuredText}>
                    {t("ENGINEER.featured")}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.specialization}>
              {engineer.specializations?.join(", ")}
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

          {engineer.whatsappPhone && (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>{t("ENGINEER.whatsapp")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("ENGINEER.info")}</Text>

          <View style={styles.infoCard}>
            {/* <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color="#2e7d32" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailText}>
                  {engineer.address}, {engineer.city}, {engineer.governorate}
                </Text>
              </View>
            </View> */}

            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={20} color="#2e7d32" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailText}>{engineer.phone}</Text>
              </View>
            </View>

            {engineer.whatsappPhone && (
              <View style={styles.detailRow}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailText}>
                    {engineer.whatsappPhone}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <MaterialIcons name="email" size={20} color="#2e7d32" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailText}>{engineer.email}</Text>
              </View>
            </View>

            {engineer.notes && (
              <View style={styles.detailRow}>
                <MaterialIcons name="notes" size={20} color="#2e7d32" />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailText}>{engineer.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Services Section */}
        {engineer.services && engineer.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("ENGINEERS.SERVICES")}</Text>
            <View style={styles.servicesContainer}>
              {engineer.services.map((service, index) => (
                <View key={index} style={styles.serviceBadge}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience Section */}
        {engineer.experience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("ENGINEER.experience")}</Text>
            <View style={styles.infoCard}>
              {typeof engineer.experience === "object" ? (
                <>
                  {engineer.experience.years && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="cash"
                        size={20}
                        color="#2e7d32"
                      />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailText}>
                          {engineer.experience.years} {t("ENGINEERS.YEARS")}
                        </Text>
                      </View>
                    </View>
                  )}
                  {engineer.experience.description && (
                    <View style={styles.detailRow}>
                      <MaterialIcons
                        name="description"
                        size={20}
                        color="#2e7d32"
                      />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailText}>
                          {engineer.experience.description}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={20}
                    color="#2e7d32"
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailText}>{engineer.experience}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Certifications Section */}
        {engineer.certifications && engineer.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("ENGINEER.certifications")}
            </Text>
            <FlatList
              data={engineer.certifications}
              renderItem={renderCertification}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Portfolio Section */}
        {engineer.portfolio && engineer.portfolio.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("ENGINEER.portfolio")}</Text>
            <FlatList
              data={engineer.portfolio}
              renderItem={renderPortfolioImage}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.portfolioContainer}
            />
          </View>
        )}
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
  profileImage: {
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
    marginRight: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#10B981",
    marginRight: 4,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#F59E0B",
    marginRight: 4,
  },
  specialization: {
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
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
    backgroundColor: "#2e7d32",
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
  whatsappButton: {
    flex: 1,
    backgroundColor: "#25D366",
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
    color: "#166534",
    fontFamily: "Tajawal-Medium",
  },
  certificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  certificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  certificationName: {
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    marginRight: 8,
    flex: 1,
    textAlign: "right",
  },
  certificationDetail: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    marginBottom: 4,
    textAlign: "right",
  },
  portfolioContainer: {
    paddingRight: 20,
  },
  portfolioImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
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
    backgroundColor: "#2e7d32",
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

export default EngineerDetailScreen;
