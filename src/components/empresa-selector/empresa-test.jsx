import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function EmpresaTest({ userId }) {
  const [empresas, setEmpresas] = useState([]);
  const [empresaAtiva, setEmpresaAtiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchEmpresas();
    }
  }, [userId, fetchEmpresas]);

  const fetchEmpresas = useCallback(async () => {
    try {
      setLoadingEmpresas(true);
      console.log('Buscando empresas para usuário:', userId);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}users/empresas/${userId}`);
      
      console.log('Resposta da API:', response.data);
      
      if (response.data.success) {
        const { empresas: empresasData, empresaAtiva: empresaAtivaData } = response.data.data;
        setEmpresas(empresasData || []);
        setEmpresaAtiva(empresaAtivaData);
        console.log('Empresas carregadas:', empresasData);
        console.log('Empresa ativa:', empresaAtivaData);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  }, [userId]);

  const handleTrocarEmpresa = async (novaEmpresaId) => {
    if (novaEmpresaId === empresaAtiva) return;

    try {
      setLoading(true);
      console.log('Trocando para empresa:', novaEmpresaId);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}users/trocar-empresa/${userId}`, {
        empresaId: novaEmpresaId
      });

      console.log('Resposta da troca:', response.data);

      if (response.data.success) {
        setEmpresaAtiva(novaEmpresaId);
        toast.success('Empresa alterada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao trocar empresa:', error);
      toast.error('Erro ao alterar empresa');
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  if (loadingEmpresas) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Carregando empresas...
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon="solar:buildings-bold" width={24} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Teste de Empresas
          </Typography>
        </Stack>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Usuário ID: {userId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Total de empresas: {empresas.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Empresa ativa: {empresaAtiva}
          </Typography>
        </Box>

        {empresas.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma empresa encontrada
          </Typography>
        ) : (
          <Stack spacing={2}>
            {empresas.map((empresa) => (
              <Box
                key={empresa._id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: empresa._id === empresaAtiva ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: empresa._id === empresaAtiva ? 'primary.lighter' : 'background.paper',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {empresa.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {empresa.razaoSocial}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CNPJ: {formatCNPJ(empresa.cnpj)} • Código: {empresa.codigo}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {empresa._id === empresaAtiva && (
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor: 'success.main',
                          color: 'white',
                          borderRadius: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        ATIVA
                      </Box>
                    )}
                    
                    <Button
                      size="small"
                      variant={empresa._id === empresaAtiva ? "contained" : "outlined"}
                      onClick={() => handleTrocarEmpresa(empresa._id)}
                      disabled={loading || empresa._id === empresaAtiva}
                      startIcon={
                        loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Iconify icon="eva:arrow-forward-fill" width={16} />
                        )
                      }
                    >
                      {empresa._id === empresaAtiva ? 'Ativa' : 'Ativar'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        <Button
          variant="outlined"
          onClick={fetchEmpresas}
          startIcon={<Iconify icon="eva:refresh-fill" />}
        >
          Recarregar Empresas
        </Button>
      </Stack>
    </Card>
  );
}
