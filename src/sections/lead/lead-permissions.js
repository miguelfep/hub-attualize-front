// ----------------------------------------------------------------------
// Permissões de leads (responsável) e helpers de follow-up.
// ----------------------------------------------------------------------

// Roles que podem reatribuir o responsável de qualquer lead, a qualquer momento.
export const ROLES_GESTOR_LEAD = ['admin', 'superadmin', 'gerencial'];

// Roles elegíveis a aparecer no select de responsável (atuam em vendas).
export const ROLES_RESPONSAVEL_LEAD = ['comercial', 'admin', 'gerencial', 'superadmin'];

export function isGestorLead(role) {
  return ROLES_GESTOR_LEAD.includes(role);
}

// Gestor reatribui qualquer lead; comercial não troca responsável já atrelado.
export function podeReatribuir(user) {
  return isGestorLead(user?.role);
}

// Comercial só pode "pegar" (atribuir a si) leads ainda sem responsável.
export function podePegarLead(user, lead) {
  if (!user) return false;
  if (isGestorLead(user.role)) return false; // gestor usa o select, não o botão "Pegar"
  if (user.role !== 'comercial') return false;
  return !temResponsavel(lead);
}

export function temResponsavel(lead) {
  return !!(lead?.owner || lead?.ownerId);
}

// Usuários elegíveis a responsável (filtra a lista de internos por role).
export function filtrarUsuariosResponsavel(usuarios = []) {
  return usuarios.filter((u) => ROLES_RESPONSAVEL_LEAD.includes(u?.role));
}

// ----------------------------------------------------------------------
// Follow-up
// ----------------------------------------------------------------------

// Normaliza a data do follow-up para meia-noite LOCAL, usando apenas a parte
// de calendário (YYYY-MM-DD). Evita o off-by-one de fuso: "2026-06-18" como
// UTC viraria 17/06 no Brasil. Retorna null se inválida.
export function parseLeadDate(date) {
  if (!date) return null;
  if (typeof date === 'string') {
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

// Retorna o status do follow-up em relação a hoje: 'overdue' | 'today' | 'upcoming' | null.
export function getFollowUpStatus(date) {
  const alvo = parseLeadDate(date);
  if (!alvo) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (alvo < hoje) return 'overdue';
  if (alvo.getTime() === hoje.getTime()) return 'today';
  return 'upcoming';
}

export const FOLLOWUP_STATUS_COLOR = {
  overdue: 'error',
  today: 'warning',
  upcoming: 'info',
};

export const FOLLOWUP_STATUS_LABEL = {
  overdue: 'Atrasado',
  today: 'Hoje',
  upcoming: 'Em dia',
};

// Diferença em dias inteiros a partir de hoje (negativo = atrasado).
export function diasAteFollowUp(date) {
  const alvo = parseLeadDate(date);
  if (!alvo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
}
