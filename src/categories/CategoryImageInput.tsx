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

interface CategoryImageInputProps {
  source?: string;
  label?: string;
  onImageSelect?: (image: any) => void;
}

const CategoryImageInput = ({
  source = 'image',
  label,
  onImageSelect,
}: CategoryImageInputProps) => {
  const translate = useTranslate();
  const { field } = useInput({ source });
  const { selectImage, setSelectImage, setIsUploading, clearImageState } =
    useImageStore();
  const record = useRecordContext();

  const handleImageChange = (e: any) => {
    if (e) {
      setSelectImage(e);
      onImageSelect?.(e);
    }
  };

  const handleDeleteImage = () => {
    setSelectImage(null);
    field.onChange(null);
  };

  // Show current image only if no new image is selected and it's not a create form
  const showCurrentImage =
    selectImage === null && record?.image_url && !field.value;

  return (
    <Box sx={{ width: '100%' }}>
      <ImageInput
        source={source}
        label={label || translate('resources.categories.fields.image')}
        onChange={handleImageChange}
      >
        <ImageField source='src' title='title' />
      </ImageInput>

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
            onClick={handleDeleteImage}
            title={translate('ra.action.delete') || 'Delete image'}
            sx={{
              display: showCurrentImage ? 'none' : 'block',
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
            onClick={() => {
              setSelectImage(null);
              field.onChange(null);
            }}
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

export default CategoryImageInput;
