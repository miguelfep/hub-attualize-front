import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';

import { EmpresaSelectorPortal } from 'src/components/empresa-selector/empresa-selector-portal';

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

      {/* Select de Empresa no Mobile */}
      {user && (
        <Box sx={{ px: 2, pb: 2 }}>
          <EmpresaSelectorPortal 
            userId={user?.id || user?._id || user?.userId} 
            onEmpresaChange={() => {
              // Recarregar a página para atualizar os dados com a nova empresa
              window.location.reload();
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
