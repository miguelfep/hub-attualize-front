'use client';

import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  Alert,
  Select,
  Button,
  Drawer,
  Divider,
  Skeleton,
  MenuItem,
  IconButton,
  Typography,
  FormControl,
  CardContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetDiagnostico,
  calcularDiagnostico,
  alterarStatusDiagnostico,
  atualizarEntradasDiagnostico,
} from 'src/actions/reforma-tributaria-diagnostico';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { DiagnosticoResultado } from '../components/diagnostico-resultado';
import { DiagnosticoDadosCard } from '../components/diagnostico-dados-card';
import { DiagnosticoEntradasForm } from '../components/diagnostico-entradas-form';
import {
  getStatusOption,
  getClienteDisplay,
  formatCompetencia,
  DIAGNOSTICO_STATUS_OPTIONS,
} from '../utils';

// ----------------------------------------------------------------------

const ROLES_ALTERAR_STATUS = ['admin', 'operacional', 'gerencial'];

const apiErrMsg = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const slugify = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function DiagnosticoDetailView({ id }) {
  const { user } = useAuthContext();
  const podeAlterarStatus = ROLES_ALTERAR_STATUS.includes(user?.role);

  const { diagnostico, diagnosticoLoading, diagnosticoError, refetchDiagnostico } = useGetDiagnostico(id);

  const [openEditar, setOpenEditar] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);

  const handleSalvarEntradas = async (payload) => {
    try {
      await atualizarEntradasDiagnostico(id, payload);
      toast.success('Dados salvos — recalcule para atualizar o resultado');
      setOpenEditar(false);
      refetchDiagnostico();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Erro ao salvar dados'));
    }
  };

  const handleCalcular = async () => {
    try {
      setCalculando(true);
      await calcularDiagnostico(id);
      toast.success('Diagnóstico calculado');
      refetchDiagnostico();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Erro ao calcular diagnóstico'));
    } finally {
      setCalculando(false);
    }
  };

  const handleAlterarStatus = async (event) => {
    const novoStatus = event.target.value;
    try {
      setAlterandoStatus(true);
      await alterarStatusDiagnostico(id, novoStatus);
      toast.success('Status atualizado');
      refetchDiagnostico();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Erro ao alterar status'));
    } finally {
      setAlterandoStatus(false);
    }
  };

  const handleExportarPdf = async () => {
    try {
      setExportandoPdf(true);
      // Imports dinâmicos: @react-pdf/renderer é pesado e só é necessário aqui.
      const [{ pdf }, { DiagnosticoPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../components/diagnostico-pdf'),
      ]);
      const blob = await pdf(<DiagnosticoPDF diagnostico={diagnostico} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostico-reforma-${slugify(getClienteDisplay(diagnostico))}-${
        diagnostico?.competenciaBase || ''
      }.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF do diagnóstico:', error);
      toast.error(`Erro ao gerar o PDF${error?.message ? `: ${error.message}` : ''}`);
    } finally {
      setExportandoPdf(false);
    }
  };

  if (diagnosticoError) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ mt: 3 }}>
          {apiErrMsg(diagnosticoError, 'Erro ao carregar o diagnóstico')}
        </Alert>
      </DashboardContent>
    );
  }

  if (diagnosticoLoading || !diagnostico) {
    return (
      <DashboardContent>
        <Skeleton variant="text" width={320} height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={180} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={420} />
      </DashboardContent>
    );
  }

  const statusOption = getStatusOption(diagnostico.status);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={getClienteDisplay(diagnostico)}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Reforma Tributária', href: paths.dashboard.fiscal.reformaTributaria.root },
          { name: formatCompetencia(diagnostico.competenciaBase) },
        ]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            {podeAlterarStatus ? (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={diagnostico.status || 'rascunho'}
                  onChange={handleAlterarStatus}
                  disabled={alterandoStatus}
                >
                  {DIAGNOSTICO_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Label color={statusOption.color} variant="soft">
                {statusOption.label}
              </Label>
            )}

            {diagnostico.resultado && (
              <LoadingButton
                variant="outlined"
                loading={exportandoPdf}
                startIcon={<Iconify icon="solar:file-download-bold" />}
                onClick={handleExportarPdf}
              >
                Exportar PDF
              </LoadingButton>
            )}

            <LoadingButton
              variant="contained"
              loading={calculando}
              startIcon={<Iconify icon="solar:calculator-bold" />}
              onClick={handleCalcular}
            >
              {diagnostico.resultado ? 'Recalcular' : 'Calcular'}
            </LoadingButton>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DiagnosticoDadosCard diagnostico={diagnostico} onEditar={() => setOpenEditar(true)} />

        {diagnostico.resultado ? (
          <DiagnosticoResultado resultado={diagnostico.resultado} />
        ) : (
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
                <Iconify
                  icon="solar:calculator-minimalistic-bold-duotone"
                  width={56}
                  sx={{ color: 'text.disabled' }}
                />
                <Typography variant="h6">Diagnóstico ainda não calculado</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', maxWidth: 460 }}
                >
                  Confira os dados e premissas acima e clique em “Calcular” para gerar o comparativo
                  entre Simples tradicional e o modelo híbrido com IBS/CBS por fora.
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    onClick={() => setOpenEditar(true)}
                  >
                    Editar dados
                  </Button>
                  <LoadingButton
                    variant="contained"
                    loading={calculando}
                    startIcon={<Iconify icon="solar:calculator-bold" />}
                    onClick={handleCalcular}
                  >
                    Calcular agora
                  </LoadingButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Drawer
        anchor="right"
        open={openEditar}
        onClose={() => setOpenEditar(false)}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: { xs: 1, sm: 480 } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 2 }}>
          <Box>
            <Typography variant="h6">Editar dados e premissas</Typography>
            <Typography variant="caption" color="text.secondary">
              {getClienteDisplay(diagnostico)} · {formatCompetencia(diagnostico.competenciaBase)}
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenEditar(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>
          <DiagnosticoEntradasForm diagnostico={diagnostico} showPremissas onSave={handleSalvarEntradas} />
        </Box>
      </Drawer>
    </DashboardContent>
  );
}
