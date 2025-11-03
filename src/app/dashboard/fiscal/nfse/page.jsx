'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
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
  Dialog,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { getClientes } from 'src/actions/clientes';
import { cancelarNotaFiscal, listarNotasFiscaisPorCliente } from 'src/actions/notafiscal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// Helper para formatar tipo de nota
const formatTipoNota = (tipo) => {
  const tipos = {
    'nfse': 'NFS-e',
    'nfc': 'NF-C',
    'nfe': 'NF-e',
    'cte': 'CT-e',
    'mdfe': 'MDF-e',
    'nfce': 'NFC-e',
  };
  return tipos[String(tipo || '').toLowerCase()] || tipo?.toUpperCase() || 'NFS-e';
};

// Helper para cor do tipo de nota
const getTipoNotaColor = (tipo) => {
  const tipos = {
    'nfse': 'primary',
    'nfc': 'secondary',
    'nfe': 'info',
    'cte': 'warning',
    'mdfe': 'success',
    'nfce': 'error',
  };
  return tipos[String(tipo || '').toLowerCase()] || 'default';
};

export default function DashboardFiscalPage() {
  const theme = useTheme();

  const [selectedCliente, setSelectedCliente] = useState('');
  const [status, setStatus] = useState('');
  const [tipoNota, setTipoNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [notas, setNotas] = useState([]);
  
  // Datas: primeiro dia do mês atual até hoje
  const [startDate, setStartDate] = useState(() => dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  
  // Modal de cancelamento
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [notaToCancel, setNotaToCancel] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [dataCancelamento, setDataCancelamento] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingClientes(true);
        const res = await getClientes({status: true, tipoContato: 'cliente'});
        setClientes(res);
      } catch (e) {
        setClientes([]);
      } finally {
        setLoadingClientes(false);
      }
    };
    load();
  }, []);

  const { totalValorNotas, totalNotas, notasFiltradas } = useMemo(() => {
    let arr = Array.isArray(notas) ? notas : [];
    
    // Filtrar por tipo de nota se selecionado
    if (tipoNota) {
      arr = arr.filter((n) => {
        const tipo = (n.tipoNota || 'nfse').toLowerCase();
        return tipo === tipoNota.toLowerCase();
      });
    }
    
    const total = arr.reduce((acc, n) => acc + Number(n?.valorServicos || n?.valor || 0), 0);
    return { totalValorNotas: total, totalNotas: arr.length, notasFiltradas: arr };
  }, [notas, tipoNota]);

  const fetchNotas = async () => {
    if (!selectedCliente) return;
    try {
      setLoading(true);
      const res = await listarNotasFiscaisPorCliente({
        clienteId: selectedCliente,
        status: status || undefined,
        inicio: startDate || undefined,
        fim: endDate || undefined,
      });

      const {data} = res;
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
  }, [selectedCliente, status, startDate, endDate]);
  
  // Navegação mensal
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
  
  const handleCurrentMonth = () => {
    setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'));
    setEndDate(dayjs().format('YYYY-MM-DD'));
  };
  
  const handleOpenCancelDialog = (nota) => {
    setNotaToCancel(nota);
    setMotivoCancelamento('Nota cancelada manualmente pelo administrador');
    setDataCancelamento(dayjs().format('YYYY-MM-DD'));
    setCancelDialogOpen(true);
  };
  
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setNotaToCancel(null);
    setMotivoCancelamento('');
    setDataCancelamento(dayjs().format('YYYY-MM-DD'));
  };
  
  const handleConfirmCancel = async () => {
    if (!notaToCancel) return;
    if (!motivoCancelamento.trim()) {
      toast.error('Informe o motivo do cancelamento');
      return;
    }
    try {
      setCanceling(true);
      const dataISO = dayjs(dataCancelamento).toISOString();
      await cancelarNotaFiscal(notaToCancel._id || notaToCancel.id, motivoCancelamento, dataISO);
      toast.success('Nota fiscal cancelada com sucesso!');
      handleCloseCancelDialog();
      await fetchNotas(); // Recarrega a lista
    } catch (error) {
      const msg = error?.response?.data?.message || 'Erro ao cancelar nota fiscal';
      toast.error(msg);
    } finally {
      setCanceling(false);
    }
  };

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
        {/* Linha 1: Cliente, Status e Tipo */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={4}>
            <Autocomplete
              fullWidth
              options={clientes || []}
              loading={loadingClientes}
              getOptionLabel={(option) => `${option?.razaoSocial || ''}${option?.cpfCnpj ? ` - ${option.cpfCnpj}` : ''}`.trim()}
              isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
              value={(clientes || []).find((c) => c._id === selectedCliente) || null}
              onChange={(_, newValue) => { setSelectedCliente(newValue?._id || ''); }}
              renderInput={(params) => (
                <TextField {...params} label="Cliente" placeholder="Digite para buscar" />
              )}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="emitida">Emitida</MenuItem>
                <MenuItem value="autorizada">Autorizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="negada">Negada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Nota</InputLabel>
              <Select label="Tipo de Nota" value={tipoNota} onChange={(e) => { setTipoNota(e.target.value); }}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="nfse">NFS-e (Serviço)</MenuItem>
                <MenuItem value="nfe">NF-e (Produto)</MenuItem>
                <MenuItem value="nfc">NF-C (Consumidor)</MenuItem>
                <MenuItem value="nfce">NFC-e (Eletrônica)</MenuItem>
                <MenuItem value="cte">CT-e (Transporte)</MenuItem>
                <MenuItem value="mdfe">MDF-e (Manifesto)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Filtros Ativos */}
        {(status || tipoNota) && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }} useFlexGap>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              Filtros ativos:
            </Typography>
            {status && (
              <Chip
                size="small"
                label={`Status: ${status}`}
                onDelete={() => setStatus('')}
                color="primary"
                variant="outlined"
              />
            )}
            {tipoNota && (
              <Chip
                size="small"
                label={`Tipo: ${formatTipoNota(tipoNota)}`}
                onDelete={() => setTipoNota('')}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        )}
        
        {/* Linha 2: Navegação mensal e período */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handlePrevMonth}
            startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
            sx={{ minWidth: 150 }}
          >
            Mês Anterior
          </Button>
          <TextField 
            label="Início"
            type="date" 
            size="small"
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField 
            label="Fim"
            type="date" 
            size="small"
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <Button 
            variant="outlined" 
            onClick={handleNextMonth}
            endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
            sx={{ minWidth: 150 }}
          >
            Próximo Mês
          </Button>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {totalNotas} nota(s) • Total: {fCurrency(totalValorNotas)}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {(status || tipoNota) && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:refresh-linear" />}
                onClick={() => {
                  setStatus('');
                  setTipoNota('');
                }}
              >
                Limpar Filtros
              </Button>
            )}
            {loading && (<Chip size="small" label="Carregando..." />)}
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          {notasFiltradas.map((n) => {
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
            const isSieg = n.origem === 'sieg';
            const isEnotas = n.origem === 'enotas' || !n.origem; // fallback para notas antigas
            const tipoNotaLabel = formatTipoNota(n.tipoNota);
            const tipoNotaColor = getTipoNotaColor(n.tipoNota);
            
            return (
              <Card key={n._id || n.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip 
                      size="small" 
                      label={tipoNotaLabel}
                      color={tipoNotaColor}
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      size="small" 
                      label={isSieg ? 'SIEG' : 'eNotas'} 
                      color={isSieg ? 'secondary' : 'primary'} 
                      variant="outlined"
                    />
                    <Typography variant="subtitle2">
                      #{isSieg ? (n.siegNumero || n.numeroNota || '-') : (n.numeroNota || n.numero || '-')}
                    </Typography>
                    {n.serie && (
                      <Chip size="small" variant="outlined" label={`Série ${n.serie}`} />
                    )}
                    {isSieg && n.siegTipo && (
                      <Chip size="small" variant="outlined" label={n.siegTipo === 'entrada' ? 'Entrada' : 'Saída'} />
                    )}
                    <Chip size="small" label={statusLabel} color={color} />
                    {isEnotas && (
                      <Chip size="small" label={`eNotas: ${eNotasLabel}`} color={colorEnotas} />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{dataEmissao ? dayjs(dataEmissao).format('DD/MM/YYYY HH:mm') : '-'}</Typography>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <Stack spacing={0.25} flex={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {isSieg && n.siegTipo === 'entrada' ? 'Emitente' : 'Tomador'}
                    </Typography>
                    <Typography variant="body2">{tomador?.nome || '-'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {tomador?.cpfCnpj || (isSieg && n.siegCnpjEmitente) || ''}
                    </Typography>
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

                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                  {!!n.linkNota && n.linkNota !== 'Processando...' && (
                    <Button size="small" variant="outlined" href={n.linkNota} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:document-text-bold" />}>PDF</Button>
                  )}
                  {!!n.linkXml && (
                    <Button size="small" variant="outlined" href={n.linkXml} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:code-square-bold" />}>XML</Button>
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
                      XML Sieg
                    </Button>
                  )}
                  {s !== 'cancelada' && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      startIcon={<Iconify icon="solar:close-circle-bold" />}
                      onClick={() => handleOpenCancelDialog(n)}
                    >
                      Cancelar
                    </Button>
                  )}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      </CardContent>
      
      {/* Modal de Cancelamento */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:close-circle-bold" width={24} sx={{ color: 'error.main' }} />
            <Typography variant="h6">Cancelar Nota Fiscal</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Esta ação cancelará a nota fiscal no sistema. Certifique-se de cancelar também na Prefeitura/eNotas se necessário.
            </Alert>
            
            {notaToCancel && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nota #{notaToCancel.numeroNota || notaToCancel.siegNumero || '-'}
                </Typography>
                <Typography variant="body2">
                  {notaToCancel.tomador?.nome || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Valor: {fCurrency(notaToCancel.valorServicos || notaToCancel.valor || 0)}
                </Typography>
              </Box>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo do Cancelamento"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
            />
            
            <TextField
              fullWidth
              type="date"
              label="Data do Cancelamento"
              value={dataCancelamento}
              onChange={(e) => setDataCancelamento(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} variant="outlined">
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            loading={canceling}
            startIcon={<Iconify icon="solar:close-circle-bold" />}
          >
            Confirmar Cancelamento
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}


