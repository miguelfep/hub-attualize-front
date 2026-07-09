// ----------------------------------------------------------------------
// Fator R — tabelas do Simples Nacional (LC 123/2006) e cálculo puro.
// Mantido sem dependências para ser testável e reutilizável.
// ----------------------------------------------------------------------

export const LIMIAR_FATOR_R = 0.28;

/** Anexo III — RBT12 → alíquota nominal / parcela a deduzir */
export const ANEXO_III = [
  { ate: 180000, aliquota: 0.06, deduzir: 0 },
  { ate: 360000, aliquota: 0.112, deduzir: 9360 },
  { ate: 720000, aliquota: 0.135, deduzir: 17640 },
  { ate: 1800000, aliquota: 0.16, deduzir: 35640 },
  { ate: 3600000, aliquota: 0.21, deduzir: 125640 },
  { ate: 4800000, aliquota: 0.33, deduzir: 648000 },
];

/** Anexo V — RBT12 → alíquota nominal / parcela a deduzir */
export const ANEXO_V = [
  { ate: 180000, aliquota: 0.155, deduzir: 0 },
  { ate: 360000, aliquota: 0.18, deduzir: 4500 },
  { ate: 720000, aliquota: 0.195, deduzir: 9900 },
  { ate: 1800000, aliquota: 0.205, deduzir: 17100 },
  { ate: 3600000, aliquota: 0.23, deduzir: 62100 },
  { ate: 4800000, aliquota: 0.305, deduzir: 540000 },
];

export function faixaDoAnexo(tabela, rbt12) {
  return tabela.find((faixa) => rbt12 <= faixa.ate) || tabela[tabela.length - 1];
}

/** Alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) / RBT12 */
export function aliquotaEfetiva(tabela, rbt12) {
  if (!rbt12 || rbt12 <= 0) return 0;
  const faixa = faixaDoAnexo(tabela, rbt12);
  return (rbt12 * faixa.aliquota - faixa.deduzir) / rbt12;
}

/**
 * Simulação completa do Fator R.
 * @param {{ receita12: number, folha12: number }} entrada — valores dos últimos 12 meses (R$)
 */
export function calcularFatorR({ receita12, folha12 }) {
  const receita = Number(receita12) || 0;
  const folha = Number(folha12) || 0;

  const fatorR = receita > 0 ? folha / receita : 0;
  const anexo = fatorR >= LIMIAR_FATOR_R ? 'III' : 'V';

  const efetivaIII = aliquotaEfetiva(ANEXO_III, receita);
  const efetivaV = aliquotaEfetiva(ANEXO_V, receita);

  const impostoMensalIII = (receita / 12) * efetivaIII;
  const impostoMensalV = (receita / 12) * efetivaV;

  const noAnexoV = anexo === 'V';
  const economiaAnual = noAnexoV ? Math.max(0, (efetivaV - efetivaIII) * receita) : 0;
  // Quanto de pró-labore anual falta para a folha atingir 28% da receita
  const proLaboreAnualNecessario = noAnexoV ? Math.max(0, LIMIAR_FATOR_R * receita - folha) : 0;

  return {
    receita12: receita,
    folha12: folha,
    fatorR,
    anexo,
    efetivaIII,
    efetivaV,
    impostoMensalIII,
    impostoMensalV,
    economiaAnual,
    proLaboreAnualNecessario,
    proLaboreMensalNecessario: proLaboreAnualNecessario / 12,
  };
}

// ----------------------------------------------------------------------
// Formatação/parse pt-BR (sem dependências)

export const fBRL = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);

export const fPct = (fracao, casas = 2) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  }).format((Number(fracao) || 0) * 100)}%`;

/**
 * Máscara de moeda pt-BR enquanto digita: mantém apenas dígitos e vírgula,
 * pontua os milhares e limita os centavos a 2 casas. '300000' → '300.000'.
 */
export function mascaraMoedaBR(texto) {
  const limpo = String(texto || '').replace(/[^\d,]/g, '');
  if (!limpo) return '';
  const [inteiro, ...resto] = limpo.split(',');
  const inteiroFmt = inteiro.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (resto.length === 0) return inteiroFmt;
  return `${inteiroFmt || '0'},${resto.join('').slice(0, 2)}`;
}

/** Aceita "25000", "25.000,50", "R$ 25.000,50" → número. Vazio/inválido → 0. */
export function parseMoedaBR(texto) {
  if (typeof texto === 'number') return texto;
  const limpo = String(texto || '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const numero = Number(limpo);
  return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}
