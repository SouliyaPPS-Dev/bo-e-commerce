import pb from '../api/pocketbase';
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
    // If we get here with 401, the global pb.send handler already
    // attempted a refresh and failed. Logout and propagate the error.
    if (error && error.status === 401) {
      try { await authProvider.logout({}); } catch {}
    }
    throw error;
  }
};
