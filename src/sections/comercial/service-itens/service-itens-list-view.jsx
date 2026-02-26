'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  getServiceItens,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from 'src/actions/serviceItens';
import { listarCategoriasFinanceiras } from 'src/actions/categorias-financeiras';
import { listarCentrosCusto } from 'src/actions/centros-custo';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

function formatPreco(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

// ----------------------------------------------------------------------

function ServiceItemTableRow({ row, onEditar, onExcluir }) {
  const popover = usePopover();

  const categoriaNome = row.categoriaReceita?.nome ?? '-';
  const centroCustoNome = row.centroCusto?.nome ?? '-';

  return (
    <>
      <TableRow hover>
        <TableCell>{row.titulo || '-'}</TableCell>
        <TableCell sx={{ maxWidth: 280 }}>{row.descricao || '-'}</TableCell>
        <TableCell align="right">{formatPreco(row.preco)}</TableCell>
        <TableCell>{categoriaNome}</TableCell>
        <TableCell>{centroCustoNome}</TableCell>
        <TableCell align="right">
          <IconButton
            size="small"
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onEditar(row);
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onExcluir(row);
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
            Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}

// ----------------------------------------------------------------------

function TabelaItens({ lista, onEditar, onExcluir, loading }) {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      {loading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Carregando...</Typography>
        </Box>
      ) : lista.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Nenhum item de serviço.</Typography>
        </Box>
      ) : (
        <Scrollbar>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell>Categoria (Receita)</TableCell>
                <TableCell>Centro de Custo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lista.map((row) => (
                <ServiceItemTableRow
                  key={row._id}
                  row={row}
                  onEditar={onEditar}
                  onExcluir={onExcluir}
                />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

export function ServiceItensListView() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriasReceita, setCategoriasReceita] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    titulo: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    categoriaReceita: '',
    centroCusto: '',
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getServiceItens();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao carregar itens');
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    listarCategoriasFinanceiras('RECEITA')
      .then((data) => setCategoriasReceita(Array.isArray(data) ? data : []))
      .catch(() => setCategoriasReceita([]));
    listarCentrosCusto()
      .then((data) => setCentrosCusto(Array.isArray(data) ? data : []))
      .catch(() => setCentrosCusto([]));
  }, []);

  const abrirNovo = () => {
    setEditingId(null);
    setForm({
      titulo: '',
      descricao: '',
      preco: '',
      categoriaReceita: '',
      centroCusto: '',
    });
    setDialogOpen(true);
  };

  const abrirEditar = (row) => {
    setEditingId(row._id);
    const catId = row.categoriaReceita?._id ?? row.categoriaReceita ?? '';
    const ccId = row.centroCusto?._id ?? row.centroCusto ?? '';
    setForm({
      titulo: row.titulo || '',
      descricao: row.descricao || '',
      preco: row.preco != null ? String(row.preco) : '',
      categoriaReceita: catId,
      centroCusto: ccId,
    });
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.titulo?.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    const precoNum = Number(form.preco);
    if (Number.isNaN(precoNum) || precoNum < 0) {
      toast.error('Preço inválido');
      return;
    }
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descricao: (form.descricao || '').trim(),
        preco: precoNum,
        categoriaReceita: form.categoriaReceita?.trim() || null,
        centroCusto: form.centroCusto?.trim() || null,
      };
      if (editingId) {
        await updateServiceItem(editingId, payload);
        toast.success('Item atualizado');
      } else {
        await createServiceItem(payload);
        toast.success('Item criado');
      }
      setDialogOpen(false);
      carregar();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao salvar');
    }
  };

  const handleExcluir = () => {
    if (!confirmDelete.id) return;
    const { id } = confirmDelete;
    setConfirmDelete({ open: false, id: null, titulo: '' });
    deleteServiceItem(id)
      .then(() => {
        toast.success('Item excluído');
        carregar();
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || e?.message || 'Erro ao excluir');
      });
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Itens de Serviço"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Comercial', href: paths.dashboard.invoice.root },
          { name: 'Itens de Serviço' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={abrirNovo}
          >
            Novo item
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <TabelaItens
        lista={lista}
        loading={loading}
        onEditar={abrirEditar}
        onExcluir={(row) =>
          setConfirmDelete({ open: true, id: row._id, titulo: row.titulo || '' })
        }
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar item de serviço' : 'Novo item de serviço'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Preço (R$)"
              type="number"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />
            <TextField
              select
              label="Categoria (Receita)"
              value={form.categoriaReceita}
              onChange={(e) => setForm({ ...form, categoriaReceita: e.target.value })}
              fullWidth
            >
              <MenuItem value="">
                <em>Nenhuma</em>
              </MenuItem>
              {categoriasReceita.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Centro de Custo"
              value={form.centroCusto}
              onChange={(e) => setForm({ ...form, centroCusto: e.target.value })}
              fullWidth
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {centrosCusto.map((cc) => (
                <MenuItem key={cc._id} value={cc._id}>
                  {cc.nome}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, titulo: '' })}
        title="Excluir item de serviço?"
        content={`Confirma a exclusão de "${confirmDelete.titulo}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleExcluir}>
            Excluir
          </Button>
        }
      />
    </DashboardContent>
  );
}
