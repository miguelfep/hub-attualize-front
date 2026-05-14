'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { toTitleCase } from 'src/utils/helper';

import {
  criarInstituicaoBancaria,
  excluirInstituicaoBancaria,
  TIPOS_INSTITUICAO_BANCARIA,
  atualizarInstituicaoBancaria,
  listarCatalogoInstituicoesCompleto,
} from 'src/actions/instituicoes-bancarias';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomDivider } from 'src/components/divider/CustomDivider';

// ----------------------------------------------------------------------

function getApiErrorMessage(error) {
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (!error || typeof error !== 'object') return 'Erro ao processar solicitação';
  if (typeof error.message === 'string' && error.message.trim()) return error.message.trim();
  if (typeof error.error === 'string' && error.error.trim()) return error.error.trim();
  if (error.error && typeof error.error === 'object' && typeof error.error.message === 'string') {
    return error.error.message.trim() || 'Erro ao processar solicitação';
  }
  if (Array.isArray(error.errors)) return error.errors.filter(Boolean).join(', ');
  return 'Erro ao processar solicitação';
}

const emptyForm = {
  codigo: '',
  nome: '',
  nomeCompleto: '',
  tipo: 'comercial',
  logoUrl: '',
  ativo: true,
  aceitaPdf: true,
};

export default function InstituicoesBancariasPage() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const confirmDesativar = useBoolean();
  const [rowParaDesativar, setRowParaDesativar] = useState(null);
  const [desativando, setDesativando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const rowsRaw = await listarCatalogoInstituicoesCompleto();
      const rows = [...rowsRaw].sort((a, b) => {
        const ca = parseInt(String(a.codigo || '999'), 10);
        const cb = parseInt(String(b.codigo || '999'), 10);
        return ca - cb;
      });
      setLista(rows);
    } catch (e) {
      console.error('[instituicoes-bancarias] carregar', getApiErrorMessage(e));
      toast.error(getApiErrorMessage(e));
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const abrirEditar = (row) => {
    const id = row._id || row.id;
    setEditando(id ? { ...row, _id: id } : null);
    setForm({
      codigo: String(row.codigo ?? ''),
      nome: row.nome ?? '',
      nomeCompleto: row.nomeCompleto ?? row.nome ?? '',
      tipo: row.tipo && TIPOS_INSTITUICAO_BANCARIA.some((t) => t.value === row.tipo) ? row.tipo : 'comercial',
      logoUrl: row.logoUrl ?? '',
      ativo: row.ativo !== false,
      aceitaPdf: row.aceitaPdf !== false,
    });
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    if (salvando) return;
    setDialogOpen(false);
    setEditando(null);
    setForm(emptyForm);
  };

  const handleSalvar = async () => {
    const codigo = String(form.codigo || '').trim();
    const nome = String(form.nome || '').trim();
    const nomeCompleto = String(form.nomeCompleto || '').trim();
    const { tipo } = form;
    const logoUrl = String(form.logoUrl || '').trim();

    if (!codigo || !nome || !nomeCompleto) {
      toast.error('Código, nome curto e nome completo são obrigatórios.', { id: 'validador-instituicoes-bancarias' });
      return;
    }

    if (!/^\d{3}$/.test(codigo)) {
      toast.error('Use o código COMPE com 3 dígitos (ex.: 001, 077, 237).');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        codigo,
        nome,
        nomeCompleto,
        tipo,
        ativo: Boolean(form.ativo),
        aceitaPdf: Boolean(form.aceitaPdf),
      };
      if (logoUrl) payload.logoUrl = logoUrl;

      if (editando?._id) {
        const res = await atualizarInstituicaoBancaria(editando._id, payload);
        if (res.data?.success === false) {
          throw new Error(res.data?.message || 'Erro ao atualizar');
        }
        toast.success('Instituição atualizada.');
      } else {
        const res = await criarInstituicaoBancaria(payload);
        const criadoOk =
          (res.status === 201 || res.status === 200) && res.data?.success !== false;
        if (!criadoOk) {
          throw new Error(res.data?.message || res.data?.error || 'Erro ao criar');
        }
        toast.success('Instituição cadastrada.');
      }
      fecharDialog();
      await carregar();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  };

  const abrirConfirmacaoDesativar = (row) => {
    const id = row?._id || row?.id;
    if (!id) return;
    setRowParaDesativar(row);
    confirmDesativar.onTrue();
  };

  const fecharConfirmacaoDesativar = () => {
    if (desativando) return;
    confirmDesativar.onFalse();
    setRowParaDesativar(null);
  };

  const handleConfirmarDesativar = async () => {
    const id = rowParaDesativar?._id || rowParaDesativar?.id;
    if (!id) return;
    setDesativando(true);
    try {
      await excluirInstituicaoBancaria(id);
      toast.success('Instituição desativada.');
      confirmDesativar.onFalse();
      setRowParaDesativar(null);
      await carregar();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setDesativando(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }} gap={2}>
        <Typography variant="h4" gutterBottom>
          🏦 Instituições bancárias
        </Typography>
        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={abrirNovo}>
          Nova instituição
        </Button>
      </Stack>
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Nome completo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>PDF</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : lista.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma instituição retornada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                lista.map((row) => {
                  const id = row._id || row.id;
                  return (
                    <TableRow key={id || `${row.codigo}-${row.nome}`} hover>
                      <TableCell sx={{ fontWeight: 600 }}><code>{row.codigo}</code></TableCell>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell sx={{ maxWidth: 280, whiteSpace: 'nowrap' }} title={row.nomeCompleto}>
                        {row.nomeCompleto || '—'}
                      </TableCell>
                      <TableCell>{toTitleCase(row.tipo) || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.aceitaPdf !== false ? 'Sim' : 'Não'}
                          color={row.aceitaPdf !== false ? 'success' : 'error'}
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.ativo ? "Sim" : "Não"}
                          color={row.ativo ? "success" : "error"}
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => abrirEditar(row)} aria-label="Editar">
                          <Iconify icon="eva:edit-fill" />
                        </IconButton>
                        {row.ativo !== false && (
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => abrirConfirmacaoDesativar(row)}
                            aria-label="Desativar"
                          >
                            <Iconify icon="eva:slash-outline" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={fecharDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editando ? 'Editar instituição' : 'Nova instituição bancária'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Código COMPE (3 dígitos)"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
              placeholder="001"
              required
              disabled={Boolean(editando)}
              helperText={editando ? 'Código não pode ser alterado após a criação.' : 'Ex.: 077, 237, 341.'}
            />
            <TextField
              label="Nome curto"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Banco Inter"
              required
              fullWidth
            />
            <TextField
              label="Nome completo (razão social)"
              value={form.nomeCompleto}
              onChange={(e) => setForm((f) => ({ ...f, nomeCompleto: e.target.value }))}
              placeholder="Banco Inter S.A."
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Tipo *</InputLabel>
              <Select
                label="Tipo *"
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              >
                {TIPOS_INSTITUICAO_BANCARIA.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="URL do logo (opcional)"
              value={form.logoUrl}
              onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://..."
              fullWidth
            />
            <Stack spacing={2} divider={<CustomDivider />} direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form.ativo)}
                    onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                  />
                }
                label="Instituição ativa"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form.aceitaPdf)}
                    onChange={(e) => setForm((f) => ({ ...f, aceitaPdf: e.target.checked }))}
                  />
                }
                label="Aceita importação via PDF"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog} disabled={salvando}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDesativar.value}
        onClose={fecharConfirmacaoDesativar}
        title="Desativar instituição"
        content={
          rowParaDesativar
            ? `Desativar a instituição ${rowParaDesativar.codigo} - ${rowParaDesativar.nome}? Contas já vinculadas permanecerão.`
            : ''
        }
        action={
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmarDesativar}
            disabled={desativando}
          >
            {desativando ? 'Desativando…' : 'Desativar'}
          </Button>
        }
      />
    </Box >
  );
}
