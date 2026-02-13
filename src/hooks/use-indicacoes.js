import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import {
  criarIndicacao,
  obterCodigoIndicacao,
  listarMinhasIndicacoes,
  obterDetalhesIndicacao,
} from 'src/actions/indicacao';

// ----------------------------------------------------------------------

/**
 * Hook para gerenciar indicações
 * @returns {Object} Estado e funções para gerenciar indicações
 */
export function useIndicacoes() {
  const [indicacoes, setIndicacoes] = useState([]);
  const [codigo, setCodigo] = useState(null);
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCodigo, setLoadingCodigo] = useState(false);

  // Buscar código de indicação
  const buscarCodigo = useCallback(async () => {
    try {
      setLoadingCodigo(true);
      const response = await obterCodigoIndicacao();
      
      if (response && response.codigo) {
        setCodigo(response.codigo);
        setLink(response.link || '');
      }
    } catch (error) {
      console.error('Erro ao buscar código de indicação:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao carregar código de indicação';
      toast.error(errorMessage);
      // Não lança erro para não quebrar a página
    } finally {
      setLoadingCodigo(false);
    }
  }, []);

  // Buscar minhas indicações
  const buscarIndicacoes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listarMinhasIndicacoes();
      
      if (response && response.success && response.indicacoes) {
        setIndicacoes(response.indicacoes);
      } else if (response && !response.success) {
        // Se o backend retornar sucesso false mas não erro
        setIndicacoes([]);
        console.warn('Resposta sem indicações:', response);
      } else {
        setIndicacoes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao carregar indicações';
      toast.error(errorMessage);
      // Mantém array vazio em caso de erro
      setIndicacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova indicação
  const criar = useCallback(async (data) => {
    try {
      const response = await criarIndicacao(data);
      
      if (response.success) {
        toast.success('Indicação criada com sucesso!');
        return response;
      }
      
      throw new Error(response.message || 'Erro ao criar indicação');
    } catch (error) {
      console.error('Erro ao criar indicação:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar indicação';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Obter detalhes de uma indicação
  const buscarDetalhes = useCallback(async (id) => {
    try {
      const response = await obterDetalhesIndicacao(id);
      
      if (response.success && response.indicacao) {
        return response.indicacao;
      }
      
      throw new Error('Indicação não encontrada');
    } catch (error) {
      console.error('Erro ao buscar detalhes da indicação:', error);
      toast.error('Erro ao carregar detalhes da indicação');
      throw error;
    }
  }, []);

  // Copiar código para clipboard
  const copiarCodigo = useCallback(() => {
    if (codigo) {
      navigator.clipboard.writeText(codigo);
      toast.success('Código copiado!');
    }
  }, [codigo]);

  // Copiar link para clipboard
  const copiarLink = useCallback(() => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Link copiado!');
    }
  }, [link]);

  // Compartilhar via WhatsApp
  const compartilharWhatsApp = useCallback(() => {
    if (link) {
      const mensagem = encodeURIComponent(
        `Olá! Gostaria de te indicar a Attualize - Contabilidade Digital. Use meu link de indicação: ${link}`
      );
      window.open(`https://wa.me/?text=${mensagem}`, '_blank');
    }
  }, [link]);

  // Compartilhar via Email
  const compartilharEmail = useCallback(() => {
    if (link) {
      const assunto = encodeURIComponent('Indicação Attualize Contabilidade');
      const corpo = encodeURIComponent(
        `Olá!\n\nGostaria de te indicar a Attualize - Contabilidade Digital.\n\nUse meu link de indicação: ${link}\n\nAbraço!`
      );
      window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
    }
  }, [link]);

  return {
    // Estado
    indicacoes,
    codigo,
    link,
    loading,
    loadingCodigo,
    
    // Funções
    buscarCodigo,
    buscarIndicacoes,
    criar,
    buscarDetalhes,
    copiarCodigo,
    copiarLink,
    compartilharWhatsApp,
    compartilharEmail,
    
    // Funções de refetch
    refetch: buscarIndicacoes,
    refetchCodigo: buscarCodigo,
  };
}
