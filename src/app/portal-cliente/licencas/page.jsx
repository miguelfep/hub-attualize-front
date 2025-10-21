'use client';

import { toast } from 'sonner';
import { useMemo, useState, useCallback } from 'react';
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { useLicencas } from 'src/hooks/use-licenca';

import { downloadLicenca } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';
import { LicencaRowSkeleton } from 'src/components/skeleton/LicencaRowSkeleton';

import { LicencaRow } from 'src/sections/societario/licenca/LicencaRow';
import { LicencaAlertBanner } from 'src/sections/societario/licenca/LicencaAlertBanner';

import { useAuthContext } from 'src/auth/hooks';

export default function PortalClienteLicencasView() {
  const { user } = useAuthContext();
  const theme = useTheme();

  const { licencas, loading, pagination, filtroStatus, handleFiltroChange, handlePageChange } =
    useLicencas(user);

  const [isAlertOpen, setIsAlertOpen] = useState(true);

  const pendingLicencas = useMemo(() => {
    if (loading || licencas.length === 0) {
      return { vencidas: 0, aExpirar: 0 };
    }
    const vencidas = licencas.filter((l) => l.status === 'vencida').length;
    const aExpirar = licencas.filter((l) => l.status === 'a_expirar').length;
    return { vencidas, aExpirar };
  }, [licencas, loading]);

  const handleDownload = useCallback(async (licencaId, nome) => {
    try {
      const response = await downloadLicenca(licencaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${nome}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Licença baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar a licença:', error);
      toast.error('Erro ao baixar a licença');
    }
  }, []);

  const handleCloseAlert = useCallback(() => {
    setIsAlertOpen(false);
  }, []);

  const memoizedContent = useMemo(() => {
    if (loading) {
      return (
        <Stack spacing={2}>
          {[...Array(5)].map((_, index) => (
            <LicencaRowSkeleton key={index} />
          ))}
        </Stack>
      );
    }
    if (licencas.length === 0) {
      return (
        <Stack alignItems="center" spacing={2} sx={{ py: 10, textAlign: 'center' }}>
          <Iconify
            icon="solar:file-remove-bold-duotone"
            width={64}
            sx={{ color: 'text.disabled' }}
          />
          <Typography variant="h6">Nenhuma licença encontrada</Typography>
          <Typography variant="body2" color="text.secondary">
            Tente ajustar o filtro ou verifique novamente mais tarde.
          </Typography>
        </Stack>
      );
    }
    return (
      <Stack spacing={2}>
        {licencas.map((licenca, index) => (
          <m.div
            key={licenca._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <LicencaRow licenca={licenca} onDownload={handleDownload} />
          </m.div>
        ))}
      </Stack>
    );
  }, [loading, licencas, handleDownload]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isAlertOpen &&
          !loading &&
          (pendingLicencas.vencidas > 0 || pendingLicencas.aExpirar > 0) && (
            <LicencaAlertBanner
              vencidasCount={pendingLicencas.vencidas}
              aExpirarCount={pendingLicencas.aExpirar}
              onClose={handleCloseAlert}
            />
          )}
      </AnimatePresence>

      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 4,
              bgcolor: 'background.neutral',
              borderRadius: '16px 16px 0 0',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Minhas Licenças
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Visualize e gerencie suas licenças em um só lugar.
              </Typography>
            </Box>
            <TextField
              select
              size="small"
              value={filtroStatus}
              onChange={handleFiltroChange}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="TODOS">Todos os status</MenuItem>
              <MenuItem value="valida">Válida</MenuItem>
              <MenuItem value="vencida">Vencida</MenuItem>
              <MenuItem value="dispensada">Dispensada</MenuItem>
              <MenuItem value="a_expirar">A Expirar</MenuItem>
              <MenuItem value="em_processo">Em Processo</MenuItem>
            </TextField>
          </Box>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>{memoizedContent}</CardContent>
          {pagination.pages > 1 && !loading && (
            <>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Stack alignItems="center" sx={{ p: 2 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Stack>
            </>
          )}
        </Card>
      </m.div>
    </LazyMotion>
  );
}
