import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Contabilidade para a Área da Saúde - ${CONFIG.site.name}`,
  description:
    'Contabilidade especializada para médicos, dentistas, psicólogos, fisioterapeutas e clínicas. Abertura de CNPJ, planejamento tributário e gestão contábil completa.',
};

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
