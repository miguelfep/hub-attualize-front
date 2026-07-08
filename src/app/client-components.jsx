'use client';

import { Snackbar } from 'src/components/snackbar';
import { SettingsDrawer } from 'src/components/settings';
import { ExitIntentDiscountModal } from 'src/components/exit-intent';

import { CheckoutProvider } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

// Importados estaticamente (sem `next/dynamic` + `ssr: false`). Como são
// componentes 'use client' seguros para SSR, isso evita o erro
// "Bail out to client-side rendering: next/dynamic" em rotas renderizadas no
// servidor (ex.: a página do post, que é force-dynamic) — e ainda preserva o
// HTML no SSR (melhor para SEO do blog).
export function ClientComponents({ children }) {
  return (
    <CheckoutProvider>
      <Snackbar />
      <SettingsDrawer />
      <ExitIntentDiscountModal />
      {children}
    </CheckoutProvider>
  );
}
