'use client';

import dynamic from 'next/dynamic';

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
// `ssr: false` é válido aqui porque este arquivo é 'use client' — o erro
// "Bail out to client-side rendering" só ocorre ao usar next/dynamic com
// ssr: false dentro de um Server Component.
const ExitIntentDiscountModal = dynamic(
  () => import('src/components/exit-intent').then((mod) => mod.ExitIntentDiscountModal),
  { ssr: false }
);

// ----------------------------------------------------------------------

// Snackbar e SettingsDrawer seguem estáticos: são componentes 'use client'
// seguros para SSR e preservam o HTML renderizado no servidor.
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
