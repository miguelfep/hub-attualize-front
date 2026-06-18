// ----------------------------------------------------------------------
// Constantes e helpers de status de Lead (compartilhados entre lista,
// kanban e detalhe). Centraliza labels/cores que antes estavam duplicados.
// ----------------------------------------------------------------------

export const LEAD_STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'info' },
  { value: 'contatado', label: 'Contatado', color: 'primary' },
  { value: 'qualificado', label: 'Qualificado', color: 'success' },
  { value: 'proposta-enviada', label: 'Proposta Enviada', color: 'warning' },
  { value: 'negociacao', label: 'Em Negociação', color: 'warning' },
  { value: 'convertido', label: 'Convertido', color: 'success' },
  { value: 'perdido', label: 'Perdido', color: 'error' },
];

// Colunas do kanban, na ordem do funil de vendas.
export const LEAD_KANBAN_COLUMNS = LEAD_STATUS_OPTIONS;

// Status padrão quando o lead ainda não tem statusLead definido.
export const LEAD_DEFAULT_STATUS = 'novo';

export function getStatusLabel(status) {
  const option = LEAD_STATUS_OPTIONS.find((o) => o.value === status);
  return option ? option.label : 'Novo';
}

export function getStatusColor(status) {
  const option = LEAD_STATUS_OPTIONS.find((o) => o.value === status);
  return option ? option.color : 'default';
}

// Normaliza o status de um lead (trata ausência como "novo").
export function getLeadStatus(lead) {
  return lead?.statusLead || LEAD_DEFAULT_STATUS;
}
