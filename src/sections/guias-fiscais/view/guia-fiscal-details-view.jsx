'use client';


import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { downloadGuiaFiscal, useGetGuiaFiscalById } from 'src/actions/guias-fiscais';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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
    // Guias Fiscais
    DAS: 'DAS',
    EXTRATO_PGDAS: 'Extrato PGDAS',
    DARF: 'DARF',
    ICMS: 'ICMS',
    ISS: 'ISS',
    PIS: 'PIS',
    COFINS: 'COFINS',
    // Guias DP
    INSS: 'INSS',
    FGTS: 'FGTS',
    // Documentos DP
    HOLERITE: 'Holerite',
    EXTRATO_FOLHA_PAGAMENTO: 'Extrato Folha',
  };
  return tipoMap[tipo] || tipo;
};

const getCategoriaLabel = (categoria) => {
  const categoriaMap = {
    GUIA_FISCAL: 'Guia Fiscal',
    GUIA_DP: 'Guia DP',
    DOCUMENTO_DP: 'Documento DP',
  };
  return categoriaMap[categoria] || categoria;
};

const getStatusPagamentoLabel = (statusPagamento) => {
  if (!statusPagamento) return null;
  const labelMap = {
    a_pagar: 'A Pagar',
    pago: 'Pago',
    vencido: 'Vencido',
  };
  return labelMap[statusPagamento] || statusPagamento;
};

// ----------------------------------------------------------------------

export function GuiaFiscalDetailsView({ id }) {
  const router = useRouter();

  const { data: guia, isLoading, error } = useGetGuiaFiscalById(id);

  const handleDownload = async () => {
    try {
      await downloadGuiaFiscal(id, guia?.nomeArquivo || 'guia-fiscal.pdf');
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
          <Stack spacing={2}>
            <Typography variant="h6" color="error">
              Erro ao carregar documento
            </Typography>
            {error && (
              <Typography variant="body2" color="text.secondary">
                {error?.message || 'Não foi possível carregar os detalhes do documento.'}
              </Typography>
            )}
            {!error && !guia && (
              <Typography variant="body2" color="text.secondary">
                Documento não encontrado.
              </Typography>
            )}
            <Button
              variant="outlined"
              component={RouterLink}
              href={paths.dashboard.guiasFiscais.list}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
            >
              Voltar para Lista
            </Button>
          </Stack>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Detalhes do Documento"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Guias e Documentos', href: paths.dashboard.guiasFiscais.list },
          { name: 'Detalhes' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:download-bold" />}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              variant="contained"
              component={RouterLink}
              href={paths.dashboard.guiasFiscais.edit(id)}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Editar
            </Button>
          </Stack>
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

                {guia.categoria && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Categoria:
                    </Typography>
                    <Label variant="soft" color="primary">
                      {getCategoriaLabel(guia.categoria)}
                    </Label>
                  </Stack>
                )}

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Tipo:
                  </Typography>
                  <Label variant="soft" color="info">
                    {getTipoGuiaLabel(guia.tipoGuia)}
                  </Label>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Status Processamento:
                  </Typography>
                  <Label variant="soft" color={getStatusColor(guia.statusProcessamento || guia.status)}>
                    {getStatusLabel(guia.statusProcessamento || guia.status)}
                  </Label>
                </Stack>

                {guia.statusPagamento && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Status Pagamento:
                    </Typography>
                    <Label variant="soft" color={guia.statusPagamento === 'pago' ? 'success' : guia.statusPagamento === 'vencido' ? 'error' : 'warning'}>
                      {getStatusPagamentoLabel(guia.statusPagamento)}
                    </Label>
                  </Stack>
                )}

                {guia.clienteNome && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Cliente:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {guia.clienteNome}
                    </Typography>
                  </Stack>
                )}

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    CNPJ:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {guia.cnpj || '-'}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Data de Vencimento:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {guia.dataVencimento ? fDate(guia.dataVencimento) : '-'}
                  </Typography>
                </Stack>
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
                        {typeof value === 'number' ? `R$ ${value.toFixed(2)}` : String(value)}
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

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Informações do Processamento
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Criado em:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {guia.createdAt ? fDate(guia.createdAt) : '-'}
                  </Typography>
                </Stack>

                {guia.processadoEm && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Processado em:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {fDate(guia.processadoEm)}
                    </Typography>
                  </Stack>
                )}

                {guia.processadoPor && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Processado por:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {guia.processadoPor.name || guia.processadoPor.email}
                    </Typography>
                  </Stack>
                )}

                {guia.observacoes && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Observações:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {guia.observacoes}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
