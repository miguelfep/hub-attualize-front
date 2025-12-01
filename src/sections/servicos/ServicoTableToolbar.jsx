import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { usePortalCategorias } from 'src/actions/portal';
import { useEmpresa } from 'src/hooks/use-empresa';
import { useAuthContext } from 'src/auth/hooks';
import { useSettings } from 'src/hooks/useSettings';

export function ServicoTableToolbar({ filters, onFilters }) {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarServicos } = useSettings();
  const { data: categorias, isLoading: loadingCategorias } = usePortalCategorias(
    podeGerenciarServicos ? clienteProprietarioId : null
  );

  return (
    <Stack spacing={2} sx={{ p: 2.5, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            value={filters.search}
            onChange={(event) => onFilters('search', event.target.value)}
            placeholder="Buscar por nome do serviço..."
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
            label="Categoria"
            value={filters.categoria}
            onChange={(event) => onFilters('categoria', event.target.value)}
            disabled={loadingCategorias}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">Todas</MenuItem>
            {Array.isArray(categorias) && categorias.length > 0 ? (
              categorias.map((categoria) => (
                <MenuItem key={categoria} value={categoria}>
                  {categoria}
                </MenuItem>
              ))
            ) : (
              !loadingCategorias && (
                <MenuItem value="" disabled>
                  Nenhuma categoria disponível
                </MenuItem>
              )
            )}
          </TextField>
        </Grid>
      </Grid>
    </Stack>
  );
}
