import { Box, Typography } from '@mui/material';
import {
  Create,
  required,
  SimpleForm,
  TextInput,
  Title,
  useTranslate,
  useNotify,
  useRedirect,
} from 'react-admin';
import { useEffect } from 'react';
import { useImageStore } from '../store/imageStore';
import CategoryImageInput from './CategoryImageInput';

const CategoryCreate = () => {
  const translate = useTranslate();
  const { setSelectImage } = useImageStore();

  useEffect(() => {
    // Clear image store when component mounts (page refresh)
    setSelectImage(null);
  }, [setSelectImage]);

  return (
    <Create
      title={<Title title={translate('resources.categories.create_title')} />}
      mutationMode='pessimistic'
      mutationOptions={{
        onSuccess: () => {
          // Clear the image store after successful creation
          setSelectImage(null);
        },
      }}
    >
      <CategoryCreateForm />
    </Create>
  );
};

const CategoryCreateForm = () => {
  const translate = useTranslate();
  const { setSelectImage } = useImageStore();

  return (
    <SimpleForm>
      <Box
        display='flex'
        flexDirection='column'
        gap={2}
        width='100%'
        maxWidth={600}
      >
        <Typography variant='h6' gutterBottom>
          {translate('resources.categories.form_title')}
        </Typography>

        <TextInput
          source='name'
          label={translate('resources.categories.fields.name')}
          validate={[required()]}
          fullWidth
        />

        <TextInput
          source='name_la'
          label={translate('resources.categories.fields.name_la')}
          validate={[required()]}
          fullWidth
        />

        <CategoryImageInput
          source='image'
          label={translate('image_input_placeholder')}
          onImageSelect={() => {
            // This will be called when image is selected
          }}
        />
      </Box>
    </SimpleForm>
  );
};

export default CategoryCreate;