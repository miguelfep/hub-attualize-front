'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Button,
  Card,
  Typography,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  LinearProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Upload } from 'src/components/upload';
import { MonthYearPicker } from 'src/components/month-year-picker/month-year-picker';

import {
  useHistoricosFolha,
  criarHistoricoFolha,
  uploadCSVHistorico,
  atualizarHistoricoFolha,
  cancelarHistoricoFolha,
} from 'src/actions/historico-folha';
import { formatarPeriodo, validarPeriodo } from 'src/types/apuracao';

// ----------------------------------------------------------------------

export function HistoricoFolhaView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva } = useEmpresa(userId);

  const [openUpload, setOpenUpload] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sobrescrever, setSobrescrever] = useState(false);

  // Form data para criação manual
  const [formData, setFormData] = useState({
    periodo: '',
    folhaPagamento: '',
    inssCpp: '',
    faturamentoBruto: '',
    deducoes: '',
    observacoes: '',
  });

  // Buscar históricos
  const { data: historicosData, isLoading, mutate } = useHistoricosFolha(empresaAtiva, {
    status: 'ativo',
  });

  const handleOpenUpload = useCallback(() => {
    setOpenUpload(true);
  }, []);

  const handleCloseUpload = useCallback(() => {
    setOpenUpload(false);
    setUploadFile(null);
    setSobrescrever(false);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setOpenCreate(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setOpenCreate(false);
    setFormData({
      periodo: '',
      folhaPagamento: '',
      inssCpp: '',
      faturamentoBruto: '',
      deducoes: '',
      observacoes: '',
    });
  }, []);

  const handleDropFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadFile(file);
    }
  }, []);

  const handleUploadCSV = useCallback(async () => {
    if (!uploadFile) {
      toast.error('Selecione um arquivo CSV');
      return;
    }

    if (!empresaAtiva) {
      toast.error('Selecione uma empresa');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadCSVHistorico(empresaAtiva, uploadFile, sobrescrever);

      if (result.sucesso) {
        toast.success(
          `Upload concluído! ${result.inseridos} registros inseridos, ${result.atualizados} atualizados`
        );

        if (result.erros && result.erros.length > 0) {
          toast.warning(`${result.erros.length} erros encontrados. Verifique os detalhes.`);
        }

        mutate();
        handleCloseUpload();
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer upload do CSV');
    } finally {
      setUploading(false);
    }
  }, [uploadFile, empresaAtiva, sobrescrever, mutate, handleCloseUpload]);

  const handleCreateHistorico = useCallback(async () => {
    if (!empresaAtiva) {
      toast.error('Selecione uma empresa');
      return;
    }

    // Validações
    if (!formData.periodo || !validarPeriodo(formData.periodo)) {
      toast.error('Período inválido. Use o formato AAAAMM (ex: 202412)');
      return;
    }

    if (!formData.folhaPagamento || !formData.inssCpp || !formData.faturamentoBruto) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const payload = {
        periodo: formData.periodo,
        folhaPagamento: parseFloat(formData.folhaPagamento),
        inssCpp: parseFloat(formData.inssCpp),
        faturamentoBruto: parseFloat(formData.faturamentoBruto),
        deducoes: formData.deducoes ? parseFloat(formData.deducoes) : 0,
        observacoes: formData.observacoes || '',
      };

      await criarHistoricoFolha(empresaAtiva, payload);
      toast.success('Histórico criado com sucesso!');
      mutate();
      handleCloseCreate();
    } catch (error) {
      toast.error(error.message || 'Erro ao criar histórico');
    }
  }, [empresaAtiva, formData, mutate, handleCloseCreate]);

  const handleDownloadTemplate = useCallback(() => {
    const csvContent = [
      'periodo,folha_pagamento,inss_cpp,faturamento_bruto,deducoes,observacoes',
      '202401,10000.00,2200.00,50000.00,0,Janeiro 2024',
      '202402,10500.00,2310.00,52000.00,0,Fevereiro 2024',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_historico_folha.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!empresaAtiva) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">
          <AlertTitle>Empresa não selecionada</AlertTitle>
          Selecione uma empresa para gerenciar o histórico de folha e faturamento.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <CustomBreadcrumbs
        heading="Histórico de Folha e Faturamento"
        links={[
          { name: 'Portal', href: paths.cliente.root },
          { name: 'Apuração', href: paths.cliente.apuracao.root },
          { name: 'Histórico' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:download-bold-duotone" />}
              onClick={handleDownloadTemplate}
            >
              Template CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:upload-bold-duotone" />}
              onClick={handleOpenUpload}
            >
              Upload CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
              onClick={handleOpenCreate}
            >
              Novo Registro
            </Button>
          </Stack>
        }
        sx={{ mb: 3 }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Informações */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>Sobre o Histórico</AlertTitle>
          O histórico de folha e faturamento é usado para calcular o Fator R e determinar se sua
          empresa se enquadra no Anexo III ou V do Simples Nacional. Mantenha os dados dos últimos
          12 meses atualizados.
        </Alert>

        {/* Tabela de Históricos */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Período</TableCell>
                  <TableCell align="right">Folha Pagamento</TableCell>
                  <TableCell align="right">INSS/CPP</TableCell>
                  <TableCell align="right">Folha + Encargos</TableCell>
                  <TableCell align="right">Faturamento</TableCell>
                  <TableCell align="right">Fator R</TableCell>
                  <TableCell>Origem</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historicosData?.historicos?.map((historico) => (
                  <TableRow key={historico._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatarPeriodo(historico.periodoApuracao)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      R${' '}
                      {historico.folhaPagamento.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      R${' '}
                      {historico.inssCpp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        R${' '}
                        {historico.folhaComEncargos.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      R${' '}
                      {historico.faturamentoBruto.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {historico.folhaComEncargos && historico.faturamentoBruto && historico.faturamentoBruto > 0 ? (
                        <Chip
                          label={`${((historico.folhaComEncargos / historico.faturamentoBruto) * 100).toFixed(2)}%`}
                          color={((historico.folhaComEncargos / historico.faturamentoBruto) * 100) >= 28 ? 'success' : 'warning'}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={historico.origem} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <Iconify icon="solar:pen-bold-duotone" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!historicosData?.historicos?.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhum histórico encontrado. Faça upload de um CSV ou crie um novo
                          registro.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      {/* Dialog Upload CSV */}
      <Dialog open={openUpload} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <DialogTitle>Upload de Histórico via CSV</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Alert severity="info">
              <AlertTitle>Formato do Arquivo</AlertTitle>
              O arquivo CSV deve conter as colunas: periodo, folha_pagamento, inss_cpp,
              faturamento_bruto, deducoes (opcional), observacoes (opcional).
              <Button
                size="small"
                startIcon={<Iconify icon="solar:download-linear" />}
                onClick={handleDownloadTemplate}
                sx={{ mt: 1 }}
              >
                Baixar Template
              </Button>
            </Alert>

            <Upload
              file={uploadFile}
              onDrop={handleDropFile}
              onDelete={() => setUploadFile(null)}
              accept={{ 'text/csv': ['.csv'] }}
              placeholder={
                <Stack spacing={0.5} alignItems="center">
                  <Iconify icon="solar:cloud-upload-bold-duotone" width={40} />
                  <Typography variant="body2">Clique ou arraste o arquivo CSV aqui</Typography>
                </Stack>
              }
            />

            {/* Checkbox sobrescrever */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <input
                type="checkbox"
                checked={sobrescrever}
                onChange={(e) => setSobrescrever(e.target.checked)}
              />
              <Typography variant="body2">
                Sobrescrever registros existentes (se o período já existe)
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUploadCSV}
            disabled={!uploadFile || uploading}
          >
            {uploading ? 'Enviando...' : 'Fazer Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Criar Registro */}
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="md" fullWidth>
        <DialogTitle>Novo Registro de Histórico</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <MonthYearPicker
              label="Período (Mês/Ano)"
              value={formData.periodo}
              onChange={(periodo) => setFormData({ ...formData, periodo })}
              helperText="Selecione o mês e ano de referência"
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Folha de Pagamento"
                  type="number"
                  value={formData.folhaPagamento}
                  onChange={(e) =>
                    setFormData({ ...formData, folhaPagamento: e.target.value })
                  }
                  helperText="Sem encargos (salários + pró-labore)"
                  InputProps={{
                    startAdornment: 'R$',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="INSS/CPP"
                  type="number"
                  value={formData.inssCpp}
                  onChange={(e) => setFormData({ ...formData, inssCpp: e.target.value })}
                  helperText="INSS patronal + funcionários"
                  InputProps={{
                    startAdornment: 'R$',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Faturamento Bruto"
                  type="number"
                  value={formData.faturamentoBruto}
                  onChange={(e) =>
                    setFormData({ ...formData, faturamentoBruto: e.target.value })
                  }
                  helperText="Receita bruta do mês"
                  InputProps={{
                    startAdornment: 'R$',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deduções (opcional)"
                  type="number"
                  value={formData.deducoes}
                  onChange={(e) => setFormData({ ...formData, deducoes: e.target.value })}
                  InputProps={{
                    startAdornment: 'R$',
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Observações (opcional)"
              multiline
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateHistorico}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

