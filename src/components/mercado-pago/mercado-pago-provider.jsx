'use client';

import { useEffect } from 'react';

// ----------------------------------------------------------------------
// Modo: "test" = chaves de teste | "production" ou vazio = chaves de produção
// Front (Public Key) e Back (Access Token) devem usar o MESMO modo.
// Em dev use NEXT_PUBLIC_MERCADO_PAGO_MODE=test
// ----------------------------------------------------------------------

const MP_MODE = (process.env.NEXT_PUBLIC_MERCADO_PAGO_MODE || '').toLowerCase();

function getPublicKey() {
  const useTest = MP_MODE === 'test';

  if (useTest) {
    return (
      process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST ||
      process.env.NEXT_PUBLIC_MP_PUBLIC_KEY_TEST ||
      ''
    );
  }

  return (
    process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ||
    ''
  );
}

export function MercadoPagoProvider({ children }) {
  useEffect(() => {
    const publicKey = getPublicKey();

    if (publicKey) {
      // Import dinâmico: o SDK do Mercado Pago só é baixado depois da
      // hidratação. Com o import estático ele entrava no bundle do layout raiz
      // e pesava no TBT de todas as páginas, inclusive as landings públicas.
      import('@mercadopago/sdk-react')
        .then(({ initMercadoPago }) => {
          initMercadoPago(publicKey, {
            locale: 'pt-BR',
          });
          if (process.env.NODE_ENV === 'development') {
            console.info(
              `[Mercado Pago] SDK inicializado em modo: ${MP_MODE === 'test' ? 'TESTE' : 'PRODUÇÃO'}`
            );
          }
        })
        .catch((error) => {
          console.error('Erro ao inicializar Mercado Pago SDK:', error);
        });
    } else {
      const modeHint = MP_MODE === 'test' ? 'NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST' : 'NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY';
      console.warn(
        `[Mercado Pago] PUBLIC_KEY não encontrada (modo: ${MP_MODE || 'production'}). Defina ${modeHint} em .env.local. Para dev use NEXT_PUBLIC_MERCADO_PAGO_MODE=test`
      );
    }
  }, []);

  return children;
}

