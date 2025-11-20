/**
 * Tipos para o Sistema de Apuração de Impostos e Fator R
 * Baseado na documentação oficial v1.0
 */

// ============================================================================
// HISTÓRICO DE FOLHA E FATURAMENTO
// ============================================================================

export interface IHistoricoFolhaFaturamento {
  _id?: string;
  
  // Referência
  clienteId: string;
  cnpj: string;
  
  // Período
  periodoApuracao: string; // "AAAAMM" - Ex: "202401"
  mesReferencia: number; // 1-12
  anoReferencia: number; // 2024
  
  // Folha de Pagamento
  folhaPagamento: number; // Valor SEM encargos (salários + pró-labore)
  inssCpp: number; // INSS/CPP patronal + funcionários
  folhaComEncargos: number; // Calculado automaticamente (folha + INSS)
  
  // Faturamento
  faturamentoBruto: number; // Receita bruta do mês
  deducoes?: number; // Opcional
  faturamentoLiquido: number; // Calculado automaticamente
  
  // Fator R
  fatorRPercentual: number; // (folhaComEncargos / faturamentoBruto) * 100
  
  // Metadata
  origem: 'manual' | 'csv' | 'integracao' | 'apuracao';
  arquivoOrigem?: string;
  observacoes?: string[];
  status: 'ativo' | 'cancelado' | 'corrigido';
  criadoEm?: Date | string;
  atualizadoEm?: Date | string;
}

export interface IHistoricoFolhaFaturamentoCreate {
  periodo: string; // "AAAAMM"
  folhaPagamento: number;
  inssCpp: number;
  faturamentoBruto: number;
  deducoes?: number;
  observacoes?: string;
}

export interface IHistoricoFolhaFaturamentoUpdate {
  folhaPagamento?: number;
  inssCpp?: number;
  faturamentoBruto?: number;
  deducoes?: number;
  observacoes?: string;
}

export interface IHistoricoTotais12Meses {
  periodoReferencia: string;
  mesesEncontrados: number;
  historicos: IHistoricoFolhaFaturamento[];
  totais: {
    folhaTotal: number;
    inssTotal: number;
    faturamentoTotal: number;
    folhaComEncargosTotal: number;
    fatorRMedio: number;
    atingeFatorRMinimo: boolean; // >= 28%
  };
}

export interface IUploadCSVResponse {
  sucesso: boolean;
  totalLinhas: number;
  inseridos: number;
  atualizados: number;
  erros: Array<{
    linha: number;
    erro: string;
  }>;
  registros: IHistoricoFolhaFaturamento[];
}

// ============================================================================
// APURAÇÃO
// ============================================================================

export interface IFatorRCalculado {
  folhaDoMes: number;
  inssDoMes: number;
  receitaDoMes: number;
  folhaPagamento12Meses: number;
  inssCpp12Meses: number;
  receitaBruta12Meses: number;
  percentual: number; // Fator R calculado
  aplicavelAnexoIII: boolean; // true se >= 28%
  aplicavelAnexoV: boolean; // true se < 28%
}

export interface INotaFiscalApuracao {
  notaFiscalId: string;
  numeroNota: string;
  dataEmissao: Date | string;
  valorTotal: number;
  valorServicos: number;
  cnae: string;
}

export interface INotasPorAnexo {
  anexo: string; // 'I', 'II', 'III', 'IV', 'V', 'VI'
  usaFatorR: boolean;
  notas: INotaFiscalApuracao[];
  totalNotas: number;
  quantidadeNotas: number;
  aliquotaEfetiva: number;
  impostoCalculado: number;
}

export interface ITributo {
  codigo: string; // 'IRPJ', 'CSLL', 'COFINS', 'PIS', 'CPP', 'ISS'
  denominacao: string;
  valor: number;
  aliquota: number;
}

export interface IApuracao {
  _id?: string;
  
  // Referência
  clienteId: string;
  cnpj: string;
  
  // Período
  periodoApuracao: string; // "AAAAMM"
  mesReferencia: number;
  anoReferencia: number;
  
  // Classificação
  regimeTributario: 'simples' | 'presumido' | 'real';
  anexoPrincipal: string[]; // ['III', 'V']
  
  // Fator R calculado
  fatorR?: IFatorRCalculado;
  
  // Notas por anexo
  notasPorAnexo: INotasPorAnexo[];
  
  // Totais
  totalReceitaBruta: number;
  totalImpostos: number;
  aliquotaEfetivaTotal: number;
  
  // Tributos detalhados
  tributos: ITributo[];
  
  // DAS
  dasGerado: boolean;
  dasId?: string;
  dasNumeroDocumento?: string;
  
  // Status
  status: 'calculada' | 'validada' | 'transmitida' | 'das_gerado' | 'pago' | 'cancelada';
  observacoes: string[];
  alertas: string[];
  
  calculadoEm?: Date | string;
  atualizadoEm?: Date | string;
}

export interface IApuracaoCalcularPayload {
  periodoApuracao: string; // "AAAAMM"
  calcularFatorR?: boolean;
  folhaPagamentoMes?: number;
  inssCppMes?: number;
}

export interface IApuracaoRecalcularPayload {
  calcularFatorR?: boolean;
}

// ============================================================================
// DAS (DOCUMENTO DE ARRECADAÇÃO DO SIMPLES NACIONAL)
// ============================================================================

export interface IDasValores {
  principal: number;
  multa: number;
  juros: number;
  total: number;
}

export interface IDasComposicao {
  periodoApuracao: string;
  codigo: string; // Código do tributo
  denominacao: string; // Nome do tributo
  valores: IDasValores;
}

export interface IDas {
  _id?: string;
  
  // Referência
  clienteId: string;
  cnpj: string;
  
  // Geração
  ambiente: 'teste' | 'producao';
  periodoApuracao: string; // "AAAAMM"
  dataConsolidacao?: string; // "AAAAMMDD" (opcional)
  
  // Dados do DAS
  numeroDocumento: string;
  dataVencimento: string; // "AAAAMMDD"
  dataLimiteAcolhimento: string; // "AAAAMMDD"
  valores: IDasValores;
  composicao: IDasComposicao[];
  observacoes: string[];
  
  // PDF
  pdfBase64?: string;
  
  // Status
  status: 'gerado' | 'pago' | 'cancelado' | 'vencido';
  dataPagamento?: Date | string;
  valorPago?: number;
  
  geradoEm?: Date | string;
  atualizadoEm?: Date | string;
}

export interface IDasGerarPayload {
  dataConsolidacao?: string; // "AAAAMMDD"
  ambiente?: 'teste' | 'producao';
}

export interface IDasGerarResponse {
  sucesso: boolean;
  dasId: string;
  numeroDocumento: string;
  ambiente: 'teste' | 'producao';
  periodoApuracao: string;
  dataVencimento: string;
  pdfBase64?: string;
}

export interface IDasMarcarPagoPayload {
  valorPago: number;
  dataPagamento: Date | string;
}

export interface IDasCancelarPayload {
  motivo: string;
}

// ============================================================================
// FILTROS E QUERIES
// ============================================================================

export interface IHistoricoFiltros {
  status?: 'ativo' | 'cancelado' | 'corrigido';
  origem?: 'manual' | 'csv' | 'integracao' | 'apuracao';
  periodoInicio?: string; // "AAAAMM"
  periodoFim?: string; // "AAAAMM"
}

export interface IApuracaoFiltros {
  status?: 'calculada' | 'validada' | 'transmitida' | 'das_gerado' | 'pago' | 'cancelada';
  periodoInicio?: string; // "AAAAMM"
  periodoFim?: string; // "AAAAMM"
}

export interface IDasFiltros {
  ambiente?: 'teste' | 'producao';
  status?: 'gerado' | 'pago' | 'cancelado' | 'vencido';
  periodoInicio?: string; // "AAAAMM"
  periodoFim?: string; // "AAAAMM"
}

// ============================================================================
// RESPOSTAS DA API
// ============================================================================

export interface IApiResponse<T> {
  sucesso: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IListResponse<T> {
  sucesso: boolean;
  total: number;
  data: T[];
}

// ============================================================================
// TABELAS DE ALÍQUOTAS
// ============================================================================

export interface IFaixaAliquota {
  limiteInferior: number;
  limiteSuperior: number;
  aliquota: number;
  deducao: number;
}

export const TABELA_ANEXO_III: IFaixaAliquota[] = [
  { limiteInferior: 0, limiteSuperior: 180000, aliquota: 6.0, deducao: 0 },
  { limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 11.2, deducao: 9360 },
  { limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 13.5, deducao: 17640 },
  { limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 16.0, deducao: 35640 },
  { limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 21.0, deducao: 125640 },
  { limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 33.0, deducao: 648000 },
];

export const TABELA_ANEXO_V: IFaixaAliquota[] = [
  { limiteInferior: 0, limiteSuperior: 180000, aliquota: 15.5, deducao: 0 },
  { limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 18.0, deducao: 0 },
  { limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 19.5, deducao: 0 },
  { limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 20.5, deducao: 0 },
  { limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 23.0, deducao: 0 },
  { limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 30.5, deducao: 0 },
];

export const FATOR_R_MINIMO = 28; // Percentual mínimo para Anexo III

// ============================================================================
// HELPERS E UTILS
// ============================================================================

/**
 * Calcula a alíquota efetiva baseada na receita bruta e tabela do anexo
 */
export function calcularAliquotaEfetiva(
  receitaBruta12Meses: number,
  tabela: IFaixaAliquota[]
): number {
  const faixa = tabela.find(
    (f) => receitaBruta12Meses >= f.limiteInferior && receitaBruta12Meses <= f.limiteSuperior
  );

  if (!faixa) {
    return 0;
  }

  // Para Anexo V, a alíquota é fixa por faixa
  if (faixa.deducao === 0) {
    return faixa.aliquota;
  }

  // Para Anexo III, usa a fórmula com dedução
  return ((receitaBruta12Meses * faixa.aliquota / 100 - faixa.deducao) / receitaBruta12Meses) * 100;
}

/**
 * Formata período AAAAMM para exibição
 */
export function formatarPeriodo(periodo: string): string {
  if (!periodo || periodo.length !== 6) return periodo;
  const ano = periodo.substring(0, 4);
  const mes = periodo.substring(4, 6);
  return `${mes}/${ano}`;
}

/**
 * Valida formato de período AAAAMM
 */
export function validarPeriodo(periodo: string): boolean {
  if (!periodo || periodo.length !== 6) return false;
  const ano = parseInt(periodo.substring(0, 4), 10);
  const mes = parseInt(periodo.substring(4, 6), 10);
  return ano >= 2000 && ano <= 2100 && mes >= 1 && mes <= 12;
}

