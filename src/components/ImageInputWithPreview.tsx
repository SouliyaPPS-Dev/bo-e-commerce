import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton } from '@mui/material';
import {
  ImageField,
  ImageInput,
  useInput,
  useRecordContext,
  useTranslate,
} from 'react-admin';
import { useImageStore } from '../store/imageStore';

const PLACEHOLDER_IMAGE_URL = 'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg';

interface ImageInputWithPreviewProps {
  source?: string;
  label?: string;
  onImageSelect?: (image: any) => void;
}

const ImageInputWithPreview = ({
  source = 'image',
  label,
  onImageSelect,
}: ImageInputWithPreviewProps) => {
  const translate = useTranslate();
  const { field } = useInput({ source });
  const { selectImage, setSelectImage } = useImageStore();
  const record = useRecordContext();

  const handleImageChange = (e: any) => {
    if (e) {
      setSelectImage(e);
      onImageSelect?.(e);
    }
  };

  const handleDeleteCurrentImage = () => {
    setSelectImage(null);
    field.onChange(PLACEHOLDER_IMAGE_URL);
  };

  const handleDeleteNewImage = () => {
    setSelectImage(null);
    field.onChange(null);
  };

  // Show current image only if no new image is selected and it's not a create form
  const showCurrentImage =
    selectImage === null && record?.image_url && !field.value;

  // Show placeholder image when user has clicked delete
  const showPlaceholderImage = field.value === PLACEHOLDER_IMAGE_URL;

  return (
    <Box sx={{ width: '100%' }}>
      <ImageInput
        source={source}
        label={label || translate('resources.categories.fields.image')}
        onChange={handleImageChange}
      >
        <ImageField source='src' title='title' />
      </ImageInput>

      {/* Placeholder Image Preview - Only shown after user deletes current image */}
      {showPlaceholderImage && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '2px solid #ff9800',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: '#fff3e0',
          }}
        >
          <img
            src={PLACEHOLDER_IMAGE_URL}
            alt='Placeholder image'
            style={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#e65100', fontWeight: 600 }}>
              Placeholder Image (Deleted)
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#bf360c' }}>
              {translate('resources.categories.fields.new_image_hint') || 'This will be sent to API on save'}
            </p>
          </Box>
          <IconButton
            size='small'
            color='error'
            onClick={handleDeleteNewImage}
            title={translate('ra.action.delete') || 'Remove placeholder'}
            sx={{
              '&:hover': {
                backgroundColor: '#ffebee',
              },
            }}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      )}

      {/* Current Image Preview - Only shown on edit when no new image is selected */}
      {showCurrentImage && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid #ddd',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: '#f9f9f9',
          }}
        >
          <img
            src={record.image_url}
            alt={record.name || 'Current image'}
            style={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
              {translate('resources.categories.fields.current_image')}
            </p>
          </Box>
          <IconButton
            size='small'
            color='error'
            onClick={handleDeleteCurrentImage}
            title={translate('ra.action.delete') || 'Delete image'}
            sx={{
              '&:hover': {
                backgroundColor: '#ffebee',
              },
            }}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      )}

      {/* New Image Selected Preview */}
      {selectImage !== null && field.value && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '2px solid #4caf50',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: '#f1f8e9',
          }}
        >
          {typeof field.value === 'string' &&
          field.value.startsWith('blob:') ? (
            <Box
              sx={{
                width: 80,
                height: 80,
                backgroundColor: '#e8f5e9',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4caf50',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              New Image
            </Box>
          ) : (
            <></>
          )}
          <Box sx={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#2e7d32' }}>
              {translate('resources.categories.fields.new_image') ||
                'New image selected'}
            </p>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '0.75rem',
                color: '#558b2f',
              }}
            >
              {translate('resources.categories.fields.new_image_hint')}
            </p>
          </Box>
          <IconButton
            size='small'
            color='error'
            onClick={handleDeleteNewImage}
            title={translate('ra.action.delete') || 'Remove new image'}
            sx={{
              '&:hover': {
                backgroundColor: '#ffebee',
              },
            }}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ImageInputWithPreview;
