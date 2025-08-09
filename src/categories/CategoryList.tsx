import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@mui/material';
import { humanize } from 'inflection';
import {
  CreateButton,
  Edit,
  EditButton,
  List,
  RecordContextProvider,
  SimpleForm,
  TextInput,
  TopToolbar,
  useDefaultTitle,
  useListContext,
  useLocaleState,
  useRedirect,
  useRefresh, // Import TopToolbar for common action bar layout
  useTranslate,
} from 'react-admin';

import { useImageStore } from '../store/imageStore';
import LinkToRelatedProducts from './LinkToRelatedProducts';

export interface Category {
  collectionId: string;
  collectionName: string;
  id: string;
  name: string;
  name_la: string;
  image_url: string;
  created: string;
  updated: string;
}

const CategoriesTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${title} - ${defaultTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

// Custom actions component for flexible alignment
const CategoryListActions = () => {
  return (
    <TopToolbar>
      <CreateButton />
    </TopToolbar>
  );
};

const CategoryList = () => (
  <List
    sort={{ field: 'name', order: 'ASC' }}
    perPage={20}
    pagination={false}
    component='div'
    actions={<CategoryListActions />} // Use the custom actions component
    title={<CategoriesTitle />}
  >
    <CategoryGrid />
  </List>
);

const CategoryGrid = () => {
  const { data, error, isPending } = useListContext<Category>();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [locale] = useLocaleState();

  if (isPending) {
    return null;
  }
  if (error) {
    return null;
  }
  return (
    <Grid container spacing={2} sx={{ mt: 0 }}>
      {data.map((record) => (
        <RecordContextProvider key={record.id} value={record}>
          <Grid
            key={record.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
              xl: 2
            }}>
            <Card>
              <CardActionArea
                onClick={() => {
                  redirect(`/categories/${record.id}`);
                  // Clear the image state after successful upload
                  useImageStore.getState().setSelectImage(null);
                  refresh();
                }}
              >
                <CardMedia
                  image={`${record?.image_url}`}
                  sx={{ height: 140 }}
                />
                <CardContent sx={{ paddingBottom: '0.5em' }}>
                  <Typography variant='h5' component='h2' align='center'>
                    {locale === 'la'
                      ? record.name_la
                      : humanize(record.name)}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions
                sx={{
                  '.MuiCardActions-spacing': {
                    display: 'flex',
                    justifyContent: 'space-around',
                  },
                }}
              >
                <LinkToRelatedProducts />
                <EditButton label={translate('edit')} />
              </CardActions>
            </Card>
          </Grid>
        </RecordContextProvider>
      ))}
    </Grid>
  );
};

export const CategoryEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source='name' fullWidth />
      <TextInput source='image_url' fullWidth />
    </SimpleForm>
  </Edit>
);

export default CategoryList;