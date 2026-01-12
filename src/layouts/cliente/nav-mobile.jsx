import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';
import { EmpresaSelectorPortal } from 'src/components/empresa-selector/empresa-selector-portal';

import { getAulasOnboarding } from 'src/actions/onboarding';

// ----------------------------------------------------------------------

export function ClienteNavMobile({ data, open, onClose, user, slots, sx, ...other }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          overflow: 'unset',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          width: 280,
          ...sx,
        },
      }}
    >
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      {/* Select de Empresa no Mobile - Sempre visível, mesmo durante onboarding */}
      {user && (
        <Box sx={{ px: 2, pb: 2 }}>
          <EmpresaSelectorPortal 
            userId={user?.id || user?._id || user?.userId} 
            onEmpresaChange={async () => {
              // Verifica onboarding da nova empresa após trocar
              try {
                const response = await getAulasOnboarding();
                if (response?.data?.success) {
                  const data = response.data.data;
                  // Se houver onboarding pendente na nova empresa, redireciona
                  if (data?.temOnboarding && !data?.concluido) {
                    window.location.href = paths.cliente.onboarding;
                  } else {
                    window.location.reload();
                  }
                } else {
                  window.location.reload();
                }
              } catch (error) {
                console.error('Erro ao verificar onboarding após trocar empresa:', error);
                window.location.reload();
              }
            }}
          />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical 
          data={data} 
          slotProps={{
            currentRole: user?.role || 'cliente',
          }}
          sx={{ px: 2, flex: '1 1 auto' }} 
          {...other} 
        />
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}
