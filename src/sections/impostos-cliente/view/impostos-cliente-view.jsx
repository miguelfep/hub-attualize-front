'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Box,
  Tabs,
  Tab,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useDas, useApuracoes, baixarDasPdf } from 'src/actions/apuracao';
import { formatarPeriodo } from 'src/utils/apuracao-helpers';
import { fCurrency } from 'src/utils/format-number';
import { CopyToClipboard } from 'react-copy-to-clipboard';

// ----------------------------------------------------------------------

export function ImpostosClienteView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva, empresaAtivaData } = useEmpresa(userId);
  const { apurarHub, habilitarFatorR } = useSettings();
  
  const [currentTab, setCurrentTab] = useState('todos');
  const [expandedDas, setExpandedDas] = useState({});

  // Buscar DAS e Apurações
  const { data: dasData, isLoading: loadingDas } = useDas(empresaAtiva);
  const { data: apuracoesData, isLoading: loadingApuracoes } = useApuracoes(empresaAtiva, {});
  
  const isLoading = loadingDas || loadingApuracoes;
  
  const apuracoes = apuracoesData?.apuracoes || apuracoesData?.data || [];
  const das = dasData?.das || [];

  // Combinar apurações com seus DAS correspondentes
  const apuracoesComDas = useMemo(() => {
    if (!apuracoes || apuracoes.length === 0) return [];
    return apuracoes
      .filter((a) => a && a.periodoApuracao && typeof a.periodoApuracao === 'string') // Filtrar apurações inválidas
      .map((apuracao) => {
        const dasRelacionado = das?.find((d) => d && d.periodoApuracao === apuracao.periodoApuracao);
        return {
          ...apuracao,
          das: dasRelacionado,
        };
      });
  }, [apuracoes, das]);

  // Compatibilidade: verificar tanto no hook quanto em empresaAtivaData
  const podeVerImpostos = apurarHub || empresaAtivaData?.apurarHub || empresaAtivaData?.settings?.apuracao?.apurarHub;
  const podeVerFatorR = habilitarFatorR || empresaAtivaData?.habilitarFatorR || empresaAtivaData?.settings?.apuracao?.habilitarFatorR;

  const handleDownloadDas = useCallback(async (das) => {
    try {
      toast.info('Gerando PDF...');
      const response = await baixarDasPdf(das._id);

      // Criar blob e fazer download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DAS_${das.numeroDocumento || 'documento'}_${das.periodoApuracao || 'periodo'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao baixar PDF do DAS');
    }
  }, []);

  // Formatar data de vencimento AAAAMMDD -> DD/MM/AAAA
  const formatarDataVencimento = (data) => {
    if (!data || typeof data !== 'string' || data.length !== 8) return data || '-';
    try {
      const ano = data.substring(0, 4);
      const mes = data.substring(4, 6);
      const dia = data.substring(6, 8);
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error, data);
      return data || '-';
    }
  };

  // Verificar se está vencido
  const isVencido = (das) => {
    if (!das?.dataVencimento || das.status !== 'gerado') return false;
    if (typeof das.dataVencimento !== 'string' || das.dataVencimento.length !== 8) return false;
    try {
      const hoje = new Date();
      const vencimento = new Date(
        parseInt(das.dataVencimento.substring(0, 4), 10),
        parseInt(das.dataVencimento.substring(4, 6), 10) - 1,
        parseInt(das.dataVencimento.substring(6, 8), 10)
      );
      return vencimento < hoje;
    } catch (error) {
      console.error('Erro ao verificar vencimento:', error);
      return false;
    }
  };

  // Obter status simplificado para o cliente
  const getStatusSimplificado = (apuracao) => {
    if (apuracao.das?.status === 'pago') return { label: 'Pago', color: 'success', icon: 'solar:check-circle-bold-duotone' };
    if (apuracao.das?.status === 'gerado') return { label: 'Aguardando Pagamento', color: 'warning', icon: 'solar:clock-circle-bold-duotone' };
    if (apuracao.dasGerado) return { label: 'DAS Gerado', color: 'info', icon: 'solar:document-text-bold-duotone' };
    if (apuracao.status === 'calculada') return { label: 'Calculada', color: 'default', icon: 'solar:calculator-bold-duotone' };
    return { label: 'Em Processamento', color: 'default', icon: 'solar:hourglass-line-bold-duotone' };
  };

  // Filtrar apurações por tab
  const filtrarPorTab = (apuracao) => {
    if (!apuracao || !apuracao.periodoApuracao) return false;
    if (currentTab === 'pendentes') {
      return apuracao.das?.status === 'gerado' || (!apuracao.das && apuracao.dasGerado);
    }
    if (currentTab === 'pagos') {
      return apuracao.das?.status === 'pago';
    }
    return true; // todos
  };

  const apuracoesFiltradas = useMemo(() => {
    return apuracoesComDas
      .filter(filtrarPorTab)
      .filter((a) => a && a.periodoApuracao && typeof a.periodoApuracao === 'string') // Garantir que tem período válido
      .sort((a, b) => {
        // Ordenar por período (mais recente primeiro)
        const periodoA = String(a?.periodoApuracao || '');
        const periodoB = String(b?.periodoApuracao || '');
        if (!periodoA || !periodoB || periodoA.length !== 6 || periodoB.length !== 6) return 0;
        const numA = parseInt(periodoA, 10);
        const numB = parseInt(periodoB, 10);
        return isNaN(numA) || isNaN(numB) ? 0 : numB - numA;
      });
  }, [apuracoesComDas, currentTab]);

  const tabs = [
    {
      value: 'todos',
      label: 'Todos',
      count: apuracoes.length,
    },
    {
      value: 'pendentes',
      label: 'Pendentes',
      count: apuracoesComDas.filter((a) => a.das?.status === 'gerado' || (!a.das && a.dasGerado)).length,
    },
    {
      value: 'pagos',
      label: 'Pagos',
      count: apuracoesComDas.filter((a) => a.das?.status === 'pago').length,
    },
  ];

  const totalPendente = useMemo(() => {
    return apuracoesComDas
      .filter((a) => a.das?.status === 'gerado')
      .reduce((sum, a) => sum + (a.das?.valores?.total || a.totalImpostos || 0), 0);
  }, [apuracoesComDas]);

  if (!empresaAtiva) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">
          <AlertTitle>Empresa não selecionada</AlertTitle>
          Selecione uma empresa para visualizar seus impostos.
        </Alert>
      </Container>
    );
  }

  if (!podeVerImpostos) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="info">
          <AlertTitle>Apuração de Impostos não habilitada</AlertTitle>
          A funcionalidade de apuração de impostos não está habilitada para esta empresa. 
          Entre em contato com nosso time de contadores para habilitar.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <CustomBreadcrumbs
        heading="Meus Impostos - DAS Simples Nacional"
        links={[{ name: 'Portal', href: paths.cliente.root }, { name: 'Impostos' }]}
        action={
          podeVerFatorR && (
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:chart-bold-duotone" />}
              onClick={() => router.push(paths.cliente.impostos.fatorR)}
            >
              Ver Fator R
            </Button>
          )
        }
        sx={{ mb: 3 }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Informações */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>DAS - Documento de Arrecadação do Simples Nacional</AlertTitle>
          Esta página mostra exclusivamente os <strong>DAS (Documento de Arrecadação do Simples Nacional)</strong>. 
          Aqui você encontra todas as suas apurações de impostos do Simples Nacional calculadas mensalmente por nossa equipe. 
          Dependendo do tipo da sua empresa, podem existir outros tipos de impostos que não aparecem aqui.
        </Alert>

        {/* Cards de Resumo */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon="solar:document-text-bold-duotone" width={32} />
                </Box>
                <Box>
                  <Typography variant="h3">{apuracoes.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    DAS Total
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'warning.lighter',
                    color: 'warning.main',
                  }}
                >
                  <Iconify icon="solar:clock-circle-bold-duotone" width={32} />
                </Box>
                <Box>
                  <Typography variant="h3">
                    {apuracoesComDas.filter((a) => a.das?.status === 'gerado' || (!a.das && a.dasGerado)).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendentes de Pagamento
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'error.lighter',
                    color: 'error.main',
                  }}
                >
                  <Iconify icon="solar:dollar-bold-duotone" width={32} />
                </Box>
                <Box>
                  <Typography variant="h3">{fCurrency(totalPendente)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total a Pagar
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs de Filtro e Lista */}
        <Card>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              px: 2,
              borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip label={tab.count} size="small" />
                  </Box>
                }
                sx={{
                  '&:not(:last-of-type)': {
                    mr: 3,
                  },
                }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {apuracoesFiltradas.length === 0 && !isLoading && (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Iconify
                  icon="solar:document-text-bold-duotone"
                  width={80}
                  sx={{ color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  Nenhuma apuração encontrada
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentTab === 'pendentes'
                    ? 'Não há apurações pendentes de pagamento'
                    : currentTab === 'pagos'
                      ? 'Nenhuma apuração foi paga ainda'
                      : 'Nenhuma apuração foi calculada ainda'}
                </Typography>
              </Box>
            )}

            <Stack spacing={2}>
              {apuracoesFiltradas.map((apuracao) => {
                const status = getStatusSimplificado(apuracao);
                const vencido = apuracao.das ? isVencido(apuracao.das) : false;
                const valorTotal = apuracao.das?.valores?.total || apuracao.totalImpostos || 0;
                const dasId = apuracao.das?._id || apuracao.das?.id;
                const isExpanded = expandedDas[dasId] || false;

                // O código de barras real do DAS normalmente vem no PDF ou da API
                // Aqui usamos o número do documento como referência
                // O código completo geralmente está disponível no PDF do DAS
                const codigoBarras = apuracao.das?.numeroDocumento || null;

                return (
                  <Card key={apuracao._id} sx={{ border: 1, borderColor: vencido ? 'error.main' : 'divider', overflow: 'hidden' }}>
                    <Stack>
                      {/* Header Compacto */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ p: 2, bgcolor: vencido ? 'error.lighter' : 'transparent' }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} flex={1}>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            icon={<Iconify icon={status.icon} width={16} />}
                          />
                          <Stack>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {apuracao?.periodoApuracao ? formatarPeriodo(apuracao.periodoApuracao) : 'Período não informado'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {apuracao?.das?.numeroDocumento
                                ? `DAS: ${apuracao.das.numeroDocumento}`
                                : 'Aguardando geração do DAS'}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary" display="block">
                              Valor
                            </Typography>
                            <Typography variant="h6" color={vencido ? 'error.main' : 'text.primary'} fontWeight="bold">
                              {fCurrency(valorTotal)}
                            </Typography>
                            {apuracao.das?.dataVencimento && (
                              <Typography variant="caption" color={vencido ? 'error.main' : 'text.secondary'}>
                                Vence: {formatarDataVencimento(apuracao.das.dataVencimento)}
                                {vencido && ' ⚠️ VENCIDO'}
                              </Typography>
                            )}
                          </Box>
                          {apuracao.das && (
                            <IconButton
                              onClick={() => setExpandedDas({ ...expandedDas, [dasId]: !isExpanded })}
                              size="small"
                            >
                              <Iconify icon={isExpanded ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>

                      {/* Detalhes Expandidos */}
                      {apuracao.das && (
                        <Collapse in={isExpanded}>
                          <Divider />
                          <Stack spacing={2} sx={{ p: 2 }}>
                            {/* Código de Barras / Número do Documento */}
                            {codigoBarras && (
                              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Stack spacing={1}>
                                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                      NÚMERO DO DOCUMENTO DAS
                                    </Typography>
                                    <Chip
                                      label="Importante"
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                    />
                                  </Stack>
                                  <TextField
                                    fullWidth
                                    value={codigoBarras}
                                    InputProps={{
                                      readOnly: true,
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <CopyToClipboard
                                            text={codigoBarras}
                                            onCopy={() => toast.success('Número do documento copiado!')}
                                          >
                                            <IconButton size="small" edge="end">
                                              <Iconify icon="solar:copy-bold-duotone" width={20} />
                                            </IconButton>
                                          </CopyToClipboard>
                                        </InputAdornment>
                                      ),
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: 'background.paper',
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.1em',
                                        fontWeight: 'bold',
                                      },
                                    }}
                                  />
                                  <Alert severity="info" sx={{ py: 0.5 }} icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
                                    <Typography variant="caption">
                                      <strong>Como pagar:</strong> O código de barras completo está disponível no PDF do DAS. 
                                      Baixe o PDF e use o código de barras no aplicativo do seu banco ou internet banking para realizar o pagamento.
                                    </Typography>
                                  </Alert>
                                </Stack>
                              </Paper>
                            )}

                            {/* Informações Adicionais */}
                            <Grid container spacing={2}>
                              {apuracao.das?.dataLimiteAcolhimento && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Data Limite para Acolhimento
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatarDataVencimento(apuracao.das.dataLimiteAcolhimento)}
                                  </Typography>
                                </Grid>
                              )}
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Faturamento do Período
                                </Typography>
                                <Typography variant="body2">{fCurrency(apuracao.totalReceitaBruta || 0)}</Typography>
                              </Grid>
                              {apuracao.fatorR && (
                                <Grid item xs={12}>
                                  <Chip
                                    size="small"
                                    label={`Fator R: ${apuracao.fatorR.percentual?.toFixed(2)}% • ${apuracao.fatorR.aplicavelAnexoIII ? 'Anexo III' : 'Anexo V'}`}
                                    color={apuracao.fatorR.aplicavelAnexoIII ? 'success' : 'default'}
                                    variant="outlined"
                                  />
                                </Grid>
                              )}
                            </Grid>

                            {/* Alerta de Vencimento */}
                            {vencido && (
                              <Alert severity="error" icon={<Iconify icon="solar:danger-circle-bold-duotone" />}>
                                <AlertTitle>DAS Vencido!</AlertTitle>
                                Este documento está vencido. Podem ser acrescidos juros e multa. Entre em contato com
                                nosso time de contadores.
                              </Alert>
                            )}

                            {/* Ações */}
                            <Stack direction="row" spacing={2}>
                              <Button
                                variant="contained"
                                startIcon={<Iconify icon="solar:download-bold-duotone" />}
                                onClick={() => handleDownloadDas(apuracao.das)}
                                fullWidth
                              >
                                Baixar DAS (PDF)
                              </Button>
                            </Stack>
                          </Stack>
                        </Collapse>
                      )}

                      {/* Se não tem DAS mas tem dasGerado */}
                      {!apuracao.das && apuracao.dasGerado && (
                        <>
                          <Divider />
                          <Alert severity="info" sx={{ m: 2 }} icon={false}>
                            DAS em processo de geração. Você receberá uma notificação quando estiver disponível para download.
                          </Alert>
                        </>
                      )}
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </Card>
      </Stack>
    </Container>
  );
}
