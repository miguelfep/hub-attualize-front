'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { NavSectionVertical } from 'src/components/nav-section/vertical';
import { EmpresaSelectorPortal } from 'src/components/empresa-selector/empresa-selector-portal';

import { useAuthContext } from 'src/auth/hooks';

import { navData } from './config-navigation';

// ----------------------------------------------------------------------

export function ClienteLayout({ children }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const settings = useSettingsContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 280 }}>
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
        <NavSectionVertical
          data={navData}
          slotProps={{
            currentRole: user?.role || 'cliente',
          }}
          sx={{ px: 2 }}
        />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary' }}>
              Portal do Cliente
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={2}>
              <EmpresaSelectorPortal 
                userId={user?.id || user?._id || user?.userId} 
                compact
                onEmpresaChange={() => {
                  // Recarregar a página para atualizar os dados com a nova empresa
                  window.location.reload();
                }}
              />
              
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Bem-vindo, {user?.name}
              </Typography>
              
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar
                  src={user?.imgprofile}
                  sx={{ width: 32, height: 32 }}
                >
                  {!user?.imgprofile && (
                    <Iconify icon="solar:user-bold-duotone" width={20} />
                  )}
                </Avatar>
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem component={RouterLink} href={paths.cliente.profile}>
            <Avatar src={user?.imgprofile}>
              {!user?.imgprofile && (
                <Iconify icon="solar:user-bold-duotone" width={20} />
              )}
            </Avatar>
            Meu Perfil
          </MenuItem>
          <MenuItem component={RouterLink} href={paths.cliente.settings}>
            <Iconify icon="solar:settings-bold-duotone" width={20} />
            Configurações
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Iconify icon="solar:logout-3-bold-duotone" width={20} />
            Sair
          </MenuItem>
        </Menu>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: theme.palette.background.default,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}


