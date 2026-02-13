import { useQuery } from '@tanstack/react-query';
import pb from '../api/pocketbase';

export interface ProductColorOption {
  id: string;
  name: string;
  value: string;
}

const mapValuesToOptions = (values: string[]): ProductColorOption[] =>
  values.map((value) => ({
    id: value,
    name: value,
    value,
  }));

const fetchVariantColors = async (productId?: string) => {
  const filterParts = ['color != ""'];
  if (productId) {
    filterParts.push(`product_id ?= "${productId}"`);
  }

  const filter = filterParts.join(" && ");

  try {
    const variants = await pb.collection("product_variants").getFullList(200, {
      fields: "color,product_id,is_active",
      filter,
    });

    const uniqueValues = new Set<string>();

    variants.forEach((variant: any) => {
      const value =
        typeof variant?.color === "string" ? variant.color.trim() : "";
      if (value) {
        uniqueValues.add(value);
      }
    });

    return mapValuesToOptions(Array.from(uniqueValues));
  } catch (error) {
    console.error("Unable to fetch product variant colors:", error);
    return [];
  }
};

const fetchProductColors = async (
  productId?: string,
): Promise<ProductColorOption[]> => {
  if (productId) {
    const scopedColors = await fetchVariantColors(productId);
    if (scopedColors.length > 0) {
      return scopedColors;
    }
  }

  return await fetchVariantColors();
};

export const useProductColors = (productId?: string) => {
  return useQuery({
    queryKey: ["product-colors", productId ?? "all"],
    queryFn: () => fetchProductColors(productId),
    staleTime: 5 * 60 * 1000,
  });
};
