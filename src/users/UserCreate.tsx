import { Box, Typography } from '@mui/material';
import {
  Create,
  email,
  ImageField,
  ImageInput,
  PasswordInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  useNotify,
  useRedirect,
  useTranslate,
} from 'react-admin';

const UserCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const translate = useTranslate();

  const validateForm = (values: any) => {
    const errors: any = {};
    if (!values.username) {
      errors.username = translate('username_required');
    }
    if (!values.email) {
      errors.email = translate('email_required');
    }
    if (!values.full_name) {
      errors.full_name = translate('full_name_required');
    }
    if (!values.password) {
      errors.password = translate('password_required');
    } else if (values.password.length < 8) {
      errors.password = translate('password_length');
    }
    if (values.password !== values.passwordConfirm) {
      errors.passwordConfirm = translate('passwords_do_not_match');
    }
    return errors;
  };

  return (
    <Create
      title={translate('create_user')}
      transform={(data: any) => ({ ...data, status: true })}
      mutationOptions={{
        onSuccess: () => {
          notify(translate('user_created_successfully'), { type: 'success' });
          redirect('list', 'users');
        },
        onError: (error: any) => {
          notify(translate('error_creating_user', { message: error.message }), {
            type: 'error',
          });
        },
      }}
    >
      <SimpleForm validate={validateForm} defaultValues={{ status: true }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: 600,
          }}
        >
          <Typography variant='h6' gutterBottom>
            {translate('basic_information')}
          </Typography>

          <TextInput
            source='username'
            validate={[required()]}
            fullWidth
            helperText={translate('username_unique_helper')}
          />

          <TextInput
            source='full_name'
            validate={[required()]}
            fullWidth
            label={translate('resources.users.fields.full_name')}
          />

          <TextInput
            source='email'
            validate={[required(), email()]}
            fullWidth
            helperText={translate('email_unique_helper')}
          />

          <TextInput
            source='phone_number'
            fullWidth
            label={translate('resources.users.fields.phone_number')}
          />

          <SelectInput
            source='role'
            validate={[required()]}
            choices={[
              { id: 'admin', name: translate('admin_role') },
              { id: 'staff', name: translate('staff_role') },
            ]}
            fullWidth
          />

          <ImageInput
            source='avatar'
            label={translate('resources.users.fields.avatar')}
            placeholder={translate('image_input_placeholder')}
          >
            <ImageField source='src' title='title' />
          </ImageInput>

          <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
            {translate('account_settings')}
          </Typography>

          <PasswordInput
            source='password'
            validate={[required()]}
            fullWidth
            helperText={translate('password_length_helper')}
          />

          <PasswordInput
            source='passwordConfirm'
            validate={[required()]}
            fullWidth
            label={translate('resources.users.fields.passwordConfirm')}
            helperText={translate('password_match_helper')}
          />
          {/* <BooleanInput source="emailVisibility" defaultValue={true} style={{ display: 'none' }} /> */}
        </Box>
      </SimpleForm>
    </Create>
  );
};

export default UserCreate;
