import { Avatar, Typography } from '@mui/material';
import {
  BulkDeleteButton,
  CreateButton,
  DataTable,
  DateField,
  DeleteWithConfirmButton,
  EditButton,
  ExportButton,
  FilterButton,
  List,
  NumberInput,
  SearchInput,
  TextInput,
  TopToolbar,
  useRecordContext,
  useTranslate,
} from 'react-admin';

export interface Blogs {
  collectionId: string;
  collectionName: string;
  id: string;
  image_url: string;
  title: string;
  description: string;
  video_url: string;
  count: number;
  created: string;
  updated: string;
}

const DescriptionField = () => {
  const record = useRecordContext();
  if (!record?.description) return null;

  // Strip HTML tags and limit text length for list view
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const plainText = stripHtml(record.description);
  const truncatedText =
    plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;

  return (
    <Typography
      variant='body2'
      sx={{
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {truncatedText}
    </Typography>
  );
};

const BlogListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const BlogBulkActions = () => <BulkDeleteButton />;

const ImageUrlField = (record: Blogs) => {
  if (!record?.image_url) return null;

  return (
    <Avatar
      src={record.image_url}
      alt={record.collectionName}
      sx={{ width: 42, height: 42 }}
    />
  );
};

const Column = DataTable.Col<Blogs>;

export const BlogList = () => {
  const translate = useTranslate();

  const blogFilters = [
    <SearchInput source='q' alwaysOn />,
    <TextInput
      source='title'
      label={translate('title')}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Adjust this value as needed
        },
      }}
    />,
    <TextInput
      source='description'
      label={translate('description')}
      alwaysOn
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Adjust this value as needed
        },
      }}
    />,
    <NumberInput
      source='count'
      label={translate('count')}
      alwaysOn
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Adjust this value as needed
        },
      }}
    />,
  ];
  return (
    <List
      filters={blogFilters}
      actions={<BlogListActions />}
      sort={{ field: 'created', order: 'DESC' }}
      perPage={25}
    >
      <DataTable bulkActionButtons={<BlogBulkActions />} rowClick='edit'>
        <Column
          source='image_url'
          label={translate('image')}
          render={ImageUrlField}
        />
        {/* <Column source='id' /> */}
        <Column source='title' label={translate('title')} />
        <Column
          source='description'
          label={translate('description')}
          render={DescriptionField}
        />
        {/* <UrlField source='video_url' /> */}
        <Column source='count' label={translate('count')} />
        <Column
          source='created'
          label={translate('created')}
          render={(record) => (
            <DateField source='created' record={record} showTime />
          )}
        />
        <Column
          source='updated'
          label={translate('updated')}
          render={(record) => (
            <DateField source='updated' record={record} showTime />
          )}
        />
        <Column
          source='edit'
          field={DateField}
          label={translate('edit')}
          render={EditButton}
        />
        <Column
          source='delete'
          field={DateField}
          label={translate('delete')}
          render={DeleteWithConfirmButton}
        />
      </DataTable>
    </List>
  );
};
