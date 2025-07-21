import pb, { refreshAuthToken } from '../api/pocketbase';
import authProvider from '../authProvider';

interface PocketBaseSendOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
}

export const pbHttpClient = async (
  url: string,
  options: PocketBaseSendOptions = {}
): Promise<any> => {
  try {
    const response = await pb.send(url, options);
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      try {
        await refreshAuthToken();
        // If token refresh is successful, retry the original request
        const response = await pb.send(url, options);
        return response;
      } catch (refreshError) {
        // If token refresh fails, trigger logout via authProvider
        authProvider.logout({});
        throw error; // Re-throw the original 401 error to propagate
      }
    }
    throw error;
  }
};
