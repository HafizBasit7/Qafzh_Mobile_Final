import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, updateApiToken } from '../services/api';
import storage from '../utils/storage';
import { useModal } from './useModal';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useModal();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 useAuth: Initializing auth state...');
        const token = await storage.getToken();
        const userData = await storage.getUserData();
        
        if (token && userData) {
          console.log('🔐 useAuth: Found existing auth data, updating API token');
          // Update API token cache
          await updateApiToken(token);
          
          // Set initial data in query cache
          queryClient.setQueryData(['user'], {
            data: { user: userData },
            token
          });
          console.log('🔐 useAuth: Auth state initialized successfully');
        } else {
          console.log('🔐 useAuth: No existing auth data found');
        }
      } catch (error) {
        console.error('🔐 useAuth: Error initializing auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Get user profile - disabled by default to prevent infinite refreshing
  const { 
    data: user, 
    isLoading: isLoadingUser,
    isError: isUserError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        console.log('🔐 useAuth: Fetching user profile...');
        const response = await authAPI.getProfile();
        
        // Update AsyncStorage with fresh user data
        if (response?.data?.user) {
          await storage.setUserData(response.data.user);
          console.log('🔐 useAuth: Profile fetched and stored successfully');
        }
        
        return response;
      } catch (error) {
        console.log('🔐 useAuth: Profile fetch failed, clearing stored data');
        // If profile fetch fails, clear stored data
        await storage.clearAuthData();
        await updateApiToken(null);
        throw error;
      }
    },
    enabled: false, // Disabled by default - only refetch manually when needed
    retry: false,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    cacheTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data) => authAPI.register(data),
    onSuccess: () => {
      showSuccess('تم التسجيل بنجاح', 'تم إرسال رمز التحقق إلى هاتفك.');
    },
    onError: (error) => {
      // Handle "user already exists" error specifically
      if (error.message && error.message.includes('already exists')) {
        showError('المستخدم موجود', 'هذا الرقم مسجل مسبقاً. يرجى تسجيل الدخول بدلاً من ذلك.');
      } else {
        showError('فشل التسجيل', error.message || 'حدث خطأ أثناء التسجيل');
      }
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: async ({ phone, otp }) => {
      console.log('🔐 useAuth: Verifying OTP...');
      const response = await authAPI.verifyOTP(phone, otp);
      
      // The token is already saved and API updated in authAPI.verifyOTP
      // Just update the query cache
      if (response?.data?.token && response?.data?.user) {
        console.log('🔐 useAuth: Updating query cache after OTP verification...');
        
        // Update query cache with new data immediately
        queryClient.setQueryData(['user'], {
          data: { user: response.data.user },
          token: response.data.token
        });
        
        // Also invalidate and refetch to get fresh data
        queryClient.invalidateQueries(['user']);
        console.log('🔐 useAuth: OTP verification completed successfully');
      }
      
      return response;
    },
    onSuccess: (response) => {
      showSuccess('تم التحقق بنجاح', 'تم تأكيد رقم الهاتف بنجاح.');
      
      // Force immediate auth state update
      if (response?.data?.user) {
        queryClient.setQueryData(['user'], {
          data: { user: response.data.user },
          token: response.data.token
        });
      }
    },
    onError: (error) => {
      const errorMessage = error?.message || error?.data?.message || 'رمز التحقق غير صحيح';
      showError('فشل التحقق', errorMessage);
    },
  });

  // Request OTP mutation
  const requestOTPMutation = useMutation({
    mutationFn: (phone) => authAPI.requestOTP(phone),
    onSuccess: () => {
      showSuccess('تم الإرسال', 'تم إرسال رمز التحقق إلى هاتفك.');
    },
    onError: (error) => {
      showError('فشل الإرسال', error.message || 'فشل في إرسال رمز التحقق');
    },
  });

  // Login mutation  
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      // Expecting { phone, password }
      console.log('🔐 useAuth: Starting login process...');
      const response = await authAPI.login(credentials);
      console.log('🔐 useAuth: Login API call completed');
      
      // The token is already saved and API updated in authAPI.login
      // Just update the query cache
      if (response?.data?.token && response?.data?.user) {
        console.log('🔐 useAuth: Updating query cache after login...');
        
        // Update query cache with new data immediately
        queryClient.setQueryData(['user'], {
          data: { user: response.data.user },
          token: response.data.token
        });
        
        // Also invalidate and refetch to get fresh data
        queryClient.invalidateQueries(['user']);
        console.log('🔐 useAuth: Login process completed successfully');
      }
      
      return response;
    },
    onSuccess: (response) => {
      console.log('🔐 useAuth: Login mutation success');
      showSuccess('تم تسجيل الدخول', 'مرحباً بك مرة أخرى!');
      
      // Force immediate auth state update
      if (response?.data?.user) {
        queryClient.setQueryData(['user'], {
          data: { user: response.data.user },
          token: response.data.token
        });
        
        // Force invalidate to trigger re-renders
        queryClient.invalidateQueries(['user']);
      }
    },
    onError: (error) => {
      console.log('🔐 useAuth: Login mutation error:', error);
      const errorMessage = error?.message || error?.data?.message || 'بيانات الدخول غير صحيحة';
      showError('فشل تسجيل الدخول', errorMessage);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      console.log('🔐 useAuth: Starting profile update...');
      return authAPI.updateProfile(data);
    },
    onSuccess: async (response) => {
      console.log('🔐 useAuth: Profile update successful');
      // Update stored user data immediately  
      if (response?.data?.user) {
        await storage.setUserData(response.data.user);
        
        // Update query cache immediately with fresh data
        queryClient.setQueryData(['user'], {
          data: { user: response.data.user },
          token: await storage.getToken()
        });
        
        // Force invalidate and refetch to ensure all components update
        queryClient.invalidateQueries(['user']);
        
        console.log('🔐 useAuth: Profile updated successfully:', response.data.user);
      }
      
      showSuccess('تم التحديث', 'تم تحديث ملفك الشخصي بنجاح.');
    },
    onError: (error) => {
      console.log('🔐 useAuth: Profile update failed:', error);
      const errorMessage = error?.message || error?.data?.message || 'فشل في تحديث الملف الشخصي';
      showError('فشل التحديث', errorMessage);
    },
  });

  // Logout function
  const logout = async () => {
    try {
      console.log('🔐 useAuth: Starting logout...');
      await authAPI.logout(); // This already calls updateApiToken(null)
    } catch (error) {
      // Logout from frontend even if backend call fails
      console.error('🔐 useAuth: Logout error:', error);
    } finally {
      // Clear local storage and cache
      console.log('🔐 useAuth: Clearing auth data and cache...');
      await storage.clearAuthData();
      await updateApiToken(null);
      queryClient.clear();
      console.log('🔐 useAuth: Logout completed');
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    const token = await storage.getToken();
    return !!token;
  };

  // Get current user data from cache or storage
  const currentUser = user?.data?.user || null;

  // Computed auth states with forced refresh capability
  const isAuthenticated = !!currentUser;
  const isVerified = currentUser?.isVerified || false;

  // Manual refresh function to force auth state update
  const refreshAuthState = async () => {
    try {
      console.log('🔐 useAuth: Manually refreshing auth state...');
      const token = await storage.getToken();
      const userData = await storage.getUserData();
      
      console.log('🔐 useAuth: Auth refresh data:', { token: !!token, userData: !!userData });
      
      if (token && userData) {
        await updateApiToken(token); // Update API token cache
        
        queryClient.setQueryData(['user'], {
          data: { user: userData },
          token
        });
        
        // Force invalidate to trigger all dependent components
        queryClient.invalidateQueries(['user']);
        
        console.log('🔐 useAuth: Auth state refreshed successfully');
        return true;
      }
      
      console.log('🔐 useAuth: No auth data found during refresh');
      await updateApiToken(null);
      return false;
    } catch (error) {
      console.error('🔐 useAuth: Error refreshing auth state:', error);
      return false;
    }
  };

  return {
    // User data
    user,
    currentUser,
    isLoadingUser,
    isUserError,
    isInitialized,
    
    // Auth states
    isAuthenticated,
    isVerified,
    
    // Functions
    checkAuth,
    logout,
    refetchUser,
    refreshAuthState, // Force auth state refresh
    
    // Mutations
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    
    verifyOTP: verifyOTPMutation.mutate,
    isVerifyingOTP: verifyOTPMutation.isPending,
    
    requestOTP: requestOTPMutation.mutate,
    isRequestingOTP: requestOTPMutation.isPending,
    
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
};