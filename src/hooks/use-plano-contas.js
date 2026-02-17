import { toast } from 'sonner';
import { useRef, useState, useEffect, useCallback } from 'react';

import axios from 'src/utils/axios';

// 🔥 Cache global para evitar múltiplas chamadas
const cache = {
  contasAnaliticas: new Map(), // clienteId -> { data, timestamp }
  estatisticas: new Map(),     // clienteId -> { data, timestamp }
  TIMEOUT: 5 * 60 * 1000,      // 5 minutos
};

/**
 * Hook para gerenciar Plano de Contas
 * @param {string} clienteId - ID do cliente
 */
export const usePlanoContas = (clienteId) => {
  const [contas, setContas] = useState([]);
  const [contasAnaliticas, setContasAnaliticas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const carregandoRef = useRef(false); // 🔥 Prevenir múltiplas chamadas simultâneas

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9443/api/';

  // Carregar todas as contas
  const carregarContas = useCallback(async (filtros = {}) => {
    if (!clienteId) {
      setContas([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.apenasAtivas !== undefined) params.append('apenasAtivas', filtros.apenasAtivas);
      if (filtros.busca) params.append('busca', filtros.busca);

      const url = `${baseUrl}plano-contas/${clienteId}?${params.toString()}`;
      const response = await axios.get(url);
      
      setContas(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError(err.message);
      toast.error('Erro ao carregar plano de contas.');
    } finally {
      setLoading(false);
    }
  }, [clienteId, baseUrl]);

  // Carregar apenas contas analíticas (para selects) com cache
  const carregarContasAnaliticas = useCallback(async (forceRefresh = false) => {
    if (!clienteId) {
      setContasAnaliticas([]);
      return;
    }

    // 🔥 Verificar cache
    const cached = cache.contasAnaliticas.get(clienteId);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp < cache.TIMEOUT)) {
      console.log(`✅ Usando cache de contas analíticas para cliente ${clienteId}`);
      setContasAnaliticas(cached.data);
      return;
    }

    // 🔥 Prevenir múltiplas chamadas simultâneas
    if (carregandoRef.current) {
      console.log(`⏳ Já carregando contas analíticas para cliente ${clienteId}`);
      return;
    }

    carregandoRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/analiticas`;
      console.log(`🔍 Buscando contas analíticas: ${url}`);
      const response = await axios.get(url);
      
      const data = response.data.data || [];
      
      // 🔥 Atualizar cache
      cache.contasAnaliticas.set(clienteId, {
        data,
        timestamp: now
      });
      
      setContasAnaliticas(data);
      console.log(`✅ ${data.length} contas analíticas carregadas e cacheadas`);
    } catch (err) {
      console.error('Erro ao carregar contas analíticas:', err);
      setError(err.message);
      toast.error('Erro ao carregar contas analíticas.');
    } finally {
      setLoading(false);
      carregandoRef.current = false;
    }
  }, [clienteId, baseUrl]);

  // Buscar conta por código
  const buscarPorCodigo = useCallback(async (codigo) => {
    if (!clienteId || !codigo) return null;

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/codigo/${codigo}`;
      const response = await axios.get(url);
      return response.data.data;
    } catch (err) {
      console.error('Erro ao buscar conta:', err);
      return null;
    }
  }, [clienteId, baseUrl]);

  // Buscar contas (autocomplete)
  const buscarContas = useCallback(async (termo, limite = 20) => {
    if (!clienteId || !termo || termo.length < 2) return [];

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/buscar?termo=${encodeURIComponent(termo)}&limite=${limite}`;
      const response = await axios.get(url);
      return response.data.data || [];
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      return [];
    }
  }, [clienteId, baseUrl]);

  // Sugerir conta baseado em descrição
  const sugerirConta = useCallback(async (descricao) => {
    if (!clienteId || !descricao) return null;

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/sugerir?descricao=${encodeURIComponent(descricao)}`;
      const response = await axios.get(url);
      return response.data.data;
    } catch (err) {
      console.error('Erro ao sugerir conta:', err);
      return null;
    }
  }, [clienteId, baseUrl]);

  // Verificar se tem plano de contas cadastrado
  const verificarPlanoContas = useCallback(async () => {
    if (!clienteId) return false;

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/verificar`;
      const response = await axios.get(url);
      return response.data.temPlanoDeContas || false;
    } catch (err) {
      console.error('Erro ao verificar plano de contas:', err);
      return false;
    }
  }, [clienteId, baseUrl]);

  // Carregar estatísticas com cache
  const carregarEstatisticas = useCallback(async (forceRefresh = false) => {
    if (!clienteId) return;

    // 🔥 Verificar cache
    const cached = cache.estatisticas.get(clienteId);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp < cache.TIMEOUT)) {
      console.log(`✅ Usando cache de estatísticas para cliente ${clienteId}`);
      setEstatisticas(cached.data);
      return;
    }

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/estatisticas`;
      console.log(`🔍 Buscando estatísticas: ${url}`);
      const response = await axios.get(url);
      
      const data = response.data.data || null;
      
      // 🔥 Atualizar cache
      cache.estatisticas.set(clienteId, {
        data,
        timestamp: now
      });
      
      setEstatisticas(data);
      console.log(`✅ Estatísticas carregadas e cacheadas`);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [clienteId, baseUrl]);

  // Importar plano de contas
  const importarPlanoContas = useCallback(async (arquivo) => {
    if (!arquivo) {
      toast.error('Arquivo é obrigatório.');
      return null;
    }

    if (!clienteId) {
      toast.error('Cliente não identificado.');
      return null;
    }

    // Validação de extensão - apenas PDF
    const extension = arquivo.name.toLowerCase().split('.').pop();
    if (extension !== 'pdf') {
      toast.error('Apenas arquivos PDF são aceitos');
      return null;
    }

    // Validação de tamanho (20MB)
    const maxSize = 20 * 1024 * 1024;
    if (arquivo.size > maxSize) {
      const sizeMB = (arquivo.size / 1024 / 1024).toFixed(2);
      toast.error(`Arquivo muito grande: ${sizeMB}MB. Tamanho máximo: 20MB`);
      return null;
    }

    console.log('Hook: Iniciando importação', { 
      arquivo: arquivo.name, 
      tamanho: arquivo.size,
      extensao: extension,
      clienteId
    });

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('clienteId', clienteId);

      console.log('FormData criado:', {
        fileName: arquivo.name,
        fileSize: arquivo.size,
        fileType: arquivo.type,
        extension,
        clienteId
      });

      const url = `${baseUrl}plano-contas/importar`;
      console.log('URL da API:', url);

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Resposta da API:', response.data);

      if (response.data.success) {
        toast.success(
          response.data.message || 'Plano de contas importado com sucesso!',
          { duration: 5000 }
        );
        
        // 🔥 Invalidar cache antes de recarregar
        if (cache.contasAnaliticas.has(clienteId)) {
          cache.contasAnaliticas.delete(clienteId);
        }
        if (cache.estatisticas.has(clienteId)) {
          cache.estatisticas.delete(clienteId);
        }
        
        // Recarregar contas e estatísticas (forçar refresh)
        await carregarContas();
        await carregarContasAnaliticas(true); // forceRefresh = true
        await carregarEstatisticas(true); // forceRefresh = true
        
        return response.data.data;
      }
      
      toast.error(response.data.message || 'Erro ao importar plano de contas.');
      return null;
      
    } catch (err) {
      console.error('Erro ao importar plano de contas:', err);
      console.error('Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(`Erro ao importar: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, carregarContas, carregarContasAnaliticas, carregarEstatisticas, clienteId]);

  // Atualizar conta
  const atualizarConta = useCallback(async (codigo, dados) => {
    if (!clienteId || !codigo) {
      toast.error('Cliente e código são obrigatórios.');
      return null;
    }

    setError(null);

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/${codigo}`;
      const response = await axios.put(url, dados);

      if (response.data.success) {
        toast.success('Conta atualizada com sucesso!');
        await carregarContas();
        return response.data.data;
      }
      
      toast.error(response.data.message || 'Erro ao atualizar conta.');
      return null;
      
    } catch (err) {
      console.error('Erro ao atualizar conta:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(`Erro ao atualizar: ${errorMessage}`);
      return null;
    }
  }, [clienteId, baseUrl, carregarContas]);

  // Desativar conta
  const desativarConta = useCallback(async (codigo) => {
    if (!clienteId || !codigo) {
      toast.error('Cliente e código são obrigatórios.');
      return false;
    }

    setError(null);

    try {
      const url = `${baseUrl}plano-contas/${clienteId}/${codigo}`;
      const response = await axios.delete(url);

      if (response.data.success) {
        toast.success('Conta desativada com sucesso!');
        await carregarContas();
        return true;
      }
      
      toast.error(response.data.message || 'Erro ao desativar conta.');
      return false;
      
    } catch (err) {
      console.error('Erro ao desativar conta:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(`Erro ao desativar: ${errorMessage}`);
      return false;
    }
  }, [clienteId, baseUrl, carregarContas]);

  // Carregar dados inicialmente (apenas uma vez por clienteId)
  useEffect(() => {
    if (clienteId && !carregandoRef.current) {
      carregarContasAnaliticas();
      carregarEstatisticas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]); // 🔥 Removido dependências para evitar múltiplas chamadas

  return {
    contas,
    contasAnaliticas,
    loading,
    error,
    estatisticas,
    carregarContas,
    carregarContasAnaliticas,
    buscarPorCodigo,
    buscarContas,
    sugerirConta,
    verificarPlanoContas,
    importarPlanoContas,
    atualizarConta,
    desativarConta,
    carregarEstatisticas,
  };
};
