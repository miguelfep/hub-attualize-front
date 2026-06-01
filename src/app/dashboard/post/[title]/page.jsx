import { CONFIG } from 'src/config-global';

import { PostDetailsView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes do post | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { title } = await params;

  return <PostDetailsView slug={title} />;
}

export const dynamic = 'force-dynamic';
