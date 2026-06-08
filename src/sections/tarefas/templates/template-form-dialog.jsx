'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { criarTemplate, atualizarTemplate } from 'src/actions/tarefas';

import { setorNome, PRIORIDADE_OPTIONS } from '../utils';

// ----------------------------------------------------------------------

const VAZIO = {
  nome: '',
  titulo: '',
  descricao: '',
  responsavelPadrao: null,
  diaPrazo: 10,
  prioridade: 'media',
  setores: [],
  tipoEmpresa: [],
  planoEmpresa: [],
  flowId: '',
  stepOrder: '',
  nextTemplateId: null,
  ativo: true,
};

function idDe(valor) {
  return valor?._id ?? valor ?? null;
}

// ----------------------------------------------------------------------

/**
 * Dialog de criação/edição de template recorrente (apenas Gestores).
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {object=}  props.template     template a editar (undefined → criação)
 * @param {Array}    props.usuarios     internos p/ responsável padrão
 * @param {Array}    props.templates    outros templates p/ próxima etapa
 * @param {Array}    props.setores      setores ativos ({ _id, nome, slug })
 * @param {() => void} props.onSuccess
 */
export function TemplateFormDialog({
  open,
  onClose,
  template,
  usuarios = [],
  templates = [],
  setores = [],
  onSuccess,
}) {
  const editando = Boolean(template?._id);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(VAZIO);

  useEffect(() => {
    if (!open) return;
    if (editando) {
      setForm({
        nome: template.nome || '',
        titulo: template.titulo || '',
        descricao: template.descricao || '',
        responsavelPadrao: idDe(template.responsavelPadrao),
        diaPrazo: template.diaPrazo ?? 10,
        prioridade: template.prioridade || 'media',
        setores: Array.isArray(template.setores) ? template.setores : [],
        tipoEmpresa: template.tipoEmpresa || [],
        planoEmpresa: template.planoEmpresa || [],
        flowId: template.flowId || '',
        stepOrder: template.stepOrder ?? '',
        nextTemplateId: idDe(template.nextTemplateId),
        ativo: template.ativo ?? true,
      });
    } else {
      setForm(VAZIO);
    }
  }, [open, editando, template]);

  const responsavelSelecionado = useMemo(
    () => usuarios.find((u) => u._id === form.responsavelPadrao) ?? null,
    [usuarios, form.responsavelPadrao]
  );

  const nextSelecionado = useMemo(
    () => templates.find((t) => t._id === form.nextTemplateId) ?? null,
    [templates, form.nextTemplateId]
  );

  const set = (campo, valor) => setForm((p) => ({ ...p, [campo]: valor }));

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do template.');
      return;
    }
    if (!form.titulo.trim()) {
      toast.error('Informe o título da tarefa gerada.');
      return;
    }
    const dia = Number(form.diaPrazo);
    if (!Number.isInteger(dia) || dia < 1 || dia > 28) {
      toast.error('O dia do prazo deve ser um inteiro entre 1 e 28.');
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || undefined,
      responsavelPadrao: form.responsavelPadrao || undefined,
      diaPrazo: dia,
      prioridade: form.prioridade,
      setores: form.setores,
      tipoEmpresa: form.tipoEmpresa,
      planoEmpresa: form.planoEmpresa,
      flowId: form.flowId.trim() || undefined,
      stepOrder: form.stepOrder === '' ? undefined : Number(form.stepOrder),
      nextTemplateId: form.nextTemplateId || undefined,
      ativo: form.ativo,
    };

    setSalvando(true);
    try {
      if (editando) {
        await atualizarTemplate(template._id, payload);
        toast.success('Template atualizado.');
      } else {
        await criarTemplate(payload);
        toast.success('Template criado.');
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e?.message || e?.response?.data?.message || 'Erro ao salvar o template.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editando ? 'Editar template' : 'Novo template recorrente'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Nome do template"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            required
            fullWidth
            helperText="Identificação interna (ex.: Fechamento Simples Start)."
          />

          <TextField
            label="Título da tarefa gerada"
            value={form.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Descrição"
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <Autocomplete
            options={usuarios}
            value={responsavelSelecionado}
            getOptionLabel={(o) => o?.name || o?.email || ''}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            onChange={(_, value) => set('responsavelPadrao', value?._id ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Responsável padrão (opcional)" />
            )}
          />

          <Autocomplete
            multiple
            options={setores.map((s) => s.slug)}
            value={form.setores}
            getOptionLabel={(slug) => setorNome(slug, setores)}
            onChange={(_, value) => set('setores', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Setores"
                helperText="Setores herdados pelas tarefas geradas (controlam a visibilidade)."
              />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Dia do prazo"
              type="number"
              value={form.diaPrazo}
              onChange={(e) => set('diaPrazo', e.target.value)}
              fullWidth
              inputProps={{ min: 1, max: 28, step: 1 }}
              helperText="1 a 28"
            />
            <TextField
              select
              label="Prioridade"
              value={form.prioridade}
              onChange={(e) => set('prioridade', e.target.value)}
              fullWidth
            >
              {PRIORIDADE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={form.tipoEmpresa}
            onChange={(_, value) => set('tipoEmpresa', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo de empresa (regime)"
                helperText="Casa com Cliente.regimeTributario. Enter para adicionar. Vazio = todos."
              />
            )}
          />

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={form.planoEmpresa}
            onChange={(_, value) => set('planoEmpresa', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Plano da empresa"
                helperText="Casa com Cliente.planoEmpresa. Enter para adicionar. Vazio = todos."
              />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Fluxo (flowId)"
              value={form.flowId}
              onChange={(e) => set('flowId', e.target.value)}
              fullWidth
              helperText="Opcional — encadeia etapas."
            />
            <TextField
              label="Ordem da etapa"
              type="number"
              value={form.stepOrder}
              onChange={(e) => set('stepOrder', e.target.value)}
              fullWidth
              inputProps={{ min: 1, step: 1 }}
            />
          </Stack>

          <Autocomplete
            options={templates.filter((t) => t._id !== template?._id)}
            value={nextSelecionado}
            getOptionLabel={(o) => o?.nome || o?.titulo || ''}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            onChange={(_, value) => set('nextTemplateId', value?._id ?? null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Próxima etapa (template)"
                helperText="Gerada ao concluir a tarefa desta etapa."
              />
            )}
          />

          <FormControlLabel
            control={<Switch checked={form.ativo} onChange={(e) => set('ativo', e.target.checked)} />}
            label="Ativo"
          />
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
