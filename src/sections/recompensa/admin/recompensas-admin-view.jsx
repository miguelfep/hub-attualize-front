'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useRecompensas } from 'src/hooks/use-recompensas';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

import { AprovarPixDialog } from './aprovar-pix-dialog';
import { RejeitarPixDialog } from './rejeitar-pix-dialog';
import { PixPendentesTable } from './pix-pendentes-table';
import { AprovarDescontoDialog } from './aprovar-desconto-dialog';
import { DescontosPendentesTable } from './descontos-pendentes-table';
import { AplicarDescontoManualDialog } from './aplicar-desconto-manual-dialog';

// ----------------------------------------------------------------------

export function RecompensasAdminView() {
  const theme = useTheme();
  const { 
    pixPendentes, 
    descontosPendentes,
    loadingPixPendentes,
    loadingDescontosPendentes,
    buscarPixPendentes,
    buscarDescontosPendentes,
    aprovar, 
    rejeitar,
    aprovarDesconto,
    aplicarDescontoManual,
  } = useRecompensas();

  const [selectedPix, setSelectedPix] = useState(null);
  const [selectedDesconto, setSelectedDesconto] = useState(null);
  const [openAprovarDialog, setOpenAprovarDialog] = useState(false);
  const [openRejeitarDialog, setOpenRejeitarDialog] = useState(false);
  const [openAprovarDescontoDialog, setOpenAprovarDescontoDialog] = useState(false);
  const [openRejeitarDescontoDialog, setOpenRejeitarDescontoDialog] = useState(false);
  const [openAplicarDescontoManualDialog, setOpenAplicarDescontoManualDialog] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setError(null);
        await Promise.all([
          buscarPixPendentes(),
          buscarDescontosPendentes(),
        ]);
      } catch (err) {
        if (mounted) {
          console.error('Erro ao carregar dados:', err);
          setError('Não foi possível carregar as solicitações. Tente novamente.');
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [buscarPixPendentes, buscarDescontosPendentes]);

  const handleRefresh = async () => {
    try {
      setError(null);
      await Promise.all([
        buscarPixPendentes(),
        buscarDescontosPendentes(),
      ]);
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      setError('Erro ao atualizar. Tente novamente.');
    }
  };

  // Calcular estatísticas
  const totalPixPendentes = pixPendentes?.length || 0;
  const valorTotalPixPendente = pixPendentes?.reduce((sum, pix) => sum + (pix.valor || 0), 0) || 0;
  const totalDescontosPendentes = descontosPendentes?.length || 0;
  const valorTotalDescontosPendente = descontosPendentes?.reduce((sum, desc) => sum + (desc.valor || 0), 0) || 0;

  const handleAprovarClick = (pix) => {
    setSelectedPix(pix);
    setOpenAprovarDialog(true);
  };

  const handleRejeitarClick = (pix) => {
    setSelectedPix(pix);
    setOpenRejeitarDialog(true);
  };

  const handleAprovarConfirm = async () => {
    try {
      setLoadingAction(true);
      await aprovar(selectedPix._id);
      setOpenAprovarDialog(false);
      setSelectedPix(null);
      // Recarregar lista após aprovar
      await buscarPixPendentes();
    } catch (_error) {
      console.error('Erro ao aprovar PIX:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejeitarConfirm = async (motivo) => {
    try {
      setLoadingAction(true);
      await rejeitar(selectedPix._id, motivo);
      setOpenRejeitarDialog(false);
      setSelectedPix(null);
      // Recarregar lista após rejeitar
      await buscarPixPendentes();
    } catch (_error) {
      console.error('Erro ao rejeitar PIX:', _error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAprovarDescontoClick = (desconto) => {
    setSelectedDesconto(desconto);
    setOpenAprovarDescontoDialog(true);
  };

  const handleRejeitarDescontoClick = (desconto) => {
    setSelectedDesconto(desconto);
    setOpenRejeitarDescontoDialog(true);
  };

  const handleAprovarDescontoConfirm = async (cobrancaId) => {
    try {
      setLoadingAction(true);
      await aprovarDesconto(selectedDesconto._id, cobrancaId);
      setOpenAprovarDescontoDialog(false);
      setSelectedDesconto(null);
      // Recarregar lista após aprovar
      await buscarDescontosPendentes();
    } catch (_error) {
      console.error('Erro ao aprovar desconto:', _error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejeitarDescontoConfirm = async (motivo) => {
    try {
      setLoadingAction(true);
      await rejeitar(selectedDesconto._id, motivo);
      setOpenRejeitarDescontoDialog(false);
      setSelectedDesconto(null);
      // Recarregar lista após rejeitar
      await buscarDescontosPendentes();
    } catch (_error) {
      console.error('Erro ao rejeitar desconto:', _error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAplicarDescontoManualConfirm = async (contratoId, valor, descricao) => {
    try {
      setLoadingAction(true);
      await aplicarDescontoManual(contratoId, valor, descricao);
      setOpenAplicarDescontoManualDialog(false);
    } catch (_error) {
      console.error('Erro ao aplicar desconto manual:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestão de Recompensas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as solicitações de PIX e descontos dos clientes
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAplicarDescontoManualDialog(true)}
            startIcon={<Iconify icon="solar:gift-bold-duotone" />}
          >
            Aplicar Desconto Manual
          </Button>
           */}
          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={loadingPixPendentes || loadingDescontosPendentes}
            startIcon={
              (loadingPixPendentes || loadingDescontosPendentes) ? (
                <CircularProgress size={16} />
              ) : (
                <Iconify icon="solar:refresh-bold-duotone" />
              )
            }
          >
            Atualizar
          </Button>
        </Stack>
      </Stack>

      {/* Alerta de erro */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}
        >
          {error}
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      <Grid container spacing={2}>
        <Grid xs={12} sm={6} md={4}>
          <Card
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.warning.main, 0.16),
                  }}
                >
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pendentes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {loadingPixPendentes ? (
                      <CircularProgress size={20} />
                    ) : (
                      totalPixPendentes
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.info.main, 0.16),
                  }}
                >
                  <Iconify icon="solar:dollar-bold-duotone" width={24} sx={{ color: 'info.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Valor Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {loadingPixPendentes ? (
                      <CircularProgress size={20} />
                    ) : (
                      fCurrency(valorTotalPixPendente)
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <Card
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.success.main, 0.16),
                  }}
                >
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} sx={{ color: 'success.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Valor Médio
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {loadingPixPendentes ? (
                      <CircularProgress size={20} />
                    ) : totalPixPendentes > 0 ? (
                      fCurrency(valorTotalPixPendente / totalPixPendentes)
                    ) : (
                      fCurrency(0)
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de PIX Pendentes */}
      <Card>
        <Stack sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Solicitações de PIX Pendentes
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Analise e aprove ou rejeite as solicitações de pagamento via PIX
              </Typography>
            </Box>
            {totalPixPendentes > 0 && (
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.16),
                  color: 'warning.darker',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {totalPixPendentes} {totalPixPendentes === 1 ? 'solicitação' : 'solicitações'}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>

        <PixPendentesTable
          pixPendentes={pixPendentes || []}
          loading={loadingPixPendentes}
          onAprovar={handleAprovarClick}
          onRejeitar={handleRejeitarClick}
        />
      </Card>

      <AprovarPixDialog
        open={openAprovarDialog}
        onClose={() => {
          setOpenAprovarDialog(false);
          setSelectedPix(null);
        }}
        pix={selectedPix}
        onConfirm={handleAprovarConfirm}
        loading={loadingAction}
      />

      <RejeitarPixDialog
        open={openRejeitarDialog}
        onClose={() => {
          setOpenRejeitarDialog(false);
          setSelectedPix(null);
        }}
        pix={selectedPix}
        onConfirm={handleRejeitarConfirm}
        loading={loadingAction}
      />

      {/* Seção de Descontos Pendentes */}
      <Card>
        <Stack sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <Iconify icon="solar:gift-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Solicitações de Desconto Pendentes
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Analise e aprove ou rejeite as solicitações de desconto em contratos
              </Typography>
            </Box>
            {totalDescontosPendentes > 0 && (
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.16),
                  color: 'warning.darker',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {totalDescontosPendentes} {totalDescontosPendentes === 1 ? 'solicitação' : 'solicitações'}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>

        <DescontosPendentesTable
          descontosPendentes={descontosPendentes || []}
          loading={loadingDescontosPendentes}
          onAprovar={handleAprovarDescontoClick}
          onRejeitar={handleRejeitarDescontoClick}
        />
      </Card>

      <AprovarDescontoDialog
        open={openAprovarDescontoDialog}
        onClose={() => {
          setOpenAprovarDescontoDialog(false);
          setSelectedDesconto(null);
        }}
        desconto={selectedDesconto}
        onConfirm={handleAprovarDescontoConfirm}
        loading={loadingAction}
      />

      <RejeitarPixDialog
        open={openRejeitarDescontoDialog}
        onClose={() => {
          setOpenRejeitarDescontoDialog(false);
          setSelectedDesconto(null);
        }}
        pix={selectedDesconto}
        onConfirm={handleRejeitarDescontoConfirm}
        loading={loadingAction}
      />

      <AplicarDescontoManualDialog
        open={openAplicarDescontoManualDialog}
        onClose={() => setOpenAplicarDescontoManualDialog(false)}
        onConfirm={handleAplicarDescontoManualConfirm}
        loading={loadingAction}
      />
    </Stack>
  );
}
