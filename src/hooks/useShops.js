import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { shopsAPI } from '../services/api';
import { useModal } from './useModal';

export const useShops = (filters = {}) => {
  const { showError } = useModal();
  const { search_keyword, ...otherFilters } = filters;
  const shouldUseSearch = !!search_keyword?.trim();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['shops', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { 
        page: pageParam, 
        limit: 10,
        ...filters
      };
      
      let response;
      if (shouldUseSearch) {
        response = await shopsAPI.searchShops(params);
      } else {
        response = await shopsAPI.getShops(params);
      }
      
      return {
        data: response.data || [],
        currentPage: response.currentPage || pageParam,
        totalPages: response.totalPages || 1,
        total: response.total || 0
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.currentPage || !lastPage.totalPages) return undefined;
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onError: (error) => {
      showError('خطأ في جلب المتاجر', error.message || 'فشل في جلب قائمة المتاجر');
    },
  });

  // Flatten the data from infinite query
  const shops = data?.pages?.flatMap(page => page.data) || [];
  const totalCount = data?.pages?.[0]?.total || 0;

  return {
    shops,
    totalCount,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  };
};

// Hook for single shop
export const useShop = (shopId) => {
  const { showError } = useModal();
  
  return useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => shopsAPI.getShopById(shopId),
    enabled: !!shopId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    onError: (error) => {
      showError('خطأ في جلب بيانات المتجر', error.message || 'فشل في جلب بيانات المتجر');
    },
  });
};
