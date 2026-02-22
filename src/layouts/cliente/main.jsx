'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { toTitleCase } from 'src/utils/helper';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { PartnerBanners } from 'src/components/banner/partner-banners';
import { NavSectionVertical } from 'src/components/nav-section/vertical';
import { EmpresaSelectorPortal } from 'src/components/empresa-selector/empresa-selector-portal';

import { useAuthContext } from 'src/auth/hooks';

import { ClienteNavMobile } from './nav-mobile';
import { ClienteMenuButton } from './menu-button';
import { usePortalNavData } from './config-navigation';

// ----------------------------------------------------------------------

export function ClienteLayout({ children }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, logout, empresa } = useAuthContext();
  const settings = useSettingsContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const mobileNavOpen = useBoolean();

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

  // Fechar menu mobile quando a rota mudar
  useEffect(() => {
    if (mobileNavOpen.value) {
      mobileNavOpen.onFalse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Navigation Drawer */}
      <ClienteNavMobile
        data={usePortalNavData()}
        open={mobileNavOpen.value}
        onClose={mobileNavOpen.onFalse}
        user={user}
      />

      {/* Desktop Sidebar */}
      <Box 
        sx={{ 
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column', 
          width: 300,
          minWidth: 300,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
        <Scrollbar sx={{ flex: 1 }}>
          <NavSectionVertical
            data={usePortalNavData()}
            slotProps={{
              currentRole: user?.role || 'cliente',
            }}
            sx={{ px: 2 }}
          />
          
          {/* Banners de Parceiros - Logo após o menu */}
          <Box sx={{ px: 2, pt: 3, pb: 2 }}>
            <PartnerBanners compact />
          </Box>
        </Scrollbar>
      </Box>

      {/* Main Content Area */}
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
            {/* Mobile Menu Button */}
            <ClienteMenuButton
              onClick={mobileNavOpen.onTrue}
              sx={{ 
                display: { xs: 'block', lg: 'none' },
                color: `${theme.palette.primary.main}`,
                backgroundColor: `${theme.palette.primary.contrastText}`,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            />

            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                color: 'text.primary',
                display: { xs: 'none', sm: 'block' },
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Portal do Cliente
            </Typography>

            <Box sx={{ flexGrow: 1 }} />
            
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={{ xs: 0.5, sm: 1, md: 2 }}
              sx={{ flexShrink: 0 }}
            >
              {/* Select de Empresa - Responsivo */}
              <Box sx={{ 
                display: { xs: 'none', sm: 'block' },
                minWidth: { sm: 120, md: 160 }
              }}>
                <EmpresaSelectorPortal 
                  userId={user?.id || user?._id || user?.userId} 
                  compact
                  onEmpresaChange={() => {
                    // Recarregar a página para atualizar os dados com a nova empresa
                    window.location.reload();
                  }}
                />
              </Box>
              
              {/* Nome do usuário - Responsivo */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  display: { xs: 'none', lg: 'block' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  maxWidth: { xs: 100, sm: 150 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Bem-vindo, {toTitleCase(user?.name)}
              </Typography>
              
              {/* Avatar do usuário */}
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ 
                  ml: { xs: 0.5, sm: 1 },
                  p: { xs: 0.5, sm: 1 }
                }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar
                  src={user?.imgprofile}
                  sx={{ 
                    width: { xs: 28, sm: 32 }, 
                    height: { xs: 28, sm: 32 }
                  }}
                >
                  {!user?.imgprofile && (
                    <Iconify icon="solar:user-bold-duotone" width={{ xs: 16, sm: 20 }} />
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
              minWidth: { xs: 200, sm: 220 },
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
          {/* Informações do usuário no mobile */}
          <Box sx={{ 
            display: { xs: 'block', sm: 'none' },
            px: 2, 
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Bem-vindo
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              {toTitleCase(user?.name)}
            </Typography>
          </Box>
          
          <MenuItem component={RouterLink} href={paths.cliente.profile}>
            <Avatar src={user?.imgprofile}>
              {!user?.imgprofile && (
                <Iconify icon="solar:user-bold-duotone" width={20} />
              )}
            </Avatar>
            Meu Perfil
          </MenuItem>
          <MenuItem sx={{ gap: 1}} component={RouterLink} href={paths.cliente.settings} >
            <Iconify icon="solar:settings-bold-duotone" width={20}/>
            Configurações
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
            <Iconify icon="solar:logout-3-bold-duotone" width={20} />
            Sair
          </MenuItem>
        </Menu>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: theme.palette.background.default,
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}


