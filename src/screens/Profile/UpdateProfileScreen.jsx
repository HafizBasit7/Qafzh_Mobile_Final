import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import i18n from "../../config/i18n";
import { useAuth } from "../../hooks/useAuth";
import * as ImagePicker from "expo-image-picker";
import { showToast } from "../../components/common/Toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { uploadImage } from "../../../utils/upload";

const UpdateProfileScreen = ({ navigation }) => {
  const { user, isLoadingUser, updateProfile, isUpdating, refetchUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.data?.user?.name || user?.name || "",
    profileImageUrl: user?.data?.user?.profileImageUrl || user?.profileImageUrl || "",
  });
  const [isPickingImage, setIsPickingImage] = useState(false);

  if (isLoadingUser) {
    return <LoadingSpinner />;
  }

  const handleImagePick = async () => {
    try {
      setIsPickingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Upload image using utils/upload.js
        const imageUrl = await uploadImage(result.assets[0], result.assets[0].fileName);
        
        // Update local form data
        setFormData((prev) => ({
          ...prev,
          profileImageUrl: imageUrl,
        }));
        
        // Immediately update the profile to reflect changes in auth state
        await updateProfile({
          name: formData.name,
          profileImageUrl: imageUrl,
        });
        
        // Force refetch user data to ensure latest data is loaded
        setTimeout(() => {
          refetchUser();
        }, 500);
        
        showToast("success", "نجح", "تم تحديث الصورة");
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showToast("error", "خطأ", "فشل في تحميل الصورة");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      showToast("error", "خطأ", "الاسم مطلوب");
      return;
    }

    try {
      await updateProfile(formData);
      // Force refetch user data after update
      setTimeout(() => {
        refetchUser();
      }, 500);
      navigation.goBack();
    } catch (error) {
      showToast("error", "خطأ", error.message || "فشل في تحديث الملف الشخصي");
    }
  };

  // Get current user data with fallback
  const currentUser = user?.data?.user || user;
  
  // Use current form data or user data with timestamp for image refresh
  const displayImageUrl = formData.profileImageUrl 
    ? `${formData.profileImageUrl}?timestamp=${Date.now()}`
    : "https://via.placeholder.com/120";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#22C55E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تحديث الملف الشخصي</Text>
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={isUpdating}
          style={styles.saveButtonContainer}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#22C55E" />
          ) : (
            <Text style={styles.saveButton}>حفظ</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: displayImageUrl,
          }}
          style={styles.avatar}
        />
        <TouchableOpacity
          style={styles.editAvatarButton}
          onPress={handleImagePick}
          disabled={isPickingImage}
        >
          {isPickingImage ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="camera" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>الاسم الكامل</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="أدخل اسمك الكامل"
            placeholderTextColor="#a0aec0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>رقم الهاتف</Text>
          <TextInput
            style={[styles.input, { color: "#a0aec0" }]}
            value={currentUser?.phone}
            editable={false}
          />
          <Text style={styles.helperText}>لا يمكن تغيير رقم الهاتف</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#32325d",
  },
  saveButtonContainer: {
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    fontSize: 16,
    fontFamily: "Tajawal-Medium",
    color: "#22C55E",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#f0f2f5",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#22C55E",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#525f7f",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    color: "#32325d",
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Tajawal-Regular",
    color: "#a0aec0",
    marginTop: 4,
  },
});

export default UpdateProfileScreen;
