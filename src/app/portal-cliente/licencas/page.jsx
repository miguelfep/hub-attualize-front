'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import CardContent from '@mui/material/CardContent';

import axios from 'src/utils/axios';

import { downloadLicenca } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function PortalClienteLicencasView() {
  const { user } = useAuthContext();

  const [licencas, setLicencas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        setLoading(true);
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          sortBy: 'dataVencimento',
          sortOrder: 'asc',
          ...(filtroStatus && filtroStatus !== 'TODOS' && { status: filtroStatus }),
        };

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/licencas/${  user.userId}`, { params });
        setLicencas(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } catch (error) {
        console.error('Erro ao carregar licenças:', error);
        toast.error('Erro ao carregar licenças');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchLicencas();
    }
  }, [pagination, filtroStatus, user?.userId]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDownload = async (licencaId, nome) => {
    try {
      const response = await downloadLicenca(licencaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${nome}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Licença baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar a licença:', error);
      toast.error('Erro ao baixar a licença');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      valida: 'success',
      vencida: 'error',
      dispensada: 'info',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusTexts = {
      valida: 'Válida',
      vencida: 'Vencida',
      dispensada: 'Dispensada',
    };
    return statusTexts[status] || status;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valida':
        return 'solar:shield-check-bold-duotone';
      case 'vencida':
        return 'solar:shield-cross-bold-duotone';
      case 'dispensada':
        return 'solar:shield-user-bold-duotone';
      default:
        return 'solar:shield-bold-duotone';
    }
  };

  return (
    <SimplePaper>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">Minhas Licenças</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            size="small"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            placeholder="Filtrar por status"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="TODOS">Todos os status</MenuItem>
            <MenuItem value="valida">Válida</MenuItem>
            <MenuItem value="vencida">Vencida</MenuItem>
            <MenuItem value="dispensada">Dispensada</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      {loading ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Carregando licenças...
          </Typography>
        </Stack>
      ) : licencas.length > 0 ? (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            {licencas.map((licenca) => (
              <Grid key={licenca._id} item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  border: 1, 
                  borderColor: 'divider',
                  height: '100%',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={3} sx={{ flexGrow: 1 }}>
                      {/* Header da Licença */}
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: `${getStatusColor(licenca.status)  }.main`,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Iconify icon={getStatusIcon(licenca.status)} width={24} />
                        </Avatar>
                        <Stack sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ color: 'text.primary' }}>
                            {licenca.nome}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {licenca.cidade} - {licenca.estado}
                          </Typography>
                        </Stack>
                        <Chip
                          label={getStatusLabel(licenca.status)}
                          color={getStatusColor(licenca.status)}
                          size="small"
                        />
                      </Stack>

                      <Divider />

                      {/* Informações da Licença */}
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Stack spacing={0.5}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 'medium' }}>
                              Início
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {formatDate(licenca.dataInicio)}
                            </Typography>
                          </Stack>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 'medium' }}>
                              Vencimento
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {formatDate(licenca.dataVencimento)}
                            </Typography>
                          </Stack>
                        </Stack>
                        
                        {licenca.observacao && (
                          <Stack spacing={0.5}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 'medium' }}>
                              Observação
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              {licenca.observacao}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* Botão de Download */}
                      {licenca.arquivo && (
                        <Stack spacing={2} sx={{ mt: 'auto' }}>
                          <Button
                            variant="contained"
                            startIcon={<Iconify icon="solar:download-bold" />}
                            onClick={() => handleDownload(licenca._id, licenca.nome)}
                            fullWidth
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              fontWeight: 'bold',
                              py: 1.5,
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Baixar Licença
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Stack>
          )}
        </Stack>
      ) : (
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
              <Avatar sx={{ bgcolor: 'grey.100', width: 64, height: 64 }}>
                <Iconify icon="solar:shield-check-bold-duotone" width={32} />
              </Avatar>
              <Typography variant="h6">Nenhuma licença encontrada</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Não há licenças para exibir no momento.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </SimplePaper>
  );
}
