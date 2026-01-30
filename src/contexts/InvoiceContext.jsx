'use client';

import { toast } from 'sonner';
import { useRef, useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { consultarCobrancaPix } from 'src/actions/pix';
import { updateInvoice , getInvoiceById } from 'src/actions/invoices';

// ----------------------------------------------------------------------

const InvoiceContext = createContext(null);

export function InvoiceProvider({ children, initialInvoice }) {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [loading, setLoading] = useState(false);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  // Função para atualizar a invoice
  const updateInvoiceData = useCallback(async (delay = 1000) => {
    if (!invoice?._id) return;

    setLoading(true);
    try {
      // Aguardar um pouco para garantir que o backend processou completamente
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, delay);
      });

      const response = await getInvoiceById(invoice._id);
      const updatedInvoice = response.invoice || response;

      console.log('📥 Invoice atualizada via Context:', {
        id: updatedInvoice._id,
        status: updatedInvoice.status,
        cobrancas: updatedInvoice.cobrancas?.length,
        cobrancasPix: updatedInvoice.cobrancas?.filter(c => c.metodoPagamento === 'pix').length,
      });

      const newInvoice = {
        ...updatedInvoice,
        cobrancas: updatedInvoice.cobrancas || [],
      };

      setInvoice(newInvoice);
    } catch (error) {
      console.error('Erro ao atualizar invoice:', error);
      toast.error('Erro ao atualizar invoice');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line consistent-return
  }, [invoice?._id]);

  // Função para encontrar TXID de cobranças PIX pendentes
  const encontrarCobrancasPixPendentes = useCallback(() => {
    if (!invoice?.cobrancas || !Array.isArray(invoice.cobrancas)) {
      return [];
    }

    const cobrancasPixPendentes = [];

    invoice.cobrancas.forEach((cobranca) => {
      if (cobranca.metodoPagamento === 'pix' && cobranca.status !== 'RECEBIDO') {
        let txid = cobranca.pixTxid 
          || cobranca.txid 
          || cobranca.pix?.txid 
          || cobranca.pix?.pixTxid;

        // Tentar parsear se for string
        if (!txid && typeof cobranca.pix === 'string') {
          try {
            const parsedPix = JSON.parse(cobranca.pix);
            txid = parsedPix.txid || parsedPix.pixTxid;
          } catch (e) {
            // Ignorar erro de parse
          }
        }

        if (txid) {
          cobrancasPixPendentes.push({
            txid,
            cobrancaId: cobranca._id,
            status: cobranca.status,
          });
        }
      }
    });

    return cobrancasPixPendentes;
  }, [invoice?.cobrancas]);

  // Função para verificar status de uma cobrança PIX
  const verificarCobrancaPix = useCallback(async (txid) => {
    try {
      const cobrancaPix = await consultarCobrancaPix(txid);
      
      if (cobrancaPix?.status === 'CONCLUIDA') {
        console.log('💰 Pagamento PIX confirmado via polling! TXID:', txid);
        
        // Atualizar invoice para status "pago"
        try {
          await updateInvoice(invoice._id, { status: 'pago' });
          toast.success('Pagamento PIX confirmado!');
          
          // Atualizar dados da invoice
          await updateInvoiceData(500);
        } catch (error) {
          console.error('Erro ao atualizar status da invoice:', error);
        }
        
        return true; // Pagamento confirmado
      }
      
      return false; // Ainda pendente
    } catch (error) {
      console.error('Erro ao verificar cobrança PIX:', error);
      return false;
    }
  }, [invoice?._id, updateInvoiceData]);

  // Polling automático para verificar pagamentos PIX pendentes
  useEffect(() => {
    // Limpar intervalos anteriores
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    // Encontrar cobranças PIX pendentes
    const cobrancasPixPendentes = encontrarCobrancasPixPendentes();

    // Se não há cobranças PIX pendentes ou invoice já está paga, não fazer polling
    if (cobrancasPixPendentes.length === 0 || invoice?.status === 'pago') {
      return;
    }

    console.log('🔄 Iniciando polling automático para', cobrancasPixPendentes.length, 'cobrança(s) PIX pendente(s)');

    let tentativas = 0;
    const maxTentativas = 120; // 10 minutos (120 * 5 segundos)

    // Verificar a cada 5 segundos
    pollingIntervalRef.current = setInterval(async () => {
      tentativas += 1;

      // Verificar todas as cobranças PIX pendentes
      const promessas = cobrancasPixPendentes.map(({ txid }) => verificarCobrancaPix(txid));
      const resultados = await Promise.all(promessas);

      // Se alguma cobrança foi confirmada, parar o polling
      if (resultados.some((confirmado) => confirmado === true)) {
        console.log('✅ Pagamento confirmado, parando polling');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }

      // Parar após máximo de tentativas
      if (tentativas >= maxTentativas) {
        console.log('⏱️ Polling parado após', maxTentativas, 'tentativas');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }, 5000); // Verificar a cada 5 segundos

    // Timeout de segurança: parar após 10 minutos
    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      console.log('⏱️ Polling parado por timeout (10 minutos)');
    }, 600000); // 10 minutos

    // Cleanup
    // eslint-disable-next-line consistent-return
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [invoice?.cobrancas, invoice?.status, encontrarCobrancasPixPendentes, verificarCobrancaPix]);

  const value = useMemo(
    () => ({
      invoice,
      setInvoice,
      loading,
      updateInvoiceData,
    }),
    [invoice, loading, updateInvoiceData]
  );

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
}

// Hook para usar o contexto
export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice deve ser usado dentro de InvoiceProvider');
  }
  return context;
}
