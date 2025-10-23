// Dados de exemplo para banners de anúncios e novidades

export const sampleBanners = [
  {
    id: 'banner-1',
    title: 'Consultoria Tributária',
    subtitle: 'Especialistas em impostos',
    description: 'Nossa equipe de contadores especializados está pronta para otimizar sua carga tributária e garantir conformidade fiscal.',
    icon: 'solar:chart-2-bold',
    color: '#1976d2',
    colorSecondary: '#42a5f5',
    badge: 'NOVO',
    badgeColor: '#4caf50',
    buttonText: 'Solicitar Consultoria',
    buttonColor: '#1976d2',
    link: 'https://wa.me/5541996982267?text=Ol%C3%A1!%20Vim%20pelo%20Portal%20do%20Cliente%20e%20tenho%20interesse%20na%20Consultoria%20Tribut%C3%A1ria!',
    dismissible: false,
  },
  {
    id: 'banner-3',
    title: 'Certificado Digital E-CNPJ',
    subtitle: 'Facilite seus processos',
    description: 'Obtenha seu certificado digital E-CNPJ com desconto especial. Processo 100% online e seguro.',
    icon: 'solar:shield-check-bold',
    color: '#f57c00',
    colorSecondary: '#ffb74d',
    badge: 'PROMOÇÃO',
    badgeColor: '#f57c00',
    buttonText: 'Comprar Agora',
    buttonColor: '#f57c00',
    link: 'https://wa.me/5541996982267?text=Ol%C3%A1!%20Vim%20pelo%20Portal%20do%20Cliente%20e%20tenho%20interesse%20em%20adquirir%20o%20Certificado%20Digital%20E-CNPJ!',
    dismissible: false,
  },
  {
    id: 'banner-4',
    title: 'Relatórios Financeiros Avançados',
    subtitle: 'Análise completa do seu negócio',
    description: 'Acesse relatórios detalhados sobre fluxo de caixa, projeções e indicadores de performance.',
    icon: 'solar:chart-bold',
    color: '#388e3c',
    colorSecondary: '#66bb6a',
    badge: 'PREMIUM',
    badgeColor: '#388e3c',
    buttonText: 'Acessar Relatórios',
    buttonColor: '#388e3c',
    link: 'https://wa.me/5541996982267?text=Ol%C3%A1!%20Vim%20pelo%20Portal%20do%20Cliente%20e%20tenho%20interesse%20no%20Relat%C3%B3rio%20Financeiro%20Avan%C3%A7ado',
    dismissible: false,
  },
];

// Função para obter banners baseados no perfil do usuário
export const getBannersForUser = (user) => {
  // Filtrar banners baseados no perfil do usuário
  let filteredBanners = [...sampleBanners];

  // Exemplo: usuários premium veem banners diferentes
  if (user?.role === 'premium') {
    filteredBanners = filteredBanners.filter(banner => 
      banner.id !== 'banner-4' // Remove banner premium para usuários premium
    );
  }

  // Exemplo: usuários novos veem banners de boas-vindas
  if (user?.isNewUser) {
    filteredBanners.unshift({
      id: 'banner-welcome',
      title: 'Bem-vindo ao Portal!',
      subtitle: 'Explore todas as funcionalidades',
      description: 'Descubra como nosso portal pode ajudar a gerenciar sua empresa de forma mais eficiente.',
      icon: 'solar:hand-stars-bold',
      color: '#2e7d32',
      colorSecondary: '#4caf50',
      badge: 'BEM-VINDO',
      badgeColor: '#2e7d32',
      buttonText: 'Começar Tour',
      buttonColor: '#2e7d32',
      link: '/portal-cliente/tour',
      dismissible: true,
    });
  }

  // Exemplo: banners baseados no plano do usuário
  if (user?.planoAtual === 'start') {
    // Usuários do plano Start veem banners de upgrade
    filteredBanners.unshift({
      id: 'banner-upgrade-start',
      title: 'Upgrade para Pleno',
      subtitle: 'Desbloqueie mais funcionalidades',
      description: 'Acesse relatórios avançados, suporte prioritário e muito mais com o plano Pleno.',
      icon: 'solar:rocket-bold',
      color: '#ff9800',
      colorSecondary: '#ffb74d',
      badge: 'UPGRADE',
      badgeColor: '#ff9800',
      buttonText: 'Fazer Upgrade',
      buttonColor: '#ff9800',
      link: '/portal-cliente/financeiro',
      dismissible: true,
    });
  }

  // Exemplo: banners sazonais ou promocionais
  const currentMonth = new Date().getMonth();
  if (currentMonth === 11) { // Dezembro
    filteredBanners.unshift({
      id: 'banner-natal',
      title: 'Promoção de Natal',
      subtitle: 'Desconto especial até 31/12',
      description: 'Aproveite nossa promoção de fim de ano e economize em todos os nossos serviços.',
      icon: 'solar:gift-bold',
      color: '#d32f2f',
      colorSecondary: '#ef5350',
      badge: 'NATAL',
      badgeColor: '#d32f2f',
      buttonText: 'Ver Promoções',
      buttonColor: '#d32f2f',
      link: '/portal-cliente/promocoes',
      dismissible: true,
    });
  }

  return filteredBanners;
};
