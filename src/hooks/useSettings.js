import { useSettingsContext } from 'src/contexts/SettingsContext';

export function useSettings() {
  const { settings, isFuncionalidadeAtiva, clienteData } = useSettingsContext();

  // Retornar objeto padrão seguro quando settings é null
  const settingsSafe = settings || {
    funcionalidades: {},
    configuracoes: {},
    eNotasConfig: {},
    possuiExtrato: false,
  };

  return {
    podeEmitirNFSe: isFuncionalidadeAtiva('emissaoNFSe'),
    podeGerenciarClientes: isFuncionalidadeAtiva('cadastroClientes'),
    podeGerenciarServicos: isFuncionalidadeAtiva('cadastroServicos'),
    podeCriarOrcamentos: isFuncionalidadeAtiva('vendas'),
    podeUsarAgendamentos: isFuncionalidadeAtiva('agendamentos'),
    possuiExtrato: settingsSafe?.possuiExtrato, // Novo campo
    limiteClientes: settingsSafe.configuracoes?.limiteClientes,
    limiteServicos: settingsSafe.configuracoes?.limiteServicos,
    limiteOrcamentos: settingsSafe.configuracoes?.limiteOrcamentos,
    settings: settingsSafe,
    clienteData, // Expor dados do cliente
  };
}

