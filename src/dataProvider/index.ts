import { DataProvider } from 'react-admin';
import ordersApiDataProvider from './ordersApi';
import { blogsDataProvider } from './blogsDataProvider';
import { customersDataProvider } from './customersDataProvider';
import { productsDataProvider } from './productsDataProvider';
import { productVariantsDataProvider } from "./productVariantsDataProvider";
import { productCategoriesDataProvider } from './productCategoriesDataProvider';
import { usersDataProvider } from './usersDataProvider';
import { addressesDataProvider } from './addressesDataProvider';
import { currenciesDataProvider } from './currenciesDataProvider';

import { notify } from '../utils/notify';

export default (type: string) => {
  // The fake servers require to generate data, which can take some time.
  // Here we start the server initialization but we don't wait for it to finish
  const dataProviderPromise = getDataProvider(type);

  // Instead we return this proxy which may be called immediately by react-admin if the
  // user is already signed-in. In this case, we simply wait for the dataProvider promise
  // to complete before requesting it the data.
  // If the user isn't signed in, we already started the server initialization while they see
  // the login page. By the time they come back to the admin as a signed-in user,
  // the fake server will be initialized.
  const dataProviderWithGeneratedData = new Proxy(defaultDataProvider, {
    get(_, name) {
      if (name === 'supportAbortSignal') {
        return import.meta.env.MODE === 'production';
      }
      return async (resource: string, params: any) => {
        try {
          // Use custom orders API for orders resource
          if (resource === "orders" && ordersApiDataProvider[name.toString()]) {
            return await ordersApiDataProvider[name.toString()](
              resource,
              params,
            );
          }

          // Use custom blogs data provider for blogs resource
          if (resource === "blogs" && blogsDataProvider[name.toString()]) {
            return await blogsDataProvider[name.toString()](resource, params);
          }

          // Use custom customers data provider for customers resource
          if (
            resource === "customers" &&
            customersDataProvider[name.toString()]
          ) {
            return await customersDataProvider[name.toString()](
              resource,
              params,
            );
          }

          // Use custom products data provider for products resource
          if (
            resource === "products" &&
            productsDataProvider[name.toString()]
          ) {
            return await productsDataProvider[name.toString()](
              resource,
              params,
            );
          }

          // Use custom product variants data provider for product_variants resource
          if (
            resource === "product_variants" &&
            productVariantsDataProvider[name.toString()]
          ) {
            return await productVariantsDataProvider[name.toString()](
              resource,
              params,
            );
          }

          // Use custom product categories data provider for product_categories and categories resources
          if (
            (resource === "product_categories" || resource === "categories") &&
            productCategoriesDataProvider[name.toString()]
          ) {
            return await productCategoriesDataProvider[name.toString()](
              resource,
              params,
            );
          }

          // Use custom users data provider for users resource
          if (resource === "users" && usersDataProvider[name.toString()]) {
            return await usersDataProvider[name.toString()](resource, params);
          }

          // Use custom addresses data provider for addresses resource
          if (
            resource === "addresses" &&
            addressesDataProvider[name.toString()]
          ) {
            return await addressesDataProvider[name.toString()](
              resource,
              params,
            );
          }

          // Use custom currencies data provider for currencies resource
          if (resource === "currency" || resource === "currencies") {
            console.log("=> currency resource detected", {
              method: name.toString(),
              resource,
              params,
            });
            console.log(
              "=> currenciesDataProvider methods:",
              Object.keys(currenciesDataProvider),
            );

            const methodName = name.toString();
            const providerMethod =
              currenciesDataProvider[
                methodName as keyof typeof currenciesDataProvider
              ];

            if (providerMethod && typeof providerMethod === "function") {
              console.log("=> call api currency", {
                method: methodName,
                resource,
                params,
              });
              return await providerMethod(resource, params);
            } else {
              console.log(
                "=> method not found in currenciesDataProvider, falling back to default",
                { methodName },
              );
            }
          }

          const dataProvider = await dataProviderPromise;
          return await dataProvider[name.toString()](resource, params);
        } catch (error: any) {
          notify(error.message, 'error');
          throw error;
        }
      };
    },
  });

  return dataProviderWithGeneratedData;
};

const getDataProvider = async (type: string): Promise<DataProvider> => {
  return import('./rest').then((provider) => provider.default);
};

const defaultDataProvider: DataProvider = {
  // @ts-ignore
  create: () => Promise.resolve({ data: { id: 0 } }),
  // @ts-ignore
  delete: () => Promise.resolve({ data: {} }),
  deleteMany: () => Promise.resolve({}),
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  // @ts-ignore
  getOne: () => Promise.resolve({ data: {} }),
  // @ts-ignore
  update: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({}),
};
