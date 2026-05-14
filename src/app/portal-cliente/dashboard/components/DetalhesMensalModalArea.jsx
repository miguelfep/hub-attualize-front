'use client';

import useSWR from 'swr';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useMemo, useState, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { fetcher } from 'src/utils/axios';
import { getMonthName } from 'src/utils/helper';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

dayjs.extend(utc);

/** Formata data ISO para dd/mm/aaaa sem deslocamento de timezone */
function formatDateOnly(value) {
    if (!value) return null;
    const str = typeof value === 'string' ? value : String(value);
    if (str.includes('T')) {
        const [ano, mes, dia] = str.split('T')[0].split('-');
        if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [ano, mes, dia] = str.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    return dayjs(value).format('DD/MM/YYYY');
}


export default function DetalhesMensalModal({ isOpen, onClose, monthData, userId }) {
    const theme = useTheme();
    const [selectedDay, setSelectedDay] = useState(null);
    const [isPending, startTransition] = useTransition();

    const canFetch = isOpen && userId && monthData?.ano && monthData?.mes;
    const params = canFetch ? new URLSearchParams({ ano: monthData.ano, mes: monthData.mes }).toString() : '';
    const url = canFetch ? `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard-mensal/${userId}?${params}` : null;

    const { data, isLoading } = useSWR(url, fetcher);

    const allNotas = useMemo(() => {
        if (!data?.data) return [];

        return data.data
            .map(n => {
                const dataEmissao = dayjs(n.dataEmissao);
                // O dia para agrupamento no gráfico sempre vem da dataEmissao
                const dia = dataEmissao.utc().date();

                const clienteNome = n.tomador?.nome || n.tomador?.razaoSocial || 'Cliente não identificado';

                const statusStr = String(n.status || '').toLowerCase();
                const isCancelada = statusStr === 'cancelada' || statusStr === 'cancelado';

                // Formata competência para exibição (dd/mm/aaaa), ou null se ausente
                const competenciaFmt = n.competencia ? formatDateOnly(n.competencia) : null;
                const emissaoFmt = dataEmissao.isValid() ? dataEmissao.utc().format('DD/MM/YYYY HH:mm') : null;

                return {
                    ...n,
                    dia,
                    clienteNome,
                    numeroNota: n.numeroNota || n.numero || 'N/A',
                    dataEmissaoOriginal: dataEmissao,
                    isCancelada,
                    competenciaFmt,
                    emissaoFmt,
                };
            })
            .sort((a, b) => {
                if (a.dia !== b.dia) return a.dia - b.dia;
                return b.dataEmissaoOriginal.valueOf() - a.dataEmissaoOriginal.valueOf();
            });
    }, [data]);

    const filteredNotas = useMemo(() => {
        if (selectedDay) {
            return allNotas.filter(n => n.dia === selectedDay);
        }
        return allNotas;
    }, [allNotas, selectedDay]);

    // Notas canceladas NÃO entram no total faturado
    const totalFaturado = useMemo(() =>
        filteredNotas
            .filter(n => !n.isCancelada)
            .reduce((sum, n) => sum + (Number(n.valorTotal) || 0), 0)
        , [filteredNotas]);

    const totalCancelado = useMemo(() =>
        filteredNotas
            .filter(n => n.isCancelada)
            .reduce((sum, n) => sum + (Number(n.valorTotal) || 0), 0)
        , [filteredNotas]);

    // Dados para o gráfico de distribuição diária
    const chartData = useMemo(() => {
        if (!allNotas || allNotas.length === 0) {
            return { seriesData: [] };
        }

        // Notas canceladas não entram no gráfico de faturamento
        const dailyData = allNotas.filter(n => !n.isCancelada).reduce((acc, nota) => {
            const day = nota.dia;
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
    }, [allNotas]);

    const chartOptions = useChart({
        chart: {
            events: {
                markerClick: (event, chartContext, { dataPointIndex }) => {
                    const dataSeries = chartData.seriesData;
                    if (dataPointIndex >= 0 && dataSeries[dataPointIndex] && handleDayClick) {
                        const day = Number(dataSeries[dataPointIndex].x);
                        handleDayClick(day);
                    }
                },
            },
        },
        colors: [theme.palette.primary.main],
        markers: {
            size: 5,
            strokeWidth: 2,
        },
        stroke: {
            curve: 'smooth',
            width: 2.5,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                opacityFrom: 0.5,
                opacityTo: 0.08,
            },
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
                    formatter: () => '',
                },
            },
            custom: ({ seriesIndex, dataPointIndex, w }) => {
                if (dataPointIndex < 0) return '';
                const dataPoint = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                const valor = `R$ ${dataPoint.y.toLocaleString('pt-br')}`;
                const quantidade = dataPoint.count;
                const plural = quantidade > 1 ? 's' : '';

                return `
                    <div style="padding: 8px 12px; font-size: 12px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
                        <div style="margin-bottom: 5px; font-weight: 600; color: #333;">Dia ${dataPoint.x}</div>
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

    const chartSeries = [{ name: 'Valor Total', data: chartData.seriesData }];

    const handleDayClick = (day) => {
        startTransition(() => setSelectedDay(prev => prev === day ? null : day));
    };

    const mesNome = useMemo(() => {
        if (!monthData?.mes) return '';
        return getMonthName(monthData.mes - 1);
    }, [monthData]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    backgroundImage: `linear-gradient(135deg, rgba(203, 171, 0, 0.03), rgba(142, 51, 255, 0.03))`
                }
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>
                        Detalhes de {mesNome.charAt(0).toUpperCase() + mesNome.slice(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {monthData?.ano} • {allNotas.filter(n => !n.isCancelada).length} notas ativas
                        {allNotas.some(n => n.isCancelada) && (
                            <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                                • {allNotas.filter(n => n.isCancelada).length} cancelada(s)
                            </Box>
                        )}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    {selectedDay && (
                        <Button size="small" color="error" onClick={() => setSelectedDay(null)} sx={{ height: 32, textTransform: 'none' }}>
                            Ver Mês Inteiro
                        </Button>
                    )}
                    <IconButton onClick={onClose} sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
                        <Iconify icon="solar:close-circle-bold" />
                    </IconButton>
                </Stack>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box sx={{ display: 'flex', height: '70vh', overflow: 'hidden' }}>

                {/* LADO ESQUERDO: Gráfico Diário e Resumo (60%) */}
                <Box sx={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', p: 3, borderRight: `1px dashed ${theme.palette.divider}` }}>
                    <Box sx={{ mb: 4, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800 }}>
                            {selectedDay ? `Faturamento Dia ${selectedDay}` : 'Faturamento Total do Mês'}
                        </Typography>
                        <Typography variant="h3" fontWeight={800}>
                            {formatToCurrency(totalFaturado)}
                        </Typography>
                        {totalCancelado > 0 && (
                            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, display: 'block', mt: 0.5 }}>
                                <Iconify icon="solar:close-circle-bold" width={13} sx={{ mr: 0.4, verticalAlign: 'middle' }} />
                                {formatToCurrency(totalCancelado)} em notas canceladas (não computado)
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Distribuição Diária</Typography>
                        {chartData.seriesData.length > 0 ? (
                            <Box sx={{ height: '80%', minHeight: 200 }}>
                                <Chart type="area" series={chartSeries} options={chartOptions} height="100%" />
                            </Box>
                        ) : (
                            <Box sx={{ height: '80%', bgcolor: alpha(theme.palette.grey[500], 0.04), borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.disabled">Nenhum dado disponível</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* LADO DIREITO: Lista de Notas (40%) */}
                <Box sx={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.02) }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Listagem de Notas {selectedDay ? `(Dia ${selectedDay})` : ''}
                        </Typography>
                    </Box>

                    <Scrollbar sx={{ p: 2, flex: 1 }}>
                        <Stack spacing={1.5}>
                            {filteredNotas.map((nota) => {
                                const statusStr = String(nota.status || '').toLowerCase();
                                const statusColor = nota.isCancelada ? 'error'
                                    : statusStr === 'emitida' || statusStr === 'autorizada' ? 'success'
                                    : statusStr === 'negada' ? 'error'
                                    : 'warning';

                                return (
                                    <Box
                                        key={nota._id}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            bgcolor: nota.isCancelada
                                                ? alpha(theme.palette.error.main, 0.04)
                                                : 'background.paper',
                                            border: `1px solid ${nota.isCancelada ? alpha(theme.palette.error.main, 0.2) : theme.palette.divider}`,
                                            opacity: nota.isCancelada ? 0.7 : 1,
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: nota.isCancelada ? 'none' : 'scale(1.02)',
                                                borderColor: nota.isCancelada ? alpha(theme.palette.error.main, 0.4) : 'primary.main',
                                            }
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }} flexWrap="wrap">
                                                    <Label
                                                        variant="soft"
                                                        color={statusColor}
                                                        sx={{ fontSize: 10, height: 20, px: 0.75 }}
                                                    >
                                                        {nota.status || 'Sem status'}
                                                    </Label>
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                                                        NF: {nota.numeroNota}
                                                    </Typography>
                                                </Stack>

                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                        textDecoration: nota.isCancelada ? 'line-through' : 'none',
                                                        color: nota.isCancelada ? 'text.disabled' : 'text.primary',
                                                    }}
                                                >
                                                    {nota.clienteNome}
                                                </Typography>

                                                <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
                                                    {nota.competenciaFmt ? (
                                                        <Tooltip title={`Emissão: ${nota.emissaoFmt || '—'}`} placement="top">
                                                            <Typography variant="caption" color="text.secondary">
                                                                Competência <b>{nota.competenciaFmt}</b> • Dia {nota.dia}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Emissão: <b>{nota.emissaoFmt || '—'}</b> • Dia {nota.dia}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Box>

                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={800}
                                                sx={{
                                                    color: nota.isCancelada ? 'text.disabled' : 'primary.main',
                                                    pl: 1,
                                                    flexShrink: 0,
                                                    textDecoration: nota.isCancelada ? 'line-through' : 'none',
                                                }}
                                            >
                                                {formatToCurrency(nota.valorTotal)}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Scrollbar>
                </Box>
            </Box>
        </Dialog>
    );
}