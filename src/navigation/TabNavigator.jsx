import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, AntDesign, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import MarketplaceScreen from "../screens/MarketplaceScreen";
import SolarCalculator from "../screens/SolarCalculator";
import ProductSubmissionScreen from "../screens/ProductSubmissionScreen";
import AdsScreen from "../screens/AdsScreen";
import ProfileStack from "./ProfileStack";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const scaleSize = (size) => {
  const scaleFactor = isTablet ? 1.3 : isSmallDevice ? 0.9 : 0.9;
  return size * scaleFactor;
};

const scaleFont = (size) => {
  const scaleFactor = isTablet ? 1.2 : isSmallDevice ? 0.95 : 0.9;
  return size * scaleFactor;
};

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1877f2",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontFamily: "Tajawal-Bold",
          fontSize: scaleFont(11),
          marginBottom: scaleSize(3),
          paddingBottom: scaleSize(2),
        },
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: insets.bottom + scaleSize(8),
            height: 60 + insets.bottom + scaleSize(16),
          },
        ],
        tabBarItemStyle: {
          paddingVertical: scaleSize(8),
        },
      }}
    >
      {/* Marketplace - Available to all */}
      <Tab.Screen
        name="MarketplaceTab"
        component={MarketplaceScreen}
        options={{
          title: t("MARKETPLACE.TITLE"),
          tabBarLabel: "السوق",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="solar-panel-large"
              size={scaleSize(24)}
              color={color}
            />
          ),
        }}
      />

      {/* Calculator - Available to all */}
      <Tab.Screen
        name="CalculatorTab"
        component={SolarCalculator}
        options={{
          title: t("CALCULATOR.TITLE"),
          tabBarLabel: "الحاسبة",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator"
              size={scaleSize(24)}
              color={color}
            />
          ),
        }}
      />

      {/* Product Submission - Will handle auth internally */}
      <Tab.Screen
        name="ProductSubmissionTab"
        component={ProductSubmissionScreen}
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.addButton, focused && styles.addButtonFocused]}
            >
              <AntDesign name="plus" size={scaleSize(24)} color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* Ads - Available to all */}
      <Tab.Screen
        name="OffersTab"
        component={AdsScreen}
        options={{
          title: t("OFFERS.TITLE"),
          tabBarLabel: "العروض",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="tag" size={scaleSize(24)} color={color} />
          ),
        }}
      />

      {/* Profile - Will handle auth internally */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: t("PROFILE.TITLE"),
          tabBarLabel: "الملف الشخصي",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={scaleSize(24)} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: scaleSize(5),
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addButton: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(25),
    backgroundColor: "#1877f2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: scaleSize(-10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonFocused: {
    backgroundColor: "#1877f2",
    transform: [{ scale: 1.1 }],
  },
});
