'use client';

import { PublicLinkErrorView } from 'src/sections/error/public-link-error-view';

// ----------------------------------------------------------------------

export default function Error({ error, reset }) {
  return (
    <PublicLinkErrorView
      headerSubtitle="Abertura de empresa"
      icon="solar:buildings-2-bold"
      title="Abertura não encontrada"
      description="O link pode estar incompleto ou o processo de abertura não está mais disponível neste endereço. Confira o link recebido ou fale com a gente — resolvemos rapidinho."
      whatsappMessage="Olá! Tentei acessar o link do meu processo de abertura de empresa, mas ele não foi encontrado. Podem me ajudar?"
      onRetry={reset}
    />
  );
}
