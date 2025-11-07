'use client';

import { useEffect } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';

// ----------------------------------------------------------------------

export function MercadoPagoProvider({ children }) {
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Inicializando Mercado Pago SDK...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Public Key encontrada?', !!publicKey);
    
    if (publicKey) {
      console.log('Public Key (preview):', `${publicKey.substring(0, 20)}...`);
      
      try {
        initMercadoPago(publicKey, {
          locale: 'pt-BR',
        });
        console.log('✅ Mercado Pago SDK inicializado com sucesso!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } catch (error) {
        console.error('❌ Erro ao inicializar SDK:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    } else {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERRO: Public Key NÃO ENCONTRADA!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('📋 Variável esperada:');
      console.error('   NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST');
      console.error('');
      console.error('✅ Solução:');
      console.error('1. Crie .env.local na raiz do projeto');
      console.error('2. Adicione:');
      console.error('   NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST=TEST-xxxxx');
      console.error('3. Reinicie o servidor (yarn dev)');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }, []);

  return children;
}

