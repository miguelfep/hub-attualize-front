'use client';

import { useMemo, useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';

import { orderBy } from 'src/utils/helper';

import { POST_SORT_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetBlogPosts, importWordpressPosts } from 'src/actions/blog';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';
import { PostListHorizontal } from '../post-list-horizontal';

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'publicado', label: 'Publicados' },
  { value: 'rascunho', label: 'Rascunhos' },
  { value: 'arquivado', label: 'Arquivados' },
];

export function PostListView() {
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [categoria, setCategoria] = useState('all');
  const [view, setView] = useState('grid');

  const debouncedQuery = useDebounce(searchQuery);

  // Sem token a API só devolve publicados; por isso buscamos cada status e combinamos.
  const publicados = useGetBlogPosts({ status: 'publicado' });
  const rascunhos = useGetBlogPosts({ status: 'rascunho' });
  const arquivados = useGetBlogPosts({ status: 'arquivado' });

  const loading = publicados.postsLoading || rascunhos.postsLoading || arquivados.postsLoading;

  const allPosts = useMemo(
    () => [...publicados.posts, ...rascunhos.posts, ...arquivados.posts],
    [publicados.posts, rascunhos.posts, arquivados.posts]
  );

  // Categorias disponíveis (para o filtro)
  const categorias = useMemo(() => {
    const set = new Set(allPosts.map((p) => p.categoria).filter(Boolean));
    return Array.from(set).sort();
  }, [allPosts]);

  // Total de comentários novos (pendentes) em todos os posts
  const totalPendentes = useMemo(
    () => allPosts.reduce((acc, p) => acc + (p.commentsPending || 0), 0),
    [allPosts]
  );

  const refetchAll = useCallback(() => {
    publicados.postsMutate();
    rascunhos.postsMutate();
    arquivados.postsMutate();
  }, [publicados, rascunhos, arquivados]);

  const byTab = {
    all: allPosts,
    publicado: publicados.posts,
    rascunho: rascunhos.posts,
    arquivado: arquivados.posts,
  };

  const dataFiltered = applyFilter({
    inputData: byTab[statusTab] || [],
    sortBy,
    query: debouncedQuery,
    categoria,
  });

  const searchResults = applyFilter({
    inputData: allPosts,
    sortBy: 'latest',
    query: debouncedQuery,
    categoria: 'all',
  });

  const handleSortBy = useCallback((newValue) => setSortBy(newValue), []);
  const handleSearch = useCallback((inputValue) => setSearchQuery(inputValue), []);
  const handleFilterStatus = useCallback((event, newValue) => setStatusTab(newValue), []);
  const handleChangeView = useCallback((event, newView) => {
    if (newView) setView(newView);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Lista de posts"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Blog', href: paths.dashboard.post.root },
          { name: 'Lista' },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <ImportWordpressButton onImported={refetchAll} />
            <Button
              component={RouterLink}
              href={paths.dashboard.post.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Novo post
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {totalPendentes > 0 && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Iconify icon="solar:bell-bing-bold" sx={{ color: 'warning.main' }} />
          <Label color="warning">
            {totalPendentes} comentário(s) novo(s) aguardando moderação
          </Label>
        </Stack>
      )}

      <Stack
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <PostSearch
          query={debouncedQuery}
          results={searchResults}
          onSearch={handleSearch}
          loading={loading}
          hrefItem={(slug) => paths.dashboard.post.details(slug)}
        />

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {categorias.length > 0 && (
            <TextField
              select
              size="small"
              label="Categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">Todas</MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          )}

          <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} />

          <ToggleButtonGroup size="small" exclusive value={view} onChange={handleChangeView}>
            <ToggleButton value="grid" aria-label="Ver em cards">
              <Iconify icon="solar:widget-5-bold" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="Ver em lista">
              <Iconify icon="solar:list-bold" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Tabs value={statusTab} onChange={handleFilterStatus} sx={{ mb: { xs: 3, md: 5 } }}>
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'all' ? allPosts.length : (byTab[tab.value] || []).length;
          return (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={((tab.value === 'all' || tab.value === statusTab) && 'filled') || 'soft'}
                  color={
                    (tab.value === 'publicado' && 'success') ||
                    (tab.value === 'rascunho' && 'warning') ||
                    'default'
                  }
                >
                  {count}
                </Label>
              }
            />
          );
        })}
      </Tabs>

      <PostListHorizontal posts={dataFiltered} loading={loading} onChanged={refetchAll} view={view} />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function ImportWordpressButton({ onImported }) {
  const dialog = useBoolean();
  const submitting = useBoolean();
  const publicar = useBoolean(true);
  const [limite, setLimite] = useState(5);

  const handleImport = async () => {
    submitting.onTrue();
    try {
      const result = await importWordpressPosts({
        limite: Number(limite) || 0,
        publicar: publicar.value,
      });
      toast.success(
        `Importação concluída${result?.importados != null ? `: ${result.importados} post(s)` : ''}.`
      );
      dialog.onFalse();
      onImported?.();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Falha ao importar do WordPress.');
    } finally {
      submitting.onFalse();
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<Iconify icon="ri:wordpress-fill" />}
        onClick={dialog.onTrue}
      >
        Importar WordPress
      </Button>

      <Dialog open={dialog.value} onClose={dialog.onFalse} fullWidth maxWidth="xs">
        <DialogTitle>Importar posts do WordPress</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Reescreve os posts do WordPress institucional com IA. É idempotente: posts já importados
            são ignorados. Use limite 0 para importar todos.
          </DialogContentText>
          <TextField
            fullWidth
            type="number"
            label="Limite (0 = todos)"
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
            inputProps={{ min: 0 }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={<Switch checked={publicar.value} onChange={publicar.onToggle} />}
            label="Publicar ao importar (desligado = rascunho)"
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={dialog.onFalse}>
            Cancelar
          </Button>
          <LoadingButton variant="contained" loading={submitting.value} onClick={handleImport}>
            Importar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, sortBy, query, categoria }) => {
  let data = inputData;

  if (query) {
    const q = query.toLowerCase();
    data = data.filter(
      (post) =>
        post.title?.toLowerCase().includes(q) ||
        post.description?.toLowerCase().includes(q) ||
        post.categoria?.toLowerCase().includes(q)
    );
  }

  if (categoria && categoria !== 'all') {
    data = data.filter((post) => post.categoria === categoria);
  }

  if (sortBy === 'latest') {
    data = orderBy(data, ['createdAt'], ['desc']);
  }
  if (sortBy === 'oldest') {
    data = orderBy(data, ['createdAt'], ['asc']);
  }

  return data;
};
