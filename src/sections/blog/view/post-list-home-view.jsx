'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';

import { orderBy } from 'src/utils/helper';

import { POST_SORT_OPTIONS } from 'src/_mock';
import { getPosts, searchPosts } from 'src/actions/blog-ssr';

import { PostList } from '../post-list';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';

// ----------------------------------------------------------------------

export function PostListHomeView({ initialPosts, totalPages }) {
  // Estado para posts, página atual, e carregamento
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(totalPages > 1);
  const [loading, setLoading] = useState(false);

  // Estado para ordenação e busca
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // Flag para rastrear se estamos em modo de busca
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Ref para o elemento de observação (infinite scroll)
  const observerTarget = useRef(null);
  
  // Ref para evitar múltiplas chamadas simultâneas
  const isLoadingRef = useRef(false);
  
  // Ref para debounce do Intersection Observer
  const observerTimeoutRef = useRef(null);

  // Debounce para evitar chamadas frequentes de busca
  const debouncedQuery = useDebounce(searchQuery);

  // Hook customizado para buscar os posts
  // Função para buscar posts
  const loadSearchResults = useCallback(async () => {
    setLoading(true);

    try {
      const { posts: searchResults } = await searchPosts(debouncedQuery, page); // Chama a função de busca

      setPosts(searchResults); // Atualiza os posts com os resultados da busca
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page]);

  // Efeito para executar a busca quando o usuário digitar algo
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim() !== '') {
      setIsSearchMode(true);
      loadSearchResults();
    } else if (isSearchMode && (!debouncedQuery || debouncedQuery.trim() === '')) {
      // Só restaura quando sair do modo de busca (quando a busca for realmente limpa)
      setIsSearchMode(false);
      setPosts(initialPosts);
      setPage(1);
      setHasMorePosts(totalPages > 1);
    }
  }, [debouncedQuery, loadSearchResults, isSearchMode, initialPosts, totalPages]);

  // Mapeando e adaptando os dados recebidos da API do WordPress (memoizado)
  const formattedPosts = useMemo(
    () =>
      posts.map((post) => ({
        id: post.id,
        title: post.title.rendered,
        date: post.date,
        content: post.content.rendered,
        excerpt: post.excerpt.rendered,
        slug: post.slug,
        link: post.link,
        author: post._embedded?.author[0]?.name || 'Autor Desconhecido',
        authorAvatar:
          post._embedded?.author?.[0]?.avatar_urls?.['96'] ||
          post._embedded?.author?.[0]?.avatar_urls?.['48'] ||
          null,
        imageUrl: post.yoast_head_json?.og_image?.[0]?.url || '/default-image.png',
      })),
    [posts]
  );

  // Aplicar ordenação e filtros nos posts (memoizado)
  const dataFiltered = useMemo(
    () => applyFilter({ inputData: formattedPosts, sortBy }),
    [formattedPosts, sortBy]
  );

  // Função para carregar mais posts
  const loadMorePosts = useCallback(async () => {
    // Verificações de segurança para evitar múltiplas chamadas
    if (
      page >= totalPages || 
      loading || 
      debouncedQuery || 
      isSearchMode ||
      isLoadingRef.current // Evita múltiplas chamadas simultâneas
    ) {
      return;
    }
    
    // Marca como carregando
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const { posts: newPosts } = await getPosts(nextPage, 15); // Busca apenas a próxima página com 15 posts

      if (newPosts.length > 0) {
        // Adiciona os novos posts aos existentes (sem fazer reload)
        setPosts((prevPosts) => {
          // Verifica se os posts já não foram adicionados (evita duplicatas)
          const existingIds = new Set(prevPosts.map((p) => p.id));
          const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id));
          
          if (uniqueNewPosts.length === 0) {
            // Se não há posts novos, não há mais para carregar
            setHasMorePosts(false);
            return prevPosts;
          }
          
          return [...prevPosts, ...uniqueNewPosts];
        });
        setPage(nextPage); // Atualiza a página atual
        if (nextPage >= totalPages) {
          setHasMorePosts(false); // Não há mais posts para carregar
        }
      } else {
        setHasMorePosts(false); // Não há mais posts para carregar
      }
    } catch (error) {
      console.error('Erro ao carregar mais posts:', error);
      setHasMorePosts(false); // Em caso de erro, para de tentar carregar
    } finally {
      setLoading(false);
      isLoadingRef.current = false; // Libera para próxima chamada
    }
  }, [page, totalPages, loading, debouncedQuery, isSearchMode]);

  // Intersection Observer para infinite scroll automático
  useEffect(() => {
    // Não criar observer se estiver em busca ou não houver mais posts
    if (debouncedQuery || !hasMorePosts || isSearchMode) {
      return undefined;
    }

    const currentTarget = observerTarget.current;
    if (!currentTarget) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        // Verifica se o elemento está visível e todas as condições estão OK
        if (
          entry.isIntersecting && 
          hasMorePosts && 
          !loading && 
          !debouncedQuery && 
          !isSearchMode &&
          !isLoadingRef.current // Garante que não está carregando
        ) {
          // Limpa timeout anterior se existir
          if (observerTimeoutRef.current) {
            clearTimeout(observerTimeoutRef.current);
          }
          
          // Debounce de 500ms para evitar múltiplas chamadas rápidas
          observerTimeoutRef.current = setTimeout(() => {
            // Verifica novamente antes de carregar (pode ter mudado durante o timeout)
            if (
              !isLoadingRef.current && 
              hasMorePosts && 
              !loading && 
              !debouncedQuery && 
              !isSearchMode &&
              page < totalPages
            ) {
              loadMorePosts();
            }
          }, 500);
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '400px' // Carrega 400px antes de chegar no elemento
      }
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
      // Limpa timeout ao desmontar
      if (observerTimeoutRef.current) {
        clearTimeout(observerTimeoutRef.current);
      }
    };
  }, [hasMorePosts, loading, debouncedQuery, isSearchMode, loadMorePosts, page, totalPages]);

  // Atualiza o estado da ordenação
  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  // Atualiza o estado da busca
  const handleSearch = useCallback((inputValue) => {
    setSearchQuery(inputValue);
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ my: { xs: 3, md: 5 } }}>
        Blog
      </Typography>

      {/* Seção de busca e ordenação */}
      <Stack
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <PostSearch
          query={debouncedQuery}
          results={posts}
          onSearch={handleSearch}
          loading={loading}
          hrefItem={(slug) => paths.post.details(slug)} // Usar slug para criar o link
        />

        <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} />
      </Stack>

      {/* Lista de posts filtrados */}
      <PostList 
        posts={dataFiltered} 
        loading={loading && posts.length === 0} 
        isLoadingMore={loading && posts.length > 0}
      />

      {/* Indicador de carregamento para infinite scroll */}
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
          {/* Fallback: botão manual caso o Intersection Observer não funcione */}
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

// Função de filtro para ordenar os posts
const applyFilter = ({ inputData, sortBy }) => {
  if (sortBy === 'latest') {
    return orderBy(inputData, ['date'], ['desc']);
  }

  if (sortBy === 'oldest') {
    return orderBy(inputData, ['date'], ['asc']);
  }

  return inputData;
};
