import {
  ExpandLess,
  ExpandMore,
  LocationOn,
  Person,
  Receipt,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import * as React from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { DateField, Loading, useTranslate } from 'react-admin';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';

import pb from '../api/pocketbase';
import { useCurrencyContext } from '../components/CurrencySelector/CurrencyProvider'; // Import useCurrencyContext
import { formatCurrencyByType } from '../utils/format';
import {
  PBAddress,
  PBCustomer,
  PBOrder,
  PBOrderItem,
  PBProduct,
} from '../model/OrderList';

const OrderListFilter = ({
  setSearchTerm,
}: {
  setSearchTerm: (value: string) => void;
  setDateRange: (range: { start: string; end: string }) => void;
}) => {
  const translate = useTranslate();
  const [searchTerm, setSearchTermState] = useState('');
  // const [startDate, setStartDate] = useState('');
  // const [endDate, setEndDate] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermState(event.target.value);
    setSearchTerm(event.target.value);
  };

  // const handleDateChange = () => {
  //   const formattedStartDate = startDate
  //     ? dayjs(startDate).format('YYYY-MM-DD HH:mm:ss')
  //     : '';
  //   const formattedEndDate = endDate
  //     ? dayjs(endDate).format('YYYY-MM-DD HH:mm:ss')
  //     : '';
  //   setDateRange({ start: formattedStartDate, end: formattedEndDate });
  // };

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: -1,
        mt: -2,
      }}
    >
      <TextField
        label={translate('search')}
        variant='outlined'
        onChange={handleSearch}
        value={searchTerm}
        fullWidth
      />
      {/* <TextField
        label="Start Date"
        type="datetime-local"
        variant="outlined"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        onBlur={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="End Date"
        type="datetime-local"
        variant="outlined"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        onBlur={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}
      /> */}
    </Box>
  );
};

export const OrderList = () => {
  const translate = useTranslate();

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h5' component='h5'>
          {translate('orders_management')}
        </Typography>
      </Box>
      <TabbedDatagrid />
    </Box>
  );
};

const tabs = [
  { id: 'pending', name: 'pending' },
  { id: 'purchased', name: 'purchased' },
  { id: 'delivering', name: 'delivering' },
  { id: 'completed', name: 'completed' },
  { id: 'cancel', name: 'cancel' },
];

interface OrderDetailsCache {
  [key: string]: {
    orderItems: PBOrderItem[];
    customer: PBCustomer | null;
    address: PBAddress | null;
    products: { [key: string]: PBProduct };
    provinceName: string | null;
    districtName: string | null;
    isLoaded: boolean;
  };
}

const TabbedDatagrid = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromQuery = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('status') || 'pending';
  }, [location.search]);

  const [activeTab, setActiveTab] = useState<string>(getTabFromQuery());
  const [orderCounts, setOrderCounts] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { currency } = useCurrencyContext();
  const translate = useTranslate();
  const isXSmall = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down('sm')
  );

  const fetchOrderCounts = useCallback(async () => {
    try {
      const counts: { [key: string]: number } = {};

      for (const tab of tabs) {
        const response = await pb.collection('orders').getList(1, 1, {
          filter: `status = "${tab.id}"`,
        });
        counts[tab.id] = response.totalItems;
      }

      setOrderCounts(counts);
    } catch (error) {
      console.error('Error fetching order counts:', error);
    }
  }, []);

  // Fetch order counts on component mount
  useEffect(() => {
    fetchOrderCounts();
  }, [fetchOrderCounts]);

  useEffect(() => {
    setActiveTab(getTabFromQuery());
  }, [getTabFromQuery]);

  const handleChange = useCallback(
    (event: React.SyntheticEvent, value: string) => {
      setActiveTab(value);
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('status', value);
      navigate({ search: searchParams.toString() });

      if (isXSmall) {
        const tabsContainer = document.querySelector('[role="tablist"]');
        if (tabsContainer) {
          tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [isXSmall, location.search, navigate]
  );

  const downloadExcel = async () => {
    try {
      let filter = `status = "${activeTab}"`;
      if (searchTerm) {
        const searchFilter = `(reference_id ~ "${searchTerm}" || customer_name ~ "${searchTerm}" || phone_number ~ "${searchTerm}" || address ~ "${searchTerm}")`;
        filter += ` && ${searchFilter}`;
      }

      const records = await pb.collection('orders').getFullList({
        filter: filter,
        sort: '-created',
      });

      const data = await Promise.all(
        records.map(async (order: any) => {
          const itemsResponse = await pb
            .collection('order_items')
            .getList(1, 50, {
              filter: `order_id = "${order.id}"`,
            });
          const orderItems = itemsResponse.items as unknown as PBOrderItem[];

          const totals = orderItems.reduce(
            (totals, item) => {
              return {
                lak: totals.lak + item.quantity * item.price_lak,
                usd: totals.usd + item.quantity * item.price_usd,
                thb: totals.thb + item.quantity * item.price_thb,
              };
            },
            { lak: 0, usd: 0, thb: 0 }
          );

          let total = 0;
          switch (currency) {
            case 'LAK':
              total = totals.lak;
              break;
            case 'USD':
              total = totals.usd;
              break;
            case 'THB':
              total = totals.thb;
              break;
          }

          return {
            Date: new Date(order.created).toLocaleString(),
            Reference: order.reference_id,
            Customer: order.customer_name,
            Phone: order.phone_number,
            Address: order.address,
            Status: order.status,
            Total: total,
            Currency: currency,
          };
        })
      );

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      XLSX.writeFile(wb, `orders_${activeTab}.xlsx`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  return (
    <Fragment>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <OrderListFilter
          setSearchTerm={setSearchTerm}
          setDateRange={setDateRange}
        />
        <Button
          variant='contained'
          onClick={downloadExcel}
          sx={{ m: 2, ml: 'auto', height: '50px' }}
        >
          {translate('export_excel')}
        </Button>
      </Box>
      <Tabs
        variant='scrollable'
        scrollButtons='auto'
        value={activeTab}
        indicatorColor='primary'
        onChange={(event, value) => handleChange(event, value)}
      >
        {tabs.map((choice) => (
          <Tab
            key={choice.id}
            label={
              <span style={{ color: getStatusColor(choice.id) }}>
                {translate(choice.name)} ({orderCounts[choice.id] || 0})
              </span>
            }
            value={choice.id}
          />
        ))}
      </Tabs>
      <Divider />
      <br />
      <OrdersTable
        status={activeTab}
        searchTerm={searchTerm}
        dateRange={dateRange}
        fetchOrderCounts={fetchOrderCounts}
      />
    </Fragment>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'purchased':
      return 'blue';
    case 'delivering':
      return 'purple';
    case 'completed':
      return 'green';
    case 'cancel':
      return 'red';
    default:
      return 'inherit';
  }
};

// Order Detail Component
const OrderDetail: React.FC<{
  order: PBOrder;
  details: any;
  onToggle: () => void;
  open: boolean;
  onStatusChange: (orderId: string, newStatus: string) => void;
}> = ({ order, details, onToggle, open, onStatusChange }) => {
  const translate = useTranslate();
  const { currency } = useCurrencyContext();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{
    orderId: string;
    newStatus: string;
  } | null>(null);

  const handleStatusChangeClick = (orderId: string, newStatus: string) => {
    setPendingStatus({ orderId, newStatus });
    setOpenConfirm(true);
  };

  const handleConfirmStatusChange = () => {
    if (pendingStatus) {
      onStatusChange(pendingStatus.orderId, pendingStatus.newStatus);
      setPendingStatus(null);
    }
    setOpenConfirm(false);
  };

  const handleCancelStatusChange = () => {
    setPendingStatus(null);
    setOpenConfirm(false);
  };

  const calculateTotals = () => {
    if (!details || !details.orderItems) return { lak: 0, usd: 0, thb: 0 };
    return details.orderItems.reduce(
      (totals: any, item: any) => {
        return {
          lak: totals.lak + item.quantity * item.price_lak,
          usd: totals.usd + item.quantity * item.price_usd,
          thb: totals.thb + item.quantity * item.price_thb,
        };
      },
      { lak: 0, usd: 0, thb: 0 }
    );
  };

  const totals = calculateTotals();

  const formatAmount = (amount: number, currencyType: string) =>
    formatCurrencyByType(amount, currencyType);

  const getCurrentTotal = () => {
    switch (currency) {
      case 'LAK':
        return formatAmount(totals.lak, 'LAK');
      case 'USD':
        return formatAmount(totals.usd, 'USD');
      case 'THB':
        return formatAmount(totals.thb, 'THB');
      default:
        return formatAmount(totals.usd, 'USD');
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={onToggle} size='small'>
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <DateField source='created' record={order} showTime />
          </Box>
        </TableCell>
        <TableCell>{order.reference_id}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {details?.customer?.avatar && (
              <Avatar
                src={details.customer.avatar}
                alt={order.customer_name}
                sx={{ width: 36, height: 36 }}
              />
            )}
            <Typography variant='body2'>{order.customer_name}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {order.phone_number}
            {order.phone_number && (
              <IconButton
                size='small'
                href={`https://wa.me/${order.phone_number.replace(
                  /[^\d+]/g,
                  ''
                )}`}
                target='_blank'
                rel='noopener noreferrer'
                sx={{ color: '#25D366' }} // WhatsApp green color
              >
                <WhatsAppIcon width={20} height={20} />
              </IconButton>
            )}
          </Box>
        </TableCell>
        <TableCell>{order.address}</TableCell>
        <TableCell>
          <FormControl size='small' variant='outlined'>
            <Select
              value={order.status}
              onChange={(event) =>
                handleStatusChangeClick(order.id, event.target.value as string)
              }
              displayEmpty
              inputProps={{ 'aria-label': 'Select status' }}
              sx={{
                color: getStatusColor(order.status),
                fontWeight: 'bold',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: getStatusColor(order.status),
                },
                '& .MuiSvgIcon-root': {
                  color: getStatusColor(order.status),
                },
              }}
            >
              {order.status === 'pending' && [
                <MenuItem
                  value={'pending'}
                  sx={{ color: getStatusColor('pending') }}
                  disabled={order.status !== 'pending'}
                >
                  {translate('pending')}
                </MenuItem>,
                <MenuItem
                  value={'purchased'}
                  sx={{ color: getStatusColor('purchased') }}
                >
                  {translate('purchased')}
                </MenuItem>,
              ]}

              {order.status === 'purchased' && [
                <MenuItem
                  value={'purchased'}
                  sx={{ color: getStatusColor('purchased') }}
                >
                  {translate('purchased')}
                </MenuItem>,
                <MenuItem
                  key='delivering'
                  value={'delivering'}
                  sx={{ color: getStatusColor('delivering') }}
                >
                  {translate('delivering')}
                </MenuItem>,
              ]}

              {order.status === 'delivering' && [
                <MenuItem
                  key='delivering'
                  value={'delivering'}
                  sx={{ color: getStatusColor('delivering') }}
                >
                  {translate('delivering')}
                </MenuItem>,
                <MenuItem
                  value={'completed'}
                  sx={{ color: getStatusColor('completed') }}
                >
                  {translate('completed')}
                </MenuItem>,
              ]}

              {order.status === 'completed' && [
                <MenuItem
                  key='completed'
                  value={'completed'}
                  sx={{ color: getStatusColor('completed') }}
                >
                  {translate('completed')}
                </MenuItem>,
              ]}

              {order.status !== 'completed' && [
                <MenuItem
                  key='cancel'
                  value={'cancel'}
                  sx={{ color: getStatusColor('cancel') }}
                >
                  {translate('cancel')}
                </MenuItem>,
              ]}
            </Select>
          </FormControl>
        </TableCell>
        <TableCell>{getCurrentTotal()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={9} sx={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 2 }}>
              {!details || !details.customer ? (
                <Loading />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Order Information, Items, and Totals Section */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    {/* Order Information Section */}
                    <Box sx={{ width: { xs: '100%', md: '33%' } }}>
                      <Card>
                        <CardContent>
                          <Typography variant='h6' gutterBottom>
                            <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {translate('order_information')}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            <strong>{translate('reference')}:</strong>{' '}
                            {order.reference_id}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            <strong>{translate('created')}:</strong>{' '}
                            {new Date(order.created).toLocaleString()}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            <strong>{translate('status')}:</strong>{' '}
                            {translate('' + order.status)}
                          </Typography>
                          {order.remark && (
                            <Typography variant='body2' color='text.secondary'>
                              <strong>{translate('remark')}:</strong>{' '}
                              {order.remark}
                            </Typography>
                          )}
                          {details.customer && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant='subtitle2' gutterBottom>
                                <Person
                                  sx={{ mr: 1, verticalAlign: 'middle' }}
                                />
                                {translate('customer_details')}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('name')}:</strong>{' '}
                                {details.customer.name ||
                                  details.customer.username}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('email')}:</strong>{' '}
                                {details.customer.email}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('phone_number')}:</strong>{' '}
                                {details.customer.phone_number}
                                &nbsp;
                                {details.customer.phone_number && (
                                  <IconButton
                                    size='small'
                                    href={`https://wa.me/${details.customer.phone_number.replace(
                                      /[^\d+]/g,
                                      ''
                                    )}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    sx={{ color: '#25D366' }} // WhatsApp green color
                                  >
                                    <WhatsAppIcon width={20} height={20} />
                                  </IconButton>
                                )}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('verified')}:</strong>{' '}
                                {details.customer.verified ? 'Yes' : 'No'}
                              </Typography>
                            </Box>
                          )}
                          {details.address && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant='subtitle2' gutterBottom>
                                <LocationOn
                                  sx={{ mr: 1, verticalAlign: 'middle' }}
                                />
                                {translate('shipping_address')}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('name')}:</strong>{' '}
                                {details.address.shipping_name}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('village')}:</strong>{' '}
                                {details.address.village}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('district')}:</strong>{' '}
                                {details.districtName ||
                                  details.address.district_id}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                <strong>{translate('province')}:</strong>{' '}
                                {details.provinceName ||
                                  details.address.province_id}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Order Items Section */}
                    <Box sx={{ width: { xs: '100%', md: '33%' } }}>
                      <Card>
                        <CardContent>
                          <Typography variant='h6' gutterBottom>
                            {translate('order_items')}
                          </Typography>
                          {details.orderItems.length > 0 ? (
                            <TableContainer>
                              <Table size='small'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>{translate('image')}</TableCell>
                                    <TableCell>
                                      {translate('product')}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {translate('qty')}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {translate('price')}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {translate('total')}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {translate('stock')}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {translate('sold')}
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {details.orderItems.map((item: any) => {
                                    const product =
                                      details.products[item.product_id];
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
                                            <Link
                                              to={`/products/${product?.id}/show`}
                                            >
                                              <img
                                                src={product.image_url[0]}
                                                alt={
                                                  product?.name ||
                                                  translate('product_image')
                                                }
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
                                          <Link
                                            to={`/products/${product?.id}/show`}
                                          >
                                            {product?.name || item.product_name}
                                          </Link>
                                        </TableCell>
                                        <TableCell align='right'>
                                          {item.quantity}
                                        </TableCell>
                                        <TableCell align='right'>
                                          {formatAmount(price, currency)}
                                        </TableCell>
                                        <TableCell align='right'>
                                          {formatAmount(total, currency)}
                                        </TableCell>
                                        <TableCell align='right'>
                                          {order.status !== 'pending'
                                            ? product?.total_count -
                                              product?.sell_count
                                            : product?.total_count}
                                        </TableCell>
                                        <TableCell align='right'>
                                          {product?.sell_count}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography variant='body2' color='text.secondary'>
                              {translate('no_items_found')}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Order Totals Section */}
                    <Box sx={{ width: { xs: '100%', md: '33%' } }}>
                      <Card>
                        <CardContent>
                          <Typography variant='h6' gutterBottom>
                            {translate('order_totals')}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography variant='body2'>
                                {translate('lak')}
                              </Typography>
                              <Typography variant='body2' fontWeight='bold'>
                                {formatAmount(totals.lak, 'LAK')}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography variant='body2'>
                                {translate('usd')}
                              </Typography>
                              <Typography variant='body2' fontWeight='bold'>
                                {formatAmount(totals.usd, 'USD')}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography variant='body2'>
                                {translate('thb')}
                              </Typography>
                              <Typography variant='body2' fontWeight='bold'>
                                {formatAmount(totals.thb, 'THB')}
                              </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography variant='body1' fontWeight='bold'>
                                {translate('current')} ({currency}):
                              </Typography>
                              <Typography
                                variant='body1'
                                fontWeight='bold'
                                color='primary'
                              >
                                {getCurrentTotal()}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Dialog
        open={openConfirm}
        onClose={handleCancelStatusChange}
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
      >
        <DialogTitle id='confirm-dialog-title'>
          {translate('confirm_status_change')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='confirm-dialog-description'>
            {translate('confirm_status_change_message')}{' '}
            <strong>{pendingStatus?.newStatus}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusChange} color='primary'>
            {translate('cancel')}
          </Button>
          <Button onClick={handleConfirmStatusChange} color='primary' autoFocus>
            {translate('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Custom Orders Table with PocketBase integration
const OrdersTable = React.memo(
  ({
    status,
    searchTerm,
    dateRange,
    fetchOrderCounts,
  }: {
    status: string;
    searchTerm: string;
    dateRange: { start: string; end: string };
    fetchOrderCounts: () => void; // Callback to refresh order counts
  }) => {
    const translate = useTranslate();
    const [orders, setOrders] = useState<PBOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);
    const [detailsCache, setDetailsCache] = useState<OrderDetailsCache>({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    const fetchOrders = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        let filter = `status = "${status}"`;
        if (searchTerm) {
          const searchFilter = `(reference_id ~ "${searchTerm}" || customer_name ~ "${searchTerm}" || phone_number ~ "${searchTerm}" || address ~ "${searchTerm}")`;
          filter += ` && ${searchFilter}`;
        }

        if (dateRange.start && dateRange.end) {
          filter += ` && created >= "${dateRange.start}" && created <= "${dateRange.end}"`;
        }

        const response = await pb
          .collection('orders')
          .getList(page + 1, rowsPerPage, {
            filter: filter,
            sort: '-created',
          });
        const orders = response.items as unknown as PBOrder[];
        setOrders(orders);
        setTotal(response.totalItems);

        const newDetailsCache: OrderDetailsCache = {};
        await Promise.all(
          orders.map(async (order) => {
            const itemsResponse = await pb
              .collection('order_items')
              .getList(1, 50, {
                filter: `order_id = "${order.id}"`,
              });
            const orderItems = itemsResponse.items as unknown as PBOrderItem[];
            newDetailsCache[order.id] = {
              orderItems,
              customer: null,
              address: null,
              products: {},
              provinceName: null,
              districtName: null,
              isLoaded: false,
            };
          })
        );
        setDetailsCache(newDetailsCache);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }, [status, searchTerm]);

    useEffect(() => {
      fetchOrders();
    }, [fetchOrders, page, rowsPerPage, dateRange]);

    const fetchOrderDetails = useCallback(
      async (orderId: string) => {
        const cacheEntry = detailsCache[orderId];
        if (cacheEntry?.isLoaded) return;

        try {
          const order = orders.find((o) => o.id === orderId);
          let customer: PBCustomer | null = null;
          if (order && order.customer_id) {
            try {
              customer = (await pb
                .collection('customers')
                .getOne(order.customer_id)) as PBCustomer;
            } catch (err) {
              console.warn('Failed to fetch customer:', err);
            }
          }

          let address: PBAddress | null = null;
          let provinceName: string | null = null;
          let districtName: string | null = null;
          if (order && order.address_id) {
            try {
              address = (await pb
                .collection('addresses')
                .getOne(order.address_id)) as PBAddress;
              if (address.province_id) {
                try {
                  const provinceData = await pb
                    .collection('provinces')
                    .getOne(address.province_id);
                  provinceName = provinceData.name;
                } catch (err) {
                  console.warn('Failed to fetch province:', err);
                }
              }
              if (address.district_id) {
                try {
                  const districtData = await pb
                    .collection('districts')
                    .getOne(address.district_id);
                  districtName = districtData.name;
                } catch (err) {
                  console.warn('Failed to fetch district:', err);
                }
              }
            } catch (err) {
              console.warn('Failed to fetch address:', err);
            }
          }

          const productIds = detailsCache[orderId].orderItems.map(
            (item) => item.product_id
          );
          const uniqueProductIds = Array.from(new Set(productIds));
          const productPromises = uniqueProductIds.map(async (productId) => {
            try {
              const productData = await pb
                .collection('products')
                .getOne(productId);
              return {
                id: productId,
                data: productData as unknown as PBProduct,
              };
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
              customer,
              address,
              products,
              provinceName,
              districtName,
              isLoaded: true,
            },
          }));
        } catch (err) {
          console.error('Error fetching order details:', err);
        }
      },
      [orders, detailsCache]
    );

    const handleToggle = (orderId: string) => {
      const newOpenOrderId = openOrderId === orderId ? null : orderId;
      setOpenOrderId(newOpenOrderId);
    };

    useEffect(() => {
      if (openOrderId) {
        fetchOrderDetails(openOrderId);
      }
    }, [openOrderId, fetchOrderDetails]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        setDialogMessage('Order not found!');
        setDialogOpen(true);
        return;
      }
      const oldStatus = order.status;

      // Prevent no change
      if (oldStatus === newStatus) {
        return;
      }

      try {
        // Logic for updating sell_count based on status change
        if (newStatus === 'purchased' && oldStatus !== 'purchased') {
          const orderItems = await pb.collection('order_items').getFullList({
            filter: `order_id = "${orderId}"`,
          });

          // Check stock for all items first
          for (const item of orderItems) {
            const product = await pb
              .collection('products')
              .getOne(item.product_id);
            if (
              product.total_count <
              (product.sell_count || 0) + item.quantity
            ) {
              setDialogMessage(
                translate('not_enough_stock', {
                  product: product.name,
                  available:
                    product.total_count - (product.sell_count || 0),
                  required: item.quantity,
                })
              );
              setDialogOpen(true);
              return; // Abort status change
            }
          }

          // All products have enough stock, proceed to update sell_counts
          for (const item of orderItems) {
            const product = await pb
              .collection('products')
              .getOne(item.product_id);
            const newSellCount = (product.sell_count || 0) + item.quantity;
            await pb
              .collection('products')
              .update(item.product_id, { sell_count: newSellCount });
          }
        } else if (
          newStatus === 'cancel' &&
          ['purchased', 'delivering', 'completed'].includes(oldStatus)
        ) {
          const orderItems = await pb.collection('order_items').getFullList({
            filter: `order_id = "${orderId}"`,
          });

          for (const item of orderItems) {
            try {
              const product = await pb
                .collection('products')
                .getOne(item.product_id);
              const newSellCount = (product.sell_count || 0) - item.quantity;
              await pb.collection('products').update(item.product_id, {
                sell_count: Math.max(0, newSellCount),
              });
            } catch (productError) {
              console.error(
                `Failed to revert product count for product ${item.product_id}:`,
                productError
              );
            }
          }
        }

        // Finally, update the order status
        await pb.collection('orders').update(orderId, { status: newStatus });

        setOpenOrderId(null);
        fetchOrders();
        fetchOrderCounts();
      } catch (error) {
        console.error('Error updating order status:', error);
        // Check if the error is a PocketBase error and has a response
        if (error && typeof error === 'object' && 'response' in error) {
          const pbError = error as {
            response: { status: number; data: any };
          };
          if (pbError.response && pbError.response.status === 400) {
            setDialogMessage(
              'Failed to update order status: Invalid data. Please check stock levels and try again.'
            );
          } else {
            setDialogMessage('Failed to update order status.');
          }
        } else {
          setDialogMessage(
            'An unknown error occurred while updating order status.'
          );
        }
        setDialogOpen(true);
      }
    };

    if (loading) return <Loading />;
    if (error) return <Alert severity='error'>{error}</Alert>;

    if (orders.length === 0) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant='body1' color='text.secondary'>
            {translate('no_orders_found')} {status}
          </Typography>
        </Box>
      );
    }
    if (!Array.isArray(orders)) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity='error'>
            {translate('orders.invalid_data_format')}
          </Alert>
        </Box>
      );
    }

    return (
      <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow key={status}>
              <TableCell>{translate('fields.basket.date')}</TableCell>
              <TableCell>{translate('fields.basket.reference')}</TableCell>
              <TableCell>{translate('fields.basket.customer')}</TableCell>
              <TableCell>{translate('fields.phone')}</TableCell>
              <TableCell>{translate('fields.address')}</TableCell>
              <TableCell>{translate('fields.status')}</TableCell>
              <TableCell>{translate('fields.basket.total')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <OrderDetail
                key={order.id}
                order={order}
                details={detailsCache[order.id]}
                onToggle={() => handleToggle(order.id)}
                open={openOrderId === order.id}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby='info-dialog-title'
        aria-describedby='info-dialog-description'
      >
        <DialogTitle id='info-dialog-title'>{translate('error')}</DialogTitle>
        <DialogContent>
          <DialogContentText id='info-dialog-description'>
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color='primary' autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      </>
    );
  }
);

export default OrderList;
