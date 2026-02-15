import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import * as React from 'react';
import { useTranslate } from 'react-admin';
import { useCurrencyContext } from '../components/CurrencySelector/CurrencyProvider';
import { formatCurrencyByType } from '../utils/format';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import pb from '../api/pocketbase';
import {
  PBAddress,
  PBCustomer,
  PBOrderItem,
  PBProduct,
} from '../model/OrderList';

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

interface OrderListData {
  items: OrderItem[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

interface Props {
  data: OrderListData;
}

interface OrderDetailsCache {
  [key: string]: {
    orderItems: PBOrderItem[];
    customer: PBCustomer | null;
    address: PBAddress | null;
    products: { [key: string]: PBProduct };
    provinceName: string | null;
    districtName: string | null;
  };
}

const OrderPendingList: React.FC<Props> = ({ data }) => {
  const translate = useTranslate();
  const [openOrderId, setOpenOrderId] = React.useState<string | null>(null);
  const [detailsCache, setDetailsCache] = React.useState<OrderDetailsCache>({});

  if (!data || !data.items || data.items.length === 0) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        <CardHeader
          title={translate('pending_orders')}
          titleTypographyProps={{ fontWeight: 'bold', fontSize: 18 }}
        />
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            {translate('no_pending_orders')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const fetchOrderDetails = async (orderId: string) => {
    if (detailsCache[orderId] && detailsCache[orderId].customer) return;

    try {
      const order = data.items.find((o) => o.id === orderId);
      let customer: PBCustomer | null = null;
      if (order && order.customerID) {
        try {
          customer = (await pb
            .collection('customers')
            .getOne(order.customerID)) as PBCustomer;
        } catch (err) {
          console.warn('Failed to fetch customer:', err);
        }
      }

      const itemsResponse = await pb.collection('order_items').getList(1, 50, {
        filter: `order_id = "${orderId}"`,
      });
      const orderItems = itemsResponse.items as unknown as PBOrderItem[];

      const productIds = orderItems.map((item) => item.product_id);
      const uniqueProductIds = Array.from(new Set(productIds));
      const productPromises = uniqueProductIds.map(async (productId) => {
        try {
          const productData = await pb.collection('products').getOne(productId);
          return { id: productId, data: productData as unknown as PBProduct };
        } catch (err) {
          console.warn(`Failed to fetch product ${productId}:`, err);
          return null;
        }
      });
      const productResults = await Promise.all(productPromises);
      const products: { [key: string]: PBProduct } = {};
      productResults.forEach((result) => {
        if (result) {
          products[result.id] = result.data;
        }
      });

      setDetailsCache((prev) => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          orderItems,
          customer,
          address: null, // Address data is not available in this context
          products,
          provinceName: null,
          districtName: null,
        },
      }));
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const handleToggle = (orderId: string) => {
    const newOpenOrderId = openOrderId === orderId ? null : orderId;
    setOpenOrderId(newOpenOrderId);
    if (newOpenOrderId) {
      fetchOrderDetails(newOpenOrderId);
    }
  };

  return (
    <Card sx={{ borderRadius: '10px', p: 2 }}>
      <CardHeader
        sx={{ mt: -1 }}
        title={`${translate('pending_orders')} (${data.totalItems})`}
        subheader={`${translate('showing')} ${data.items.length} ${translate(
          'of'
        )} ${data.totalItems} ${translate('orders')}`}
        titleTypographyProps={{ fontWeight: 'bold', fontSize: 18 }}
        subheaderTypographyProps={{ color: 'text.secondary' }}
      />
      <CardContent sx={{ padding: 0 }}>
        <Box sx={{ overflowX: 'auto', maxWidth: 630, mx: 'auto' }}>
          <TableContainer>
            <Table size='small' sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow>
                  <TableCell>{translate('reference_id')}</TableCell>
                  <TableCell>{translate('customer')}</TableCell>
                  <TableCell>{translate('quantity')}</TableCell>
                  <TableCell>{translate('amount')}</TableCell>
                  <TableCell>{translate('status')}</TableCell>
                  <TableCell>{translate('created')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((order) => (
                  <React.Fragment key={order.id}>
                    <OrderPendingRow
                      order={order}
                      onToggle={() => handleToggle(order.id)}
                      open={openOrderId === order.id}
                    />
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ paddingBottom: 0, paddingTop: 0 }}
                      >
                        <Collapse
                          in={openOrderId === order.id}
                          timeout='auto'
                          unmountOnExit
                        >
                          <Box sx={{ margin: 2 }}>
                            {detailsCache[order.id] ? (
                              <OrderDetail details={detailsCache[order.id]} />
                            ) : (
                              <p>Loading...</p>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const OrderPendingRow: React.FC<{
  order: OrderItem;
  onToggle: () => void;
  open: boolean;
}> = ({ order, onToggle, open }) => {
  const { currency } = useCurrencyContext();
  const translate = useTranslate();

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onToggle} size='small'>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Typography variant='body2' fontWeight='medium'>
            {order.referenceID}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box display='flex' flexDirection='column'>
          <Typography variant='body2' fontWeight='medium'>
            {order.customerName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant='body2'>{order.quantity}</Typography>
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant='body2' fontWeight='medium'>
            {currency === 'USD' && order?.amountUSD
              ? Number(order.amountUSD) === 0
                ? translate('for_auction')
                : formatCurrencyByType(
                    Number(order?.amountUSD) * order?.quantity,
                    'USD'
                  )
              : currency === 'THB' && order?.amountTHB
              ? Number(order.amountTHB) === 0
                ? translate('for_auction')
                : formatCurrencyByType(
                    Number(order?.amountTHB) * order?.quantity,
                    'THB'
                  )
              : currency === 'LAK' && order?.amountLAK
              ? Number(order.amountLAK) === 0
                ? translate('for_auction')
                : formatCurrencyByType(
                    Number(order?.amountLAK) * order?.quantity,
                    'LAK'
                  )
              : ''}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={order.status}
          color={
            order.status === 'pending'
              ? 'warning'
              : order.status === 'completed'
              ? 'success'
              : 'default'
          }
          size='small'
          variant='filled'
        />
      </TableCell>
      <TableCell>
        <Typography variant='caption' color='text.secondary'>
          {formatDate(order.created)}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const OrderDetail: React.FC<{ details: any }> = ({ details }) => {
  const { currency } = useCurrencyContext();
  const translate = useTranslate();

  const formatCurrencyValue = (amount: number, currencyType: string) =>
    amount === 0 ? translate('for_auction') : formatCurrencyByType(amount, currencyType);

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        {translate('order_items')}
      </Typography>
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>{translate('image')}</TableCell>
              <TableCell>{translate('product')}</TableCell>
              <TableCell align='right'>{translate('qty')}</TableCell>
              <TableCell align='right'>{translate('price')}</TableCell>
              <TableCell align='right'>{translate('total')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {details.orderItems.map((item: any) => {
              const product = details.products[item.product_id];
              const getPrice = () => {
                switch (currency) {
                  case 'LAK':
                    return item.price_lak;
                  case 'USD':
                    return item.price_usd;
                  case 'THB':
                    return item.price_thb;
                  default:
                    return item.price_usd;
                }
              };
              const price = getPrice();
              const total = price * item.quantity;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {product?.image_url && (
                      <Link to={`/products/${product?.id}/show`}>
                        <img
                          src={product?.image_url?.[0]}
                          alt={product?.name || translate('product_image')}
                          loading='lazy'
                          decoding='async'
                          width={50}
                          height={50}
                          style={{
                            objectFit: 'cover',
                          }}
                        />
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link to={`/products/${product?.id}/show`}>
                      {product?.name || item.product_name}
                    </Link>
                  </TableCell>
                  <TableCell align='right'>{item.quantity}</TableCell>
                  <TableCell align='right'>
                    {formatCurrencyValue(price, currency)}
                  </TableCell>
                  <TableCell align='right'>
                    {formatCurrencyValue(total, currency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderPendingList;
