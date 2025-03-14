import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

// Fetch all posts with pagination
export async function getPosts(page = 1, perPage = 10) {
  try {
    const res = await axios.get('https://attualizecontabil.com.br/wp-json/wp/v2/posts', {
      params: {
        per_page: perPage, // Number of posts per page
        page, // Current page for pagination
        _embed: true, // Embed related data (e.g., images, author)
      },
    });

    const totalPosts = res.headers['x-wp-total']; // Total number of posts
    const totalPages = res.headers['x-wp-totalpages']; // Total number of pages

    return {
      posts: res.data, // Post data from response
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
    const res = await axios.get('https://attualizecontabil.com.br/wp-json/wp/v2/posts', {
      params: {
        slug, // Agora busca pelo slug ao invés do título
        _embed: true, // Embute os dados relacionados (imagens, autor, etc.)
        per_page: 1, // Limita o resultado a 1 post
      },
    });

    if (res.data.length === 0) {
      throw new Error('Post not found');
    }

    return res.data[0]; // Retorna o primeiro post correspondente ao slug
  } catch (error) {
    console.error('Erro ao buscar o post:', error);
    return null;
  }
}

// ----------------------------------------------------------------------

// Fetch the latest posts (e.g., 5 latest posts)
export async function getLatestPosts(perPage = 5) {
  try {
    const res = await axios.get('https://attualizecontabil.com.br/wp-json/wp/v2/posts', {
      params: {
        per_page: perPage, // Number of latest posts
        _embed: true, // Embed related data
        orderby: 'date', // Order by post date
        order: 'desc', // Most recent posts first
      },
    });

    return res.data; // Return array of latest posts
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
