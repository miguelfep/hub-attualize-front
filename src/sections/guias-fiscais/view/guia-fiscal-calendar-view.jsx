'use client';

import { useMemo, useState } from 'react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

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

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetGuiasFiscaisPortal, downloadGuiaFiscalPortal } from 'src/actions/guias-fiscais';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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
      .map((guia) => ({
        id: guia._id,
        title: `${getTipoGuiaLabel(guia.tipoGuia)} - ${guia.nomeArquivo || 'Guia Fiscal'}`,
        start: guia.dataVencimento,
        backgroundColor: getStatusColor(guia.status),
        borderColor: getStatusColor(guia.status),
        extendedProps: {
          guia,
        },
      }));
  }, [data?.guias]);

  const handleEventClick = (info) => {
    const {guia} = info.event.extendedProps;
    setSelectedGuia(guia);
    dialog.onTrue();
  };

  const handleViewDetails = () => {
    if (selectedGuia) {
      router.push(paths.cliente.guiasFiscais.details(selectedGuia._id));
      dialog.onFalse();
    }
  };

  const handleDownload = async () => {
    if (selectedGuia) {
      try {
        await downloadGuiaFiscalPortal(selectedGuia._id, selectedGuia.nomeArquivo);
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
          { name: 'Guias Fiscais', href: paths.cliente.guiasFiscais.list },
          { name: 'Calendário' },
        ]}
        action={
          <Button
            component="a"
            href={paths.cliente.guiasFiscais.list}
            variant="outlined"
            startIcon={<Iconify icon="solar:list-bold" />}
          >
            Ver Lista
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Calendar
          weekends
          selectable
          events={events}
          eventClick={handleEventClick}
          initialView="dayGridMonth"
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
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

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Vencimento:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedGuia.dataVencimento ? fDate(selectedGuia.dataVencimento) : '-'}
                </Typography>
              </Stack>

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

              {selectedGuia.dadosExtraidos?.valor && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Valor:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    R$ {selectedGuia.dadosExtraidos.valor.toFixed(2)}
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
