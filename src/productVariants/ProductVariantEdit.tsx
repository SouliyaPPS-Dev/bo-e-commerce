import {
  AutocompleteInput,
  BooleanInput,
  DeleteWithConfirmButton,
  Edit,
  ReferenceInput,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar,
  required,
  useNotify,
  useTranslate,
} from "react-admin";
import { Box, Divider } from "@mui/material";

const ProductVariantEditToolbar = () => (
  <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
    <SaveButton alwaysEnable />
    <DeleteWithConfirmButton />
  </Toolbar>
);

const ProductVariantEdit = () => {
  const translate = useTranslate();
  const notify = useNotify();

  return (
    <Edit
      mutationMode="pessimistic"
      mutationOptions={{
        onSuccess: () =>
          notify("resources.product_variants.notifications.updated", {
            type: "success",
          }),
      }}
    >
      <SimpleForm
        toolbar={<ProductVariantEditToolbar />}
        sx={{ maxWidth: "40em" }}
      >
        <TextInput
          source="color"
          fullWidth
          label={translate("resources.product_variants.fields.color")}
          validate={required()}
        />
        <TextInput
          source="size"
          fullWidth
          label={translate("resources.product_variants.fields.size")}
          validate={required()}
        />
        <TextInput
          source="weight"
          fullWidth
          label={translate("resources.product_variants.fields.weight")}
        />
        <TextInput
          source="pattern"
          fullWidth
          label={translate("resources.product_variants.fields.pattern")}
        />
        <TextInput
          source="material"
          fullWidth
          label={translate("resources.product_variants.fields.material")}
        />
        <BooleanInput
          source="is_active"
          label={translate("resources.product_variants.fields.is_active")}
        />
        <Divider sx={{ my: 2 }} />
        <Box display="flex" gap={2}>
          <TextInput
            source="created"
            label={translate("resources.product_variants.fields.created")}
            disabled
            fullWidth
          />
          <TextInput
            source="updated"
            label={translate("resources.product_variants.fields.updated")}
            disabled
            fullWidth
          />
        </Box>
      </SimpleForm>
    </Edit>
  );
};

export default ProductVariantEdit;
