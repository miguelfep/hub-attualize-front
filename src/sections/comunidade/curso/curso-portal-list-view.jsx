'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useCursos, useCategorias } from 'src/actions/comunidade';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CursoPortalCard } from './curso-portal-card';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;

const FILTRO_ACESSO = { todos: 'todos', minhaBiblioteca: 'minha_biblioteca' };

export function CursoPortalListView() {
  const [page, setPage] = useState(1);
  const [filtroAcesso, setFiltroAcesso] = useState(FILTRO_ACESSO.todos);
  const [filtros, setFiltros] = useState({
    categoria: 'all',
    busca: '',
  });

  const apiParams = useMemo(
    () => ({
      status: 'ativo',
      page,
      limit: PAGE_SIZE,
      ...(filtros.busca && { busca: filtros.busca }),
      ...(filtros.categoria !== 'all' && { categorias: [filtros.categoria] }),
    }),
    [page, filtros]
  );

  const { data: cursos, total, isLoading } = useCursos(apiParams);
  const { data: categorias } = useCategorias({ status: 'ativo' });

  const cursosComFiltroAcesso = useMemo(() => {
    const list = cursos || [];
    if (filtroAcesso === FILTRO_ACESSO.minhaBiblioteca) {
      return list.filter((c) => c.temAcesso === true);
    }
    return list;
  }, [cursos, filtroAcesso]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const handleFilterChange = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleFiltroAcessoChange = (_, newValue) => {
    if (newValue != null) {
      setFiltroAcesso(newValue);
      setPage(1);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Cursos"
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Comunidade', href: paths.cliente.comunidade.root },
          { name: 'Cursos' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Exibir
            </Typography>
            <ToggleButtonGroup
              value={filtroAcesso}
              exclusive
              onChange={handleFiltroAcessoChange}
              size="small"
            >
              <ToggleButton value={FILTRO_ACESSO.todos}>Todos</ToggleButton>
              <ToggleButton value={FILTRO_ACESSO.minhaBiblioteca}>Minha biblioteca</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            value={filtros.busca}
            onChange={(e) => handleFilterChange('busca', e.target.value)}
            placeholder="Buscar cursos..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { md: 320 } }}
          />

          <TextField
            fullWidth
            select
            label="Categoria"
            value={filtros.categoria}
            onChange={(e) => handleFilterChange('categoria', e.target.value)}
            sx={{ maxWidth: { md: 200 } }}
          >
            <MenuItem value="all">Todas</MenuItem>
            {categorias?.map((categoria) => (
              <MenuItem key={categoria._id} value={categoria._id}>
                {categoria.nome}
              </MenuItem>
            ))}
          </TextField>
          </Stack>
        </Stack>
      </Card>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography>Carregando cursos...</Typography>
        </Box>
      ) : cursosComFiltroAcesso.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6">
            {filtroAcesso === FILTRO_ACESSO.minhaBiblioteca
              ? 'Nenhum curso na sua biblioteca'
              : 'Nenhum curso encontrado'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filtroAcesso === FILTRO_ACESSO.minhaBiblioteca
              ? 'Cursos que você já tem acesso aparecerão aqui.'
              : 'Tente ajustar os filtros de busca'}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {cursosComFiltroAcesso.map((curso) => (
              <Grid item xs={12} sm={6} md={4} key={curso._id}>
                <CursoPortalCard curso={curso} />
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </>
      )}
    </DashboardContent>
  );
}
