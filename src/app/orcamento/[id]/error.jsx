'use client';

import { PublicLinkErrorView } from 'src/sections/error/public-link-error-view';

// ----------------------------------------------------------------------

export default function Error({ error, reset }) {
  return (
    <PublicLinkErrorView
      headerSubtitle="Proposta comercial"
      icon="solar:clipboard-remove-bold"
      title="Proposta não encontrada"
      description="O link pode estar incompleto, a proposta pode ter sido substituída por uma versão mais recente ou já foi removida. Confira o link recebido ou fale com a gente — resolvemos rapidinho."
      whatsappMessage="Olá! Tentei acessar o link de uma proposta, mas ela não foi encontrada. Podem me ajudar?"
      onRetry={reset}
    />
  );
}
