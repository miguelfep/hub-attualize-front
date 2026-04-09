'use client';

import Chip from '@mui/material/Chip';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { isClientePortalFlagAtiva } from 'src/utils/cliente-portal-flags';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/** Uma única leitura de empresa + flag possuiFuncionario (settings ou cadastro da empresa). */
export function useDpPortalContext() {
  const { possuiFuncionario } = useSettings();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, empresaAtivaData, loadingEmpresas } = useEmpresa(userId);
  const enabled =
    possuiFuncionario || isClientePortalFlagAtiva(empresaAtivaData?.possuiFuncionario);
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
