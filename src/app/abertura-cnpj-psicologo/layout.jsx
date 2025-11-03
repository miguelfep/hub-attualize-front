import { CONFIG } from 'src/config-global';
import { SimpleLayout } from 'src/layouts/simple';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Abertura de CNPJ para Psicólogos - ${CONFIG.site.name}`,
  description: 'Abra seu CNPJ de psicólogo de forma rápida e descomplicada. Processo 100% online em apenas 6 passos.',
};

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return <SimpleLayout>{children}</SimpleLayout>;
}

