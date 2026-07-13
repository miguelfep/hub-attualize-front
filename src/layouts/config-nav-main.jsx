import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  { title: 'Home', path: '/', icon: <Iconify width={22} icon="solar:home-2-bold-duotone" /> },
  {
    title: 'Quem somos',
    path: paths.about,
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
  },
  {
    title: 'Especialidades',
    path: paths.saudeHome,
    icon: <Iconify width={22} icon="solar:heart-pulse-bold-duotone" />,
    children: [
      {
        subheader: 'Saúde',
        items: [
          { title: 'Área da Saúde', path: paths.saudeHome },
          { title: 'Médicos', path: paths.medicosHome },
          { title: 'Dentistas', path: paths.dentistasHome },
          { title: 'Psicólogos', path: paths.psychologistHome },
          { title: 'Fisioterapeutas', path: paths.fisioterapeutasHome },
          { title: 'Nutricionistas', path: paths.nutricionistasHome },
          { title: 'Fonoaudiólogos', path: paths.fonoaudiologosHome },
          { title: 'Terapeutas e Bem-Estar', path: paths.terapeutasHome },
        ],
      },
      {
        subheader: 'Beleza e Estética',
        items: [
          { title: 'Clínicas de Estética', path: paths.esteticaHome },
          { title: 'Barbearias', path: paths.barbeariasHome },
          { title: 'Salão de Beleza', path: paths.salaoBelezaHome },
          { title: 'Profissional Parceiro', path: paths.profissionalParceiroHome },
        ],
      },
      {
        subheader: 'Serviços',
        items: [{ title: 'Prestadores de Serviços', path: paths.prestadoresServicosHome }],
      },
    ],
  },
  {
    title: 'Planejador Grátis',
    path: paths.planejadorEmpresa,
    icon: <Iconify width={22} icon="solar:calculator-bold-duotone" />,
  },
  {
    title: 'Blog',
    path: paths.post.blog,
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
  },

  {
    title: 'Fale Conosco',
    path: paths.contact,
    icon: <Iconify width={22} icon="solar:atom-bold-duotone" />,
  },
];
