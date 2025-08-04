import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { governoratesAPI } from "../services/api";
import { showToast } from "./common/Toast";

const MarketplaceFilter = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    productType: initialFilters.productType || "",
    condition: initialFilters.condition || "",
    priceRange: initialFilters.priceRange || [0, 1000000],
    governorate: initialFilters.governorate || "",
    sortBy: initialFilters.sortBy || "newest",
  });

  const [governorates, setGovernorates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGovernorates();
  }, []);

  const loadGovernorates = async () => {
    try {
      setLoading(true);
      console.log("governoratesAPI.getGovernorates()");
      const response = await governoratesAPI.getGovernorates();
      console.log("response", response);
      // response = { success, message, data: [...] }
      const data = response?.data || [];

      if (!Array.isArray(data)) {
        throw new Error("Governorates data is not an array");
      }

      setGovernorates(data);
    } catch (error) {
      showToast("error", "Error", "Failed to load governorates");
    } finally {
      setLoading(false);
    }
  };

  const productTypes = [
    { id: "panel", label: t("PRODUCT_TYPES.PANEL") },
    { id: "inverter", label: t("PRODUCT_TYPES.INVERTER") },
    { id: "battery", label: t("PRODUCT_TYPES.BATTERY") },
    { id: "accessory", label: t("PRODUCT_TYPES.ACCESSORY") },
  ];

  const conditions = [
    { id: "new", label: t("MARKETPLACE.NEW") },
    { id: "used", label: t("MARKETPLACE.USED") },
    { id: "needs_repair", label: t("MARKETPLACE.NEEDS_REPAIR") },
  ];

  const sortOptions = [
    { id: "newest", label: t("MARKETPLACE.RECENT") },
    { id: "price_asc", label: t("MARKETPLACE.LOW_TO_HIGH") },
    { id: "price_desc", label: t("MARKETPLACE.HIGH_TO_LOW") },
  ];

  const handleReset = () => {
    setFilters({
      productType: "",
      condition: "",
      priceRange: [0, 1000000],
      governorate: "",
      sortBy: "newest",
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const renderFilterSection = (title, options, selectedValue, onSelect) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedValue === option.id && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option.id && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.title}>{t("COMMON.FILTERS")}</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>{t("COMMON.RESET")}</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Type */}
            {/* {renderFilterSection(
              t("MARKETPLACE.PRODUCT_TYPE"),
              productTypes,
              filters.productType,
              (value) => setFilters({ ...filters, productType: value })
            )} */}

            {/* Condition */}
            {/* {renderFilterSection(
              t("MARKETPLACE.CONDITION"),
              conditions,
              filters.condition,
              (value) => setFilters({ ...filters, condition: value })
            )} */}

            {/* Governorate */}
            {renderFilterSection(
              t("MARKETPLACE.GOVERNORATE"),
              governorates.map((g) => ({ id: g.name, label: g.name })),
              filters.governorate,
              (value) => setFilters({ ...filters, governorate: value })
            )}

            {/* Sort By */}
            {/* {renderFilterSection(
              t("COMMON.SORT_BY"),
              sortOptions,
              filters.sortBy,
              (value) => setFilters({ ...filters, sortBy: value })
            )} */}
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>{t("COMMON.APPLY")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    paddingTop: Platform.OS === "ios" ? 8 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
  },
  resetText: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#2e7d32",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "right",
  },
  optionsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedOption: {
    backgroundColor: "#2e7d32",
    borderColor: "#2e7d32",
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#64748B",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  applyButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
  },
});

export default MarketplaceFilter;
