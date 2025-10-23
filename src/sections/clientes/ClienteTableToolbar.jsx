import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

export function ClienteTableToolbar({ filters, onFilters }) {
  return (
    <Stack spacing={2} sx={{ p: 2.5, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            value={filters.search}
            onChange={(event) => onFilters('search', event.target.value)}
            placeholder="Buscar por nome, CNPJ, email..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold" width={24} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            select
            label="Status"
            value={filters.status}
            onChange={(event) => onFilters('status', event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Ativos</MenuItem>
            <MenuItem value="false">Inativos</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            select
            label="Tipo de Pessoa"
            value={filters.tipoPessoa}
            onChange={(event) => onFilters('tipoPessoa', event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="fisica">Física</MenuItem>
            <MenuItem value="juridica">Jurídica</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Stack>
  );
}
