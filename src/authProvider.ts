import { AuthProvider } from 'react-admin';
import pb, { refreshAuthToken } from './api/pocketbase'; // Import PocketBase instance and refreshAuthToken

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
    if (status === 401 || status === 403) {
      try {
        await refreshAuthToken();
        // If refresh is successful, token is renewed, so resolve the error
        return Promise.resolve();
      } catch (error) {
        // If refresh fails, then log out
        localStorage.removeItem('username');
        localStorage.removeItem('avatar');
        localStorage.removeItem('id');
        localStorage.removeItem('role');
        pb.authStore.clear(); // Clear PocketBase auth store
        return Promise.reject();
      }
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
