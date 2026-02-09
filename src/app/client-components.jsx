'use client';

import dynamic from 'next/dynamic';

// Lazy load de componentes não críticos para melhorar performance inicial
const Snackbar = dynamic(() => import('src/components/snackbar').then((mod) => ({ default: mod.Snackbar })), {
  ssr: false,
});

const SettingsDrawer = dynamic(() => import('src/components/settings').then((mod) => ({ default: mod.SettingsDrawer })), {
  ssr: false,
});

const CheckoutProvider = dynamic(() => import('src/sections/checkout/context').then((mod) => ({ default: mod.CheckoutProvider })), {
  ssr: false,
});

// ----------------------------------------------------------------------

export function ClientComponents({ children }) {
  return (
    <>
      <CheckoutProvider>
        <Snackbar />
        <SettingsDrawer />
        {children}
      </CheckoutProvider>
    </>
  );
}
