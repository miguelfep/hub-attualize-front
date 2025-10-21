import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import axios from 'src/utils/axios';

export function useLicencas(user) {
  const [licencas, setLicencas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchLicencas = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'dataVencimento',
        sortOrder: 'asc',
        ...(filtroStatus && filtroStatus !== 'TODOS' && { status: filtroStatus }),
      };

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/licencas/${user.userId}`,
        { params }
      );
      setLicencas(response.data.data || []);
      setPagination((prev) => response.data.pagination || prev);
    } catch (error) {
      console.error('Erro ao carregar licenças:', error);
      toast.error('Erro ao carregar licenças');
    } finally {
      setLoading(false);
    }
  }, [user?.userId, pagination.page, pagination.limit, filtroStatus]);

  useEffect(() => {
    fetchLicencas();
  }, [fetchLicencas]);

  const handlePageChange = useCallback((event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleFiltroChange = useCallback((event) => {
    setFiltroStatus(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);
  
  return {
    licencas,
    loading,
    pagination,
    filtroStatus,
    handleFiltroChange,
    handlePageChange,
  };
}
