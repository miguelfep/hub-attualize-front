'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { getSetores } from 'src/actions/setores';
import { getClientes } from 'src/actions/clientes';
import { getUsersInternos } from 'src/actions/users';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  getTarefas,
  atualizarTarefa,
  reatribuirTarefa,
  getMinhasTarefas,
} from 'src/actions/tarefas';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { TarefaKanban } from '../tarefa-kanban';
import { TarefasCounters } from '../tarefas-counters';
import { TarefaFormDialog } from '../tarefa-form-dialog';
import { AcoesMassaDialog } from '../acoes-massa-dialog';
import { TarefaDetailsDrawer } from '../tarefa-details-drawer';
import {
  isGestor,
  setorNome,
  statusColor,
  statusLabel,
  clienteLabel,
  STATUS_OPTIONS,
  prioridadeColor,
  prioridadeLabel,
  PRIORIDADE_OPTIONS,
} from '../utils';

// ----------------------------------------------------------------------

const FILTROS_INICIAIS = {
  q: '',
  status: '',
  prioridade: '',
  setor: '',
  prazoDe: '',
  prazoAte: '',
  atrasada: false,
};

const KANBAN_LIMIT = 100;

function inicioDoDiaIso(date) {
  return date ? new Date(`${date}T00:00:00`).toISOString() : undefined;
}
function fimDoDiaIso(date) {
  return date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined;
}

// ----------------------------------------------------------------------

function TarefaRow({ row, setores, selecionavel, selecionado, onToggle, onClick }) {
  return (
    <TableRow hover selected={selecionado} sx={{ cursor: 'pointer' }} onClick={() => onClick(row)}>
      {selecionavel && (
        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selecionado} onChange={() => onToggle(row._id)} />
        </TableCell>
      )}
      <TableCell>
        <Typography variant="subtitle2" noWrap>
          {row.titulo}
        </Typography>
        {row.atrasada && (
          <Label variant="soft" color="error" sx={{ mt: 0.5 }}>
            Atrasada
          </Label>
        )}
      </TableCell>
      <TableCell>{row.responsavel?.name || row.responsavel?.email || '-'}</TableCell>
      <TableCell>{clienteLabel(row.cliente)}</TableCell>
      <TableCell>
        {row.setores?.length ? (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {row.setores.map((s) => (
              <Label key={s} variant="soft" color="default">
                {setorNome(s, setores)}
              </Label>
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            —
          </Typography>
        )}
      </TableCell>
      <TableCell>{fDate(row.prazo)}</TableCell>
      <TableCell>
        <Label variant="soft" color={prioridadeColor(row.prioridade)}>
          {prioridadeLabel(row.prioridade)}
        </Label>
      </TableCell>
      <TableCell>
        <Label variant="soft" color={statusColor(row.status)}>
          {statusLabel(row.status)}
        </Label>
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

/**
 * Listagem de tarefas (lista ou kanban), com contadores, filtros e
 * reatribuição em massa.
 *
 * @param {object}  props
 * @param {boolean} props.minhas  quando true usa GET /tarefas/minhas (tela pessoal)
 */
export function TarefasListView({ minhas = false }) {
  const { user } = useAuthContext();
  const gestor = isGestor(user?.role);
  const searchParams = useSearchParams();

  const fetcher = minhas ? getMinhasTarefas : getTarefas;

  const [view, setView] = useState('lista'); // 'lista' | 'kanban'

  const [lista, setLista] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);

  const [resumo, setResumo] = useState({});
  const [resumoLoading, setResumoLoading] = useState(true);

  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [setores, setSetores] = useState([]);

  const [selecionados, setSelecionados] = useState(new Set());
  const [massaOpen, setMassaOpen] = useState(false);
  const [reatribuindo, setReatribuindo] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [drawerId, setDrawerId] = useState(null);

  // Deep-link a partir de uma notificação: /dashboard/tarefas/minhas?tarefa=<id>
  const tarefaQuery = searchParams.get('tarefa');
  useEffect(() => {
    if (tarefaQuery) setDrawerId(tarefaQuery);
  }, [tarefaQuery]);

  const filtrosBase = useCallback(
    () => ({
      q: filtros.q || undefined,
      prioridade: filtros.prioridade || undefined,
      setor: filtros.setor || undefined,
      prazoDe: inicioDoDiaIso(filtros.prazoDe),
      prazoAte: fimDoDiaIso(filtros.prazoAte),
    }),
    [filtros]
  );

  const carregar = useCallback(async () => {
    setLoading(true);
    setSelecionados(new Set());
    try {
      if (view === 'kanban') {
        // Kanban mostra todas as colunas de status → ignora o filtro de status.
        const res = await fetcher({ ...filtrosBase(), limit: KANBAN_LIMIT, page: 1 });
        setLista(Array.isArray(res?.data) ? res.data : []);
        setTotal(Number(res?.total) || 0);
      } else {
        const res = await fetcher({
          ...filtrosBase(),
          status: filtros.status || undefined,
          atrasada: filtros.atrasada ? 'true' : undefined,
          page: page + 1,
          limit,
        });
        setLista(Array.isArray(res?.data) ? res.data : []);
        setTotal(Number(res?.total) || 0);
      }
    } catch (e) {
      toast.error(e?.message || 'Erro ao carregar tarefas.');
      setLista([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [view, fetcher, filtrosBase, filtros.status, filtros.atrasada, page, limit]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Contadores (consultas leves de contagem — lê apenas `total`).
  const carregarResumo = useCallback(async () => {
    setResumoLoading(true);
    const base = { limit: 1, page: 1 };
    const agora = new Date();
    const em7 = new Date(agora);
    em7.setDate(em7.getDate() + 7);
    const janela = { prazoDe: agora.toISOString(), prazoAte: em7.toISOString() };
    try {
      const [pend, emand, conc, atr, vencP, vencE] = await Promise.all([
        fetcher({ ...base, status: 'pendente' }),
        fetcher({ ...base, status: 'em_andamento' }),
        fetcher({ ...base, status: 'concluida' }),
        fetcher({ ...base, atrasada: 'true' }),
        fetcher({ ...base, status: 'pendente', ...janela }),
        fetcher({ ...base, status: 'em_andamento', ...janela }),
      ]);
      setResumo({
        pendentes: pend?.total || 0,
        emAndamento: emand?.total || 0,
        concluidas: conc?.total || 0,
        atrasadas: atr?.total || 0,
        aVencer: (vencP?.total || 0) + (vencE?.total || 0),
      });
    } catch {
      setResumo({});
    } finally {
      setResumoLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  useEffect(() => {
    getUsersInternos()
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setUsuarios(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsuarios([]));
    getSetores()
      .then((data) => setSetores(Array.isArray(data) ? data : []))
      .catch(() => setSetores([]));
  }, []);

  useEffect(() => {
    if (!gestor) return;
    getClientes({ status: true, tipoContato: 'cliente' })
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch(() => setClientes([]));
  }, [gestor]);

  const setFiltro = (campo, valor) => {
    setPage(0);
    setFiltros((p) => ({ ...p, [campo]: valor }));
  };

  // Card de contador → aplica o filtro correspondente (e volta p/ lista).
  const counterAtivo = useMemo(() => {
    if (filtros.atrasada) return 'atrasadas';
    if (filtros.status === 'pendente') return 'pendentes';
    if (filtros.status === 'em_andamento') return 'emAndamento';
    if (filtros.status === 'concluida') return 'concluidas';
    if (filtros.prazoDe && filtros.prazoAte && !filtros.status) return 'aVencer';
    return null;
  }, [filtros]);

  const handleCounter = (key) => {
    setPage(0);
    setView('lista');
    if (counterAtivo === key) {
      setFiltros(FILTROS_INICIAIS); // toggle off
      return;
    }
    if (key === 'aVencer') {
      const hoje = new Date();
      const em7 = new Date(hoje);
      em7.setDate(em7.getDate() + 7);
      setFiltros({
        ...FILTROS_INICIAIS,
        prazoDe: hoje.toISOString().slice(0, 10),
        prazoAte: em7.toISOString().slice(0, 10),
      });
      return;
    }
    if (key === 'atrasadas') {
      setFiltros({ ...FILTROS_INICIAIS, atrasada: true });
      return;
    }
    const statusPorCard = {
      pendentes: 'pendente',
      emAndamento: 'em_andamento',
      concluidas: 'concluida',
    };
    setFiltros({ ...FILTROS_INICIAIS, status: statusPorCard[key] || '' });
  };

  // Seleção em massa (somente gestores, na visão lista).
  const podeSelecionar = gestor && view === 'lista';
  const toggleSelecao = (id) =>
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const todasPaginaSelecionadas = lista.length > 0 && lista.every((t) => selecionados.has(t._id));
  const toggleSelecaoPagina = () =>
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todasPaginaSelecionadas) lista.forEach((t) => next.delete(t._id));
      else lista.forEach((t) => next.add(t._id));
      return next;
    });

  const handleAcoesMassa = async ({ responsavelId, setores: novosSetores }) => {
    const ids = [...selecionados];
    setReatribuindo(true);
    try {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          // Setores via PATCH /:id (edição); responsável via PATCH /:id/responsavel.
          if (novosSetores !== undefined) await atualizarTarefa(id, { setores: novosSetores });
          if (responsavelId) await reatribuirTarefa(id, responsavelId);
        })
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const falhas = results.length - ok;
      if (ok) toast.success(`${ok} tarefa(s) atualizada(s).`);
      if (falhas) toast.error(`${falhas} falha(s) ao aplicar as ações.`);
      setMassaOpen(false);
      setSelecionados(new Set());
      carregar();
      carregarResumo();
    } finally {
      setReatribuindo(false);
    }
  };

  const abrirNova = () => {
    setTarefaEditando(null);
    setFormOpen(true);
  };
  const abrirEditar = (tarefa) => {
    setDrawerId(null);
    setTarefaEditando(tarefa);
    setFormOpen(true);
  };
  const recarregarTudo = () => {
    carregar();
    carregarResumo();
  };

  const colCount = 7 + (podeSelecionar ? 1 : 0);

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading={minhas ? 'Minhas Tarefas' : 'Tarefas'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tarefas', href: paths.dashboard.tarefas.minhas },
          { name: minhas ? 'Minhas' : 'Todas' },
        ]}
        action={
          gestor &&
          !minhas && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={abrirNova}
            >
              Nova tarefa
            </Button>
          )
        }
        sx={{ mb: 3 }}
      />

      <TarefasCounters
        resumo={resumo}
        loading={resumoLoading}
        ativo={counterAtivo}
        onSelect={handleCounter}
      />

      <Card sx={{ mb: 3, p: 2.5 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'center' }}
          >
            <TextField
              size="small"
              placeholder="Buscar por título ou descrição..."
              value={filtros.q}
              onChange={(e) => setFiltro('q', e.target.value)}
              sx={{ minWidth: 220, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_, v) => v && setView(v)}
            >
              <ToggleButton value="lista">
                <Tooltip title="Lista">
                  <Iconify icon="solar:list-bold" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="kanban">
                <Tooltip title="Kanban">
                  <Iconify icon="solar:widget-5-bold" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            {view === 'lista' && (
              <TextField
                select
                size="small"
                label="Status"
                value={filtros.status}
                onChange={(e) => setFiltro('status', e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">Todos</MenuItem>
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              select
              size="small"
              label="Prioridade"
              value={filtros.prioridade}
              onChange={(e) => setFiltro('prioridade', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {PRIORIDADE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Setor"
              value={filtros.setor}
              onChange={(e) => setFiltro('setor', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {setores.map((s) => (
                <MenuItem key={s._id} value={s.slug}>
                  {s.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              label="Prazo de"
              value={filtros.prazoDe}
              onChange={(e) => setFiltro('prazoDe', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              size="small"
              type="date"
              label="Prazo até"
              value={filtros.prazoAte}
              onChange={(e) => setFiltro('prazoAte', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            {view === 'lista' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filtros.atrasada}
                    onChange={(e) => setFiltro('atrasada', e.target.checked)}
                  />
                }
                label="Atrasadas"
              />
            )}
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setPage(0);
                setFiltros(FILTROS_INICIAIS);
              }}
            >
              Limpar
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Barra de ações em massa */}
      {podeSelecionar && selecionados.size > 0 && (
        <Card sx={{ mb: 2, p: 1.5, bgcolor: 'background.neutral' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {selecionados.size} selecionada(s)
            </Typography>
            <Button size="small" color="inherit" onClick={() => setSelecionados(new Set())}>
              Limpar seleção
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="solar:settings-bold" />}
              onClick={() => setMassaOpen(true)}
            >
              Ações em massa
            </Button>
          </Stack>
        </Card>
      )}

      {view === 'kanban' ? (
        <>
          {total > KANBAN_LIMIT && (
            <Typography variant="caption" sx={{ color: 'text.disabled', mb: 1, display: 'block' }}>
              Exibindo as primeiras {KANBAN_LIMIT} de {total} tarefas. Refine os filtros para ver o
              restante.
            </Typography>
          )}
          <TarefaKanban
            tarefas={lista}
            setores={setores}
            loading={loading}
            onCardClick={(t) => setDrawerId(t._id)}
          />
        </>
      ) : (
        <Card>
          <Scrollbar>
            <Table sx={{ minWidth: 880 }}>
              <TableHead>
                <TableRow>
                  {podeSelecionar && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={todasPaginaSelecionadas}
                        indeterminate={!todasPaginaSelecionadas && lista.some((t) => selecionados.has(t._id))}
                        onChange={toggleSelecaoPagina}
                      />
                    </TableCell>
                  )}
                  <TableCell>Título</TableCell>
                  <TableCell>Responsável</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Setores</TableCell>
                  <TableCell>Prazo</TableCell>
                  <TableCell>Prioridade</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colCount}>
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">Carregando...</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : lista.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colCount}>
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">Nenhuma tarefa encontrada.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  lista.map((row) => (
                    <TarefaRow
                      key={row._id}
                      row={row}
                      setores={setores}
                      selecionavel={podeSelecionar}
                      selecionado={selecionados.has(row._id)}
                      onToggle={toggleSelecao}
                      onClick={(t) => setDrawerId(t._id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePagination
            component="div"
            page={page}
            count={total}
            rowsPerPage={limit}
            onPageChange={(_, novaPage) => setPage(novaPage)}
            onRowsPerPageChange={(e) => {
              setLimit(Math.min(parseInt(e.target.value, 10), 100));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="Por página"
          />
        </Card>
      )}

      <TarefaFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        tarefa={tarefaEditando}
        usuarios={usuarios}
        clientes={clientes}
        setores={setores}
        onSuccess={recarregarTudo}
      />

      <TarefaDetailsDrawer
        open={Boolean(drawerId)}
        tarefaId={drawerId}
        onClose={() => setDrawerId(null)}
        usuarios={usuarios}
        setores={setores}
        onChanged={recarregarTudo}
        onEditar={abrirEditar}
      />

      <AcoesMassaDialog
        open={massaOpen}
        onClose={() => setMassaOpen(false)}
        quantidade={selecionados.size}
        usuarios={usuarios}
        setores={setores}
        salvando={reatribuindo}
        onConfirm={handleAcoesMassa}
      />
    </DashboardContent>
  );
}
