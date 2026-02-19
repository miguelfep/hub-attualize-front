export const METRICS = [
  { label: 'Vendas', value: 'R$ 714.280', change: 2.6, isPositive: true, icon: 'trending_up', color: 'primary' },
  { label: 'A Pagar', value: 'R$ 89.432', change: 0.8, isPositive: false, icon: 'account_balance_wallet', color: 'warning' },
  { label: 'Saldo', value: 'R$ 245.120', change: 1.2, isPositive: true, icon: 'savings', color: 'info' },
];

export const BUDGET_OVERVIEW_DATA = [
  { label: 'Mar', orcamentos: 45000, vendas: 31000, ano: 2024, mes: 'Março' },
  { label: 'Abr', orcamentos: 61000, vendas: 51000, ano: 2024, mes: 'Abril' },
  { label: 'Mai', orcamentos: 55000, vendas: 42000, ano: 2024, mes: 'Maio' },
  { label: 'Jun', orcamentos: 115000, vendas: 109000, ano: 2024, mes: 'Junho' },
  { label: 'Jul', orcamentos: 110000, vendas: 100000, ano: 2024, mes: 'Julho' },
  { label: 'Ago', orcamentos: 130000, vendas: 120000, ano: 2024, mes: 'Agosto' },
  { label: 'Set', orcamentos: 95000, vendas: 80000, ano: 2024, mes: 'Setembro' },
  { label: 'Out', orcamentos: 105000, vendas: 95000, ano: 2024, mes: 'Outubro' },
  { label: 'Nov', orcamentos: 120000, vendas: 110000, ano: 2024, mes: 'Novembro' },
  { label: 'Dez', orcamentos: 150000, vendas: 140000, ano: 2024, mes: 'Dezembro' },
  { label: 'Jan', orcamentos: 45000, vendas: 31000, ano: 2025, mes: 'Janeiro' },
  { label: 'Fev', orcamentos: 52000, vendas: 40000, ano: 2025, mes: 'Fevereiro' },
];

export const EXPENSE_CATEGORIES = [
  { label: 'Hardware da Vovozinha Testeando Responsivo', value: 4500, color: '#1877F2' },
  { label: 'Infraestrutura', value: 12000, color: '#8E33FF' },
  { label: 'Software', value: 850, color: '#00B8D9' },
  { label: 'Marketing', value: 2500, color: '#FFAB00' },
  { label: 'Serviços', value: 450, color: '#FF5630' },
  { label: 'Pessoal', value: 15000, color: '#22C55E' },
  { label: 'Logística', value: 3200, color: '#919EAB' },
  { label: 'Manutenção', value: 1200, color: '#73BAFB' },
  { label: 'Impostos', value: 8900, color: '#F48FB1' },
];

export const BANKS = ['Itaú', 'Bradesco', 'Santander', 'Nubank', 'Inter'];

export const ACCOUNTS_PAYABLE = [
  { id: '1', title: 'Fornecedor Tech Corp', date: 'Hoje, 14:30', amount: -4500.00, type: 'expense', category: 'Hardware', icon: 'computer', bank: 'Itaú' },
  { id: '2', title: 'Aluguel Escritório', date: 'Amanhã', amount: -12000.00, type: 'expense', category: 'Infraestrutura', icon: 'domain', bank: 'Bradesco' },
  { id: '3', title: 'Amazon Web Services', date: '22 Mar, 2024', amount: -850.20, type: 'expense', category: 'Software', icon: 'cloud', bank: 'Nubank' },
  { id: '4', title: 'Marketing Digital Ads', date: '25 Mar, 2024', amount: -2500.00, type: 'expense', category: 'Marketing', icon: 'campaign', bank: 'Santander' },
  { id: '5', title: 'Limpeza e Conservação', date: '28 Mar, 2024', amount: -450.00, type: 'expense', category: 'Serviços', icon: 'cleaning_services', bank: 'Inter' },
  { id: '6', title: 'Folha de Pagamento', date: '05 Abr, 2024', amount: -15000.00, type: 'expense', category: 'Pessoal', icon: 'groups', bank: 'Itaú' },
  { id: '7', title: 'Frete e Transportes', date: '10 Abr, 2024', amount: -3200.00, type: 'expense', category: 'Logística', icon: 'local_shipping', bank: 'Bradesco' },
];
