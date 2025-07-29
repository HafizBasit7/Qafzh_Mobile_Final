import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, engineersAPI, shopsAPI } from '../services/api';
import { showToast } from '../components/common/Toast';
import { useState } from 'react';

export const useMarketplace = (filters = {}, type = 'all') => {
  const queryClient = useQueryClient();
  const limit = 10;
  const [activeTab, setActiveTab] = useState('all');

  // Helper function to process paginated response
  const processResponse = (response) => {
    if (!response) {
      return { data: [], currentPage: 1, totalPages: 1, total: 0 };
    }

    return {
      data: response.data || [],
      currentPage: response.currentPage || 1,
      totalPages: response.totalPages || 1,
      total: response.total || 0
    };
  };

  // Products Query
  const productsQuery = useInfiniteQuery({
    queryKey: ['marketplace', 'products', activeTab, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        limit,
        status: 'approved',
        ...(activeTab !== 'all' && {
          type:
            activeTab === 'solarPanels' ? 'Panel' :
            activeTab === 'inverters' ? 'Inverter' :
            activeTab === 'batteries' ? 'Battery' : ''
        }),
        ...filters
      };

      try {
        const response = await productsAPI.getProducts(params);
        return processResponse(response);
      } catch (error) {
        console.error('Products query error:', error);
        return { data: [], currentPage: pageParam, totalPages: 1, total: 0 };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages 
        ? lastPage.currentPage + 1 
        : undefined;
    },
    initialPageParam: 1,
  });

  // Engineers Query
  const engineersQuery = useInfiniteQuery({
    queryKey: ['marketplace', 'engineers', filters, type],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await engineersAPI.getEngineers({ 
          page: pageParam, 
          limit,
          ...filters
        });
        return processResponse(response);
      } catch (error) {
        console.error('Engineers query error:', error);
        return { data: [], currentPage: pageParam, totalPages: 1, total: 0 };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages 
        ? lastPage.currentPage + 1 
        : undefined;
    },
    enabled: type === 'all' || type === 'engineers',
    initialPageParam: 1,
  });

  // Shops Query
  const shopsQuery = useInfiniteQuery({
    queryKey: ['marketplace', 'shops', filters, type],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await shopsAPI.getShops({ 
          page: pageParam, 
          limit,
          ...filters
        });
        return processResponse(response);
      } catch (error) {
        console.error('Shops query error:', error);
        return { data: [], currentPage: pageParam, totalPages: 1, total: 0 };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages 
        ? lastPage.currentPage + 1 
        : undefined;
    },
    enabled: type === 'all' || type === 'shops',
    initialPageParam: 1,
  });

  // Like/Unlike mutations
  const likeMutation = useMutation({
    mutationFn: productsAPI.likeProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace', 'products']);
      showToast('success', 'Success', 'Product added to favorites');
    },
    onError: (error) => {
      showToast('error', 'Error', error.message || 'Failed to like product');
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: productsAPI.unlikeProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplace', 'products']);
      showToast('success', 'Success', 'Product removed from favorites');
    },
    onError: (error) => {
      showToast('error', 'Error', error.message || 'Failed to unlike product');
    },
  });

  // Helper function to extract data from query
  const extractData = (query) => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap(page => page.data || []);
  };

  return {
    // Data
    products: extractData(productsQuery),
    engineers: extractData(engineersQuery),
    shops: extractData(shopsQuery),

    // Loading states
    isLoading: productsQuery.isLoading || engineersQuery.isLoading || shopsQuery.isLoading,
    isFetching: productsQuery.isFetching || engineersQuery.isFetching || shopsQuery.isFetching,
    isError: productsQuery.isError || engineersQuery.isError || shopsQuery.isError,
    error: productsQuery.error || engineersQuery.error || shopsQuery.error,

    // Pagination
    hasNextPage: {
      products: productsQuery.hasNextPage,
      engineers: engineersQuery.hasNextPage,
      shops: shopsQuery.hasNextPage,
    },
    fetchNextPage: {
      products: productsQuery.fetchNextPage,
      engineers: engineersQuery.fetchNextPage,
      shops: shopsQuery.fetchNextPage,
    },
    isFetchingNextPage: {
      products: productsQuery.isFetchingNextPage,
      engineers: engineersQuery.isFetchingNextPage,
      shops: shopsQuery.isFetchingNextPage,
    },

    // Actions
    likeProduct: likeMutation.mutate,
    unlikeProduct: unlikeMutation.mutate,
    setActiveTab,
    activeTab,

    // Refetch
    refetch: () => {
      productsQuery.refetch();
      engineersQuery.refetch();
      shopsQuery.refetch();
    },
  };
};