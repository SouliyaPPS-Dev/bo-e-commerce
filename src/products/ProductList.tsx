import {
  Check as CheckIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List as MuiList,
  TextField as MuiTextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import {
  Confirm,
  CreateButton,
  ExportButton,
  InputProps,
  List,
  RecordContextProvider,
  SortButton,
  Title,
  TopToolbar,
  useDataProvider,
  useDefaultTitle,
  useDelete,
  useListContext,
  useLocaleState,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
} from 'react-admin';
import { useCurrencyContext } from '../components/CurrencySelector/CurrencyProvider';
import { formatCurrency } from '../utils/format';
import { humanize } from 'inflection';

const ProductList = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

  return (
    <List
      perPage={24}
      sort={{ field: 'name', order: 'ASC' }}
      actions={<ListActions />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <ProductFilters />
        <Box sx={{ flex: 1 }}>
          <ProductGrid />
        </Box>
      </Box>
    </List>
  );
};

const ProductGrid = () => {
  const translate = useTranslate();
  const { data, isLoading } = useListContext();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Grid container spacing={2} sx={{ px: { xs: 1, sm: 2 } }}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >
            <Card
              sx={{
                minWidth: '200px',
                height: 300,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ height: 200, bgcolor: 'grey.200' }} />
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ height: 20, bgcolor: 'grey.200', mb: 1 }} />
                <Box sx={{ height: 16, bgcolor: 'grey.200', width: '60%' }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant='h6' color='textSecondary'>
          {translate('no_products_found')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 2, pb: 4 }}>
      <Grid container spacing={2} sx={{ px: { xs: 1, sm: 2 } }}>
        {data.map((record: any) => (
          <Grid
            key={record.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >
            <RecordContextProvider value={record}>
              <ProductCard />
            </RecordContextProvider>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const ProductCard = () => {
  const translate = useTranslate();
  const record = useRecordContext();
  const theme = useTheme();
  const [locale] = useLocaleState();

  const { displayCurrency, convert } = useCurrencyContext();

  if (!record) return null;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        cursor: 'pointer',
        p: { xs: 1, sm: 1 },
        backgroundColor: '#FFFFFF',
        boxShadow:
          '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      }}
      // go to edit product
      onClick={() => {
        window.location.href = `#/products/${record.id}/show`;
      }}
    >
      <CardMedia
        component='img'
        image={
          Array.isArray(record.image_url)
            ? record.image_url.length > 0
              ? record.image_url[0]
              : '/placeholder-product.svg'
            : record.image_url || '/placeholder-product.svg'
        }
        alt={record.name}
        sx={{
          objectFit: 'cover',
          bgcolor: 'grey.100',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
        }}
        onError={(e: any) => {
          e.target.src = '/placeholder-product.svg';
        }}
      />
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          pb: 1,
        }}
      >
        <Typography
          variant='h6'
          component='h3'
          gutterBottom
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {locale === 'la' ? record.name_la : record.name}
        </Typography>

        <Typography
          variant='h6'
          color='#000000'
          sx={{
            fontWeight: 600,
            fontSize: '1.1rem',
            wordBreak: 'break-word',
          }}
        >
          {formatCurrency(convert(record.price))} {displayCurrency}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Typography variant='caption' color='textSecondary'>
            {translate('total_count')}: {record.total_count - record.sell_count || 0}
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            {translate('sell_count')}: {record.sell_count || 0}
          </Typography>
        </Box>

        <Typography variant='caption' color='textSecondary'>
          {translate('updated')}:{' '}
          {new Date(record.updated).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
        <Box>
          {/* <IconButton
            size='small'
            component='a'
            href={`#/products/${record.id}/show`}
            sx={{ color: 'info.main' }}
            onClick={(e) => e.stopPropagation()}
          >
            <VisibilityIcon fontSize='small' />
          </IconButton> */}
          <IconButton
            size='small'
            component='a'
            href={`#/products/${record.id}`}
            sx={{ color: 'primary.main' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}
            >
              <EditIcon fontSize='small' />
              {translate('edit')}
            </Box>
          </IconButton>
        </Box>
        <DeleteProductButton record={record} />
      </CardActions>
    </Box>
  );
};

const DeleteProductButton = ({ record }: any) => {
  const translate = useTranslate();
  const [open, setOpen] = React.useState(false);
  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteProduct, { isLoading }] = useDelete();

  const handleClick = (e: any) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleDialogClose = (e: any) => {
    e.stopPropagation();
    setOpen(false);
  };

  const handleConfirm = (e: any) => {
    e.stopPropagation();
    deleteProduct(
      'products',
      { id: record.id, previousData: record },
      {
        onSuccess: () => {
          notify(translate('product_deleted'));
          refresh();
        },
        onError: () => {
          notify(translate('product_delete_error'), { type: 'warning' });
        },
      }
    );
    setOpen(false);
  };

  return (
    <>
      <IconButton
        size='small'
        onClick={handleClick}
        disabled={isLoading}
        sx={{ color: 'error.main' }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', typography: 'body1' }}
        >
          <DeleteIcon fontSize='small' />
          {translate('delete')}
        </Box>
      </IconButton>
      <Confirm
        isOpen={open}
        loading={isLoading}
        title={translate('delete_product')}
        content={translate('delete_product_confirmation')}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  );
};

const ProductTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useListContext();

  return (
    <>
      <title>{`${appTitle} - ${defaultTitle}`}</title>
      <Title defaultTitle={defaultTitle} />
    </>
  );
};

const QuickFilter = ({ label }: InputProps) => {
  const translate = useTranslate();
  return <Chip sx={{ mb: 1 }} label={translate(label as string)} />;
};

const ProductFilters = () => {
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { setFilters, filterValues } = useListContext();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  const [searchValue, setSearchValue] = React.useState('');
  const [locale] = useLocaleState();

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await dataProvider.getList('categories', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'name', order: 'ASC' },
          filter: {},
        });
        setCategories(data);
      } catch (error) {
        notify('Error loading categories', { type: 'warning' });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [dataProvider, notify]);

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategoryId = filterValues.category_id;
    const newCategoryId =
      currentCategoryId === categoryId ? undefined : categoryId;
    setFilters({ ...filterValues, category_id: newCategoryId }, null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    setFilters({ ...filterValues, q: value }, null);
  };

  // const handleSalesFilter = (filterType: string, value: boolean) => {
  //   setFilters({ ...filterValues, [filterType]: value }, null);
  // };

  // const handleStockFilter = (filterType: string, value: boolean) => {
  //   setFilters({ ...filterValues, [filterType]: value }, null);
  // };

  return (
    <Card
      sx={{
        order: -1,
        mr: { xs: 0, md: 2 },
        mb: { xs: 2, md: 0 },
        width: { xs: '100%', md: '16em' },
      }}
    >
      <CardContent>
        <Typography variant='h6' gutterBottom>
          {translate('filters')}
        </Typography>

        <MuiTextField
          fullWidth
          placeholder={translate('search_products')}
          value={searchValue}
          onChange={handleSearchChange}
          size='small'
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* <Typography
          variant='subtitle2'
          sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}
        >
          💰 SALES
        </Typography>
        <MuiList dense sx={{ py: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleSalesFilter('sales_best', !filterValues.sales_best)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.sales_best && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='Best sellers'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleSalesFilter('sales_average', !filterValues.sales_average)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.sales_average && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='Average'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleSalesFilter('sales_low', !filterValues.sales_low)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.sales_low && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='Low'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleSalesFilter('sales_never', !filterValues.sales_never)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.sales_never && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='Never sold'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
        </MuiList>

        <Typography
          variant='subtitle2'
          sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}
        >
          📊 STOCK
        </Typography>
        <MuiList dense sx={{ py: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleStockFilter('stock_out', !filterValues.stock_out)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.stock_out && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='Out of stock'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleStockFilter('stock_low', !filterValues.stock_low)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.stock_low && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='1-9 items'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleStockFilter('stock_medium', !filterValues.stock_medium)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.stock_medium && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='10-49 items'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                handleStockFilter('stock_high', !filterValues.stock_high)
              }
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {filterValues.stock_high && (
                  <CheckIcon fontSize='small' color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary='50 items and more'
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
        </MuiList> */}

        <Typography
          variant='subtitle2'
          sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}
        >
          {translate('categories')}
        </Typography>
        {loadingCategories ? (
          <Typography variant='body2' color='textSecondary'>
            {translate('loading_categories')}
          </Typography>
        ) : (
          <MuiList dense sx={{ py: 0 }}>
            {categories.map((category) => (
              <ListItem key={category.id} disablePadding>
                <ListItemButton
                  onClick={() => handleCategoryToggle(category.id)}
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {filterValues.category_id === category.id && (
                      <CheckIcon fontSize='small' color='primary' />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      locale === 'la'
                        ? category.name_la
                        : humanize(category.name)
                    }
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </MuiList>
        )}
      </CardContent>
    </Card>
  );
};

const ListActions = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

  return (
    <TopToolbar>
      {/* {isSmall && <FilterButton />} */}

      <SortButton fields={['name', 'price', 'created', 'updated']} />
      <CreateButton />
      <ExportButton />
    </TopToolbar>
  );
};

export default ProductList;
