import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const _carouselsMembers = [...Array(6)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  role: _mock.role(index),
  avatarUrl: _mock.image.portrait(index),
}));

// ----------------------------------------------------------------------

export const _faqs = [...Array(8)].map((_, index) => ({
  id: _mock.id(index),
  value: `panel${index + 1}`,
  heading: `Questions ${index + 1}`,
  detail: _mock.description(index),
}));

// ----------------------------------------------------------------------

export const _addressBooks = [...Array(24)].map((_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  email: _mock.email(index + 1),
  fullAddress: _mock.fullAddress(index),
  phoneNumber: _mock.phoneNumber(index),
  company: _mock.companyNames(index + 1),
  addressType: index === 0 ? 'Home' : 'Office',
}));

// ----------------------------------------------------------------------

export const _contacts = [...Array(20)].map((_, index) => {
  const status =
    (index % 2 && 'online') || (index % 3 && 'offline') || (index % 4 && 'alway') || 'busy';

  return {
    id: _mock.id(index),
    status,
    role: _mock.role(index),
    email: _mock.email(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
    lastActivity: _mock.time(index),
    avatarUrl: _mock.image.avatar(index),
    address: _mock.fullAddress(index),
  };
});

// ----------------------------------------------------------------------

export const _notifications = [...Array(9)].map((_, index) => ({
  id: _mock.id(index),
  avatarUrl: [
    _mock.image.avatar(1),
    _mock.image.avatar(2),
    _mock.image.avatar(3),
    _mock.image.avatar(4),
    _mock.image.avatar(5),
    null,
    null,
    null,
    null,
    null,
  ][index],
  type: ['friend', 'project', 'file', 'tags', 'payment', 'order', 'chat', 'mail', 'delivery'][
    index
  ],
  category: [
    'Communication',
    'Project UI',
    'File manager',
    'File manager',
    'File manager',
    'Order',
    'Order',
    'Communication',
    'Communication',
  ][index],
  isUnRead: _mock.boolean(index),
  createdAt: _mock.time(index),
  title:
    (index === 0 && `<p><strong>Deja Brady</strong> sent you a friend request</p>`) ||
    (index === 1 &&
      `<p><strong>Jayvon Hull</strong> mentioned you in <strong><a href='#'>Minimal UI</a></strong></p>`) ||
    (index === 2 &&
      `<p><strong>Lainey Davidson</strong> added file to <strong><a href='#'>File manager</a></strong></p>`) ||
    (index === 3 &&
      `<p><strong>Angelique Morse</strong> added new tags to <strong><a href='#'>File manager<a/></strong></p>`) ||
    (index === 4 &&
      `<p><strong>Giana Brandt</strong> request a payment of <strong>$200</strong></p>`) ||
    (index === 5 && `<p>Your order is placed waiting for shipping</p>`) ||
    (index === 6 && `<p>Delivery processing your order is being shipped</p>`) ||
    (index === 7 && `<p>You have new message 5 unread messages</p>`) ||
    (index === 8 && `<p>You have new mail`) ||
    '',
}));

// ----------------------------------------------------------------------

export const _mapContact = [
  {
    latlng: [-49.24942, -25.4259292],
    address:"Rua dias da rocha filho 670, ALTO DA RUA XV",
    phoneNumber: "41 3068-1800",
  },
  
];

// ----------------------------------------------------------------------

export const _socials = [
  {
    value: 'facebook',
    name: 'Facebook',
    path: 'https://www.facebook.com/attualizecontabil/',
  },
  {
    value: 'instagram',
    name: 'Instagram',
    path: 'https://www.instagram.com/attualizecontabil/',
  },
  {
    value: 'linkedin',
    name: 'Linkedin',
    path: 'https://br.linkedin.com/company/attualize-contabil',
  },
  {
    value: 'youtube',
    name: 'Youtube',
    path: 'https://www.youtube.com/channel/UCefLgcPyYDLbm98QXVm_LFg',
  },
];

// ----------------------------------------------------------------------

export const _pricingPlans = [
  {
    subscription: 'basic',
    price: 0,
    caption: 'Forever',
    lists: ['3 prototypes', '3 boards', 'Up to 5 team members'],
    labelAction: 'Current plan',
  },
  {
    subscription: 'starter',
    price: 4.99,
    caption: 'Saving $24 a year',
    lists: [
      '3 prototypes',
      '3 boards',
      'Up to 5 team members',
      'Advanced security',
      'Issue escalation',
    ],
    labelAction: 'Choose starter',
  },
  {
    subscription: 'premium',
    price: 9.99,
    caption: 'Saving $124 a year',
    lists: [
      '3 prototypes',
      '3 boards',
      'Up to 5 team members',
      'Advanced security',
      'Issue escalation',
      'Issue development license',
      'Permissions & workflows',
    ],
    labelAction: 'Choose premium',
  },
];

// ----------------------------------------------------------------------

export const _testimonials = [
  {
    name: "Monica Camozele",
    postedDate: _mock.time(1),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(1),
    content: `“A Attualize foi muito importante ao valorizar o que eu tinha pra contar sobre o meu trabalho. Um outro contador mal me ouviu e disse que não valeria a pena eu abrir empresa. Senti um desdém, não sabia se pelo meu trabalho, por mim, ou por eu ser mulher. A disponibilidade em tirar minhas dúvidas, mesmo que eu pergunte 5 vezes a mesma coisa por não ter entendido ainda, é uma das coisas que me mantém com vocês. A atenção e cuidado de vocês com o cliente, é um baita diferencial. Me sinto respeitada e segura com vocês. Só tenho a agradecer.”`,
  },
  {
    name: "Juliana Romualdo",
    postedDate: _mock.time(2),
    ratingNumber:5,
    avatarUrl: _mock.image.avatar(2),
    content: `Sou nova por aqui, estou em fase de migração, estou aliviada de ter vcs. Mas preocupadas com as informações que nunca tive acesso. Enfim eu estou me sentindo segura e amparada. Adoro a página, as dicas. Foi através disso que pensei, tem algo errado na minha empresa e procurei vocês.`,
  },
  {
    name: "Celso Marchioretto",
    postedDate: _mock.time(3),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(3),
    content: `Sempre sou muito bem atendido, parabenizo a todo equipe. O Serviço é muito bom, sempre tivemos um ótimo atendimento.`,
  },
  {
    name: "Mauricio Penteado",
    postedDate: _mock.time(4),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(4),
    content: `Um estritório com ótimo atendimento e pessoas super atenciosas.`,
  },
  {
    name: "Tamara resi",
    postedDate: _mock.time(5),
    ratingNumber: 5,
    avatarUrl: _mock.image.avatar(5),
    content: `A empresa sempre nos atendeu com agilidade e cordialidade, demonstrando conhecimento técnico superior às outras que buscamos. A equipe é proativa e sempre nos oferece informações sobre os processos e pontuam eventuais desconformidades, trazendo também a forma mais viável e fácil de adequar. Muito organizados com as nossas documentações, o que facilita resolver tudo rapidamente e de acordo com o que exige as leis. Ficamos extremamente satisfeitos e indicamos o serviço da Atualize para todos os nossos parceiros.`,
  }, 
];
