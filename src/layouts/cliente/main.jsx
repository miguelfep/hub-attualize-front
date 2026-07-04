'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { toTitleCase } from 'src/utils/helper';
import axios, { endpoints } from 'src/utils/axios';

import { confirmarPagamentoDasPortal } from 'src/actions/cliente-portal-guias-api';

import { Logo } from 'src/components/logo';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { PartnerBanners } from 'src/components/banner/partner-banners';
import { NavSectionVertical } from 'src/components/nav-section/vertical';
import { ImpersonationBanner } from 'src/components/impersonation/impersonation-banner';
import { EmpresaSelectorPortal } from 'src/components/empresa-selector/empresa-selector-portal';

import { useAuthContext } from 'src/auth/hooks';

import { ClienteNavMobile } from './nav-mobile';
import { ClienteMenuButton } from './menu-button';
import { usePortalNavData } from './config-navigation';

// Links internos (começam com "/") usam RouterLink (SPA); links externos
// ("http(s)://...") usam <a target="_blank"> para não quebrar o next/link.
const isExternalLink = (link) => /^(https?:)?\/\//i.test(link || '');

// ----------------------------------------------------------------------

export function ClienteLayout({ children }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, logout, empresa } = useAuthContext();
  const settings = useSettingsContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const mobileNavOpen = useBoolean();
  const [banners, setBanners] = useState([]);
  const [confirmPagamentoOpen, setConfirmPagamentoOpen] = useState(false);
  const [confirmPagamentoLoading, setConfirmPagamentoLoading] = useState(false);

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

  const fetchBanners = useCallback(async () => {
    try {
      const res = await axios.get(endpoints.banners.publicos);
      setBanners(res?.data?.data || []);
    } catch (e) {
      console.error('Erro ao carregar banners:', e);
    }
  }, []);

  const handleConfirmarPagamentoDas = async () => {
    try {
      setConfirmPagamentoLoading(true);
      await confirmarPagamentoDasPortal();
      toast.success('Guia DAS marcada como paga.');
      setConfirmPagamentoOpen(false);
      await fetchBanners();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || 'Não foi possível confirmar o pagamento.'
      );
    } finally {
      setConfirmPagamentoLoading(false);
    }
  };

  // Fechar menu mobile quando a rota mudar
  useEffect(() => {
    if (mobileNavOpen.value) {
      mobileNavOpen.onFalse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Buscar banners ativos do portal
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

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
        <ImpersonationBanner />

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
                  bgcolor: 'action.hover',
                },
              }}
            />

            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                color: 'text.primary',
                display: { xs: 'none', sm: 'block' },
                fontSize: { xs: '1rem', sm: '1.25rem' },
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
              <Box
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  minWidth: { sm: 120, md: 160 },
                }}
              >
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
                  whiteSpace: 'nowrap',
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
                  p: { xs: 0.5, sm: 1 },
                }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar
                  src={user?.imgprofile}
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
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
          <Box
            sx={{
              display: { xs: 'block', sm: 'none' },
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Bem-vindo
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
              {toTitleCase(user?.name)}
            </Typography>
          </Box>

          <MenuItem component={RouterLink} href={paths.cliente.profile}>
            <Avatar src={user?.imgprofile}>
              {!user?.imgprofile && <Iconify icon="solar:user-bold-duotone" width={20} />}
            </Avatar>
            Meu Perfil
          </MenuItem>
          <MenuItem sx={{ gap: 1 }} component={RouterLink} href={paths.cliente.settings}>
            <Iconify icon="solar:settings-bold-duotone" width={20} />
            Configurações
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
            <Iconify icon="solar:logout-3-bold-duotone" width={20} />
            Sair
          </MenuItem>
        </Menu>

        {/* Banners dinâmicos do portal */}
        {banners.map((banner) => (
          <Box
            key={banner._id}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: banner.corFundo,
              color: banner.corTexto,
            }}
          >
            <Container
              maxWidth={false}
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1.25,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.25}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {banner.titulo}
                  {banner.descricao ? ` — ${banner.descricao}` : ''}
                </Typography>
                {(banner.textoBotao || banner.automatico) && (
                  <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap" useFlexGap>
                    {banner.textoBotao && (
                      <Button
                        component={isExternalLink(banner.linkBotao) ? 'a' : RouterLink}
                        href={banner.linkBotao || '#'}
                        target={isExternalLink(banner.linkBotao) ? '_blank' : undefined}
                        rel={isExternalLink(banner.linkBotao) ? 'noopener noreferrer' : undefined}
                        variant="contained"
                        color="inherit"
                        size="small"
                        startIcon={
                          <Iconify icon={banner.iconeBotao || 'solar:bell-bold-duotone'} />
                        }
                        sx={{
                          color: banner.corBotaoTexto,
                          bgcolor: banner.corBotaoFundo,
                          fontWeight: 700,
                          flexShrink: 0,
                          '&:hover': {
                            bgcolor: alpha(banner.corBotaoFundo, 0.85),
                          },
                        }}
                      >
                        {banner.textoBotao}
                      </Button>
                    )}
                    {banner.automatico && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        startIcon={<Iconify icon="solar:check-circle-bold-duotone" />}
                        onClick={() => setConfirmPagamentoOpen(true)}
                        sx={{
                          color: banner.corTexto,
                          borderColor: alpha(banner.corTexto || '#fff', 0.7),
                          fontWeight: 700,
                          flexShrink: 0,
                          '&:hover': {
                            borderColor: banner.corTexto,
                            bgcolor: alpha(banner.corTexto || '#fff', 0.12),
                          },
                        }}
                      >
                        Já paguei a guia
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </Container>
          </Box>
        ))}

        <ConfirmDialog
          open={confirmPagamentoOpen}
          onClose={() => {
            if (!confirmPagamentoLoading) setConfirmPagamentoOpen(false);
          }}
          title="Confirmar pagamento"
          content="Você confirma que já pagou esta Guia DAS? Ela será marcada como paga no sistema e este aviso será removido."
          action={
            <LoadingButton
              variant="contained"
              color="primary"
              loading={confirmPagamentoLoading}
              onClick={handleConfirmarPagamentoDas}
            >
              Sim, já paguei
            </LoadingButton>
          }
        />

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
