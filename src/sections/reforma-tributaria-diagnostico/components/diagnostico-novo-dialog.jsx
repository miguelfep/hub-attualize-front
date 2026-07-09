'use client';

import { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { getClientes } from 'src/actions/clientes';
import { criarDiagnostico, normalizarDiagnostico } from 'src/actions/reforma-tributaria-diagnostico';

import { toast } from 'src/components/snackbar';

import { compactObject, numberInputToNumber, percentInputToFraction } from '../utils';

// ----------------------------------------------------------------------

const competenciaAtual = () => new Date().toISOString().slice(0, 7);

const INITIAL_FORM = {
  competenciaBase: '',
  receitaMensalProjetada: '',
  mixB2B: '',
  margemLucroAlvo: '',
  custosFixosMensais: '',
  custosVariaveisMensais: '',
  folhaMensal: '',
};

/** Dialog de criação de rascunho de diagnóstico (backoffice). */
export function DiagnosticoNovoDialog({ open, onClose, onCreated }) {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setCliente(null);
    setForm({ ...INITIAL_FORM, competenciaBase: competenciaAtual() });

    let ativo = true;
    (async () => {
      try {
        setLoadingClientes(true);
        const res = await getClientes({ status: true, tipoContato: 'cliente' });
        if (ativo) setClientes(Array.isArray(res) ? res : res?.clientes || []);
      } catch {
        if (ativo) setClientes([]);
        toast.error('Erro ao carregar clientes');
      } finally {
        if (ativo) setLoadingClientes(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!cliente?._id) {
      toast.error('Selecione o cliente');
      return;
    }
    if (!form.competenciaBase) {
      toast.error('Informe a competência base');
      return;
    }

    const entradas = compactObject({
      receitaMensalProjetada: numberInputToNumber(form.receitaMensalProjetada),
      mixB2B: percentInputToFraction(form.mixB2B),
      margemLucroAlvo: percentInputToFraction(form.margemLucroAlvo),
      custosFixosMensais: numberInputToNumber(form.custosFixosMensais),
      custosVariaveisMensais: numberInputToNumber(form.custosVariaveisMensais),
      folhaMensal: numberInputToNumber(form.folhaMensal),
    });

    try {
      setSaving(true);
      const res = await criarDiagnostico(
        compactObject({
          clienteId: cliente._id,
          competenciaBase: form.competenciaBase,
          entradas,
        })
      );
      toast.success('Diagnóstico criado');
      const criado = normalizarDiagnostico(res);
      onCreated?.(criado?._id || criado?.id || null);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erro ao criar diagnóstico');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Novo diagnóstico da Reforma Tributária</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Autocomplete
            fullWidth
            options={clientes}
            loading={loadingClientes}
            getOptionLabel={(option) => formatClienteCodigoRazao(option)}
            isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
            value={cliente}
            onChange={(_, newValue) => setCliente(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Cliente" placeholder="Digite para buscar" required />
            )}
          />

          <TextField
            fullWidth
            required
            type="month"
            label="Competência base"
            InputLabelProps={{ shrink: true }}
            value={form.competenciaBase}
            onChange={handleChange('competenciaBase')}
          />

          <Typography variant="subtitle2" color="text.secondary">
            Dados iniciais (opcionais — podem ser preenchidos depois)
          </Typography>

          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Receita mensal projetada"
                inputMode="decimal"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                value={form.receitaMensalProjetada}
                onChange={handleChange('receitaMensalProjetada')}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mix de vendas B2B"
                inputMode="decimal"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={form.mixB2B}
                onChange={handleChange('mixB2B')}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Margem de lucro alvo"
                inputMode="decimal"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={form.margemLucroAlvo}
                onChange={handleChange('margemLucroAlvo')}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Custos fixos mensais"
                inputMode="decimal"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                value={form.custosFixosMensais}
                onChange={handleChange('custosFixosMensais')}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Custos variáveis mensais"
                inputMode="decimal"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                value={form.custosVariaveisMensais}
                onChange={handleChange('custosVariaveisMensais')}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Folha mensal"
                inputMode="decimal"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                value={form.folhaMensal}
                onChange={handleChange('folhaMensal')}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={saving} onClick={handleSubmit}>
          Criar rascunho
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
