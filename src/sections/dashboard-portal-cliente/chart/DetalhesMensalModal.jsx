'use client';

import useSWR from 'swr';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { toast } from 'sonner';
import { m, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useTransition } from 'react';

import { useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Dialog,
  Button,
  Divider,
  Skeleton,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { fetcher } from 'src/utils/axios';
import { toTitleCase } from 'src/utils/helper';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

dayjs.locale('pt-br');

function getStatusColor(status, theme) {
  const statusColors = {
    'pago': theme.palette.success.main,
    'pendente': theme.palette.warning.main,
    'cancelado': theme.palette.error.main,
    'vencido': theme.palette.error.dark,
  };
  return statusColors[status] || theme.palette.grey[400];
}


function GraficoAreaNotas({ notas, onDayClick }) {
  const chartData = useMemo(() => {
    if (!notas || notas.length === 0) {
      return { seriesData: [] };
    }

    const dailyData = notas.reduce((acc, nota) => {
      if (!nota?.dataEmissao) return acc;

      const day = dayjs(nota.dataEmissao).date();
      if (!day || Number.isNaN(day)) return acc;

      if (!acc[day]) {
        acc[day] = { total: 0, count: 0 };
      }

      acc[day].total += Number(nota.valorTotal) || 0;
      acc[day].count += 1;
      return acc;
    }, {});

    const seriesData = Object.keys(dailyData)
      .map(Number)
      .sort((a, b) => a - b)
      .map((day) => ({
        x: `${day}`,
        y: dailyData[day].total,
        count: dailyData[day].count,
      }));

    return { seriesData };
  }, [notas]);

  const chartOptions = useChart({
    chart: {
      events: {
        markerClick: (event, chartContext, { dataPointIndex }) => {
          const data = chartData.seriesData;

          if (dataPointIndex >= 0 && data[dataPointIndex] && onDayClick) {
            const day = data[dataPointIndex].x;
            onDayClick(day);
          }
        },
      },
    },
    markers: {
      size: 5,
      strokeWidth: 2,
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          if (typeof value === 'number') {
            return `R$ ${value.toLocaleString('pt-br')}`;
          }
          return value;
        },
      },
    },
    xaxis: {
      type: 'category',
      tooltip: {
        enabled: false,
      },
    },
    tooltip: {
      shared: false,
      intersect: false,
      y: {
        formatter: (value) => `R$ ${value.toLocaleString('pt-br')}`,
        title: {
          formatter: (seriesName) => '',
        },
      },
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        if (dataPointIndex < 0) return '';
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const valor = `R$ ${data.y.toLocaleString('pt-br')}`;
        const quantidade = data.count;
        const plural = quantidade > 1 ? 's' : '';

        return `
          <div style="padding: 8px 12px; font-size: 12px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
            <div style="margin-bottom: 5px; font-weight: 600; color: #333;">Dia ${data.x}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${w.globals.colors[seriesIndex]};"></div>
              <div style="color: #555;"><strong>Valor Total:</strong> ${valor}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 8px; height: 8px; border-radius: 50%;"></div>
              <div style="color: #555;"><strong>Número de Notas:</strong> ${quantidade} nota${plural}</div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: 'rgba(145, 158, 171, 0.2)',
    },
  });

  const series = [{ name: 'Valor Total', data: chartData.seriesData }];

  return <Chart type="area" series={series} options={chartOptions} height={320} />;
}

const StatusChip = ({ status }) => {
  const config =
    {
      emitida: { label: 'Emitida', color: 'success' },
      cancelada: { label: 'Cancelada', color: 'error' },
      rejeitada: { label: 'Rejeitada', color: 'warning' },
      pendente: { label: 'Pendente', color: 'info' },
      emitindo: { label: 'Emitindo', color: 'secondary' },
      erro: { label: 'Erro', color: 'error' },
      negada: { label: 'Negada', color: 'error' },
    }[status] || { label: status, color: 'default' };

  return <Chip label={config.label} color={config.color} size="small" variant="soft" />;
};

const EmptyState = () => (
  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ height: 400, textAlign: 'center', p: 3 }}
    >
      <Iconify icon="solar:file-remove-bold-duotone" width={80} sx={{ color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6">Nenhuma nota fiscal encontrada</Typography>
      <Typography color="text.secondary">Não há registros para o mês selecionado.</Typography>
    </Box>
  </m.div>
);

function NotaRowSkeleton() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: (theme) => theme.palette.grey[300],
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={2}
        sx={{ flexGrow: 1, minWidth: 0 }}
      >
        <Skeleton
          variant="circular"
          width={24}
          height={24}
          sx={{ mt: 0.5, flexShrink: 0 }}
        />

        <Stack spacing={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
          
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Skeleton variant="circular" width={18} height={18} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: '60%' }} />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            spacing={1}
          >
            <Skeleton variant="rounded" width={90} height={24} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Skeleton variant="circular" width={14} height={14} />
              <Skeleton variant="text" sx={{ fontSize: '0.75rem', width: 80 }} />
            </Stack>
          </Stack>

          <Stack>
            <Skeleton
              variant="text"
              sx={{ fontSize: '0.75rem', width: 70, mb: 0.5 }}
            />
            <Skeleton variant="rounded" width="100%" height={32} />
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction="column"
        alignItems="flex-end"
        sx={{ flexShrink: 0 }}
        spacing={1}
      >
        <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: 100 }} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Stack>
    </Paper>
  );
}

function ListSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ p: { xs: 1.5, md: 3 }, pt: 1 }}>
      <NotaRowSkeleton />
      <NotaRowSkeleton />
      <NotaRowSkeleton />
      <NotaRowSkeleton />
    </Stack>
  );
}

function ModalLoadingState() {
  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        <Skeleton variant="text" width="40%" />
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          height: 320,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <CircularProgress sx={{ mb: 2 }} size={40} />
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>
          Buscando suas notas!
        </Typography>
      </Box>
      <Divider sx={{ borderStyle: 'dashed', my: 3 }} />
      <Stack spacing={1.5}>
        <NotaRowSkeleton />
        <NotaRowSkeleton />
        <NotaRowSkeleton />
      </Stack>
    </Box>
  );
}

function ErrorState({ onRetry }) {
  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ height: 400, textAlign: 'center', p: 3 }}
      >
        <Iconify icon="solar:danger-triangle-bold-duotone" width={80} sx={{ color: 'error.main', mb: 2 }} />
        <Typography variant="h6">Falha ao carregar</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Ocorreu um erro ao tentar buscar os dados.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          startIcon={<Iconify icon="solar:refresh-circle-bold" />}
        >
          Tentar Novamente
        </Button>
      </Box>
    </m.div>
  );
}

function NotaRow({ nota }) {
  const theme = useTheme();

  return (
    <m.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 3,
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            boxShadow: theme.customShadows.z16,
            transform: 'translateY(-2px)',
          },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: getStatusColor(nota?.status, theme),
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexGrow: 1, minWidth: 0 }}>
          <Iconify
            icon="solar:document-bold-duotone"
            width={24}
            sx={{
              color: 'primary.main',
              flexShrink: 0,
              mt: 0.5
            }}
          />

          <Stack spacing={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify
                icon="solar:user-circle-bold-duotone"
                width={18}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
                noWrap
              >
                {toTitleCase(nota?.tomador?.nome) || 'N/A'}
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
              <Chip
                label={`NF: ${nota?.numeroNota || 'N/A'}`}
                variant="outlined"
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              />

              <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                <Iconify icon="solar:calendar-bold-duotone" width={14} />
                <Typography variant="caption" fontWeight={500}>
                  {nota?.dataEmissao ? dayjs(nota.dataEmissao).format('DD/MM/YYYY') : 'N/A'}
                </Typography>
              </Stack>
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                SERVIÇOS:
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4
                }}
              >
                {(nota.servicos || []).map((s) => s?.descricao || '').filter(Boolean).join(', ') || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="column"
          alignItems="flex-end"
          sx={{
            flexShrink: 0,
            textAlign: 'right'
          }}
          spacing={1}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            color="primary.main"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              lineHeight: 1.2
            }}
          >
            {formatToCurrency(nota?.valorTotal || 0)}
          </Typography>
          <StatusChip status={nota?.status} />
        </Stack>
      </Paper>
    </m.div>
  );
}

function NotaRowMobile({ nota }) {
  const theme = useTheme();

  return (
    <m.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            boxShadow: theme.customShadows.z12,
            transform: 'translateY(-1px)',
          },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: getStatusColor(nota?.status, theme),
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flexGrow: 1 }}>
            <Iconify
              icon="solar:document-bold-duotone"
              width={20}
              sx={{
                color: 'primary.main',
                flexShrink: 0,
                mt: 0.25
              }}
            />
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
                noWrap
              >
                {toTitleCase(nota?.tomador?.nome) || 'N/A'}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                <Iconify icon="solar:calendar-bold-duotone" width={14} />
                <Typography variant="caption" fontWeight={500}>
                  {nota?.dataEmissao ? dayjs(nota.dataEmissao).format('DD/MM/YYYY') : 'N/A'}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack alignItems="flex-end" spacing={0.5}>
            <Typography
              variant="h6"
              fontWeight={800}
              color="primary.main"
              sx={{
                fontSize: '1.1rem',
                lineHeight: 1.2
              }}
            >
              {formatToCurrency(nota?.valorTotal || 0)}
            </Typography>
            <StatusChip status={nota?.status} />
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <Chip
            label={`NF: ${nota.numeroNota || 'N/A'}`}
            variant="outlined"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              alignSelf: 'flex-start'
            }}
          />

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              SERVIÇOS:
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4
              }}
            >
              {nota.servicos.map((s) => s.descricao).join(', ')}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{
          borderStyle: 'dashed',
          borderColor: 'grey.300'
        }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="caption" color="text.secondary">
            {(nota.servicos || []).length} serviço{(nota.servicos || []).length !== 1 ? 's' : ''}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:user-circle-bold-duotone" width={14} sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              {toTitleCase(nota?.tomador?.nome?.split(' ')[0]) || 'N/A'}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </m.div>
  );
}

export default function DetalhesMensalModal({ isOpen, onClose, monthData, userId }) {
  const isDesktop = useResponsive('up', 'sm');

  const [isPending, startTransition] = useTransition();

  const [selectedDay, setSelectedDay] = useState(null);

  const canFetch = isOpen && userId && monthData?.ano && monthData?.mes;

  const params = canFetch
    ? new URLSearchParams({ ano: monthData.ano, mes: monthData.mes }).toString()
    : '';

  const url = canFetch
    ? `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard-mensal/${userId}?${params}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    onSuccess: () => {
      if (selectedDay) {
        setSelectedDay(null);
      }
    }
  });

  const allNotas = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((nota) => ({
      ...nota,
      diaDaEmissao: nota?.dataEmissao ? dayjs(nota.dataEmissao).date() : null,
    }));
  }, [data]);

  const filteredNotas = useMemo(() => {
    if (selectedDay === null) {
      return allNotas;
    }
    return allNotas.filter((nota) => nota.diaDaEmissao === selectedDay);
  }, [allNotas, selectedDay]);

  const handleDayClick = (day) => {
    const dayNumber = Number(day);

    startTransition(() => {
      setSelectedDay((prevDay) => (prevDay === dayNumber ? null : dayNumber));
    });
  };

  if (error) {
    console.error('Erro ao buscar notas do mês:', error);
    toast.error('Falha ao carregar os dados do mês.');
  }

  const mesFormatado = monthData ? dayjs().month(monthData.mes - 1).format('MMMM') : '';
  const titulo = `Notas Fiscais de ${mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1)} de ${monthData?.ano}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {titulo}
        </Typography>
        <IconButton onClick={onClose} sx={{ '&:hover': { color: 'primary.main' } }}>
          <Iconify icon="solar:close-circle-bold" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, bgcolor: 'background.neutral' }}>
        <AnimatePresence>
          {isLoading ? (
            <ModalLoadingState />
          ) : error ? (
            <ErrorState onRetry={() => mutate()} />
          ) : !allNotas || allNotas.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <Box sx={{ p: { xs: 1.5, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Faturamentos por Dia
                </Typography>
                <GraficoAreaNotas notas={allNotas} onDayClick={handleDayClick} />
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{
                  pt: 2,
                  pb: 1,
                  px: { xs: 1.5, md: 3 },
                  opacity: isPending ? 0.6 : 1,
                  transition: (theme) =>
                    theme.transitions.create('opacity', {
                      duration: theme.transitions.duration.shorter,
                    }),
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedDay
                    ? `Mostrando notas do dia ${dayjs().date(selectedDay).format('DD/MM/YYYY')} (${filteredNotas.length} no total)`
                    : 'Mostrando todas as notas'}
                </Typography>
                {selectedDay !== null && (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleDayClick(selectedDay)}
                    startIcon={<Iconify icon="solar:refresh-circle-line-duotone" />}
                    disabled={isPending}
                  >
                    Limpar filtro
                  </Button>
                )}
              </Stack>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <Box
                  component={m.div}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  sx={{ p: { xs: 1.5, md: 3 } }}
                >
                  <Stack spacing={1.5}>
                    {filteredNotas.length > 0 ? (
                      filteredNotas.map((nota) =>
                        isDesktop ? (
                          <NotaRow key={nota._id} nota={nota} />
                        ) : (
                          <NotaRowMobile key={nota._id} nota={nota} />
                        )
                      )
                    ) : (
                      <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                        Nenhuma nota encontrada para o dia {selectedDay}.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}