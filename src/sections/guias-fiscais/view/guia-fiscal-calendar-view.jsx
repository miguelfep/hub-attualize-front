'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { downloadGuiaFiscalPortal } from 'src/utils/portal-guia-download';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetGuiasFiscaisPortal,
  navegarParaDetalheGuiaPortal,
} from 'src/actions/cliente-portal-guias-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { isGuia, getCompetencia, formatCompetencia } from '../utils';
import {
  getClienteVisualizouEm,
  clienteJaVisualizouDocumento,
  isDocumentoNovoParaClientePortal,
} from '../guia-documento-visualizacao';

// Lazy load FullCalendar e plugins para melhorar performance inicial
const CalendarWithPlugins = dynamic(
  async () => {
    const [
      { default: Calendar },
      { default: listPlugin },
      { default: dayGridPlugin },
      { default: interactionPlugin },
    ] = await Promise.all([
      import('@fullcalendar/react'),
      import('@fullcalendar/list'),
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/interaction'),
    ]);

    return function CalendarWrapper(props) {
      return (
        <Calendar
          {...props}
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        />
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Carregando calendário...
      </div>
    ),
  }
);

// ----------------------------------------------------------------------

const getStatusColor = (status) => {
  const statusMap = {
    pendente: '#ff9800',
    processado: '#4caf50',
    erro: '#f44336',
  };
  return statusMap[status] || '#757575';
};

const getTipoGuiaLabel = (tipo) => {
  const tipoMap = {
    DAS: 'DAS',
    EXTRATO_PGDAS: 'Extrato PGDAS',
    INSS: 'INSS',
    HOLERITE: 'Holerite',
    DARF: 'DARF',
    ICMS: 'ICMS',
    ISS: 'ISS',
    FGTS: 'FGTS',
    PIS: 'PIS',
    COFINS: 'COFINS',
  };
  return tipoMap[tipo] || tipo;
};

// ----------------------------------------------------------------------

export function GuiaFiscalCalendarView() {
  const theme = useTheme();
  const router = useRouter();

  const dialog = useBoolean();
  const [selectedGuia, setSelectedGuia] = useState(null);

  // Buscar todas as guias fiscais para o calendário
  const { data, isLoading } = useGetGuiasFiscaisPortal({
    limit: 1000, // Buscar muitas para o calendário
  });

  // Converter guias para eventos do calendário
  const events = useMemo(() => {
    const guias = data?.guias || [];
    return guias
      .filter((guia) => guia.dataVencimento)
      .map((guia) => {
        const novo = isDocumentoNovoParaClientePortal(guia);
        return {
          id: guia._id,
          title: `${getTipoGuiaLabel(guia.tipoGuia)} — ${guia.nomeArquivo || 'Documento'}${novo ? ' • novo' : ''}`,
          start: guia.dataVencimento,
          backgroundColor: getStatusColor(guia.status),
          borderColor: novo ? theme.palette.info.main : getStatusColor(guia.status),
          extendedProps: {
            guia,
          },
        };
      });
  }, [data?.guias, theme.palette.info.main]);

  const handleEventClick = (info) => {
    const {guia} = info.event.extendedProps;
    setSelectedGuia(guia);
    dialog.onTrue();
  };

  const handleViewDetails = async () => {
    if (!selectedGuia) return;
    await navegarParaDetalheGuiaPortal(router, selectedGuia._id);
    dialog.onFalse();
  };

  const handleDownload = async () => {
    if (selectedGuia) {
      try {
        await downloadGuiaFiscalPortal(selectedGuia._id, selectedGuia.nomeArquivo);
        setSelectedGuia((prev) =>
          prev
            ? { ...prev, lidoPeloUsuario: true, vistoEmUsuario: new Date().toISOString() }
            : prev
        );
        dialog.onFalse();
      } catch (error) {
        console.error('Erro ao fazer download:', error);
      }
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Calendário de Vencimentos"
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Meus Documentos', href: paths.cliente.guiasEDocumentos.list },
          { name: 'Calendário' },
        ]}
        action={
          <Button
            component="a"
            href={paths.cliente.guiasEDocumentos.list}
            variant="outlined"
            startIcon={<Iconify icon="solar:list-bold" />}
          >
            Meus Documentos
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <CalendarWithPlugins
          weekends
          selectable
          events={events}
          eventClick={handleEventClick}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek',
          }}
          locale="pt-br"
          height="auto"
        />
      </Card>

      <Dialog fullWidth maxWidth="sm" open={dialog.value} onClose={dialog.onFalse}>
        <DialogTitle>Detalhes da Guia Fiscal</DialogTitle>
        <DialogContent>
          {selectedGuia && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Arquivo:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedGuia.nomeArquivo || '-'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Tipo:
                </Typography>
                <Label variant="soft" color="info">
                  {getTipoGuiaLabel(selectedGuia.tipoGuia)}
                </Label>
              </Stack>

              {getCompetencia(selectedGuia) && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Competência:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCompetencia(getCompetencia(selectedGuia))}
                  </Typography>
                </Stack>
              )}

              {/* Vencimento - apenas para guias (não para documentos) */}
              {isGuia(selectedGuia.categoria) && selectedGuia.dataVencimento && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Vencimento:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {fDate(selectedGuia.dataVencimento)}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Label
                  variant="soft"
                  color={
                    selectedGuia.status === 'processado'
                      ? 'success'
                      : selectedGuia.status === 'erro'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {selectedGuia.status === 'processado'
                    ? 'Processado'
                    : selectedGuia.status === 'erro'
                      ? 'Erro'
                      : 'Pendente'}
                </Label>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Você já viu/baixou:
                </Typography>
                <Label
                  variant="soft"
                  color={clienteJaVisualizouDocumento(selectedGuia) ? 'success' : 'warning'}
                >
                  {clienteJaVisualizouDocumento(selectedGuia) ? 'Sim' : 'Não'}
                </Label>
              </Stack>
              {getClienteVisualizouEm(selectedGuia) && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Registrado em:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {fDate(getClienteVisualizouEm(selectedGuia))}
                  </Typography>
                </Stack>
              )}

              {selectedGuia.dadosExtraidos?.valor && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Valor:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {fCurrency(selectedGuia.dadosExtraidos.valor)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={dialog.onFalse}>Fechar</Button>
          <Button variant="outlined" onClick={handleDownload} startIcon={<Iconify icon="solar:download-bold" />}>
            Download
          </Button>
          <Button variant="contained" onClick={handleViewDetails} startIcon={<Iconify icon="solar:eye-bold" />}>
            Ver Detalhes
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
