'use client';

import { useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

import { useGetSettings, updateSettings } from 'src/actions/settings';

import { toast } from 'src/components/snackbar';

export function ClientePortalSettings({ clienteId }) {
  const { settings, settingsLoading, refetchSettings } = useGetSettings(clienteId);

  const [saving, setSaving] = useState(false);

  const funcionalidades = useMemo(
    () => ({
      emissaoNFSe: Boolean(settings?.funcionalidades?.emissaoNFSe),
      cadastroClientes: Boolean(settings?.funcionalidades?.cadastroClientes),
      cadastroServicos: Boolean(settings?.funcionalidades?.cadastroServicos),
      vendas: Boolean(settings?.funcionalidades?.vendas),
      agendamentos: Boolean(settings?.funcionalidades?.agendamentos),
    }),
    [settings]
  );

  const configuracoes = useMemo(
    () => ({
      limiteClientes: settings?.configuracoes?.limiteClientes ?? '',
      limiteServicos: settings?.configuracoes?.limiteServicos ?? '',
      limiteOrcamentos: settings?.configuracoes?.limiteOrcamentos ?? '',
    }),
    [settings]
  );

  const [localState, setLocalState] = useState({ funcionalidades, configuracoes });

  // Atualiza local state quando settings carregar
  const syncLocal = () => setLocalState({ funcionalidades, configuracoes });

  const handleToggle = (key) => (event) => {
    setLocalState((prev) => ({
      ...prev,
      funcionalidades: { ...prev.funcionalidades, [key]: event.target.checked },
    }));
  };

  const handleConfigChange = (key) => (event) => {
    const {value} = event.target;
    setLocalState((prev) => ({
      ...prev,
      configuracoes: { ...prev.configuracoes, [key]: value === '' ? '' : Number(value) },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings(clienteId, {
        funcionalidades: localState.funcionalidades,
        configuracoes: localState.configuracoes,
      });
      toast.success('Configurações atualizadas com sucesso');
      await refetchSettings();
      syncLocal();
    } catch (error) {
      toast.error('Falha ao atualizar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Funcionalidades do Portal</Typography>
        <LoadingButton loading={saving} variant="contained" onClick={handleSave}>
          Salvar Configurações
        </LoadingButton>
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.cadastroClientes} onChange={handleToggle('cadastroClientes')} />}
            label="Cadastro de Clientes"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.cadastroServicos} onChange={handleToggle('cadastroServicos')} />}
            label="Cadastro de Serviços"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.vendas} onChange={handleToggle('vendas')} />}
            label="Vendas / Orçamentos"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.agendamentos} onChange={handleToggle('agendamentos')} />}
            label="Agendamentos"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.emissaoNFSe} onChange={handleToggle('emissaoNFSe')} />}
            label="Emissão de NFSe"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Limites</Typography>
          <TextField
            fullWidth
            type="number"
            label="Limite de Clientes"
            value={localState.configuracoes.limiteClientes}
            onChange={handleConfigChange('limiteClientes')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Limite de Serviços"
            value={localState.configuracoes.limiteServicos}
            onChange={handleConfigChange('limiteServicos')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Limite de Orçamentos"
            value={localState.configuracoes.limiteOrcamentos}
            onChange={handleConfigChange('limiteOrcamentos')}
          />
        </Grid>
      </Grid>

      {settingsLoading && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Carregando configurações...
        </Typography>
      )}
    </Box>
  );
}


