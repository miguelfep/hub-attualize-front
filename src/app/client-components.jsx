'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import { Snackbar } from 'src/components/snackbar';
import { SettingsDrawer } from 'src/components/settings';

import { CheckoutProvider } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

// O exit-intent puxa PhoneInput → react-phone-number-input + libphonenumber-js
// (~200 KiB) e estava no layout raiz, ou seja, no bundle inicial de TODAS as
// páginas — inclusive blog e landings. Ele não renderiza nada antes de 30s na
// página (e retorna null fora da allowlist), então não há HTML de SSR nem
// layout shift a preservar: carrega sob demanda depois da hidratação.
//
// Só renderiza após montar (gate abaixo): com `ssr: false` no SSR, o Next
// serializa um marcador "Bail out to client-side rendering" no HTML de toda
// página. Como o servidor nunca vê o componente, o HTML sai limpo.
const ExitIntentDiscountModal = dynamic(() =>
  import('src/components/exit-intent').then((mod) => mod.ExitIntentDiscountModal)
);

// ----------------------------------------------------------------------

// Snackbar e SettingsDrawer seguem estáticos: são componentes 'use client'
// seguros para SSR e preservam o HTML renderizado no servidor.
export function ClientComponents({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CheckoutProvider>
      <Snackbar />
      <SettingsDrawer />
      {mounted && <ExitIntentDiscountModal />}
      {children}
    </CheckoutProvider>
  );
}
