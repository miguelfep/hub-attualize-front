import { useState, useEffect } from 'react';

import axios from 'src/utils/axios';

/**
 * Hook para buscar instituições bancárias disponíveis no sistema
 * Lista pré-cadastrada de bancos brasileiros
 */
export function useInstituicoesBancarias() {
  const [instituicoes, setInstituicoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstituicoes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}bancos/instituicoes`
        );

        let instituicoesData = [];
        if (response.data?.success) {
          instituicoesData = response.data.data || [];
        } else {
          instituicoesData = response.data || [];
        }
        
        // 🔥 Ordenar bancos por código (numérico)
        instituicoesData.sort((a, b) => {
          const codigoA = parseInt(a.codigo || '999', 10);
          const codigoB = parseInt(b.codigo || '999', 10);
          return codigoA - codigoB;
        });
        
        setInstituicoes(instituicoesData);
      } catch (err) {
        console.error('Erro ao carregar instituições bancárias:', err);
        setError(err.message || 'Erro ao carregar instituições bancárias');
      } finally {
        setLoading(false);
      }
    };

    fetchInstituicoes();
  }, []);

  const buscarPorCodigo = (codigo) => instituicoes.find((inst) => inst.codigo === codigo);

  return {
    instituicoes,
    loading,
    error,
    buscarPorCodigo,
  };
}
