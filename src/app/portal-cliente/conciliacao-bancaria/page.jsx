'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { paths } from 'src/routes/paths';

import { useSettings } from 'src/hooks/useSettings';

// Página raiz redireciona para /status
export default function ConciliacaoBancariaRoot() {
  const router = useRouter();
  const { possuiExtrato } = useSettings();

  useEffect(() => {
    // ✅ Verificar se o cliente possui extrato bancário
    if (possuiExtrato === false) {
      // Se não tiver extrato, redireciona para o dashboard
      router.replace(paths.cliente.dashboard);
      return;
    }

    // Se tiver extrato ou ainda estiver carregando, redireciona para status
    if (possuiExtrato !== undefined) {
      router.replace(`${paths.cliente.conciliacaoBancaria}/status`);
    }
  }, [router, possuiExtrato]);

  return null;
}
