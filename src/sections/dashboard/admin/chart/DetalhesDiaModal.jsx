import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Card,
  Grid,
  Stack,
  Dialog,
  CardHeader,
  Typography,
  IconButton,
  CardContent,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import { toTitleCase } from 'src/utils/helper';
import { categoriasDespesas } from 'src/utils/constants/categorias';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

import DetalheLancamentoDrawer from './DetalheLancamentoDrawer';


const getCategoriaNome = (categoriaId) => {
  const categoria = categoriasDespesas.find(cat => cat._id === categoriaId);
  return categoria ? categoria.nome : 'N/A';
};

const receitaStatusConfig = {
  'PAGO': { color: 'success.main', chipColor: 'success' },
  'pago': { color: 'success.main', chipColor: 'success' },
  'RECEBIDO': { color: 'success.main', chipColor: 'success' },
  'A_RECEBER': { color: 'warning.main', chipColor: 'warning' },
  'EMABERTO': { color: 'warning.main', chipColor: 'warning' },
  'PROCESSANDO': { color: 'warning.main', chipColor: 'warning' },
  'aprovada': { color: 'warning.main', chipColor: 'warning' },
  'VENCIDO': { color: 'error.main', chipColor: 'error' },
  'ATRASADO': { color: 'error.main', chipColor: 'error' },
  'CANCELADO': { color: 'error.main', chipColor: 'error' },
  'perdida': { color: 'error.main', chipColor: 'error' },
  'orcamento': { color: 'text.secondary', chipColor: 'default' },
};

const despesaStatusConfig = {
  'PAGO': { color: 'text.primary', chipColor: 'success' },
  'CANCELADO': { color: 'success.main', chipColor: 'success' },
  'PENDENTE': { color: 'warning.main', chipColor: 'warning' },
  'AGENDADO': { color: 'info.main', chipColor: 'info' },
};

// Tamanho do Drawer em DetalheLancamentoDrawer.jsx
const DRAWER_WIDTH = 420;

const getReceitaStatusStyle = (status) =>
  receitaStatusConfig[status] || { color: 'text.primary', chipColor: 'default' };

const getDespesaStatusStyle = (status) =>
  despesaStatusConfig[status] || { color: 'text.primary', chipColor: 'default' };

export default function DetalhesDiaModal({ isOpen, onClose, data }) {
  const theme = useTheme();
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const { totalReceitas, totalDespesas, saldoDia } = useMemo(() => {
    const receitas = data?.receitas || [];
    const despesas = data?.despesas || [];

    const receitasSum = receitas.reduce((sum, item) => sum + (item.valor || item.total), 0);
    const despesasSum = despesas.reduce((sum, item) => sum + item.valor, 0);

    return {
      totalReceitas: receitasSum,
      totalDespesas: despesasSum,
      saldoDia: receitasSum - despesasSum,
    };
  }, [data]);

  if (!data) return null;

  const { date, receitas, despesas } = data;

  const renderReceitaItem = (item) => {
    const isInvoice = item.tipoLancamento === 'invoice';
    const titulo = isInvoice ? (item.descricao || `Venda #${item.invoiceNumber}`) : (item.contrato?.titulo || 'Cobrança');
    const valor = item.valor || item.total;
    const statusStyle = getReceitaStatusStyle(item?.status);

    return (
      <ListItemButton
        key={item._id}
        onClick={() => setItemSelecionado(item)}
        sx={{
          py: 1.5,
          px: 2,
          borderRadius: 2,
          mb: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[1]
          }
        }}
      >
        <ListItemText
          primary={
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
              {titulo}
            </Typography>
          }
          secondary={
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={toTitleCase(item?.status)}
                size="small"
                variant="outlined"
                color={statusStyle.chipColor}
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
              {isInvoice ? (
                <Chip
                  label={toTitleCase(item?.formaPagamento) || 'N/A'}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ height: 24, fontSize: '0.75rem' }}
                />
              ) : (
                <Chip
                  label={toTitleCase(item?.contrato?.tipoContrato) || 'N/A'}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    ...(item?.contrato?.tipoContrato === 'normal'
                      ? { color: 'info.main', borderColor: 'info.main' }
                      : { color: '#8257e0', borderColor: '#8257e0' }
                    ),
                  }}
                />
              )}
            </Stack>
          }
          sx={{ mr: 2 }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: statusStyle.color,
            whiteSpace: 'nowrap',
            fontSize: '1rem'
          }}
        >
          + {formatToCurrency(valor)}
        </Typography>
      </ListItemButton>
    );
  };

  const renderDespesaItem = (item) => {
    const statusStyle = getDespesaStatusStyle(item?.status);
    const corValor = item.status === 'CANCELADO' ? 'success.main' : 'error.main';

    return (
      <ListItemButton
        key={item._id}
        onClick={() => setItemSelecionado(item)}
        sx={{
          py: 1.5,
          px: 2,
          borderRadius: 2,
          mb: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[1]
          }
        }}
      >
        <ListItemText
          primary={
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
              {item?.descricao || 'Despesa'}
            </Typography>
          }
          secondary={
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip
                label={getCategoriaNome(item?.categoria)}
                size="small"
                variant="outlined"
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
              <Chip
                label={toTitleCase(item?.status)}
                size="small"
                variant="outlined"
                color={statusStyle.chipColor}
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
              <Chip
                label={toTitleCase(item?.tipo) || 'N/A'}
                size="small"
                variant="outlined"
                color="info"
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
              {item?.tipo === 'RECORRENTE' && item?.parcelas > 0 && (
                <Chip
                  label={`${item.parcelas}x`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ height: 24, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          }
          sx={{ mr: 2 }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: corValor,
            whiteSpace: 'nowrap',
            fontSize: '1rem'
          }}
        >
          - {formatToCurrency(item.valor)}
        </Typography>
      </ListItemButton>
    );
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            maxHeight: '90vh',

            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(itemSelecionado && {
              width: `calc(100% - ${DRAWER_WIDTH}px)`,
              mr: `${DRAWER_WIDTH}px`,
            })
          }
        }}
      >
        <Card sx={{ border: 0, boxShadow: 'none' }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:calendar-bold" width={24} />
                <Typography variant="h5" fontWeight="600">
                  Detalhes do Dia: {dayjs(date).format('DD/MM/YYYY')}
                </Typography>
              </Stack>
            }
            action={
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  icon={<Iconify icon="solar:arrow-up-bold" width={16} />}
                  label={formatToCurrency(totalReceitas)}
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 500, mb: { xs: 1, sm: 0 } }}
                />
                <Chip
                  icon={<Iconify icon="solar:arrow-down-bold" width={16} />}
                  label={formatToCurrency(totalDespesas)}
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 500, mb: { xs: 1, sm: 0 } }}
                />
                <Chip
                  icon={<Iconify icon={saldoDia >= 0 ? "solar:trending-up-bold" : "solar:trending-down-bold"} width={16} />}
                  label={formatToCurrency(saldoDia)}
                  color={saldoDia >= 0 ? "success" : "error"}
                  variant="filled"
                  sx={{ fontWeight: 700, mb: { xs: 1, sm: 0 } }}
                />
                <IconButton
                  onClick={onClose}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <Iconify icon="solar:close-circle-bold" width={24} />
                </IconButton>
              </Stack>
            }
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
              py: 3,
              px: 3
            }}
          />
          <CardContent sx={{ flexGrow: 1, overflow: 'hidden', p: 0, '&:last-child': { pb: 0 } }}>
            <Grid container spacing={0} sx={{ height: '100%' }}>
              <Grid xs={12} md={6} sx={{ borderRight: { md: `1px solid ${theme.palette.divider}` } }}>
                <Box sx={{
                  p: 2,
                  background: alpha(theme.palette.success.main, 0.03),
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:arrow-up-bold" width={20} color="success.main" />
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      Receitas
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ maxHeight: '50vh', overflow: 'auto', p: 2 }}>
                  {receitas.map(renderReceitaItem)}
                </Box>
              </Grid>
              <Grid xs={12} md={6}>
                <Box sx={{
                  p: 2,
                  background: alpha(theme.palette.error.main, 0.03),
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:arrow-down-bold" width={20} color="error.main" />
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      Despesas
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ maxHeight: '50vh', overflow: 'auto', p: 2 }}>
                  {despesas.map(renderDespesaItem)}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Dialog>

      <DetalheLancamentoDrawer
        item={itemSelecionado}
        onClose={() => setItemSelecionado(null)}
        statusConfigs={{ getReceitaStatusStyle, getDespesaStatusStyle }}
      />
    </>
  );
}
