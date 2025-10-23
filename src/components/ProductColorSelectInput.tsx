import { useMemo } from 'react';
import { SelectInput, SelectInputProps, useRecordContext } from 'react-admin';
import {
  useProductColors,
  DEFAULT_PRODUCT_COLORS,
} from '../hooks/useProductColors';

interface ProductColorChoice {
  id: string;
  name: string;
  value: string;
  [key: string]: unknown;
}

type ProductColorSelectInputProps = Omit<SelectInputProps, 'choices'>;

const ProductColorSelectInput = ({
  disabled,
  ...rest
}: ProductColorSelectInputProps) => {
  const { data: colors, isLoading } = useProductColors();
  const record = useRecordContext<any>();

  const currentValue = useMemo(() => {
    if (!record || !rest?.source) {
      return undefined;
    }
    const value = record[rest.source];
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0]) : undefined;
    }
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return String(value);
  }, [record, rest?.source]);

  const choices: ProductColorChoice[] = useMemo(() => {
    const fallbackChoices = DEFAULT_PRODUCT_COLORS.map((value) => ({
      id: value,
      name: value,
      value,
    }));

    const remoteChoices =
      colors && colors.length > 0
        ? colors.map((color) => ({
            id: color.id,
            name: color.name || color.value || color.id,
            value: color.value || color.id,
          }))
        : [];

    const combined = [...remoteChoices, ...fallbackChoices];

    if (currentValue) {
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
      optionText='name'
      optionValue='value'
      disabled={disabled || (isLoading && choices.length === 0)}
      emptyValue=''
      emptyText=''
    />
  );
};

export default ProductColorSelectInput;
