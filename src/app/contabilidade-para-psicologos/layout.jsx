import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Contabilidade para Psicólogos - ${CONFIG.site.name}`,
  description: 'Contabilidade especializada para psicólogos. Abertura de CNPJ, emissão de notas fiscais e gestão contábil completa para profissionais da psicologia.',
};

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}

