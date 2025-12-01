import { useSettingsContext } from 'src/contexts/SettingsContext';

export function useSettings() {
  const { settings, isFuncionalidadeAtiva } = useSettingsContext();

  // Retornar objeto padrão seguro quando settings é null
  const settingsSafe = settings || {
    funcionalidades: {},
    configuracoes: {},
    eNotasConfig: {},
    apuracao: {},
  };

  return {
    podeEmitirNFSe: isFuncionalidadeAtiva('emissaoNFSe'),
    podeGerenciarClientes: isFuncionalidadeAtiva('cadastroClientes'),
    podeGerenciarServicos: isFuncionalidadeAtiva('cadastroServicos'),
    podeCriarOrcamentos: isFuncionalidadeAtiva('vendas'),
    podeUsarAgendamentos: isFuncionalidadeAtiva('agendamentos'),
    limiteClientes: settingsSafe.configuracoes?.limiteClientes,
    limiteServicos: settingsSafe.configuracoes?.limiteServicos,
    limiteOrcamentos: settingsSafe.configuracoes?.limiteOrcamentos,
    // Configurações de apuração
    apurarHub: Boolean(settingsSafe.apuracao?.apurarHub),
    habilitarFatorR: Boolean(settingsSafe.apuracao?.habilitarFatorR),
    gerarDasAutomatico: Boolean(settingsSafe.apuracao?.gerarDasAutomatico),
    settings: settingsSafe,
  };
}


