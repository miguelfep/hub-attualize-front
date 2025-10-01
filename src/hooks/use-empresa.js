import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useEmpresa(userId) {
  const [empresas, setEmpresas] = useState([]);
  const [empresaAtiva, setEmpresaAtiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  const fetchEmpresas = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setLoadingEmpresas(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/empresas/${userId}`);
      
      if (response.data.success) {
        const { empresas: empresasData, empresaAtiva: empresaAtivaData } = response.data.data;
    
        setEmpresas(empresasData || []);
        setEmpresaAtiva(empresaAtivaData);
      } else {
        console.log('useEmpresa: API retornou success: false');
      }
    } catch (error) {
    
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  }, [userId]);

  const trocarEmpresa = useCallback(async (novaEmpresaId) => {
    if (novaEmpresaId === empresaAtiva || !userId) return;

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/trocar-empresa/${userId}`, {
        empresaId: novaEmpresaId
      });

      if (response.data.success) {
        setEmpresaAtiva(novaEmpresaId);
        toast.success('Empresa alterada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao trocar empresa:', error);
      toast.error('Erro ao alterar empresa');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [empresaAtiva, userId]);

  const getEmpresaAtiva = useCallback(() => empresas.find(empresa => empresa._id === empresaAtiva), [empresas, empresaAtiva]);

  const temMultiplasEmpresas = empresas.length > 1;

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  return {
    empresas,
    empresaAtiva,
    empresaAtivaData: getEmpresaAtiva(),
    loading,
    loadingEmpresas,
    temMultiplasEmpresas,
    trocarEmpresa,
    refetchEmpresas: fetchEmpresas,
  };
}
