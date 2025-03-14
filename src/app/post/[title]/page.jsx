import axios from 'src/utils/axios';

import { CONFIG } from 'src/config-global';
import { getPostBySlug, getLatestPosts } from 'src/actions/blog-ssr';

import { PostDetailsHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const { title } = params;

  // Fetch the post based on the slug
  const post = await getPostBySlug(title);

  // If the post is found, set the title for SEO
  if (post) {
    return {
      title: `${post?.yoast_head_json?.title || post.title.rendered} - ${CONFIG.site.name}`,
      description: post?.yoast_head_json?.description || 'Descrição da postagem',
      openGraph: {
        title: post?.yoast_head_json?.title || post.title.rendered,
        description: post?.yoast_head_json?.description,
        url: post.link,
        images: [
          {
            url: post.jetpack_featured_media_url || '/default-image.png',
            alt: post.title.rendered,
          },
        ],
      },
    };
  }

  // Fallback metadata if the post is not found
  return { title: `Postagem não encontrada - ${CONFIG.site.name}` };
}

export default async function Page({ params }) {
  const { title } = params;

  const post = await getPostBySlug(title);
  const latestPosts = await getLatestPosts();

  return <PostDetailsHomeView post={post} latestPosts={latestPosts} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    const res = await axios.get('https://attualizecontabil.com.br/wp-json/wp/v2/posts');
    return res.data.map((post) => ({ title: post.slug })); // Usa o slug para gerar os caminhos estáticos
  }
  return [];
}
