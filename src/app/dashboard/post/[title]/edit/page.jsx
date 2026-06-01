import { CONFIG } from 'src/config-global';

import { PostEditView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar post | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { title } = await params;

  return <PostEditView slug={title} />;
}

export const dynamic = 'force-dynamic';
