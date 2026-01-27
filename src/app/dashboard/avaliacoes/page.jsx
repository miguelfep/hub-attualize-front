'use client';

import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import Rating from '@mui/material/Rating';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  Dialog,
  Divider,
  Tooltip,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  CardContent,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useGetAllClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard/main';
import {
  useAvaliacoes,
  createAvaliacao,
  deletarAvaliacao,
  responderAvaliacao,
  atualizarStatusAvaliacao,
  useAvaliacoesEstatisticas,
  useAvaliacoesTiposFeedback,
} from 'src/actions/avaliacoes';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'oculto', label: 'Oculto' },
  { value: 'reportado', label: 'Reportado' },
];

const ORDER_OPTIONS = [
  { value: 'recente', label: 'Mais recentes' },
  { value: 'antiga', label: 'Mais antigas' },
  { value: 'melhorNota', label: 'Melhores notas' },
  { value: 'piorNota', label: 'Piores notas' },
];

const NOTA_OPTIONS = [1, 2, 3, 4, 5];

const DEFAULT_PAGE = 0;
const DEFAULT_ROWS = 10;

// ----------------------------------------------------------------------

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
}

function getStatusColor(status) {
  switch (status) {
    case 'pendente':
      return 'warning';
    case 'ativo':
      return 'success';
    case 'reportado':
      return 'warning';
    case 'oculto':
    default:
      return 'default';
  }
}

function getClienteLabel(cliente) {
  if (!cliente) return '';
  return (
    cliente.razaoSocial || cliente.nomeFantasia || cliente.nome || cliente.email || cliente._id || ''
  );
}

function getAvaliacaoId(avaliacao) {
  return avaliacao?._id || avaliacao?.id || '';
}

// ----------------------------------------------------------------------

export default function AvaliacoesDashboardPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS);
  const [filters, setFilters] = useState({
    clienteProprietarioId: '',
    feedback: '',
    status: 'pendente',
    ordenacao: 'recente',
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [responderDialogOpen, setResponderDialogOpen] = useState(false);

  const [selectedAvaliacao, setSelectedAvaliacao] = useState(null);
  const [novoStatus, setNovoStatus] = useState('pendente');
  const [novaResposta, setNovaResposta] = useState('');

  const [novaAvaliacao, setNovaAvaliacao] = useState({
    clienteProprietarioId: '',
    feedback: 'aulao-reforma',
    nota: 5,
    comentario: '',
    referenciaId: '',
    usuario: {
      id: '',
      nome: '',
      email: '',
    },
  });

  const { data: clientesData, isLoading: loadingClientes } = useGetAllClientes();
  const clientes = Array.isArray(clientesData) ? clientesData : clientesData?.data || [];

  const { data: tiposFeedbackData } = useAvaliacoesTiposFeedback(filters.clienteProprietarioId || undefined);
  const feedbackOptions = useMemo(() => {
    if (!tiposFeedbackData?.data) return [];
    return tiposFeedbackData.data.map((item) => item.tipo || item);
  }, [tiposFeedbackData]);

  const { data: estatisticasData } = useAvaliacoesEstatisticas(
    filters.clienteProprietarioId || undefined,
    filters.feedback || undefined
  );

  const {
    avaliacoes,
    pagination,
    isLoading,
    mutate,
  } = useAvaliacoes(
    {
      clienteProprietarioId: filters.clienteProprietarioId || undefined,
      feedback: filters.feedback || undefined,
      status: filters.status || undefined,
      ordenacao: filters.ordenacao || undefined,
      page: page + 1,
      limit: rowsPerPage,
    },
    { enabled: true }
  );

  const rows = Array.isArray(avaliacoes) ? avaliacoes : avaliacoes?.data || [];
  const totalRows = pagination?.total ?? rows.length;

  const handleFilters = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(DEFAULT_PAGE);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = Number(event.target.value) || DEFAULT_ROWS;
    setRowsPerPage(value);
    setPage(DEFAULT_PAGE);
  };

  const handleOpenCreateDialog = () => {
    setNovaAvaliacao((prev) => ({
      ...prev,
      clienteProprietarioId: filters.clienteProprietarioId || prev.clienteProprietarioId,
      feedback: filters.feedback || prev.feedback,
    }));
    setCreateDialogOpen(true);
  };

  const handleOpenStatusDialog = (avaliacao) => {
    setSelectedAvaliacao(avaliacao);
    setNovoStatus(avaliacao?.status || 'pendente');
    setStatusDialogOpen(true);
  };

  const handleOpenResponderDialog = (avaliacao) => {
    setSelectedAvaliacao(avaliacao);
    setNovaResposta(avaliacao?.respostaEmpresa || '');
    setResponderDialogOpen(true);
  };

  const closeDialogs = () => {
    setCreateDialogOpen(false);
    setStatusDialogOpen(false);
    setResponderDialogOpen(false);
    setSelectedAvaliacao(null);
  };

  const handleCreateAvaliacao = async () => {
    try {
      if (!novaAvaliacao.clienteProprietarioId) {
        toast.error('Selecione um cliente proprietario.');
        return;
      }

      if (!novaAvaliacao.usuario.id || !novaAvaliacao.usuario.nome || !novaAvaliacao.usuario.email) {
        toast.error('Preencha os dados do usuario (id, nome e email).');
        return;
      }

      await createAvaliacao({
        clienteProprietarioId: novaAvaliacao.clienteProprietarioId,
        feedback: novaAvaliacao.feedback,
        nota: novaAvaliacao.nota,
        comentario: novaAvaliacao.comentario.trim(),
        usuario: {
          id: novaAvaliacao.usuario.id,
          nome: novaAvaliacao.usuario.nome,
          email: novaAvaliacao.usuario.email,
        },
        referenciaId: novaAvaliacao.referenciaId || undefined,
      });

      toast.success('Avaliacao criada com sucesso!');
      setNovaAvaliacao({
        clienteProprietarioId: '',
        feedback: 'aulao-reforma',
        nota: 5,
        comentario: '',
        referenciaId: '',
        usuario: { id: '', nome: '', email: '' },
      });
      closeDialogs();
      mutate?.();
    } catch (error) {
      const message = error?.response?.data?.message || 'Erro ao criar avaliacao.';
      toast.error(message);
    }
  };

  const handleAtualizarStatus = async () => {
    const avaliacaoId = getAvaliacaoId(selectedAvaliacao);
    if (!avaliacaoId) return;

    try {
      await atualizarStatusAvaliacao(avaliacaoId, { status: novoStatus });
      toast.success('Status atualizado com sucesso!');
      closeDialogs();
      mutate?.();
    } catch (error) {
      const message = error?.response?.data?.message || 'Erro ao atualizar status.';
      toast.error(message);
    }
  };

  const handleResponder = async () => {
    const avaliacaoId = getAvaliacaoId(selectedAvaliacao);
    if (!avaliacaoId) return;

    try {
      await responderAvaliacao(avaliacaoId, { respostaEmpresa: novaResposta.trim() });
      toast.success('Resposta enviada com sucesso!');
      closeDialogs();
      mutate?.();
    } catch (error) {
      const message = error?.response?.data?.message || 'Erro ao responder avaliacao.';
      toast.error(message);
    }
  };

  const handleDeletar = async (avaliacao) => {
    const avaliacaoId = getAvaliacaoId(avaliacao);
    if (!avaliacaoId) return;

    try {
      await deletarAvaliacao(avaliacaoId);
      toast.success('Avaliacao deletada.');
      mutate?.();
    } catch (error) {
      const message = error?.response?.data?.message || 'Erro ao deletar avaliacao.';
      toast.error(message);
    }
  };

  const estatisticas = estatisticasData?.data?.estatisticas;

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Stack spacing={0.5}>
            <Typography variant="h4">Avaliacoes e Comentarios</Typography>
            <Typography variant="body2" color="text.secondary">
              Centralize o acompanhamento dos feedbacks enviados pelos clientes. Crie, responda e modere avaliacoes.
            </Typography>
          </Stack>

          <Button variant="contained" startIcon={<Icon icon="solar:add-circle-bold" />} onClick={handleOpenCreateDialog}>
            Nova avaliacao
          </Button>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Cliente"
                  value={filters.clienteProprietarioId}
                  onChange={(event) => handleFilters('clienteProprietarioId', event.target.value)}
                  disabled={loadingClientes}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente._id} value={cliente._id}>
                      {getClienteLabel(cliente)}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de feedback"
                  value={filters.feedback}
                  onChange={(event) => handleFilters('feedback', event.target.value)}
                  helperText="Filtre por categoria de conteudo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {feedbackOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={filters.status}
                  onChange={(event) => handleFilters('status', event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Ordenacao"
                  value={filters.ordenacao}
                  onChange={(event) => handleFilters('ordenacao', event.target.value)}
                >
                  {ORDER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              {estatisticas && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  <ResumoCard title="Total de avaliacoes" value={estatisticas.totalAvaliacoes ?? 0} />
                  <ResumoCard title="Media das notas" value={(estatisticas.mediaNotas ?? 0).toFixed(1)} />
                  <ResumoCard
                    title="Nota mais frequente"
                    value={(() => {
                      const dist = estatisticas.distribuicaoNotas || {};
                      const entries = Object.entries(dist);
                      if (!entries.length) return '-';
                      const [key] = entries.sort((a, b) => (b[1] || 0) - (a[1] || 0))[0];
                      return key?.replace('nota', '') || '-';
                    })()}
                  />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 200 }}>Cliente</TableCell>
                  <TableCell sx={{ width: 160 }}>Feedback</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>Nota</TableCell>
                  <TableCell sx={{ width: 240 }}>Comentario</TableCell>
                  <TableCell sx={{ width: 120 }}>Status</TableCell>
                  <TableCell sx={{ width: 160 }}>Data</TableCell>
                  <TableCell align="right" sx={{ width: 150 }}>Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Stack spacing={1} alignItems="center" color="text.secondary">
                        <Icon icon="svg-spinners:180-ring" width={32} />
                        <Typography variant="body2">Carregando avaliacoes...</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma avaliacao encontrada para os filtros selecionados.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && rows.map((avaliacao) => {
                  const clienteNome = getClienteLabel(avaliacao?.clienteProprietarioId);
                  const comentario = avaliacao?.comentario || '';
                  const avaliacaoId = getAvaliacaoId(avaliacao);
                  return (
                    <TableRow key={avaliacaoId} hover>
                      <TableCell sx={{ width: 200, maxWidth: 200 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2">{clienteNome || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {avaliacao?.usuario?.nome || 'Sem usuario'}</Typography>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ width: 160, maxWidth: 160 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="body2">{avaliacao.feedback}</Typography>
                          {avaliacao.referenciaId && (
                            <Typography variant="caption" color="text.secondary">
                              Referencia: {avaliacao.referenciaId}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell align="center" sx={{ width: 120 }}>
                        <Rating value={avaliacao.nota} readOnly precision={1} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {avaliacao.nota}/5
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ width: 240, maxWidth: 240 }}>
                        <Tooltip title={comentario} placement="top-start" disableInteractive>
                          <Typography
                            variant="body2"
                            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          >
                            {comentario || 'Sem comentario'}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell sx={{ width: 120 }}>
                        <Chip
                          label={avaliacao.status}
                          color={getStatusColor(avaliacao.status)}
                          size="small"
                          variant="soft"
                        />
                      </TableCell>

                      <TableCell sx={{ width: 160, maxWidth: 160 }}>
                        <Typography variant="body2">{formatDate(avaliacao.createdAt)}</Typography>
                        {avaliacao.respostaEmpresa && (
                          <Chip label="Respondido" color="info" size="small" variant="outlined" sx={{ mt: 0.5 }} />
                        )}
                      </TableCell>

                      <TableCell align="right" sx={{ width: 150 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Responder">
                            <IconButton size="small" color="info" onClick={() => handleOpenResponderDialog(avaliacao)}>
                              <Icon icon="solar:chat-line-bold" width={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Alterar status">
                            <IconButton size="small" color="warning" onClick={() => handleOpenStatusDialog(avaliacao)}>
                              <Icon icon="solar:settings-bold" width={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver detalhes">
                          <IconButton
                              size="small"
                            color="default"
                            component="a"
                            href={paths.dashboard.avaliacoes.detalhes(avaliacaoId)}
                            disabled={!avaliacaoId}
                          >
                              <Icon icon="solar:eye-bold" width={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" color="error" onClick={() => handleDeletar(avaliacao)}>
                              <Icon icon="solar:trash-bin-trash-bold" width={20} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            page={page}
            rowsPerPage={rowsPerPage}
            count={totalRows}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Stack>

      <Dialog open={createDialogOpen} onClose={closeDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Nova avaliacao</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="Cliente"
              value={novaAvaliacao.clienteProprietarioId}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({ ...prev, clienteProprietarioId: event.target.value }))
              }
              required
              helperText="Selecione a empresa a ser avaliada"
            >
              <MenuItem value="">Selecione...</MenuItem>
              {clientes.map((cliente) => (
                <MenuItem key={cliente._id} value={cliente._id}>
                  {getClienteLabel(cliente)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Tipo de feedback"
              value={novaAvaliacao.feedback}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({ ...prev, feedback: event.target.value }))
              }
              required
              helperText="Exemplo: aulao-reforma, servico-abertura"
            />

            <TextField
              select
              label="Nota"
              value={novaAvaliacao.nota}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({ ...prev, nota: Number(event.target.value) }))
              }
              required
            >
              {NOTA_OPTIONS.map((nota) => (
                <MenuItem key={nota} value={nota}>
                  {nota}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Comentario"
              multiline
              minRows={3}
              value={novaAvaliacao.comentario}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({ ...prev, comentario: event.target.value }))
              }
              inputProps={{ maxLength: 1000 }}
              helperText={`${novaAvaliacao.comentario.length}/1000 caracteres`}
            />

            <Divider flexItem sx={{ borderStyle: 'dashed' }} />

            <Typography variant="subtitle2">Dados do usuario</Typography>

            <TextField
              label="ID"
              value={novaAvaliacao.usuario.id}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({
                  ...prev,
                  usuario: { ...prev.usuario, id: event.target.value },
                }))
              }
              required
            />

            <TextField
              label="Nome"
              value={novaAvaliacao.usuario.nome}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({
                  ...prev,
                  usuario: { ...prev.usuario, nome: event.target.value },
                }))
              }
              required
            />

            <TextField
              label="Email"
              type="email"
              value={novaAvaliacao.usuario.email}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({
                  ...prev,
                  usuario: { ...prev.usuario, email: event.target.value },
                }))
              }
              required
            />

            <TextField
              label="Referencia (opcional)"
              value={novaAvaliacao.referenciaId}
              onChange={(event) =>
                setNovaAvaliacao((prev) => ({ ...prev, referenciaId: event.target.value }))
              }
              helperText="Informe o ID da aula ou servico relacionado"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancelar</Button>
          <LoadingButton variant="contained" onClick={handleCreateAvaliacao}>
            Salvar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={statusDialogOpen} onClose={closeDialogs} maxWidth="xs" fullWidth>
        <DialogTitle>Atualizar status</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Defina se esta avaliacao fica visivel, oculta ou marcada como reportada.
            </Typography>
            <TextField
              select
              label="Status"
              value={novoStatus}
              onChange={(event) => setNovoStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancelar</Button>
          <LoadingButton variant="contained" color="warning" onClick={handleAtualizarStatus}>
            Atualizar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={responderDialogOpen} onClose={closeDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Responder avaliacao</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="subtitle2">Comentario do cliente</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedAvaliacao?.comentario || 'Nenhum comentario registrado.'}
              </Typography>
            </Box>
            <TextField
              label="Resposta"
              multiline
              minRows={3}
              value={novaResposta}
              onChange={(event) => setNovaResposta(event.target.value)}
              inputProps={{ maxLength: 1000 }}
              helperText={`${novaResposta.length}/1000 caracteres`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancelar</Button>
          <LoadingButton variant="contained" onClick={handleResponder}>
            Enviar resposta
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function ResumoCard({ title, value }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}


