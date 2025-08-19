import { Download } from '@mui/icons-material';
import { Avatar, Button, MenuItem, Select as MuiSelect } from '@mui/material';
import * as React from 'react';
import {
  Confirm,
  DataTable,
  EmailField,
  List,
  SearchInput,
  SelectInput,
  TopToolbar,
  useDataProvider,
  useDefaultTitle,
  useListContext,
  useNotify,
  useRefresh,
  useUpdate,
  useTranslate,
} from 'react-admin';
import * as XLSX from 'xlsx';
import { Customer } from '../dataProvider/customersDataProvider';

const customerFilters = () => {
  const translate = useTranslate();
  return [
    <SearchInput key='q' source='q' alwaysOn />,
    <SelectInput
      key='verified'
      source='verified'
      choices={[
        { id: '', name: translate('all_status') },
        { id: true, name: translate('verified') },
        { id: false, name: translate('unverified') },
      ]}
      label='verified'
      emptyText={translate('all_status')}
    />,
    <SelectInput
      key='has_ordered'
      source='has_ordered'
      choices={[
        { id: '', name: translate('all_customers') },
        { id: true, name: translate('has_orders') },
        { id: false, name: translate('no_orders') },
      ]}
      label='has_ordered'
      emptyText={translate('all_customers')}
    />,
    <SelectInput
      key='emailVisibility'
      source='emailVisibility'
      choices={[
        { id: '', name: translate('all_email_visibility') },
        { id: true, name: translate('email_visible') },
        { id: false, name: translate('email_hidden') },
      ]}
      label='emailVisibility'
      emptyText={translate('all_email_visibility')}
    />,
    <SearchInput
      key='email'
      source='email'
      label='email'
      placeholder={translate('enter_email_address')}
    />,
  ];
};


const CustomerListActions = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const translate = useTranslate();

  const handleExportExcel = async () => {
    try {
      const { data } = await dataProvider.getList('customers', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'created', order: 'DESC' },
        filter: {},
      });

      const exportData = data.map((customer: Customer) => ({
        [translate('name')]: customer.name,
        [translate('username')]: customer.username,
        [translate('email')]: customer.email,
        [translate('phone')]: customer.phone_number,
        [translate('verified')]: customer.verified ? translate('yes') : translate('no'),
        [translate('created')]: new Date(customer.created).toLocaleDateString(),
        [translate('updated')]: new Date(customer.updated).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, translate('customers'));

      XLSX.writeFile(
        workbook,
        `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      notify(translate('excel_export_success'), { type: 'success' });
    } catch (error) {
      notify(translate('excel_export_failure'), { type: 'error' });
    }
  };

  return (
    <TopToolbar>
      <Button
        onClick={handleExportExcel}
        startIcon={<Download />}
        variant='outlined'
        size='small'
      >
        {translate('export_excel')}
      </Button>
    </TopToolbar>
  );
};

const CustomerTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${title} - ${defaultTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const Column = DataTable.Col<Customer>;

const AvatarField = (record: Customer) => {
  if (!record?.avatar) return null;

  return (
    <Avatar
      src={record.avatar}
      alt={record.name}
      sx={{ width: 42, height: 42 }}
    />
  );
};

const AccountStatusField = (record: Customer) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [open, setOpen] = React.useState(false);
  const [newStatusValue, setNewStatusValue] = React.useState<boolean | null>(
    null
  );

  const handleStatusChange = async (event: any) => {
    const status = event.target.value === 'true';
    setNewStatusValue(status);
    setOpen(true);
  };

  const handleConfirm = async () => {
    setOpen(false);
    if (newStatusValue === null) return;

    try {
      await update('customers', {
        id: record.id,
        data: { ...record, status: newStatusValue ? 'true' : 'false' }, // Convert boolean to string
        previousData: record,
      });
      notify(
        translate('account_status_updated', {
          status: newStatusValue ? translate('active') : translate('inactive'),
        }),
        {
          type: 'success',
        }
      );
      refresh();
    } catch (error) {
      notify(translate('error_updating_account_status'), { type: 'error' });
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setNewStatusValue(null);
  };

  return (
    <>
      <MuiSelect
        value={record.status ? 'true' : 'false'}
        onChange={handleStatusChange}
        onClick={(e) => e.stopPropagation()} // Stop propagation
        variant='outlined'
        size='small'
        sx={{
          width: 120,
          color: record.status ? 'green' : 'red',
          fontWeight: 'bold',
          '& .MuiSelect-select': {
            paddingRight: '24px !important',
          },
        }}
      >
        <MenuItem value='true' sx={{ color: 'green' }}>
          {translate('active')}
        </MenuItem>
        <MenuItem value='false' sx={{ color: 'red' }}>
          {translate('inactive')}
        </MenuItem>
      </MuiSelect>
      <Confirm
        isOpen={open}
        title={translate('confirm_status_change')}
        content={translate('confirm_status_change_message', {
          status: newStatusValue ? translate('active') : translate('inactive'),
        })}
        onConfirm={handleConfirm}
        onClose={handleCancel}
      />
    </>
  );
};

const BlackEmailField = (props: any) => (
  <EmailField sx={{ color: 'black' }} {...props} />
);

const CustomerList = () => {
  const translate = useTranslate();
  return (
    <List
      filters={customerFilters()}
      sort={{ field: 'created', order: 'DESC' }}
      perPage={25}
      actions={<CustomerListActions />}
      title={<CustomerTitle />}
    >
      <DataTable
        rowClick='show'
        sx={{
          '& .column-avatar': {
            width: '48px',
          },
          '& .column-phone_number': {
            md: { display: 'none' },
            lg: { display: 'table-cell' },
          },
        }}
      >
        <Column source='avatar' render={AvatarField} label={translate('image')} />
        <Column source='name' label={translate('name')} />
        <Column source='username' label={translate('username')} />
        <Column source='email' field={BlackEmailField} label={translate('email')} />
        <Column source='phone_number' label={translate('phone_number')} />
        <Column source='verified' render={AccountStatusField} label={translate('status')} />
      </DataTable>
    </List>
  );
};

export default CustomerList;
