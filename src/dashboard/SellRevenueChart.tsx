import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useCurrencyContext } from '../components/CurrencySelector/CurrencyProvider';
import { formatCurrencyByType } from '../utils/format';
import RevenueFilter from './RevenueFilter';
import { useTranslate } from 'react-admin';

interface SellRevenueData {
  period: string;
  amountLAK: string;
  amountUSD: string;
  amountTHB: string;
}

interface FilterParams {
  isYear: boolean;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

interface Props {
  data?: SellRevenueData[];
  onFilterChange?: (params: FilterParams) => void;
  loading?: boolean;
  filterParams?: FilterParams;
}

const SellRevenueChart: React.FC<Props> = ({
  data: initialData, // Rename the prop to avoid confusion
  onFilterChange,
  loading,
  filterParams,
}) => {
  const data = initialData || []; // Ensure data is always an array here

  const translate = useTranslate();
  const { currency, displayCurrency } = useCurrencyContext();

  const chartData = React.useMemo(() => {
    // Now 'data' is guaranteed to be an array
    console.log('SellRevenueChart: data value at line 40:', data);
    if (data.length === 0) {
      return [];
    }

    return data.map((item) => {
      const date = new Date(item.period);
      let formattedDate;

      if (item.period && item.period.length === 4) {
        // Check if period is a 4-digit year
        formattedDate = item.period;
      } else {
        const day = date.toLocaleDateString('en-US', { day: '2-digit' });
        const month = date.toLocaleDateString('en-US', { month: '2-digit' });
        formattedDate = `${day}/${month}`;
      }

      let amount = 0;
      switch (currency) {
        case 'USD':
          amount = Number.parseFloat(item.amountUSD);
          break;
        case 'THB':
          amount = Number.parseFloat(item.amountTHB);
          break;
        case 'LAK':
          amount = Number.parseFloat(item.amountLAK);
          break;
        default:
          break;
      }

      return {
        date: formattedDate,
        amount,
      };
    });
  }, [data, currency, filterParams?.isYear]);

  const totalLAK = React.useMemo(
    () =>
      data?.reduce((sum, item) => sum + Number.parseFloat(item.amountLAK), 0) ||
      0,
    [data]
  );
  const totalUSD = React.useMemo(
    () =>
      data?.reduce((sum, item) => sum + Number.parseFloat(item.amountUSD), 0) ||
      0,
    [data]
  );
  const totalTHB = React.useMemo(
    () =>
      data?.reduce((sum, item) => sum + Number.parseFloat(item.amountTHB), 0) ||
      0,
    [data]
  );

  return (
    <Card className='w-full'>
      <CardHeader
        title={
          <Typography
            variant='h6'
            sx={{ fontWeight: 'bold', textAlign: 'start' }}
          >
            {translate('day_revenue_history')}
          </Typography>
        }
        action={
          onFilterChange && <RevenueFilter onFilterChange={onFilterChange} />
        }
      />
      <CardContent>
        <Box sx={{ height: 320, width: '100%', position: 'relative' }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={chartData}
              margin={{
                top: 0,
                right: 0,
                left: -10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#f0f0f0'
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey='date'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                interval='preserveStartEnd'
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => `${displayCurrency}${value}`}
              />
              <Line
                type='monotone'
                dataKey='amount'
                stroke='#D4A574'
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4, fill: '#D4A574' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Revenue Summary Cards */}
        <Grid container spacing={2} mt={1}>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                backgroundColor: '#f9fafb',
                borderRadius: 2,
              }}
            >
              <Typography variant='body2' color='text.secondary' mb={1}>
                LAK
              </Typography>
              <Typography variant='h6' color='#a67c00'>
                {formatCurrencyByType(totalLAK, 'LAK')}
              </Typography>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                backgroundColor: '#f9fafb',
                borderRadius: 2,
              }}
            >
              <Typography variant='body2' color='text.secondary' mb={1}>
                USD
              </Typography>
              <Typography variant='h6' color='#a67c00'>
                {formatCurrencyByType(totalUSD, 'USD')}
              </Typography>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                backgroundColor: '#f9fafb',
                borderRadius: 2,
              }}
            >
              <Typography variant='body2' color='text.secondary' mb={1}>
                THB
              </Typography>
              <Typography variant='h6' color='#a67c00'>
                {formatCurrencyByType(totalTHB, 'THB')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SellRevenueChart;
