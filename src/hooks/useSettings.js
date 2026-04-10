import { isClientePortalFlagAtiva } from 'src/utils/cliente-portal-flags';

import { useSettingsContext } from 'src/contexts/SettingsContext';

const noopFuncionalidade = () => false;

export function useSettings() {
  const ctx = useSettingsContext();
  const settings = ctx?.settings ?? null;
  const clienteData = ctx?.clienteData ?? null;
  const isFuncionalidadeAtiva = ctx?.isFuncionalidadeAtiva ?? noopFuncionalidade;

  // Retornar objeto padrão seguro quando settings é null
  const settingsSafe = settings || {
    funcionalidades: {},
    configuracoes: {},
    eNotasConfig: {},
    possuiExtrato: false,
    possuiFuncionario: false,
  };

  /** Ver doc DP: `data.cliente`, espelho `data.settings.possuiFuncionario` e `empresas[].possuiFuncionario` (empresa-selector faz o merge em clienteData). */
  const possuiFuncionario =
    isClientePortalFlagAtiva(clienteData?.possuiFuncionario) ||
    isClientePortalFlagAtiva(settingsSafe?.possuiFuncionario);

  return {
    podeEmitirNFSe: isFuncionalidadeAtiva('emissaoNFSe'),
    podeGerenciarClientes: isFuncionalidadeAtiva('cadastroClientes'),
    podeGerenciarServicos: isFuncionalidadeAtiva('cadastroServicos'),
    podeCriarOrcamentos: isFuncionalidadeAtiva('vendas'),
    podeUsarAgendamentos: isFuncionalidadeAtiva('agendamentos'),
    possuiFuncionario,
    possuiExtrato: settingsSafe?.possuiExtrato, // Novo campo
    limiteClientes: settingsSafe.configuracoes?.limiteClientes,
    limiteServicos: settingsSafe.configuracoes?.limiteServicos,
    limiteOrcamentos: settingsSafe.configuracoes?.limiteOrcamentos,
    settings: settingsSafe,
    clienteData, // Expor dados do cliente
  };
}

