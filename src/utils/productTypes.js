// utils/productTypes.js
export const getTranslatedType = (type, t) => {
    const typeMap = {
      Panel: t("PRODUCT_TYPES.PANEL"),
      Inverter: t("PRODUCT_TYPES.INVERTER"),
      Battery: t("PRODUCT_TYPES.BATTERY"),
      Charger: t("PRODUCT_TYPES.CHARGER"),
      Accessory: t("PRODUCT_TYPES.ACCESSORY"),
      Other: t("PRODUCT_TYPES.OTHER"),
      'Panel bases': t("PRODUCT_TYPES.PANEL_BASES")
    };
  
    return typeMap[type] || type || t("PRODUCT.notSpecified");
  };