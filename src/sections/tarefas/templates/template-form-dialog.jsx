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

import { getPops } from 'src/actions/pops';
import { criarTemplate, atualizarTemplate } from 'src/actions/tarefas';

import { setorNome, PRIORIDADE_OPTIONS } from '../utils';
import { ChecklistEditor, checklistParaPayload } from '../checklist-editor';

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
  ativo: true,
  pop: null,
  checklist: [],
};

// Mesmos valores usados no cadastro de clientes (Cliente.regimeTributario / planoEmpresa).
export const TIPO_EMPRESA_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'simei', label: 'SIMEI' },
  { value: 'presumido', label: 'Lucro presumido' },
  { value: 'real', label: 'Lucro real' },
  { value: 'pf', label: 'Pessoa física' },
];

export const PLANO_EMPRESA_OPTIONS = [
  { value: 'carneleao', label: 'Carnê-Leão' },
  { value: 'mei', label: 'MEI' },
  { value: 'start', label: 'Start' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'premium', label: 'Premium' },
  { value: 'plus', label: 'Plus' },
];

export const labelDeOpcao = (options, value) =>
  options.find((o) => o.value === value)?.label ?? value;

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
 * @param {Array}    props.setores      setores ativos ({ _id, nome, slug })
 * @param {() => void} props.onSuccess
 */
export function TemplateFormDialog({
  open,
  onClose,
  template,
  usuarios = [],
  setores = [],
  onSuccess,
}) {
  const editando = Boolean(template?._id);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [pops, setPops] = useState([]);

  useEffect(() => {
    if (!open) return;
    getPops({ ativo: 'true' })
      .then(setPops)
      .catch(() => setPops([]));
  }, [open]);

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
        ativo: template.ativo ?? true,
        pop: idDe(template.pop),
        checklist: Array.isArray(template.checklist)
          ? template.checklist
              .slice()
              .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
              .map((i) => ({
                titulo: i.titulo || '',
                descricao: i.descricao || '',
                obrigatorio: Boolean(i.obrigatorio),
              }))
          : [],
      });
    } else {
      setForm(VAZIO);
    }
  }, [open, editando, template]);

  const responsavelSelecionado = useMemo(
    () => usuarios.find((u) => u._id === form.responsavelPadrao) ?? null,
    [usuarios, form.responsavelPadrao]
  );

  const popSelecionado = useMemo(
    () => pops.find((p) => p._id === form.pop) ?? null,
    [pops, form.pop]
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
      ativo: form.ativo,
      pop: form.pop || (editando ? null : undefined),
      checklist: checklistParaPayload(form.checklist),
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Autocomplete
              multiple
              fullWidth
              options={TIPO_EMPRESA_OPTIONS.map((o) => o.value)}
              value={form.tipoEmpresa}
              getOptionLabel={(v) => labelDeOpcao(TIPO_EMPRESA_OPTIONS, v)}
              onChange={(_, value) => set('tipoEmpresa', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo de empresa (regime)"
                  helperText="Vazio = todos os regimes."
                />
              )}
            />

            <Autocomplete
              multiple
              fullWidth
              options={PLANO_EMPRESA_OPTIONS.map((o) => o.value)}
              value={form.planoEmpresa}
              getOptionLabel={(v) => labelDeOpcao(PLANO_EMPRESA_OPTIONS, v)}
              onChange={(_, value) => set('planoEmpresa', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Plano da empresa"
                  helperText="Vazio = todos os planos."
                />
              )}
            />
          </Stack>

          <Autocomplete
            options={pops}
            value={popSelecionado}
            getOptionLabel={(o) => o?.titulo || ''}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            onChange={(_, value) => set('pop', value?._id ?? null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="POP (opcional)"
                helperText="Procedimento herdado por todas as tarefas geradas deste template."
              />
            )}
          />

          <ChecklistEditor
            itens={form.checklist}
            onChange={(itens) => set('checklist', itens)}
            helperText="Cada tarefa gerada já nasce com estes passos para o responsável seguir."
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
