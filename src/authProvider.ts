import { AuthProvider } from 'react-admin';
import pb from './api/pocketbase'; // Import PocketBase instance

const authProvider: AuthProvider = {
  login: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      const response = await pb
        .collection('users')
        .authWithPassword(email, password);

      localStorage.setItem('username', response?.record?.username);
      localStorage.setItem('avatar', response?.record?.avatar);
      localStorage.setItem('id', response?.record?.id);
      localStorage.setItem('role', response?.record?.role);

      const token = response.token;

      if (token) {
        pb.authStore.save(token); // Save token in PocketBase's auth store
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  },
  logout: () => {
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    pb.authStore.clear(); // Clear PocketBase auth store
    return Promise.resolve();
  },
  checkError: async ({ status }: { status: number }) => {
    // On 401/403, do not try to refresh here to avoid loops.
    // Just clear auth and reject so RA can redirect to login.
    if (status === 401 || status === 403) {
      localStorage.removeItem('username');
      localStorage.removeItem('avatar');
      localStorage.removeItem('id');
      localStorage.removeItem('role');
      try { pb.authStore.clear(); } catch {}
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () =>
    localStorage.getItem('username') ? Promise.resolve() : Promise.reject(),
  getPermissions: () => Promise.resolve(),
  getIdentity: () =>
    Promise.resolve({
      id: localStorage.getItem('id') || '',
      fullName: localStorage.getItem('username') || '',
      avatar: localStorage.getItem('avatar') || '',
    }),
};

export default authProvider;
