import {
  DateField,
  DeleteButton,
  EditButton,
  RichTextField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  useRecordContext,
  useTranslate,
} from 'react-admin';
import { Blogs } from './BlogList';

export const ImageUrlField = ({
  source,
  label,
}: {
  source: string;
  label: string;
}) => {
  const record = useRecordContext<Blogs>();
  if (!record?.image_url) return null;

  return (
    <img
      src={record.image_url}
      alt={record.collectionName || record.title}
      loading='lazy'
      decoding='async'
      style={{ width: '100%', height: 'auto', borderRadius: 8 }}
    />
  );
};

const BlogShowActions = () => (
  <TopToolbar>
    <EditButton />
    <DeleteButton />
  </TopToolbar>
);

export const BlogShow = () => {
  const translate = useTranslate();

  return (
    <Show actions={<BlogShowActions />}>
      <SimpleShowLayout>
        {/* <TextField source='id' label={translate('id')} /> */}
        <TextField source='title' label={translate('title')} />
        <ImageUrlField source='image_url' label={translate('image')} />
        <RichTextField source='description' label={translate('description')} />
        <RichTextField
          source='description_la'
          label={translate('description_la')}
        />
        <DateField source='created' label={translate('created')} showTime />
        <DateField source='updated' label={translate('updated')} showTime />
      </SimpleShowLayout>
    </Show>
  );
};
