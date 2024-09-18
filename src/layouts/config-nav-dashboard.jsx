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
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Geral',
    items: [
      { title: 'App', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Clientes', path: paths.dashboard.cliente.root, icon: ICONS.user },
      {
        title: 'Financeiro',
        path: paths.dashboard.general.analytics,
        icon: ICONS.analytics,
        roles: ['financeiro', 'admin'],
        children: [
          {
            title: 'Contratos',
            roles: ['admin', 'financeiro'],
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
        title: 'Societario',
        path: paths.dashboard.aberturas.root,
        icon: ICONS.tour,
        roles: ['operacional', 'admin'],
        children: [
          {
            title: 'Abertura',
            roles: ['admin', 'financeiro'],
            path: paths.dashboard.aberturas.root,
          },
        ],
      },
      {
        title: 'Vendas',
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
        roles: ['financeiro', 'admin'],
      },
    ],
  },
];
