'use client';

import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Stack,
  Alert,
  Skeleton,
  TextField,
  Typography,
  CardHeader,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { buscarRelatorioNrr } from 'src/actions/financeiro-relatorios';

import NrrKpiCard from './NrrKpiCard';
import NrrDetalhesTable from './NrrDetalhesTable';
import NrrWaterfallChart from './NrrWaterfallChart';
import NrrContadoresDonut from './NrrContadoresDonut';
import NrrComponentesCards from './NrrComponentesCards';

// ----------------------------------------------------------------------

export default function RelatorioNrr() {
  const [modo, setModo] = useState('mes'); // 'mes' | 'intervalo'
  const [mes, setMes] = useState(dayjs().format('YYYY-MM'));
  const [dataInicio, setDataInicio] = useState(dayjs().startOf('year').format('YYYY-MM-DD'));
  const [dataFim, setDataFim] = useState(dayjs().format('YYYY-MM-DD'));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params =
        modo === 'mes'
          ? { mes, detalhado: true }
          : { dataInicio, dataFim, detalhado: true };

      const res = await buscarRelatorioNrr(params);
      setData(res);
    } catch (err) {
      console.error('Erro ao buscar relatório de NRR:', err);
      const msg = typeof err === 'string' ? err : err?.message || 'Não foi possível carregar o relatório de NRR.';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [modo, mes, dataInicio, dataFim]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModoChange = (_event, novoModo) => {
    if (novoModo) setModo(novoModo);
  };

  const renderSeletor = (
    <Card sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h6">Relatório de NRR</Typography>
          <Typography variant="body2" color="text.secondary">
            Retenção de receita da base existente (coorte fixada no início do período).
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <ToggleButtonGroup size="small" exclusive value={modo} onChange={handleModoChange}>
            <ToggleButton value="mes">Mês</ToggleButton>
            <ToggleButton value="intervalo">Intervalo</ToggleButton>
          </ToggleButtonGroup>

          {modo === 'mes' ? (
            <TextField
              type="month"
              size="small"
              label="Mês de referência"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          ) : (
            <Stack direction="row" spacing={1}>
              <TextField
                type="date"
                size="small"
                label="Início"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                size="small"
                label="Fim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>{renderSeletor}</Grid>
        <Grid xs={12} md={4}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
        <Grid xs={12} md={8}>
          <Skeleton variant="rounded" height={220} />
        </Grid>
        <Grid xs={12}>
          <Skeleton variant="rounded" height={360} />
        </Grid>
      </Grid>
    );
  }

  const resumo = data?.resumo;
  const contadores = data?.contadores;
  const detalhes = data?.detalhes ?? [];
  const semBase = !resumo || resumo.receitaInicial === 0 || resumo.nrr === null;

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>{renderSeletor}</Grid>

      {error && (
        <Grid xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {!error && (
        <>
          {semBase && (
            <Grid xs={12}>
              <Alert severity="info">
                Sem base recorrente (coorte vazia) no período selecionado — NRR/GRR não aplicáveis.
              </Alert>
            </Grid>
          )}

          <Grid xs={12} md={4}>
            <NrrKpiCard resumo={resumo} fonte={data?.fonte} />
          </Grid>

          <Grid xs={12} md={8}>
            <NrrWaterfallChart resumo={resumo} height={300} />
          </Grid>

          <Grid xs={12}>
            <Card>
              <CardHeader title="Componentes (R$)" />
              <Box sx={{ p: 2 }}>
                <NrrComponentesCards resumo={resumo} />
              </Box>
            </Card>
          </Grid>

          <Grid xs={12} md={4}>
            <NrrContadoresDonut contadores={contadores} />
          </Grid>

          <Grid xs={12} md={8}>
            <NrrDetalhesTable detalhes={detalhes} />
          </Grid>
        </>
      )}
    </Grid>
  );
}
