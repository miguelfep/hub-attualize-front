// ----------------------------------------------------------------------
// Conteúdo da página "Como instalar o certificado digital" (2026)
// Página educativa/tutorial no estilo enotas, alinhada à marca Attualize.
// ----------------------------------------------------------------------

const WHATSAPP_NUMBER = '554196982267';

export const CERTIFICADO_ACCENT = '#0B6BCB';

export const CERTIFICADO_WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Olá, vim pelo site e preciso de ajuda com o certificado digital da minha empresa!'
)}`;

export const CERTIFICADO = {
  slug: 'como-instalar-certificado-digital',
  accent: CERTIFICADO_ACCENT,
  whatsappLink: CERTIFICADO_WHATSAPP_LINK,
  updatedAt: 'Atualizado em 2026',

  seo: {
    title: 'Como instalar o Certificado Digital em 2026 — Passo a Passo | Attualize',
    description:
      'Guia completo e atualizado para 2026: aprenda a instalar e importar o certificado digital (A1, A3 e em nuvem) no Windows, macOS e nos navegadores Chrome, Edge e Firefox. Passo a passo simples, com solução dos erros mais comuns.',
    keywords: [
      'como instalar certificado digital',
      'importar certificado digital',
      'instalar certificado digital A1',
      'instalar certificado digital A3',
      'certificado digital em nuvem',
      'certificado digital 2026',
      'certificado digital windows',
      'certificado digital chrome firefox',
      'ICP-Brasil',
      'certificado digital nota fiscal',
    ],
  },

  hero: {
    chip: 'Guia atualizado para 2026',
    titlePre: 'Como instalar o',
    titleHighlight: 'Certificado Digital',
    subtitle: 'Passo a passo simples para instalar e importar seu certificado A1, A3 ou em nuvem',
    description:
      'Seja para emitir notas fiscais, acessar o e-CAC ou assinar documentos, seu certificado digital ICP-Brasil precisa estar corretamente instalado. Neste guia atualizado para 2026 você aprende, sem complicação, como fazer isso no Windows, no macOS e em cada navegador — e como resolver os erros mais comuns.',
  },

  // O que é / por que instalar
  intro: {
    title: 'O que é o certificado digital',
    highlight: 'e por que instalá-lo',
    paragraphs: [
      'O certificado digital é a sua identidade eletrônica com validade jurídica. Emitido dentro do padrão ICP-Brasil, ele garante que documentos assinados e notas emitidas realmente partiram de você ou da sua empresa, com a mesma força de uma assinatura de próprio punho.',
      'Para que os programas e sites reconheçam essa identidade, o certificado precisa estar instalado no dispositivo (ou disponível na nuvem). Sem essa etapa, o navegador simplesmente não “enxerga” o certificado na hora de emitir uma NF-e, acessar o e-CAC ou fazer login em portais do governo.',
    ],
    usos: [
      { icon: 'solar:bill-list-bold-duotone', label: 'Emitir NF-e, NFS-e e NFC-e' },
      { icon: 'solar:shield-keyhole-bold-duotone', label: 'Acessar o e-CAC e a Receita Federal' },
      { icon: 'solar:pen-new-square-bold-duotone', label: 'Assinar contratos e documentos' },
      { icon: 'solar:buildings-3-bold-duotone', label: 'Conectividade Social e eSocial' },
    ],
  },

  // Tipos de certificado
  tipos: {
    title: 'Qual é o seu tipo de',
    highlight: 'certificado?',
    intro:
      'Antes de instalar, identifique o tipo do seu certificado — o procedimento muda para cada um. Em 2026, o modelo em nuvem já é o mais prático para quem trabalha de qualquer lugar.',
    cards: [
      {
        icon: 'solar:file-check-bold-duotone',
        badge: 'Arquivo',
        title: 'Certificado A1',
        validade: 'Validade de 1 ano',
        description:
          'É um arquivo digital (extensão .pfx ou .p12) protegido por senha. Fica instalado direto no computador ou servidor e pode ser copiado para mais de um dispositivo. É o preferido de quem emite muitas notas, pois permite automação.',
        instalacao: 'Instalação: importar o arquivo no Windows, macOS ou no navegador.',
      },
      {
        icon: 'solar:usb-square-bold-duotone',
        badge: 'Token / Cartão',
        title: 'Certificado A3',
        validade: 'Validade de 1 a 3 anos',
        description:
          'Fica armazenado em uma mídia física — um token USB ou um cartão inteligente (smartcard) com leitora. Não pode ser copiado, o que aumenta a segurança física, mas exige a instalação de um driver/gerenciador.',
        instalacao: 'Instalação: driver da mídia + conectar o token/cartão.',
      },
      {
        icon: 'solar:cloud-bold-duotone',
        badge: 'Nuvem',
        title: 'Certificado em nuvem',
        validade: 'A tendência de 2026',
        description:
          'O certificado fica hospedado com segurança na nuvem (BirdID, VIDaaS, SafeID, Remote ID e outros). Você usa de qualquer lugar, autorizando pelo aplicativo no celular. Não precisa instalar nada na máquina.',
        instalacao: 'Instalação: apenas o app do provedor e a autenticação.',
      },
    ],
  },

  // Passo a passo por plataforma (tabs)
  passos: {
    title: 'Passo a passo para',
    highlight: 'instalar',
    intro:
      'Escolha abaixo o cenário que combina com o seu certificado. Na dúvida sobre qual seguir, o A1 no Windows é o caso mais comum para quem emite notas fiscais.',
    tabs: [
      {
        value: 'a1-windows',
        label: 'A1 no Windows',
        icon: 'mdi:microsoft-windows',
        steps: [
          {
            title: 'Localize o arquivo do certificado',
            description:
              'Tenha em mãos o arquivo com extensão .pfx ou .p12 que você recebeu da Autoridade Certificadora e a senha definida na emissão.',
          },
          {
            title: 'Dê dois cliques no arquivo',
            description:
              'O Windows abre automaticamente o “Assistente para Importação de Certificados”. Clique em Avançar.',
          },
          {
            title: 'Escolha o repositório “Usuário Atual”',
            description:
              'Mantenha selecionado “Usuário Atual” (Current User) e confirme o arquivo na tela seguinte. Clique em Avançar.',
          },
          {
            title: 'Digite a senha do certificado',
            description:
              'Informe a senha do arquivo (a senha do PFX, não a do e-CAC). Marque “Marcar esta chave como exportável” caso queira reinstalar depois e “Incluir todas as propriedades estendidas”. Avançar.',
          },
          {
            title: 'Selecionar automaticamente o repositório',
            description:
              'Deixe marcado “Selecionar automaticamente o armazenamento de certificados” e clique em Avançar e depois em Concluir.',
          },
          {
            title: 'Confirme a importação',
            description:
              'Deve aparecer a mensagem “A importação obteve êxito”. Para conferir, abra o Executar (Windows + R), digite certmgr.msc e veja o certificado em Pessoal › Certificados.',
          },
        ],
        note: 'Chrome e Edge usam o repositório do Windows automaticamente — basta reiniciar o navegador. O Firefox tem repositório próprio (veja a aba correspondente).',
      },
      {
        value: 'a1-mac',
        label: 'A1 no macOS',
        icon: 'mdi:apple',
        steps: [
          {
            title: 'Abra o Acesso às Chaves',
            description:
              'No macOS, procure por “Acesso às Chaves” (Keychain Access) na busca do Spotlight (Command + Espaço).',
          },
          {
            title: 'Importe o arquivo',
            description:
              'No menu superior, clique em Arquivo › Importar Itens e selecione o arquivo .pfx ou .p12 do seu certificado.',
          },
          {
            title: 'Escolha o chaveiro “login”',
            description:
              'Selecione o chaveiro “login” como destino para que o certificado fique disponível para o seu usuário.',
          },
          {
            title: 'Digite a senha do certificado',
            description:
              'Informe a senha do arquivo PFX. O certificado aparecerá na lista, na categoria “Meus Certificados”.',
          },
          {
            title: 'Pronto para usar',
            description:
              'O Safari e o Chrome no Mac utilizam o Acesso às Chaves automaticamente. Reinicie o navegador para que ele reconheça o novo certificado.',
          },
        ],
        note: 'Se o macOS pedir para confiar no certificado, autorize com a sua senha de administrador do Mac.',
      },
      {
        value: 'firefox',
        label: 'No Firefox',
        icon: 'mdi:firefox',
        steps: [
          {
            title: 'Abra as Configurações',
            description:
              'Clique no menu (três traços) no canto superior direito e vá em Configurações.',
          },
          {
            title: 'Vá em Privacidade e Segurança',
            description:
              'No menu lateral, selecione “Privacidade e Segurança” e role até a seção “Certificados”.',
          },
          {
            title: 'Ver certificados › Importar',
            description:
              'Clique em “Ver certificados”, abra a aba “Seus certificados” e clique em Importar.',
          },
          {
            title: 'Selecione o arquivo e a senha',
            description:
              'Escolha o arquivo .pfx / .p12 e informe a senha do certificado. Ele aparecerá na lista de certificados pessoais.',
          },
        ],
        note: 'O Firefox mantém um repositório próprio, independente do Windows e do macOS. Por isso, mesmo com o A1 já instalado no sistema, é preciso importá-lo separadamente aqui.',
      },
      {
        value: 'a3',
        label: 'A3 (token/cartão)',
        icon: 'solar:usb-square-bold-duotone',
        steps: [
          {
            title: 'Instale o gerenciador da mídia',
            description:
              'Baixe e instale o driver/gerenciador do fabricante do seu token ou cartão (por exemplo SafeSign, SafeNet ou Watchdata). O modelo costuma estar indicado na própria mídia.',
          },
          {
            title: 'Conecte o token ou insira o cartão',
            description:
              'Ligue o token em uma porta USB ou coloque o cartão inteligente na leitora. Aguarde o Windows reconhecer o dispositivo.',
          },
          {
            title: 'O certificado é reconhecido automaticamente',
            description:
              'Com o driver instalado, o certificado passa a aparecer no repositório do Windows e, portanto, no Chrome e no Edge.',
          },
          {
            title: 'Informe o PIN quando solicitado',
            description:
              'Ao emitir uma nota ou assinar um documento, o sistema pedirá o PIN da mídia — a senha que você definiu para o token/cartão.',
          },
        ],
        note: 'Se o certificado não aparecer, reinstale o driver, teste outra porta USB e reinicie o computador antes de tentar novamente.',
      },
      {
        value: 'nuvem',
        label: 'Em nuvem',
        icon: 'solar:cloud-bold-duotone',
        steps: [
          {
            title: 'Baixe o app do provedor',
            description:
              'Instale no celular o aplicativo do seu certificado em nuvem (BirdID, VIDaaS, SafeID, Remote ID, entre outros).',
          },
          {
            title: 'Faça login',
            description:
              'Acesse com o seu CPF e a senha cadastrados no momento da emissão do certificado.',
          },
          {
            title: 'Autorize o uso quando for assinar',
            description:
              'Ao emitir uma nota ou assinar um documento, você aprova pelo app — por QR Code, notificação push ou PIN.',
          },
          {
            title: 'Nada a instalar na máquina',
            description:
              'O grande diferencial: não é preciso importar arquivos nem instalar drivers. Você usa o mesmo certificado em qualquer computador ou celular.',
          },
        ],
        note: 'O certificado em nuvem é ICP-Brasil e conta com dupla autenticação — seguro e ideal para quem trabalha de vários lugares.',
      },
    ],
  },

  // Problemas comuns
  problemas: {
    title: 'Erros comuns e como',
    highlight: 'resolver',
    items: [
      {
        icon: 'solar:lock-password-bold-duotone',
        problem: '“Senha incorreta” ao importar',
        solution:
          'A senha pedida é a do arquivo PFX, definida na emissão do certificado — e não a senha do e-CAC ou de qualquer portal. Se você não a tem, será necessário emitir um novo certificado.',
      },
      {
        icon: 'solar:eye-closed-bold-duotone',
        problem: 'O certificado não aparece no navegador',
        solution:
          'Feche e reabra o navegador. No Chrome e no Edge, confirme que ele foi importado no repositório do Windows/macOS. No Firefox, importe manualmente pelas Configurações.',
      },
      {
        icon: 'solar:calendar-mark-bold-duotone',
        problem: 'Certificado vencido',
        solution:
          'O A1 vale 1 ano e o A3 de 1 a 3 anos. Após esse prazo, ele deixa de funcionar e não há renovação automática — é preciso emitir um novo junto à Autoridade Certificadora.',
      },
      {
        icon: 'solar:usb-bold-duotone',
        problem: 'Token A3 não é reconhecido',
        solution:
          'Reinstale ou atualize o driver/gerenciador da mídia, teste outra porta USB e reinicie o computador. Verifique também se a leitora do cartão está funcionando.',
      },
      {
        icon: 'solar:link-broken-bold-duotone',
        problem: '“Erro de cadeia de certificados”',
        solution:
          'Faltam as cadeias da ICP-Brasil (AC Raiz). Baixe e instale as cadeias da sua Autoridade Certificadora para que o sistema reconheça o certificado como confiável.',
      },
      {
        icon: 'solar:copy-bold-duotone',
        problem: 'Preciso usar o A1 em outro computador',
        solution:
          'Copie o arquivo .pfx original e repita a instalação no novo dispositivo, informando a mesma senha. Por isso é importante guardar o arquivo em local seguro no momento da emissão.',
      },
    ],
  },

  // FAQ
  faqs: [
    {
      question: 'Qual a diferença entre certificado A1 e A3?',
      answer:
        'O A1 é um arquivo instalado no computador (.pfx/.p12), com validade de 1 ano e possibilidade de cópia para vários dispositivos. O A3 fica em um token USB ou cartão inteligente, com validade de 1 a 3 anos, e não pode ser copiado — é mais seguro fisicamente, mas exige um driver.',
    },
    {
      question: 'Posso instalar o certificado A1 em mais de um computador?',
      answer:
        'Sim. Basta ter o arquivo .pfx original e a senha. Repita o processo de importação em cada computador. Guarde o arquivo em local seguro, pois sem ele não é possível reinstalar.',
    },
    {
      question: 'Preciso de certificado digital para emitir nota fiscal?',
      answer:
        'Na grande maioria dos casos, sim. A emissão de NF-e e da NFS-e na maior parte dos municípios exige certificado digital ICP-Brasil. Alguns MEIs e prefeituras aceitam login e senha, mas o certificado é o padrão mais seguro e amplamente aceito.',
    },
    {
      question: 'Esqueci a senha do meu certificado. É possível recuperar?',
      answer:
        'Não. A senha do certificado (senha do PFX ou PIN do token) não pode ser recuperada por questões de segurança. Se você a perdeu, será necessário emitir um novo certificado.',
    },
    {
      question: 'O certificado em nuvem é seguro?',
      answer:
        'Sim. O certificado em nuvem também é ICP-Brasil e conta com dupla autenticação (senha + aprovação no aplicativo). É uma opção prática e segura, especialmente para quem precisa usar o certificado de diferentes lugares.',
    },
    {
      question: 'Qual o melhor certificado para uma clínica ou consultório que emite muitas notas?',
      answer:
        'Para quem emite notas em volume, o A1 ou o certificado em nuvem costumam ser os mais indicados, pois permitem automação da emissão sem depender de um token físico conectado à máquina.',
    },
  ],

  cta: {
    title: 'Precisa de ajuda com o',
    highlight: 'certificado digital?',
    subtitle:
      'A Attualize cuida da emissão, instalação e da emissão das notas fiscais dos nossos clientes. Fale com um especialista e deixe a parte técnica com a gente.',
  },
};
