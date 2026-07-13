// ----------------------------------------------------------------------
// FAQ da landing nacional "Contabilidade para Psicólogos".
// Sem 'use client': este módulo é importado também pelo page.jsx (server)
// para montar o JSON-LD FAQPage — o FAQ da página e o do schema saem daqui.
// ----------------------------------------------------------------------

export const PSYCHOLOGIST_FAQS = [
  {
    question: 'Psicólogo pode ser MEI?',
    answer:
      'Não. A psicologia é uma profissão regulamentada e não está na lista de atividades permitidas ao MEI. O caminho para atuar como pessoa jurídica é abrir uma empresa (em geral uma sociedade limitada unipessoal) enquadrada no Simples Nacional — o que, com o planejamento certo, ainda assim costuma reduzir bastante a carga tributária em comparação a atender como autônomo.',
  },
  {
    question: 'Quanto um psicólogo PJ paga de imposto?',
    answer:
      'No Simples Nacional, a empresa de psicologia é tributada pelo Anexo III (alíquotas a partir de 6%) quando a folha de pagamento, incluindo o pró-labore, representa 28% ou mais da receita — é o chamado Fator R. Abaixo disso, cai no Anexo V, que começa em 15,5%. Como autônomo, o imposto pode chegar a 27,5% no carnê-leão. Por isso o enquadramento certo faz tanta diferença no fim do mês.',
  },
  {
    question: 'O que é o Fator R?',
    answer:
      'O Fator R é a divisão entre a folha de pagamento (incluindo pró-labore e encargos) e a receita bruta, ambas dos últimos 12 meses. Resultado igual ou maior que 28% leva a empresa ao Anexo III do Simples Nacional (a partir de 6%); abaixo de 28%, ao Anexo V (a partir de 15,5%). Planejar o pró-labore para otimizar o Fator R é uma das principais estratégias da contabilidade especializada em psicólogos.',
  },
  {
    question: 'Vale a pena abrir CNPJ ou continuar atendendo como autônomo?',
    answer:
      'Depende do seu faturamento, mas a partir de alguns milhares de reais por mês a diferença costuma ser expressiva: no carnê-leão o imposto da pessoa física pode chegar a 27,5%, enquanto uma empresa bem enquadrada no Simples Nacional costuma pagar a partir de 6%. Fazemos gratuitamente o comparativo autônomo x PJ com os seus números para você decidir com segurança.',
  },
  {
    question: 'Sou de outra cidade e estado, vocês podem me atender?',
    answer:
      'Sim. Atendemos psicólogos em todo o Brasil de forma 100% online: documentos, assinaturas, emissão de notas e reuniões acontecem pela internet, e você acompanha tudo pelo portal do cliente e pelo WhatsApp. Nossa sede fica em Curitiba/PR, mas a distância não muda nada no atendimento.',
  },
  {
    question: 'Quando vou precisar pagar a primeira mensalidade?',
    answer:
      'Para planos com abertura gratuita sua primeira mensalidade será paga no ato da contratação, caso opte por um plano mensal, sua primeira mensalidade será paga somente no mês seguinte à assinatura do contrato, na data que for escolhida previamente por você.',
  },
  {
    question: 'No contrato, há algum termo de fidelidade por tempo determinado?',
    answer:
      'Somente se você desejar que sua abertura de empresa seja grátis, caso contrário, não vai haver nenhuma fidelidade ou multas para cancelar. A única condição é que nos avise com 30 dias de antecedência.',
  },
  {
    question: 'Por que são cobrados mais R$ 50 na mensalidade, caso eu tenha um funcionário CLT?',
    answer:
      'Ter um funcionário CLT aumenta o custo da mensalidade em R$ 50,00, pois iremos cuidar da folha de pagamento dele, juntamente com todos os cálculos de impostos e descontos sobre a folha.',
  },
];
