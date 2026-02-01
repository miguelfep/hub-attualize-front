'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import {
  useTodasIndicacoes,
  aprovarIndicacao,
  rejeitarIndicacao,
  atualizarStatusIndicacao,
} from 'src/actions/indicacoes';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { RejeitarIndicacaoDialog } from './rejeitar-indicacao-dialog';
import { AtualizarStatusDialog } from './atualizar-status-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'contato_iniciado', label: 'Contato Iniciado' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
];

function getStatusColor(status) {
  const colors = {
    pendente: 'warning',
    contato_iniciado: 'info',
    em_negociacao: 'info',
    aprovado: 'success',
    recusado: 'error',
  };
  return colors[status] || 'default';
}

function getStatusLabel(status) {
  const labels = {
    pendente: 'Pendente',
    contato_iniciado: 'Contato Iniciado',
    em_negociacao: 'Em Negociação',
    aprovado: 'Aprovado',
    recusado: 'Recusado',
  };
  return labels[status] || status;
}

// ----------------------------------------------------------------------

export function IndicacoesAdminView() {
  const [filtros, setFiltros] = useState({
    status: '',
    dataInicio: '',
    dataFim: '',
  });

  const { indicacoes, isLoading, mutate } = useTodasIndicacoes(filtros);
  const [rejeitarDialogOpen, setRejeitarDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [indicacaoSelecionada, setIndicacaoSelecionada] = useState(null);
  const [confirmAprovarOpen, setConfirmAprovarOpen] = useState(false);

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleAprovar = async (indicacaoId) => {
    try {
      await aprovarIndicacao(indicacaoId);
      toast.success('Indicação aprovada com sucesso!');
      mutate();
    } catch (error) {
      console.error('Erro ao aprovar indicação:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao aprovar indicação';
      toast.error(errorMessage);
    }
  };

  const handleRejeitar = (indicacao) => {
    setIndicacaoSelecionada(indicacao);
    setRejeitarDialogOpen(true);
  };

  const handleRejeitarConfirm = async (motivo) => {
    if (!indicacaoSelecionada) return;

    try {
      await rejeitarIndicacao(indicacaoSelecionada._id, motivo);
      toast.success('Indicação rejeitada com sucesso!');
      mutate();
      setRejeitarDialogOpen(false);
      setIndicacaoSelecionada(null);
    } catch (error) {
      console.error('Erro ao rejeitar indicação:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao rejeitar indicação';
      toast.error(errorMessage);
    }
  };

  const handleAtualizarStatus = (indicacao) => {
    setIndicacaoSelecionada(indicacao);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async (status) => {
    if (!indicacaoSelecionada) return;

    try {
      await atualizarStatusIndicacao(indicacaoSelecionada._id, status);
      toast.success('Status atualizado com sucesso!');
      mutate();
      setStatusDialogOpen(false);
      setIndicacaoSelecionada(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar status';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Card sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Typography variant="subtitle2">Filtros:</Typography>
            <Select
              value={filtros.status}
              onChange={(e) => handleFiltroChange('status', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Data Inicial"
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Data Final"
              type="date"
              value={filtros.dataFim}
              onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Stack>
        </Card>

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Indicador</TableCell>
                    <TableCell>Lead</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Recompensa</TableCell>
                    <TableCell>Data Criação</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : indicacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <EmptyContent
                          title="Nenhuma indicação encontrada"
                          description="Não há indicações com os filtros selecionados"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    indicacoes.map((indicacao) => (
                      <TableRow key={indicacao._id}>
                        <TableCell>
                          <Stack>
                            <Typography variant="subtitle2">
                              {indicacao.indicador?.nome || indicacao.indicador?.razaoSocial || '-'}
                            </Typography>
                            {indicacao.indicador?.email && (
                              <Typography variant="caption" color="text.secondary">
                                {indicacao.indicador.email}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {indicacao.lead?.nome || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{indicacao.lead?.email || '-'}</TableCell>
                        <TableCell>{indicacao.lead?.telefone || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(indicacao.status)}
                            color={getStatusColor(indicacao.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {indicacao.valorRecompensa ? (
                            <Typography variant="subtitle2" color="success.main">
                              {fCurrency(indicacao.valorRecompensa)}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {indicacao.createdAt
                            ? fDate(indicacao.createdAt, 'dd/MM/yyyy HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {indicacao.status === 'pendente' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                                  onClick={() => setConfirmAprovarOpen(indicacao._id)}
                                >
                                  Aprovar
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Iconify icon="solar:close-circle-bold" />}
                                  onClick={() => handleRejeitar(indicacao)}
                                >
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:pen-bold" />}
                              onClick={() => handleAtualizarStatus(indicacao)}
                            >
                              Status
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Stack>

      <ConfirmDialog
        open={!!confirmAprovarOpen}
        onClose={() => setConfirmAprovarOpen(false)}
        title="Aprovar Indicação"
        content="Tem certeza que deseja aprovar esta indicação? A recompensa será creditada ao indicador."
        action={
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              handleAprovar(confirmAprovarOpen);
              setConfirmAprovarOpen(false);
            }}
          >
            Aprovar
          </Button>
        }
      />

      <RejeitarIndicacaoDialog
        open={rejeitarDialogOpen}
        onClose={() => {
          setRejeitarDialogOpen(false);
          setIndicacaoSelecionada(null);
        }}
        onConfirm={handleRejeitarConfirm}
      />

      <AtualizarStatusDialog
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setIndicacaoSelecionada(null);
        }}
        onConfirm={handleStatusConfirm}
        statusAtual={indicacaoSelecionada?.status}
      />
    </>
  );
}
