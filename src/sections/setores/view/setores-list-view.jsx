'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import { LoadingButton } from '@mui/lab';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  getSetores,
  criarSetor,
  deletarSetor,
  atualizarSetor,
} from 'src/actions/setores';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

/** Gera um slug a partir do nome (minúsculo, sem acento, hifenizado). */
function slugify(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const VAZIO = { nome: '', slug: '', ativo: true };

// ----------------------------------------------------------------------

export function SetoresListView() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incluirInativos, setIncluirInativos] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [slugManual, setSlugManual] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [confirm, setConfirm] = useState({ open: false, setor: null });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSetores(incluirInativos ? { ativo: false } : {});
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.message || 'Erro ao carregar setores.');
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, [incluirInativos]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(VAZIO);
    setSlugManual(false);
    setDialogOpen(true);
  };

  const abrirEditar = (setor) => {
    setEditando(setor);
    setForm({ nome: setor.nome || '', slug: setor.slug || '', ativo: setor.ativo ?? true });
    setSlugManual(true);
    setDialogOpen(true);
  };

  const handleNome = (nome) => {
    setForm((p) => ({ ...p, nome, slug: slugManual ? p.slug : slugify(nome) }));
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do setor.');
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      slug: form.slug.trim() || slugify(form.nome),
      ativo: form.ativo,
    };
    setSalvando(true);
    try {
      if (editando) {
        await atualizarSetor(editando._id, payload);
        toast.success('Setor atualizado.');
      } else {
        await criarSetor(payload);
        toast.success('Setor criado.');
      }
      setDialogOpen(false);
      carregar();
    } catch (e) {
      toast.error(e?.message || e?.response?.data?.message || 'Erro ao salvar o setor.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    const {setor} = confirm;
    setConfirm({ open: false, setor: null });
    if (!setor) return;
    try {
      await deletarSetor(setor._id);
      toast.success('Setor desativado.');
      carregar();
    } catch (e) {
      toast.error(
        e?.message || e?.response?.data?.message || 'Não foi possível desativar (há usuários vinculados?).'
      );
    }
  };

  return (
    <DashboardContent maxWidth="lg">
      <CustomBreadcrumbs
        heading="Setores"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Setores' }]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={abrirNovo}
          >
            Novo setor
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={incluirInativos}
              onChange={(e) => setIncluirInativos(e.target.checked)}
            />
          }
          label="Mostrar inativos"
        />
      </Stack>

      <Card>
        <Scrollbar>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Situação</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Carregando...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : lista.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Nenhum setor cadastrado.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                lista.map((setor) => (
                  <TableRow key={setor._id} hover>
                    <TableCell>{setor.nome}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {setor.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Label variant="soft" color={setor.ativo ? 'success' : 'default'}>
                        {setor.ativo ? 'Ativo' : 'Inativo'}
                      </Label>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => abrirEditar(setor)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      {setor.ativo && (
                        <IconButton
                          color="error"
                          onClick={() => setConfirm({ open: true, setor })}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editando ? 'Editar setor' : 'Novo setor'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              value={form.nome}
              onChange={(e) => handleNome(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => {
                setSlugManual(true);
                setForm((p) => ({ ...p, slug: e.target.value }));
              }}
              fullWidth
              helperText="Identificador único (minúsculo, hifenizado). Usado pelas tarefas."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.ativo}
                  onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked }))}
                />
              }
              label="Ativo"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <LoadingButton variant="contained" loading={salvando} onClick={handleSalvar}>
            Salvar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, setor: null })}
        title="Desativar setor?"
        content={`O setor "${confirm.setor?.nome}" será marcado como inativo.`}
        action={
          <Button variant="contained" color="error" onClick={handleExcluir}>
            Desativar
          </Button>
        }
      />
    </DashboardContent>
  );
}
