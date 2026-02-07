'use client';


import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { downloadGuiaFiscalPortal, useGetGuiaFiscalPortalById } from 'src/actions/guias-fiscais';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { isGuia, getCompetencia, formatCompetencia } from '../utils';

// ----------------------------------------------------------------------

const getStatusColor = (status) => {
  const statusMap = {
    pendente: 'warning',
    processado: 'success',
    erro: 'error',
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status) => {
  const labelMap = {
    pendente: 'Pendente',
    processado: 'Processado',
    erro: 'Erro',
  };
  return labelMap[status] || status;
};

const getTipoGuiaLabel = (tipo) => {
  const tipoMap = {
    DAS: 'DAS',
    EXTRATO_PGDAS: 'Extrato PGDAS',
    INSS: 'INSS',
    HOLERITE: 'Holerite',
    DARF: 'DARF',
    ICMS: 'ICMS',
    ISS: 'ISS',
    FGTS: 'FGTS',
    PIS: 'PIS',
    COFINS: 'COFINS',
  };
  return tipoMap[tipo] || tipo;
};

// ----------------------------------------------------------------------

export function GuiaFiscalPortalDetailsView({ id }) {
  const { data: guia, isLoading, error } = useGetGuiaFiscalPortalById(id);

  const handleDownload = async () => {
    try {
      await downloadGuiaFiscalPortal(id, guia?.nomeArquivo || 'guia-fiscal.pdf');
    } catch (downloadError) {
      console.error('Erro ao fazer download:', downloadError);
    }
  };

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error || !guia) {
    return (
      <DashboardContent>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            Erro ao carregar guia fiscal
          </Typography>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Detalhes da Guia Fiscal"
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Guias Fiscais', href: paths.cliente.guiasFiscais.list },
          { name: 'Detalhes' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:download-bold" />}
            onClick={handleDownload}
          >
            Download
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Informações Básicas
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Nome do Arquivo:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {guia.nomeArquivo || '-'}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Tipo de Guia:
                  </Typography>
                  <Label variant="soft" color="info">
                    {getTipoGuiaLabel(guia.tipoGuia)}
                  </Label>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Label variant="soft" color={getStatusColor(guia.status)}>
                    {getStatusLabel(guia.status)}
                  </Label>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    CNPJ:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {guia.cnpj || '-'}
                  </Typography>
                </Stack>

                {getCompetencia(guia) && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Competência:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCompetencia(getCompetencia(guia))}
                    </Typography>
                  </Stack>
                )}

                {/* Vencimento - apenas para guias (não para documentos) */}
                {isGuia(guia.categoria) && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Data de Vencimento:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {guia.dataVencimento ? fDate(guia.dataVencimento) : '-'}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            {guia.dadosExtraidos && Object.keys(guia.dadosExtraidos).length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Dados Extraídos
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {Object.entries(guia.dadosExtraidos).map(([key, value]) => (
                    <Stack key={key} direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {typeof value === 'number' ? fCurrency(value) : String(value)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}

            {guia.erros && guia.erros.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }} color="error">
                  Erros
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                  {guia.erros.map((erro, index) => (
                    <Typography key={index} variant="body2" color="error">
                      • {erro}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
