import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);
export default function EngineerCard({ engineer }) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("EngineerDetail", { engineerId: engineer._id });
  };

  const handleCall = () => {
    // Implement calling functionality
    // Example: Linking.openURL(`tel:${engineer.phone}`)
  };

  return (
    <TouchableOpacity
    style={[styles.card, styles.rtlContainer]} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Engineer Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: engineer.profileImageUrl || "https://via.placeholder.com/60",
          }}
          style={styles.engineerImage}
        />
        <View style={styles.engineerInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.engineerName}>{engineer.name}</Text>
            {engineer.isVerified && (
              <View style={styles.verificationBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#1877f2" />
                <Text style={styles.verifiedText}>{t("COMMON.VERIFIED")}</Text>
              </View>
            )}
          </View>

          <View style={styles.specializationContainer}>
            <MaterialIcons name="engineering" size={16} color="#64748B" />
            <Text style={styles.specialization}>
              {Array.isArray(engineer.specializations)
                ? engineer.specializations.join(", ")
                : ""}
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.location}>
              {engineer.city}, {engineer.governorate}
            </Text>
          </View>
        </View>
      </View>

      {/* Services */}
      <View style={styles.servicesContainer}>
        {engineer.services?.slice(0, 3).map((service, index) => (
          <View key={index} style={styles.serviceBadge}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
        {engineer.services?.length > 3 && (
          <View style={styles.moreBadge}>
            <Text style={styles.moreText}>+{engineer.services.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
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
  rtlContainer: {
    direction: 'rtl', // This is crucial for proper RTL layout
    writingDirection: 'rtl', // For text direction
  },
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  engineerImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginLeft: 0, // Changed from 16 to 0
    marginRight: 16, // Added this
  },
  engineerInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: 'flex-start', // Added this
  },
  engineerName: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    textAlign: "right",
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 0, // Changed from 8 to 0
    marginLeft: 8, // Added this
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: "Tajawal-Medium",
    color: "#ECFDF5",
    marginRight: 4,
  },
  specializationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  specialization: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    color: "#64748B",
    marginRight: 6,
    textAlign: "right",
  },
  locationContainer: {
    flexDirection: "row",
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    justifyContent: 'flex-end', // Added this
  },
  serviceBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  serviceText: {
    fontSize: 12,
    color: "#1877f2",
    fontFamily: "Tajawal-Medium",
  },
  moreBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  moreText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontFamily: "Tajawal-Medium",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  callButton: {
    backgroundColor: "#1877f2",
    flexDirection: "row",
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
