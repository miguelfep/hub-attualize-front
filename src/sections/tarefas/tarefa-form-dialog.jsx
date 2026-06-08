'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { criarTarefa, atualizarTarefa } from 'src/actions/tarefas';

import { setorNome, clienteLabel, PRIORIDADE_OPTIONS } from './utils';

// ----------------------------------------------------------------------

/** Converte ISO para o valor aceito por <input type="date"> (YYYY-MM-DD). */
function isoParaInputDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** Competência (YYYY-MM) a partir do valor de um <input type="month">. */
function inputDateParaIso(value) {
  if (!value) return null;
  // Define meia-noite local; o backend trata como due date (data limite).
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const VAZIO = {
  titulo: '',
  descricao: '',
  responsavel: null,
  cliente: null,
  setores: [],
  prazo: '',
  competencia: '',
  prioridade: 'media',
};

// ----------------------------------------------------------------------

/**
 * Dialog de criação/edição de tarefa (apenas Gestores).
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {object=}  props.tarefa      tarefa a editar (undefined → criação)
 * @param {Array}    props.usuarios    lista de internos p/ o responsável
 * @param {Array}    props.clientes    lista de clientes (opcional)
 * @param {Array}    props.setores     setores ativos ({ _id, nome, slug })
 * @param {() => void} props.onSuccess callback após salvar
 */
export function TarefaFormDialog({
  open,
  onClose,
  tarefa,
  usuarios = [],
  clientes = [],
  setores = [],
  onSuccess,
}) {
  const editando = Boolean(tarefa?._id);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(VAZIO);

  useEffect(() => {
    if (!open) return;
    if (editando) {
      setForm({
        titulo: tarefa.titulo || '',
        descricao: tarefa.descricao || '',
        responsavel: tarefa.responsavel?._id ?? tarefa.responsavel ?? null,
        cliente: tarefa.cliente?._id ?? tarefa.cliente ?? null,
        setores: Array.isArray(tarefa.setores) ? tarefa.setores : [],
        prazo: isoParaInputDate(tarefa.prazo),
        competencia: tarefa.competencia || '',
        prioridade: tarefa.prioridade || 'media',
      });
    } else {
      setForm(VAZIO);
    }
  }, [open, editando, tarefa]);

  const usuarioSelecionado = useMemo(
    () => usuarios.find((u) => u._id === form.responsavel) ?? null,
    [usuarios, form.responsavel]
  );

  const clienteSelecionado = useMemo(
    () => clientes.find((c) => c._id === form.cliente) ?? null,
    [clientes, form.cliente]
  );

  const handleSalvar = async () => {
    if (!form.titulo.trim()) {
      toast.error('Informe o título da tarefa.');
      return;
    }
    if (!form.responsavel) {
      toast.error('Selecione o responsável.');
      return;
    }
    if (!form.prazo) {
      toast.error('Informe o prazo.');
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        // Reatribuição não é feita aqui — `responsavel` é ignorado no PATCH.
        const payload = {
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          cliente: form.cliente || null,
          setores: form.setores,
          prazo: inputDateParaIso(form.prazo),
          competencia: form.competencia || undefined,
          prioridade: form.prioridade,
        };
        await atualizarTarefa(tarefa._id, payload);
        toast.success('Tarefa atualizada.');
      } else {
        const payload = {
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || undefined,
          responsavel: form.responsavel,
          cliente: form.cliente || undefined,
          setores: form.setores,
          prazo: inputDateParaIso(form.prazo),
          competencia: form.competencia || undefined,
          prioridade: form.prioridade,
        };
        await criarTarefa(payload);
        toast.success('Tarefa criada.');
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e?.message || e?.response?.data?.message || 'Erro ao salvar a tarefa.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editando ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Título"
            value={form.titulo}
            onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
            required
            fullWidth
          />

          <TextField
            label="Descrição"
            value={form.descricao}
            onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
            fullWidth
            multiline
            rows={3}
          />

          <Autocomplete
            options={usuarios}
            value={usuarioSelecionado}
            getOptionLabel={(o) => o?.name || o?.email || ''}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            onChange={(_, value) => setForm((p) => ({ ...p, responsavel: value?._id ?? null }))}
            disabled={editando}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Responsável"
                required
                helperText={
                  editando ? 'Para reatribuir, use a ação "Reatribuir" na tarefa.' : undefined
                }
              />
            )}
          />

          <Autocomplete
            options={clientes}
            value={clienteSelecionado}
            getOptionLabel={(o) => clienteLabel(o)}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            onChange={(_, value) => setForm((p) => ({ ...p, cliente: value?._id ?? null }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente (opcional)"
                helperText="Sem cliente, a tarefa é interna."
              />
            )}
          />

          <Autocomplete
            multiple
            options={setores.map((s) => s.slug)}
            value={form.setores}
            getOptionLabel={(slug) => setorNome(slug, setores)}
            onChange={(_, value) => setForm((p) => ({ ...p, setores: value }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Setores"
                helperText="Quem enxerga a tarefa (por setor). Vazio = visível só para gestores."
              />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Prazo"
              type="date"
              value={form.prazo}
              onChange={(e) => setForm((p) => ({ ...p, prazo: e.target.value }))}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Competência"
              type="month"
              value={form.competencia}
              onChange={(e) => setForm((p) => ({ ...p, competencia: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <TextField
            select
            label="Prioridade"
            value={form.prioridade}
            onChange={(e) => setForm((p) => ({ ...p, prioridade: e.target.value }))}
            fullWidth
          >
            {PRIORIDADE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={salvando} onClick={handleSalvar}>
          Salvar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
