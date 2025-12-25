import * as React from 'react';
import { useEffect } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  required,
  useCreateContext,
  useDefaultTitle,
  ArrayInput,
  SimpleFormIterator,
  useTranslate,
} from 'react-admin';
import ImageUploadField from '../components/ImageUploadField';
import { Divider } from '@mui/material';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';
import ProductColorSelectInput from '../components/ProductColorSelectInput';
import { useImageStore } from '../store/imageStore';

const RichTextInput = React.lazy(() =>
  import('ra-input-rich-text').then((module) => ({
    default: module.RichTextInput,
  }))
);

const ProductTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();

  return (
    <>
      <title>{`${appTitle} - ${defaultTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const ProductCreate = () => {
  const translate = useTranslate();
  const { setSelectImage } = useImageStore();

  useEffect(() => {
    // Clear image store when component mounts
    setSelectImage(null);
  }, [setSelectImage]);

  return (
    <Create
      title={<ProductTitle />}
      mutationMode='pessimistic'
      mutationOptions={{
        onSuccess: () => {
          // Clear the image store after successful creation
          setSelectImage(null);
        },
      }}
    >
      <SimpleForm sx={{ maxWidth: '40em' }}>
        <TextInput
          autoFocus
          source='name'
          validate={required()}
          fullWidth
          label={translate('name')}
        />
        <TextInput source='name_la' label={translate('name_la')} fullWidth />

        <Divider sx={{ my: 0.2 }} />

        <NumberInput
          source='price'
          validate={required()}
          min={0}
          step={0.01}
          fullWidth
          label={translate('price')}
        />

        <NumberInput
          source='old_price'
          min={0}
          step={0.01}
          fullWidth
          label={translate('old_price')}
        />

        <Divider sx={{ my: 0.2 }} />

        <NumberInput
          source='total_count'
          validate={required()}
          min={0}
          step={1}
          fullWidth
          label={translate('total_count')}
        />

        <NumberInput
          source='sell_count'
          min={0}
          step={1}
          fullWidth
          label={translate('sell_count')}
        />

        <Divider sx={{ my: 0.2 }} />

        <ReferenceInput source='category_id' reference='categories'>
          <SelectInput source='name' fullWidth validate={required()} />
        </ReferenceInput>

        <Divider sx={{ my: 0.2 }} />

        <ProductColorSelectInput
          source='colors'
          fullWidth
          label={translate('colors')}
        />

        <Divider sx={{ my: 0.2 }} />

        <SelectInput
          source='sort_by'
          fullWidth
          label={translate('sort_by')}
          choices={[
            { id: 'Newest', name: translate('sort_newest') },
            { id: 'Oldest', name: translate('sort_oldest') },
            { id: 'Popular', name: translate('sort_popular') },
          ]}
          defaultValue='Newest'
        />

        <Divider sx={{ my: 0.2 }} />

        <ArrayInput source='image_url' label={translate('image_urls')}>
          <SimpleFormIterator inline disableRemove>
            <ImageUploadField source='' label={translate('image_url')} />
          </SimpleFormIterator>
        </ArrayInput>

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
                      await navigator.clipboard.writeText(url);
                      alert(translate('upload_image_success'));
                      const rte = document.querySelector(
                        '[contenteditable="true"][role="textbox"]'
                      );
                      if (rte) {
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = 'uploaded image';
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount > 0) {
                          const range = sel.getRangeAt(0);
                          range.collapse(false);
                          range.insertNode(img);
                          range.setStartAfter(img);
                          range.setEndAfter(img);
                          sel.removeAllRanges();
                          sel.addRange(range);
                        } else {
                          rte.appendChild(img);
                        }
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
          <React.Suspense fallback={<div>Loading...</div>}>
            <RichTextInput
              source='description'
              validate={required()}
              fullWidth
              label={translate('description')}
            />
          </React.Suspense>
        </div>

        <Divider sx={{ my: 0.5 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='description_la'
            label={translate('description_la')}
            fullWidth
          />
        </React.Suspense>

        <Divider
          sx={{
            my: 0.5,
            width: '100%',
            border: '1px solid',
            color: '#1976d2', // Change to any color you want
          }}
        />
        <Divider sx={{ my: 1 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='details'
            fullWidth
            label={translate('details')}
          />
        </React.Suspense>

        <Divider sx={{ my: 0.5 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='details_la'
            label={translate('details_la')}
            fullWidth
          />
        </React.Suspense>

        <Divider sx={{ my: 0.5 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='design_story_en'
            label={translate('design_story_en')}
            fullWidth
          />
        </React.Suspense>

        <Divider sx={{ my: 0.2 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='design_story_la'
            label={translate('design_story_la')}
            fullWidth
          />
        </React.Suspense>

        <Divider sx={{ my: 0.5 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='exceptional_quality_en'
            label={translate('exceptional_quality_en')}
            fullWidth
          />
        </React.Suspense>

        <Divider sx={{ my: 0.2 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='exceptional_quality_la'
            label={translate('exceptional_quality_la')}
            fullWidth
          />
        </React.Suspense>

        <Divider sx={{ my: 0.5 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='ethical_craft_en'
            label={translate('ethical_craft_en')}
            fullWidth
          />
        </React.Suspense>

        <Divider sx={{ my: 0.2 }} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <RichTextInput
            source='ethical_craft_la'
            label={translate('ethical_craft_la')}
            fullWidth
          />
        </React.Suspense>
      </SimpleForm>
    </Create>
  );
};

export default ProductCreate;
