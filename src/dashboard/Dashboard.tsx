import {
  Alert,
  Box,
  CircularProgress,
  Theme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { useState } from 'react';

import OrderPendingList from './OrderPendingList';
import SellRevenueChart from './SellRevenueChart';
import StatusCountCards from './StatusCountCards';
import { useRevenueData, useStaticDashboardData } from './useDashboardData';

import { SellRevenue } from '../model/dashboard';

interface FilterParams {
  isYear: boolean;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

const Dashboard = () => {
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const [filterParams, setFilterParams] = useState<FilterParams>({
    isYear: false,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Use separate hooks for static and revenue data
  const {
    statusCount,
    orderList,
    loading: staticLoading,
    error: staticError,
  } = useStaticDashboardData();
  const {
    sellRevenue,
    loading: revenueLoading,
    error: revenueError,
  } = useRevenueData(filterParams);

  const loading = staticLoading;
  const error = staticError || revenueError;

  const handleFilterChange = (params: FilterParams) => {
    setFilterParams(params);
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='200px'
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={2}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  interface RevenueSum {
    totalLAK: number;
    totalTHB: number;
    totalUSD: number;
  }

  const sumSellRevenue = (data: SellRevenue[] | undefined): RevenueSum => {
    if (!data) {
      return { totalLAK: 0, totalTHB: 0, totalUSD: 0 };
    }
    return data.reduce(
      (acc, item) => {
        acc.totalLAK += parseFloat(item.amountLAK);
        acc.totalTHB += parseFloat(item.amountTHB);
        acc.totalUSD += parseFloat(item.amountUSD);
        return acc;
      },
      { totalLAK: 0, totalTHB: 0, totalUSD: 0 }
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Status Section */}
        {statusCount && (
          <Grid size={12}>
            <StatusCountCards
              sellRevenue={sumSellRevenue(sellRevenue || [])}
              orderStatusCount={statusCount.orderStatusCount}
              customerCount={statusCount.customerCount}
              sellAmount={statusCount.sellAmount}
            />
          </Grid>
        )}

        {/* Sell Revenue Section */}
        {sellRevenue && (
          <Grid
            size={{
              xs: 12,
              md: isSmall ? 12 : 6
            }}>
            <SellRevenueChart
              data={sellRevenue}
              onFilterChange={handleFilterChange}
              loading={revenueLoading}
              filterParams={filterParams}
            />
          </Grid>
        )}

        {/* Order Pending List Section */}
        {orderList && (
          <Grid
            size={{
              xs: 12,
              md: isSmall ? 12 : 6
            }}>
            <OrderPendingList data={orderList} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;