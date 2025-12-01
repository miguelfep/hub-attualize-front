'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Divider,
  Tab,
  Tabs,
  TextField,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Upload } from 'src/components/upload';
import { MonthYearPicker } from 'src/components/month-year-picker/month-year-picker';

import { useGetAllClientes } from 'src/actions/clientes';
import {
  useHistorico12Meses,
  useHistoricosFolha,
  uploadCSVHistorico,
  criarHistoricoFolha,
  atualizarHistoricoFolha,
  cancelarHistoricoFolha,
} from 'src/actions/historico-folha';
import { useApuracoes } from 'src/actions/apuracao';
import { formatarPeriodo, FATOR_R_MINIMO, validarPeriodo } from 'src/utils/apuracao-helpers';
import { fCurrency } from 'src/utils/format-number';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ----------------------------------------------------------------------

export function ClienteApuracaoDetalheView({ clienteId }) {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState('resumo');
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());

  // Estados para cadastro manual
  const [dialogAberto, setDialogAberto] = useState(false);
  const [historicoEditando, setHistoricoEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [formHistorico, setFormHistorico] = useState({
    periodo: '',
    folhaPagamento: '',
    inssCpp: '',
    faturamentoBruto: '',
    deducoes: '',
    observacoes: '',
  });

  // Buscar dados do cliente
  const { data: clientes } = useGetAllClientes({ status: true });
  const cliente = clientes?.find((c) => (c._id || c.id) === clienteId);

  // Buscar histórico (sempre busca os últimos 12 meses)
  const periodoAtual = new Date().toISOString().slice(0, 7).replace('-', '');
  const { data: historico12Meses, isLoading: loadingHistorico, mutate: mutateHistorico } = useHistorico12Meses(
    clienteId,
    periodoAtual
  );

  // Buscar todos os históricos para filtrar por ano
  const { data: todosHistoricosData } = useHistoricosFolha(clienteId, {});
  const todosHistoricos = todosHistoricosData?.historicos || [];

  // Extrair anos únicos dos históricos
  const anosDisponiveis = [
    ...new Set(
      todosHistoricos
        .map((h) => {
          const periodo = h.periodo || h.periodoApuracao || '';
          return periodo.length >= 4 ? parseInt(periodo.substring(0, 4), 10) : null;
        })
        .filter((ano) => ano !== null)
    ),
  ].sort((a, b) => b - a);

  // Filtrar históricos por ano selecionado
  const historicosFiltrados = todosHistoricos.filter((h) => {
    const periodo = h.periodo || h.periodoApuracao || '';
    const anoHistorico = periodo.length >= 4 ? parseInt(periodo.substring(0, 4), 10) : null;
    return anoHistorico === anoFiltro;
  });

  // Se anoFiltro for o ano atual, mostrar apenas os últimos 12 meses
  const historicosParaExibir =
    anoFiltro === new Date().getFullYear() && historico12Meses?.historicos
      ? historico12Meses.historicos
      : historicosFiltrados;

  // Buscar apurações
  const { data: apuracoesData, mutate: mutateApuracoes } = useApuracoes(clienteId, {});
  const apuracoes = apuracoesData?.apuracoes || [];

  // Funções para formatação de moeda
  const onlyDigits = (v) => {
    if (!v) return '';
    return String(v).replace(/\D/g, '');
  };
  
  // Formatar valor numérico para exibição (R$ X.XXX,XX)
  // Recebe um número (string numérica em reais) e formata para moeda
  const formatCurrencyInput = (value) => {
    if (!value || value === '' || value === null || value === undefined) return '';
    
    // Converte para número
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    if (isNaN(numValue) || numValue < 0) return '';
    
    // Formata diretamente o número (já está em reais, não em centavos)
    return fCurrency(numValue);
  };
  
  // Lidar com mudança no input de moeda
  // O usuário digita dígitos que são tratados como centavos
  // Suporta valores de qualquer tamanho: milhares, milhões, bilhões, etc.
  // Exemplo: 10500 = R$ 105,00 | 1050000 = R$ 10.500,00 | 100000000 = R$ 1.000.000,00
  const handleCurrencyChange = (field, inputValue) => {
    if (!inputValue || inputValue === '') {
      setFormHistorico({ ...formHistorico, [field]: '' });
      return;
    }
    
    // Remove tudo que não é dígito (incluindo R$, pontos, vírgulas, espaços)
    const digits = onlyDigits(inputValue);
    
    if (digits === '') {
      setFormHistorico({ ...formHistorico, [field]: '' });
      return;
    }
    
    // Converte dígitos para centavos e depois para reais
    // JavaScript Number suporta valores até 2^53 - 1 (mais de 9 trilhões)
    // Dividir por 100 para converter centavos em reais
    const numValue = Number(digits) / 100;
    
    // Verifica se o número é válido e finito
    if (!isNaN(numValue) && isFinite(numValue)) {
      // Armazena o valor numérico (string) no estado
      // O valor armazenado é o número em reais (não em centavos)
      setFormHistorico({ ...formHistorico, [field]: numValue.toString() });
    }
  };

  // Upload CSV
  const handleDropCSV = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validar se é CSV
      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        toast.error('Arquivo deve ser um CSV (.csv)');
        return;
      }
      setCsvFile(file);
    }
  }, []);

  const handleUploadCSV = useCallback(async () => {
    if (!csvFile) {
      toast.error('Selecione um arquivo CSV');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadCSVHistorico(clienteId, csvFile, false);
      
      const mensagem =
        result.inseridos > 0
          ? `CSV processado com sucesso! ${result.inseridos} registro(s) inserido(s).`
          : 'CSV processado, mas nenhum novo registro foi inserido.';
      
      if (result.atualizados > 0) {
        toast.success(
          `${mensagem} ${result.atualizados} registro(s) atualizado(s).`
        );
      } else {
        toast.success(mensagem);
      }
      
      setCsvFile(null);
      mutateHistorico();
    } catch (error) {
      const msg =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao fazer upload do CSV';
      toast.error(msg);
      console.error('Erro ao fazer upload do CSV:', error);
    } finally {
      setUploading(false);
    }
  }, [csvFile, clienteId, mutateHistorico]);

  // Funções para cadastro manual
  const abrirDialogNovo = useCallback(() => {
    setHistoricoEditando(null);
    setFormHistorico({
      periodo: '',
      folhaPagamento: '',
      inssCpp: '',
      faturamentoBruto: '',
      deducoes: '',
      observacoes: '',
    });
    setDialogAberto(true);
  }, []);

  const abrirDialogEditar = useCallback((historico) => {
    const periodo = historico.periodo || historico.periodo_referencia || historico.periodoApuracao || '';
    const folha = historico.folhaPagamento || historico.folha_pagamento || historico.folha || '';
    const inssCpp = historico.inssCpp || historico.inss_cpp || historico.inss || '';
    const faturamento =
      historico.faturamentoBruto ||
      historico.faturamento_bruto ||
      historico.faturamento ||
      historico.receitaBruta ||
      historico.receita_bruta ||
      '';
    const deducoes = historico.deducoes || historico.deducao || '';
    const observacoes = historico.observacoes || historico.observacao || '';

    setHistoricoEditando(historico);
    setFormHistorico({
      periodo: String(periodo),
      folhaPagamento: String(folha),
      inssCpp: String(inssCpp),
      faturamentoBruto: String(faturamento),
      deducoes: String(deducoes),
      observacoes: String(observacoes),
    });
    setDialogAberto(true);
  }, []);

  const fecharDialog = useCallback(() => {
    setDialogAberto(false);
    setHistoricoEditando(null);
    setFormHistorico({
      periodo: '',
      folhaPagamento: '',
      inssCpp: '',
      faturamentoBruto: '',
      deducoes: '',
      observacoes: '',
    });
  }, []);

  const handleSalvarHistorico = useCallback(async () => {
    if (!validarPeriodo(formHistorico.periodo)) {
      toast.error('Período inválido. Use o formato AAAAMM (ex: 202412)');
      return;
    }

    if (!formHistorico.faturamentoBruto || parseFloat(formHistorico.faturamentoBruto) <= 0) {
      toast.error('Informe o faturamento bruto');
      return;
    }

    // Folha e INSS são opcionais - podem ser adicionados depois
    if (formHistorico.folhaPagamento && parseFloat(formHistorico.folhaPagamento) < 0) {
      toast.error('Folha de pagamento não pode ser negativa');
      return;
    }

    if (formHistorico.inssCpp && parseFloat(formHistorico.inssCpp) < 0) {
      toast.error('INSS/CPP não pode ser negativo');
      return;
    }

    try {
      setSalvando(true);

      const payload = {
        periodo: formHistorico.periodo,
        faturamentoBruto: parseFloat(formHistorico.faturamentoBruto),
        ...(formHistorico.folhaPagamento && parseFloat(formHistorico.folhaPagamento) > 0
          ? { folhaPagamento: parseFloat(formHistorico.folhaPagamento) }
          : { folhaPagamento: 0 }),
        ...(formHistorico.inssCpp && parseFloat(formHistorico.inssCpp) > 0
          ? { inssCpp: parseFloat(formHistorico.inssCpp) }
          : { inssCpp: 0 }),
        ...(formHistorico.deducoes && parseFloat(formHistorico.deducoes) > 0
          ? { deducoes: parseFloat(formHistorico.deducoes) }
          : {}),
        ...(formHistorico.observacoes ? { observacoes: formHistorico.observacoes } : {}),
      };

      if (historicoEditando) {
        await atualizarHistoricoFolha(historicoEditando._id || historicoEditando.id, payload);
        toast.success('Histórico atualizado com sucesso!');
      } else {
        await criarHistoricoFolha(clienteId, payload);
        toast.success('Histórico cadastrado com sucesso!');
      }

      mutateHistorico();
      fecharDialog();
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar histórico');
      console.error('Erro ao salvar histórico:', error);
    } finally {
      setSalvando(false);
    }
  }, [formHistorico, historicoEditando, clienteId, mutateHistorico, fecharDialog]);

  const handleExcluirHistorico = useCallback(
    async (historico) => {
      if (!window.confirm('Deseja realmente excluir este registro de histórico?')) {
        return;
      }

      try {
        await cancelarHistoricoFolha(historico._id || historico.id, 'Excluído pelo usuário');
        toast.success('Histórico excluído com sucesso!');
        mutateHistorico();
      } catch (error) {
        toast.error(error.message || 'Erro ao excluir histórico');
      }
    },
    [mutateHistorico]
  );


  // Tabs
  const tabs = [
    { value: 'resumo', label: 'Resumo', icon: 'solar:chart-bold-duotone' },
    { value: 'historico', label: 'Histórico 12 Meses', icon: 'solar:history-bold-duotone' },
    { value: 'calcular', label: 'Calcular Impostos', icon: 'solar:calculator-bold-duotone' },
    { value: 'apuracoes', label: `Apurações (${apuracoes.length})`, icon: 'solar:document-text-bold-duotone' },
  ];

  if (!cliente) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Cliente não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading={cliente.nome || cliente.razao_social}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Clientes', href: `${paths.dashboard.fiscal.apuracao}/clientes` },
          { name: cliente.nome || cliente.razao_social },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {/* Header do Cliente */}
        <Card sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: 32,
                fontWeight: 'bold',
              }}
            >
              {(cliente.nome || cliente.razao_social || 'C').substring(0, 2).toUpperCase()}
            </Avatar>

            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                {cliente.nome || cliente.razao_social}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  icon={<Iconify icon="solar:document-text-bold-duotone" />}
                  label={cliente.cnpj}
                  size="small"
                />
                {cliente.regimeTributario && (
                  <Chip
                    icon={<Iconify icon="solar:calculator-bold-duotone" />}
                    label={cliente.regimeTributario}
                    size="small"
                    color="info"
                  />
                )}
                {cliente.atividade_principal && (
                  <Chip
                    icon={<Iconify icon="solar:case-bold-duotone" />}
                    label={
                      typeof cliente.atividade_principal[0] === 'string'
                        ? cliente.atividade_principal[0]?.text
                        : String(cliente.atividade_principal[0]?.text)
                    }
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:arrow-left-bold-duotone" />}
              onClick={() => router.push(`${paths.dashboard.fiscal.apuracao}/clientes`)}
            >
              Voltar
            </Button>
          </Stack>
        </Card>

        {/* Tabs */}
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
                icon={<Iconify icon={tab.icon} width={20} />}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* TAB: RESUMO */}
            {currentTab === 'resumo' && (
              <Stack spacing={3}>
                {/* Cards de métricas */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="solar:chart-bold-duotone" width={24} color="warning.main" />
                          <Typography variant="caption" color="text.secondary">
                            Fator R
                          </Typography>
                        </Stack>
                        <Typography variant="h4">
                          {historico12Meses?.totais?.fatorRMedio
                            ? `${historico12Meses.totais.fatorRMedio.toFixed(1)}%`
                            : '-'}
                        </Typography>
                        <Typography variant="caption">
                          {historico12Meses?.totais?.atingeFatorRMinimo
                            ? 'Anexo III ✓'
                            : 'Anexo V'}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="solar:document-text-bold-duotone" width={24} color="primary.main" />
                          <Typography variant="caption" color="text.secondary">
                            Apurações
                          </Typography>
                        </Stack>
                        <Typography variant="h4">{apuracoes.length}</Typography>
                        <Typography variant="caption">Total calculadas</Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon="solar:bill-list-bold-duotone" width={24} color="success.main" />
                          <Typography variant="caption" color="text.secondary">
                            DAS Gerados
                          </Typography>
                        </Stack>
                        <Typography variant="h4">
                          {apuracoes.filter((a) => a.dasGerado).length}
                        </Typography>
                        <Typography variant="caption">Documentos</Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Ações Rápidas */}
                <Card variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ações Rápidas
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                        onClick={() => setCurrentTab('historico')}
                      >
                        Upload Histórico
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        color="success"
                        startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
                        onClick={() => setCurrentTab('calcular')}
                      >
                        Calcular Impostos
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        startIcon={<Iconify icon="solar:list-bold-duotone" />}
                        onClick={() => setCurrentTab('apuracoes')}
                      >
                        Ver Apurações
                      </Button>
                    </Grid>
                  </Grid>
                </Card>

                {/* Status do Fator R */}
                {historico12Meses && (
                  <Stack spacing={2}>
                    <Alert
                      severity={historico12Meses.totais?.atingeFatorRMinimo ? 'success' : 'info'}
                      icon={<Iconify icon="solar:chart-bold-duotone" width={24} />}
                    >
                      <AlertTitle>
                        Fator R: {historico12Meses.totais?.fatorRMedio?.toFixed(2)}%
                      </AlertTitle>
                      {historico12Meses.totais?.atingeFatorRMinimo ? (
                        <>Cliente <strong>atinge</strong> o fator R mínimo de {FATOR_R_MINIMO}%. Anexo III será aplicado com alíquotas reduzidas.</>
                      ) : (
                        <>Cliente <strong>não atinge</strong> o fator R mínimo de {FATOR_R_MINIMO}%. Anexo V será aplicado.</>
                      )}
                    </Alert>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
                      onClick={() => router.push(paths.dashboard.fiscal.apuracaoClienteFolhaIdeal(clienteId))}
                    >
                      Simular Folha Ideal para Fator R
                    </Button>
                  </Stack>
                )}
              </Stack>
            )}

            {/* TAB: HISTÓRICO */}
            {currentTab === 'historico' && (
              <Stack spacing={3}>
                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
                  <AlertTitle>Histórico de Folha e Faturamento</AlertTitle>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    <strong>Como funciona:</strong>
                    <br />
                    • O histórico é atualizado automaticamente após cada apuração calculada
                    <br />
                    • Use o upload CSV ou cadastro manual para carregar dados históricos anteriores
                    (antes de começar a apurar)
                    <br />
                    • Edite registros para corrigir valores que afetarão o cálculo do Fator R nas
                    próximas apurações
                    <br />• O Fator R é calculado com base nos últimos 12 meses deste histórico
                  </Typography>
                </Alert>

                {/* Ações Rápidas */}
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                    onClick={abrirDialogNovo}
                  >
                    Adicionar Novo Faturamento
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:cloud-upload-bold-duotone" />}
                    onClick={() => {
                      const input = document.getElementById('csv-upload-input-historic');
                      input?.click();
                    }}
                  >
                    Upload CSV
                  </Button>
                </Stack>

                {/* Input oculto para CSV */}
                <input
                  id="csv-upload-input-historic"
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
                        toast.error('Arquivo deve ser um CSV (.csv)');
                        return;
                      }
                      setCsvFile(file);
                    }
                  }}
                />

                {/* Upload CSV */}
                <Card variant="outlined" sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Upload de CSV para Histórico
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Faça upload de um arquivo CSV com os dados históricos de folha e faturamento.
                      Ideal para carregar múltiplos meses de uma vez.
                    </Typography>

                    <Upload
                      file={csvFile}
                      onDrop={handleDropCSV}
                      onDelete={() => setCsvFile(null)}
                      accept={{ 'text/csv': ['.csv'] }}
                      placeholder={
                        <Stack spacing={0.5} alignItems="center" sx={{ py: 2 }}>
                          <Iconify icon="solar:cloud-upload-bold-duotone" width={48} />
                          <Typography variant="body2">
                            Clique ou arraste o arquivo CSV aqui
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Formato esperado: periodo, folha_pagamento, inss_cpp, faturamento_bruto
                          </Typography>
                        </Stack>
                      }
                    />

                    {csvFile && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Arquivo selecionado: <strong>{csvFile.name}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tamanho: {(csvFile.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Alert>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={!csvFile || uploading}
                      onClick={handleUploadCSV}
                      startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                      sx={{ mt: 1 }}
                    >
                      {uploading ? 'Processando CSV...' : 'Processar CSV'}
                    </Button>

                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <Typography variant="caption">
                        <strong>Formato do CSV:</strong> O arquivo deve conter as colunas:
                        periodo (AAAAMM), folha_pagamento, inss_cpp, faturamento_bruto. O sistema
                        processará todas as linhas do arquivo.
                      </Typography>
                    </Alert>
                  </Stack>
                </Card>

                {loadingHistorico && <LinearProgress />}

                {/* Filtro de Ano */}
                {anosDisponiveis.length > 0 && (
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Filtrar por ano:
                      </Typography>
                      <TextField
                        select
                        size="small"
                        value={anoFiltro}
                        onChange={(e) => setAnoFiltro(parseInt(e.target.value, 10))}
                        sx={{ minWidth: 120 }}
                      >
                        {anosDisponiveis.map((ano) => (
                          <MenuItem key={ano} value={ano}>
                            {ano}
                            {ano === new Date().getFullYear() ? ' (Últimos 12 meses)' : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  </Card>
                )}

                {/* Tabela de Histórico */}
                {historicosParaExibir && historicosParaExibir.length > 0 && (
                  <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                          Histórico {anoFiltro === new Date().getFullYear() ? 'dos Últimos 12 Meses' : `de ${anoFiltro}`} ({historicosParaExibir.length} mês(es)
                          cadastrado(s))
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                          onClick={abrirDialogNovo}
                        >
                          Adicionar Novo Faturamento
                        </Button>
                      </Stack>
                    </Box>
                    <Divider />
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Período</TableCell>
                            <TableCell align="right">Folha</TableCell>
                            <TableCell align="right">INSS/CPP</TableCell>
                            <TableCell align="right">Faturamento</TableCell>
                            <TableCell align="center">Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {historicosParaExibir.map((hist) => {
                            // Suporte para camelCase e snake_case
                            const periodo = hist.periodo || hist.periodoApuracao || hist.periodo_referencia || '';
                            const folha =
                              hist.folhaPagamento ||
                              hist.folha_pagamento ||
                              hist.folha ||
                              0;
                            const inssCpp =
                              hist.inssCpp ||
                              hist.inss_cpp ||
                              hist.inss ||
                              0;
                            const faturamento =
                              hist.faturamentoBruto ||
                              hist.faturamento_bruto ||
                              hist.faturamento ||
                              hist.receitaBruta ||
                              hist.receita_bruta ||
                              0;

                            return (
                              <TableRow key={hist._id || hist.id || periodo}>
                                <TableCell>
                                  {periodo ? formatarPeriodo(String(periodo)) : '-'}
                                </TableCell>
                                <TableCell align="right">
                                  R${' '}
                                  {Number(folha).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell align="right">
                                  R${' '}
                                  {Number(inssCpp).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell align="right">
                                  R${' '}
                                  {Number(faturamento).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell align="center">
                                  <Stack direction="row" spacing={1} justifyContent="center">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => abrirDialogEditar(hist)}
                                    >
                                      <Iconify icon="solar:pen-bold-duotone" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleExcluirHistorico(hist)}
                                    >
                                      <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                                    </IconButton>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                )}

                {(!historicosParaExibir || historicosParaExibir.length === 0) && (
                  <Card variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
                    <Iconify
                      icon="solar:history-bold-duotone"
                      width={64}
                      sx={{ color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Nenhum histórico cadastrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Adicione o histórico de folha e faturamento para calcular o Fator R corretamente.
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                        onClick={abrirDialogNovo}
                      >
                        Adicionar Primeiro Registro
                      </Button>
                    </Stack>
                  </Card>
                )}
              </Stack>
            )}

            {/* TAB: CALCULAR */}
            {currentTab === 'calcular' && (
              <Stack spacing={3}>
                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
                  <AlertTitle>Nova Apuração</AlertTitle>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    Para criar uma nova apuração, use a página dedicada que permite:
                    <br />
                    • Buscar automaticamente o faturamento das notas fiscais do período
                    <br />
                    • Informar valores de folha e INSS para cálculo do Fator R
                    <br />
                    • Criar automaticamente um novo registro no histórico após a apuração
                  </Typography>
                </Alert>

                <Card variant="outlined" sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Typography variant="h6">Calcular Nova Apuração</Typography>

                    {historico12Meses && (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Status do Histórico (últimos 12 meses)
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Meses cadastrados:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {historico12Meses.mesesEncontrados || 0} / 12
                            </Typography>
                          </Grid>
                          {historico12Meses.totais?.fatorRMedio && (
                            <>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Fator R Médio:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {historico12Meses.totais.fatorRMedio.toFixed(2)}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Anexo Aplicável:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {historico12Meses.totais?.atingeFatorRMinimo
                                    ? 'Anexo III'
                                    : 'Anexo V'}
                                </Typography>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Paper>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                      onClick={() =>
                        router.push(
                          `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/nova`
                        )
                      }
                    >
                      Criar Nova Apuração
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            )}

            {/* TAB: APURAÇÕES */}
            {currentTab === 'apuracoes' && (
              <Stack spacing={3}>
                {apuracoes.length === 0 ? (
                  <Card variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
                    <Iconify
                      icon="solar:document-text-bold-duotone"
                      width={80}
                      sx={{ color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Nenhuma apuração calculada
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Use a aba "Calcular Impostos" para criar uma nova apuração
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
                      onClick={() => setCurrentTab('calcular')}
                    >
                      Calcular Agora
                    </Button>
                  </Card>
                ) : (
                  apuracoes.map((apuracao) => (
                    <Card key={apuracao._id} variant="outlined" sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            {formatarPeriodo(apuracao.periodoApuracao)}
                          </Typography>
                          <Chip
                            label={apuracao.status}
                            color={apuracao.dasGerado ? 'success' : 'info'}
                          />
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Receita Bruta
                            </Typography>
                            <Typography variant="subtitle1">
                              R${' '}
                              {apuracao.totalReceitaBruta?.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Total Impostos
                            </Typography>
                            <Typography variant="subtitle1" color="error.main">
                              R${' '}
                              {apuracao.totalImpostos?.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Alíquota
                            </Typography>
                            <Typography variant="subtitle1">
                              {apuracao.aliquotaEfetivaTotal?.toFixed(2)}%
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Fator R
                            </Typography>
                            <Typography variant="subtitle1">
                              {apuracao.fatorR?.percentual?.toFixed(1)}%
                            </Typography>
                          </Grid>
                        </Grid>
                        <Stack direction="row" spacing={1}>
                          {!apuracao.dasGerado && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                              onClick={() =>
                                router.push(
                                  `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracao._id || apuracao.id}/upload-das`
                                )
                              }
                            >
                              Upload DAS
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Iconify icon="solar:eye-bold-duotone" />}
                            onClick={() =>
                              router.push(
                                `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracao._id || apuracao.id}`
                              )
                            }
                          >
                            Ver Detalhes
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))
                )}
              </Stack>
            )}
          </Box>
        </Card>
      </Stack>

      {/* Dialog para Cadastro/Edição de Histórico */}
      <Dialog open={dialogAberto} onClose={fecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {historicoEditando ? 'Editar Registro de Histórico' : 'Novo Registro de Histórico'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <MonthYearPicker
              label="Período de Referência"
              value={formHistorico.periodo}
              onChange={(periodo) => {
                setFormHistorico({ ...formHistorico, periodo });
              }}
              disabled={!!historicoEditando}
              required
              helperText={
                historicoEditando
                  ? 'O período não pode ser alterado'
                  : 'Selecione o mês e ano de referência'
              }
            />

            <TextField
              fullWidth
              label="Folha de Pagamento (Opcional)"
              placeholder="R$ 10.500,00"
              value={formHistorico.folhaPagamento ? formatCurrencyInput(formHistorico.folhaPagamento) : ''}
              onChange={(e) => handleCurrencyChange('folhaPagamento', e.target.value)}
              helperText="Valor da folha SEM encargos (salários + pró-labore). Pode ser preenchido depois."
            />

            <TextField
              fullWidth
              label="INSS/CPP (Opcional)"
              placeholder="R$ 2.310,00"
              value={formHistorico.inssCpp ? formatCurrencyInput(formHistorico.inssCpp) : ''}
              onChange={(e) => handleCurrencyChange('inssCpp', e.target.value)}
              helperText="Valor do INSS/CPP (contribuição patronal + funcionários). Pode ser preenchido depois."
            />

            <TextField
              fullWidth
              label="Faturamento Bruto"
              placeholder="R$ 52.000,00"
              value={formHistorico.faturamentoBruto ? formatCurrencyInput(formHistorico.faturamentoBruto) : ''}
              onChange={(e) => handleCurrencyChange('faturamentoBruto', e.target.value)}
              helperText="Receita bruta do período"
              required
            />

            <TextField
              fullWidth
              label="Deduções (Opcional)"
              placeholder="R$ 0,00"
              value={formHistorico.deducoes ? formatCurrencyInput(formHistorico.deducoes) : ''}
              onChange={(e) => handleCurrencyChange('deducoes', e.target.value)}
              helperText="Deduções permitidas (ICMS, ISS, etc.)"
            />

            <TextField
              fullWidth
              label="Observações (Opcional)"
              multiline
              rows={3}
              placeholder="Observações sobre este registro..."
              value={formHistorico.observacoes}
              onChange={(e) =>
                setFormHistorico({ ...formHistorico, observacoes: e.target.value })
              }
            />

            {/* Preview do Fator R */}
            {formHistorico.folhaPagamento &&
              formHistorico.inssCpp &&
              formHistorico.faturamentoBruto &&
              parseFloat(formHistorico.folhaPagamento) > 0 &&
              parseFloat(formHistorico.faturamentoBruto) > 0 && (
                <Alert severity="info">
                  <AlertTitle>Fator R Calculado</AlertTitle>
                  {(
                    ((parseFloat(formHistorico.folhaPagamento || 0) +
                      parseFloat(formHistorico.inssCpp || 0)) /
                      parseFloat(formHistorico.faturamentoBruto || 1)) *
                    100
                  ).toFixed(2)}
                  %{' '}
                  {((parseFloat(formHistorico.folhaPagamento || 0) +
                    parseFloat(formHistorico.inssCpp || 0)) /
                    parseFloat(formHistorico.faturamentoBruto || 1)) *
                    100 >=
                  FATOR_R_MINIMO ? (
                    <strong>(Anexo III)</strong>
                  ) : (
                    <strong>(Anexo V)</strong>
                  )}
                </Alert>
              )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSalvarHistorico}
            disabled={salvando}
            startIcon={<Iconify icon={salvando ? 'svg-spinners:3-dots-fade' : 'solar:check-circle-bold-duotone'} />}
          >
            {salvando ? 'Salvando...' : historicoEditando ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

