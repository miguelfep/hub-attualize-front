'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import axios, { fetcher, endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import IrPlanoFormDialog from './IrPlanoFormDialog';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fData(iso) {
  if (!iso) return '—';
  try { return format(parseISO(iso), 'dd/MM/yy', { locale: ptBR }); } catch { return '—'; }
}

function fValor(v) {
  if (v == null) return '—';
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
}

const MODALIDADE_LABEL = { basica: 'Básica', intermediaria: 'Intermediária', completa: 'Completa' };
const MODALIDADE_COLOR = { basica: 'info', intermediaria: 'primary', completa: 'secondary' };

// ─── View ─────────────────────────────────────────────────────────────────────

export default function IrAdminPlanosView() {
  const theme = useTheme();

  const { data: planos, isLoading, mutate } = useSWR(
    `${endpoints.ir.admin.planos}?year=2026`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [formOpen, setFormOpen] = useState(false);
  const [planoEditar, setPlanoEditar] = useState(null);
  const [encerrarId, setEncerrarId] = useState(null);
  const [encerrando, setEncerrando] = useState(false);

  const lista = Array.isArray(planos) ? [...planos].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99)) : [];

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleNovo = () => { setPlanoEditar(null); setFormOpen(true); };
  const handleEditar = (plano) => { setPlanoEditar(plano); setFormOpen(true); };

  const handleEncerrar = async () => {
    if (!encerrarId) return;
    setEncerrando(true);
    try {
      await axios.patch(endpoints.ir.admin.planoEncerrar(encerrarId));
      toast.success('Plano encerrado com sucesso!');
      setEncerrarId(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || 'Erro ao encerrar plano.');
    } finally {
      setEncerrando(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>

      {/* Cabeçalho */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Planos e Lotes — IR</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Gerencie as modalidades, lotes de desconto e preços dos planos de Imposto de Renda.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:external-link-outline" />}
            href="/imposto-renda-2026"
            target="_blank"
          >
            Ver página pública
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleNovo}
          >
            Novo plano
          </Button>
        </Stack>
      </Stack>

      {/* Loading */}
      {isLoading && (
        <Stack alignItems="center" py={10}>
          <CircularProgress />
        </Stack>
      )}

      {/* Vazio */}
      {!isLoading && lista.length === 0 && (
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2.5} py={8}>
              <Box
                sx={{
                  width: 72, height: 72, borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Iconify icon="eva:pricetags-outline" width={36} color="primary.main" />
              </Box>
              <Box textAlign="center">
                <Typography variant="h6">Nenhum plano cadastrado</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Crie o primeiro plano de IR para 2026 clicando no botão acima.
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleNovo}>
                Criar primeiro plano
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Lista de planos */}
      <Grid container spacing={3}>
        {lista.map((plano) => {
          const loteAtivo = (plano.lotes ?? []).find((l) => l.ativo);
          const vagasRestantes = loteAtivo
            ? loteAtivo.vagasTotal === 0
              ? null
              : Math.max(0, loteAtivo.vagasTotal - (loteAtivo.vagasUsadas ?? 0))
            : null;

          return (
            <Grid key={plano._id} xs={12}>
              <Card
                sx={{
                  border: plano.encerrado
                    ? `1px solid ${theme.palette.error.light}`
                    : plano.ativo
                      ? `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                      : '1px solid',
                  borderColor: plano.encerrado ? 'error.light' : plano.ativo ? alpha(theme.palette.success.main, 0.3) : 'divider',
                }}
              >
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={MODALIDADE_LABEL[plano.modalidade] ?? plano.modalidade}
                        color={MODALIDADE_COLOR[plano.modalidade] ?? 'default'}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="h6" fontWeight={700}>{plano.titulo}</Typography>
                      <Chip
                        label={plano.encerrado ? 'Encerrado' : plano.ativo ? 'Ativo' : 'Inativo'}
                        color={plano.encerrado ? 'error' : plano.ativo ? 'success' : 'warning'}
                        size="small"
                      />
                      {loteAtivo && (
                        <Chip label={`Lote ${loteAtivo.numero} ativo`} color="info" size="small" variant="outlined" />
                      )}
                      {vagasRestantes !== null && vagasRestantes <= 10 && (
                        <Chip label={`${vagasRestantes} vagas`} color="warning" size="small" />
                      )}
                    </Stack>
                  }
                  subheader={plano.descricao}
                  action={
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="eva:edit-outline" />}
                        onClick={() => handleEditar(plano)}
                        disabled={plano.encerrado}
                      >
                        Editar
                      </Button>
                      {!plano.encerrado && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<Iconify icon="eva:close-circle-outline" />}
                          onClick={() => setEncerrarId(plano._id)}
                        >
                          Encerrar
                        </Button>
                      )}
                    </Stack>
                  }
                />

                {/* Resumo do lote ativo */}
                {loteAtivo && (
                  <Box
                    sx={{
                      mx: 3,
                      mb: 2,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.success.main, 0.06),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.2),
                    }}
                  >
                    <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" gap={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="eva:pricetags-fill" width={16} color="success.main" />
                        <Typography variant="body2">
                          <strong>Preço atual:</strong>{' '}
                          <span style={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: '1.05rem' }}>
                            {fValor(loteAtivo.valorFinal)}
                          </span>
                          {loteAtivo.valorCheio > loteAtivo.valorFinal && (
                            <span style={{ color: theme.palette.text.disabled, textDecoration: 'line-through', marginLeft: 6, fontSize: '0.85rem' }}>
                              {fValor(loteAtivo.valorCheio)}
                            </span>
                          )}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="eva:calendar-outline" width={16} color="text.secondary" />
                        <Typography variant="body2" color="text.secondary">
                          até {fData(loteAtivo.dataFim)}
                        </Typography>
                      </Stack>
                      {loteAtivo.vagasTotal > 0 && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="eva:people-outline" width={16} color="text.secondary" />
                          <Typography variant="body2" color="text.secondary">
                            {loteAtivo.vagasUsadas ?? 0}/{loteAtivo.vagasTotal} vagas usadas
                          </Typography>
                        </Stack>
                      )}
                      {loteAtivo.descricao && (
                        <Chip label={loteAtivo.descricao} size="small" color="success" variant="outlined" sx={{ fontSize: 10 }} />
                      )}
                    </Stack>
                  </Box>
                )}

                <Divider />

                {/* Tabela de todos os lotes */}
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'background.neutral' }}>
                          <TableCell width={100}>Lote</TableCell>
                          <TableCell>Período</TableCell>
                          <TableCell>Preço Cheio</TableCell>
                          <TableCell>Desconto</TableCell>
                          <TableCell>Preço Final</TableCell>
                          <TableCell align="center" width={120}>Vagas</TableCell>
                          <TableCell align="center" width={90}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(plano.lotes ?? []).map((lote) => (
                          <TableRow
                            key={lote.numero}
                            sx={{
                              bgcolor: lote.ativo
                                ? alpha(theme.palette.success.main, 0.04)
                                : 'transparent',
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={lote.ativo ? 700 : 400}>
                                {lote.numero}º Lote
                              </Typography>
                              {lote.descricao && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {lote.descricao}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {fData(lote.dataInicio)} → {fData(lote.dataFim)}
                              </Typography>
                            </TableCell>
                            <TableCell>{fValor(lote.valorCheio)}</TableCell>
                            <TableCell>
                              {lote.desconto > 0 ? (
                                <Chip
                                  size="small"
                                  color="warning"
                                  label={
                                    lote.tipoDesconto === 'percentual'
                                      ? `${lote.desconto}%`
                                      : `R$ ${lote.desconto}`
                                  }
                                />
                              ) : (
                                <Typography variant="caption" color="text.disabled">Sem desconto</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={lote.ativo ? 700 : 400}
                                color={lote.ativo ? 'primary.main' : 'text.primary'}
                              >
                                {fValor(lote.valorFinal)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {lote.vagasTotal === 0 ? (
                                <Typography variant="caption" color="text.secondary">Ilimitado</Typography>
                              ) : (
                                <Stack alignItems="center">
                                  <Typography variant="body2">
                                    {lote.vagasUsadas ?? 0}
                                    <Typography component="span" variant="caption" color="text.secondary">
                                      /{lote.vagasTotal}
                                    </Typography>
                                  </Typography>
                                  <Typography variant="caption" color={
                                    (lote.vagasTotal - (lote.vagasUsadas ?? 0)) <= 5
                                      ? 'warning.main'
                                      : 'text.secondary'
                                  }>
                                    {Math.max(0, lote.vagasTotal - (lote.vagasUsadas ?? 0))} restantes
                                  </Typography>
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={lote.ativo ? 'Em vigor' : 'Inativo'}
                                color={lote.ativo ? 'success' : 'default'}
                                variant={lote.ativo ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog de criação/edição */}
      <IrPlanoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        plano={planoEditar}
        onSuccess={mutate}
      />

      {/* Dialog de confirmação de encerramento */}
      <Dialog open={!!encerrarId} onClose={() => setEncerrarId(null)}>
        <DialogTitle>Encerrar vendas do plano?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            O plano deixará de aparecer na página pública de vendas e não aceitará novos pedidos.
            Os pedidos já realizados <strong>não serão afetados</strong>.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita pelo sistema. Para reativar, será necessário criar um novo plano.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEncerrarId(null)} disabled={encerrando}>Cancelar</Button>
          <LoadingButton variant="contained" color="error" loading={encerrando} onClick={handleEncerrar}>
            Encerrar vendas
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
