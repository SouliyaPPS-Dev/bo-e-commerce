import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import {
  DateField,
  Edit,
  email,
  ImageField,
  ImageInput,
  PasswordInput,
  required,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  useRecordContext,
  useRefresh,
  useTranslate,
} from 'react-admin';
import { useLocation } from 'react-router';
import { useImageStore } from '../store/imageStore';

const UserEdit = () => {
  const translate = useTranslate();
  const { selectImage, setSelectImage } = useImageStore(); // Use the store
  const refresh = useRefresh();

  // Clear selectImage when route changes
  const location = useLocation();
  useEffect(() => {
    setSelectImage(null);
    refresh();
  }, [location.pathname, setSelectImage]);

  return (
    <Edit title={translate('edit_user')} transform={(data: any) => ({ ...data, status: true })}>
      <SimpleForm>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {translate('basic_information')}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                    onChange={(e) => {
                      setSelectImage(e);
                    }}
                    placeholder={translate('image_input_placeholder')}
                  >
                    <ImageField source='src' title='title' />
                  </ImageInput>

                  <ImageField
                    source='avatar'
                    label={translate('current_image')}
                    sx={{
                      display: selectImage !== null ? 'none' : 'block',
                      mt: -4,
                    }}
                  />
                </Box>

                <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                  {translate('change_password')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <PasswordInput
                    source='oldPassword'
                    fullWidth
                    label={translate('old_password')}
                    helperText={translate('old_password_helper')}
                  />
                  <PasswordInput
                    source='password'
                    fullWidth
                    helperText={translate('password_length_helper_edit')}
                  />

                  <PasswordInput
                    source='passwordConfirm'
                    fullWidth
                    label={translate('resources.users.fields.passwordConfirm')}
                    helperText={translate('password_match_helper')}
                  />
                  {/* <BooleanInput
                    source='emailVisibility'
                    defaultValue={true}
                    style={{ display: 'none' }}
                  /> */}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
              lg: 4,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {translate('user_information')}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                  >
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      {translate('avatar')}
                    </Typography>
                    <AvatarDisplay />
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {translate('user_id')}
                    </Typography>
                    <TextField source='id' />
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {translate('username')}
                    </Typography>
                    <TextField source='username' />
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {translate('created')}
                    </Typography>
                    <DateField source='created' showTime />
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {translate('updated')}
                    </Typography>
                    <DateField source='updated' showTime />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
};

const AvatarDisplay = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record?.avatar) return null;
  return (
    <img
      src={record.avatar}
      alt={translate('user_avatar')}
      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
    />
  );
};

export default UserEdit;
