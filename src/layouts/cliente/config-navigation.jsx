import { paths } from 'src/routes/paths';
import { useSettings } from 'src/hooks/useSettings';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function usePortalNavData() {
  const { podeGerenciarClientes, podeGerenciarServicos, podeCriarOrcamentos } = useSettings();

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
    {
      title: 'Financeiro',
      path: paths.cliente.financeiro.root,
      icon: <Iconify icon="solar:bill-list-bold-duotone" />,
    },
    podeGerenciarClientes && {
      title: 'Clientes',
      path: paths.cliente.clientes,
      icon: <Iconify icon="solar:users-group-rounded-bold" />,
    },
    podeGerenciarServicos && {
      title: 'Serviços',
      path: paths.cliente.servicos,
      icon: <Iconify icon="solar:case-round-bold" />,
    },
    podeCriarOrcamentos && {
      title: 'Orçamentos',
      path: paths.cliente.orcamentos,
      icon: <Iconify icon="solar:wallet-money-bold-duotone" />,
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
  ].filter(Boolean);

  return [
    {
      subheader: 'Principal',
      items,
    },
  ];
}


