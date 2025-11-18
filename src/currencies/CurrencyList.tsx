import {
  Datagrid,
  DateField,
  EditButton,
  FilterButton,
  List,
  NumberField,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
  useTranslate,
} from 'react-admin';

const CurrencyListActions = () => (
  <TopToolbar>
    <FilterButton />
    {/* <CreateButton resource='currency' /> */}
  </TopToolbar>
);

const CurrencyList = () => {
  const translate = useTranslate();

  const CurrencyFilter = [
    <SearchInput key='search' placeholder={translate('search')} source='q' alwaysOn />,
    <SelectInput
      key='type'
      source='type'
      choices={[
        { id: '', name: translate('all') },
        { id: 'BUY', name: translate('buy') },
        { id: 'SELL', name: translate('sell') },
      ]}
      alwaysOn
      emptyValue={''}
      label={translate('type')}
      sx={{
        '& .MuiInputBase-root': {
          height: '40px', // Adjust this value as needed
        },
      }}
    />,
  ];

  return (
    <List
      resource='currency'
      filters={CurrencyFilter}
      actions={<CurrencyListActions />}
      sort={{ field: 'updated', order: 'DESC' }}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source='ccy' label={translate('ccy')} />
        <TextField source='type' label={translate('type')} />
        <NumberField source='rate' label={translate('rate')} />
        <DateField source='created' label={translate('created')} showTime />
        <DateField source='updated' label={translate('updated')} showTime />
        <EditButton label={translate('edit')} />
        {/* <DeleteButton
          confirmTitle={translate('currency.delete.confirm_title')}
          confirmContent={translate('currency.delete.confirm_content')}
        /> */}
      </Datagrid>
    </List>
  );
};

export default CurrencyList;
