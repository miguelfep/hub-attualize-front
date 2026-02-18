'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { useMateriais, useCategorias } from 'src/actions/comunidade';

import { MaterialPortalCard } from './material-portal-card';

// ----------------------------------------------------------------------

export function MaterialPortalListView() {
  const [filtros, setFiltros] = useState({
    tipo: 'all',
    categoria: 'all',
    busca: '',
  });

  const { data: materiais, isLoading } = useMateriais({
    status: 'ativo',
    ...(filtros.tipo !== 'all' && { tipo: filtros.tipo }),
    ...(filtros.busca && { busca: filtros.busca }),
  });

  const { data: categorias } = useCategorias({ status: 'ativo' });

  const materiaisFiltrados = useMemo(() => {
    let filtrados = materiais || [];

    if (filtros.categoria !== 'all') {
      filtrados = filtrados.filter((material) =>
        material.categorias?.some((cat) => {
          const catId = typeof cat === 'string' ? cat : cat._id;
          return catId === filtros.categoria;
        })
      );
    }

    return filtrados;
  }, [materiais, filtros]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Biblioteca de Materiais"
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Comunidade' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <TextField
            fullWidth
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            placeholder="Buscar materiais..."
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
            label="Tipo"
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            sx={{ maxWidth: { md: 200 } }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="ebook">E-book</MenuItem>
            <MenuItem value="videoaula">Videoaula</MenuItem>
            <MenuItem value="documento">Documento</MenuItem>
            <MenuItem value="link">Link</MenuItem>
          </TextField>

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
          <Typography>Carregando...</Typography>
        </Box>
      ) : materiaisFiltrados.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Nenhum material encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente ajustar os filtros ou aguarde novos materiais serem adicionados.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {materiaisFiltrados.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material._id}>
              <MaterialPortalCard material={material} />
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardContent>
  );
}
