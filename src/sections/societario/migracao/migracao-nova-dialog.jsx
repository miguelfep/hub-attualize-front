'use client';

import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { createMigracao } from 'src/actions/migracao';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const FORM_INICIAL = {
  empresaNome: '',
  cnpj: '',
  contadorNome: '',
  contadorEmail: '',
  contadorTelefone: '',
  contadorEscritorio: '',
  observacoes: '',
};

/** Dialog "Nova migração": cria o registro e devolve o link de coleta. */
export function MigracaoNovaDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const handleChange = (campo) => (event) => {
    setForm((prev) => ({ ...prev, [campo]: event.target.value }));
    setErros((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = () => {
    const novos = {};
    if (!form.empresaNome.trim()) novos.empresaNome = 'Informe o nome da empresa';
    if (!form.contadorNome.trim()) novos.contadorNome = 'Informe o nome do contador anterior';
    if (!form.contadorEmail.trim() && !form.contadorTelefone.trim()) {
      novos.contadorEmail = 'Informe e-mail ou WhatsApp para envio do link';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSalvar = async () => {
    if (!validar()) return;
    try {
      setSalvando(true);
      const migracao = await createMigracao({
        empresaNome: form.empresaNome.trim(),
        cnpj: form.cnpj.trim() || undefined,
        contadorAnterior: {
          nome: form.contadorNome.trim(),
          email: form.contadorEmail.trim() || undefined,
          telefone: form.contadorTelefone.trim() || undefined,
          escritorio: form.contadorEscritorio.trim() || undefined,
        },
        observacoes: form.observacoes.trim() || undefined,
      });
      toast.success('Migração criada! O link de coleta já está disponível.');
      setForm(FORM_INICIAL);
      onCreated?.(migracao);
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Não foi possível criar a migração');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onClose={salvando ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nova migração de contabilidade</DialogTitle>
      <DialogContent>
        <Stack spacing={0.5} sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={8}>
              <TextField
                fullWidth
                label="Empresa (razão social ou nome)"
                value={form.empresaNome}
                onChange={handleChange('empresaNome')}
                error={!!erros.empresaNome}
                helperText={erros.empresaNome || ' '}
              />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField
                fullWidth
                label="CNPJ (opcional)"
                value={form.cnpj}
                onChange={handleChange('cnpj')}
                helperText=" "
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contador anterior — nome"
                value={form.contadorNome}
                onChange={handleChange('contadorNome')}
                error={!!erros.contadorNome}
                helperText={erros.contadorNome || ' '}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Escritório (opcional)"
                value={form.contadorEscritorio}
                onChange={handleChange('contadorEscritorio')}
                helperText=" "
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-mail do contador"
                type="email"
                value={form.contadorEmail}
                onChange={handleChange('contadorEmail')}
                error={!!erros.contadorEmail}
                helperText={erros.contadorEmail || ' '}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="WhatsApp do contador (com DDD)"
                value={form.contadorTelefone}
                onChange={handleChange('contadorTelefone')}
                helperText=" "
                placeholder="(41) 99999-9999"
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observações internas (opcional)"
                value={form.observacoes}
                onChange={handleChange('observacoes')}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={salvando}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={salvando} onClick={handleSalvar}>
          Criar migração
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
