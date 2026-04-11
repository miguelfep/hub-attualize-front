'use client';

import { useContext } from 'react';

import Chip from '@mui/material/Chip';

import { useEmpresa } from 'src/hooks/use-empresa';

import { isClientePortalFlagAtiva } from 'src/utils/cliente-portal-flags';

import { PortalClienteSettingsContext } from 'src/contexts/SettingsContext';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/**
 * Módulo DP no portal só é exibido com `possuiFuncionario` no Cliente (espelho em settings).
 * Com empresa ativa carregada, a fonte da verdade é a linha da empresa em `empresas[]`.
 *
 * Usa `useContext(PortalClienteSettingsContext)` direto (e não `useSettings`) para evitar colisão de nome
 * com o `SettingsContext` do tema do dashboard e para funcionar fora do `SettingsProvider` do portal.
 */
export function useDpPortalContext() {
  const { settings, clienteData } = useContext(PortalClienteSettingsContext);
  const settingsSafe = settings || {
    funcionalidades: {},
    configuracoes: {},
    eNotasConfig: {},
    possuiExtrato: false,
    possuiFuncionario: false,
  };
  const possuiFuncionario =
    isClientePortalFlagAtiva(clienteData?.possuiFuncionario) ||
    isClientePortalFlagAtiva(settingsSafe?.possuiFuncionario);
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, empresaAtivaData, loadingEmpresas } = useEmpresa(userId);
  const enabled =
    empresaAtivaData != null
      ? isClientePortalFlagAtiva(empresaAtivaData.possuiFuncionario)
      : possuiFuncionario;
  return { enabled, loadingEmpresas, clienteProprietarioId: empresaAtiva, empresaAtivaData };
}

const STATUS_CADASTRO = {
  pendente_aprovacao: { label: 'Pendente', color: 'warning' },
  aprovado: { label: 'Aprovado', color: 'success' },
  reprovado: { label: 'Reprovado', color: 'error' },
};

const STATUS_VINCULO = {
  ativo: { label: 'Ativo', color: 'success' },
  inativo: { label: 'Inativo', color: 'default' },
};

const STATUS_DEMISSAO = {
  nenhuma: { label: '—', color: 'default' },
  solicitada: { label: 'Solicitada', color: 'info' },
  em_analise: { label: 'Em análise', color: 'warning' },
  aprovada: { label: 'Aprovada', color: 'success' },
  rejeitada: { label: 'Rejeitada', color: 'error' },
};

export function ChipStatusCadastro({ status }) {
  const cfg = STATUS_CADASTRO[status] || { label: status || '—', color: 'default' };
  return <Chip size="small" label={cfg.label} color={cfg.color} variant="soft" />;
}

export function ChipStatusVinculo({ status }) {
  const cfg = STATUS_VINCULO[status] || { label: status || '—', color: 'default' };
  return <Chip size="small" label={cfg.label} color={cfg.color} variant="soft" />;
}

export function ChipStatusDemissao({ status }) {
  const cfg = STATUS_DEMISSAO[status] || { label: status || '—', color: 'default' };
  return <Chip size="small" label={cfg.label} color={cfg.color} variant="soft" />;
}
