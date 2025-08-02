import axios from "axios";
import { uploadAPI } from "../utils/imageUpload";
import { showToast } from "../components/common/Toast";
import storage from "../utils/storage";

const BASE_URL = "http://192.168.1.3:5005/api/v1"; 
// const BASE_URL = 'https://srv694651.hstgr.cloud/solar/api/v1'; 

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management state
let authState = {
  token: null,
  isInitialized: false
};

// Function to update token in axios and cache
export const updateApiToken = async (token) => {
  console.log('🔐 updateApiToken called with token:', token ? 'present' : 'null');
  
  authState.token = token;
  authState.isInitialized = true;
  
  if (token) {
    // Set in axios default headers for immediate effect
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Token set in axios default headers');
  } else {
    // Remove from axios default headers
    delete api.defaults.headers.common['Authorization'];
    console.log('🔐 Token removed from axios default headers');
  }
};

// Initialize token on app start
const initializeToken = async () => {
  try {
    console.log('🔐 Initializing token from storage...');
    const token = await storage.getToken();
    if (token) {
      console.log('🔐 Found token in storage, setting up auth');
      await updateApiToken(token);
    } else {
      console.log('🔐 No token found in storage');
      authState.isInitialized = true;
    }
  } catch (error) {
    console.error('🔐 Error initializing token:', error);
    authState.isInitialized = true;
  }
};

// Initialize immediately
initializeToken();

// Request interceptor - simplified to avoid storage reads on every request
api.interceptors.request.use(
  async (config) => {
    try {
      // Wait for initialization if not done yet
      if (!authState.isInitialized) {
        console.log('🔐 Waiting for token initialization...');
        await initializeToken();
      }

      // Token is already set in default headers by updateApiToken
      // Just log for debugging
      const hasAuth = config.headers.Authorization || api.defaults.headers.common['Authorization'];
      console.log('🔐 Request interceptor - Token present:', !!hasAuth);
      
      return config;
    } catch (error) {
      console.error('🔐 Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only data part
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔐 Token expired, clearing auth data');
      
      try {
        // Clear expired token
        await storage.clearAuthData();
        await updateApiToken(null);
        
        // Redirect to login - you might want to use navigation service here
        // For now, we'll just return the error
        return Promise.reject(error);
      } catch (tokenError) {
        console.error('🔐 Error handling token expiration:', tokenError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت.',
        type: 'network'
      });
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
    console.error('API Error:', error.response?.data || error.message);
    
    return Promise.reject({
      ...error.response?.data,
      message: errorMessage,
      status: error.response?.status
    });
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOTP: async (phone, otp) => {
    try {
      console.log('🔐 API verifyOTP starting...');
      const response = await api.post(`/auth/verify-otp/${phone}`, { otp });
      console.log('🔐 API verifyOTP response received');

      // Save token and user data if verification is successful
      if (response?.data?.token) {
        console.log('🔐 OTP verified, saving token and updating axios...');
        await storage.setToken(response.data.token);
        await updateApiToken(response.data.token);
        console.log('🔐 Token saved and axios updated after OTP verification');
      }
      if (response?.data?.user) { 
        await storage.setUserData(response.data.user);
        console.log('🔐 User data saved after OTP verification');
      }

      return response;
    } catch (error) {
      console.error('🔐 API verifyOTP error:', error);
      throw error;
    }
  },
  requestOTP: (phone) => api.post("/auth/request-otp", { phone }),
  login: async (data) => {
   
    try {
      console.log('🔐 API login starting...');
      // Expecting { phone, password }
      const response = await api.post("/auth/login", data);
      console.log('🔐 API login response received');

      // Backend returns: { status: 200, data: { user: {...}, token: "..." }, message: "..." }
      // Response interceptor returns response.data, so we have: { status: 200, data: { user: {...}, token: "..." }, message: "..." }
      
      // Save token and user data and immediately update axios
      if (response?.data?.token) {
        console.log('🔐 Saving token and updating axios...');
        await storage.setToken(response.data.token);
        await updateApiToken(response.data.token); // This sets the token in axios immediately
        console.log('🔐 Token saved and axios updated successfully');
      }
      if (response?.data?.user) { 
        await storage.setUserData(response.data.user);
        console.log('🔐 User data saved successfully');
      }

      return response;
    } catch (error) {
      console.error('🔐 API login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      console.log('🔐 API logout starting...');
      const response = await api.post("/auth/logout");
      // Always clear local storage and token cache regardless of API response
      await storage.clearAuthData();
      await updateApiToken(null);
      console.log('🔐 Logout completed, token cleared');
      return response;
    } catch (error) {
      // Clear local storage and token cache even if API call fails
      console.log('🔐 Logout API failed, clearing token anyway');
      await storage.clearAuthData();
      await updateApiToken(null);
      throw error;
    }
  },
  getProfile: () => {
    console.log('🔐 Getting profile, current auth header:', api.defaults.headers.common['Authorization'] ? 'present' : 'missing');
    return api.get("/auth/profile");
  },
  updateProfile: (data) => {
    console.log('🔐 Updating profile, current auth header:', api.defaults.headers.common['Authorization'] ? 'present' : 'missing');
    return api.put("/auth/update-profile", data);
  },
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get("/marketplace/browse-products", { params }),

  // Enhanced search with filters and keywords
  searchProducts: (params) => api.get("/marketplace/search-products", { params }),

  filterProducts: (params) => api.get("/marketplace/filters-product", { params }),

  getProductById: (id) => api.get(`/marketplace/getOneProduct/${id}`),

  createProduct: async (productData) => {
    console.log('🔐 Creating product, current auth header:', api.defaults.headers.common['Authorization'] ? 'present' : 'missing');
    // Images are already uploaded and URLs are provided in productData.images
    return api.post("/products/post", productData);
  },

  getUserProducts: (params = {}) => {
    console.log('🔐 Getting user products, current auth header:', api.defaults.headers.common['Authorization'] ? 'present' : 'missing');
    console.log('🔐 Getting products from token (no userId needed)');
    return api.get(`/products/user-products`, { params });
  },
  updateProduct: (id, data) => {
    console.log('🔐 Updating product, current auth header:', api.defaults.headers.common['Authorization'] ? 'present' : 'missing');
    return api.patch(`/products/update-products${id}`, data);
  },
  deleteProduct: (id) => {
    console.log('🔐 Deleting product, current auth header:', api.defaults.headers.common['Authorization'] ? 'present' : 'missing');
    return api.delete(`/products/delete-product/${id}`);
  },
  likeProduct: (id) => api.post(`/products/${id}/like`),
  unlikeProduct: (id) => api.delete(`/products/${id}/like`),
};

// Engineers API
export const engineersAPI = {
  getEngineers: (params) => api.get("/marketplace/getAllEngineer", { params }),
  searchEngineers: (params) => api.get("/marketplace/filters-engineer", { params }),
  getEngineerById: (id) => api.get(`/marketplace/getOneEngineer/${id}`),
};

// Shops API
export const shopsAPI = {
  getShops: (params) => api.get("/marketplace/getAllShops", { params }),
  searchShops: (params) => api.get("/marketplace/filters-shop", { params }),
  getShopById: (id) => api.get(`/marketplace/getOneShop/${id}`),
};

// Ads API
export const adsAPI = {
  getAds: (params) => api.get("/marketplace/getAllAds", { params }),
  searchAds: (params) => api.get("/marketplace/filters-ads", { params }),
};

export const getAllAds = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/marketplace/getAllAds`);
    return {
      data: response.data.data || [], // Access nested data property
      total: response.data.total || 0,
      message: response.data.message || '',
      status: response.data.status || 200
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch ads');
  }
};

// Governorates API
export const governoratesAPI = {
  getGovernorates: () => api.get("/marketplace/get/governorate-data"),
};

// Unified search API for all content types
export const searchAPI = {
  searchAll: async (params) => {
    const { search_keyword, ...filters } = params;
    
    // If no search keyword, return empty results
    if (!search_keyword?.trim()) {
      return {
        products: { data: [], total: 0 },
        engineers: { data: [], total: 0 },
        shops: { data: [], total: 0 },
        ads: { data: [], total: 0 }
      };
    }

    try {
      // Make parallel requests for all content types
      const [productsRes, engineersRes, shopsRes, adsRes] = await Promise.allSettled([
        productsAPI.searchProducts({ search_keyword, ...filters }),
        engineersAPI.searchEngineers({ search_keyword, ...filters }),
        shopsAPI.searchShops({ search_keyword, ...filters }),
        adsAPI.searchAds({ search_keyword, ...filters })
      ]);

      return {
        products: productsRes.status === 'fulfilled' ? productsRes.value : { data: [], total: 0 },
        engineers: engineersRes.status === 'fulfilled' ? engineersRes.value : { data: [], total: 0 },
        shops: shopsRes.status === 'fulfilled' ? shopsRes.value : { data: [], total: 0 },
        ads: adsRes.status === 'fulfilled' ? adsRes.value : { data: [], total: 0 }
      };
    } catch (error) {
      console.error('Unified search error:', error);
      throw error;
    }
  }
};

export default api;
