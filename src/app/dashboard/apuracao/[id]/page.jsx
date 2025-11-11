import ApuracaoDetalhesPage from 'src/sections/apuracao/view/apuracao-detalhes-page';

export default function Page({ params }) {
  const { id } = params;
  return <ApuracaoDetalhesPage apuracaoId={id} />;
}
