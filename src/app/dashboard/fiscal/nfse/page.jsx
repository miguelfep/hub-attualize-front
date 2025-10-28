'use client';

import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Stack,
  Autocomplete,
  Select,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  InputLabel,
  FormControl,
  TablePagination,
  Chip,
  Alert,
} from '@mui/material';
import dayjs from 'dayjs';

import { getClientes } from 'src/actions/clientes';
import { listarNotasFiscaisPorCliente } from 'src/actions/notafiscal';
import { fCurrency } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';

export default function DashboardFiscalPage() {
  const theme = useTheme();

  const [selectedCliente, setSelectedCliente] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [notas, setNotas] = useState({ totalRecords: 0, data: [] });
  const [refMonth, setRefMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingClientes(true);
        const res = await getClientes({status: true});
        setClientes(res);
      } catch (e) {
        setClientes([]);
      } finally {
        setLoadingClientes(false);
      }
    };
    load();
  }, []);

  const { filteredNotas, totalValorNotas, totalNotas } = useMemo(() => {
    const arr = Array.isArray(notas?.data) ? notas.data : [];
    let list = arr;
    const hasRange = Boolean(startDate || endDate);
    if (hasRange) {
      const start = startDate ? dayjs(startDate).startOf('day') : null;
      const end = endDate ? dayjs(endDate).endOf('day') : null;
      list = arr.filter((n) => {
        const dt = n.dataEmissao || n.createdAt || n.data;
        if (!dt) return true;
        const d = dayjs(dt);
        if (start && d.isBefore(start)) return false;
        if (end && d.isAfter(end)) return false;
        return true;
      });
    } else {
      list = arr.filter((n) => {
        const dt = n.dataEmissao || n.createdAt || n.data;
        if (!dt) return true;
        const ym = dayjs(dt).format('YYYY-MM');
        return ym === refMonth;
      });
    }
    const total = list.reduce((acc, n) => acc + Number(n?.valorServicos || n?.valor || 0), 0);
    return { filteredNotas: list, totalValorNotas: total, totalNotas: list.length };
  }, [notas, refMonth, startDate, endDate]);

  const fetchNotas = async () => {
    if (!selectedCliente) return;
    try {
      setLoading(true);
      const res = await listarNotasFiscaisPorCliente({
        clienteId: selectedCliente,
        page: page + 1,
        limit: rowsPerPage,
        status: status || undefined,
      });

    
      const data = res.data
      
      setNotas({
        totalRecords: data?.totalRecords ?? data?.total ?? 0, 
        data: data.notasFiscais
      });

    } catch (e) {
      setNotas({ totalRecords: 0, data: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCliente, status, page, rowsPerPage]);

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Fiscal - Notas Fiscais por Cliente
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Selecione um cliente para visualizar as notas emitidas e o faturamento.
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={clientes || []}
              loading={loadingClientes}
              getOptionLabel={(option) => `${option?.razaoSocial || ''}${option?.cpfCnpj ? ` - ${option.cpfCnpj}` : ''}`.trim()}
              isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
              value={(clientes || []).find((c) => c._id === selectedCliente) || null}
              onChange={(_, newValue) => { setSelectedCliente(newValue?._id || ''); setPage(0); }}
              renderInput={(params) => (
                <TextField {...params} label="Cliente" placeholder="Digite para buscar" />
              )}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="emitida">Emitida</MenuItem>
                <MenuItem value="autorizada">Autorizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="negada">Negada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="ref-month">Mês</InputLabel>
              <TextField id="ref-month" type="month" value={refMonth} onChange={(e) => { setRefMonth(e.target.value); setPage(0); }} />
            </FormControl>
          </Grid>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="inicio">Início</InputLabel>
              <TextField id="inicio" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} />
            </FormControl>
          </Grid>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="fim">Fim</InputLabel>
              <TextField id="fim" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} />
            </FormControl>
          </Grid>
        </Grid>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {totalNotas} nota(s) • Total: {fCurrency(totalValorNotas)}
          </Typography>
          {loading && (<Chip size="small" label="Carregando..." />)}
        </Stack>

        <Stack spacing={1.5}>
          {filteredNotas.map((n) => {
            const valor = n.valorServicos || n.valor || 0;
            const statusLabel = n.status || '-';
            const eNotasLabel = n.eNotasStatus || '-';
            const s = String(statusLabel || '').toLowerCase();
            const se = String(eNotasLabel || '').toLowerCase();
            const color = s === 'emitida' ? 'success' : s === 'cancelada' || s === 'negada' ? 'error' : 'default';
            const colorEnotas = se === 'autorizada' ? 'success' : se === 'cancelada' || se === 'negada' ? 'error' : 'default';
            const dataEmissao = n.dataEmissao || n.createdAt || n.data;
            const tomador = n.tomador || {};
            const servicoDesc = Array.isArray(n.servicos) && n.servicos.length ? n.servicos[0]?.descricao : (n.descricao || n.discriminacao);
            return (
              <Card key={n._id || n.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2">#{n.numeroNota || n.numero || '-'}</Typography>
                    {n.serie && (
                      <Chip size="small" variant="outlined" label={`Série ${n.serie}`} />
                    )}
                    <Chip size="small" label={statusLabel} color={color} />
                    <Chip size="small" label={`eNotas: ${eNotasLabel}`} color={colorEnotas} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{dataEmissao ? dayjs(dataEmissao).format('DD/MM/YYYY HH:mm') : '-'}</Typography>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <Stack spacing={0.25} flex={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tomador</Typography>
                    <Typography variant="body2">{tomador?.nome || '-'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{tomador?.cpfCnpj || ''}</Typography>
                  </Stack>
                  <Stack spacing={0.25} flex={2}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Serviço</Typography>
                    <Typography variant="body2">{servicoDesc || '-'}</Typography>
                    {n.codigoVerificacao && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cód. Verificação: {n.codigoVerificacao}</Typography>
                    )}
                  </Stack>
                  <Stack spacing={0.25} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Valores</Typography>
                    <Typography variant="subtitle2">{fCurrency(valor)}</Typography>
                    {!!n.valorIss && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>ISS: {fCurrency(n.valorIss)}</Typography>
                    )}
                  </Stack>
                </Stack>

                {(n.eNotasErro || n.motivoCancelamento) && (
                  <Alert severity={se === 'cancelada' || s === 'cancelada' ? 'warning' : 'error'} sx={{ mt: 1 }}>
                    {n.motivoCancelamento ? `Motivo: ${n.motivoCancelamento}` : n.eNotasErro}
                  </Alert>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {!!n.linkNota && n.linkNota !== 'Processando...' && (
                    <Button size="small" variant="outlined" href={n.linkNota} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:document-text-bold" />}>PDF</Button>
                  )}
                  {!!n.linkXml && (
                    <Button size="small" variant="outlined" href={n.linkXml} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:code-square-bold" />}>XML</Button>
                  )}
                </Stack>
              </Card>
            );
          })}
        </Stack>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={Number(notas.totalRecords || 0)}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </CardContent>
    </Card>
  );
}


