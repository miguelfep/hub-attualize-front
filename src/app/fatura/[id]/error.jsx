'use client';

import { PublicLinkErrorView } from 'src/sections/error/public-link-error-view';

// ----------------------------------------------------------------------

export default function Error({ error, reset }) {
  return (
    <PublicLinkErrorView
      headerSubtitle="Fatura de honorários"
      icon="solar:bill-cross-bold"
      title="Fatura não encontrada"
      description="O link pode estar incompleto, a fatura pode ter sido substituída ou já foi removida. Confira o link recebido ou fale com a gente — resolvemos rapidinho."
      whatsappMessage="Olá! Tentei acessar o link de uma fatura, mas ela não foi encontrada. Podem me ajudar?"
      onRetry={reset}
    />
  );
}
