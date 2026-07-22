import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { criarCanal, atualizarCanal } from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Cria/edita um canal (número do WhatsApp). O accessToken é write-only: na
// edição fica em branco e só é enviado se o admin digitar um novo.
// ----------------------------------------------------------------------

const VAZIO = {
  nome: '',
  phoneDisplay: '',
  phoneNumberId: '',
  wabaId: '',
  accessToken: '',
  ativo: true,
  padrao: false,
};

export function WaCanalDialog({ open, canal, onClose, onSalvo }) {
  const edicao = !!canal?._id;
  const [form, setForm] = useState(VAZIO);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMostrarToken(false);
    setForm(
      canal
        ? {
            nome: canal.nome || '',
            phoneDisplay: canal.phoneDisplay || '',
            phoneNumberId: canal.phoneNumberId || '',
            wabaId: canal.wabaId || '',
            accessToken: '', // write-only
            ativo: canal.ativo ?? true,
            padrao: canal.padrao ?? false,
          }
        : VAZIO
    );
  }, [open, canal]);

  const set = (campo) => (e) =>
    setForm((prev) => ({
      ...prev,
      [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSalvar = useCallback(async () => {
    if (!form.nome.trim() || !form.phoneNumberId.trim() || !form.wabaId.trim()) {
      toast.error('Preencha nome, Phone Number ID e WABA ID.');
      return;
    }
    if (!edicao && !form.accessToken.trim()) {
      toast.error('Informe o Access Token do canal.');
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      phoneDisplay: form.phoneDisplay.trim() || undefined,
      phoneNumberId: form.phoneNumberId.trim(),
      wabaId: form.wabaId.trim(),
      ativo: form.ativo,
      padrao: form.padrao,
    };
    // Só envia o token quando o admin digitou algo (não sobrescreve com vazio).
    if (form.accessToken.trim()) payload.accessToken = form.accessToken.trim();

    setSalvando(true);
    try {
      if (edicao) await atualizarCanal(canal._id, payload);
      else await criarCanal(payload);
      toast.success(edicao ? 'Canal atualizado.' : 'Canal criado.');
      onSalvo?.();
    } catch (error) {
      toast.error(error?.message || 'Falha ao salvar o canal.');
    } finally {
      setSalvando(false);
    }
  }, [form, edicao, canal, onSalvo]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{edicao ? 'Editar canal' : 'Novo canal'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Nome do canal"
            value={form.nome}
            onChange={set('nome')}
            placeholder="Ex.: Comercial, Suporte…"
            required
          />
          <TextField
            label="Número exibido"
            value={form.phoneDisplay}
            onChange={set('phoneDisplay')}
            placeholder="+55 41 99999-9999"
            helperText="Apenas para exibição no hub."
          />

          <Divider />
          <Typography variant="subtitle2">Credenciais da Meta (Cloud API)</Typography>

          <TextField
            label="Phone Number ID"
            value={form.phoneNumberId}
            onChange={set('phoneNumberId')}
            required
          />
          <TextField label="WABA ID" value={form.wabaId} onChange={set('wabaId')} required />
          <TextField
            label={edicao ? 'Access Token (deixe em branco p/ manter)' : 'Access Token'}
            value={form.accessToken}
            onChange={set('accessToken')}
            type={mostrarToken ? 'text' : 'password'}
            required={!edicao}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setMostrarToken((v) => !v)} edge="end">
                    <Iconify icon={mostrarToken ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Divider />
          <Stack direction="row" spacing={3}>
            <FormControlLabel
              control={<Switch checked={form.ativo} onChange={set('ativo')} />}
              label="Ativo"
            />
            <FormControlLabel
              control={<Switch checked={form.padrao} onChange={set('padrao')} />}
              label="Canal padrão"
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" onClick={handleSalvar} loading={salvando}>
          {edicao ? 'Salvar' : 'Criar'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
