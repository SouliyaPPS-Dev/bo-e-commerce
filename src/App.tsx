import { useEffect } from 'react';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import {
  Admin,
  CustomRoutes,
  Resource,
  StoreContextProvider,
  localStorageStore,
  useStore,
  useNotify,
} from 'react-admin';
import { Route } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authProvider from './authProvider';
import blogs from './blogs';
import categories from './categories';
import { CurrencyProvider } from './components/CurrencySelector/CurrencyProvider';
import currencies from './currencies';
import customers from './customers';
import { Dashboard } from './dashboard';
import dataProviderFactory from './dataProvider';
import englishMessages from './i18n/en';
import invoices from './invoices';
import { Layout } from './layout';
import LoginPage from './layout/Login';
import orders from './orders';
import products from './products';
import productVariants from "./productVariants";
import reviews from './reviews';
import Segments from './segments/Segments';
import MuiProvider from './styles/ThemeProvider';
import { ThemeName, themes } from './themes/themes';
import users from './users';

const i18nProvider = polyglotI18nProvider(
  (locale) => {
    if (locale === 'la') {
      return import('./i18n/la').then((messages) => messages.default);
    }

    // Always fallback on english
    return englishMessages;
  },
  'en',
  [
    { locale: 'en', name: 'English' },
    { locale: 'la', name: 'Lao' },
  ]
);

const store = localStorageStore(undefined, 'ECommerce');

const App = () => {
  const notify = useNotify();
  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message, type } = customEvent.detail;
      notify(message, { type });
    };

    window.addEventListener('show-notification', handleNotification);

    return () => {
      window.removeEventListener('show-notification', handleNotification);
    };
  }, [notify]);
  const [themeName] = useStore<ThemeName>('themeName', 'soft');
  const singleTheme = themes.find((theme) => theme.name === themeName)?.single;
  const lightTheme = themes.find((theme) => theme.name === themeName)?.light;
  const darkTheme = themes.find((theme) => theme.name === themeName)?.dark;
  return (
    <Admin
      title="Admin"
      dataProvider={dataProviderFactory(
        process.env.REACT_APP_DATA_PROVIDER || "",
      )}
      store={store}
      authProvider={authProvider}
      dashboard={Dashboard}
      loginPage={LoginPage}
      layout={Layout}
      i18nProvider={i18nProvider}
      disableTelemetry
      theme={singleTheme}
      lightTheme={lightTheme}
      darkTheme={darkTheme}
      defaultTheme="light"
      requireAuth
    >
      <CustomRoutes>
        <Route path="/segments" element={<Segments />} />
      </CustomRoutes>
      <Resource name="customers" {...customers} />
      <Resource name="orders" {...orders} />
      <Resource name="invoices" {...invoices} />
      <Resource name="products" {...products} />
      <Resource name="product_variants" {...productVariants} />
      <Resource name="categories" {...categories} />
      <Resource name="reviews" {...reviews} />
      <Resource name="blogs" {...blogs} />
      <Resource name="users" {...users} />
      <Resource name="currency" {...currencies} />
    </Admin>
  );
};

// Create a client
const queryClient = new QueryClient();

const AppWrapper = () => (
  <StoreContextProvider value={store}>
    <QueryClientProvider client={queryClient}>
      <MuiProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </MuiProvider>
    </QueryClientProvider>
  </StoreContextProvider>
);

export default AppWrapper;
