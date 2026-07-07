'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { criarPop, getPopById, atualizarPop } from 'src/actions/pops';

import { Editor } from 'src/components/editor';

import { setorNome } from '../tarefas/utils';

// ----------------------------------------------------------------------

const VAZIO = {
  titulo: '',
  descricao: '',
  conteudo: '',
  setores: [],
  ativo: true,
};

// ----------------------------------------------------------------------

/**
 * Dialog de criação/edição de POP (apenas Gestores).
 *
 * Ao editar, o POP completo é buscado via `getPopById` antes de popular o
 * formulário — as linhas da listagem não carregam `conteudo`.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {() => void} props.onClose
 * @param {object=}  props.pop        POP a editar (undefined → criação)
 * @param {Array}    props.setores    setores ativos ({ _id, nome, slug })
 * @param {() => void} props.onSuccess
 */
export function PopFormDialog({ open, onClose, pop, setores = [], onSuccess }) {
  const editando = Boolean(pop?._id);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState(VAZIO);

  useEffect(() => {
    if (!open) return undefined;

    if (!editando) {
      setForm(VAZIO);
      return undefined;
    }

    let ativo = true;
    setCarregando(true);
    getPopById(pop._id)
      .then((completo) => {
        if (!ativo) return;
        const dados = completo || pop;
        setForm({
          titulo: dados.titulo || '',
          descricao: dados.descricao || '',
          conteudo: dados.conteudo || '',
          setores: Array.isArray(dados.setores) ? dados.setores : [],
          ativo: dados.ativo ?? true,
        });
      })
      .catch((e) => {
        if (!ativo) return;
        toast.error(e?.message || e?.response?.data?.message || 'Erro ao carregar o POP.');
        setForm({
          titulo: pop.titulo || '',
          descricao: pop.descricao || '',
          conteudo: '',
          setores: Array.isArray(pop.setores) ? pop.setores : [],
          ativo: pop.ativo ?? true,
        });
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [open, editando, pop]);

  const set = (campo, valor) => setForm((p) => ({ ...p, [campo]: valor }));

  const handleSalvar = async () => {
    if (!form.titulo.trim()) {
      toast.error('Informe o título do POP.');
      return;
    }
    const conteudoSemHtml = form.conteudo.replace(/<[^>]*>/g, '').trim();
    if (!conteudoSemHtml) {
      toast.error('Informe o conteúdo do POP.');
      return;
    }

    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || undefined,
      conteudo: form.conteudo,
      setores: form.setores,
    };
    if (editando) payload.ativo = form.ativo;

    setSalvando(true);
    try {
      if (editando) {
        await atualizarPop(pop._id, payload);
        toast.success('POP atualizado.');
      } else {
        await criarPop(payload);
        toast.success('POP criado.');
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Erro ao salvar o POP.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editando ? 'Editar POP' : 'Novo POP'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Título"
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
            helperText="Resumo curto exibido na listagem"
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
                helperText="Setores relacionados ao procedimento. Vazio = todos."
              />
            )}
          />

          {editando && (
            <FormControlLabel
              control={
                <Switch checked={form.ativo} onChange={(e) => set('ativo', e.target.checked)} />
              }
              label="Ativo"
            />
          )}

          <Stack spacing={1}>
            <Typography variant="subtitle2">Conteúdo do POP (passo a passo)</Typography>
            <Editor
              value={form.conteudo}
              onChange={(html) => set('conteudo', html)}
              placeholder="Descreva o procedimento passo a passo..."
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          loading={salvando}
          disabled={carregando}
          onClick={handleSalvar}
        >
          Salvar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
