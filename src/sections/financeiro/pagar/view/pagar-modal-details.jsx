'use client';

import { format } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';

import { buscarTodasParcelasRecorrente } from 'src/actions/contas';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_MAP = {
    PAGO: { label: 'Pago', color: 'success' },
    PENDENTE: { label: 'Pendente', color: 'warning' },
    AGENDADO: { label: 'Agendado', color: 'info' },
    CANCELADO: { label: 'Cancelado', color: 'default' },
};

function getStatusConfig(status) {
    return STATUS_MAP[status] || { label: status || '-', color: 'default' };
}

// ----------------------------------------------------------------------

export function PagarModalDetails({ open, onClose, conta }) {
    const [todasParcelas, setTodasParcelas] = useState({ parcelas: [] });
    const [loadingParcelas, setLoadingParcelas] = useState(false);

    const carregarTodasParcelas = useCallback(async () => {
        if (!conta?._id || conta.tipo !== 'RECORRENTE') return;
        setLoadingParcelas(true);
        try {
            const res = await buscarTodasParcelasRecorrente(conta._id);
            setTodasParcelas(res || { parcelas: [] });
        } catch {
            setTodasParcelas({ parcelas: [] });
        } finally {
            setLoadingParcelas(false);
        }
    }, [conta?._id, conta?.tipo]);

    useEffect(() => {
        if (open && conta?._id && conta.tipo === 'RECORRENTE') {
            carregarTodasParcelas();
        } else {
            setTodasParcelas({ parcelas: [] });
        }
    }, [open, conta?._id, conta?.tipo, carregarTodasParcelas]);

    if (!conta) return null;

    const statusConfig = getStatusConfig(conta.status);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        background: (theme) =>
                            theme.palette.mode === 'light'
                                ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.primary.mainChannel}08 100%)`
                                : `linear-gradient(135deg, ${theme.palette.background.neutral} 0%, ${theme.palette.primary.mainChannel}15 100%)`,
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {conta.nome || conta.descricao || 'Conta a pagar'}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {conta.valor != null ? fCurrency(conta.valor) : '-'}
                                </Typography>
                                <Label variant="soft" color={statusConfig.color}>
                                    {statusConfig.label}
                                </Label>
                                {conta.tipo === 'RECORRENTE' && conta.parcelas != null && conta.parcelas >= 1 && (
                                    <Chip
                                        size="small"
                                        label={`${conta.parcelas} PARCELA`}
                                        sx={{ fontWeight: 600 }}
                                    />
                                )}
                            </Stack>
                        </Box>
                        <IconButton onClick={onClose} size="small" sx={{ flexShrink: 0 }}>
                            <Iconify icon="solar:close-circle-bold" width={24} />
                        </IconButton>
                    </Stack>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2.5, pt: 2 }}>
                <Stack spacing={2.5}>
                    {/* Resumo */}
                    <Secao titulo="Resumo">
                        <Grid container spacing={2}>
                            <Grid xs={12} sm={6}>
                                <SimpleInfo label="Tipo" value={conta.tipo || '-'} />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <SimpleInfo
                                    label="Categoria"
                                    value={conta?.categoria?.nome || '-'}
                                />
                            </Grid>
                        </Grid>
                    </Secao>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* Datas */}
                    <Secao titulo="Datas">
                        <Grid container spacing={2}>
                            <Grid xs={12} sm={6}>
                                <SimpleInfo
                                    label="Vencimento"
                                    value={
                                        conta.dataVencimento
                                            ? format(new Date(conta.dataVencimento), 'dd/MM/yyyy')
                                            : '-'
                                    }
                                />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <SimpleInfo
                                    label="Pagamento"
                                    value={
                                        conta.dataPagamento
                                            ? format(new Date(conta.dataPagamento), 'dd/MM/yyyy')
                                            : '-'
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Secao>

                    {/* Banco */}
                    {(conta.banco?.nome || conta.banco?.conta || conta.banco?.codigo) && (
                        <>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Secao titulo="Dados bancários">
                                <Grid container spacing={2}>
                                    <Grid xs={12} sm={6}>
                                        <SimpleInfo label="Banco" value={conta.banco?.nome || '-'} />
                                    </Grid>
                                    <Grid xs={12} sm={6}>
                                        <SimpleInfo label="Conta" value={conta.banco?.conta || '-'} />
                                    </Grid>
                                    {conta.banco?.codigo && (
                                        <Grid xs={12} sm={6}>
                                            <SimpleInfo label="Código do banco" value={conta.banco.codigo} />
                                        </Grid>
                                    )}
                                </Grid>
                            </Secao>
                        </>
                    )}

                    {/* Descrição, código de barras */}
                    {(conta.descricao || conta.codigoBarras) && (
                        <>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Secao titulo="Detalhes">
                                <Stack spacing={1.5}>
                                    {conta.descricao && (
                                        <SimpleInfo label="Descrição" value={conta.descricao} />
                                    )}
                                    {conta.codigoBarras && (
                                        <SimpleInfo label="Código de barras" value={conta.codigoBarras} />
                                    )}
                                </Stack>
                            </Secao>
                        </>
                    )}

                    {/* Status pagamento / transação */}
                    {(conta.statusPagamento || conta.codigoTransacao) && (
                        <>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Secao titulo="Pagamento">
                                <Grid container spacing={2}>
                                    {conta.statusPagamento && (
                                        <Grid xs={12} sm={6}>
                                            <SimpleInfo label="Status pagamento" value={conta.statusPagamento} />
                                        </Grid>
                                    )}
                                    {conta.codigoTransacao && (
                                        <Grid xs={12} sm={6}>
                                            <SimpleInfo label="Código da transação" value={conta.codigoTransacao} />
                                        </Grid>
                                    )}
                                </Grid>
                            </Secao>
                        </>
                    )}

                    {/* Todas as parcelas da série (recorrente) */}
                    {conta.tipo === 'RECORRENTE' && (
                        <>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Secao
                                titulo="Todas as parcelas"
                                subtitulo={
                                    todasParcelas.parcelas?.length > 0
                                        ? `${todasParcelas.parcelas.length} parcela${todasParcelas.parcelas.length > 1 ? 's' : ''} na série`
                                        : null
                                }
                            >
                                {loadingParcelas ? (
                                    <Stack spacing={1}>
                                        <Skeleton variant="rounded" height={40} />
                                        <Skeleton variant="rounded" height={40} />
                                        <Skeleton variant="rounded" height={40} />
                                    </Stack>
                                ) : todasParcelas.parcelas?.length > 0 ? (
                                    <Table size="small" sx={{ '& td, & th': { border: 0 } }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                    Vencimento
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                    Parcela
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                    Status
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                    Valor
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {todasParcelas.parcelas.map((p) => {
                                                const isAtual = p._id === conta._id;
                                                const dataVenc = p.dataVencimento ? new Date(p.dataVencimento) : null;
                                                const isAnterior = dataVenc && dataVenc < new Date() && p.status !== 'PAGO';
                                                const statusCfg = getStatusConfig(p.status);
                                                return (
                                                    <TableRow key={p._id}>
                                                        <TableCell>
                                                            {p.dataVencimento
                                                                ? format(new Date(p.dataVencimento), 'dd/MM/yyyy')
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {p.parcelas ?? '-'}
                                                                </Typography>
                                                                {isAtual && (
                                                                    <Chip
                                                                        label="Atual"
                                                                        size="small"
                                                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                                <Label variant="soft" color={statusCfg.color}>
                                                                    {statusCfg.label}
                                                                </Label>
                                                                {isAnterior && (
                                                                    <Chip
                                                                        label="Anterior"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ height: 20, fontSize: '0.7rem', borderColor: 'text.disabled', color: 'text.secondary' }}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                            {p.valor != null ? fCurrency(p.valor) : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhuma parcela encontrada na série.
                                    </Typography>
                                )}
                            </Secao>
                        </>
                    )}

                    {/* Observações */}
                    {conta.observacoes && (
                        <>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Secao titulo="Observações">
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {conta.observacoes}
                                </Typography>
                            </Secao>
                        </>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

// ----------------------------------------------------------------------

function Secao({ titulo, subtitulo, children }) {
    return (
        <Box>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {titulo}
                </Typography>
                {subtitulo && (
                    <Typography variant="caption" color="text.secondary">
                        {subtitulo}
                    </Typography>
                )}
            </Stack>
            {children}
        </Box>
    );
}

function SimpleInfo({ label, value }) {
    const isEmpty = value === '-' || value == null || value === '';
    return (
        <Box>
            <Typography
                variant="caption"
                sx={{
                    color: 'text.secondary',
                    display: 'block',
                    mb: 0.5,
                    fontWeight: 600,
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="body2"
                component="div"
                sx={{
                    fontWeight: 500,
                    color: isEmpty ? 'text.disabled' : 'text.primary',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}
