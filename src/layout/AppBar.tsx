import { Box, Theme, useMediaQuery } from '@mui/material';
import { AppBar, TitlePortal } from 'react-admin';

import { AppBarToolbar } from './AppBarToolbar';

const CustomAppBar = () => {
  const isLargeEnough = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.up('sm')
  );
  return (
    <AppBar color='secondary' toolbar={<AppBarToolbar />}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <img
          src='/logo.png'
          alt='Logo'
          style={{
            height: 40,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <TitlePortal />
      </Box>
      {isLargeEnough && <Box component='span' sx={{ flex: 1 }} />}
    </AppBar>
  );
};

export default CustomAppBar;
