import * as React from 'react';
import {
  ImageInput,
  ImageField,
  TextInput,
  useInput,
  useRecordContext,
  useTranslate,
} from 'react-admin';
import { Box } from '@mui/material';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

interface ImageUploadFieldProps {
  source: string;
  label?: string;
}

const ImageUploadField = (props: ImageUploadFieldProps) => {
  const translate = useTranslate();
  const { source, label } = props;
  const previewAlt = label ? `${label} preview` : 'Image preview';
  const record = useRecordContext(props);
  const { field } = useInput({
    source,
  });

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadImageToCloudinary(file);
      field.onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        width: '100%',
      }}
    >
      <Box sx={{ flex: 2 }}>
        <TextInput
          source={source}
          label={label || 'Image URL'}
          fullWidth
          value={field.value || ''}
          onChange={field.onChange}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 180 }}>
        <ImageInput
          source={`_image_upload_${source}`}
          label='Upload Image'
          onChange={(file) => {
            if (file) {
              handleImageUpload(file);
            }
          }}
          placeholder={translate('image_input_placeholder')}
        >
          <ImageField source='src' title='title' />
        </ImageInput>
      </Box>
      <Box
        sx={{
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #eee',
          borderRadius: 1,
          background: '#fafafa',
        }}
      >
        {field.value && typeof field.value === 'string' && (
          <img
            src={field.value}
            alt={previewAlt}
            loading='lazy'
            decoding='async'
            width={100}
            height={100}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ImageUploadField;
