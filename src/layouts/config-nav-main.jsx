import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  { title: 'Home', path: '/', icon: <Iconify width={22} icon="solar:home-2-bold-duotone" /> },
  {
    title: 'Quem somos',
    path: paths.about,
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
  },
  {
    title: 'Blog',
    path: paths.post.blog,
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
  },
  {
    title: 'Fale Conosco',
    path: paths.contact,
    icon: <Iconify width={22} icon="solar:atom-bold-duotone" />,
  },
];
