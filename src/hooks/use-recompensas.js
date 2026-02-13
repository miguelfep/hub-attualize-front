import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import {
  solicitarPix,
  aprovarDesconto,
  listarTransacoes,
  aprovarTransacao,
  solicitarDesconto,
  rejeitarTransacao,
  listarPixPendentes,
  obterContaRecompensa,
  aplicarDescontoManual,
  listarDescontosPendentes,
} from 'src/actions/recompensa';

// ----------------------------------------------------------------------

/**
 * Hook para gerenciar recompensas
 * @returns {Object} Estado e funções para gerenciar recompensas
 */
export function useRecompensas() {
  const [conta, setConta] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [pixPendentes, setPixPendentes] = useState([]);
  const [descontosPendentes, setDescontosPendentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTransacoes, setLoadingTransacoes] = useState(false);
  const [loadingPixPendentes, setLoadingPixPendentes] = useState(false);
  const [loadingDescontosPendentes, setLoadingDescontosPendentes] = useState(false);

  // Buscar conta de recompensa
  const buscarConta = useCallback(async () => {
    try {
      setLoading(true);
      const response = await obterContaRecompensa();
      
      if (response.success && response.conta) {
        setConta(response.conta);
        
        // Se a conta já traz transações, atualiza também
        if (response.conta.transacoes) {
          setTransacoes(response.conta.transacoes);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar conta de recompensa:', error);
      toast.error('Erro ao carregar conta de recompensa');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar transações com filtros
  const buscarTransacoes = useCallback(async (filtros = {}) => {
    try {
      setLoadingTransacoes(true);
      const response = await listarTransacoes(filtros);
      
      if (response.success && response.transacoes) {
        setTransacoes(response.transacoes);
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoadingTransacoes(false);
    }
  }, []);

  // Solicitar desconto
  const solicitarDescontoRecompensa = useCallback(async (contratoId, valor) => {
    try {
      const response = await solicitarDesconto({ contratoId, valor });
      
      if (response.success) {
        toast.success('Desconto solicitado com sucesso!');
        
        // Atualizar conta com novos saldos
        if (response.conta) {
          setConta(response.conta);
        }
        
        // Adicionar transação à lista
        if (response.transacao) {
          setTransacoes((prev) => [response.transacao, ...prev]);
        }
        
        return response;
      }
      
      throw new Error(response.message || 'Erro ao solicitar desconto');
    } catch (error) {
      console.error('Erro ao solicitar desconto:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao solicitar desconto';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Solicitar PIX
  const solicitarPixRecompensa = useCallback(async (valor, chavePix) => {
    try {
      const response = await solicitarPix({ valor, chavePix });
      
      if (response.success) {
        toast.success('PIX solicitado com sucesso! Aguarde a aprovação.');
        
        // Atualizar conta com novos saldos
        if (response.conta) {
          setConta(response.conta);
        }
        
        // Adicionar transação à lista
        if (response.transacao) {
          setTransacoes((prev) => [response.transacao, ...prev]);
        }
        
        return response;
      }
      
      throw new Error(response.message || 'Erro ao solicitar PIX');
    } catch (error) {
      console.error('Erro ao solicitar PIX:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao solicitar PIX';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Buscar PIX pendentes (Admin)
  const buscarPixPendentes = useCallback(async () => {
    try {
      setLoadingPixPendentes(true);
      const response = await listarPixPendentes();
      
      if (response?.success) {
        // Se a resposta for bem-sucedida, atualiza a lista (mesmo que vazia)
        setPixPendentes(response.pixPendentes || []);
      } else {
        // Se não houver sucesso, define array vazio
        setPixPendentes([]);
        console.warn('Resposta inesperada ao buscar PIX pendentes:', response);
      }
    } catch (error) {
      console.error('Erro ao buscar PIX pendentes:', error);
      // Em caso de erro, define array vazio para não ficar em loading eterno
      setPixPendentes([]);
      toast.error('Erro ao carregar PIX pendentes');
    } finally {
      setLoadingPixPendentes(false);
    }
  }, []);

  // Aprovar transação (Admin)
  const aprovar = useCallback(async (transacaoId) => {
    try {
      const response = await aprovarTransacao(transacaoId);
      
      if (response.success) {
        toast.success('PIX aprovado com sucesso!');
        
        // Remover da lista de pendentes
        setPixPendentes((prev) => prev.filter((pix) => pix._id !== transacaoId));
        
        return response;
      }
      
      throw new Error(response.message || 'Erro ao aprovar PIX');
    } catch (error) {
      console.error('Erro ao aprovar PIX:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao aprovar PIX';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Rejeitar transação (Admin)
  const rejeitar = useCallback(async (transacaoId, motivo = '') => {
    try {
      const response = await rejeitarTransacao(transacaoId, { motivo });
      
      if (response.success) {
        toast.success('PIX rejeitado com sucesso!');
        
        // Remover da lista de pendentes
        setPixPendentes((prev) => prev.filter((pix) => pix._id !== transacaoId));
        
        return response;
      }
      
      throw new Error(response.message || 'Erro ao rejeitar PIX');
    } catch (error) {
      console.error('Erro ao rejeitar PIX:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao rejeitar PIX';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Buscar descontos pendentes (Admin) - filtra transações do tipo desconto com status pendente
  const buscarDescontosPendentes = useCallback(async () => {
    try {
      setLoadingDescontosPendentes(true);
      const response = await listarDescontosPendentes({ tipo: 'desconto', status: 'pendente' });
      
      if (response?.success && response.solicitacoes) {
        setDescontosPendentes(response.solicitacoes || []);
      } else {
        setDescontosPendentes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar descontos pendentes:', error);
      setDescontosPendentes([]);
      toast.error('Erro ao carregar descontos pendentes');
    } finally {
      setLoadingDescontosPendentes(false);
    }
  }, []);

  // Aprovar desconto (Admin)
  const aprovarDescontoRecompensa = useCallback(async (transacaoId, cobrancaId) => {
    try {
      const response = await aprovarDesconto(transacaoId, { cobrancaId });
      
      if (response.success) {
        toast.success('Desconto aprovado e aplicado com sucesso!');
        
        // Remover da lista de pendentes
        setDescontosPendentes((prev) => prev.filter((desc) => desc._id !== transacaoId));
        
        return response;
      }
      
      throw new Error(response.message || 'Erro ao aprovar desconto');
    } catch (error) {
      console.error('Erro ao aprovar desconto:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao aprovar desconto';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Aplicar desconto manual (Admin)
  const aplicarDescontoManualRecompensa = useCallback(async (contratoId, valor, descricao = '') => {
    try {
      const response = await aplicarDescontoManual({ contratoId, valor, descricao });
      
      if (response.success) {
        toast.success('Desconto aplicado manualmente com sucesso!');
        return response;
      }
      
      throw new Error(response.message || 'Erro ao aplicar desconto manual');
    } catch (error) {
      console.error('Erro ao aplicar desconto manual:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao aplicar desconto manual';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Verificar se tem saldo suficiente
  const temSaldoSuficiente = useCallback((valor) => {
    if (!conta) return false;
    return conta.saldoDisponivel >= valor;
  }, [conta]);

  return {
    // Estado
    conta,
    transacoes,
    pixPendentes,
    descontosPendentes,
    loading,
    loadingTransacoes,
    loadingPixPendentes,
    loadingDescontosPendentes,
    
    // Funções Cliente
    buscarConta,
    buscarTransacoes,
    solicitarDesconto: solicitarDescontoRecompensa,
    solicitarPix: solicitarPixRecompensa,
    temSaldoSuficiente,
    
    // Funções Admin
    buscarPixPendentes,
    buscarDescontosPendentes,
    aprovar,
    rejeitar,
    aprovarDesconto: aprovarDescontoRecompensa,
    aplicarDescontoManual: aplicarDescontoManualRecompensa,
    
    // Funções de refetch
    refetch: buscarConta,
    refetchTransacoes: buscarTransacoes,
    refetchPixPendentes: buscarPixPendentes,
    refetchDescontosPendentes: buscarDescontosPendentes,
  };
}
