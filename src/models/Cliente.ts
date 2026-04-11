/**
 * Modelo Cliente (front) — alinhar campos à API quando existirem no backend.
 */
export interface Cliente {
  _id?: string;
  nome?: string;
  possuiFuncionario?: boolean;
  /** Dia do mês de fechamento da folha (1–31). Opcional. */
  diaFechamentoFolha?: number;
  /** Folha com plano específico. Default `false` na API. */
  folhaComPlano?: boolean;
}
