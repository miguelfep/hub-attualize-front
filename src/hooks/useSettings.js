import { useSettingsContext } from 'src/contexts/SettingsContext';

export function useSettings() {
  const { settings, isFuncionalidadeAtiva } = useSettingsContext();

  return {
    podeEmitirNFSe: isFuncionalidadeAtiva('emissaoNFSe'),
    podeGerenciarClientes: isFuncionalidadeAtiva('cadastroClientes'),
    podeGerenciarServicos: isFuncionalidadeAtiva('cadastroServicos'),
    podeCriarOrcamentos: isFuncionalidadeAtiva('vendas'),
    podeUsarAgendamentos: isFuncionalidadeAtiva('agendamentos'),
    limiteClientes: settings?.configuracoes?.limiteClientes,
    limiteServicos: settings?.configuracoes?.limiteServicos,
    limiteOrcamentos: settings?.configuracoes?.limiteOrcamentos,
    settings,
  };
}


