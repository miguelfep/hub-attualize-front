import { MainLayout } from 'src/layouts/main';

import { IndicacaoFormView } from 'src/sections/indicacao/indicacao-form-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Indicação | Attualize',
  description: 'Formulário de indicação Attualize Contabilidade',
};

// ----------------------------------------------------------------------

export default async function IndicacaoPage({ params }) {

  const { codigo } = await params;

  return (
    <MainLayout>
      <IndicacaoFormView codigo={codigo} />
    </MainLayout>
  );
}
