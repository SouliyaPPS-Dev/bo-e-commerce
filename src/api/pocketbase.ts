import PocketBase from 'pocketbase';

const pb = new PocketBase('http://5.161.45.56:8090');
// const pb = new PocketBase('http://localhost:8080');
pb.autoCancellation(false);

export default pb;

// Global 401 handler with single refresh attempt and proper cleanup
const originalSend = pb.send.bind(pb);

let refreshPromise: Promise<any> | null = null;

pb.send = (async (url: string, options: any = {}) => {
  try {
    return await originalSend(url, options);
  } catch (error: any) {
    if (!error || error.status !== 401) {
      throw error;
    }

    // Do not try to refresh if there's no token or if the request
    // was already an auth call (to avoid loops)
    const token = pb.authStore?.token;
    const lowerUrl = (url || '').toString().toLowerCase();
    if (!token || lowerUrl.includes('auth-refresh') || lowerUrl.includes('auth-with-password')) {
      throw error;
    }

    // If a refresh is already in progress, wait for it
    if (refreshPromise) {
      try {
        await refreshPromise;
        // Retry original request after successful refresh
        return await originalSend(url, options);
      } catch (e) {
        // Refresh failed; ensure cleanup then propagate
        try { pb.authStore.clear(); } catch {}
        try {
          localStorage.removeItem('username');
          localStorage.removeItem('avatar');
          localStorage.removeItem('id');
          localStorage.removeItem('role');
        } catch {}
        throw error;
      }
    }

    // Start a single refresh attempt
    refreshPromise = (async () => {
      // Call the refresh endpoint directly via originalSend to avoid recursion
      const refreshUrl = '/api/collections/users/auth-refresh';
      const headers = Object.assign({}, options?.headers || {}, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
      const res = await originalSend(refreshUrl, { method: 'POST', headers });
      // Expect res to include token and record; update auth store if present
      try {
        const token = (res as any)?.token;
        const record = (res as any)?.record;
        if (token) {
          // save(token, model?) - model is optional; pass record if available
          // @ts-ignore
          pb.authStore.save(token, record);
        }
      } catch {}
      return res;
    })();

    try {
      await refreshPromise;
      // Clear the promise for next time
      refreshPromise = null;
      // Retry original request
      return await originalSend(url, options);
    } catch (refreshError) {
      // Cleanup and propagate error
      refreshPromise = null;
      try { pb.authStore.clear(); } catch {}
      try {
        localStorage.removeItem('username');
        localStorage.removeItem('avatar');
        localStorage.removeItem('id');
        localStorage.removeItem('role');
      } catch {}
      throw error;
    }
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
