import { paths } from 'src/routes/paths';

import { useSettings } from 'src/hooks/useSettings';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function usePortalNavData() {
  const { podeGerenciarClientes, podeGerenciarServicos, podeCriarOrcamentos } = useSettings();

  const vendasChildren = [
    podeGerenciarClientes && {
      title: 'Clientes',
      path: paths.cliente.clientes,
      icon: <Iconify icon="solar:users-group-two-rounded-bold-duotone" />,
    },
    podeGerenciarServicos && {
      title: 'Serviços',
      path: paths.cliente.servicos,
      icon: <Iconify icon="eos-icons:service" />,
    },
    podeCriarOrcamentos && {
      title: 'Vendas',
      path: paths.cliente.orcamentos.root,
      icon: <Iconify icon="solar:money-bag-bold" />,
    },
  ].filter(Boolean); 

  const items = [
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
    vendasChildren.length > 0 && {
      title: 'Minhas Vendas',
      path: '#',
      icon: <Iconify icon="solar:bill-list-bold-duotone" />,
      children: vendasChildren,
    },
    {
      title: 'Meu Plano',
      path: paths.cliente.financeiro.root,
      icon: <Iconify icon="solar:money-bag-bold" />,
    },
    {
      title: 'Meus Documentos',
      path: '#',
      icon: <Iconify icon="solar:documents-bold-duotone" />,
      children: [
        {
          title: 'Licenças',
          path: paths.cliente.licencas,
          icon: <Iconify icon="solar:document-text-bold-duotone" />,
        },
        {
          title: 'Societário',
          path: paths.cliente.societario.documentos, 
          icon: <Iconify icon="solar:folder-with-files-bold-duotone" />,
        },
      ],
    },
    {
      title: 'Configurações',
      path: paths.cliente.settings,
      icon: <Iconify icon="solar:settings-bold-duotone" />,
    },
  ].filter(Boolean);

  return [
    {
      subheader: 'Principal',
      items,
    },
  ];
}
