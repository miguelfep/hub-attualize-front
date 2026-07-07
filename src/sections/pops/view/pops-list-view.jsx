'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { getSetores } from 'src/actions/setores';
import { getPops, removerPop } from 'src/actions/pops';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { PopViewDialog } from '../pop-view-dialog';
import { PopFormDialog } from '../pop-form-dialog';
import { isGestor, setorNome } from '../../tarefas/utils';

// ----------------------------------------------------------------------

function PopRow({ row, setores, gestor, onVisualizar, onEditar, onInativar }) {
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{row.titulo}</Typography>
        {!!row.descricao && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.descricao}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {row.setores?.length ? (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {row.setores.map((s) => (
              <Label key={s} variant="soft" color="info">
                {setorNome(s, setores)}
              </Label>
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Todos
          </Typography>
        )}
      </TableCell>
      <TableCell align="center">
        <Label variant="outlined" color="default">
          v{row.versao}
        </Label>
      </TableCell>
      <TableCell>
        <Label variant="soft" color={row.ativo ? 'success' : 'default'}>
          {row.ativo ? 'Ativo' : 'Inativo'}
        </Label>
      </TableCell>
      <TableCell>{fDate(row.updatedAt)}</TableCell>
      <TableCell align="right">
        <Tooltip title="Visualizar">
          <IconButton onClick={() => onVisualizar(row)}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
        {gestor && (
          <>
            <Tooltip title="Editar">
              <IconButton onClick={() => onEditar(row)}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
            {row.ativo && (
              <Tooltip title="Inativar">
                <IconButton color="error" onClick={() => onInativar(row)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

/**
 * Biblioteca de POPs (Procedimentos Operacionais Padrão).
 * Leitura para todos os internos; criação/edição/inativação apenas Gestores.
 */
export function PopsListView() {
  const { user } = useAuthContext();
  const gestor = isGestor(user?.role);

  const [lista, setLista] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState('');
  const [setor, setSetor] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [inativando, setInativando] = useState(null);
  const [removendo, setRemovendo] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPops({
        q: busca || undefined,
        setor: setor || undefined,
        ativo: mostrarInativos ? undefined : 'true',
      });
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao carregar POPs.');
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, [busca, setor, mostrarInativos]);

  // Debounce simples: recarrega 400ms após a última mudança de filtro.
  useEffect(() => {
    const timer = setTimeout(carregar, 400);
    return () => clearTimeout(timer);
  }, [carregar]);

  useEffect(() => {
    getSetores()
      .then((data) => setSetores(Array.isArray(data) ? data : []))
      .catch(() => setSetores([]));
  }, []);

  const abrirNovo = () => {
    setEditando(null);
    setFormOpen(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setFormOpen(true);
  };

  const handleInativar = async () => {
    if (!inativando) return;
    setRemovendo(true);
    try {
      await removerPop(inativando._id);
      toast.success('POP inativado.');
      setInativando(null);
      carregar();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao inativar o POP.');
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="POPs"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'POPs' }]}
        action={
          gestor && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={abrirNovo}
            >
              Novo POP
            </Button>
          )
        }
        sx={{ mb: 3 }}
      />

      <Card sx={{ mb: 3, p: 2.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          flexWrap="wrap"
          useFlexGap
        >
          <TextField
            size="small"
            placeholder="Buscar por título..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            sx={{ minWidth: 220, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Setor"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {setores.map((s) => (
              <MenuItem key={s._id} value={s.slug}>
                {s.nome}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={mostrarInativos}
                onChange={(e) => setMostrarInativos(e.target.checked)}
              />
            }
            label="Mostrar inativos"
          />
        </Stack>
      </Card>

      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Setores</TableCell>
                <TableCell align="center">Versão</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell>Atualizado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Carregando...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : lista.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        Nenhum POP cadastrado ainda. Crie o primeiro procedimento para padronizar o
                        trabalho do time.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                lista.map((row) => (
                  <PopRow
                    key={row._id}
                    row={row}
                    setores={setores}
                    gestor={gestor}
                    onVisualizar={(r) => setViewId(r._id)}
                    onEditar={abrirEditar}
                    onInativar={(r) => setInativando(r)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      <PopFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        pop={editando}
        setores={setores}
        onSuccess={carregar}
      />

      <PopViewDialog open={Boolean(viewId)} onClose={() => setViewId(null)} popId={viewId} />

      <ConfirmDialog
        open={Boolean(inativando)}
        onClose={() => setInativando(null)}
        title="Inativar POP"
        content={`Tem certeza que deseja inativar o POP "${inativando?.titulo || ''}"? Ele deixará de aparecer na listagem padrão.`}
        action={
          <Button variant="contained" color="error" disabled={removendo} onClick={handleInativar}>
            Inativar
          </Button>
        }
      />
    </DashboardContent>
  );
}
