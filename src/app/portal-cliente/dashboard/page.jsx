'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axios from 'src/utils/axios';

import { getBannersForUser } from 'src/data/banners';
import { downloadLicenca } from 'src/actions/societario';
import { useSettingsContext } from 'src/contexts/SettingsContext';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';
import { SimplePaper } from 'src/components/paper/SimplePaper';
import { BannersSection } from 'src/components/banner/banners-section';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function PortalClienteDashboardView() {
  const { user } = useAuthContext();
  const { updateSettings } = useSettingsContext();


  const [dashboardData, setDashboardData] = useState({
    cliente: null,
    contratos: [],
    cobrancas: [],
    licencas: [],
    alteracoes: [],
  });

  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);

  // Função para filtrar cobranças vencidas e do mês corrente
  const getCobrancasFiltradas = () => {
    if (!dashboardData.cobrancas) return [];

    return dashboardData.cobrancas.filter((cobranca) => {
      const dataVencimento = new Date(cobranca.dataVencimento);
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      // Cobranças vencidas (independente do status)
      const isVencida = dataVencimento < hoje;

      // Cobranças do mês corrente
      const isMesAtual = dataVencimento.getMonth() === mesAtual &&
                        dataVencimento.getFullYear() === anoAtual;

      // Mostrar todas as cobranças (pendentes, pagas, canceladas) do período
      return isVencida || isMesAtual;
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${  user.userId}`);
        const {data} = response.data;
        setDashboardData(data);
        if (data?.settings) {
          updateSettings(data.settings);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchDashboardData();
      // Carregar banners baseados no usuário
      const userBanners = getBannersForUser(user);
      setBanners(userBanners);
    }
  }, [user, user?.userId, updateSettings]);



 
  return (
    <SimplePaper>
        {/* Seção de Banners */}
      <BannersSection banners={banners} />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
       
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Informações da Empresa" />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Nome Fantasia
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.cliente?.nome || 'Não informado'}
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      CNPJ
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {dashboardData.cliente?.cnpj || 'Não informado'}
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Código
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {dashboardData.cliente?.codigo || 'Não informado'}
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Inscrição Municipal
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {dashboardData.cliente?.im || 'Não informado'}
                    </Typography>
                  </Stack>
                </Grid>
                
                        <Grid item xs={12} sm={6} md={3}>
                          <Stack spacing={1}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Inscrição Estadual
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                              {dashboardData.cliente?.ie || 'Não informado'}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Stack spacing={1}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Regime Tributário
                            </Typography>
                            <Typography variant="body1">
                              {dashboardData.cliente?.regimeTributario || 'Não informado'}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Stack spacing={1}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Plano da Empresa
                            </Typography>
                            <Typography variant="body1">
                              {dashboardData.cliente?.planoEmpresa || 'Não informado'}
                            </Typography>
                          </Stack>
                        </Grid>               


                        <Grid item xs={12}>
                          <Stack spacing={1}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Tributação
                            </Typography>
                            {dashboardData.cliente?.tributacao && dashboardData.cliente.tributacao.length > 0 ? (
                              <Stack direction="row" flexWrap="wrap" spacing={1}>
                                {dashboardData.cliente.tributacao.map((tributo, index) => (
                                  <Chip key={index} label={tributo} size="small" color="info" />
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                Nenhuma tributação cadastrada
                              </Typography>
                            )}
                          </Stack>
                        </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

                {/* Licenças */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader 
                      title="Minhas Licenças"
                      action={
                        dashboardData.licencas && dashboardData.licencas.length > 3 && (
                          <Button
                            component={RouterLink}
                            href={paths.cliente.licencas}
                            size="small"
                            variant="outlined"
                            endIcon={<Iconify icon="solar:arrow-right-bold" />}
                          >
                            Ver todas ({dashboardData.licencas.length})
                          </Button>
                        )
                      }
                    />
                    <CardContent>
                      {dashboardData.licencas && dashboardData.licencas.length > 0 ? (
                        <Stack spacing={2}>
                          {dashboardData.licencas.slice(0, 3).map((licenca, index) => {
                            const getStatusColor = (status) => {
                              switch (status) {
                                case 'valida': return 'success';
                                case 'vencida': return 'error';
                                case 'dispensada': return 'info';
                                default: return 'default';
                              }
                            };

                            const getStatusText = (status) => {
                              switch (status) {
                                case 'valida': return 'Válida';
                                case 'vencida': return 'Vencida';
                                case 'dispensada': return 'Dispensada';
                                default: return status;
                              }
                            };

                            const isVencida = new Date(licenca.dataVencimento) < new Date();
                            const diasParaVencer = Math.ceil((new Date(licenca.dataVencimento) - new Date()) / (1000 * 60 * 60 * 24));

                            return (
                              <Stack key={index} spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Stack spacing={0.5}>
                                    <Typography variant="body1" fontWeight="medium">
                                      {licenca.nome}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {licenca.cidade} - {licenca.estado}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      Vencimento: {new Date(licenca.dataVencimento).toLocaleDateString('pt-BR')}
                                      {isVencida && (
                                        <Typography component="span" variant="caption" color="error.main" sx={{ ml: 1 }}>
                                          (Vencida)
                                        </Typography>
                                      )}
                                      {!isVencida && diasParaVencer <= 30 && (
                                        <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 1 }}>
                                          (Vence em {diasParaVencer} dias)
                                        </Typography>
                                      )}
                                    </Typography>
                                  </Stack>
                                  <Stack alignItems="flex-end" spacing={1}>
                                    <Chip
                                      label={getStatusText(licenca.status)}
                                      color={getStatusColor(licenca.status)}
                                      size="small"
                                    />
                                    {licenca.arquivo && (
                                      <Tooltip title="Baixar arquivo">
                                        <IconButton
                                          size="small"
                                          onClick={async () => {
                                            try {
                                              const response = await downloadLicenca(licenca._id);
                                              const url = window.URL.createObjectURL(new Blob([response.data]));
                                              const link = document.createElement('a');
                                              link.href = url;
                                              link.setAttribute('download', `${licenca.nome}.pdf`);
                                              document.body.appendChild(link);
                                              link.click();
                                              link.remove();
                                              window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                              console.error('Erro ao baixar a licença:', error);
                                              toast.error('Erro ao baixar a licença');
                                            }
                                          }}
                                        >
                                          <Iconify icon="solar:download-bold" width={16} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Stack>
                                </Stack>
                                {licenca.observacao && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                    {licenca.observacao}
                                  </Typography>
                                )}
                                {index < Math.min(3, dashboardData.licencas.length) - 1 && <Divider />}
                              </Stack>
                            );
                          })}
                          
                          {/* Indicador de mais licenças */}
                          {dashboardData.licencas.length > 3 && (
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: 'grey.50', 
                              borderRadius: 1, 
                              textAlign: 'center',
                              border: '1px dashed',
                              borderColor: 'divider'
                            }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                +{dashboardData.licencas.length - 3} licenças adicionais
                              </Typography>
                              <Button
                                component={RouterLink}
                                href={paths.cliente.licencas}
                                size="small"
                                variant="text"
                                endIcon={<Iconify icon="solar:arrow-right-bold" />}
                              >
                                Ver todas as licenças
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      ) : (
                        <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                          <Iconify icon="solar:shield-check-bold-duotone" width={32} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Nenhuma licença encontrada
                          </Typography>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Fatura do Mês */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      zIndex: 0
                    }} />
                    <Box sx={{
                      position: 'absolute',
                      bottom: -30,
                      left: -30,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      zIndex: 0
                    }} />
                    
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
                          💳 Faturas Pendentes
                        </Typography>
                      }
                      sx={{ position: 'relative', zIndex: 1 }}
                    />
                    
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      {getCobrancasFiltradas().length > 0 ? (
                        <Stack spacing={3}>
                          {getCobrancasFiltradas()
                            .slice(0, 3)
                            .map((cobranca, index) => (
                            <Box key={index} sx={{ 
                              p: 3, 
                              bgcolor: 'rgba(255,255,255,0.15)', 
                              borderRadius: 2,
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                              <Stack spacing={2}>
                                {/* Header da Cobrança */}
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Stack spacing={0.5}>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                                      {cobranca.contrato?.titulo || 'Cobrança'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                      Vencimento: {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
                                    </Typography>
                                  </Stack>
                                  <Stack alignItems="flex-end" spacing={0.5}>
                                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                      {formatToCurrency(cobranca.valor?.toFixed(2) || '0,00')}
                                    </Typography>
                                    <Chip
                                      label={(() => {
                                        const statusTexts = {
                                          EMABERTO: 'Aguardando pagamento',
                                          VENCIDO: 'Vencida',
                                          CANCELADO: 'Cancelado',
                                          RECEBIDO: 'Pago',
                                        };
                                        return statusTexts[cobranca.status] || cobranca.status;
                                      })()}
                                      color={(() => {
                                        const statusColors = {
                                          EMABERTO: 'warning',
                                          VENCIDO: 'error',
                                          CANCELADO: 'info',
                                          RECEBIDO: 'success',
                                        };
                                        return statusColors[cobranca.status] || 'default';
                                      })()}
                                      size="small"
                                      sx={{ 
                                        bgcolor: (() => {
                                          const bgColors = {
                                            EMABERTO: 'rgba(255,193,7,0.2)',
                                            VENCIDO: 'rgba(220,53,69,0.2)',
                                            CANCELADO: 'rgba(23,162,184,0.2)',
                                            RECEBIDO: 'rgba(40,167,69,0.2)',
                                          };
                                          return bgColors[cobranca.status] || 'rgba(108,117,125,0.2)';
                                        })(),
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)'
                                      }}
                                    />
                                  </Stack>
                                </Stack>

                                {/* Botões de Pagamento */}
                                {cobranca.status === 'EMABERTO' && cobranca.boleto && (
                                  <Stack spacing={2}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: 'medium' }}>
                                      💡 Pague instantaneamente com PIX
                                    </Typography>
                                    <Stack direction="row" spacing={2} justifyContent="center">
                                      {(() => {
                                        try {
                                          const boletoData = typeof cobranca.boleto === 'string' 
                                            ? JSON.parse(cobranca.boleto) 
                                            : cobranca.boleto;
                                          
                                          return (
                                            <>
                                              {boletoData.pixCopiaECola && (
                                                <Button
                                                  variant="contained"
                                                  startIcon={<Iconify icon="solar:qr-code-bold" />}
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(boletoData.pixCopiaECola);
                                                    toast.success('🎉 PIX copiado! Cole no seu app de pagamento');
                                                  }}
                                                  sx={{ 
                                                    bgcolor: '#00C851',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    px: 3,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    boxShadow: '0 4px 15px rgba(0,200,81,0.4)',
                                                    '&:hover': {
                                                      bgcolor: '#00A041',
                                                      transform: 'translateY(-2px)',
                                                      boxShadow: '0 6px 20px rgba(0,200,81,0.6)',
                                                    },
                                                    transition: 'all 0.3s ease'
                                                  }}
                                                >
                                                  🚀 PIX Instantâneo
                                                </Button>
                                              )}

                                              {boletoData.linhaDigitavel && (
                                                <Button
                                                  variant="outlined"
                                                  startIcon={<Iconify icon="solar:document-text-bold" />}
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(boletoData.linhaDigitavel);
                                                    toast.success('📄 Linha digitável copiada!');
                                                  }}
                                                  sx={{ 
                                                    borderColor: 'rgba(255,255,255,0.5)',
                                                    color: 'white',
                                                    px: 3,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    '&:hover': {
                                                      borderColor: 'white',
                                                      bgcolor: 'rgba(255,255,255,0.1)',
                                                      transform: 'translateY(-1px)',
                                                    },
                                                    transition: 'all 0.3s ease'
                                                  }}
                                                >
                                                  Boleto
                                                </Button>
                                              )}
                                            </>
                                          );
                                        } catch (error) {
                                          console.error('Erro ao fazer parse do boleto:', error);
                                          return null;
                                        }
                                      })()}
                                    </Stack>
                                  </Stack>
                                )}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                          <Iconify icon="solar:bill-list-bold-duotone" width={48} sx={{ color: 'rgba(255,255,255,0.7)' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Nenhuma cobrança encontrada
                          </Typography>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
      </Grid>
    </SimplePaper>
  );
}
