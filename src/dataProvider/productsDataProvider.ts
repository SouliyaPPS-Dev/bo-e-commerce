import pb, {
  createPocketbaseDocument,
  fetchPocketbaseDocument,
  updatePocketbaseDocument,
} from '../api/pocketbase';

export interface ProductData {
  collectionId: string;
  collectionName: string;
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string[] | string;
  name_la: string;
  description_la: string;
  details: string;
  details_la: string;
  total_count: number;
  sell_count: number;
  old_price?: number;
  design_story_en?: string;
  design_story_la?: string;
  exceptional_quality_en?: string;
  exceptional_quality_la?: string;
  ethical_craft_en?: string;
  ethical_craft_la?: string;
  sort_by?: string;
  colors?: string | string[];
  is_delete: boolean;
  created: string;
  updated: string;
}

export interface ProductFilter {
  q?: string;
  category_id?: string;
  price_gte?: number;
  price_lte?: number;
  name?: string;
  sales_best?: boolean;
  sales_average?: boolean;
  sales_low?: boolean;
  sales_never?: boolean;
  stock_out?: boolean;
  stock_low?: boolean;
  stock_medium?: boolean;
  stock_high?: boolean;
}

export interface ProductListParams {
  pagination: { page: number; perPage: number };
  sort: { field: string; order: 'ASC' | 'DESC' };
  filter: ProductFilter;
}

export interface ProductListResponse {
  data: ProductData[];
  total: number;
}

const normalizeImageUrls = (input: ProductData['image_url']): string[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input
      .map((url) => (url ? String(url).trim() : ''))
      .filter((url) => url.length > 0);
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return [];
    }
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((url) => (url ? String(url).trim() : ''))
            .filter((url) => url.length > 0);
        }
      } catch {
        // fall back to comma separated parsing
      }
    }
    return trimmed
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  }

  return [];
};

const normalizeProductPayload = (
  data: Partial<ProductData>,
  isCreate = false
): Record<string, any> => {
  const {
    id,
    collectionId,
    collectionName,
    created,
    updated,
    ...rest
  } = data;

  const normalized: Record<string, any> = {
    ...rest,
    image_url: normalizeImageUrls(rest.image_url ?? []),
    description: rest.description ?? '',
    description_la: rest.description_la ?? '',
    details: rest.details ?? '',
    details_la: rest.details_la ?? '',
    design_story_en: rest.design_story_en ?? '',
    design_story_la: rest.design_story_la ?? '',
    exceptional_quality_en: rest.exceptional_quality_en ?? '',
    exceptional_quality_la: rest.exceptional_quality_la ?? '',
    ethical_craft_en: rest.ethical_craft_en ?? '',
    ethical_craft_la: rest.ethical_craft_la ?? '',
    total_count: rest.total_count ?? 0,
    sell_count: rest.sell_count ?? 0,
    old_price:
      rest.old_price !== undefined
        ? rest.old_price
        : rest.price !== undefined
        ? rest.price
        : 0,
    sort_by: rest.sort_by || 'Newest',
    colors: Array.isArray(rest.colors)
      ? rest.colors[0] ?? ''
      : rest.colors ?? '',
  };

  if (isCreate) {
    normalized.is_delete = false;
  }

  return normalized;
};

const normalizeProductRecord = (record: any): ProductData => ({
  ...record,
  image_url: normalizeImageUrls(record.image_url),
  colors: Array.isArray(record.colors)
    ? record.colors[0] ?? ''
    : record.colors ?? '',
});

export const productsDataProvider: any = {
  getList: async (
    resource: string,
    params: ProductListParams
  ): Promise<ProductListResponse> => {
    const { pagination, sort, filter } = params;
    const { page, perPage } = pagination;
    const { field, order } = sort;

    let filterStr = '';
    const filterConditions: string[] = [];

    if (filter.q) {
      const qConditions: string[] = [
        `name ~ "${filter.q}"`,
        `description ~ "${filter.q}"`,
        `name_la ~ "${filter.q}"`,
        `description_la ~ "${filter.q}"`,
      ];

      const priceAsNumber = parseFloat(filter.q);
      if (!isNaN(priceAsNumber)) {
        qConditions.push(`price = ${priceAsNumber}`);
      }
      filterConditions.push(`(${qConditions.join(' || ')})`);
    }

    if (filter.category_id) {
      filterConditions.push(`category_id = "${filter.category_id}"`);
    }

    if (filter.price_gte) {
      filterConditions.push(`price >= ${filter.price_gte}`);
    }

    if (filter.price_lte) {
      filterConditions.push(`price <= ${filter.price_lte}`);
    }

    // Stock filters (assuming we have a stock field)
    const stockFilters: string[] = [];
    if (filter.stock_out) {
      stockFilters.push('stock = 0');
    }
    if (filter.stock_low) {
      stockFilters.push('(stock >= 1 && stock <= 9)');
    }
    if (filter.stock_medium) {
      stockFilters.push('(stock >= 10 && stock <= 49)');
    }
    if (filter.stock_high) {
      stockFilters.push('stock >= 50');
    }
    if (stockFilters.length > 0) {
      filterConditions.push(`(${stockFilters.join(' || ')})`);
    }

    // Sales filters (assuming we have sales data or need to calculate from orders)
    const salesFilters: string[] = [];
    if (filter.sales_best) {
      salesFilters.push('sales_count > 100'); // Adjust threshold as needed
    }
    if (filter.sales_average) {
      salesFilters.push('(sales_count >= 10 && sales_count <= 100)');
    }
    if (filter.sales_low) {
      salesFilters.push('(sales_count >= 1 && sales_count < 10)');
    }
    if (filter.sales_never) {
      salesFilters.push('sales_count = 0');
    }
    if (salesFilters.length > 0) {
      filterConditions.push(`(${salesFilters.join(' || ')})`);
    }

    if (filterConditions.length > 0) {
      filterStr = `(${filterConditions.join(' && ')}) && is_delete = false`;
    } else {
      filterStr = `is_delete = false`;
    }

    const sortStr = `${order === 'DESC' ? '-' : ''}${field}`;

    try {
      const result = await pb.collection('products').getList(page, perPage, {
        filter: filterStr,
        sort: sortStr,
        expand: 'category_id',
      });

      return {
        data: result.items.map((item: any) => normalizeProductRecord(item)),
        total: result.totalItems,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  },

  getOne: async (
    resource: string,
    params: { id: string }
  ): Promise<{ data: ProductData }> => {
    try {
      const record = await fetchPocketbaseDocument<ProductData>(
        'products',
        params.id
      );
      if (record.is_delete) {
        throw new Error('Product not found'); // Or handle as appropriate for your UI
      }
      return { data: normalizeProductRecord(record) };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  },

  getMany: async (
    resource: string,
    params: { ids: string[] }
  ): Promise<{ data: ProductData[] }> => {
    try {
      const filterStr = params.ids.map((id) => `id = "${id}"`).join(' || ');
      const result = await pb
        .collection('products')
        .getList(1, params.ids.length, {
          filter: filterStr,
        });
      const normalizedItems = result.items.map((item: any) =>
        normalizeProductRecord(item)
      );
      return { data: normalizedItems };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  },

  getManyReference: async (
    resource: string,
    params: {
      target: string;
      id: string;
      pagination: { page: number; perPage: number };
      sort: { field: string; order: 'ASC' | 'DESC' };
      filter: ProductFilter;
    }
  ): Promise<ProductListResponse> => {
    const { target, id, pagination, sort, filter } = params;
    const { page, perPage } = pagination;
    const { field, order } = sort;

    const filterConditions: string[] = [`${target} = "${id}"`];

    if (filter.q) {
      filterConditions.push(
        `(name ~ "${filter.q}" || description ~ "${filter.q}")`
      );
    }

    const filterStr = filterConditions.join(' && ');
    const sortStr = `${order === 'DESC' ? '-' : ''}${field}`;

    try {
      const result = await pb.collection('products').getList(page, perPage, {
        filter: filterStr,
        sort: sortStr,
      });

      return {
        data: result.items.map((item: any) => normalizeProductRecord(item)),
        total: result.totalItems,
      };
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw new Error('Failed to fetch related products');
    }
  },

  create: async (
    resource: string,
    params: { data: Partial<ProductData> }
  ): Promise<{ data: ProductData }> => {
    try {
      const payload = normalizeProductPayload(params.data, true);
      const id = await createPocketbaseDocument('products', payload);
      const record = await fetchPocketbaseDocument<ProductData>('products', id);
      return { data: normalizeProductRecord(record) };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  },

  update: async (
    resource: string,
    params: { id: string; data: Partial<ProductData> }
  ): Promise<{ data: ProductData }> => {
    const { id, data } = params;
    try {
      const payload = normalizeProductPayload(data);
      await updatePocketbaseDocument('products', id, payload);
      const record = await fetchPocketbaseDocument<ProductData>('products', id);
      return { data: normalizeProductRecord(record) };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  },

  updateMany: async (
    resource: string,
    params: { ids: string[]; data: Partial<ProductData> }
  ): Promise<{ data: string[] }> => {
    const { ids, data } = params;
    try {
      await Promise.all(
        ids.map((id) => updatePocketbaseDocument('products', id, data))
      );
      return { data: ids };
    } catch (error) {
      console.error('Error updating products:', error);
      throw new Error('Failed to update products');
    }
  },

  delete: async (
    resource: string,
    params: { id: string }
  ): Promise<{ data: ProductData }> => {
    const { id } = params;
    try {
      const record = await fetchPocketbaseDocument<ProductData>('products', id);
      await updatePocketbaseDocument('products', id, { is_delete: true });
      return { data: { ...record, is_delete: true } };
    } catch (error) {
      console.error('Error soft-deleting product:', error);
      throw new Error('Failed to soft-delete product');
    }
  },

  deleteMany: async (
    resource: string,
    params: { ids: string[] }
  ): Promise<{ data: string[] }> => {
    const { ids } = params;
    try {
      await Promise.all(
        ids.map((id) =>
          updatePocketbaseDocument('products', id, { is_delete: true })
        )
      );
      return { data: ids };
    } catch (error) {
      console.error('Error soft-deleting products:', error);
      throw new Error('Failed to soft-delete products');
    }
  },
};
