import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  tax: icon('ic-tax'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Geral',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },

      { 
        title: 'Clientes', 
        path: paths.dashboard.cliente.root, 
        icon: ICONS.user, 
        roles: ['admin', 'operacional', 'comercial'],
        children: [
          { title: 'Clientes', path: paths.dashboard.cliente.root, icon: ICONS.user },
          { title: 'Serviços dos Clientes', path: paths.dashboard.servicos, icon: ICONS.product, roles: ['admin', 'operacional'] },
        ],
      },
      
     
      {
        title: 'Comercial',
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
        roles: ['financeiro', 'admin', 'comercial'],
        children: [
          {
            title: 'Leads',
            roles: ['admin', 'financeiro', 'comercial'],
            path: paths.dashboard.comercial.leads,
          },
          {
            title: 'Funil',
            roles: ['admin', 'financeiro', 'comercial'],
            path: paths.dashboard.comercial.funil,
          },
          {
            title: 'Vendas',
            roles: ['admin', 'financeiro', 'comercial'],
            path: paths.dashboard.invoice.root,
          },
        ],
      },
      {
        title: 'Financeiro',
        path: paths.dashboard.general.analytics,
        icon: ICONS.banking,
        roles: ['financeiro', 'admin'],
        children: [
          {
            title: 'Contratos',
            roles: ['admin', 'financeiro', 'comercial'],
            path: paths.dashboard.contratos.root,
          },
          {
            title: 'A receber',
            roles: ['admin', 'financeiro'],
            path: paths.dashboard.financeiro.receber,
          },
          {
            title: 'A pagar',
            roles: ['admin', 'financeiro'],
            path: paths.dashboard.financeiro.pagar,
          },
        ],
      },
      {
        title: 'Fiscal',
        path: paths.dashboard.fiscal.root,
        icon: ICONS.tax,
        roles: ['admin', 'financeiro', 'operacional'],
        children: [
          {
            title: 'Notas Fiscais por Cliente',
            path: paths.dashboard.fiscal.root,
          },
        ],
      },
      {
        title: 'Societario',
        path: paths.dashboard.aberturas.root,
        icon: ICONS.tour,
        roles: ['operacional', 'admin', 'comercial'],
        children: [
          {
            title: 'Abertura',
            roles: ['admin', 'operacional', 'comercial'],
            path: paths.dashboard.aberturas.root,
          },
          {
            title: 'Alteração',
            roles: ['admin', 'operacional', 'comercial'],
            path: paths.dashboard.alteracao.root, 
          },
          {
            title: 'Licenças',
            roles: ['admin', 'operacional', 'comercial'],
            path: paths.dashboard.aberturas.licenca,
          },
          {
            title: 'Certificados',
            roles: ['admin', 'operacional', 'comercial'],
            path: paths.dashboard.certificados.root,
          },
        ],
      },
      {
        title: 'Usuários',
        path: paths.dashboard.usuarios.root,
        icon: ICONS.user,
        roles: ['admin'],
        children: [
          {
            title: 'Usuários Clientes',
            path: paths.dashboard.usuarios.root,
            icon: ICONS.user,
            roles: ['admin'],
          },
        ],
      },
      {
        title: 'Relatórios',
        path: paths.dashboard.aberturas.root,
        icon: ICONS.analytics,
        roles: ['admin'],
        children: [
          {
            title: 'Comercial',
            roles: ['admin'],
            path: paths.dashboard.relatorios.comercial,
          },
        ],
      },
    ],
  },
];
