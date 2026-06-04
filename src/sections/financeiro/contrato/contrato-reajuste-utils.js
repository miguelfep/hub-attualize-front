import dayjs from 'dayjs';

// ----------------------------------------------------------------------
// Análise de reajuste anual dos contratos (cálculo client-side)
// ----------------------------------------------------------------------

// Janela (em dias) para considerar um reajuste como "próximo".
export const DIAS_REAJUSTE_PROXIMO = 30;

/**
 * Calcula a situação de reajuste de um contrato.
 *
 * Categorias:
 * - 'desabilitado': contrato não possui reajuste anual habilitado;
 * - 'vencido':      já passou de 12 meses desde o início/último reajuste (está para ser reajustado);
 * - 'proximo':      faltam até DIAS_REAJUSTE_PROXIMO dias para completar 12 meses;
 * - 'em-dia':       ainda dentro do ciclo de 12 meses.
 */
export function getReajusteInfo(contrato) {
  if (!contrato?.possuiReajusteAnual) {
    return {
      category: 'desabilitado',
      label: 'Sem reajuste',
      color: 'default',
      proximaData: null,
      diasRestantes: null,
      elegivel: false,
    };
  }

  const base = contrato.dataUltimoReajuste || contrato.dataInicio;
  const proximaData = base ? dayjs(base).add(1, 'year') : null;
  const diasRestantes = proximaData ? proximaData.startOf('day').diff(dayjs().startOf('day'), 'day') : null;

  // Elegibilidade operacional (mesma regra do backend para aplicação do reajuste).
  const elegivel =
    contrato.status === 'ativo' &&
    contrato.tipoCobranca === 'mensal' &&
    Number(contrato.percentualReajusteAnual) > 0;

  if (diasRestantes != null && diasRestantes <= 0) {
    return {
      category: 'vencido',
      label: 'A reajustar',
      color: 'error',
      proximaData,
      diasRestantes,
      elegivel,
    };
  }

  if (diasRestantes != null && diasRestantes <= DIAS_REAJUSTE_PROXIMO) {
    return {
      category: 'proximo',
      label: 'Reajuste próximo',
      color: 'warning',
      proximaData,
      diasRestantes,
      elegivel,
    };
  }

  return {
    category: 'em-dia',
    label: 'Reajuste em dia',
    color: 'success',
    proximaData,
    diasRestantes,
    elegivel,
  };
}

// Status de cobrança "em aberto" (ainda não pagas).
const STATUS_EM_ABERTO = ['EMABERTO', 'A_RECEBER'];

/**
 * Indica se uma cobrança está vencida ou expirada — ou seja, precisa de atenção.
 * Considera:
 * - status === 'VENCIDO' (marcada como vencida pelo backend);
 * - cobrança em aberto cujo vencimento já passou (boleto expirado).
 * Cobranças em aberto com vencimento futuro NÃO entram (estão no prazo).
 */
export function isCobrancaVencidaOuExpirada(cobranca) {
  if (cobranca?.status === 'VENCIDO') return true;

  if (STATUS_EM_ABERTO.includes(cobranca?.status) && cobranca?.dataVencimento) {
    return dayjs(cobranca.dataVencimento).endOf('day').isBefore(dayjs());
  }

  return false;
}

/**
 * Agrega as cobranças vencidas/expiradas por contrato (contratos que precisam de atenção).
 * Retorna um mapa { [contratoId]: { valor, count } }.
 */
export function agruparPendentesPorContrato(cobrancas = []) {
  const mapa = {};

  cobrancas.forEach((cobranca) => {
    if (!isCobrancaVencidaOuExpirada(cobranca)) return;

    const contratoRef = cobranca?.contrato;
    const contratoId = typeof contratoRef === 'object' ? contratoRef?._id : contratoRef;
    if (!contratoId) return;

    if (!mapa[contratoId]) {
      mapa[contratoId] = { valor: 0, count: 0 };
    }

    mapa[contratoId].valor += Number(cobranca.valor) || 0;
    mapa[contratoId].count += 1;
  });

  return mapa;
}
