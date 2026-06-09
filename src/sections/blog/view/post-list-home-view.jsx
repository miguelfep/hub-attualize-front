'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';

import { orderBy } from 'src/utils/helper';
import { ATTUALIZE_WHATSAPP_PHONE, buildWhatsAppLink } from 'src/utils/whatsapp-link';

import { POST_SORT_OPTIONS } from 'src/_mock';
import { getBlogPosts, BLOG_CATEGORIAS } from 'src/actions/blog-ssr';

import { Iconify } from 'src/components/iconify';

import { PostList } from '../post-list';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';

// ----------------------------------------------------------------------

const PER_PAGE = 15;

const WHATSAPP_LINK =
  buildWhatsAppLink({
    phoneNumber: ATTUALIZE_WHATSAPP_PHONE,
    message: 'Oi, vim pelo blog e quero falar com um contador especialista',
  });

export function PostListHomeView({ initialPosts, totalPages }) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(totalPages > 1);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoria, setCategoria] = useState('all');
  const [filterMode, setFilterMode] = useState(false);

  const observerTarget = useRef(null);
  const isLoadingRef = useRef(false);
  const observerTimeoutRef = useRef(null);

  const debouncedQuery = useDebounce(searchQuery);

  // Filtros server-side ativos?
  const filtros = useMemo(
    () => ({
      busca: debouncedQuery && debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
      categoria: categoria !== 'all' ? categoria : undefined,
    }),
    [debouncedQuery, categoria]
  );

  const isFiltering = !!filtros.busca || !!filtros.categoria;

  // Carrega uma página aplicando os filtros atuais.
  const fetchPage = useCallback(
    async (targetPage, replace) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setLoading(true);
      try {
        const { posts: result, totalPages: tp } = await getBlogPosts(targetPage, PER_PAGE, filtros);
        setPosts((prev) => {
          if (replace) return result;
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...result.filter((p) => !ids.has(p.id))];
        });
        setPage(targetPage);
        setHasMorePosts(targetPage < tp);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        setHasMorePosts(false);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [filtros]
  );

  // Quando os filtros mudam: aplica (ou restaura a lista inicial).
  useEffect(() => {
    if (isFiltering) {
      setFilterMode(true);
      fetchPage(1, true);
    } else if (filterMode) {
      setFilterMode(false);
      setPosts(initialPosts);
      setPage(1);
      setHasMorePosts(totalPages > 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const dataFiltered = useMemo(() => applyFilter({ inputData: posts, sortBy }), [posts, sortBy]);

  const loadMorePosts = useCallback(() => {
    if (loading || isLoadingRef.current || !hasMorePosts) return;
    fetchPage(page + 1, false);
  }, [loading, hasMorePosts, page, fetchPage]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    if (!hasMorePosts) return undefined;
    const currentTarget = observerTarget.current;
    if (!currentTarget) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current && hasMorePosts) {
          if (observerTimeoutRef.current) clearTimeout(observerTimeoutRef.current);
          observerTimeoutRef.current = setTimeout(() => loadMorePosts(), 400);
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    observer.observe(currentTarget);
    return () => {
      observer.unobserve(currentTarget);
      if (observerTimeoutRef.current) clearTimeout(observerTimeoutRef.current);
    };
  }, [hasMorePosts, loadMorePosts]);

  const handleSortBy = useCallback((newValue) => setSortBy(newValue), []);
  const handleSearch = useCallback((inputValue) => setSearchQuery(inputValue), []);

  return (
    <Container>
      <Typography variant="h4" sx={{ my: { xs: 3, md: 5 } }}>
        Blog
      </Typography>

      {/* Banner CTA */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: { xs: 3, md: 5 },
          borderRadius: 2,
          color: 'common.white',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.vars.palette.primary.dark}, ${theme.vars.palette.primary.main})`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="solar:chat-square-call-bold" width={32} />
          <Stack>
            <Typography variant="h6">Precisa de contabilidade especializada?</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Fale com a Anne e o time da Attualize para saúde, beleza e bem-estar.
            </Typography>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          color="success"
          size="large"
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener"
          startIcon={<Iconify icon="ic:baseline-whatsapp" />}
          sx={{ flexShrink: 0 }}
        >
          Falar no WhatsApp
        </Button>
      </Box>

      {/* Busca e ordenação */}
      <Stack
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 3 }}
      >
        <PostSearch
          query={debouncedQuery}
          results={posts}
          onSearch={handleSearch}
          loading={loading}
          hrefItem={(slug) => paths.post.details(slug)}
        />

        <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} />
      </Stack>

      {/* Filtro por categoria */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: { xs: 3, md: 5 }, flexWrap: 'wrap', gap: 1, rowGap: 1 }}
      >
        <Chip
          label="Todas"
          color={categoria === 'all' ? 'primary' : 'default'}
          variant={categoria === 'all' ? 'filled' : 'outlined'}
          onClick={() => setCategoria('all')}
        />
        {BLOG_CATEGORIAS.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            color={categoria === cat ? 'primary' : 'default'}
            variant={categoria === cat ? 'filled' : 'outlined'}
            onClick={() => setCategoria(cat)}
          />
        ))}
      </Stack>

      {/* Lista de posts */}
      <PostList
        posts={dataFiltered}
        loading={loading && posts.length === 0}
        isLoadingMore={loading && posts.length > 0}
      />

      {!loading && isFiltering && posts.length === 0 && (
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
          Nenhuma postagem encontrada para o filtro selecionado.
        </Typography>
      )}

      {/* Indicador de scroll infinito */}
      {hasMorePosts && (
        <Stack
          ref={observerTarget}
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 8, mb: { xs: 10, md: 15 }, minHeight: 60 }}
        >
          {loading && (
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Carregando mais posts...
              </Typography>
            </Stack>
          )}
          {!loading && (
            <Button
              size="large"
              variant="outlined"
              onClick={loadMorePosts}
              disabled={isLoadingRef.current}
            >
              Ver mais posts
            </Button>
          )}
        </Stack>
      )}
    </Container>
  );
}

// Ordenação por data
const applyFilter = ({ inputData, sortBy }) => {
  if (sortBy === 'latest') {
    return orderBy(inputData, ['date'], ['desc']);
  }
  if (sortBy === 'oldest') {
    return orderBy(inputData, ['date'], ['asc']);
  }
  return inputData;
};
