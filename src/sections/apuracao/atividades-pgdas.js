/**
 * Tabela de atividades do PGDAS-D (campo `idAtividade` da declaração).
 *
 * Fonte: documentação oficial da Serpro, "Dados de domínio" do PGDAS-D.
 * https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-sn/pgdasd/dados_de_dominio/
 *
 * O código NÃO é por CNAE nem por anexo: ele combina a natureza da receita, o
 * anexo, se há retenção ou substituição de ISS e para qual município o ISS é
 * devido. Por isso descrições parecidas têm ids diferentes conforme o grupo —
 * daí o agrupamento aqui ser parte da informação, não enfeite.
 */

export const GRUPOS_ATIVIDADE_PGDAS = [
  {
    grupo: 'Revenda de mercadorias, exceto para o exterior',
    atividades: [
      {
        id: 1,
        descricao:
          'Sem substituição tributária / tributação monofásica / antecipação com encerramento (o substituto do ICMS usa esta)',
      },
      {
        id: 2,
        descricao:
          'Com substituição tributária / tributação monofásica / antecipação com encerramento (o substituído do ICMS usa esta)',
      },
    ],
  },
  {
    grupo: 'Revenda de mercadorias para o exterior',
    atividades: [{ id: 3, descricao: 'Revenda de mercadorias para o exterior' }],
  },
  {
    grupo: 'Venda de mercadorias industrializadas pelo contribuinte, exceto para o exterior',
    atividades: [
      {
        id: 4,
        descricao:
          'Sem substituição tributária / tributação monofásica / antecipação com encerramento (o substituto do ICMS usa esta)',
      },
      {
        id: 5,
        descricao:
          'Com substituição tributária / tributação monofásica / antecipação com encerramento (o substituído do ICMS usa esta)',
      },
    ],
  },
  {
    grupo: 'Venda de mercadorias industrializadas para o exterior',
    atividades: [{ id: 6, descricao: 'Venda de mercadorias industrializadas para o exterior' }],
  },
  {
    grupo: 'Locação de bens móveis',
    atividades: [
      { id: 7, descricao: 'Exceto para o exterior' },
      { id: 8, descricao: 'Para o exterior' },
    ],
  },
  {
    grupo: 'Prestação de serviços, exceto para o exterior',
    atividades: [
      {
        id: 9,
        descricao:
          'Escritórios de serviços contábeis autorizados a pagar ISS em valor fixo em guia do Município',
      },
      {
        id: 10,
        descricao: 'Sujeitos ao fator "r", sem retenção/substituição de ISS, ISS devido a outro(s) Município(s)',
        fatorR: true,
      },
      {
        id: 11,
        descricao:
          'Sujeitos ao fator "r", sem retenção/substituição de ISS, ISS devido ao próprio Município do estabelecimento',
        fatorR: true,
      },
      {
        id: 12,
        descricao: 'Sujeitos ao fator "r", com retenção/substituição de ISS',
        fatorR: true,
      },
      {
        id: 13,
        descricao:
          'Não sujeitos ao fator "r", Anexo III, sem retenção/substituição de ISS, ISS devido a outro(s) Município(s)',
      },
      {
        id: 14,
        descricao:
          'Não sujeitos ao fator "r", Anexo III, sem retenção/substituição de ISS, ISS devido ao próprio Município',
      },
      {
        id: 15,
        descricao: 'Não sujeitos ao fator "r", Anexo III, com retenção/substituição de ISS',
      },
      {
        id: 16,
        descricao: 'Anexo IV, sem retenção/substituição de ISS, ISS devido a outro(s) Município(s)',
      },
      {
        id: 17,
        descricao: 'Anexo IV, sem retenção/substituição de ISS, ISS devido ao próprio Município',
      },
      { id: 18, descricao: 'Anexo IV, com retenção/substituição de ISS' },
    ],
  },
  {
    grupo:
      'Serviços dos subitens 7.02, 7.05 e 16.1 (construção civil e transporte municipal), exceto para o exterior',
    atividades: [
      {
        id: 19,
        descricao:
          'Construção civil (7.02 e 7.05), Anexo III, sem retenção/substituição de ISS, ISS devido a outro(s) Município(s)',
      },
      {
        id: 20,
        descricao:
          'Construção civil (7.02 e 7.05), Anexo III, sem retenção/substituição de ISS, ISS devido ao próprio Município',
      },
      {
        id: 21,
        descricao: 'Construção civil (7.02 e 7.05), Anexo III, com retenção/substituição de ISS',
      },
      {
        id: 22,
        descricao:
          'Construção civil (7.02 e 7.05), Anexo IV, sem retenção/substituição de ISS, ISS devido a outro(s) Município(s)',
      },
      {
        id: 23,
        descricao:
          'Construção civil (7.02 e 7.05), Anexo IV, sem retenção/substituição de ISS, ISS devido ao próprio Município',
      },
      {
        id: 24,
        descricao: 'Construção civil (7.02 e 7.05), Anexo IV, com retenção/substituição de ISS',
      },
      {
        id: 25,
        descricao:
          'Transporte coletivo municipal de passageiros, sem retenção/substituição de ISS, ISS devido a outro(s) Município(s)',
      },
      {
        id: 26,
        descricao:
          'Transporte coletivo municipal de passageiros, sem retenção/substituição de ISS, ISS devido ao próprio Município',
      },
      {
        id: 27,
        descricao: 'Transporte coletivo municipal de passageiros, com retenção/substituição de ISS',
      },
    ],
  },
  {
    grupo: 'Prestação de serviços para o exterior',
    atividades: [
      {
        id: 28,
        descricao:
          'Escritórios de serviços contábeis autorizados a pagar ISS em valor fixo em guia do Município',
      },
      { id: 29, descricao: 'Sujeitos ao fator "r"', fatorR: true },
      { id: 30, descricao: 'Não sujeitos ao fator "r" e tributados pelo Anexo III' },
      { id: 31, descricao: 'Sujeitos ao Anexo IV' },
      { id: 32, descricao: 'Construção civil (7.02 e 7.05), Anexo III' },
      { id: 33, descricao: 'Construção civil (7.02 e 7.05), Anexo IV' },
    ],
  },
  {
    grupo: 'Transporte e comunicação (ICMS), exceto para o exterior',
    atividades: [
      { id: 34, descricao: 'Transporte sem substituição tributária de ICMS (o substituto usa esta)' },
      { id: 35, descricao: 'Transporte com substituição tributária de ICMS (o substituído usa esta)' },
      {
        id: 36,
        descricao: 'Comunicação sem substituição tributária de ICMS (o substituto usa esta)',
      },
      {
        id: 37,
        descricao: 'Comunicação com substituição tributária de ICMS (o substituído usa esta)',
      },
    ],
  },
  {
    grupo: 'Transporte e comunicação para o exterior',
    atividades: [
      { id: 38, descricao: 'Transporte' },
      { id: 39, descricao: 'Comunicação' },
    ],
  },
  {
    grupo: 'Incidência simultânea de IPI e ISS, exceto para o exterior',
    atividades: [
      { id: 40, descricao: 'Sem retenção/substituição de ISS, ISS devido a outro(s) Município(s)' },
      { id: 41, descricao: 'Sem retenção/substituição de ISS, ISS devido ao próprio Município' },
      { id: 42, descricao: 'Com retenção/substituição de ISS' },
    ],
  },
  {
    grupo: 'Incidência simultânea de IPI e ISS para o exterior',
    atividades: [{ id: 43, descricao: 'Atividades com incidência simultânea de IPI e ISS' }],
  },
];

/** Lista achatada, para busca por id. */
export const ATIVIDADES_PGDAS = GRUPOS_ATIVIDADE_PGDAS.flatMap((g) =>
  g.atividades.map((a) => ({ ...a, grupo: g.grupo }))
);

export function atividadeLabel(id) {
  const a = ATIVIDADES_PGDAS.find((x) => x.id === Number(id));
  return a ? `${a.id} — ${a.descricao}` : id ? `${id} — código não catalogado` : '—';
}

/** Atividades cujo enquadramento depende do Fator R — as mais comuns na carteira. */
export const ATIVIDADES_FATOR_R = ATIVIDADES_PGDAS.filter((a) => a.fatorR);
