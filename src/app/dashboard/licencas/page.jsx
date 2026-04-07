'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  Dialog,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { getClientes } from 'src/actions/clientes';
import {
  createLicenca,
  deleteLicenca,
  listarLicencas,
  getCorStatusLicenca,
  getIconeStatusLicenca,
  validarArquivoLicenca,
  listarLicencasPorCliente,
} from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

import LicenseModal from 'src/sections/overview/booking/LicenseModal';

import { useAuthContext } from 'src/auth/hooks';

const licencasBrasil = [
  { id: 1, nome: 'Licença Ambiental' },
  { id: 2, nome: 'Licença Sanitária' },
  { id: 3, nome: 'Alvará de Funcionamento' },
  { id: 4, nome: 'Bombeiros' },
  { id: 5, nome: 'CLI' },
  { id: 6, nome: 'DEAM' },
  { id: 7, nome: 'DFRV' },
];

function clienteIdFromLicenca(lic) {
  if (!lic) return null;
  if (lic.cliente && typeof lic.cliente === 'object' && lic.cliente._id) return String(lic.cliente._id);
  if (lic.clienteId) return String(lic.clienteId);
  if (typeof lic.cliente === 'string') return lic.cliente;
  return null;
}

/** Percorre todas as páginas de licenças e devolve o conjunto de IDs de cliente que possuem ao menos uma licença. */
async function fetchAllClienteIdsComLicenca() {
  const ids = new Set();
  const pageSize = 100;
  let depth = 0;
  const maxDepth = 500;

  const fetchPage = async (pageNum) => {
    depth += 1;
    if (depth > maxDepth) return;

    const res = await listarLicencas({
      page: pageNum,
      limit: pageSize,
      sortBy: 'dataVencimento',
      sortOrder: 'desc',
    });
    const payload = res?.data;

    if (Array.isArray(payload)) {
      payload.forEach((lic) => {
        const id = clienteIdFromLicenca(lic);
        if (id) ids.add(id);
      });
      return;
    }

    const list = payload?.data || [];
    list.forEach((lic) => {
      const id = clienteIdFromLicenca(lic);
      if (id) ids.add(id);
    });

    const effectiveLimit = payload?.limit || pageSize;
    const totalPages =
      payload?.totalPages ?? Math.max(1, Math.ceil((payload?.total || 0) / effectiveLimit));

    if (pageNum < totalPages && list.length > 0) {
      await fetchPage(pageNum + 1);
    }
  };

  await fetchPage(1);
  return ids;
}

function escapeCsvCell(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** SIMEI e PF não entram na lista de empresas sem licença (escopo típico de alvarás). */
function isRegimeExcluidoSemLicencaModal(regime) {
  const r = String(regime || '').toLowerCase();
  return r === 'simei' || r === 'pf';
}

function downloadClientesSemLicencaCsv(clientes) {
  if (!clientes?.length) return;

  const headers = ['Código', 'Razão social ou nome', 'CNPJ', 'ID do cliente'];
  const dataRows = clientes.map((c) =>
    [
      escapeCsvCell(c.codigo ?? ''),
      escapeCsvCell(c.razaoSocial || c.nome || ''),
      escapeCsvCell(c.cnpj || ''),
      escapeCsvCell(c._id || ''),
    ].join(',')
  );

  const csvBody = [headers.join(','), ...dataRows].join('\r\n');
  const blob = new Blob([`\uFEFF${csvBody}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `empresas-sem-licenca_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function LicencasPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState(null);

  const [status, setStatus] = useState('');
  const [expiraEmDias, setExpiraEmDias] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [sortBy, setSortBy] = useState('dataVencimento');
  const [sortOrder, setSortOrder] = useState('desc');

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState(null);

  const [newLicense, setNewLicense] = useState({
    nome: '',
    clienteId: '',
    estado: '',
    cidade: '',
    dataInicio: '',
    dataVencimento: '',
    status: 'em_processo',
    urldeacesso: '',
    observacao: '',
  });
  const [newLicenseFile, setNewLicenseFile] = useState(null);
  const [errors, setErrors] = useState({});

  const [semLicencaDialogOpen, setSemLicencaDialogOpen] = useState(false);
  const [clientesSemLicenca, setClientesSemLicenca] = useState([]);
  const [loadingSemLicenca, setLoadingSemLicenca] = useState(false);

  const canView = useMemo(() => Boolean(user), [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let response;
      let responseData;

      // Se um cliente foi selecionado, usa a rota específica por cliente
      if (clienteSelecionado?._id) {
        const params = {
          page,
          limit,
        };
        if (status) params.status = status;
        // incluirComentarios pode ser adicionado se necessário
        // if (incluirComentarios) params.incluirComentarios = true;

        response = await listarLicencasPorCliente(clienteSelecionado._id, params);
        responseData = response?.data || response;
        
        // A resposta da rota por cliente retorna { data: [...], pagination: {...} }
        if (responseData?.data && responseData?.pagination) {
          setRows(responseData.data);
          setTotal(responseData.pagination.total || 0);
          setPagination({
            page: responseData.pagination.page,
            limit: responseData.pagination.limit,
            total: responseData.pagination.total,
            pages: responseData.pagination.pages,
          });
        } else if (Array.isArray(responseData)) {
          setRows(responseData);
          setTotal(responseData.length);
          setPagination(null);
        } else {
          setRows([]);
          setTotal(0);
          setPagination(null);
        }
      } else {
        // Se nenhum cliente foi selecionado, usa a rota geral
        const params = {
          page,
          limit,
          sortBy,
          sortOrder,
        };
        if (status) params.status = status;
        if (expiraEmDias) params.expiraEmDias = Number(expiraEmDias);

        response = await listarLicencas(params);
        responseData = response?.data || response;
        
        // A API retorna array quando não há query params (compatibilidade)
        // ou objeto paginado quando há query params: { data: [...], page, limit, total, totalPages }
        if (Array.isArray(responseData)) {
          // Formato antigo (sem paginação) - compatibilidade
          setRows(responseData);
          setTotal(responseData.length);
          setPagination(null);
        } else if (responseData?.data) {
          // Formato novo (com paginação)
          setRows(responseData.data);
          setTotal(responseData.total || 0);
          setPagination({
            page: responseData.page || page,
            limit: responseData.limit || limit,
            total: responseData.total || 0,
            pages: responseData.totalPages || Math.ceil((responseData.total || 0) / (responseData.limit || limit)),
          });
        } else {
          setRows([]);
          setTotal(0);
          setPagination(null);
        }
      }

    } catch (err) {
      console.error('Erro ao buscar licenças:', err);
      toast.error(err?.response?.data?.message || 'Erro ao carregar licenças');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await getClientes();
      // Filtrar apenas clientes ativos
      // Cliente ativo: status === true || status === 'true' || status === 1
      const isActive = (clienteStatus) => clienteStatus === true || clienteStatus === 'true' || clienteStatus === 1;
      const clientesAtivos = (response || []).filter((cliente) => isActive(cliente.status));
      setClientes(clientesAtivos);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  useEffect(() => {
    if (canView) {
      fetchClientes();
    }
  }, [canView]);

  useEffect(() => {
    if (canView) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, expiraEmDias, clienteSelecionado, sortBy, sortOrder, canView]);

  useEffect(() => {
    if (openCreateModal) {
      fetchClientes();
    }
  }, [openCreateModal]);

  useEffect(() => {
    if (!semLicencaDialogOpen || !canView) {
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      setLoadingSemLicenca(true);
      setClientesSemLicenca([]);
      try {
        const isActive = (s) => s === true || s === 'true' || s === 1;
        const [clientesResp, idsComLicenca] = await Promise.all([
          getClientes(),
          fetchAllClienteIdsComLicenca(),
        ]);
        if (cancelled) return;
        const ativos = (clientesResp || []).filter((c) => isActive(c.status));
        const sem = ativos.filter(
          (c) =>
            c._id &&
            !idsComLicenca.has(String(c._id)) &&
            !isRegimeExcluidoSemLicencaModal(c.regimeTributario)
        );
        setClientesSemLicenca(sem);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error('Erro ao verificar empresas sem licença');
          setClientesSemLicenca([]);
        }
      } finally {
        if (!cancelled) setLoadingSemLicenca(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [semLicencaDialogOpen, canView]);

  // Usar paginação da API se disponível, senão calcular
  const totalPages = pagination?.pages || Math.max(1, Math.ceil(total / limit));
  const currentPage = pagination?.page || page;

  const handleCreateLicense = async () => {
    const newErrors = {};
    if (!newLicense.nome) newErrors.nome = 'O tipo de licença é obrigatório.';
    if (!newLicense.clienteId) newErrors.clienteId = 'O cliente é obrigatório.';
    if (newLicense.status !== 'dispensada') {
      if (!newLicense.dataInicio) newErrors.dataInicio = 'A data de início é obrigatória.';
      if (!newLicense.dataVencimento) newErrors.dataVencimento = 'A data de vencimento é obrigatória.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validar arquivo se houver
    if (newLicenseFile) {
      const validacao = validarArquivoLicenca(newLicenseFile);
      if (!validacao.isValid) {
        toast.error(validacao.error);
        return;
      }
    }

    try {
      await createLicenca(newLicense, newLicenseFile);
      setOpenCreateModal(false);
      setNewLicense({
        nome: '',
        clienteId: '',
        estado: '',
        cidade: '',
        dataInicio: '',
        dataVencimento: '',
        status: 'em_processo',
        urldeacesso: '',
        observacao: '',
      });
      setNewLicenseFile(null);
      setErrors({});
      fetchData();
      toast.success('Licença criada com sucesso');
    } catch (error) {
      if (error.status === 413 || error.response?.status === 413) {
        toast.error(error.message || 'Arquivo muito grande. O tamanho máximo permitido é 20MB.');
      } else {
        toast.error(error.message || 'Erro ao criar licença');
      }
      console.error('Erro ao criar licença:', error);
    }
  };

  const handleClientChange = (event, newValue) => {
    const estado = newValue?.endereco?.[0]?.estado || '';
    const cidade = newValue?.endereco?.[0]?.cidade || '';
    setNewLicense({
      ...newLicense,
      clienteId: newValue ? newValue._id : '',
      estado,
      cidade,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validacao = validarArquivoLicenca(file);
      if (!validacao.isValid) {
        toast.error(validacao.error);
        event.target.value = '';
        return;
      }
      setNewLicenseFile(file);
    } else {
      setNewLicenseFile(null);
    }
  };

  const handleOpenDeleteDialog = (row) => {
    const id = row._id || row.id;
    if (!id) return;
    setLicenseToDelete({ id, nome: row.nome });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!licenseToDelete?.id) return;
    try {
      await deleteLicenca(licenseToDelete.id);
      setDeleteDialogOpen(false);
      setLicenseToDelete(null);
      await fetchData();
      toast.success('Licença deletada');
    } catch (error) {
      toast.error('Erro ao deletar licença');
    }
  };

  const calcularSituacao = (row) => {
    if (!row.dataVencimento) return '-';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(row.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Vencida';
    }
    if (diffDays === 0) {
      return 'Vence hoje';
    }
    if (diffDays <= 30) {
      return `Vence em ${diffDays} dias`;
    }
    return `Válida (${diffDays} dias)`;
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Licenças
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Controle centralizado de licenças: busque, filtre e acompanhe vencimentos.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="solar:danger-circle-bold" />}
              onClick={() => setSemLicencaDialogOpen(true)}
            >
              Empresas sem licença
            </Button>
            <Button variant="contained" color="primary" onClick={() => setOpenCreateModal(true)}>
              Criar Licença
            </Button>
          </Stack>
        </Box>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <Autocomplete
              options={clientes}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return `${option.razaoSocial || option.nome || ''} - ${option.cnpj || ''}`;
              }}
              value={clienteSelecionado}
              onChange={(event, newValue) => {
                setClienteSelecionado(newValue);
                setPage(1);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Filtrar por cliente (nome/razão/CNPJ)"
                  placeholder="Selecione um cliente"
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              noOptionsText="Nenhum cliente encontrado"
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="em_processo">Em Processo</MenuItem>
              <MenuItem value="valida">Válida</MenuItem>
              <MenuItem value="vencida">Vencida</MenuItem>
              <MenuItem value="dispensada">Dispensada</MenuItem>
              <MenuItem value="a_expirar">A Expirar</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Expira em (dias)"
              value={expiraEmDias}
              onChange={(e) => {
                setExpiraEmDias(e.target.value);
                setPage(1);
              }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Ordenar por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="dataVencimento">Data Vencimento</MenuItem>
              <MenuItem value="dataInicio">Data Início</MenuItem>
              <MenuItem value="nome">Nome</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Ordem"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="asc">Asc</MenuItem>
              <MenuItem value="desc">Desc</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setStatus('');
                  setExpiraEmDias('');
                  setClienteSelecionado(null);
                  setSortBy('dataVencimento');
                  setSortOrder('desc');
                  setPage(1);
                }}
              >
                Limpar filtros
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setPage(1);
                  fetchData();
                }}
                startIcon={<Iconify icon="eva:refresh-fill" />}
              >
                Atualizar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: 8 }}>CNPJ</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Data Início</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Data Vencimento</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Situação</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: 16, textAlign: 'center' }}>
                    <Typography variant="body2">Carregando...</Typography>
                  </td>
                </tr>
              )}
              {!loading && rows.map((row) => {
                const statusColor = getCorStatusLicenca(row.status);
                const statusIcon = getIconeStatusLicenca(row.status);
                const dataInicio = row.dataInicio ? fDate(row.dataInicio) : '-';
                const dataVencimento = row.dataVencimento ? fDate(row.dataVencimento) : '-';
                const situacao = calcularSituacao(row);
                return (
                  <tr key={row._id}>
                    <td style={{ padding: 8 }}>
                      {row?.cliente?.razaoSocial || row?.cliente?.nome || '-'}
                    </td>
                    <td style={{ padding: 8 }}>{row?.cliente?.cnpj || '-'}</td>
                    <td style={{ padding: 8 }}>{row.nome || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <Chip
                        color={statusColor}
                        variant="soft"
                        size="small"
                        icon={<Iconify icon={statusIcon} />}
                        label={
                          row.status === 'em_processo'
                            ? 'Em Processo'
                            : row.status === 'valida'
                              ? 'Válida'
                              : row.status === 'vencida'
                                ? 'Vencida'
                                : row.status === 'dispensada'
                                  ? 'Dispensada'
                                  : row.status === 'a_expirar'
                                    ? 'A Expirar'
                                    : row.status
                        }
                      />
                    </td>
                    <td style={{ padding: 8 }}>{dataInicio}</td>
                    <td style={{ padding: 8 }}>{dataVencimento}</td>
                    <td style={{ padding: 8 }}>{situacao}</td>
                    <td style={{ padding: 8 }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedLicense(row)}
                        >
                          Ver
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Deletar licença"
                          onClick={() => handleOpenDeleteDialog(row)}
                        >
                          <Iconify icon="solar:trash-bin-2-bold" />
                        </IconButton>
                      </Stack>
                    </td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 16 }}>
                    <Typography variant="body2">Nenhuma licença encontrada.</Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {loading ? (
              'Carregando...'
            ) : (
              <>
                Página {currentPage} de {totalPages} — {total} resultado{total !== 1 ? 's' : ''}
              </>
            )}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <TextField
              select
              size="small"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              disabled={loading}
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </TextField>
            <Button
              size="small"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Criar Nova Licença</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={licencasBrasil}
              getOptionLabel={(option) => option.nome}
              onChange={(event, newValue) =>
                setNewLicense({ ...newLicense, nome: newValue ? newValue.nome : '' })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo de Licença"
                  required
                  error={!!errors.nome}
                  helperText={errors.nome}
                />
              )}
            />

            <Autocomplete
              options={clientes}
              getOptionLabel={(option) => option.razaoSocial || ''}
              onChange={handleClientChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  required
                  error={!!errors.clienteId}
                  helperText={errors.clienteId}
                />
              )}
            />

            <TextField
              label="Estado do Cliente"
              fullWidth
              value={newLicense.estado}
              onChange={(e) => setNewLicense({ ...newLicense, estado: e.target.value })}
              InputProps={{ readOnly: !newLicense.estado && newLicense.clienteId }}
            />

            <TextField
              label="Cidade"
              fullWidth
              value={newLicense.cidade}
              onChange={(e) => setNewLicense({ ...newLicense, cidade: e.target.value })}
              InputProps={{ readOnly: !newLicense.cidade && newLicense.clienteId }}
            />

            <TextField
              label="URL de Acesso"
              fullWidth
              value={newLicense.urldeacesso}
              onChange={(e) => setNewLicense({ ...newLicense, urldeacesso: e.target.value })}
            />

            <TextField
              label="Observação"
              fullWidth
              multiline
              rows={3}
              value={newLicense.observacao}
              onChange={(e) => setNewLicense({ ...newLicense, observacao: e.target.value })}
            />

            <TextField
              select
              fullWidth
              label="Status"
              value={newLicense.status}
              onChange={(e) => setNewLicense({ ...newLicense, status: e.target.value })}
            >
              <MenuItem value="em_processo">Em processo</MenuItem>
              <MenuItem value="valida">Válida</MenuItem>
              <MenuItem value="vencida">Vencida</MenuItem>
              <MenuItem value="dispensada">Dispensada</MenuItem>
              <MenuItem value="a_expirar">A Expirar</MenuItem>
            </TextField>

            <TextField
              label="Data de Início"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newLicense.dataInicio}
              onChange={(e) => setNewLicense({ ...newLicense, dataInicio: e.target.value })}
              error={!!errors.dataInicio}
              helperText={errors.dataInicio}
              disabled={newLicense.status === 'dispensada'}
            />

            <TextField
              label="Data de Vencimento"
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newLicense.dataVencimento}
              onChange={(e) => setNewLicense({ ...newLicense, dataVencimento: e.target.value })}
              error={!!errors.dataVencimento}
              helperText={errors.dataVencimento}
              disabled={newLicense.status === 'dispensada'}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Arquivo da Licença (opcional - máx. 20MB)
              </Typography>
              <Button variant="outlined" component="label" fullWidth>
                {newLicenseFile ? newLicenseFile.name : 'Selecionar Arquivo'}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              {newLicenseFile && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Tamanho: {(newLicenseFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateLicense}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização/Edição */}
      {selectedLicense && (
        <LicenseModal
          licenca={selectedLicense}
          fetchLicencas={fetchData}
          onClose={() => setSelectedLicense(null)}
        />
      )}

      {/* Empresas ativas sem nenhuma licença cadastrada */}
      <Dialog
        open={semLicencaDialogOpen}
        onClose={() => setSemLicencaDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:buildings-2-bold-duotone" width={24} />
            <Typography variant="h6" component="span">
              Empresas sem licença
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Clientes <strong>ativos</strong> sem licença neste módulo, excluindo regime{' '}
            <strong>SIMEI</strong> e <strong>PF</strong>. A lista segue o cadastro de clientes (apenas ativos).
            Se a API de clientes for paginada, considere ampliar o endpoint para esta conferência.
          </Typography>
          {loadingSemLicenca ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : clientesSemLicenca.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Chip color="success" label="Nenhuma empresa ativa sem licença" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Nenhuma empresa ativa (fora SIMEI e PF) aparece sem licença neste recorte, ou todas já possuem
                licença cadastrada.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {clientesSemLicenca.length} empresa{clientesSemLicenca.length !== 1 ? 's' : ''} sem licença
              </Typography>
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 88 }}>Código</TableCell>
                      <TableCell>Razão social / Nome</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientesSemLicenca.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell>{c.codigo != null && c.codigo !== '' ? c.codigo : '—'}</TableCell>
                        <TableCell>{c.razaoSocial || c.nome || '—'}</TableCell>
                        <TableCell>{c.cnpj || '—'}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSemLicencaDialogOpen(false);
                              router.push(paths.dashboard.cliente.edit(c._id));
                            }}
                          >
                            Abrir cadastro
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:file-text-bold" />}
            disabled={loadingSemLicenca || clientesSemLicenca.length === 0}
            onClick={() => {
              downloadClientesSemLicencaCsv(clientesSemLicenca);
              toast.success('Arquivo CSV baixado.');
            }}
          >
            Exportar CSV
          </Button>
          <Button onClick={() => setSemLicencaDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar a licença {licenseToDelete?.nome}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
