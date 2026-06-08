'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import TablePagination from '@mui/material/TablePagination';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fToNow } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { iconeNotificacao } from 'src/layouts/components/notifications-drawer/notification-item';
import {
  getNotificacoes,
  marcarNotificacaoLida,
  marcarVariasNotificacoes,
  marcarNotificacaoNaoLida,
  marcarTodasNotificacoesLidas,
} from 'src/actions/notificacoes';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const LIDA_PARAM = { todas: undefined, nao: 'false', lidas: 'true' };

function linkDaTarefa(n) {
  const tarefaId = n?.tarefa?._id || n?.tarefa;
  return tarefaId ? `${paths.dashboard.tarefas.minhas}?tarefa=${tarefaId}` : null;
}

// ----------------------------------------------------------------------

export function NotificacoesListView() {
  const router = useRouter();

  const [lista, setLista] = useState([]);
  const [total, setTotal] = useState(0);
  const [naoLidas, setNaoLidas] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  const [selecionados, setSelecionados] = useState(new Set());

  const carregar = useCallback(async () => {
    setLoading(true);
    setSelecionados(new Set());
    try {
      const res = await getNotificacoes({ lida: LIDA_PARAM[filtro], page: page + 1, limit });
      setLista(Array.isArray(res?.data) ? res.data : []);
      setTotal(Number(res?.total) || 0);
      setNaoLidas(Number(res?.naoLidas) || 0);
    } catch (e) {
      toast.error(e?.message || 'Erro ao carregar notificações.');
      setLista([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filtro, page, limit]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const toggleSelecao = (id) =>
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const todasPaginaSelecionadas = lista.length > 0 && lista.every((n) => selecionados.has(n._id));
  const toggleSelecaoPagina = () =>
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todasPaginaSelecionadas) lista.forEach((n) => next.delete(n._id));
      else lista.forEach((n) => next.add(n._id));
      return next;
    });

  const handleToggleRead = async (n) => {
    try {
      if (n.lida) await marcarNotificacaoNaoLida(n._id);
      else await marcarNotificacaoLida(n._id);
      carregar();
    } catch (e) {
      toast.error(e?.message || 'Erro ao atualizar.');
    }
  };

  const handleMassa = async (lida) => {
    const ids = [...selecionados];
    if (!ids.length) return;
    const { ok, falhas } = await marcarVariasNotificacoes(ids, lida);
    if (ok) toast.success(`${ok} notificação(ões) marcada(s) como ${lida ? 'lida' : 'não lida'}.`);
    if (falhas) toast.error(`${falhas} falha(s).`);
    carregar();
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasNotificacoesLidas();
      toast.success('Todas marcadas como lidas.');
    } catch (e) {
      toast.error(e?.message || 'Erro ao marcar todas.');
    }
    carregar();
  };

  const abrirTarefa = (n) => {
    if (!n.lida) marcarNotificacaoLida(n._id).catch(() => {});
    const link = linkDaTarefa(n);
    if (link) router.push(link);
  };

  return (
    <DashboardContent maxWidth="lg">
      <CustomBreadcrumbs
        heading="Notificações"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Notificações' }]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:done-all-fill" />}
            disabled={!naoLidas}
            onClick={handleMarcarTodas}
          >
            Marcar todas como lidas
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Card sx={{ mb: 3, p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filtro}
            onChange={(_, v) => {
              if (v) {
                setPage(0);
                setFiltro(v);
              }
            }}
          >
            <ToggleButton value="todas">Todas</ToggleButton>
            <ToggleButton value="nao">Não lidas</ToggleButton>
            <ToggleButton value="lidas">Lidas</ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {naoLidas} não lida(s)
          </Typography>
        </Stack>
      </Card>

      {selecionados.size > 0 && (
        <Card sx={{ mb: 2, p: 1.5, bgcolor: 'background.neutral' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {selecionados.size} selecionada(s)
            </Typography>
            <Button size="small" color="inherit" onClick={() => setSelecionados(new Set())}>
              Limpar
            </Button>
            <Button
              size="small"
              startIcon={<Iconify icon="solar:bell-bing-line-duotone" />}
              onClick={() => handleMassa(false)}
            >
              Marcar não lidas
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="solar:check-read-line-duotone" />}
              onClick={() => handleMassa(true)}
            >
              Marcar lidas
            </Button>
          </Stack>
        </Card>
      )}

      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={todasPaginaSelecionadas}
                    indeterminate={!todasPaginaSelecionadas && lista.some((n) => selecionados.has(n._id))}
                    onChange={toggleSelecaoPagina}
                  />
                </TableCell>
                <TableCell>Notificação</TableCell>
                <TableCell>Quando</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Carregando...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : lista.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Nenhuma notificação.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                lista.map((n) => (
                  <TableRow key={n._id} hover selected={selecionados.has(n._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selecionados.has(n._id)}
                        onChange={() => toggleSelecao(n._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                            borderRadius: '50%',
                            color: 'primary.main',
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify icon={iconeNotificacao(n.tipo)} width={20} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: n.lida ? 400 : 700 }}>
                            {n.titulo}
                          </Typography>
                          {n.mensagem && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {n.mensagem}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {fToNow(n.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Label variant="soft" color={n.lida ? 'default' : 'info'}>
                        {n.lida ? 'Lida' : 'Não lida'}
                      </Label>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={n.lida ? 'Marcar como não lida' : 'Marcar como lida'}>
                        <IconButton size="small" onClick={() => handleToggleRead(n)}>
                          <Iconify
                            width={18}
                            icon={
                              n.lida
                                ? 'solar:bell-bing-line-duotone'
                                : 'solar:check-read-line-duotone'
                            }
                          />
                        </IconButton>
                      </Tooltip>
                      {linkDaTarefa(n) && (
                        <Tooltip title="Abrir tarefa">
                          <IconButton size="small" onClick={() => abrirTarefa(n)}>
                            <Iconify icon="solar:arrow-right-up-line-duotone" width={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
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
    </DashboardContent>
  );
}
