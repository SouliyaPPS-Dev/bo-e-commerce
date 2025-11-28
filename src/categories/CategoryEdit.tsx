import {
  DataTable,
  Edit,
  EditButton,
  ImageField,
  Labeled,
  ReferenceManyField,
  SimpleForm,
  TextInput,
  TopToolbar,
  Toolbar,
  SaveButton,
  useDefaultTitle,
  useEditContext,
  useRefresh,
  useTranslate,
} from 'react-admin';

import { Avatar, Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  formatCurrency,
  useCurrencyContext,
} from '../components/CurrencySelector/CurrencyProvider';
import ThumbnailField from '../products/ThumbnailField';
import { useImageStore } from '../store/imageStore';
import CategoryImageInput from './CategoryImageInput';
import { type Product } from '../types';

export interface ProductCategory {
  collectionId: string;
  collectionName: string;
  id: string;
  name: string;
  name_la: string;
  image_url: string;
  created: string;
  updated: string;
}

const Column = DataTable.Col<Product>;
const ColumnNumber = DataTable.NumberCol<Product>;

const ImageUrlField = (record: ProductCategory | any) => {
  if (!record?.image_url) return null;

  return (
    <Avatar
      src={record.image_url}
      alt={record.name}
      sx={{ width: 42, height: 42 }}
    />
  );
};

const CategoryEditActions = () => <TopToolbar />;

const CategoryEdit = () => {
  const { displayCurrency, convert } = useCurrencyContext();
  const { setSelectImage } = useImageStore();
  const refresh = useRefresh();
  const translate = useTranslate();

  // Clear selectImage when route changes
  const location = useLocation();
  useEffect(() => {
    setSelectImage(null);
    refresh();
  }, [location.pathname, setSelectImage]);

  return (
    <Edit
      title={<CategoryTitle />}
      actions={<CategoryEditActions />}
      mutationMode='pessimistic'
      mutationOptions={{
        onSuccess: () => {
          // Clear the image store after successful update
          setSelectImage(null);
        },
      }}
    >
      <SimpleForm toolbar={<CategoryEditFormToolbar />}>
        <Box
          display='flex'
          flexDirection='column'
          gap={2}
          width='100%'
          maxWidth={600}
        >
          <Typography variant='h6' gutterBottom>
            {translate('resources.categories.form_title_edit')}
          </Typography>

          <TextInput
            source='name'
            label={translate('resources.categories.fields.name')}
          />
          <TextInput
            source='name_la'
            label={translate('resources.categories.fields.name_la')}
          />
          <CategoryImageInput
            source='image'
            label={translate('resources.categories.fields.image')}
            onImageSelect={() => {
              // This will be called when image is selected
            }}
          />

          <Labeled
            label={translate('resources.categories.fields.products')}
            fullWidth
          >
            <ReferenceManyField
              reference='products'
              target='category_id'
              perPage={20}
            >
              <DataTable
                sx={{ maxWidth: 800, marginLeft: 0, marginRight: 'auto' }}
              >
                <Column
                  sx={{ width: 25, padding: 0 }}
                  field={ThumbnailField}
                  label={false}
                />
                <Column
                  source='image_url'
                  render={ImageUrlField}
                  label={translate('resources.products.fields.image_url')}
                />
                <ColumnNumber
                  source='name'
                  label={translate('resources.products.fields.name')}
                  options={{ minimumFractionDigits: 2 }}
                />
                <Column
                  label={translate('resources.categories.fields.price')}
                  render={(record: Product) =>
                    `${formatCurrency(
                      convert(record.price || 0)
                    )} ${displayCurrency}`
                  }
                />

                <Column align='right'>
                  <EditButton />
                </Column>
              </DataTable>
            </ReferenceManyField>
          </Labeled>
        </Box>
      </SimpleForm>
    </Edit>
  );
};

const CategoryTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return (
    <>
      <title>{`${appTitle} - ${defaultTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export default CategoryEdit;

const CategoryEditFormToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);
