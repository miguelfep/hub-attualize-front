import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';

import { HeaderSection } from './header-section';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import { AccountDrawer } from '../components/account-drawer';
import { WorkspacesPopover } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

// ----------------------------------------------------------------------

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,

  slotsDisplay: {
    signIn = true,
    account = true,
    helpLink = true,
    settings = true,
    purchase = true,
    contacts = true,
    searchbar = true,
    workspaces = true,
    menuButton = true,
    localization = true,
    notifications = true,
  } = {},

  ...other
}) {
   const theme = useTheme();

  // // UseEffect para adicionar o script do Digisac Web Chat
  // useEffect(() => {
  //   // Configura o objeto global _digisac
  //   window._digisac = { id: 'c0517922-0328-4ccf-8027-fa9f7b78f6e2' };

  //   // Adiciona estilos CSS para posicionar o widget à esquerda
  //   const style = document.createElement('style');
  //   style.id = 'digisac-custom-styles';
  //   style.textContent = `
  //     /* Posiciona o widget do Digisac à esquerda */
  //     #digisac-widget,
  //     [id*="digisac"],
  //     iframe[src*="digisac"],
  //     .digisac-widget,
  //     .digisac-chat-widget,
  //     [class*="digisac"] {
  //       left: 20px !important;
  //       right: auto !important;
  //     }
      
  //     /* Ajusta o botão do widget se houver */
  //     #digisac-widget-button,
  //     [id*="digisac-button"],
  //     .digisac-button,
  //     [class*="digisac-button"] {
  //       left: 20px !important;
  //       right: auto !important;
  //     }
  //   `;
  //   document.head.appendChild(style);

  //   // Cria e adiciona o script externo ao DOM
  //   const script = document.createElement('script');
  //   script.src = 'https://webchat.digisac.app/embedded.js';
  //   script.async = true;
    
  //   // Aplica estilos após o script carregar
  //   script.onload = () => {
  //     // Aguarda um pouco para o widget renderizar
  //     setTimeout(() => {
  //       const widgets = document.querySelectorAll('[id*="digisac"], [class*="digisac"], iframe[src*="digisac"]');
  //       widgets.forEach((widget) => {
  //         if (widget instanceof HTMLElement) {
  //           widget.style.left = '20px';
  //           widget.style.right = 'auto';
  //         }
  //       });
  //     }, 1000);
  //   };
    
  //   document.head.appendChild(script);

  //   // Remove o script e estilo ao desmontar o componente (limpeza)
  //   return () => {
  //     if (document.head.contains(script)) {
  //       document.head.removeChild(script);
  //     }
  //     if (document.head.contains(style)) {
  //       document.head.removeChild(style);
  //     }
  //   };
  // }, []);

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        leftAreaStart: slots?.leftAreaStart,
        leftArea: (
          <>
            {slots?.leftAreaStart}

            {/* -- Menu button -- */}
            {menuButton && (
              <MenuButton
                data-slot="menu-button"
                onClick={onOpenNav}
                sx={{
                  mr: 1,
                  ml: -1,
                  [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                }}
              />
            )}

            {/* -- Logo -- */}
            <Logo data-slot="logo" />

            {/* -- Divider -- */}
            <StyledDivider data-slot="divider" />

            {/* -- Workspace popover -- */}
            {workspaces && <WorkspacesPopover data-slot="workspaces" data={data?.workspaces} />}

            {slots?.leftAreaEnd}
          </>
        ),
        rightArea: (
          <>
            {slots?.rightAreaStart}

            <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              {/* -- Help link -- */}
              {helpLink && (
                <Link
                  data-slot="help-link"
                  href={paths.faqs}
                  component={RouterLink}
                  color="inherit"
                  sx={{ typography: 'subtitle2' }}
                >
                  Precisa de ajuda?
                </Link>
              )}

              {/* -- Searchbar -- */}
              {searchbar && <Searchbar data-slot="searchbar" data={data?.nav} />}

              {/* -- Account drawer -- */}
              {account && <AccountDrawer data-slot="account" data={data?.account} />}

              {/* -- Sign in button -- */}
              {signIn && <SignInButton />}
            </Box>

            {slots?.rightAreaEnd}
          </>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}
