'use client';

import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

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
  const [hasMorePosts, setHasMorePosts] = useState(page < totalPages);
  const [loading, setLoading] = useState(false);

  // Estado para ordenação e busca
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (debouncedQuery) {
      loadSearchResults();
    }
  }, [debouncedQuery, loadSearchResults]);

  // Mapeando e adaptando os dados recebidos da API do WordPress
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title.rendered,
    date: post.date,
    content: post.content.rendered,
    excerpt: post.excerpt.rendered,
    slug: post.slug,
    link: post.link,
    author: post._embedded?.author[0]?.name || 'Autor Desconhecido',
    imageUrl: post.jetpack_featured_media_url || '/default-image.png',
  }));

  // Aplicar ordenação e filtros nos posts
  const dataFiltered = applyFilter({ inputData: formattedPosts, sortBy });

  // Função para carregar mais posts
  const loadMorePosts = async () => {
    if (page >= totalPages || loading) return; // Não carrega se não houver mais posts ou se estiver carregando
    setLoading(true);

    try {
      const nextPage = page + 1;
      const { posts: newPosts } = await getPosts(nextPage, 10); // Busca a próxima página

      if (newPosts.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]); // Adiciona os novos posts
        setPage(nextPage); // Atualiza a página atual
        if (nextPage >= totalPages) {
          setHasMorePosts(false); // Não há mais posts para carregar
        }
      } else {
        setHasMorePosts(false); // Não há mais posts para carregar
      }
    } catch (error) {
      console.error('Erro ao carregar mais posts:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <PostList posts={dataFiltered} loading={loading} />

      {/* Botão "Ver mais" */}
      {hasMorePosts && (
        <Stack alignItems="center" sx={{ mt: 8, mb: { xs: 10, md: 15 } }}>
          <Button
            size="large"
            variant="outlined"
            onClick={loadMorePosts}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Ver mais'}
          </Button>
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
