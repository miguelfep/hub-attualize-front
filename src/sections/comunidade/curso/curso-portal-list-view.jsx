'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { useCursos, useCategorias } from 'src/actions/comunidade';

import { CursoPortalCard } from './curso-portal-card';

// ----------------------------------------------------------------------

export function CursoPortalListView() {
  const [filtros, setFiltros] = useState({
    categoria: 'all',
    busca: '',
  });

  const { data: cursos, isLoading } = useCursos({
    status: 'ativo',
    ...(filtros.busca && { busca: filtros.busca }),
  });

  const { data: categorias } = useCategorias({ status: 'ativo' });

  const cursosFiltrados = useMemo(() => {
    let filtrados = cursos || [];

    if (filtros.categoria !== 'all') {
      filtrados = filtrados.filter((curso) =>
        curso.categorias?.some((cat) => {
          const catId = typeof cat === 'string' ? cat : cat._id;
          return catId === filtros.categoria;
        })
      );
    }

    return filtrados;
  }, [cursos, filtros]);

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
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <TextField
            fullWidth
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
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
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
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
      </Card>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography>Carregando cursos...</Typography>
        </Box>
      ) : cursosFiltrados.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6">Nenhum curso encontrado</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tente ajustar os filtros de busca
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cursosFiltrados.map((curso) => (
            <Grid item xs={12} sm={6} md={4} key={curso._id}>
              <CursoPortalCard curso={curso} />
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardContent>
  );
}
