import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { engineersAPI } from '../services/api';
import { useModal } from './useModal';

export const useEngineers = (filters = {}) => {
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
    queryKey: ['engineers', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { 
        page: pageParam, 
        limit: 10,
        ...filters
      };
      
      let response;
      if (shouldUseSearch) {
        response = await engineersAPI.searchEngineers(params);
      } else {
        response = await engineersAPI.getEngineers(params);
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
      showError('خطأ في جلب المهندسين', error.message || 'فشل في جلب قائمة المهندسين');
    },
  });

  // Flatten the data from infinite query
  const engineers = data?.pages?.flatMap(page => page.data) || [];
  const totalCount = data?.pages?.[0]?.total || 0;

  return {
    engineers,
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

// Hook for single engineer
export const useEngineer = (engineerId) => {
  const { showError } = useModal();
  
  return useQuery({
    queryKey: ['engineer', engineerId],
    queryFn: () => engineersAPI.getEngineerById(engineerId),
    enabled: !!engineerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    onError: (error) => {
      showError('خطأ في جلب بيانات المهندس', error.message || 'فشل في جلب بيانات المهندس');
    },
  });
};