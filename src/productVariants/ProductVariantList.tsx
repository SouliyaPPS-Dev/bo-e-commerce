import {
  BooleanField,
  Datagrid,
  DateField,
  List,
  ReferenceField,
  TextField,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  BooleanInput,
  useTranslate,
} from "react-admin";

const productVariantFilters = [
  <TextInput
    key="q"
    source="q"
    label="resources.product_variants.filters.search"
    alwaysOn
    resettable
  />,
  <BooleanInput
    key="is_active"
    source="is_active"
    label="resources.product_variants.fields.is_active"
  />,
];

const ProductVariantList = () => {
  const translate = useTranslate();

  return (
    <List
      filters={productVariantFilters}
      perPage={25}
      sort={{ field: "updated", order: "DESC" }}
    >
      <Datagrid rowClick="edit">
        <TextField
          source="color"
          label={translate("resources.product_variants.fields.color")}
        />
        <TextField
          source="size"
          label={translate("resources.product_variants.fields.size")}
        />
        <TextField
          source="weight"
          label={translate("resources.product_variants.fields.weight")}
        />
        <TextField
          source="pattern"
          label={translate("resources.product_variants.fields.pattern")}
        />
        <TextField
          source="material"
          label={translate("resources.product_variants.fields.material")}
        />
        <BooleanField
          source="is_active"
          label={translate("resources.product_variants.fields.is_active")}
        />
        <DateField
          source="created"
          label={translate("resources.product_variants.fields.created")}
        />
        <DateField
          source="updated"
          label={translate("resources.product_variants.fields.updated")}
        />
      </Datagrid>
    </List>
  );
};

export default ProductVariantList;
