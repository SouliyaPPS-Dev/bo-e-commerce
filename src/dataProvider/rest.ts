import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';
import authProvider from '../authProvider';

const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
  try {
    const response = await fetchUtils.fetchJson(url, options);
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      try {
        await authProvider.checkError({ status: 401 });
        // If token refresh is successful, retry the original request
        const response = await fetchUtils.fetchJson(url, options);
        return response;
      } catch (refreshError) {
        // If token refresh fails, re-throw the error to trigger logout
        throw error;
      }
    }
    throw error;
  }
};

export default simpleRestProvider(process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000', httpClient);
