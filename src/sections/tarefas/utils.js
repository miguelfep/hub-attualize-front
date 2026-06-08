// ----------------------------------------------------------------------
// Constantes e helpers da feature Tarefas (espelham as regras do backend).
// ----------------------------------------------------------------------

/** Papéis que podem criar/editar/reatribuir e ver histórico. */
export const ROLES_GESTORES = ['admin', 'gerencial'];

/** Papéis internos com acesso à feature (o papel `cliente` é negado). */
export const ROLES_INTERNOS = [
  'admin',
  'gerencial',
  'financeiro',
  'operacional',
  'comercial',
  'contabil_externo',
  'ir',
];

/** True quando o papel pode criar/editar/reatribuir tarefas. */
export function isGestor(role) {
  return ROLES_GESTORES.includes(role);
}

// ----------------------------------------------------------------------

export const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: 'default' },
  { value: 'em_andamento', label: 'Em andamento', color: 'info' },
  { value: 'concluida', label: 'Concluída', color: 'success' },
  { value: 'cancelada', label: 'Cancelada', color: 'error' },
];

export const PRIORIDADE_OPTIONS = [
  { value: 'alta', label: 'Alta', color: 'error' },
  { value: 'media', label: 'Média', color: 'warning' },
  { value: 'baixa', label: 'Baixa', color: 'success' },
];

/** Transições válidas de status (estados terminais não permitem transição). */
export const TRANSICOES_STATUS = {
  pendente: ['em_andamento', 'cancelada'],
  em_andamento: ['concluida', 'cancelada'],
  concluida: [],
  cancelada: [],
};

// Os setores agora são uma entidade gerenciável (/api/setores). As tarefas os
// referenciam por `slug`; o rótulo (nome) é resolvido a partir da lista carregada.

// ----------------------------------------------------------------------

export function statusLabel(value) {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function statusColor(value) {
  return STATUS_OPTIONS.find((o) => o.value === value)?.color ?? 'default';
}

export function prioridadeLabel(value) {
  return PRIORIDADE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function prioridadeColor(value) {
  return PRIORIDADE_OPTIONS.find((o) => o.value === value)?.color ?? 'default';
}

/** Próximos status possíveis a partir do status atual. */
export function transicoesPermitidas(statusAtual) {
  return TRANSICOES_STATUS[statusAtual] ?? [];
}

/**
 * Resolve o nome de um setor a partir do seu slug, usando a lista carregada
 * de `/api/setores`. Faz fallback para o próprio slug quando não encontrado.
 * @param {string} slug
 * @param {Array<{ slug: string, nome: string }>} [setores]
 */
export function setorNome(slug, setores = []) {
  return setores.find((s) => s.slug === slug)?.nome ?? slug;
}

// ----------------------------------------------------------------------

/** Rótulo amigável do cliente (interna quando sem cliente). */
export function clienteLabel(cliente) {
  if (!cliente) return 'Interna';
  return cliente.nomeFantasia || cliente.razaoSocial || cliente.nome || 'Cliente';
}
