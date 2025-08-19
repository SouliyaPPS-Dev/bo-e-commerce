import {
  Edit,
  required,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  TopToolbar,
  ShowButton,
  Toolbar,
  SaveButton,
  useTranslate,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

const CCYEditActions = () => (
  <TopToolbar>
    <ShowButton />
  </TopToolbar>
);

const CurrencyEdit = () => {
  const translate = useTranslate();

  const validateForm = (values: any) => {
    const errors: any = {};
    if (!values.ccy) {
      errors.ccy = translate('code_required');
    }
    if (!values.type) {
      errors.type = translate('type_required');
    }
    if (!values.rate || values.rate <= 0) {
      errors.rate = translate('rate_positive');
    }
    return errors;
  };

  return (
    <Edit actions={<CCYEditActions />}>
      <SimpleForm validate={validateForm} toolbar={<CurrencyEditFormToolbar />}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: 600,
          }}
        >
          <Typography variant='h6' gutterBottom>
            {translate('information_title')}
          </Typography>

          <TextInput
            source='ccy'
            validate={[required()]}
            fullWidth
            label={translate('code_label')}
            helperText={translate('code_helper')}
          />

          <SelectInput
            source='type'
            validate={[required()]}
            choices={[
              { id: 'BUY', name: 'BUY' },
              { id: 'SELL', name: 'SELL' },
            ]}
            fullWidth
            label={translate('type_label')}
          />

          <NumberInput
            source='rate'
            validate={[required()]}
            fullWidth
            label={translate('rate_label')}
            helperText={translate('rate_helper')}
          />
        </Box>
      </SimpleForm>
    </Edit>
  );
};

export default CurrencyEdit;

const CurrencyEditFormToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);
