import { CONFIG } from 'src/config-global';

import { FormWizardViewAbertura } from 'src/sections/abertura/form-wizard-abertura-view';


// ----------------------------------------------------------------------

export const metadata = {
  title: 'Abertura de empresa: Especializada em Beleza, Saúde e Bem-Estar',
  description:
    'Attualize Contábil é a contabilidade digital especializada em atender empresas nas áreas de beleza, saúde e bem-estar. Atendemos todo o Brasil com serviços personalizados e expertise no setor.',
};

export default function Page() {
  return <FormWizardViewAbertura />;
}