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
import { useCurrencyContext, formatCurrency } from '../components/CurrencySelector/CurrencyProvider';
import { useLocaleState } from 'react-admin';

const parseColorValues = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined && item !== '')
      .map((item) => String(item));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item !== null && item !== undefined && item !== '')
          .map((item) => String(item));
      }
    } catch {
      // not JSON, proceed with comma-separated fallback
    }
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [trimmed];
  }

  return [String(value)];
};

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
  const { displayCurrency, convert } = useCurrencyContext();
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
                  <FunctionField
                    render={(record: any) =>
                      record.price === 0
                        ? translate('for_auction')
                        : `${formatCurrency(convert(record.price))} ${displayCurrency}`
                    }
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  />
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

                <FunctionField
                  render={(record: any) =>
                    record.old_price ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography
                          variant='h6'
                          sx={{ fontSize: '1rem', fontWeight: 600, mr: 1 }}
                        >
                          {translate('old_price')}:
                        </Typography>
                        <NumberField
                          record={record}
                          source='old_price'
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ) : null
                  }
                />

                <FunctionField
                  render={(record: any) => {
                    if (!record.sort_by) {
                      return null;
                    }
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography
                          variant='h6'
                          sx={{ fontSize: '1rem', fontWeight: 600, mr: 1 }}
                        >
                          {translate('sort_by')}:
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {record.sort_by}
                        </Typography>
                      </Box>
                    );
                  }}
                />

                <FunctionField
                  render={(record: any) => {
                    const colorValues = parseColorValues(record.colors);
                    if (colorValues.length === 0) {
                      return null;
                    }
                    return (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant='h6'
                          sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}
                        >
                          {translate('colors')}:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {colorValues.map((color) => (
                            <Chip key={color} label={color} variant='outlined' />
                          ))}
                        </Box>
                      </Box>
                    );
                  }}
                />
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

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h5' sx={{ mb: 2, color: 'text.primary' }}>
                  {translate('design_story')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('english')}
                  </Typography>
                  <RichTextField source='design_story_en' />
                </Box>
                <Box>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('lao')}
                  </Typography>
                  <RichTextField source='design_story_la' />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h5' sx={{ mb: 2, color: 'text.primary' }}>
                  {translate('exceptional_quality')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('english')}
                  </Typography>
                  <RichTextField source='exceptional_quality_en' />
                </Box>
                <Box>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('lao')}
                  </Typography>
                  <RichTextField source='exceptional_quality_la' />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h5' sx={{ mb: 2, color: 'text.primary' }}>
                  {translate('ethical_craft')}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('english')}
                  </Typography>
                  <RichTextField source='ethical_craft_en' />
                </Box>
                <Box>
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    {translate('lao')}
                  </Typography>
                  <RichTextField source='ethical_craft_la' />
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
