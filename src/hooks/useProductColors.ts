import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import pb from "../api/pocketbase";

export interface ProductColorOption {
  id: string;
  name: string;
  value: string;
  color?: string;
  productId?: string;
}

const mapVariantToOption = (variant: any): ProductColorOption => {
  const productId = Array.isArray(variant?.product_id)
    ? variant.product_id[0]
    : variant?.product_id;

  return {
    id: variant?.id,
    name: variant?.color || variant?.id || "Unnamed variant",
    value: variant?.id,
    color: variant?.color,
    productId: productId || undefined,
  };
};

const fetchVariantColors = async (productId?: string) => {
  const filterParts = ['color != ""', "is_active = true"];
  if (productId) {
    const escapedId = productId.replace(/"/g, '\\"');
    filterParts.push(
      `((product_id = "${escapedId}") || (product_id ?= "${escapedId}") || (product_id.id = "${escapedId}") || (product_id.id ?= "${escapedId}"))`,
    );
  }

  const filter = filterParts.join(" && ");

  try {
    const variants = await pb.collection("product_variants").getFullList(200, {
      fields: "id,color,product_id,is_active",
      filter,
    });

    return variants.map((variant: any) => mapVariantToOption(variant));
  } catch (error) {
    console.error("Unable to fetch product variant colors:", error);
    return [];
  }
};

const fetchVariantsByIds = async (
  ids: string[],
): Promise<ProductColorOption[]> => {
  if (ids.length === 0) {
    return [];
  }

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const variant = await pb.collection("product_variants").getOne(id, {
          fields: "id,color,product_id,is_active",
        });
        return mapVariantToOption(variant);
      } catch (error) {
        console.warn("Unable to fetch product variant by id:", id, error);
        return null;
      }
    }),
  );

  return results.filter((option): option is ProductColorOption =>
    Boolean(option),
  );
};

const mergeOptions = (
  base: ProductColorOption[],
  additions: ProductColorOption[],
): ProductColorOption[] => {
  const seen = new Set<string>();
  const merged: ProductColorOption[] = [];

  [...base, ...additions].forEach((option) => {
    if (!option?.id || seen.has(option.id)) {
      return;
    }
    seen.add(option.id);
    merged.push(option);
  });

  return merged;
};

const normalizeIncludeIds = (ids?: string[]): string[] => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const seen = new Set<string>();
  return ids
    .map((id) => (typeof id === "string" ? id.trim() : ""))
    .filter((id) => id.length > 0 && !seen.has(id) && (seen.add(id) || true));
};

const fetchProductColors = async (
  productId?: string,
  includeVariantIds: string[] = [],
): Promise<ProductColorOption[]> => {
  const scopedVariants = await fetchVariantColors(productId);
  const scopedIds = new Set(scopedVariants.map((variant) => variant.id));

  const missingIds = includeVariantIds.filter((id) => !scopedIds.has(id));
  if (missingIds.length === 0) {
    return scopedVariants;
  }

  const extraVariants = await fetchVariantsByIds(missingIds);
  return mergeOptions(scopedVariants, extraVariants);
};

export const useProductColors = (
  productId?: string,
  includeVariantIds?: string[],
) => {
  const queryClient = useQueryClient();
  const normalizedIncludeIds = useMemo(
    () => normalizeIncludeIds(includeVariantIds),
    [includeVariantIds],
  );
  const includeKey = normalizedIncludeIds.join("|");

  useEffect(() => {
    let isSubscribed = true;
    let unsubscribe: (() => void) | null = null;

    const handleChange = () => {
      if (!isSubscribed) {
        return;
      }
      queryClient.invalidateQueries({
        queryKey: ["product-colors"],
        exact: false,
      });
    };

    pb.collection("product_variants")
      .subscribe("*", handleChange)
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch((error) => {
        console.warn("Unable to subscribe to product variant updates:", error);
      });

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.warn(
            "Unable to unsubscribe from product variant updates:",
            error,
          );
        }
      }
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["product-colors", productId ?? "all", includeKey],
    queryFn: () => fetchProductColors(productId, normalizedIncludeIds),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });
};
