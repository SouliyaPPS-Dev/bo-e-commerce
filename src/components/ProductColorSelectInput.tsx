import { useMemo } from "react";
import { SelectInput, SelectInputProps, useRecordContext } from "react-admin";
import { useProductColors } from "../hooks/useProductColors";

interface ProductColorChoice {
  id: string;
  name: string;
  value: string;
  [key: string]: unknown;
}

type ProductColorSelectInputProps = Omit<SelectInputProps, "choices">;

const normalizeValueArray = (value: unknown): string[] => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item.trim() : String(item ?? ""),
      )
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) =>
              typeof item === "string" ? item.trim() : String(item ?? ""),
            )
            .filter((item) => item.length > 0);
        }
      } catch {
        // fall through to single value fallback
      }
    }
    return [trimmed];
  }
  return [String(value)];
};

const ProductColorSelectInput = ({
  disabled,
  ...rest
}: ProductColorSelectInputProps) => {
  const record = useRecordContext<any>();
  const productId = record?.id ? String(record.id) : undefined;

  const colorVariantIds = useMemo(() => {
    if (!record) {
      return [];
    }
    if (Array.isArray(record.color_variant_ids)) {
      return normalizeValueArray(record.color_variant_ids);
    }
    if (rest?.source && record[rest.source]) {
      return normalizeValueArray(record[rest.source]);
    }
    return [];
  }, [record, rest?.source]);

  const { data: colors, isLoading } = useProductColors(
    productId,
    colorVariantIds,
  );

  const currentValue = useMemo(() => {
    if (!record || !rest?.source) {
      return undefined;
    }
    const ids = colorVariantIds;
    return ids.length > 0 ? ids[0] : undefined;
  }, [colorVariantIds]);

  const choices: ProductColorChoice[] = useMemo(() => {
    const remoteChoices =
      colors && colors.length > 0
        ? colors.map((color) => ({
            id: color.id,
            name: color.name || color.value || color.id,
            value: color.value || color.id,
          }))
        : [];

    const combined = [...remoteChoices];

    if (
      currentValue &&
      !remoteChoices.find((choice) => choice.value === currentValue)
    ) {
      combined.unshift({
        id: currentValue,
        name: currentValue,
        value: currentValue,
      });
    }

    const seen = new Set<string>();
    const uniqueChoices: ProductColorChoice[] = [];

    combined.forEach((choice) => {
      if (!choice.value || seen.has(choice.value)) {
        return;
      }
      seen.add(choice.value);
      uniqueChoices.push(choice);
    });

    return uniqueChoices;
  }, [colors, currentValue]);

  return (
    <SelectInput
      {...rest}
      choices={choices}
      optionText="name"
      optionValue="id"
      disabled={disabled || (isLoading && choices.length === 0)}
      emptyValue=""
      emptyText=""
    />
  );
};

export default ProductColorSelectInput;
