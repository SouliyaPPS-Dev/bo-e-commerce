import { DataProvider } from 'react-admin';
import pb, { fetchPocketbaseDocument } from '../api/pocketbase';
import {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_URL,
} from '../utils/cloudinaryKey';
import { useImageStore } from '../store/imageStore';

export interface ProductCategory {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  name_la: string;
  image_url: string;
  created: string;
  updated: string;
}

const COLLECTION_NAME = 'product_categories';

export const productCategoriesDataProvider: Partial<DataProvider> = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'ASC' };
    const filter = params.filter || {};

    const result = pb
      .collection(COLLECTION_NAME)
      .getList<ProductCategory>(page, perPage, {
        sort: `${order === 'ASC' ? '+' : '-'}${field}`,
        filter: Object.keys(filter || {})
          .map((key) => `${key} ~ "${filter[key]}"`)
          .join(' && '),
      });
    const records = await result;

    return {
      data: records.items.map((item) => ({
        ...item,
        id: item.id.toString(),
        name: item.name,
      })) as any[],
      total: records.totalItems,
    };
  },

  getOne: async (resource, params) => {
    const record = await fetchPocketbaseDocument<ProductCategory>(
      COLLECTION_NAME,
      params.id.toString()
    );
    return {
      data: { ...record, id: record.id.toString(), name: record.name } as any,
    };
  },

  getMany: async (resource: string, params: any) => {
    try {
      const data = await Promise.all(
        params.ids.map((id: any) =>
          fetchPocketbaseDocument<ProductCategory>(COLLECTION_NAME, String(id))
        )
      );
      return { data };
    } catch (error) {
      console.error('Error fetching multiple product categories:', error);
      throw error;
    }
  },
  create: async (resource, params) => {
    const { image, ...rest } = params.data;

    if (image && image.rawFile) {
      const formData = new FormData();
      formData.append('file', image.rawFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await response.json();

      const record = await pb.collection(COLLECTION_NAME).create({
        ...rest,
        image_url: cloudinaryData.secure_url,
      });

      // Clear image store after successful upload
      useImageStore.getState().clearImageState();

      return { data: record as any };
    } else {
      const record = await pb.collection(COLLECTION_NAME).create(rest);
      return { data: record as any };
    }
  },

  update: async (resource, params) => {
    const { id, data } = params;
    const { image, ...rest } = data;

    if (image && image.rawFile) {
      const formData = new FormData();
      formData.append('file', image.rawFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await response.json();

      const record = await pb.collection(COLLECTION_NAME).update(id, {
        ...rest,
        image_url: cloudinaryData.secure_url,
      });

      // Clear image store after successful upload
      useImageStore.getState().clearImageState();

      return { data: record as any };
    } else {
      const record = await pb.collection(COLLECTION_NAME).update(id, rest);
      return { data: record as any };
    }
  },

  delete: async (resource, params) => {
    await pb.collection(COLLECTION_NAME).delete(params.id.toString());
    return { data: { id: params.id } } as any;
  },
};
