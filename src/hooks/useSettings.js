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

  const interConfig = settingsSafe?.interConfig ?? {};
  const interEnvironment = interConfig?.environment || 'homologacao';
  const interEnvironmentConfig = interConfig?.environments?.[interEnvironment] || {};
  const interHasCredentials = Boolean(
    interEnvironmentConfig?.clientId &&
      interEnvironmentConfig?.clientSecret &&
      interEnvironmentConfig?.contaCorrente
  );
  const interHasCertificates = Boolean(
    interEnvironmentConfig?.certCrtPath && interEnvironmentConfig?.certKeyPath
  );
  const interAmbienteAtivo = Boolean(interEnvironmentConfig?.enabled);
  const interConfigCompleta = interHasCredentials && interHasCertificates;
  const interProntoParaBoleto = interAmbienteAtivo && interConfigCompleta;

  return {
    podeEmitirNFSe: isFuncionalidadeAtiva('emissaoNFSe'),
    podeGerenciarClientes: isFuncionalidadeAtiva('cadastroClientes'),
    podeGerenciarServicos: isFuncionalidadeAtiva('cadastroServicos'),
    podeCriarOrcamentos: isFuncionalidadeAtiva('vendas'),
    podeUsarCobrancaInterPortal: isFuncionalidadeAtiva('cobrancaInterPortal'),
    interAmbiente: interEnvironment,
    interAmbienteAtivo,
    interConfigCompleta,
    interProntoParaBoleto,
    podeUsarAgendamentos: isFuncionalidadeAtiva('agendamentos'),
    podeUsarReformaTributariaDiagnostico: isFuncionalidadeAtiva('reformaTributariaDiagnostico'),
    possuiFuncionario,
    possuiExtrato: settingsSafe?.possuiExtrato, // Novo campo
    limiteClientes: settingsSafe.configuracoes?.limiteClientes,
    limiteServicos: settingsSafe.configuracoes?.limiteServicos,
    limiteOrcamentos: settingsSafe.configuracoes?.limiteOrcamentos,
    settings: settingsSafe,
    clienteData, // Expor dados do cliente
  };
}

