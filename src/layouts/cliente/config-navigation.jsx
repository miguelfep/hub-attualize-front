import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'Principal',
    items: [
      {
        title: 'Dashboard',
        path: paths.cliente.dashboard,
        icon: <Iconify icon="solar:home-2-bold-duotone" />,
      },
      {
        title: 'Minha Empresa',
        path: paths.cliente.empresa,
        icon: <Iconify icon="solar:buildings-2-bold-duotone" />,
      },
      {
        title: 'Financeiro',
        path: paths.cliente.financeiro.root,
        icon: <Iconify icon="solar:bill-list-bold-duotone" />,
      },
      {
        title: 'Minhas Licenças',
        path: paths.cliente.licencas,
        icon: <Iconify icon="solar:shield-check-bold-duotone" />,
      },
      {
        title: 'Configurações',
        path: paths.cliente.settings,
        icon: <Iconify icon="solar:settings-bold-duotone" />,
      },
    ],
  },
];


