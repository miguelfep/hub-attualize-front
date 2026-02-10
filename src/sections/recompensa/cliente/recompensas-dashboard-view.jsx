'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRecompensas } from 'src/hooks/use-recompensas';

import { Iconify } from 'src/components/iconify';

import { SaldoCards } from './saldo-cards';
import { TransacoesList } from './transacoes-list';
import { SolicitarPixDialog } from './solicitar-pix-dialog';
import { SolicitarDescontoDialog } from './solicitar-desconto-dialog';

// ----------------------------------------------------------------------

const FILTRO_TIPO_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'recompensa', label: 'Recompensas' },
  { value: 'desconto', label: 'Descontos' },
  { value: 'pix', label: 'PIX' },
  { value: 'estorno', label: 'Estornos' },
];

const FILTRO_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'processado', label: 'Processado' },
  { value: 'rejeitado', label: 'Rejeitado' },
];

// ----------------------------------------------------------------------

export function RecompensasDashboardView() {
  const { 
    conta, 
    transacoes, 
    loading, 
    loadingTransacoes,
    buscarConta, 
    buscarTransacoes,
  } = useRecompensas();

  const [openDescontoDialog, setOpenDescontoDialog] = useState(false);
  const [openPixDialog, setOpenPixDialog] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => {
    buscarConta();
    buscarTransacoes();
  }, [buscarConta, buscarTransacoes]);

  const handleRefresh = () => {
    buscarConta();
    buscarTransacoes({ tipo: filtroTipo, status: filtroStatus });
  };

  const handleFiltroChange = (tipo, status) => {
    setFiltroTipo(tipo);
    setFiltroStatus(status);
    buscarTransacoes({ tipo, status });
  };

  const saldoDisponivel = conta?.saldoDisponivel || 0;

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Recompensas</Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Stack>

      <SaldoCards conta={conta} loading={loading} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Iconify icon="solar:gift-bold" />}
          onClick={() => setOpenDescontoDialog(true)}
          disabled={saldoDisponivel === 0}
          fullWidth
        >
          Solicitar Desconto
        </Button>

        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<Iconify icon="solar:wallet-money-bold" />}
          onClick={() => setOpenPixDialog(true)}
          disabled={saldoDisponivel === 0}
          fullWidth
        >
          Solicitar PIX
        </Button>
      </Stack>

      <Card>
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ p: 2 }}
        >
          <Typography variant="h6">Histórico de Transações</Typography>
          
          <Stack direction="row" spacing={1}>
            <TextField
              select
              size="small"
              value={filtroTipo}
              onChange={(e) => handleFiltroChange(e.target.value, filtroStatus)}
              sx={{ minWidth: 150 }}
            >
              {FILTRO_TIPO_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              value={filtroStatus}
              onChange={(e) => handleFiltroChange(filtroTipo, e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {FILTRO_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        <TransacoesList transacoes={transacoes} loading={loadingTransacoes} />
      </Card>

      <SolicitarDescontoDialog
        open={openDescontoDialog}
        onClose={() => {
          setOpenDescontoDialog(false);
          handleRefresh();
        }}
        saldoDisponivel={saldoDisponivel}
      />

      <SolicitarPixDialog
        open={openPixDialog}
        onClose={() => {
          setOpenPixDialog(false);
          handleRefresh();
        }}
        saldoDisponivel={saldoDisponivel}
      />
    </Stack>
  );
}
