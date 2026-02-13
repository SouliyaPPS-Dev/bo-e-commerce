import { DataProvider, Identifier } from "react-admin";
import pb from "../api/pocketbase";

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  weight: string;
  pattern: string;
  material: string;
  is_active: boolean;
  created: string;
  updated: string;
  collectionId?: string;
  collectionName?: string;
}

export interface ProductVariantFilter {
  q?: string;
  product_id?: string;
  is_active?: boolean;
}

const normalizeProductId = (value: any): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const normalizeVariantRecord = (record: any): ProductVariant => ({
  ...record,
  product_id: normalizeProductId(record.product_id),
  color: record.color ?? "",
  size: record.size ?? "",
  weight: record.weight ?? "",
  pattern: record.pattern ?? "",
  material: record.material ?? "",
  is_active:
    typeof record.is_active === "boolean"
      ? record.is_active
      : Boolean(record.is_active ?? true),
});

const mapToPocketbasePayload = (data: Partial<ProductVariant>) => {
  const { product_id, ...rest } = data;
  const payload: Record<string, any> = { ...rest };

  if (product_id !== undefined) {
    payload.product_id = product_id ? [product_id] : [];
  }

  return payload;
};

const buildFilter = (filter: ProductVariantFilter = {}) => {
  const filterParts: string[] = [];
  if (filter.q) {
    filterParts.push(
      `(color ~ "${filter.q}" || size ~ "${filter.q}" || pattern ~ "${filter.q}" || material ~ "${filter.q}" || weight ~ "${filter.q}")`,
    );
  }
  if (filter.product_id) {
    filterParts.push(`product_id ?= "${filter.product_id}"`);
  }
  if (typeof filter.is_active === "boolean") {
    filterParts.push(`is_active = ${filter.is_active}`);
  }
  return filterParts.join(" && ");
};

export const productVariantsDataProvider: Partial<DataProvider> = {
  getList: async (_, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
    const { field, order } = params.sort || { field: "updated", order: "DESC" };
    const filterStr = buildFilter(params.filter || {});

    const result = await pb
      .collection("product_variants")
      .getList(page, perPage, {
        filter: filterStr || undefined,
        sort: `${order === "DESC" ? "-" : ""}${field}`,
        expand: "product_id",
      });

    return {
      data: result.items.map(normalizeVariantRecord) as any,
      total: result.totalItems,
    };
  },

  getOne: async (_, params) => {
    const record = await pb
      .collection("product_variants")
      .getOne(params.id.toString(), { expand: "product_id" });
    return { data: normalizeVariantRecord(record) as any };
  },

  getMany: async (_, params) => {
    const records = await Promise.all(
      params.ids.map((id: Identifier) =>
        pb.collection("product_variants").getOne(id.toString()),
      ),
    );
    return { data: records.map(normalizeVariantRecord) as any };
  },

  getManyReference: async (_, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
    const { field, order } = params.sort || { field: "updated", order: "DESC" };
    const baseFilter = params.filter as ProductVariantFilter;
    const referenceFilter: ProductVariantFilter = {
      ...baseFilter,
      product_id:
        params.target === "product_id"
          ? (params.id as string)
          : baseFilter?.product_id,
    };
    const filterStr = buildFilter(referenceFilter);

    const result = await pb
      .collection("product_variants")
      .getList(page, perPage, {
        filter:
          filterStr ||
          (params.target && params.id
            ? `${params.target} = "${params.id}"`
            : undefined),
        sort: `${order === "DESC" ? "-" : ""}${field}`,
      });

    return {
      data: result.items.map(normalizeVariantRecord) as any,
      total: result.totalItems,
    };
  },

  create: async (_, params) => {
    const record = await pb
      .collection("product_variants")
      .create(mapToPocketbasePayload(params.data));
    return { data: normalizeVariantRecord(record) as any };
  },

  update: async (_, params) => {
    const record = await pb
      .collection("product_variants")
      .update(params.id, mapToPocketbasePayload(params.data));
    return { data: normalizeVariantRecord(record) as any };
  },

  delete: async (_, params) => {
    await pb.collection("product_variants").delete(params.id.toString());
    return { data: { id: params.id } } as any;
  },

  deleteMany: async (_, params) => {
    await Promise.all(
      params.ids.map((id: Identifier) =>
        pb.collection("product_variants").delete(id.toString()),
      ),
    );
    return { data: params.ids };
  },

  updateMany: async (_, params) => {
    await Promise.all(
      params.ids.map((id: Identifier) =>
        pb
          .collection("product_variants")
          .update(id.toString(), mapToPocketbasePayload(params.data)),
      ),
    );
    return { data: params.ids };
  },
};
