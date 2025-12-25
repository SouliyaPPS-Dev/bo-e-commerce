import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Button } from '@mui/material';
import { useCallback } from 'react';
import { useSimpleFormIterator, useTranslate } from 'react-admin';

const ImageUrlAddButton = () => {
  const { add } = useSimpleFormIterator();
  const translate = useTranslate();

  const handleAdd = useCallback(() => {
    add({ url: '' });
  }, [add]);

  return (
    <Button
      variant='contained'
      color='primary'
      startIcon={<AddPhotoAlternateIcon fontSize='large' />}
      onClick={handleAdd}
      sx={{
        mt: 2,
        fontWeight: 600,
        textTransform: 'none',
      }}
    >
      {translate('resources.products.actions.add_image_url')}
    </Button>
  );
};

export default ImageUrlAddButton;
