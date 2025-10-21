'use client';

import { Controller } from 'react-hook-form';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

export function ClientePortalSettings({ control }) {

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h6">Funcionalidades do Portal</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Controller
            name="settings.funcionalidades.cadastroClientes"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Cadastro de Clientes"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.cadastroServicos"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Cadastro de Serviços"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.vendas"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Vendas / Orçamentos"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.agendamentos"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Agendamentos"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.emissaoNFSe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Emissão de NFSe"
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Limites</Typography>
          <Controller
            name="settings.configuracoes.limiteClientes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Limite de Clientes"
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="settings.configuracoes.limiteServicos"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Limite de Serviços"
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="settings.configuracoes.limiteOrcamentos"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Limite de Orçamentos"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
