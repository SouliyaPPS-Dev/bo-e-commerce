import { useQuery } from '@tanstack/react-query';
import pb from '../api/pocketbase';

export interface ProductColorOption {
  id: string;
  name: string;
  value: string;
}

interface PocketBaseFieldOptions {
  values?: string[];
  [key: string]: unknown;
}

interface PocketBaseField {
  name: string;
  type: string;
  options?: PocketBaseFieldOptions;
}

interface PocketBaseCollectionSchema {
  schema?: PocketBaseField[];
}

export const DEFAULT_PRODUCT_COLORS: string[] = [
  'Beige',
  'Black',
  'Brown',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Silver',
  'Red',
  'Navy',
  'Pink',
  'White',
];

const mapValuesToOptions = (values: string[]): ProductColorOption[] =>
  values.map((value) => ({
    id: value,
    name: value,
    value,
  }));

const fetchSchemaColorOptions = async (): Promise<ProductColorOption[] | null> => {
  try {
    const collection = (await (pb as any)?.collections?.getOne?.(
      'products'
    )) as PocketBaseCollectionSchema | undefined;

    const colorField = collection?.schema?.find(
      (field) => field.name === 'colors' && field.type === 'select'
    );

    if (colorField?.options?.values && colorField.options.values.length > 0) {
      return mapValuesToOptions(colorField.options.values);
    }
  } catch (error: any) {
    if (error?.status && error.status !== 404 && error.status !== 403) {
      console.warn('Unable to fetch product schema for colors:', error);
    }
  }

  return null;
};

const parseColorValues = (input: unknown): string[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input
      .filter((value) => value !== null && value !== undefined && value !== '')
      .map((value) => String(value));
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((value) => value !== null && value !== undefined && value !== '')
          .map((value) => String(value));
      }
    } catch {
      // not JSON, fallback to comma separation
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
    }

    return [trimmed];
  }

  return [String(input)];
};

const fetchColorsFromProducts = async (): Promise<ProductColorOption[]> => {
  try {
    const records = await pb.collection('products').getFullList(200, {
      fields: 'colors',
    });

    const uniqueValues = new Set<string>();

    records.forEach((record: any) => {
      parseColorValues(record?.colors).forEach((value) => {
        uniqueValues.add(value);
      });
    });

    return mapValuesToOptions(Array.from(uniqueValues));
  } catch (error) {
    console.error('Unable to derive colors from products:', error);
    return [];
  }
};

const fetchProductColors = async (): Promise<ProductColorOption[]> => {
  const schemaOptions = await fetchSchemaColorOptions();
  if (schemaOptions && schemaOptions.length > 0) {
    return schemaOptions;
  }

  const derivedColors = await fetchColorsFromProducts();
  if (derivedColors.length > 0) {
    return derivedColors.concat(
      mapValuesToOptions(DEFAULT_PRODUCT_COLORS).filter(
        (fallback) => !derivedColors.some((color) => color.value === fallback.value)
      )
    );
  }

  return mapValuesToOptions(DEFAULT_PRODUCT_COLORS);
};

export const useProductColors = () => {
  return useQuery({
    queryKey: ['product-colors'],
    queryFn: fetchProductColors,
    staleTime: 5 * 60 * 1000,
  });
};
