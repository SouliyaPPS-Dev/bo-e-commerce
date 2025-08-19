import PocketBase from 'pocketbase';

const pb = new PocketBase('https://sensornode.shop');
// const pb = new PocketBase('http://localhost:8080');
pb.autoCancellation(false);

export default pb;

// Function to refresh the authentication token
export const refreshAuthToken = async (): Promise<void> => {
  try {
    await pb.collection('users').authRefresh();
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
    // Optionally, handle token refresh failure (e.g., redirect to login)
  }
};

// Global 401 handler: retry once after refreshing token
const originalSend = pb.send.bind(pb);
// Override the SDK send method to auto-refresh on 401 across all calls
// This affects: collection CRUD, file operations, and custom endpoints via pb.send
pb.send = (async (url: string, options: any = {}) => {
  try {
    return await originalSend(url, options);
  } catch (error: any) {
    if (error && error.status === 401) {
      try {
        await pb.collection('users').authRefresh();
        // Retry original request once after successful refresh
        return await originalSend(url, options);
      } catch (refreshError) {
        // Ensure invalid auth is cleared so RA can redirect/login via authProvider
        try { pb.authStore.clear(); } catch {}
        throw error;
      }
    }
    throw error;
  }
}) as any;

// Generic function to fetch a single document from the collection
export const fetchPocketbaseDocument = async <T extends Record<string, any>>(
  collection: string,
  id: string | any
): Promise<T> => {
  const record = await pb.collection(collection).getOne<T>(id);
  return record;
};

// Generic function to fetch all documents from the collection
export async function fetchAllPocketbaseDocuments<
  T extends Record<string, any>
>(collectionName: string): Promise<T[]> {
  const records = await pb.collection(collectionName).getFullList();
  return records.map((record) => record as unknown as T);
}

// Generic function to create a document in the collection
export async function createPocketbaseDocument<T extends Record<string, any>>(
  collectionName: string,
  data: T
): Promise<string> {
  const record = await pb.collection(collectionName).create(data);
  return record.id;
}

// Generic function to update a document in the collection
export async function updatePocketbaseDocument<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  await pb.collection(collectionName).update(id, data);
}

// Generic function to delete a document from the collection
export async function deletePocketbaseDocument(
  collectionName: string,
  id: string
): Promise<void> {
  await pb.collection(collectionName).delete(id);
}
