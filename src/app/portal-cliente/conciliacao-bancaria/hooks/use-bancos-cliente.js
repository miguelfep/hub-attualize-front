import { useState, useEffect, useCallback } from 'react';

import axios from 'src/utils/axios';

/**
 * Hook para gerenciar bancos de um cliente
 * @param {string} clienteId - ID do cliente
 */
export function useBancosCliente(clienteId) {
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarBancos = useCallback(async () => {
    if (!clienteId) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ Carregar todos os bancos (ativos e inativos)
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
        { params: { clienteId, incluirInativos: true } }
      );

      setBancos(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar bancos:', err);
      setError(err.message || 'Erro ao carregar bancos');
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  const criarBanco = async (dadosBanco) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}financeiro/banco/cadastrar`,
        {
          ...dadosBanco,
          clienteId,
        }
      );

      const novoBanco = response.data;
      setBancos([...bancos, novoBanco]);
      return novoBanco;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao criar banco';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const atualizarBanco = async (bancoId, dadosAtualizados) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos/${bancoId}`,
        dadosAtualizados
      );

      const bancoAtualizado = response.data;
      setBancos(bancos.map((b) => (b._id === bancoId ? bancoAtualizado : b)));
      return bancoAtualizado;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao atualizar banco';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const desativarBanco = async (bancoId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos/${bancoId}`);

      // Atualizar status do banco na lista (não remover)
      setBancos(bancos.map((b) => (b._id === bancoId ? { ...b, status: false, ativo: false } : b)));
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao desativar banco';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // ✅ NOVO: Reativar banco
  const reativarBanco = async (bancoId) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}contas/bancos/${bancoId}`,
        { status: true, ativo: true }
      );

      const bancoReativado = response.data?.success ? response.data.data : response.data;
      
      // Atualizar status do banco na lista
      setBancos(bancos.map((b) => (b._id === bancoId ? { ...bancoReativado, status: true, ativo: true } : b)));
      return bancoReativado;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao reativar banco';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    carregarBancos();
  }, [carregarBancos]);

  return {
    bancos,
    loading,
    error,
    recarregar: carregarBancos,
    criarBanco,
    atualizarBanco,
    desativarBanco,
    reativarBanco, // ✅ NOVO
  };
}
