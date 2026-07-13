// ----------------------------------------------------------------------
// Motor do Planejador de Empresa — regras + cálculos puros, sem UI.
// Reutiliza as tabelas do Simples Nacional (Anexos III e V) do módulo
// compartilhado de Fator R. Todos os valores são estimativas simplificadas.
// ----------------------------------------------------------------------

import {
  fBRL,
  fPct,
  ANEXO_V,
  ANEXO_III,
  aliquotaEfetiva,
} from 'src/sections/psicologos-curitiba/fator-r';

export const LIMITE_MEI_ANUAL = 81000;
export const LIMITE_SIMPLES_ANUAL = 4800000;

// ----------------------------------------------------------------------

/**
 * Gera o plano recomendado.
 *
 * @param {object} entrada
 * @param {object} entrada.segmento — item de SEGMENTOS (dados.js)
 * @param {string} entrada.atuacao — 'vou-comecar' | 'autonomo' | 'clt' | 'mei' | 'tenho-cnpj'
 * @param {number} entrada.faturamentoMensal — receita mensal esperada (R$)
 * @param {boolean} entrada.temEquipe — terá funcionários CLT
 * @param {boolean} entrada.temParceiros — trabalha com profissionais parceiros (beleza)
 */
export function gerarPlano({ segmento, atuacao, faturamentoMensal, temEquipe, temParceiros }) {
  const receita12 = faturamentoMensal * 12;

  const cabeNoMei = segmento.meiPermitido && receita12 <= LIMITE_MEI_ANUAL;
  const usaLeiParceiro = Boolean(segmento.leiSalaoParceiro && temParceiros);

  // ------------------------------------------------------------------
  // Formato societário

  let formato;
  if (cabeNoMei) {
    formato = {
      sigla: 'MEI',
      nome: 'Microempreendedor Individual',
      justificativa: `A atividade de ${segmento.rotuloAtividade} é permitida no MEI e seu faturamento estimado (${fBRL(receita12)}/ano) cabe no limite de ${fBRL(LIMITE_MEI_ANUAL)}. É o formato mais barato para começar — e planejamos a transição para ME quando você crescer.`,
    };
  } else {
    formato = {
      sigla: 'SLU',
      nome: 'Sociedade Limitada Unipessoal',
      justificativa: segmento.meiPermitido
        ? `Seu faturamento estimado (${fBRL(receita12)}/ano) passa do limite do MEI (${fBRL(LIMITE_MEI_ANUAL)}). A SLU permite crescer sem sócios e sem comprometer o patrimônio pessoal.`
        : `A atividade de ${segmento.rotuloAtividade} é profissão regulamentada e não é permitida no MEI. A SLU é o formato mais usado: empresa própria, sem exigência de sócios e com patrimônio pessoal protegido.`,
    };
  }

  // ------------------------------------------------------------------
  // Regime e estimativas de imposto

  const cenarios = [];
  const alertas = [];
  let regime;

  if (cabeNoMei) {
    regime = {
      nome: 'MEI (DAS fixo mensal)',
      justificativa:
        'No MEI você paga um valor fixo por mês (cerca de 5% do salário mínimo + ISS), independentemente do faturamento — sem apuração mensal de impostos.',
    };
    cenarios.push({
      rotulo: 'DAS-MEI',
      descricao: 'Valor fixo mensal, independente do faturamento',
      impostoMensal: null,
      aliquota: null,
      destaque: true,
    });
  } else if (usaLeiParceiro) {
    // Beleza com parceiros: Anexo III com e sem a Lei do Salão Parceiro (repasse padrão de 50%)
    const efetivaSem = aliquotaEfetiva(ANEXO_III, receita12);
    const base12ComLei = receita12 * 0.5;
    const efetivaCom = aliquotaEfetiva(ANEXO_III, base12ComLei);

    regime = {
      nome: 'Simples Nacional (Anexo III) + Lei do Salão Parceiro',
      justificativa:
        'Os serviços de beleza são tributados pelo Anexo III do Simples. Com os contratos da Lei 13.352/2016, o repasse aos parceiros sai da base de cálculo — você paga imposto só sobre a sua cota-parte.',
    };
    cenarios.push(
      {
        rotulo: 'Sem a Lei do Salão Parceiro',
        descricao: 'Imposto sobre o valor cheio dos serviços',
        impostoMensal: (receita12 * efetivaSem) / 12,
        aliquota: efetivaSem,
        destaque: false,
      },
      {
        rotulo: 'Com a Lei do Salão Parceiro',
        descricao: 'Imposto sobre a cota-parte (simulação com repasse de 50%)',
        impostoMensal: (base12ComLei * efetivaCom) / 12,
        aliquota: efetivaCom,
        destaque: true,
      }
    );
  } else if (segmento.fatorR) {
    // Saúde e serviços intelectuais: Anexo III via Fator R vs Anexo V
    const efetivaIII = aliquotaEfetiva(ANEXO_III, receita12);
    const efetivaV = aliquotaEfetiva(ANEXO_V, receita12);

    regime = {
      nome: 'Simples Nacional (Anexo III via Fator R)',
      justificativa:
        'Com o pró-labore planejado para a folha atingir 28% da receita (Fator R), sua empresa é tributada pelo Anexo III (a partir de 6%) em vez do Anexo V (a partir de 15,5%). É o principal planejamento do seu segmento.',
    };
    cenarios.push(
      {
        rotulo: 'Sem planejamento (Anexo V)',
        descricao: 'Fator R abaixo de 28%',
        impostoMensal: (receita12 * efetivaV) / 12,
        aliquota: efetivaV,
        destaque: false,
      },
      {
        rotulo: 'Com Fator R planejado (Anexo III)',
        descricao: 'Folha + pró-labore em 28% da receita',
        impostoMensal: (receita12 * efetivaIII) / 12,
        aliquota: efetivaIII,
        destaque: true,
      }
    );
  } else {
    // Demais serviços sem Fator R: Anexo III direto
    const efetivaIII = aliquotaEfetiva(ANEXO_III, receita12);
    regime = {
      nome: 'Simples Nacional (Anexo III)',
      justificativa:
        'Os serviços do seu segmento são tributados pelo Anexo III do Simples Nacional, com alíquotas progressivas a partir de 6% sobre o faturamento.',
    };
    cenarios.push({
      rotulo: 'Simples Nacional (Anexo III)',
      descricao: 'Alíquota efetiva sobre o faturamento',
      impostoMensal: (receita12 * efetivaIII) / 12,
      aliquota: efetivaIII,
      destaque: true,
    });
  }

  // ------------------------------------------------------------------
  // Alertas e oportunidades

  if (atuacao === 'autonomo') {
    alertas.push(
      'Hoje, como autônomo, sua renda cai na tabela progressiva do IRPF (até 27,5%) mais INSS. Com o CNPJ e o enquadramento recomendado acima, a carga costuma cair bastante — fazemos o comparativo exato no diagnóstico gratuito.'
    );
  }

  if (segmento.equiparacaoHospitalar && faturamentoMensal >= 40000) {
    alertas.push(
      'Com esse faturamento, vale simular também o Lucro Presumido com equiparação hospitalar (para clínicas com procedimentos e exames): a base do IRPJ cai de 32% para 8% e a da CSLL de 32% para 12%.'
    );
  }

  if (segmento.leiSalaoParceiro && !temParceiros) {
    alertas.push(
      'Se no futuro você trabalhar com profissionais parceiros, a Lei do Salão Parceiro (13.352/2016) permite pagar imposto apenas sobre a sua cota-parte.'
    );
  }

  if (!segmento.meiPermitido && segmento.id === 'servicos' && receita12 <= LIMITE_MEI_ANUAL) {
    alertas.push(
      'Dependendo da sua atividade, ela pode estar na lista do MEI — conferimos isso no diagnóstico gratuito.'
    );
  }

  if (receita12 > LIMITE_SIMPLES_ANUAL) {
    alertas.push(
      `Seu faturamento estimado passa do teto do Simples Nacional (${fBRL(LIMITE_SIMPLES_ANUAL)}/ano). O planejamento envolve Lucro Presumido ou Real — cenário que montamos com um especialista.`
    );
  }

  if (temEquipe) {
    alertas.push(
      'Com funcionários CLT, a folha de pagamento entra no planejamento (encargos, eSocial e, nos segmentos com Fator R, ela ajuda a reduzir o imposto).'
    );
  }

  // ------------------------------------------------------------------
  // Checklist personalizado

  const checklist = [];
  if (atuacao === 'mei' && !cabeNoMei) {
    checklist.push('Desenquadrar o MEI e migrar para ME sem multa e na janela certa');
  } else if (atuacao === 'mei' && cabeNoMei) {
    checklist.push('Revisar o seu MEI (CNAE correto, DAS e declaração anual em dia)');
  } else if (atuacao === 'tenho-cnpj') {
    checklist.push('Revisar o enquadramento atual do CNPJ (anexo, CNAE e regime)');
  } else {
    checklist.push(`Abrir o CNPJ no formato ${formato.sigla} com o CNAE correto`);
  }

  if (!cabeNoMei && segmento.fatorR && !usaLeiParceiro) {
    checklist.push('Definir o pró-labore ideal para manter o Fator R em 28% e ficar no Anexo III');
  }
  if (usaLeiParceiro) {
    checklist.push('Formalizar os parceiros (MEI/ME) e assinar os contratos da Lei 13.352/2016');
    checklist.push('Configurar o sistema de gestão de parceria (repasses, notas e painel do gestor)');
  }
  if (segmento.conselho) {
    checklist.push(`Registrar a empresa no ${segmento.conselho} e manter as obrigações do conselho em dia`);
  }
  checklist.push('Credenciar a empresa na NFS-e (Emissor Nacional) para emitir notas');
  checklist.push('Verificar alvará de funcionamento e vigilância sanitária do seu município');
  if (temEquipe) {
    checklist.push('Estruturar a folha de pagamento (registro, eSocial e encargos)');
  }

  // ------------------------------------------------------------------
  // Resumo para o WhatsApp / observações do lead

  const cenarioDestaque = cenarios.find((c) => c.destaque);
  const impostoResumo = cenarioDestaque?.impostoMensal
    ? `${fBRL(cenarioDestaque.impostoMensal)}/mês (alíquota efetiva ${fPct(cenarioDestaque.aliquota)})`
    : 'DAS fixo mensal (MEI)';

  const resumo = `Segmento: ${segmento.label} · Situação: ${atuacao} · Faturamento estimado: ${fBRL(faturamentoMensal)}/mês · Formato recomendado: ${formato.sigla} · Regime: ${regime.nome} · Imposto estimado: ${impostoResumo}${temEquipe ? ' · Terá equipe CLT' : ''}${temParceiros ? ' · Trabalha com parceiros' : ''}`;

  return { formato, regime, cenarios, alertas, checklist, resumo, receita12, cabeNoMei };
}
