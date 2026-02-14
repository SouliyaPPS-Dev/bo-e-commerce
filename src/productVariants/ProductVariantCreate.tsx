import {
  AutocompleteInput,
  BooleanInput,
  Create,
  ReferenceInput,
  SimpleForm,
  TextInput,
  required,
  useTranslate,
  useNotify,
  useRedirect,
} from "react-admin";
import { useMemo } from "react";

const ProductVariantCreate = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();

  const defaultValues = useMemo(
    () => ({
      is_active: true,
    }),
    [],
  );

  return (
    <Create
      mutationMode="pessimistic"
      mutationOptions={{
        onSuccess: () => {
          notify("resources.product_variants.notifications.created", {
            type: "success",
          });
          redirect("list", "product_variants");
        },
      }}
    >
      <SimpleForm defaultValues={defaultValues} sx={{ maxWidth: "40em" }}>
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
      </SimpleForm>
    </Create>
  );
};

export default ProductVariantCreate;
