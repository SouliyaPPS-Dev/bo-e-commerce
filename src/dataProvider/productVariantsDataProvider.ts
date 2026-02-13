import { DataProvider, Identifier } from "react-admin";
import pb from "../api/pocketbase";

export interface ProductVariant {
  id: string;
  product_id?: string | string[];
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
  is_active?: boolean;
  product_id?: string;
}

const normalizeVariantRecord = (record: any): ProductVariant => {
  const productId = Array.isArray(record?.product_id)
    ? record.product_id[0]
    : record?.product_id;

  return {
    ...record,
    product_id: productId || undefined,
    color: record.color ?? "",
    size: record.size ?? "",
    weight: record.weight ?? "",
    pattern: record.pattern ?? "",
    material: record.material ?? "",
    is_active:
      typeof record.is_active === "boolean"
        ? record.is_active
        : Boolean(record.is_active ?? true),
  };
};

const mapToPocketbasePayload = (data: Partial<ProductVariant>) => {
  const { product_id, ...rest } = data;
  const payload: Record<string, any> = { ...rest };

  if (Array.isArray(product_id)) {
    payload.product_id = product_id.filter((value) => Boolean(value));
  } else if (typeof product_id === "string" && product_id.trim().length > 0) {
    payload.product_id = [product_id.trim()];
  } else if (product_id === null) {
    payload.product_id = [];
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
  if (typeof filter.is_active === "boolean") {
    filterParts.push(`is_active = ${filter.is_active}`);
  }

  if (filter.product_id) {
    filterParts.push(`product_id ?= "${filter.product_id}"`);
  }
  return filterParts.join(" && ");
};

export const productVariantsDataProvider: Partial<DataProvider> = {
  getList: async (_, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
    const { field, order } = params.sort || { field: "updated", order: "DESC" };
    const sortField = field === "product_id" || !field ? "updated" : field;
    const sortPrefix = order === "DESC" ? "-" : "";
    const filterStr = buildFilter(params.filter || {});
    const listOptions: Record<string, any> = {
      sort: `${sortPrefix}${sortField}`,
    };

    if (filterStr) {
      listOptions.filter = filterStr;
    }

    const result = await pb
      .collection("product_variants")
      .getList(page, perPage, listOptions);

    return {
      data: result.items.map(normalizeVariantRecord) as any,
      total: result.totalItems,
    };
  },

  getOne: async (_, params) => {
    const record = await pb
      .collection("product_variants")
      .getOne(params.id.toString());
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
    const sortField = field === "product_id" || !field ? "updated" : field;
    const sortPrefix = order === "DESC" ? "-" : "";
    const baseFilter = params.filter as ProductVariantFilter;
    const filterStr = buildFilter(baseFilter);
    const listOptions: Record<string, any> = {
      sort: `${sortPrefix}${sortField}`,
    };

    if (filterStr) {
      listOptions.filter = filterStr;
    } else if (params.target && params.id) {
      listOptions.filter = `${params.target} = "${params.id}"`;
    }

    const result = await pb
      .collection("product_variants")
      .getList(page, perPage, listOptions);

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
