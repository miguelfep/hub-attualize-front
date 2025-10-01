'use client';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function PortalClientePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para o dashboard do portal do cliente
    router.replace(paths.cliente.dashboard);
  }, [router]);

  return null;
}
