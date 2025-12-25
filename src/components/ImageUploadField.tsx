import * as React from 'react';
import { ImageInput, ImageField, useInput, useTranslate } from 'react-admin';
import { Box, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

const PLACEHOLDER_IMAGE_URL =
  'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg';

interface ImageUploadFieldProps {
  source: string;
  label?: string;
  onRemove?: () => void;
}

const ImageUploadField = (props: ImageUploadFieldProps) => {
  const translate = useTranslate();
  const { source, label, onRemove } = props;
  const previewAlt = label ? `${label} preview` : 'Image preview';
  const { field } = useInput({
    source,
  });

  const currentValue = React.useMemo(() => {
    if (typeof field.value === 'string') {
      return field.value;
    }
    if (field.value && typeof field.value === 'object') {
      const possibleUrl = (field.value as { url?: unknown }).url;
      return typeof possibleUrl === 'string' ? possibleUrl : '';
    }
    return '';
  }, [field.value]);

  const extractFile = (input: any): File | null => {
    if (!input) return null;
    if (input instanceof File) {
      return input;
    }
    if (Array.isArray(input)) {
      return extractFile(input[0]);
    }
    if (input.rawFile instanceof File) {
      return input.rawFile;
    }
    const possibleFile = input?.target?.files?.[0];
    if (possibleFile instanceof File) {
      return possibleFile;
    }
    return null;
  };

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadImageToCloudinary(file);
      field.onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteImage = () => {
    field.onChange('');
  };

  const isPlaceholder = currentValue === PLACEHOLDER_IMAGE_URL;

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
          <TextField
            fullWidth
            label={label || 'Image URL'}
            value={currentValue}
            onChange={(event) => field.onChange(event.target.value ?? '')}
            variant='outlined'
            size='small'
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <ImageInput
            source={`_image_upload_${source}`}
            label='Upload Image'
            onChange={(event) => {
              const file = extractFile(event);
              if (file) {
                void handleImageUpload(file);
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
            {currentValue && (
              <img
                src={currentValue}
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
          {(onRemove || currentValue) && (
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
            <Box
              sx={{
                fontSize: '0.75rem',
                color: '#e65100',
                textAlign: 'center',
              }}
            >
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
