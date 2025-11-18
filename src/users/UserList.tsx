import { Download, LockReset } from '@mui/icons-material';
import { Avatar, Button, Switch, MenuItem } from '@mui/material';
import Select from '@mui/material/Select';
import * as React from 'react';
import {
  ColumnsButton,
  Confirm,
  CreateButton,
  DataTable,
  DateField,
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
import pb from '../api/pocketbase';
import { User } from '../dataProvider/usersDataProvider';

const userFilters = () => {
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
      label='resources.users.fields.verified'
      emptyText={translate('all_status')}
    />,
    <SelectInput
      key='emailVisibility'
      source='emailVisibility'
      choices={[
        { id: '', name: translate('all_email_visibility') },
        { id: true, name: translate('email_visible') },
        { id: false, name: translate('email_hidden') },
      ]}
      label='resources.users.fields.emailVisibility'
      emptyText={translate('all_email_visibility')}
    />,
    <SearchInput
      key='email'
      source='email'
      label='resources.users.fields.email'
      placeholder={translate('enter_email_address')}
    />,
    <SearchInput
      key='username'
      source='username'
      label='resources.users.fields.username'
      placeholder={translate('enter_username')}
    />,
  ];
};

const UserListActions = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const translate = useTranslate();

  const handleExportExcel = async () => {
    try {
      const { data } = await dataProvider.getList('users', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'created', order: 'DESC' },
        filter: {},
      });

      const exportData = data.map((user: User) => ({
        [translate('resources.users.fields.full_name')]: user.full_name,
        [translate('resources.users.fields.username')]: user.username,
        [translate('resources.users.fields.email')]: user.email,
        [translate('resources.users.fields.phone_number')]: user.phone_number,
        [translate('resources.users.fields.verified')]: user.verified
          ? translate('yes')
          : translate('no'),
        [translate('created')]: new Date(user.created).toLocaleDateString(),
        [translate('updated')]: new Date(user.updated).toLocaleDateString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        translate('resources.users.name')
      );

      XLSX.writeFile(
        workbook,
        `users_export_${new Date().toISOString().split('T')[0]}.xlsx`
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
      <CreateButton />
      <ColumnsButton />
    </TopToolbar>
  );
};

const UserTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${title} - ${defaultTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const Column = DataTable.Col<User>;

const VerifiedField = (record: User) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();

  const handleVerifiedChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    if (!record) return;

    const newVerified = event.target.checked;
    try {
      await update('users', {
        id: record.id,
        data: { ...record, verified: newVerified },
        previousData: record,
      });
      notify(
        translate('user_verified_status_updated', {
          status: newVerified ? translate('verified') : translate('unverified'),
        }),
        {
          type: 'success',
        }
      );
      refresh();
    } catch (error) {
      notify(translate('error_updating_verification_status'), {
        type: 'error',
      });
    }
  };

  return (
    <Switch
      checked={record?.verified || false}
      onChange={handleVerifiedChange}
      size='small'
      color='success'
    />
  );
};

const UserStatusField = (record: User) => {
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
      await update('users', {
        id: record.id,
        data: { ...record, status: newStatusValue },
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
      <Select
        value={record.status ? 'true' : 'false'}
        onChange={handleStatusChange}
        onClick={(e) => e.stopPropagation()}
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
      </Select>
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

const AvatarField = (record: User) => {
  if (!record?.avatar) return null;

  return (
    <Avatar
      src={record.avatar}
      alt={record.username}
      sx={{ width: 42, height: 42 }}
    />
  );
};

const BlackEmailField = (props: any) => (
  <EmailField sx={{ color: 'black' }} {...props} />
);

const UserList = () => {
  const isAdmin = localStorage.getItem('role') === 'admin';
  const translate = useTranslate();

  console.log('=> isAdmin', isAdmin);

  return (
    <List
      filters={userFilters()}
      sort={{ field: 'created', order: 'DESC' }}
      perPage={25}
      actions={<UserListActions />}
      title={<UserTitle />}
    >
      <DataTable
        bulkActionButtons={false}
        rowClick='edit'
        sx={{
          '& .column-phone_number': {
            md: { display: 'none' },
            lg: { display: 'table-cell' },
          },
        }}
      >
        <Column
          source='avatar'
          render={AvatarField}
          label={translate('resources.users.fields.avatar')}
        />
        <Column
          source='full_name'
          label={translate('resources.users.fields.full_name')}
        />
        <Column
          source='username'
          label={translate('resources.users.fields.username')}
        />
        <Column
          source='email'
          field={BlackEmailField}
          label={translate('resources.users.fields.email')}
        />
        <Column
          source='phone_number'
          label={translate('resources.users.fields.phone_number')}
        />
        <Column
          source='role'
          label={translate('resources.users.fields.role')}
        />
        <Column
          source='created'
          field={DateField}
          label={translate('created')}
        />
        <Column
          source='updated'
          field={DateField}
          label={translate('updated')}
        />

        {isAdmin && (
          <Column
            source='reset_password'
            label={translate('reset_password')}
            render={(record) => <ResetPasswordButton record={record} />}
          />
        )}
        <Column
          source='status'
          render={UserStatusField}
          label={translate('status')}
        />
      </DataTable>
    </List>
  );
};

const ResetPasswordButton = ({ record }: { record: User }) => {
  const notify = useNotify();
  const translate = useTranslate();
  const [open, setOpen] = React.useState(false);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click from triggering edit form
    setOpen(true);
  };

  const handleConfirm = async () => {
    setOpen(false);
    if (!record || !record.email) {
      notify(translate('user_email_not_found'), { type: 'warning' });
      return;
    }
    try {
      await pb.collection('users').requestPasswordReset(record.email);
      notify(translate('password_reset_email_sent', { email: record.email }), {
        type: 'success',
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      notify(
        translate('failed_to_send_password_reset_email', {
          email: record.email,
        }),
        {
          type: 'error',
        }
      );
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button size='small' onClick={handleClick} startIcon={<LockReset />}>
        {translate('reset')}
      </Button>
      <Confirm
        isOpen={open}
        title={translate('reset_password')}
        content={translate('confirm_password_reset', { email: record.email })}
        onConfirm={handleConfirm}
        onClose={handleCancel}
      />
    </>
  );
};

export default UserList;
