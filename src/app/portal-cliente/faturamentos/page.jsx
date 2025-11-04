'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useDebounce } from 'src/hooks/use-debounce';

import { toTitleCase } from 'src/utils/helper';

import { listarNotasFiscaisPorCliente } from 'src/actions/notafiscal';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';

export default function PortalFaturamentoPage() {
  const theme = useTheme();
  const { user } = useAuthContext();

  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva } = useEmpresa(userId);
  
  const clienteId = empresaAtiva;

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState([]);
  
  const [startDate, setStartDate] = useState(() => dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'));

  const [filtroNumeroNota, setFiltroNumeroNota] = useState('');
  const numeroNotaDebounce = useDebounce(filtroNumeroNota, 500);

  const { totalValorNotas, totalNotas } = useMemo(() => {
    const arr = Array.isArray(notas) ? notas : [];
    const total = arr.reduce((acc, n) => acc + Number(n?.valorServicos || n?.valor || 0), 0);
    return { totalValorNotas: total, totalNotas: arr.length };
  }, [notas]);

  const fetchNotas = async () => {
    if (!clienteId) return; 
    
    try {
      setLoading(true);
      const numeroNota = numeroNotaDebounce || undefined;
      const res = await listarNotasFiscaisPorCliente({
        clienteId,
        numeroNota,
        status: status || undefined,
        inicio: startDate || undefined,
        fim: endDate || undefined,
      });

      const { data } = res;
      setNotas(data?.notasFiscais || []);
    } catch (e) {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId, status, startDate, endDate, numeroNotaDebounce]);
  
  const handlePrevMonth = () => {
    const newStart = dayjs(startDate).subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    const newEnd = dayjs(startDate).subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
    setStartDate(newStart);
    setEndDate(newEnd);
  };
  
  const handleNextMonth = () => {
    const newStart = dayjs(startDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    const newEnd = dayjs(startDate).add(1, 'month').endOf('month').format('YYYY-MM-DD');
    setStartDate(newStart);
    setEndDate(newEnd);
  };


  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Minhas Notas Fiscais
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Visualize e baixe o PDF ou XML de todas suas notas fiscais.
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status da Nota</InputLabel>
              <Select label="Status da Nota" value={status} onChange={(e) => { setStatus(e.target.value); }}  >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="emitida">Emitida</MenuItem>
                <MenuItem value="autorizada">Autorizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="negada">Negada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField 
              label="Número da Nota"
              type="text"
              fullWidth
              value={filtroNumeroNota}
              onChange={(e) => setFiltroNumeroNota(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="Digite para buscar..."
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <TextField 
              label="De"
              type="date" 
              fullWidth
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <TextField 
              label="Até"
              type="date" 
              fullWidth
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ mb: 2 }} justifyContent="center">
          <Button 
            variant="outlined" 
            onClick={handlePrevMonth}
            startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
          >
            Mês Anterior
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleNextMonth}
            endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          >
            Próximo Mês
          </Button>
        </Stack>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {totalNotas} nota(s) encontradas • Total: {formatToCurrency(totalValorNotas)}
          </Typography>
          {loading && (<Chip size="small" label="Carregando..." />)}
        </Stack>

        <Stack spacing={1.5}>
          {notas.map((n) => {
            const valor = n.valorServicos || n.valor || 0;
            const statusLabel = n.status || '-';
            const eNotasLabel = n.eNotasStatus || '-';
            const s = String(statusLabel || '').toLowerCase();
            const se = String(eNotasLabel || '').toLowerCase();
            const color = s === 'emitida' ? 'success' : s === 'cancelada' || s === 'negada' ? 'error' : 'default';
            const colorEnotas = se === 'autorizada' ? 'success' : se === 'cancelada' || se === 'negada' ? 'error' : 'default';
            const dataEmissao = n.dataEmissao || n.createdAt || n.data;
            const servicoDesc = Array.isArray(n.servicos) && n.servicos.length ? n.servicos[0]?.descricao : (n.descricao || n.discriminacao);
            const isSieg = n.origem === 'sieg';
            const isEnotas = n.origem === 'enotas' || !n.origem;
            
            return (
              <Card key={n._id || n.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2">
                      Nota #{isSieg ? (n.siegNumero || n.numeroNota || '-') : (n.numeroNota || n.numero || '-')}
                    </Typography>
                    {n.serie && (
                      <Chip size="small" variant="outlined" label={`Série ${n.serie}`} />
                    )}
                    <Chip size="small" label={toTitleCase(statusLabel)} color={color} />
                    {isEnotas && (
                      <Chip size="small" label={`Status: ${eNotasLabel}`} color={colorEnotas} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{dataEmissao ? dayjs(dataEmissao).format('DD/MM/YYYY HH:mm') : '-'}</Typography>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
                  
                  <Stack spacing={0.25} flex={3}> 
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Serviço Prestado</Typography>
                    <Typography variant="body2">{servicoDesc || '-'}</Typography>
                    {n.codigoVerificacao && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cód. Verificação: {n.codigoVerificacao}</Typography>
                    )}
                  </Stack>
                  <Stack spacing={0.25} alignItems={{ xs: 'flex-start', md: 'flex-end' }} flex={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Valor Total</Typography>
                    <Typography variant="subtitle2">{formatToCurrency(valor)}</Typography>
                    {!!n.valorIss && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>ISS: {formatToCurrency(n.valorIss)}</Typography>
                    )}
                  </Stack>
                </Stack>

                {(n.eNotasErro || n.motivoCancelamento) && (
                  <Alert severity={se === 'cancelada' || s === 'cancelada' ? 'warning' : 'error'} sx={{ mt: 1.5 }}>
                    {n.motivoCancelamento ? `Motivo do Cancelamento: ${n.motivoCancelamento}` : `Observação: ${n.eNotasErro}`}
                  </Alert>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                  {!!n.linkNota && n.linkNota !== 'Processando...' && (
                    <Button size="small" variant="contained" href={n.linkNota} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:document-text-bold" />}>Baixar PDF</Button>
                  )}
                  {!!n.linkXml && (
                    <Button size="small" variant="outlined" href={n.linkXml} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:code-square-bold" />}>Baixar XML</Button>
                  )}
                  {isSieg && n.siegXmlBase64 && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<Iconify icon="solar:code-square-bold" />}
                      onClick={() => {
                        const blob = new Blob([atob(n.siegXmlBase64)], { type: 'application/xml' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `nota-${n.siegNumero || 'sieg'}.xml`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      Baixar XML
                    </Button>
                  )}
                </Stack>
              </Card>
            );
          })}
        </Stack>
        
      </CardContent>
    </Card>
  );
}