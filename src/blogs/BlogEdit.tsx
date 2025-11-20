import { lazy, useEffect } from 'react';
import {
  DeleteButton,
  Edit,
  FormDataConsumer,
  ImageField,
  ImageInput,
  NumberInput,
  required,
  ShowButton,
  SimpleForm,
  Toolbar,
  SaveButton,
  DeleteWithConfirmButton,
  TextInput,
  TopToolbar,
  useRefresh,
  useTranslate,
} from 'react-admin';
import { useImageStore } from '../store/imageStore';
import { useLocation } from 'react-router';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';
import { Divider } from '@mui/material';

const RichTextInput = lazy(() =>
  import('ra-input-rich-text').then((m) => ({ default: m.RichTextInput }))
);

const BlogEditActions = () => (
  <TopToolbar>
    <ShowButton />
  </TopToolbar>
);

export const BlogEdit = () => {
  const { selectImage, setSelectImage } = useImageStore(); // Use the store
  const refresh = useRefresh();
  const translate = useTranslate();

  // Clear selectImage when route changes
  const location = useLocation();
  useEffect(() => {
    setSelectImage(null);
    refresh();
  }, [location.pathname, setSelectImage]);

  return (
    <Edit actions={<BlogEditActions />}>
      <SimpleForm toolbar={<BlogEditFormToolbar />}>
        {/* <TextField source='id' /> */}
        <TextInput source='title' validate={[required()]} fullWidth label={translate('resources.blogs.fields.title')} />

        <Divider sx={{ my: 0.2 }} />

        <ImageInput
          source='image'
          label={translate('resources.blogs.fields.image')}
          onChange={(e) => {
            setSelectImage(e);
          }}
          placeholder={translate('image_input_placeholder')}
        >
          <ImageField source='src' title='title' />
        </ImageInput>
        <ImageField
          source='image_url'
          label={translate('resources.blogs.fields.current_image')}
          sx={{
            display: selectImage !== null ? 'none' : 'block',
          }}
        />

        <Divider sx={{ my: 0.2 }} />

        <div style={{ alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button
              type='button'
              onClick={async (e) => {
                e.preventDefault();
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async () => {
                  if (input.files && input.files[0]) {
                    try {
                      const url = await uploadImageToCloudinary(input.files[0]);
                      // Copy image URL to clipboard
                      await navigator.clipboard.writeText(url);
                      // Show alert notification
                      alert(translate('upload_image_success'));
                      // Find the contenteditable div of RichTextInput
                      const rte = document.querySelector(
                        '[contenteditable="true"][role="textbox"]'
                      );
                      if (rte) {
                        // Insert image at the caret position
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = 'uploaded image';
                        // Insert image at caret
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount > 0) {
                          const range = sel.getRangeAt(0);
                          range.collapse(false);
                          range.insertNode(img);
                          // Move caret after the image
                          range.setStartAfter(img);
                          range.setEndAfter(img);
                          sel.removeAllRanges();
                          sel.addRange(range);
                        } else {
                          rte.appendChild(img);
                        }
                        // Trigger input event to update form value
                        rte.dispatchEvent(
                          new Event('input', { bubbles: true })
                        );
                      }
                    } catch (err) {
                      alert(translate('upload_image_failure'));
                    }
                  }
                };
                input.click();
              }}
              style={{
                marginRight: 8,
                cursor: 'pointer',
                padding: '8px 16px',
                backgroundColor: '#3f51b5',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              {translate('upload_image')}
            </button>
          </div>
          <RichTextInput
            source='description'
            validate={[required()]}
            fullWidth
          />
        </div>

        <Divider sx={{ my: 0.2 }} />

        <RichTextInput
          source='description_la'
          label={translate('resources.blogs.fields.description_la')}
          fullWidth
        />

        <NumberInput source='count' label={translate('resources.blogs.fields.count')} />
        {/* <TextInput source='video_url' fullWidth /> */}
        {/* <DateField source='created' /> */}
        {/* <DateField source='updated' /> */}

        <h3>{translate('preview')}</h3>
        <FormDataConsumer>
          {({ formData }) => (
            <div
              style={{
                marginTop: 2,
                padding: 16,
                border: '1px solid #ccc',
                borderRadius: 8,
              }}
            >
              <h2>{formData.title}</h2>
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt={formData.title || 'Blog preview'}
                  loading='lazy'
                  decoding='async'
                  style={{
                    marginTop: 16,
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 8,
                  }}
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: formData.description }} />
            </div>
          )}
        </FormDataConsumer>
      </SimpleForm>
    </Edit>
  );
};

const BlogEditFormToolbar = () => {
  const translate = useTranslate();
  return (
    <Toolbar sx={{ display: 'flex' }}>
      <SaveButton />
      <span style={{ marginLeft: 'auto' }}>
        <DeleteWithConfirmButton
          confirmTitle={translate('confirm_delete')}
          confirmContent={translate('confirm_delete_message')}
          mutationMode='pessimistic'
        />
      </span>
    </Toolbar>
  );
};
