'use client';

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
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function TesteEmpresasView() {
  const { user, empresa } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [dadosEmpresa, setDadosEmpresa] = useState(null);

  const fetchDadosEmpresa = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dados/${user.id}`);
      
      if (response.data.success) {
        setDadosEmpresa(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      toast.error('Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDadosEmpresa();
  }, [user?.id, empresa?.empresaAtiva, fetchDadosEmpresa]);

  return (
    <SimplePaper>
      <Stack spacing={4}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Teste de Empresas
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchDadosEmpresa}
            startIcon={<Iconify icon="eva:refresh-fill" />}
            disabled={loading}
          >
            Recarregar
          </Button>
        </Stack>

        {/* Informações do Usuário */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Informações do Usuário
            </Typography>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {user?.name || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {user?.email || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                  {user?.id || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tipo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {user?.userType || 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Informações de Empresa */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Informações de Empresa
            </Typography>
            
            {empresa ? (
              <Stack spacing={2}>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total de Empresas
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {empresa.empresas?.length || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Empresa Ativa
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                      {empresa.empresaAtiva || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Múltiplas Empresas
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {empresa.temMultiplasEmpresas ? 'Sim' : 'Não'}
                    </Typography>
                  </Box>
                </Stack>

                {empresa.empresaAtivaData && (
                  <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Empresa Ativa:
                    </Typography>
                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nome
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {empresa.empresaAtivaData.nome || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          CNPJ
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                          {empresa.empresaAtivaData.cnpj || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Código
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {empresa.empresaAtivaData.codigo || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {empresa.empresas && empresa.empresas.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Todas as Empresas:
                    </Typography>
                    <Stack spacing={1}>
                      {empresa.empresas.map((emp, index) => (
                        <Box
                          key={emp._id}
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: emp._id === empresa.empresaAtiva ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            bgcolor: emp._id === empresa.empresaAtiva ? 'primary.lighter' : 'background.paper',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack spacing={0.5}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {emp.nome}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {emp.razaoSocial} • CNPJ: {emp.cnpj} • Código: {emp.codigo}
                              </Typography>
                            </Stack>
                            {emp._id === empresa.empresaAtiva && (
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
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma informação de empresa disponível
              </Typography>
            )}
          </Stack>
        </Card>

        {/* Dados da Empresa Ativa */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Dados da Empresa Ativa (API)
            </Typography>
            
            {loading ? (
              <Stack direction="row" alignItems="center" spacing={2}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Carregando dados da empresa...
                </Typography>
              </Stack>
            ) : dadosEmpresa ? (
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Dados carregados com sucesso:
                </Typography>
                <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                  {JSON.stringify(dadosEmpresa, null, 2)}
                </pre>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum dado carregado
              </Typography>
            )}
          </Stack>
        </Card>
      </Stack>
    </SimplePaper>
  );
}
