import { IndicacaoFormView } from 'src/sections/indicacao/indicacao-form-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Indicação | Attualize',
  description: 'Formulário de indicação Attualize Contabilidade',
};

// ----------------------------------------------------------------------

export default function IndicacaoPage({ params }) {
  const { codigo } = params;

  return <IndicacaoFormView codigo={codigo} />;
}
