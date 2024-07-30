import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getPosts() {
  try {
    const res = await axios.get('https://attualizecontabil.com.br/wp-json/wp/v2/posts');
    const posts = res.data; // Os dados já estão na propriedade data

    return posts
    
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

// ----------------------------------------------------------------------

export async function getPost(title) {
  const URL = title ? `${endpoints.post.details}?title=${title}` : '';

  const res = await axios.get(URL);

  return res.data;
}

// ----------------------------------------------------------------------

export async function getLatestPosts(title) {
  const URL = title ? `${endpoints.post.latest}?title=${title}` : '';

  const res = await axios.get(URL);

  return res.data;
}
