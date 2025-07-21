import { useState, useEffect } from 'react';
import pb from '../api/pocketbase';
import { pbHttpClient } from '../utils/pbHttpClient';

interface SellRevenueData {
  period: string;
  amountLAK: string;
  amountTHB: string;
  amountUSD: string;
}

interface OrderItem {
  id: string;
  referenceID: string;
  customerID: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  status: string;
  quantity: number;
  amountLAK: string;
  amountTHB: string;
  amountUSD: string;
  created: string;
  updated: string;
}

interface OrderStatusCount {
  pending: number;
  purchased: number;
  delivering: number;
  completed: number;
  cancel: number;
}

interface SellAmount {
  amountLAK: string;
  amountUSD: string;
  amountTHB: string;
}

interface StatusCountData {
  orderStatusCount: OrderStatusCount;
  customerCount: number;
  sellAmount: SellAmount;
}

interface OrderListData {
  items: OrderItem[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

interface DashboardData {
  sellRevenue: SellRevenueData[] | null;
  statusCount: StatusCountData | null;
  orderList: OrderListData | null;
  loading: boolean;
  error: string | null;
}

interface FilterParams {
  isYear?: boolean;
  startDate?: string;
  endDate?: string;
}

// Hook for static dashboard data (status count and order list)
export const useStaticDashboardData = () => {
  const [data, setData] = useState<Omit<DashboardData, 'sellRevenue'>>({
    statusCount: null,
    orderList: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStaticDashboardData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        const [statusCountResponse, orderListResponse] = await Promise.all([
          pbHttpClient('/dashboard/status-count', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${pb.authStore.token}`,
            },
          }),
          pbHttpClient('/order-list?page=1&perPage=10&status=pending', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${pb.authStore.token}`,
            },
          }),
        ]);

        setData({
          statusCount: statusCountResponse,
          orderList: orderListResponse,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching static dashboard data:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch static dashboard data',
        }));
      }
    };

    fetchStaticDashboardData();
  }, []);

  return data;
};

// Hook for revenue data with filter parameters
export const useRevenueData = (filterParams?: FilterParams) => {
  const [data, setData] = useState<{
    sellRevenue: SellRevenueData[] | null;
    loading: boolean;
    error: string | null;
  }>({
    sellRevenue: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Build query parameters for sell-revenue endpoint
        const sellRevenueParams = new URLSearchParams();
        if (filterParams?.isYear !== undefined) {
          sellRevenueParams.append('isYear', filterParams.isYear.toString());
        }
        if (filterParams?.startDate) {
          sellRevenueParams.append('startDate', filterParams.startDate);
        }
        if (filterParams?.endDate) {
          sellRevenueParams.append('endDate', filterParams.endDate);
        }

        const sellRevenueUrl = `/dashboard/sell-revenue${sellRevenueParams.toString() ? `?${sellRevenueParams.toString()}` : ''
          }`;

        const sellRevenueResponse = await pbHttpClient(sellRevenueUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${pb.authStore.token}`,
          },
        });

        setData({
          sellRevenue: (sellRevenueResponse.sell || []).slice().reverse(),
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch revenue data',
        }));
      }
    };

    fetchRevenueData();
  }, [filterParams?.isYear, filterParams?.startDate, filterParams?.endDate]);

  return data;
};

// Backward compatibility hook
export const useDashboardData = (filterParams?: FilterParams) => {
  const staticData = useStaticDashboardData();
  const revenueData = useRevenueData(filterParams);

  return {
    sellRevenue: revenueData.sellRevenue,
    statusCount: staticData.statusCount,
    orderList: staticData.orderList,
    loading: staticData.loading || revenueData.loading,
    error: staticData.error || revenueData.error,
  };
};
