'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useIndicacoes } from 'src/hooks/use-indicacoes';

import { fCurrency } from 'src/utils/format-number';

import { EmptyContent } from 'src/components/empty-content';

import { IndicacaoTableRow } from './indicacao-table-row';
import { IndicacaoShareCard } from './indicacao-share-card';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'contato_iniciado', label: 'Contato Iniciado' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
];

export function IndicacoesListView() {
  const theme = useTheme();
  const { indicacoes, loading, buscarIndicacoes } = useIndicacoes();
  const [filtroStatus, setFiltroStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        await buscarIndicacoes();
      } catch (err) {
        setError('Não foi possível carregar as indicações.');
      }
    };
    fetchData();
  }, [buscarIndicacoes]);

  const indicacoesFiltradas = useCallback(() => {
    if (!filtroStatus) return indicacoes;
    return indicacoes.filter((ind) => ind.status === filtroStatus);
  }, [indicacoes, filtroStatus]);

  const stats = {
    total: indicacoes.length,
    pendentes: indicacoes.filter((ind) => ind.status === 'pendente').length,
    fechadas: indicacoes.filter((ind) => ind.status === 'fechado').length,
    aprovadas: indicacoes.filter((ind) => ind.status === 'aprovado').length,
    recusadas: indicacoes.filter((ind) => ind.status === 'recusado').length,
    taxaConversao: indicacoes.length > 0
      ? ((indicacoes.filter((ind) => ind.status === 'aprovado').length / indicacoes.length) * 100).toFixed(1)
      : 0,
    valorTotal: indicacoes
      .filter((ind) => ind.status === 'aprovado')
      .reduce((sum, ind) => sum + (ind.valorRecompensa || 0), 0),
  };

  return (
    <Stack spacing={4} sx={{ p: { xs: 2, md: 3 } }}>

      {/* BANNER INDIQUE E GANHE - VERSÃO COMPACTA */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          height: { xs: 190, md: 300 },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'url(/assets/background/indiqueeganhe.webp)',
          backgroundSize: '100% 100%', // Imagem estica para preencher o Box conforme solicitado
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Escurecimento para leitura do texto
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 3, md: 5 }, width: '100%' }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2.2rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            INDIQUE & GANHE
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 2 }}>
            <Typography
              sx={{
                color: 'white',
                fontWeight: 'medium',
                fontSize: { xs: '0.75rem', md: '1rem' },
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              • Descontos na mensalidade
            </Typography>
            <Typography
              sx={{
                color: 'white',
                fontWeight: 'medium',
                fontSize: { xs: '0.75rem', md: '1rem' },
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              • Ou Pix na conta!
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* HEADER DA PÁGINA */}
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard de Indicações</Typography>
          <Typography variant="body2" color="text.secondary">Gerencie seus convites e acompanhe seus lucros</Typography>
        </Box>
        <Button variant="soft" color="inherit" onClick={buscarIndicacoes} sx={{ fontWeight: 'bold' }}>
          Atualizar Dados
        </Button>
      </Stack>

      {error && <Alert severity="error" variant="outlined" sx={{ borderRadius: 1.5 }}>{error}</Alert>}

      {/* CARDS DE ESTATÍSTICAS */}
      <Box
        display="grid"
        gap={2}
        gridTemplateColumns={{
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(4, 1fr)',
          md: 'repeat(7, 1fr)',
        }}
      >
        <MiniStatCard label="Total" value={stats.total} />
        <MiniStatCard label="Aprovadas" value={stats.aprovadas} color="success.main" />
        <MiniStatCard label="Fechadas" value={stats.fechadas} color="warning.main" />
        <MiniStatCard label="Taxa" value={`${stats.taxaConversao}%`} color="info.main" />
        <MiniStatCard label="Pendentes" value={stats.pendentes} color="text.disabled" />
        <MiniStatCard label="Recusadas" value={stats.recusadas} color="error.main" />
        <MiniStatCard
          label="Total Ganho"
          value={fCurrency(stats.valorTotal)}
          color="primary.main"
          highlight
        />
      </Box>

      <IndicacaoShareCard />

      {/* TABELA DE RESULTADOS */}
      <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3, borderBottom: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="h6">Histórico de Indicações</Typography>
          <TextField
            select
            size="small"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            sx={{ width: 220 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary' }}>Indicado</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Telefone</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Recompensa</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }} align="right">Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {indicacoesFiltradas().length > 0 ? (
                  indicacoesFiltradas().map((indicacao) => (
                    <IndicacaoTableRow key={indicacao._id} row={indicacao} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 8 }}>
                      <EmptyContent
                        filled
                        title="Nenhum dado encontrado"
                        description="Você ainda não possui indicações para os critérios selecionados."
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

// Componente de Card de Estatística
function MiniStatCard({ label, value, color = 'text.primary', highlight = false }) {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: highlight ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
        borderColor: highlight ? theme.palette.primary.main : theme.palette.divider,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <Typography variant="h5" sx={{ color, fontWeight: 800 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>
        {label}
      </Typography>
    </Paper>
  );
}