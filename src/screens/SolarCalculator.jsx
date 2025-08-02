import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const defaultAppliances = [
  { name: "CALCULATOR.APPLIANCES.LIGHT", key: "lights", watt: 12 },
  { name: "CALCULATOR.APPLIANCES.FAN", key: "fans", watt: 70 },
  {
    name: "CALCULATOR.APPLIANCES.REFRIGERATOR",
    key: "refrigerator",
    watt: 200,
  },
  { name: "CALCULATOR.APPLIANCES.IRON", key: "iron", watt: 1200 },
  { name: "CALCULATOR.APPLIANCES.OTHER", key: "other", watt: 0 },
];

const SUN_HOURS = 5;
const PANEL_EFFICIENCY = 0.8;
const BATTERY_VOLTAGE = 12;
const BATTERY_DOD = 0.5;

export default function SolarCalculator() {
  const { t } = useTranslation();
  const [appliances, setAppliances] = useState(
    defaultAppliances.map((a) => ({
      ...a,
      quantity: 0,
      hours: 0,
      watt: a.watt,
    }))
  );
  const [results, setResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Reset calculator when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Cleanup function - runs when screen loses focus
        setResults(null);
        setAppliances(
          defaultAppliances.map((a) => ({
            ...a,
            quantity: 0,
            hours: 0,
            watt: a.watt,
          }))
        );
      };
    }, [])
  );

  const handleChange = (idx, field, value) => {
    let numericValue = Number(value) || 0;

    // Validate hours to not exceed 24
    if (field === "hours" && numericValue > 24) {
      numericValue = 24;
    }

    // Validate quantity and watt to not be negative
    if ((field === "quantity" || field === "watt") && numericValue < 0) {
      numericValue = 0;
    }

    const updated = appliances.map((a, i) =>
      i === idx ? { ...a, [field]: numericValue } : a
    );
    setAppliances(updated);
  };

  const canCalculate = appliances.some((a) => a.quantity > 0 && a.hours > 0);

  const handleCalculate = () => {
    const totalDailyWh = appliances.reduce(
      (sum, a) => sum + a.watt * a.quantity * a.hours,
      0
    );
    const peakLoad = appliances.reduce(
      (sum, a) => sum + a.watt * a.quantity,
      0
    );
    const requiredPanelWatt = totalDailyWh / (SUN_HOURS * PANEL_EFFICIENCY);
    const panelWatt = 550;
    const numPanels = Math.ceil(requiredPanelWatt / panelWatt);
    const batteryAh = Math.ceil(totalDailyWh / (BATTERY_VOLTAGE * BATTERY_DOD));
    const inverterWatt = Math.ceil(peakLoad * 1.25);

    setResults({
      totalDailyWh: Math.round(totalDailyWh),
      peakLoad: Math.round(peakLoad),
      requiredPanelWatt: Math.ceil(requiredPanelWatt),
      numPanels,
      panelWatt,
      batteryAh,
      inverterWatt,
    });
    setShowResultsModal(true);
  };

  return (
    <View style={styles.container}>


      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Calculator Card */}
        <View style={styles.calculatorCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="calculate" size={24} color="#02ff04" />
            <Text style={styles.cardTitle}>إدخال البيانات</Text>
          </View>

          {/* Appliances Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>الجهاز</Text>
              <Text style={styles.headerText}>الكمية</Text>
              <Text style={styles.headerText}>الواط</Text>
              <Text style={styles.headerText}>الساعات</Text>
            </View>

            {appliances.map((appliance, idx) => (
              <View key={appliance.key} style={styles.tableRow}>
                <Text style={styles.applianceName}>{t(appliance.name)}</Text>

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={appliance.quantity.toString()}
                  onChangeText={(value) => handleChange(idx, "quantity", value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={appliance.watt.toString()}
                  onChangeText={(value) => handleChange(idx, "watt", value)}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  editable={appliance.key === "other"}
                />

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={appliance.hours.toString()}
                  onChangeText={(value) => handleChange(idx, "hours", value)}
                  placeholder="0-24"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ))}
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[
              styles.calculateButton,
              !canCalculate && styles.disabledButton,
            ]}
            onPress={handleCalculate}
            disabled={!canCalculate}
          >
            <MaterialIcons name="calculate" size={20} color="#FFFFFF" />
            <Text style={styles.calculateButtonText}>حساب</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Results Modal */}
      <Modal
        visible={showResultsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResultsModal(false)}
      >
       
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="solar-power" size={28} color="#02ff04" />
              <Text style={styles.modalTitle}>نتائج الحساب</Text>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {results && (
                <>
                  <View style={styles.resultCard}>
                    <MaterialIcons name="flash-on" size={20} color="#02ff04" />
                    <View style={styles.resultContent}>
                      <Text style={styles.resultLabel}>
                        إجمالي الطاقة اليومية
                      </Text>
                      <Text style={styles.resultValue}>
                        {results.totalDailyWh} واط/ساعة
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultCard}>
                    <MaterialIcons name="speed" size={20} color="#02ff04" />
                    <View style={styles.resultContent}>
                      <Text style={styles.resultLabel}>أقصى حمل</Text>
                      <Text style={styles.resultValue}>
                        {results.peakLoad} واط
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultCard}>
                    <MaterialIcons name="grid-on" size={20} color="#02ff04" />
                    <View style={styles.resultContent}>
                      <Text style={styles.resultLabel}>الألواح الشمسية</Text>
                      <Text style={styles.resultValue}>
                        {results.numPanels} لوح × {results.panelWatt} واط
                      </Text>
                      <Text style={styles.resultSubtext}>
                        إجمالي: {results.requiredPanelWatt} واط
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultCard}>
                    <MaterialIcons
                      name="battery-charging-full"
                      size={20}
                      color="#02ff04"
                    />
                    <View style={styles.resultContent}>
                      <Text style={styles.resultLabel}>حجم البطارية</Text>
                      <Text style={styles.resultValue}>
                        {results.batteryAh} أمبير/ساعة
                      </Text>
                      <Text style={styles.resultSubtext}>
                        بطارية 12 فولت، تفريغ 50%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultCard}>
                    <MaterialIcons name="power" size={20} color="#02ff04" />
                    <View style={styles.resultContent}>
                      <Text style={styles.resultLabel}>حجم المحول</Text>
                      <Text style={styles.resultValue}>
                        {results.inverterWatt} واط
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setShowResultsModal(false)}
            >
              <Text style={styles.okButtonText}>حسناً</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  calculatorCard: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Tajawal-Bold",
    color: "#1F2937",
  },
  tableContainer: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Tajawal-Bold",
    color: "#374151",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  applianceName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#1F2937",
    textAlign: "right",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#02ff04",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Tajawal-Bold",
    color: "#1F2937",
  },
  modalContent: {
    padding: 20,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 14,
    fontFamily: "Tajawal-Medium",
    color: "#6B7280",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  resultSubtext: {
    fontSize: 12,
    fontFamily: "Tajawal-Regular",
    color: "#9CA3AF",
  },
  okButton: {
    backgroundColor: "#02ff04",
    paddingVertical: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  okButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
  },
});
