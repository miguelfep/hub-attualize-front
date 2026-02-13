'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useIndicacoes } from 'src/hooks/use-indicacoes';

import { fCurrency } from 'src/utils/format-number';

import { EmptyContent } from 'src/components/empty-content';

import { IndicacaoTableRow } from './indicacao-table-row';
import { IndicacaoShareCard } from './indicacao-share-card';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'contato_iniciado', label: 'Contato Iniciado' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'fechado', label: 'Fechado - Aguardando Pagamento' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
];

// ----------------------------------------------------------------------

export function IndicacoesListView() {
  const { indicacoes, loading, buscarIndicacoes } = useIndicacoes();
  const [filtroStatus, setFiltroStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        await buscarIndicacoes();
      } catch (err) {
        console.error('Erro ao carregar indicações:', err);
        setError('Não foi possível carregar as indicações. Verifique sua conexão e tente novamente.');
      }
    };
    
    fetchData();
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
    <Stack spacing={3}>
      {/* Banner Indique e Ganhe */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: { xs: 180, md: 240 },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'url(/assets/background/indiqueeganhe.webp)',
          backgroundSize: 'contain', // Mostra a imagem completa sem cortar
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#667eea', // Cor de fundo para preencher espaços
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)', // Overlay escuro
            zIndex: 0,
          },
        }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            px: { xs: 3, md: 5 },
            py: 3,
            maxWidth: { xs: '100%', md: '60%' },
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '1.75rem', md: '3rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            INDIQUE & GANHE
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              mb: 1,
              fontSize: { xs: '1rem', md: '1.25rem' },
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            Descontos na mensalidade
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white',
              fontSize: { xs: '1rem', md: '1.25rem' },
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            ou Pix na conta!
          </Typography>
        </Box>
      </Box>

      {/* Header */}
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

      {/* Alerta de erro */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          <AlertTitle>Erro ao carregar indicações</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Cards de Estatísticas - Todos em uma linha */}
      <Grid container spacing={2}>
        <Grid xs={6} sm={4} md={2}>
          <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4">{stats.total}</Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Card>
        </Grid>

        <Grid xs={6} sm={4} md={2}>
          <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="success.main">
              {stats.aprovadas}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Aprovadas
            </Typography>
          </Card>
        </Grid>

        <Grid xs={6} sm={4} md={2}>
          <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="warning.main">
              {stats.fechadas}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fechadas
            </Typography>
          </Card>
        </Grid>

        <Grid xs={6} sm={4} md={2}>
          <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="info.main">
              {stats.taxaConversao}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Taxa
            </Typography>
          </Card>
        </Grid>

        <Grid xs={6} sm={4} md={2}>
          <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="warning.main">
              {stats.pendentes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pendentes
            </Typography>
          </Card>
        </Grid>

        <Grid xs={6} sm={4} md={2}>
          <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="error.main">
              {stats.recusadas}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recusadas
            </Typography>
          </Card>
        </Grid>

        <Grid xs={6} sm={4} md={2}>
          <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="primary.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {fCurrency(stats.valorTotal)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Valor Ganho
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Card de Compartilhamento */}
      <IndicacaoShareCard />

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
