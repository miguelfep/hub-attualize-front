'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';

import { useTheme } from '@mui/material/styles';
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineConnector,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Box,
  Card,
  Chip,
  Link,
  Stack,
  alpha,
  Button,
  Dialog,
  Typography,
  IconButton,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useHistoricoCliente } from 'src/routes/hooks/use-historico-cliente';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { InvoicePDF } from '../invoice/invoice-pdf';

const baseUrl = process.env.NEXT_PUBLIC_FRONT_URL || 'https://attualize.com.br/';

const formatarEventoTimeline = (eventoApi) => {
  const { id, status, invoiceNumber, total, motivoPerda } = eventoApi;

  let title = `Orçamento #${invoiceNumber}`;
  let description = `Proposta no valor de ${formatToCurrency(total)}`;
  let icon = <Iconify icon="mdi:file-document-outline" width={24} />;
  let dotColor = 'primary';
  let chipLabel = status.toUpperCase();
  const chipVariant = 'soft';

  switch (status) {
    case 'pago':
      title = `Fatura Paga #${invoiceNumber}`;
      description = `Pagamento recebido no valor de ${formatToCurrency(total)}`;
      icon = <Iconify icon="solar:bill-check-bold" width={24} />;
      dotColor = 'success';
      chipLabel = 'PAGO';
      break;
    case 'aprovada':
      title = `Orçamento Aprovado #${invoiceNumber}`;
      description = `Proposta aprovada no valor de ${formatToCurrency(total)}`;
      icon = <Iconify icon="solar:like-bold" width={24} />;
      dotColor = 'info';
      chipLabel = 'APROVADO';
      break;
    case 'perdida':
      title = `Orçamento Recusado #${invoiceNumber}`;
      description = `Motivo: ${motivoPerda || 'Não informado'}`;
      icon = <Iconify icon="solar:close-circle-bold" width={24} />;
      dotColor = 'error';
      chipLabel = 'RECUSADO';
      break;
    default:
       chipLabel = 'ORÇAMENTO';
       dotColor = 'warning';
      break;
  }

  return { id, title, description, icon, dotColor, chipLabel, chipVariant };
};

export function HistoricoComercialCliente({ cliente }) {
  const theme = useTheme();
  const view = useBoolean();
  const { historico, historicoIsLoading: isLoading, historicoError: error } = useHistoricoCliente(cliente?._id);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const eventosFiltrados = useMemo(() => {
    if (!historico) return [];
    if (filtroStatus === 'todos') return historico;
    return historico.filter((evento) => evento.status === filtroStatus);
  }, [historico, filtroStatus]);

  const handleViewPdf = (invoiceData) => {
    const invoiceWithClientData = {
      ...invoiceData,
      cliente,
      items: invoiceData.items || [],
    };
    setSelectedInvoice(invoiceWithClientData);
    view.onTrue();
  }

  const renderFiltros = (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
      {[
        { label: 'Todos', value: 'todos', color: 'primary' },
        { label: 'Pagos', value: 'pago', color: 'success' },
        { label: 'Aprovados', value: 'aprovada', color: 'info' },
        { label: 'Recusados', value: 'perdida', color: 'error' },
      ].map((filtro) => (
        <Chip
          key={filtro.value}
          label={filtro.label}
          variant={filtroStatus === filtro.value ? 'filled' : 'outlined'}
          color={filtro.color}
          onClick={() => setFiltroStatus(filtro.value)}
          sx={{
            cursor: 'pointer',
            fontWeight: 600,
            transition: theme.transitions.create(['background-color', 'box-shadow']),
            '&:hover': {
              boxShadow: theme.customShadows.z8,
            },
          }}
        />
      ))}
    </Stack>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Carregando histórico...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            minHeight: 400,
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.main, 0.08),
            border: `1px dashed ${alpha(theme.palette.error.main, 0.24)}`,
          }}
        >
          <Iconify icon="solar:danger-bold" width={40} color="error.main" />
          <Typography variant="h6" sx={{ mt: 1, color: 'error.main', fontWeight: 'bold' }}>
            Erro ao Carregar Histórico
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Não foi possível buscar os dados. Tente novamente mais tarde.
          </Typography>
        </Stack>
      );
    }

    if (!eventosFiltrados || eventosFiltrados.length === 0) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400, p: 3 }}>
          <Iconify icon="solar:folder-with-files-line-duotone" width={80} color="text.disabled" />
          <Typography variant="h6" sx={{ mt: 1, color: 'text.secondary' }}>
            Nenhum Evento Encontrado
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Não há registros para o filtro selecionado.
          </Typography>
        </Stack>
      );
    }

    return (
      <Box
        sx={{
          maxHeight: '65vh',
          overflowY: 'auto',
          pr: { xs: 1, md: 2 },
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.grey[500], 0.16),
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.grey[500], 0.32),
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: alpha(theme.palette.grey[500], 0.48),
          },
        }}
      >
        <Timeline position="alternate" sx={{ [`& .MuiTimelineItem-root::before`]: { flex: { xs: 0, md: 0.2 } } }}>
          {eventosFiltrados.map((evento, index) => {
            const item = formatarEventoTimeline(evento);
            return (
              <TimelineItem key={item.id} sx={{ minHeight: 100 }}>
                <TimelineOppositeContent
                  color="text.secondary"
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    py: 2.5,
                    pr: 3,
                    textAlign: 'right',
                  }}
                >
                  <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {format(new Date(evento.date), 'dd MMM yyyy', { locale: ptBR })}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {format(new Date(evento.date), 'HH:mm', { locale: ptBR })}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot color={item.dotColor} variant="filled" sx={{ p: 1.25 }}>
                    {item.icon}
                  </TimelineDot>
                  {index < eventosFiltrados.length - 1 && <TimelineConnector sx={{ bgcolor: 'divider' }} />}
                </TimelineSeparator>

                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: 'background.neutral',
                      boxShadow: 'none',
                      borderLeft: `4px solid ${theme.palette[item.dotColor].main}`,
                      transition: theme.transitions.create(['box-shadow', 'transform']),
                      '&:hover': {
                        boxShadow: theme.customShadows.z16,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                            {item.title}
                          </Typography>
                          <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'info.main' } }} onClick={() => handleViewPdf(evento)}>
                              <Iconify icon="solar:eye-bold" width={16} />
                          </IconButton>
                          <Link href={`${baseUrl}dashboard/invoice/${item.id}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                              <Iconify icon="solar:arrow-right-up-outline" width={16} />
                            </IconButton>
                          </Link>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={item.chipLabel}
                        color={item.dotColor}
                        variant={item.chipVariant}
                        size="small"
                        sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'flex-start' }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.disabled" sx={{ display: { xs: 'block', md: 'none' }, mt: 1.5, pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
                      {format(new Date(evento.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </Typography>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </Box>
    );
  };

  return (
    <>
      <SimplePaper sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
        <Stack
          spacing={2}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Histórico Comercial
          </Typography>
          {renderFiltros}
        </Stack>

        {renderContent()}
      </SimplePaper>

      <Dialog fullScreen open={view.value}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5, bgcolor: 'background.default' }}>
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Fechar
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              {selectedInvoice && <InvoicePDF invoice={selectedInvoice} currentStatus={selectedInvoice.status} />}
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
