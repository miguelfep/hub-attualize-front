// Em src/hooks/use-documentos.js
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import axios from 'src/utils/axios';

export function useDocumentos() {
  const [documentos, setDocumentos] = useState({
    contratoSocialUrl: null,
    cartaoCnpjUrl: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchDocumentos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/documentos/meus-documentos`);
      
      if (response.data && response.data.success) {
        setDocumentos(response.data.data);
      } else {
        throw new Error(response.data.message || 'Falha ao buscar dados.');
      }

    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Não foi possível carregar seus documentos.');
      setDocumentos({ contratoSocialUrl: null, cartaoCnpjUrl: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);
  
  return {
    documentos,
    loading,
    refetchDocumentos: fetchDocumentos,
  };
}
