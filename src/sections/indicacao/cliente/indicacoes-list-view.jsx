'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useIndicacoes } from 'src/hooks/use-indicacoes';

import { EmptyContent } from 'src/components/empty-content';

import { IndicacaoShareCard } from './indicacao-share-card';
import { IndicacaoTableRow } from './indicacao-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'contato_iniciado', label: 'Contato Iniciado' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
];

// ----------------------------------------------------------------------

export function IndicacoesListView() {
  const { indicacoes, loading, buscarIndicacoes } = useIndicacoes();
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => {
    buscarIndicacoes();
  }, [buscarIndicacoes]);

  const indicacoesFiltradas = useCallback(() => {
    if (!filtroStatus) return indicacoes;
    return indicacoes.filter((ind) => ind.status === filtroStatus);
  }, [indicacoes, filtroStatus]);

  const handleRefresh = () => {
    buscarIndicacoes();
  };

  // Calcular estatísticas
  const stats = {
    total: indicacoes.length,
    pendentes: indicacoes.filter((ind) => ind.status === 'pendente').length,
    aprovadas: indicacoes.filter((ind) => ind.status === 'aprovado').length,
    recusadas: indicacoes.filter((ind) => ind.status === 'recusado').length,
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Minhas Indicações</Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <IndicacaoShareCard />
        </Grid>

        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3">{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {stats.pendentes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pendentes
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {stats.aprovadas}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Aprovadas
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" color="error.main">
                  {stats.recusadas}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recusadas
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Card>
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ p: 2 }}
        >
          <Typography variant="h6">Lista de Indicações</Typography>
          
          <TextField
            select
            size="small"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Indicado</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recompensa</TableCell>
                  <TableCell>Datas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {indicacoesFiltradas().length > 0 ? (
                  indicacoesFiltradas().map((indicacao) => (
                    <IndicacaoTableRow key={indicacao._id} row={indicacao} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyContent 
                        filled
                        title="Nenhuma indicação encontrada"
                        description={
                          filtroStatus 
                            ? 'Não há indicações com este status'
                            : 'Comece compartilhando seu código de indicação'
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Stack>
  );
}
