import {
  AttachMoney,
  CalendarToday,
  Category,
  Inventory,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  ImageList,
  ImageListItem,
  Typography,
} from '@mui/material';
import { humanize } from 'inflection';
import {
  DateField,
  FunctionField,
  NumberField,
  ReferenceField,
  RichTextField,
  Show,
  useRecordContext,
  useTranslate,
} from 'react-admin';
import { useCurrencyContext } from '../components/CurrencySelector/CurrencyProvider';
import { useLocaleState } from 'react-admin';

const ProductTitle = () => {
  const record = useRecordContext();
  const [locale] = useLocaleState();
  if (!record) return null;

  const title = locale === 'la' ? record.name_la : humanize(record.name);

  return (
    <>
      <title>{title}</title>
      <span>{title}</span>
    </>
  );
};

const ProductImage = () => {
  const translate = useTranslate();
  const record = useRecordContext();
  const [locale] = useLocaleState();

  if (!record) return null;

  const imageUrls = Array.isArray(record.image_url)
    ? record.image_url
    : [record.image_url];
  const validImageUrls = imageUrls.filter((url) => url && url.trim() !== '');

  const altText = locale === 'la' ? record.name_la : record.name;

  if (validImageUrls.length === 0) {
    return (
      <CardMedia
        component='img'
        image='/placeholder-product.svg'
        alt={altText || translate('product_image')}
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: 2,
          maxHeight: 400,
          objectFit: 'cover',
          bgcolor: 'grey.100',
        }}
      />
    );
  }

  if (validImageUrls.length === 1) {
    return (
      <CardMedia
        component='img'
        image={validImageUrls[0]}
        alt={altText || translate('product_image')}
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: 2,
          maxHeight: 400,
          objectFit: 'cover',
          bgcolor: 'grey.100',
        }}
        onError={(e: any) => {
          e.target.src = '/placeholder-product.svg';
        }}
      />
    );
  }

  return (
    <ImageList variant='masonry' cols={2} gap={8}>
      {validImageUrls.map((imageUrl, index) => (
        <ImageListItem key={index}>
          <CardMedia
            component='img'
            image={imageUrl}
            alt={`${altText || translate('product')} ${translate(
              'image'
            )} ${index + 1}`}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              objectFit: 'cover',
              bgcolor: 'grey.100',
            }}
            onError={(e: any) => {
              e.target.src = '/placeholder-product.svg';
            }}
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

const ProductShow = () => {
  const { displayCurrency } = useCurrencyContext();
  const translate = useTranslate();
  const [locale] = useLocaleState();

  return (
    <Show title={<ProductTitle />}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <ProductImage />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h5' gutterBottom>
                  {translate('product_information')}
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <FunctionField
                    render={(record: any) =>
                      locale === 'la' ? record.name_la : record.name
                    }
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: 'primary.main',
                      mb: 1,
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant='h6'
                    sx={{ fontSize: '1rem', fontWeight: 600, mr: 1 }}
                  >
                    {translate('price')}:
                  </Typography>
                  <NumberField
                    source='price'
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  />
                  <Typography
                    variant='h6'
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      ml: 0.5,
                    }}
                  >
                    {displayCurrency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Category color='primary' sx={{ mr: 1 }} />
                  <ReferenceField source='category_id' reference='categories'>
                    <FunctionField
                      render={(record: any) => (
                        <Chip
                          label={locale === 'la' ? record.name_la : record.name}
                          color='primary'
                          variant='outlined'
                        />
                      )}
                    />
                  </ReferenceField>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Inventory color='primary' sx={{ mr: 1 }} />
                  <Typography
                    variant='h6'
                    sx={{ fontSize: '1rem', fontWeight: 600, mr: 1 }}
                  >
                    {translate('total_count')}:
                  </Typography>
                  <FunctionField
                    render={(record: any) =>
                      record.total_count - record.sell_count
                    }
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney color='primary' sx={{ mr: 1 }} />
                  <Typography
                    variant='h6'
                    sx={{ fontSize: '1rem', fontWeight: 600, mr: 1 }}
                  >
                    {translate('sell_count')}:
                  </Typography>
                  <NumberField
                    source='sell_count'
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h5' sx={{ mb: 1, color: 'text.primary' }}>
                  {translate('description')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('english')}
                  </Typography>
                  <RichTextField
                    source='description'
                    sx={{
                      '& .RaTextField-text': {
                        lineHeight: 1.6,
                        color: 'text.secondary',
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('lao')}
                  </Typography>
                  <RichTextField
                    source='description_la'
                    label=''
                    sx={{
                      '& .RaTextField-text': {
                        lineHeight: 1.6,
                        color: 'text.secondary',
                        fontStyle: 'italic',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h5' sx={{ mb: 2, color: 'text.primary' }}>
                  {translate('product_details')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('english')}
                  </Typography>
                  <RichTextField
                    source='details'
                    sx={{
                      '& .RaRichTextField-root': {
                        lineHeight: 1.6,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('lao')}
                  </Typography>
                  <RichTextField
                    source='details_la'
                    label=''
                    sx={{
                      '& .RaRichTextField-root': {
                        lineHeight: 1.6,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant='h5' gutterBottom>
                  {translate('timestamps')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday
                        fontSize='small'
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                      <Box>
                        <Typography
                          variant='caption'
                          display='block'
                          color='text.secondary'
                        >
                          {translate('created')}
                        </Typography>
                        <DateField source='created' />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Inventory
                        fontSize='small'
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                      <Box>
                        <Typography
                          variant='caption'
                          display='block'
                          color='text.secondary'
                        >
                          {translate('updated')}
                        </Typography>
                        <DateField source='updated' />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Show>
  );
};

export default ProductShow;
