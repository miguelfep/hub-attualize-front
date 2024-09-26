import { CONFIG } from 'src/config-global';
import { getPosts } from 'src/actions/blog-ssr';

import { PostListHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Nosso Blog - ${CONFIG.site.name}` };

export default async function Page() {
  const { posts, totalPages } = await getPosts(1, 10); // Carregar a primeira página com 10 posts

  return <PostListHomeView initialPosts={posts} totalPages={totalPages} />;
}
