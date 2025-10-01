import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ClienteMenuButton({ sx, ...other }) {
  return (
    <IconButton 
      sx={{ 
        mr: 1,
        ml: -1,
        ...sx 
      }} 
      {...other}
      aria-label="Abrir menu de navegação"
    >
      <Iconify icon="solar:hamburger-menu-bold-duotone" width={24} />
    </IconButton>
  );
}
