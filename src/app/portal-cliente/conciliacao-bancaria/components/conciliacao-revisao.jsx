'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';

import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LoadingButton } from '@mui/lab';

import { fCurrency } from 'src/utils/format-number';

import {
  confirmarTransacao,
  exportarConciliacaoCSV,
  obterUrlDownloadCSV,
  atualizarStatusConciliacao,
} from 'src/actions/conciliacao';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ConciliacaoRevisao({ conciliacao, onVoltar, onFinalizar }) {
  const [transacoes, setTransacoes] = useState(conciliacao?.transacoes || []);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, transacao: null });
  const [formData, setFormData] = useState({
    contaContabil: '',
    centroCusto: '',
    observacoes: '',
  });

  const handleOpenEdit = (transacao) => {
    setEditDialog({ open: true, transacao });
    setFormData({
      contaContabil: transacao.contaContabil || '',
      centroCusto: transacao.centroCusto || '',
      observacoes: transacao.observacoes || '',
    });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, transacao: null });
    setFormData({
      contaContabil: '',
      centroCusto: '',
      observacoes: '',
    });
  };

  const handleConfirmarTransacao = async () => {
    if (!editDialog.transacao) return;

    try {
      setLoading(true);
      await confirmarTransacao(conciliacao._id || conciliacao.id, editDialog.transacao.id, formData);

      // Atualizar transação localmente
      setTransacoes((prev) =>
        prev.map((t) =>
          t.id === editDialog.transacao.id
            ? { ...t, ...formData, statusConciliacao: 'confirmada' }
            : t
        )
      );

      toast.success('Transação confirmada com sucesso!');
      handleCloseEdit();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Erro ao confirmar transação';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarConciliacao = async () => {
    try {
      setLoading(true);
      await atualizarStatusConciliacao(conciliacao._id || conciliacao.id, 'concluida');
      toast.success('Conciliação finalizada com sucesso!');
      if (onFinalizar) onFinalizar();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Erro ao finalizar conciliação';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBaixarCSV = async () => {
    try {
      setLoading(true);
      const response = await exportarConciliacaoCSV(conciliacao._id || conciliacao.id);
      
      if (response.data?.fileName) {
        const url = obterUrlDownloadCSV(response.data.fileName);
        
        // Download via fetch para obter o blob
        const fileResponse = await fetch(url);
        const blob = await fileResponse.blob();
        saveAs(blob, response.data.fileName);
        
        toast.success('CSV baixado com sucesso!');
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Erro ao exportar CSV';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getRowClassName = (params) => {
    const status = params.row.statusConciliacao;
    if (status === 'confirmada' || status === 'automatica') {
      return 'row-confirmada';
    }
    if (status === 'sugestao' || status === 'pendente') {
      return 'row-sugestao';
    }
    return '';
  };

  const columns = [
    {
      field: 'data',
      headerName: 'Data',
      width: 110,
      valueFormatter: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('pt-BR');
      },
    },
    {
      field: 'descricao',
      headerName: 'Descrição',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'valor',
      headerName: 'Valor',
      width: 130,
      valueFormatter: (value) => fCurrency(value || 0),
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value === 'entrada' ? 'Entrada' : 'Saída'}
          color={params.value === 'entrada' ? 'success' : 'error'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'statusConciliacao',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const status = params.value;
        let color = 'default';
        let label = status || 'Pendente';

        if (status === 'confirmada' || status === 'automatica') {
          color = 'success';
          label = status === 'automatica' ? 'Automática' : 'Confirmada';
        } else if (status === 'sugestao' || status === 'pendente') {
          color = 'warning';
          label = 'Sugestão IA';
        }

        return <Chip size="small" label={label} color={color} />;
      },
    },
    {
      field: 'contaContabil',
      headerName: 'Conta Contábil',
      width: 150,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const status = params.row.statusConciliacao;
        const needsReview = status === 'sugestao' || status === 'pendente';

        return (
          <Stack direction="row" spacing={0.5}>
            {needsReview && (
              <IconButton
                size="small"
                color="warning"
                onClick={() => handleOpenEdit(params.row)}
                title="Revisar e confirmar"
              >
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
            )}
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEdit(params.row)}
              title="Visualizar/Editar"
            >
              <Iconify icon="solar:eye-bold" width={18} />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  const resumo = {
    total: transacoes.length,
    confirmadas: transacoes.filter((t) => t.statusConciliacao === 'confirmada' || t.statusConciliacao === 'automatica').length,
    sugestoes: transacoes.filter((t) => t.statusConciliacao === 'sugestao' || t.statusConciliacao === 'pendente').length,
    totalValor: transacoes.reduce((sum, t) => sum + (t.valor || 0), 0),
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">Revisão de Conciliação</Typography>
            <Typography variant="body2" color="text.secondary">
              {conciliacao?.nomeArquivo || 'Arquivo processado'}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
            onClick={onVoltar}
          >
            Voltar
          </Button>
        </Stack>

        {/* Resumo */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total de Transações
              </Typography>
              <Typography variant="h6">{resumo.total}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Confirmadas
              </Typography>
              <Typography variant="h6" color="success.main">
                {resumo.confirmadas}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Pendentes de Revisão
              </Typography>
              <Typography variant="h6" color="warning.main">
                {resumo.sugestoes}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Valor Total
              </Typography>
              <Typography variant="h6">{fCurrency(resumo.totalValor)}</Typography>
            </Box>
          </Stack>
        </Card>

        {/* Alertas */}
        {resumo.sugestoes > 0 && (
          <Alert severity="warning" icon={<Iconify icon="solar:danger-bold" />}>
            <Typography variant="subtitle2">
              {resumo.sugestoes} transaç{resumo.sugestoes > 1 ? 'ões' : 'ão'} pendente
              {resumo.sugestoes > 1 ? 's' : ''} de revisão
            </Typography>
            <Typography variant="body2">
              Revise as transações destacadas em amarelo e confirme ou ajuste as informações.
            </Typography>
          </Alert>
        )}

        {/* Legenda */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip
            icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.light' }} />}
            label="Conciliação Confirmada"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.light' }} />}
            label="Sugestão da IA - Requer Revisão"
            variant="outlined"
            size="small"
          />
        </Stack>

        {/* Data Grid */}
        <Card>
          <Box
            sx={{
              height: 600,
              '& .row-confirmada': {
                bgcolor: (theme) => theme.palette.success.lighter,
                '&:hover': {
                  bgcolor: (theme) => theme.palette.success.light,
                },
              },
              '& .row-sugestao': {
                bgcolor: (theme) => theme.palette.warning.lighter,
                '&:hover': {
                  bgcolor: (theme) => theme.palette.warning.light,
                },
              },
            }}
          >
            <DataGrid
              rows={transacoes}
              columns={columns}
              getRowClassName={getRowClassName}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              localeText={{
                noRowsLabel: 'Nenhuma transação encontrada',
                MuiTablePagination: {
                  labelRowsPerPage: 'Linhas por página:',
                },
              }}
            />
          </Box>
        </Card>

        {/* Ações */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <LoadingButton
            variant="outlined"
            startIcon={<Iconify icon="solar:download-bold" />}
            onClick={handleBaixarCSV}
            loading={loading}
          >
            Baixar CSV
          </LoadingButton>
          <LoadingButton
            variant="contained"
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            onClick={handleFinalizarConciliacao}
            loading={loading}
            disabled={resumo.sugestoes > 0}
          >
            Finalizar Conciliação
          </LoadingButton>
        </Stack>

        {resumo.sugestoes > 0 && (
          <Alert severity="info">
            <Typography variant="body2">
              Revise todas as transações pendentes antes de finalizar a conciliação.
            </Typography>
          </Alert>
        )}
      </Stack>

      {/* Dialog de Edição */}
      <Dialog open={editDialog.open} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:pen-bold" width={24} />
            <Typography variant="h6">Confirmar Transação</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editDialog.transacao && (
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transação
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {editDialog.transacao.descricao}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Data: {new Date(editDialog.transacao.data).toLocaleDateString('pt-BR')}
                  </Typography>
                  <Typography variant="caption">
                    Valor: {fCurrency(editDialog.transacao.valor)}
                  </Typography>
                </Stack>
              </Card>
            )}

            <TextField
              fullWidth
              label="Conta Contábil"
              value={formData.contaContabil}
              onChange={(e) => setFormData({ ...formData, contaContabil: e.target.value })}
              placeholder="Ex: 1.1.01.001"
            />

            <TextField
              fullWidth
              label="Centro de Custo"
              value={formData.centroCusto}
              onChange={(e) => setFormData({ ...formData, centroCusto: e.target.value })}
              placeholder="Ex: Administrativo"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Adicione observações sobre esta transação..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} variant="outlined">
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleConfirmarTransacao}
            variant="contained"
            loading={loading}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            Confirmar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
