import * as React from 'react';
import {
  ImageInput,
  ImageField,
  TextInput,
  useInput,
  useRecordContext,
  useTranslate,
} from 'react-admin';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

const PLACEHOLDER_IMAGE_URL = 'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg';

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

  const handleDeleteImage = () => {
    field.onChange(PLACEHOLDER_IMAGE_URL);
  };

  const isPlaceholder = field.value === PLACEHOLDER_IMAGE_URL;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: 2,
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isPlaceholder ? '2px solid #ff9800' : '1px solid #eee',
              borderRadius: 1,
              background: isPlaceholder ? '#fff3e0' : '#fafafa',
              position: 'relative',
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
          {field.value && field.value !== PLACEHOLDER_IMAGE_URL && (
            <IconButton
              size='small'
              color='error'
              onClick={handleDeleteImage}
              title={translate('ra.action.delete') || 'Delete image'}
              sx={{
                padding: 0.5,
                '&:hover': {
                  backgroundColor: '#ffebee',
                },
              }}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          )}
          {isPlaceholder && (
            <Box sx={{ fontSize: '0.75rem', color: '#e65100', textAlign: 'center' }}>
              Placeholder Set
            </Box>
          )}
        </Box>
      </Box>

      {/* Placeholder indicator message */}
      {isPlaceholder && (
        <Box
          sx={{
            p: 1.5,
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: 1,
            fontSize: '0.875rem',
            color: '#e65100',
          }}
        >
          ⚠️ Placeholder image URL will be sent to API on save
        </Box>
      )}
    </Box>
  );
};

export default ImageUploadField;
