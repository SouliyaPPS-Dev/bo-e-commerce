import { Box } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import {
  DashboardMenuItem,
  MenuItemLink,
  MenuProps,
  useSidebarState,
  useTranslate,
} from 'react-admin';

import blogs from '../blogs';
import categories from '../categories';
import currencies from '../currencies';
import customers from '../customers';
import orders from '../orders';
import products from '../products';
import productVariants from "../productVariants";

type MenuName = 'menuCatalog' | 'menuSales' | 'menuCustomers';

const Menu = ({ dense = false }: MenuProps) => {
  const [state, setState] = useState({
    menuCatalog: true,
    menuSales: true,
    menuCustomers: true,
  });
  const translate = useTranslate();
  const [open] = useSidebarState();

  const handleToggle = (menu: MenuName) => {
    setState((state) => ({ ...state, [menu]: !state[menu] }));
  };

  return (
    <Box
      sx={{
        width: open ? 200 : 50,
        marginTop: 1,
        marginBottom: 1,
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
      className={clsx({
        "RaMenu-open": open,
        "RaMenu-closed": !open,
      })}
    >
      <DashboardMenuItem />
      <MenuItemLink
        to="/orders"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.orders.name`, {
          smart_count: 2,
        })}
        leftIcon={<orders.icon />}
        dense={dense}
      />
      <MenuItemLink
        to="/products"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.products.name`, {
          smart_count: 2,
        })}
        leftIcon={<products.icon />}
        dense={dense}
      />
      <MenuItemLink
        to="/product_variants"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.product_variants.name`, {
          smart_count: 2,
        })}
        leftIcon={<productVariants.icon />}
        dense={dense}
      />
      <MenuItemLink
        to="/categories"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.categories.name`, {
          smart_count: 2,
        })}
        leftIcon={<categories.icon />}
        dense={dense}
      />
      <MenuItemLink
        to="/blogs"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.blogs.name`, {
          smart_count: 2,
        })}
        leftIcon={<blogs.icon />}
        dense={dense}
      />
      <MenuItemLink
        to="/customers"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.customers.name`, {
          smart_count: 2,
        })}
        leftIcon={<customers.icon />}
        dense={dense}
      />
      <MenuItemLink
        to="/users"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.users.name`, {
          smart_count: 2,
        })}
        leftIcon={
          <Box sx={{ ml: -0.1, mt: 0.2 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.6em"
              height="1.6em"
              viewBox="0 -1 24 24"
            >
              <path
                fill="currentColor"
                d="M12 23C6.443 21.765 2 16.522 2 11V5l10-4l10 4v6c0 5.524-4.443 10.765-10 12M4 6v5a10.58 10.58 0 0 0 8 10a10.58 10.58 0 0 0 8-10V6l-8-3Z"
              />
              <circle cx="12" cy="8.5" r="2.5" fill="currentColor" />
              <path
                fill="currentColor"
                d="M7 15a5.78 5.78 0 0 0 5 3a5.78 5.78 0 0 0 5-3c-.025-1.896-3.342-3-5-3c-1.667 0-4.975 1.104-5 3"
              />
            </svg>
          </Box>
        }
        dense={dense}
      />
      <MenuItemLink
        to="/currency"
        state={{ _scrollToTop: true }}
        primaryText={translate(`resources.currencies.name`, {
          smart_count: 2,
        })}
        leftIcon={<currencies.icon />}
        dense={dense}
      />
    </Box>
  );
};

export default Menu;
