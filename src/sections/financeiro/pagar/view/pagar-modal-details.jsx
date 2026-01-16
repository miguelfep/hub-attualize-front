'use client';

import { format } from 'date-fns';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';
import { getCategoriaNome } from 'src/utils/constants/categorias';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PagarModalDetails({ open, onClose, conta }) {
    if (!conta) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{ p: 2.5, pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {conta.nome || conta.descricao}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        size="small"
                    >
                        <Iconify icon="solar:close-circle-bold" width={20} />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 2.5, pt: 0 }}>
                <Stack spacing={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Valor"
                                value={conta.valor != null ? fCurrency(conta.valor) : '-'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Status"
                                value={
                                    <Label
                                        variant="soft"
                                        color={
                                            conta.status === 'PAGO' ? 'success'
                                                : conta.status === 'PENDENTE' ? 'warning'
                                                    : conta.status === 'AGENDADO' ? 'info'
                                                        : conta.status === 'CANCELADO' ? 'default'
                                                            : 'default'
                                        }
                                    >
                                        {conta.status === 'PAGO' ? 'Pago'
                                            : conta.status === 'PENDENTE' ? 'Pendente'
                                                : conta.status === 'AGENDADO' ? 'Agendado'
                                                    : conta.status === 'CANCELADO' ? 'Cancelado'
                                                        : conta.status || '-'}
                                    </Label>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Tipo"
                                value={conta.tipo || '-'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Categoria"
                                value={conta.categoria ? getCategoriaNome(conta.categoria) : '-'}
                            />
                        </Grid>
                    </Grid>

                    <Divider />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Vencimento"
                                value={conta.dataVencimento ? format(new Date(conta.dataVencimento), 'dd/MM/yyyy') : '-'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Pagamento"
                                value={conta.dataPagamento ? format(new Date(conta.dataPagamento), 'dd/MM/yyyy') : '-'}
                            />
                        </Grid>
                    </Grid>

                    <Divider />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Banco"
                                value={conta.banco?.nome || '-'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <SimpleInfo
                                label="Conta"
                                value={conta.banco?.conta || '-'}
                            />
                        </Grid>
                        {conta.banco?.codigo && (
                            <Grid item xs={12} sm={6}>
                                <SimpleInfo
                                    label="Código do Banco"
                                    value={conta.banco.codigo}
                                />
                            </Grid>
                        )}
                    </Grid>

                    {(conta.descricao || conta.codigoBarras || conta.parcelas != null) && (
                        <>
                            <Divider />
                            <Stack spacing={1.5}>
                                {conta.descricao && (
                                    <SimpleInfo
                                        label="Descrição"
                                        value={conta.descricao}
                                    />
                                )}
                                {conta.codigoBarras && (
                                    <SimpleInfo
                                        label="Código de Barras"
                                        value={conta.codigoBarras}
                                    />
                                )}
                                {conta.tipo === 'RECORRENTE' &&
                                    conta.parcelas != null &&
                                    conta.parcelas >= 1 && (
                                        <SimpleInfo
                                            label="Parcelas"
                                            value={`${conta.parcelas} parcela${conta.parcelas > 1 ? 's' : ''}`}
                                        />
                                    )}
                            </Stack>
                        </>
                    )}

                    {(conta.statusPagamento || conta.codigoTransacao) && (
                        <>
                            <Divider />
                            <Grid container spacing={2}>
                                {conta.statusPagamento && (
                                    <Grid item xs={12} sm={6}>
                                        <SimpleInfo
                                            label="Status Pagamento"
                                            value={conta.statusPagamento}
                                        />
                                    </Grid>
                                )}
                                {conta.codigoTransacao && (
                                    <Grid item xs={12} sm={6}>
                                        <SimpleInfo
                                            label="Código Transação"
                                            value={conta.codigoTransacao}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    )}

                    {conta.observacoes && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                                    Observações
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {conta.observacoes}
                                </Typography>
                            </Box>
                        </>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

function SimpleInfo({ label, value }) {
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
                sx={{
                    fontWeight: 500,
                    color: value === '-' ? 'text.disabled' : 'text.primary',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

