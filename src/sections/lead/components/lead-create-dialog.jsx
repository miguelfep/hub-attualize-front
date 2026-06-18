import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { saveLeadProgress } from 'src/actions/lead';
import { getUsersInternos } from 'src/actions/users';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { LEAD_STATUS_OPTIONS } from '../lead-status';
import { filtrarUsuariosResponsavel } from '../lead-permissions';

// ----------------------------------------------------------------------

const VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  segment: '',
  origem: 'manual',
  statusLead: 'novo',
  observacoes: '',
};

export function LeadCreateDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState(VAZIO);
  const [responsavel, setResponsavel] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);

  // Carrega usuários elegíveis a responsável (comerciais + gestores).
  useEffect(() => {
    if (!open) return;
    getUsersInternos()
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setUsuarios(filtrarUsuariosResponsavel(Array.isArray(data) ? data : []));
      })
      .catch(() => setUsuarios([]));
  }, [open]);

  const setField = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.value }));

  const handleClose = () => {
    if (saving) return;
    setForm(VAZIO);
    setResponsavel(null);
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      toast.warning('Informe o nome do lead');
      return;
    }
    setSaving(true);
    try {
      const res = await saveLeadProgress({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        segment: form.segment.trim(),
        origem: form.origem.trim() || 'manual',
        statusLead: form.statusLead,
        observacoes: form.observacoes.trim(),
        ...(responsavel && { owner: responsavel.name, ownerId: responsavel._id }),
        additionalInfo: { etapa: 'manual' },
      });

      if (res?.success) {
        toast.success('Lead criado com sucesso!');
        setForm(VAZIO);
        setResponsavel(null);
        onCreated?.(res.leadId);
        onClose?.();
      } else {
        toast.error(res?.error || 'Erro ao criar lead');
      }
    } catch (error) {
      toast.error('Erro ao criar lead');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar Lead</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid xs={12}>
            <TextField
              fullWidth
              required
              autoFocus
              label="Nome"
              value={form.nome}
              onChange={setField('nome')}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField fullWidth label="E-mail" value={form.email} onChange={setField('email')} />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={form.telefone}
              onChange={setField('telefone')}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Segmento"
              placeholder="ex.: psicólogo, dentista..."
              value={form.segment}
              onChange={setField('segment')}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField fullWidth label="Origem" value={form.origem} onChange={setField('origem')} />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.statusLead}
              onChange={setField('statusLead')}
            >
              {LEAD_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12}>
            <Autocomplete
              fullWidth
              options={usuarios}
              value={responsavel}
              onChange={(e, value) => setResponsavel(value)}
              getOptionLabel={(o) => o?.name || o?.email || ''}
              isOptionEqualToValue={(o, v) => o._id === v?._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Responsável (opcional)"
                  placeholder="Atribuir a um responsável"
                />
              )}
              renderOption={(props, option) => (
                <Stack component="li" direction="row" spacing={1} alignItems="center" {...props}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                    {option.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <span>{option.name}</span>
                </Stack>
              )}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={form.observacoes}
              onChange={setField('observacoes')}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          loading={saving}
          onClick={handleSubmit}
          startIcon={<Iconify icon="solar:add-circle-bold" />}
        >
          Criar Lead
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
