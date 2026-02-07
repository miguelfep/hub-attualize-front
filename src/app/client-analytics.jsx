'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ClientAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;
    if (window.gtag) {
      window.gtag('config', 'G-L5BFBLV0Z4', {
        page_path: url,
      });
      // Enviar page_view manualmente já que desabilitamos send_page_view automático
      window.gtag('event', 'page_view', {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null; // Este componente não renderiza nada visualmente
}
