'use client';

import { PublicLinkErrorView } from 'src/sections/error/public-link-error-view';

// ----------------------------------------------------------------------

export default function Error({ error, reset }) {
  return (
    <PublicLinkErrorView
      headerSubtitle="Alteração contratual"
      icon="solar:document-add-bold"
      title="Alteração não encontrada"
      description="O link pode estar incompleto ou o processo de alteração não está mais disponível neste endereço. Confira o link recebido ou fale com a gente — resolvemos rapidinho."
      whatsappMessage="Olá! Tentei acessar o link do meu processo de alteração contratual, mas ele não foi encontrado. Podem me ajudar?"
      onRetry={reset}
    />
  );
}
