import { paths } from 'src/routes/paths';

import { useSettings } from 'src/hooks/useSettings';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

export function usePortalNavData() {
  const {
    podeGerenciarClientes,
    podeGerenciarServicos,
    podeCriarOrcamentos,
    possuiExtrato,
    possuiFuncionario,
  } = useSettings();


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

  const conteudoEEmpresaChildren = [
    {
      title: 'Aulão Reforma',
      path: paths.cliente.conteudos.aulaoReforma,
      icon: <Iconify icon="solar:play-circle-bold-duotone" />,
    },
    {
      title: 'Guia IRPF 2026',
      path: paths.cliente.conteudos.guiaIRPF2026,
      icon: <Iconify icon="solar:pie-chart-2-bold-duotone" />,
    },
    {
      title: 'Reforma Tributária',
      path: paths.cliente.conteudos.reformaTributaria,
      icon: <Iconify icon="solar:diagram-up-bold-duotone" />,
    }
  
  ];

  const comercialChildren = [...vendasChildren].filter(Boolean);

  const financeiroChildren = [
    {
      title: 'Meu Faturamento',
      path: paths.cliente.faturamentos.root,
      icon: <Iconify icon="solar:hand-money-linear" />,
    },
    possuiExtrato && {
      title: 'Extratos Bancários',
      path: paths.cliente.conciliacaoBancaria,
      icon: <Iconify icon="solar:card-2-bold-duotone" />,
    },
    {
      title: 'Meu Plano',
      path: paths.cliente.financeiro.root,
      icon: <Iconify icon="solar:money-bag-bold" />,
    },
    {
      title: 'Recompensas',
      path: paths.cliente.recompensas.root,
      icon: <Iconify icon="solar:wallet-money-bold-duotone" />,
    },
  ].filter(Boolean);

  const comercialNavItem =
    comercialChildren.length > 0
      ? {
          title: 'Comercial',
          path: comercialChildren[0].path,
          icon: <Iconify icon="solar:case-minimalistic-bold-duotone" />,
          children: comercialChildren,
        }
      : null;

  return [
    {
      subheader: 'Início',
      items: [
        {
          title: 'Dashboard',
          path: paths.cliente.dashboard,
          icon: <Iconify icon="solar:home-2-bold-duotone" />,
        },
        possuiFuncionario && {
          title: 'Departamento Pessoal',
          path: paths.cliente.departamentoPessoal.root,
          icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />,
        },
      ].filter(Boolean),
    },
    {
      items: [
        {
          title: 'Meus Documentos',
          path: paths.cliente.guiasEDocumentos.list,
          icon: <Iconify icon="solar:documents-bold-duotone" />,
          children: [
            {
              title: 'Guias',
              path: paths.cliente.guiasEDocumentos.list,
              icon: <Iconify icon="solar:folder-with-files-bold-duotone" />,
            },
            {
              title: 'Empresa',
              path: paths.cliente.empresa,
              icon: <Iconify icon="solar:buildings-2-bold-duotone" />,
            },
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
      ],
    },
  
    {
      items: [
        comercialNavItem,
        {
          title: 'Financeiro',
          path: paths.cliente.financeiro.root,
          icon: <Iconify icon="solar:chat-round-money-bold" />,
          children: financeiroChildren,
        },
        {
          title: 'Programa de indicação',
          path: paths.cliente.indicacoes.root,
          icon: <Iconify icon="solar:share-bold-duotone" />,
        },
      ].filter(Boolean),
    },
    {
      subheader: 'Comunidade',
      items: [
        {
          title: 'Conteúdo e materiais',
          path: paths.cliente.conteudos.root,
          icon: <Iconify icon="solar:bookmark-bold-duotone" />,
          info: 'Novo',
          children: conteudoEEmpresaChildren,
        },
      ],
    },
  
    {
      subheader: 'Conta',
      items: [
        {
          title: 'Configurações',
          path: paths.cliente.settings,
          icon: <Iconify icon="solar:settings-bold-duotone" />,
        },
      ],
    },
  ];
}
