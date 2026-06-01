import { CONFIG } from 'src/config-global';

import { PostCommentsInboxView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Comentários do blog | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <PostCommentsInboxView />;
}

export const dynamic = 'force-dynamic';
