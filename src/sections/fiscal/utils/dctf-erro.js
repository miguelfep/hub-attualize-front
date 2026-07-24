// ----------------------------------------------------------------------
// Traduz a mensagem de erro crua vinda do worker/SerPro (SerproEmissaoLog.erro)
// para uma frase amigável em PT-BR. Se nenhum padrão conhecido casar, devolve a
// própria mensagem crua. Fácil de estender: basta adicionar uma entrada em MAPA.
// ----------------------------------------------------------------------

const MAPA = [
  {
    teste: /acesso negado|procuraç|procurac|acessonegado|sem procura/i,
    mensagem: 'Sem procuração autorizada no e-CAC para este contribuinte.',
  },
  {
    teste: /timeout|etimedout|econnaborted|timed out/i,
    mensagem: 'Tempo esgotado ao consultar o SerPro. Tente reemitir.',
  },
  {
    teste: /econnrefused|enotfound|network error|getaddrinfo|socket hang up/i,
    mensagem: 'Sem conexão com o SerPro.',
  },
  {
    teste: /\b(401|403)\b|certificad|unauthorized|forbidden|autentic/i,
    mensagem: 'Falha de autenticação/certificado do cliente.',
  },
  {
    teste: /status code 5\d\d|\b(500|502|503|504)\b|indispon|bad gateway|service unavailable/i,
    mensagem: 'Serviço do SerPro/e-CAC indisponível. Tente reemitir.',
  },
];

export function traduzirErroDctf(erroCru) {
  const texto = String(erroCru || '').trim();
  if (!texto) return 'Falha ao processar. Motivo não informado.';

  const encontrado = MAPA.find(({ teste }) => teste.test(texto));
  return encontrado ? encontrado.mensagem : texto;
}
