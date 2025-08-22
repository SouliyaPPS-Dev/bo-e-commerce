import { Cancel as CancelIcon } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Box, Card, Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useTranslate } from 'react-admin';
import { Link } from 'react-router-dom';
import { useCurrencyContext } from '../components/CurrencySelector/CurrencyProvider';
import { formatCurrency } from '../utils/format';

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

export interface TotalSellAmount {
  totalLAK: number;
  totalTHB: number;
  totalUSD: number;
}

interface Props {
  sellRevenue: TotalSellAmount;
  orderStatusCount: OrderStatusCount;
  customerCount: number;
  sellAmount: SellAmount;
}

const ModernStatusCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  to?: string;
}> = ({ title, value, icon, to }) => {
  const translate = useTranslate();
  const cardContent = (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        backgroundColor: '#fff',
        border: '1px solid #ece7df',
        boxShadow: 'none',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        minWidth: 0,
      }}
    >
      {/* Background shape */}
      <Box
        sx={{
          position: 'absolute',
          left: -50,
          top: 0,
          bottom: 0,
          width: { xs: 120, sm: 170 },
          backgroundColor: '#fef1dc',
          borderTopRightRadius: 100,
          borderBottomRightRadius: 180,
        }}
      />
      {/* Icon */}
      <Box
        sx={{
          position: 'relative',
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: '50%',
          backgroundColor: '#fef1dc',
          color: '#D4AF37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          zIndex: 1,
          ml: { xs: 0, sm: -1 },
          mr: { xs: 2, sm: 3 },
          mt: 1,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      {/* Text */}
      <Box
        sx={{
          ml: { xs: 2, sm: 5 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          minWidth: 0,
        }}
      >
        <Typography
          variant='body2'
          sx={{
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            color: '#7b7462',
            fontWeight: 500,
            textAlign: { xs: 'left', sm: 'right' },
            width: '100%',
          }}
        >
          {translate(title)}
        </Typography>
        <Typography
          variant='h6'
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            color: '#000',
            fontWeight: 700,
            textAlign: { xs: 'left', sm: 'right' },
            width: '100%',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const StatusCountCards: React.FC<Props> = ({
  sellRevenue,
  orderStatusCount,
  customerCount,
}) => {
  const { currency } = useCurrencyContext();
  const translate = useTranslate();

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 4,
        }}
      >
        <ModernStatusCard
          title='dashboard.monthly_revenue'
          value={
            currency === 'USD' && sellRevenue?.totalUSD
              ? `${formatCurrency(Number(sellRevenue?.totalUSD))} $`
              : currency === 'THB' && sellRevenue?.totalTHB
              ? `${formatCurrency(Number(sellRevenue?.totalTHB))} ฿`
              : currency === 'LAK' && sellRevenue?.totalLAK
              ? `${formatCurrency(Number(sellRevenue?.totalLAK))} ₭`
              : ''
          }
          icon={
            <Box>
              <AttachMoneyIcon sx={{ fontSize: 35 }} />
            </Box>
          }
          color='#607d8b'
          bgColor='#607d8b'
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 4,
        }}
      >
        <ModernStatusCard
          title='dashboard.total_customers'
          value={customerCount}
          icon={
            <Box>
              <PersonAddRoundedIcon sx={{ fontSize: 35 }} />
            </Box>
          }
          color='#607d8b'
          bgColor='#607d8b'
          to='/customers'
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 4,
        }}
      >
        <ModernStatusCard
          title='pending_orders'
          value={orderStatusCount.pending}
          icon={
            <Box>
              <ShoppingCartIcon sx={{ fontSize: 35 }} />
            </Box>
          }
          color='#090909'
          bgColor='#ff9800'
          to='/orders?status=pending'
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <ModernStatusCard
          title='purchased'
          value={orderStatusCount.purchased}
          icon={
            <Box sx={{ fontSize: 35 }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='1em'
                height='1em'
                viewBox='0 0 24 24'
              >
                <g fill='currentColor'>
                  <path d='m16.414 10.979l-1.436-1.393l-2.88 2.97l-1.062-1.118l-1.45 1.377l2.498 2.63z' />
                  <path
                    fillRule='evenodd'
                    d='M6 4a2 2 0 0 1 2-2h8.107l2.146 2.342L21 7.638V17a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm8.667 0H8v13h11V9h-2.333a2 2 0 0 1-2-2zm2 1.57l.08.088L17.865 7h-1.198z'
                    clipRule='evenodd'
                  />
                  <path d='M5 5.5v1H3v-1zM16.5 22h-9c-1.026 0-2.13-.454-2.975-1.201C3.662 20.035 3 18.9 3 17.5v-11h2v11c0 .731.338 1.347.85 1.8c.53.47 1.176.7 1.65.7h9zm0-2h1v2h-1z' />
                </g>
              </svg>
            </Box>
          }
          color='#2196f3'
          bgColor='#2196f3'
          to='/orders?status=purchased'
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <ModernStatusCard
          title='delivering'
          value={orderStatusCount.delivering}
          icon={
            <Box sx={{ fontSize: 35 }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='1em'
                height='1em'
                viewBox='0 0 24 24'
              >
                <path
                  fill='currentColor'
                  d='M21.5 2h-14v7.842a5 5 0 0 1 .94-.092h4.685a4.375 4.375 0 0 1 4.093 2.83l1.964-.452a4.06 4.06 0 0 1 2.318.088zm-9 2h4v4l-2-1.5l-2 1.5z'
                />
                <path
                  fill='currentColor'
                  d='m19.54 13.585l-3.553.817a2.87 2.87 0 0 0-.83-2.31a2.88 2.88 0 0 0-2.032-.842H8.439a3.25 3.25 0 0 0-2.301.948L4.086 14.25H0v7.25h11.373l6.197-1.55l3.74-1.594l.026-.014a2.555 2.555 0 0 0-1.797-4.757m-11.584-.24a1.3 1.3 0 0 1 .479-.095h4.69a.875.875 0 1 1 0 1.75H10v2h3.614l6.412-1.475l.02-.005a.556.556 0 0 1 .416 1.022L16.93 18.05l-5.803 1.45H5.5v-3.836l2.05-2.05a1.3 1.3 0 0 1 .406-.27M2 16.25h1.5v3.25H2z'
                />
              </svg>
            </Box>
          }
          color='#9c27b0'
          bgColor='#9c27b0'
          to='/orders?status=delivering'
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <ModernStatusCard
          title='completed'
          value={orderStatusCount.completed}
          icon={
            <Box sx={{ fontSize: 35 }}>
              <CheckCircleIcon fontSize='inherit' />
            </Box>
          }
          color='#4caf50'
          bgColor='#4caf50'
          to='/orders?status=completed'
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          lg: 3,
        }}
      >
        <ModernStatusCard
          title='cancel'
          value={orderStatusCount.cancel}
          icon={
            <Box sx={{ fontSize: 35 }}>
              <CancelIcon fontSize='inherit' />
            </Box>
          }
          color='#f44336'
          bgColor='#f44336'
          to='/orders?status=cancel'
        />
      </Grid>
    </Grid>
  );
};

export default StatusCountCards;
