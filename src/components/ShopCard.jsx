import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function ShopCard({ shop }) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handlePress = () => {
    navigation.navigate("Shop", { shopId: shop._id });
  };

  const handleCall = () => {
    if (shop.phone) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  const getServiceLabel = (service) => {
    switch (service) {
      case "بيع":
        return t("SERVICES.SELL");
      case "تركيب":
        return t("SERVICES.INSTALL");
      case "إصلاح":
        return t("SERVICES.REPAIR");
      case "صيانة":
        return t("SERVICES.MAINTENANCE");
      case "استشارات":
        return t("SERVICES.CONSULTING");
      default:
        return service;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <Image
          source={{ uri: shop.logoUrl || "https://via.placeholder.com/60" }}
          style={styles.shopLogo}
        />
        <View style={styles.shopInfo}>
          <View style={styles.nameContainer}>
            <Text
              style={styles.shopName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shop.name}
            </Text>
            
             <View style={shop.isVerified ? styles.verificationBadge : styles.unverifiedBadge}>
             <Text style={shop.isVerified ? styles.verifiedText : styles.unverifiedText}>
               {shop.isVerified ? t("COMMON.VERIFIED") : t("COMMON.NOT_VERIFIED")}
             </Text>
           </View>
           
            
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text
              style={styles.location}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shop.city}, {shop.governorate}
            </Text>
          </View>
        </View>
      </View>

      {shop.services?.length > 0 && (
        <View style={styles.servicesContainer}>
          {shop.services.map((service, index) => (
            <View key={`${service}-${index}`} style={styles.serviceBadge}>
              <Text style={styles.serviceText}>{getServiceLabel(service)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call-outline" size={18} color="#FFFFFF" />
          <Text style={styles.callButtonText}>{t("COMMON.CALL")}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  shopLogo: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginLeft: 16,
  },
  shopInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  shopName: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    flexShrink: 1,
    textAlign: "right",
  },
  verificationBadge: {
    flexDirection: "row-reverse",
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
  unverifiedBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#64748B", // light gray background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  
  unverifiedText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#ECFDF5", // gray text
    marginRight: 4,
  },
  
  locationContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    marginRight: 6,
    textAlign: "right",
  },
  servicesContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  serviceBadge: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  serviceText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#166534",
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  callButton: {
    backgroundColor: "#2e7d32",
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontFamily: "Tajawal-Bold",
    fontSize: 14,
    marginRight: 8,
  },
});
