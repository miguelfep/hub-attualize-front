'use client';

import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRef, useMemo, useCallback } from 'react';
import interactionPlugin from '@fullcalendar/interaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetGuiasFiscaisPortal } from 'src/actions/guias-fiscais';

import { Iconify } from 'src/components/iconify';

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
    DARF: 'DARF',
    ICMS: 'ICMS',
    ISS: 'ISS',
    PIS: 'PIS',
    COFINS: 'COFINS',
    INSS: 'INSS',
    FGTS: 'FGTS',
    HOLERITE: 'Holerite',
    EXTRATO_FOLHA_PAGAMENTO: 'Extrato Folha',
  };
  return tipoMap[tipo] || tipo;
};

// ----------------------------------------------------------------------

export function GuiaFiscalCalendarWidget() {
  const router = useRouter();
  const calendarRef = useRef(null);

  // Buscar guias fiscais para o calendário (apenas as próximas)
  const { data, isLoading } = useGetGuiasFiscaisPortal({
    limit: 50,
    status: 'processado',
  });

  // Converter guias para eventos do calendário (apenas com data de vencimento)
  const events = useMemo(() => {
    const guias = data?.guias || [];
    return guias
      .filter((guia) => guia.dataVencimento)
      .slice(0, 20) // Limitar a 20 eventos para não sobrecarregar
      .map((guia) => ({
        id: guia._id,
        title: getTipoGuiaLabel(guia.tipoGuia),
        start: guia.dataVencimento,
        backgroundColor: getStatusColor(guia.statusProcessamento || guia.status),
        borderColor: getStatusColor(guia.statusProcessamento || guia.status),
        extendedProps: {
          guia,
        },
      }));
  }, [data?.guias]);

  const handleEventClick = (info) => {
    router.push(paths.cliente.guiasFiscais.details(info.event.id));
  };

  const handleViewAll = () => {
    router.push(paths.cliente.guiasFiscais.calendar);
  };

  const handlePrevMonth = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
    }
  }, []);

  const handleNextMonth = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
    }
  }, []);

  const handleToday = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
    }
  }, []);

  if (isLoading) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando calendário...
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 1.5, height: '200px', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
            Vencimentos
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={handleViewAll}
            endIcon={<Iconify icon="eva:arrow-forward-fill" width={14} />}
            sx={{ minWidth: 'auto', p: 0.25, fontSize: '0.7rem' }}
          >
            Ver todos
          </Button>
        </Stack>

        {/* Controles de navegação */}
        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
          <IconButton size="small" onClick={handlePrevMonth} sx={{ p: 0.25, width: 24, height: 24 }}>
            <Iconify icon="eva:arrow-back-fill" width={14} />
          </IconButton>
          <IconButton size="small" onClick={handleToday} sx={{ p: 0.25, width: 24, height: 24 }}>
            <Iconify icon="solar:calendar-bold" width={14} />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth} sx={{ p: 0.25, width: 24, height: 24 }}>
            <Iconify icon="eva:arrow-forward-fill" width={14} />
          </IconButton>
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            '& .fc': {
              fontSize: '0.6rem',
            },
            '& .fc-header-toolbar': {
              display: 'none',
            },
            '& .fc-daygrid-day': {
              minHeight: '22px !important',
              border: '1px solid',
              borderColor: 'divider',
            },
            '& .fc-daygrid-day-frame': {
              minHeight: '22px !important',
            },
            '& .fc-daygrid-day-number': {
              fontSize: '0.6rem',
              padding: '1px 2px',
            },
            '& .fc-event': {
              fontSize: '0.55rem',
              padding: '0.5px 1px',
              margin: '0.5px 0',
            },
            '& .fc-daygrid-event': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            '& .fc-daygrid-day-top': {
              flexDirection: 'row',
            },
            '& .fc-col-header-cell': {
              padding: '2px 0',
              fontSize: '0.6rem',
            },
            '& .fc-scrollgrid': {
              border: 'none',
            },
            '& .fc-view-harness': {
              height: 'auto !important',
            },
            '& .fc-daygrid': {
              height: 'auto !important',
            },
          }}
        >
          <Calendar
            ref={calendarRef}
            weekends
            events={events}
            eventClick={handleEventClick}
            initialView="dayGridMonth"
            plugins={[dayGridPlugin, interactionPlugin]}
            headerToolbar={false}
            height="auto"
            aspectRatio={1.0}
            locale="pt-br"
            firstDay={0}
          />
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 0.25 }}>
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: '#ff9800',
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            Pendente
          </Typography>
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#4caf50', ml: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            Processado
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
