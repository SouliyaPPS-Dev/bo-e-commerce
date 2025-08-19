import { DataProvider } from 'react-admin';
import pb from '../api/pocketbase';

export interface User {
  id: string;
  collectionId: string;
  collectionName: string;
  avatar: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  emailVisibility: boolean;
  verified: boolean;
  status?: boolean;
  created: string;
  updated: string;
}

const CLOUDINARY_UPLOAD_PRESET = 'images';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/db84fdke0/upload';

const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

export const usersDataProvider: Partial<DataProvider> = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'ASC' };
    const { q, ...filters } = params.filter;

    try {
      let filter = '';
      const filterParts = [];

      // Search query
      if (q) {
        filterParts.push(`(full_name ~ "${q}" || email ~ "${q}" || username ~ "${q}")`);
      }

      // Other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            filterParts.push(`${key} = ${value}`);
          } else if (typeof value === 'string') {
            filterParts.push(`${key} ~ "${value}"`);
          } else {
            filterParts.push(`${key} = ${value}`);
          }
        }
      });

      if (filterParts.length > 0) {
        filter = filterParts.join(' && ');
      }

      const result = await pb.collection('users').getList(page, perPage, {
        sort: order === 'ASC' ? `+${field}` : `-${field}`,
        filter: filter || undefined,
      });

      return {
        data: result.items as any,
        total: result.totalItems,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getOne: async (resource, params) => {
    try {
      const record = await pb.collection('users').getOne(params.id.toString());
      return { data: record as any };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  create: async (resource, params) => {
    try {
      const { password, passwordConfirm, avatar, ...rest } = params.data;
      let avatarUrl = '';

      if (avatar && avatar.rawFile) {
        avatarUrl = await uploadImageToCloudinary(avatar.rawFile);
      }

      const dataToCreate = {
        ...rest,
        emailVisibility: true,
        password,
        passwordConfirm,
        avatar: avatarUrl,
      };

      const record = await pb.collection('users').create(dataToCreate);
      await pb.collection('users').requestVerification(rest.email);
      return { data: record as any };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  update: async (resource, params) => {
    try {
      const { id, data } = params;
      const { password, oldPassword, passwordConfirm, avatar, email, ...rest } = data;

      // Fetch current user data to compare email
      const currentUser = await pb.collection('users').getOne(id);

      // Handle password change separately
      if (password) {
        if (!oldPassword) {
          throw new Error('Old password is required to change the password.');
        }
        await pb.collection('users').update(id, {
          password,
          passwordConfirm,
          oldPassword,
        });
      }

      // Handle email change separately if it's different
      if (email !== currentUser.email) {
        await pb.collection('users').update(id, { email });
      }

      const formData = new FormData();
      // Append other fields to formData
      for (const key in rest) {
        if (Object.prototype.hasOwnProperty.call(rest, key)) {
          formData.append(key, rest[key]);
        }
      }
      formData.append('emailVisibility', 'true');

      // Handle avatar update
      if (avatar && avatar.rawFile) {
        // New avatar selected
        const avatarUrl = await uploadImageToCloudinary(avatar.rawFile);
        formData.append('avatar', avatarUrl);
      } else if (avatar === null) {
        // Avatar cleared
        formData.append('avatar', ''); // Send empty string to clear the file in PocketBase
      } else if (typeof avatar === 'string' && avatar !== currentUser.avatar) {
        // Existing avatar URL changed (e.g., user typed a new URL)
        formData.append('avatar', avatar);
      }
      // If avatar is a string (existing URL) and not changed, do not append it to formData
      // PocketBase will retain the existing avatar if no new file is provided.

      const updatedRecord = await pb.collection('users').update(id, formData);

      return { data: { ...updatedRecord, id } as any };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  delete: async (resource, params) => {
    try {
      await pb.collection('users').delete(params.id.toString());
      return { data: { id: params.id } } as any;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  deleteMany: async (resource, params) => {
    try {
      await Promise.all(
        params.ids.map(id => pb.collection('users').delete(id.toString()))
      );
      return { data: params.ids };
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  },

  getMany: async (resource, params) => {
    try {
      const records = await Promise.all(
        params.ids.map(id => pb.collection('users').getOne(id.toString()))
      );
      return { data: records as any };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'ASC' };
    const { target, id } = params;

    try {
      const filter = `${target} = "${id}"`;
      
      const result = await pb.collection('users').getList(page, perPage, {
        sort: order === 'ASC' ? `+${field}` : `-${field}`,
        filter,
      });

      return {
        data: result.items as any,
        total: result.totalItems,
      };
    } catch (error) {
      console.error('Error fetching users reference:', error);
      throw error;
    }
  },
};
