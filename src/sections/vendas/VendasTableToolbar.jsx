import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function OrcamentoTableToolbar({ filters, onFilters }) {
  return (
    <Stack
      spacing={2}
      sx={{
        p: 2.5,
        borderTop: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            value={filters.search || ''}
            onChange={(event) => onFilters('search', event.target.value)}
            placeholder="Buscar por cliente, nº do orçamento..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold" width={24} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            select
            label="Status"
            value={filters.status || ''}
            onChange={(event) => onFilters('status', event.target.value)}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="aprovado">Aprovado</MenuItem>
            <MenuItem value="pago">Pago</MenuItem>
            <MenuItem value="recusado">Recusado</MenuItem>
            <MenuItem value="expirado">Expirado</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={6} sm={4} md={2.5}>
          <TextField
            fullWidth
            type="date"
            label="Data de Início"
            value={filters.dataInicio || ''}
            onChange={(event) => onFilters('dataInicio', event.target.value)}
            InputLabelProps={{ shrink: true }} // Essencial para inputs de data
          />
        </Grid>

        {/* Filtro de Data Fim */}
        <Grid item xs={6} sm={4} md={2.5}>
          <TextField
            fullWidth
            type="date"
            label="Data Final"
            value={filters.dataFim || ''}
            onChange={(event) => onFilters('dataFim', event.target.value)}
            InputLabelProps={{ shrink: true }} 
          />
        </Grid>
      </Grid>
    </Stack>
  );
}