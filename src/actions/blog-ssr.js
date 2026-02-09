
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

// Fetch all posts with pagination
export async function getPosts(page = 1, perPage = 10) {
  try {
    const params = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
      _embed: 'true',
    });

    // Usar fetch nativo do Next.js com cache
    const res = await fetch(
      `https://attualizecontabil.com.br/wp-json/wp/v2/posts?${params.toString()}`,
      {
        // Cache do Next.js: revalida a cada 30 minutos (1800 segundos)
        next: { revalidate: 1800 },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await res.json();
    const totalPosts = parseInt(res.headers.get('x-wp-total') || '0', 10);
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '0', 10);

    return {
      posts: data, // Post data from response
      totalPosts, // Total number of posts for client-side info
      totalPages, // Total number of pages for pagination
    };
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return { posts: [], totalPosts: 0, totalPages: 0 }; // Return empty array on failure
  }
}

// ----------------------------------------------------------------------

export async function getPostBySlug(slug) {
  try {
    // Garantir que o slug não está vazio e está no formato correto
    if (!slug) {
      console.warn('getPostBySlug: Slug não fornecido ou é undefined/null');
      return null;
    }

    if (typeof slug !== 'string') {
      console.warn('getPostBySlug: Slug não é uma string:', typeof slug, slug);
      return null;
    }

    // Decodificar o slug caso esteja encoded (ex: %20 para espaços)
    let decodedSlug = slug.trim();
    try {
      decodedSlug = decodeURIComponent(decodedSlug);
    } catch (e) {
      // Se falhar ao decodificar, usar o slug original
      console.warn('Erro ao decodificar slug, usando original:', e);
    }
    
    console.log('Buscando post com slug:', decodedSlug);

    // Tentar diferentes variações do slug
    const slugVariations = [
      decodedSlug, // Slug original decodificado
      slug.trim(), // Slug original sem decodificar
      decodedSlug.toLowerCase(), // Slug em minúsculas
      decodedSlug.replace(/-/g, ' '), // Substituir hífens por espaços
    ];

    // Remover duplicatas
    const uniqueSlugs = [...new Set(slugVariations)];

    // Função auxiliar para tentar buscar um post com um slug específico
    const tryFetchPostWithSlug = async (slugToTry) => {
      try {
        const params = new URLSearchParams({
          slug: slugToTry,
          _embed: 'true',
          per_page: '1',
        });

        const apiUrl = `https://attualizecontabil.com.br/wp-json/wp/v2/posts?${params.toString()}`;
        console.log('Tentando buscar com slug:', slugToTry, 'URL:', apiUrl);

        // Usar fetch nativo do Next.js com cache
        const res = await fetch(apiUrl, {
          // Cache do Next.js: revalida a cada 1 hora (3600 segundos)
          next: { revalidate: 3600 },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          console.warn(`Resposta não OK para slug "${slugToTry}":`, res.status, res.statusText);
          return null;
        }

        const data = await res.json();

        console.log(`Resposta da API para slug "${slugToTry}" - quantidade de posts encontrados:`, data.length);

        if (data.length > 0) {
          console.log('Post encontrado:', {
            id: data[0].id,
            slug: data[0].slug,
            title: data[0].title?.rendered,
            slugBuscado: slugToTry,
          });
          return data[0]; // Retorna o primeiro post correspondente ao slug
        }

        return null;
      } catch (error) {
        console.warn(`Erro ao buscar post com slug "${slugToTry}":`, error);
        return null;
      }
    };

    // Tentar cada slug sequencialmente até encontrar um resultado
    // eslint-disable-next-line no-restricted-syntax
    for (const slugToTry of uniqueSlugs) {
      // eslint-disable-next-line no-await-in-loop
      const result = await tryFetchPostWithSlug(slugToTry);
      if (result) {
        return result;
      }
    }

    // Se nenhuma variação funcionou, retornar null
    console.warn('Post não encontrado para nenhuma variação do slug:', decodedSlug);
    return null;
  } catch (error) {
    console.error('Erro geral ao buscar o post:', error);
    return null;
  }
}

// ----------------------------------------------------------------------

// Fetch the latest posts (e.g., 5 latest posts)
export async function getLatestPosts(perPage = 5) {
  try {
    const params = new URLSearchParams({
      per_page: perPage.toString(),
      _embed: 'true',
      orderby: 'date',
      order: 'desc',
    });

    // Usar fetch nativo do Next.js com cache
    const res = await fetch(
      `https://attualizecontabil.com.br/wp-json/wp/v2/posts?${params.toString()}`,
      {
        // Cache do Next.js: revalida a cada 30 minutos (1800 segundos)
        next: { revalidate: 1800 },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch latest posts');
    }

    return await res.json(); // Return array of latest posts
  } catch (error) {
    console.error('Failed to fetch the latest posts:', error);
    return [];
  }
}

// ----------------------------------------------------------------------

export async function searchPosts(query, page = 1, perPage = 10) {
  try {
    const res = await axios.get('https://attualizecontabil.com.br/wp-json/wp/v2/posts', {
      params: {
        search: query, // Termo de busca
        per_page: perPage, // Número de posts por página
        page, // Página atual
        _embed: true, // Incluir dados relacionados (imagens, autor, etc.)
      },
    });

    const totalPosts = res.headers['x-wp-total']; // Total de posts
    const totalPages = res.headers['x-wp-totalpages']; // Total de páginas

    return {
      posts: res.data, // Retornar os posts encontrados
      totalPosts, // Total de posts
      totalPages, // Total de páginas
    };
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return { posts: [], totalPosts: 0, totalPages: 0 }; // Retorna vazio em caso de erro
  }
}

// ----------------------------------------------------------------------

// Buscar comentários de um post específico
export async function getPostComments(postId, page = 1, perPage = 100) {
  try {
    const params = new URLSearchParams({
      post: postId.toString(),
      per_page: perPage.toString(),
      page: page.toString(),
      orderby: 'date',
      order: 'asc',
      status: 'approve',
    });

    // Usar fetch nativo do Next.js com cache
    const res = await fetch(
      `https://attualizecontabil.com.br/wp-json/wp/v2/comments?${params.toString()}`,
      {
        // Cache do Next.js: revalida a cada 5 minutos (300 segundos)
        // Comentários podem mudar mais frequentemente, então cache menor
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch comments');
    }

    const data = await res.json();
    const totalComments = parseInt(res.headers.get('x-wp-total') || '0', 10);
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '0', 10);

    return {
      comments: data,
      totalComments,
      totalPages,
    };
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return { comments: [], totalComments: 0, totalPages: 0 };
  }
}

// ----------------------------------------------------------------------

// Criar um novo comentário (usando rota API do Next.js como proxy)
export async function createPostComment(postId, commentData) {
  try {
    // Usar a rota API do Next.js que faz proxy para o WordPress
    const res = await axios.post('/api/blog/comments', {
      postId,
      author_name: commentData.author_name,
      author_email: commentData.author_email,
      content: commentData.content,
      parent: commentData.parent || 0, // 0 para comentário principal, ID do comentário para resposta
    });

    return res.data;
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    
    // Retornar mensagem de erro mais amigável
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error || errorData?.message || 'Erro ao criar comentário';
      
      // Se for erro de autenticação, fornecer mensagem mais clara
      if (errorData?.code === 'rest_comment_login_required') {
        throw new Error(
          'Comentários anônimos não estão habilitados. Por favor, entre em contato com o administrador do site.'
        );
      }
      
      throw new Error(errorMessage);
    }
    
    throw new Error('Erro ao processar comentário. Tente novamente.');
  }
}
