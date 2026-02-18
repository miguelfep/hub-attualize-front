'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useMemo, useState } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay, DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { Box, Card, Stack, Divider, Typography, CardHeader, IconButton as MuiIconButton } from '@mui/material';

import { downloadGuiaFiscalPortal } from 'src/actions/guias-fiscais';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatToCurrency } from 'src/components/animate';

import { CARD, CARD_HEADER } from './dash-tokens';

// ----------------------------------------------------------------------

function CustomDay(props) {
  const { highlightedDates = [], datesWithDocuments = [], datesUrgent = [], day, outsideCurrentMonth, ...other } = props;
  const isHighlighted = !outsideCurrentMonth && highlightedDates.includes(day.format('YYYY-MM-DD'));
  const hasDocument = !outsideCurrentMonth && datesWithDocuments.includes(day.format('YYYY-MM-DD'));
  const isUrgent = !outsideCurrentMonth && datesUrgent.includes(day.format('YYYY-MM-DD'));

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={{
          width: 32,
          height: 32,
          fontSize: '0.8rem',
          margin: '0 2px',
          position: 'relative',
          zIndex: 1,
          '&.Mui-selected': { bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }
        }}
      />
      {/* Bolinha centralizada no meio do dia - camada de fundo */}
      {hasDocument && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: isUrgent ? 'error.main' : 'info.main',
            opacity: 0.3,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function TaxCalendarWidget({ guias = [], isLoading = false, sx, ...other }) {
  const theme = useTheme();
  const [date, setDate] = useState(dayjs());

  const highlightedDates = useMemo(() =>
    [...new Set(guias.map((g) => dayjs(g.dataVencimento).format('YYYY-MM-DD')))],
    [guias]);

  const datesWithDocuments = useMemo(() =>
    [...new Set(guias.map((g) => dayjs(g.dataVencimento).format('YYYY-MM-DD')))],
    [guias]);

  // Datas com documentos que vencem em 3 dias ou menos
  const datesUrgent = useMemo(() => {
    const today = dayjs().startOf('day');
    return [
      ...new Set(
        guias
          .filter((g) => {
            const vencimento = dayjs(g.dataVencimento).startOf('day');
            const diasRestantes = vencimento.diff(today, 'day');
            return diasRestantes >= 0 && diasRestantes <= 3;
          })
          .map((g) => dayjs(g.dataVencimento).format('YYYY-MM-DD'))
      ),
    ];
  }, [guias]);

  // Verifica se há algum documento urgente para aplicar borda vermelha no calendário
  const hasUrgentDocuments = useMemo(() => datesUrgent.length > 0, [datesUrgent]);

  const selectedDayItems = useMemo(() => {
    const dateKey = date.format('YYYY-MM-DD');
    return guias.filter((g) => dayjs(g.dataVencimento).format('YYYY-MM-DD') === dateKey);
  }, [guias, date]);

  const handleDownload = async (guia) => {
    try {
      await downloadGuiaFiscalPortal(guia._id, guia.nomeArquivo);
    } catch (error) {
      console.error('Erro ao baixar guia:', error);
    }
  };

  return (
    <Card
      sx={{
        ...CARD,
        height: '100%',
        minWidth: 0,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(hasUrgentDocuments && {
          background: `linear-gradient(to top, ${alpha(
            '#0096D9',
            0.05
          )}, ${alpha(theme.palette.error.main, 0.05)})`,
        }),
        ...sx,
      }}
      {...other}
    >
      <CardHeader
        title="Vencimentos"
        subheader="Confira o vencimento das suas guias fiscais"
        sx={{
          ...CARD_HEADER,
          pb: 1,
          '& .MuiCardHeader-title': { fontSize: '0.9rem', fontWeight: 700 },
          '& .MuiCardHeader-subheader': { fontSize: '0.75rem', color: 'text.primary' },
        }}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ÁREA DO CALENDÁRIO */}
        <Box sx={{ px: { xs: 0.5, sm: 1 }, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DateCalendar
              value={date}
              onChange={(newDate) => setDate(newDate)}
              slots={{ day: CustomDay }}
              slotProps={{ day: { highlightedDates, datesWithDocuments, datesUrgent } }}
              sx={{
                width: '100%',
                maxWidth: '100%',
                maxHeight: 280,
                '& .MuiPickersCalendarHeader-root': {
                  margin: 0,
                  padding: '4px 8px', // Respiro na navegação
                  maxHeight: 44,
                  minHeight: 44,
                  '& .MuiPickersCalendarHeader-labelContainer': { fontSize: '0.85rem', fontWeight: 800 },
                },
                '& .MuiDayCalendar-header': {
                  justifyContent: 'space-around',
                  '& span': { width: 32, height: 28, fontSize: '0.65rem', fontWeight: 700 }
                },
                '& .MuiDayCalendar-weekContainer': {
                  justifyContent: 'space-around',
                  margin: '4px 0' // Espaçamento entre semanas
                },
                '& .MuiDayCalendar-monthContainer': { minHeight: 180 }
              }}
            />
          </LocalizationProvider>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mx: 2, my: 0.5, opacity: 0.4 }} />

        {/* LISTA DE ITENS */}
        <Box sx={{ p: 2, pt: 1.5, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="overline" sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary', mb: 1.5, display: 'block' }}>
            {date.format('DD [de] MMMM')}
          </Typography>

          <Scrollbar sx={{ flex: 1 }}>
            {isLoading ? (
              <Typography variant="caption" sx={{ pl: 1 }}>Carregando...</Typography>
            ) : selectedDayItems.length === 0 ? (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', pl: 1 }}>
                Nenhum vencimento selecionado.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {selectedDayItems.map((guia) => (
                  <Stack
                    key={guia._id}
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                      '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.8) }
                    }}
                  >
                    <Box sx={{ width: 3.5, height: 24, borderRadius: 1, bgcolor: 'primary.main', flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={700} noWrap sx={{ display: 'block', lineHeight: 1.2, fontSize: '0.78rem' }}>
                        {guia.tipoGuia}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {guia.dadosExtraidos?.valor ? formatToCurrency(guia.dadosExtraidos.valor) : 'Ver guia'}
                      </Typography>
                    </Box>
                    <MuiIconButton
                      size="small"
                      color="primary"
                      sx={{ p: 0.5, bgcolor: alpha(theme.palette.primary.lighter, 0.9), color: '#637381' }}
                      onClick={() => handleDownload(guia)}
                    >
                      <Iconify icon="solar:download-minimalistic-bold" width={16} />
                    </MuiIconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Scrollbar>
        </Box>
      </Box>
    </Card>
  );
}