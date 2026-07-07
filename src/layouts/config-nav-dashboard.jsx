import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

export const ICONS = {
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
  settings: icon('ic-settings'),
};

export const ICON_KEYS = Object.keys(ICONS);

// ----------------------------------------------------------------------

/**
 * Calcula as roles que podem acessar a rota atual, com base na navData.
 * Percorre a árvore acumulando as roles de cada nível (a rota só é acessível
 * se a role estiver presente em TODOS os níveis que definem `roles`).
 * Retorna a interseção das roles exigidas, ou `undefined` quando a rota não
 * impõe restrição (libera o acesso).
 */
export function getRouteAccessRoles(pathname, data = navData) {
  const candidates = [];

  const walk = (items, inheritedSets) => {
    items?.forEach((item) => {
      const sets = item.roles ? [...inheritedSets, item.roles] : inheritedSets;
      if (item.path) candidates.push({ path: item.path, sets });
      if (item.children) walk(item.children, sets);
    });
  };

  data.forEach((group) => walk(group.items, []));

  const matches = candidates.filter(
    (c) => pathname === c.path || pathname.startsWith(`${c.path}/`)
  );

  if (!matches.length) return undefined;

  // rota mais específica (path mais longo) que casa com o pathname
  const best = matches.reduce((a, b) => (b.path.length > a.path.length ? b : a));

  if (!best.sets.length) return undefined;

  // interseção das roles exigidas em toda a cadeia de níveis
  return best.sets.reduce((acc, set) => acc.filter((r) => set.includes(r)));
}

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
        roles: ['admin', 'operacional', 'comercial', 'financeiro', 'gerencial'],
        children: [
          { title: 'Clientes', path: paths.dashboard.cliente.root, icon: ICONS.user },
          { title: 'Serviços dos Clientes', path: paths.dashboard.servicos, icon: ICONS.product, roles: ['admin', 'operacional', 'gerencial'] },
          { title: 'Avaliações', path: paths.dashboard.avaliacoes.root, icon: ICONS.analytics, roles: ['admin'] },
        ],
      },



      {
        title: 'Tarefas',
        path: paths.dashboard.tarefas.root,
        icon: ICONS.kanban,
        roles: ['admin', 'gerencial', 'financeiro', 'operacional', 'comercial', 'contabil_externo', 'ir'],
        children: [
          {
            title: 'Minhas Tarefas',
            path: paths.dashboard.tarefas.minhas,
            roles: ['admin', 'gerencial', 'financeiro', 'operacional', 'comercial', 'contabil_externo', 'ir'],
          },
          {
            title: 'Todas as Tarefas',
            path: paths.dashboard.tarefas.root,
            roles: ['admin', 'gerencial'],
          },
          {
            title: 'Templates Recorrentes',
            path: paths.dashboard.tarefas.templates,
            roles: ['admin', 'gerencial'],
          },
          {
            title: 'Setores',
            path: paths.dashboard.setores.root,
            roles: ['admin'],
          },
        ],
      },

      {
        title: 'Comercial',
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
        roles: ['financeiro', 'admin', 'comercial', 'operacional', 'gerencial'],
        children: [
          {
            title: 'Leads',
            roles: ['admin', 'financeiro', 'comercial', 'operacional', 'gerencial'],
            path: paths.dashboard.comercial.leads,
          },
          {
            title: 'Vendas',
            roles: ['admin', 'financeiro', 'comercial', 'operacional', 'gerencial'],
            path: paths.dashboard.invoice.root,
          },
          {
            title: 'Itens de Serviço',
            roles: ['admin', 'financeiro', 'comercial', 'operacional', 'gerencial'],
            path: paths.dashboard.comercial.itensServico,
          },
        ],
      },
      {
        title: 'Financeiro',
        path: paths.dashboard.financeiro.root,
        icon: ICONS.banking,
        roles: ['financeiro', 'admin'],
        children: [
          {
            title: 'Dashboard',
            roles: ['admin', 'financeiro'],
            path: paths.dashboard.financeiro.root,
          },
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
          {
            title: 'PIX',
            roles: ['admin', 'financeiro'],
            path: paths.dashboard.pix.root,
          },
          {
            title: 'Categorias Financeiras',
            roles: ['admin', 'financeiro'],
            path: paths.dashboard.financeiro.categorias,
          },
          {
            title: 'Centros de Custo',
            roles: ['admin', 'financeiro'],
            path: paths.dashboard.financeiro.centroCusto,
          },
        ],
      },
      {
        title: 'Fiscal',
        path: paths.dashboard.fiscal.root,
        icon: ICONS.tax,
        roles: ['admin', 'financeiro', 'operacional', 'gerencial'],
        children: [
          {
            title: 'Nota Fiscal',
            path: paths.dashboard.fiscal.nfse,
            roles: ['admin', 'financeiro', 'operacional', 'gerencial'],
          },
          {
            title: 'Impostos',
            path: paths.dashboard.fiscal.impostos,
            roles: ['admin', 'operacional', 'financeiro', 'gerencial'],
          },
          {
            title: 'Caixa Postal',
            path: paths.dashboard.fiscal.caixaPostal,
            roles: ['admin', 'operacional', 'financeiro', 'gerencial'],
          },
        ],
      },
      {
        title: 'Departamento Pessoal',
        path: paths.dashboard.cliente.departamentoPessoalHub,
        icon: ICONS.job,
        roles: ['admin', 'operacional', 'financeiro', 'gerencial'],
        children: [
          {
            title: 'Lista de funcionários',
            path: paths.dashboard.cliente.departamentoPessoalHub,
            roles: ['admin', 'operacional', 'financeiro', 'gerencial'],
          },
          {
            title: 'Apontamentos',
            path: paths.dashboard.cliente.departamentoPessoalApontamentos,
            roles: ['admin', 'operacional', 'financeiro', 'gerencial'],
          },
        ],
      },
      {
        title: 'Documentos',
        path: paths.dashboard.guiasEDocumentos.list,
        icon: ICONS.file,
        roles: ['admin', 'operacional', 'gerencial'],
        children: [
          {
            title: 'Documentos e Guias',
            path: paths.dashboard.guiasEDocumentos.list,
            roles: ['admin', 'operacional', 'gerencial'],
          },
          {
            title: 'Express',
            path: paths.dashboard.guiasEDocumentos.upload,
            roles: ['admin', 'operacional', 'gerencial'],
          },
        ],
      },
      {
        title: 'Imposto de Renda',
        path: paths.dashboard.impostoRenda.root,
        icon: ICONS.tax,
        roles: ['admin', 'operacional', 'financeiro', 'comercial', 'ir', 'gerencial'],
        children: [
          {
            title: 'Pedidos IR',
            path: paths.dashboard.impostoRenda.root,
            roles: ['admin', 'operacional', 'financeiro', 'comercial', 'ir', 'gerencial'],
          },
          {
            title: 'Planos e Lotes',
            path: paths.dashboard.impostoRenda.planos,
            roles: ['admin'],
          },
        ],
      },
      {
        title: 'Contábil',
        path: paths.dashboard.contabil.root,
        icon: ICONS.banking,
        roles: ['admin', 'financeiro', 'operacional', 'gerencial', 'contabil_externo'],
        children: [
          {
            title: 'Conciliações Bancárias',
            path: paths.dashboard.contabil.root,
          },
          {
            title: 'Bancos (Clientes)',
            path: paths.dashboard.contabil.bancos,
          },
          {
            title: 'Instituições Bancárias',
            path: paths.dashboard.contabil.instituicoesBancarias,
          },
        ],
      },
      {
        title: 'Societario',
        path: paths.dashboard.aberturas.root,
        icon: ICONS.tour,
        roles: ['operacional', 'admin', 'comercial', 'gerencial'],
        children: [
          {
            title: 'Abertura',
            roles: ['admin', 'operacional', 'comercial', 'gerencial'],
            path: paths.dashboard.aberturas.root,
          },
          {
            title: 'Alteração',
            roles: ['admin', 'operacional', 'comercial', 'gerencial'],
            path: paths.dashboard.alteracao.root,
          },
          {
            title: 'Licenças',
            roles: ['admin', 'operacional', 'comercial', 'gerencial'],
            path: paths.dashboard.aberturas.licenca,
          },
          {
            title: 'Certificados',
            roles: ['admin', 'operacional', 'comercial', 'gerencial'],
            path: paths.dashboard.certificados.root,
          },
        ],
      },
      {
        title: 'Blog',
        path: paths.dashboard.post.root,
        icon: ICONS.blog,
        roles: ['admin', 'operacional', 'gerencial'],
        children: [
          {
            title: 'Postagens',
            path: paths.dashboard.post.root,
            roles: ['admin', 'operacional', 'gerencial'],
          },
          {
            title: 'Nova postagem',
            path: paths.dashboard.post.new,
            roles: ['admin', 'operacional', 'gerencial'],
          },
          {
            title: 'Comentários',
            path: paths.dashboard.post.comentarios,
            roles: ['admin', 'operacional', 'gerencial'],
          },
        ],
      },
      {
        title: 'Usuários',
        path: paths.dashboard.usuarios.root,
        icon: ICONS.user,
        roles: ['admin', 'gerencial'],
        children: [
          {
            title: 'Usuários Clientes',
            path: paths.dashboard.usuarios.root,
            icon: ICONS.user,
            roles: ['admin', 'gerencial'],
          },
          {
            title: 'Usuários Internos',
            path: paths.dashboard.usuarios.internos,
            icon: ICONS.user,
            roles: ['admin'],
          },
        ],
      },
      {
        title: 'Logs de Auditoria',
        path: paths.dashboard.audit.root,
        icon: ICONS.lock,
        roles: ['admin'],
      },
      {
        title: 'Status do Sistema',
        path: paths.dashboard.status.root,
        icon: ICONS.analytics,
        roles: ['admin'],
      },
      {
        title: 'Recompensas',
        path: paths.dashboard.recompensas.root,
        icon: ICONS.banking,
        roles: ['admin', 'financeiro'],
      },
      // {
      //   title: 'Comunidade',
      //   path: paths.dashboard.comunidade.materiais.root,
      //   icon: ICONS.course,
      //   roles: ['admin', 'operacional'],
      //   children: [
      //     {
      //       title: 'Materiais',
      //       path: paths.dashboard.comunidade.materiais.root,
      //       roles: ['admin', 'operacional'],
      //     },
      //     {
      //       title: 'Cursos',
      //       path: paths.dashboard.comunidade.cursos.root,
      //       roles: ['admin', 'operacional'],
      //     },
      //     {
      //       title: 'Compras',
      //       path: paths.dashboard.comunidade.compras,
      //       roles: ['admin', 'operacional'],
      //     },
      //   ],
      // },
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
          {
            title: 'Integra Contador',
            roles: ['admin'],
            path: paths.dashboard.relatorios.integraContador,
          },
        ],
      },
      {
        title: 'Configurações',
        path: paths.dashboard.attualizeConfig.root,
        icon: ICONS.settings,
        roles: ['admin'],
        children: [
          {
            title: 'Emissão Attualize',
            path: paths.dashboard.attualizeConfig.root,
            roles: ['admin'],
          },
          {
            title: 'Banners',
            path: paths.dashboard.banners.root,
            roles: ['admin'],
          },
        ],
      },
    ],
  },
];
