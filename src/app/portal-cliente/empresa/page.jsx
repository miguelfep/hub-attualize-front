'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function MinhaEmpresaView() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${  user.userId}`);
        setEmpresaData(response.data.data.cliente);
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresaData();
  }, [ user.userId]);

  if (loading) {
    return (
      <SimplePaper>
        <Typography>Carregando dados da empresa...</Typography>
      </SimplePaper>
    );
  }

  if (!empresaData) {
    return (
      <SimplePaper>
        <Typography>Não foi possível carregar os dados da empresa.</Typography>
      </SimplePaper>
    );
  }

  const getStatusColor = (status) => status ? 'success' : 'error';

  const getRegimeColor = (regime) => {
    const colors = {
      simples: 'primary',
      presumido: 'secondary',
      real: 'info',
    };
    return colors[regime] || 'default';
  };

  const getPlanoColor = (plano) => {
    const colors = {
      start: 'primary',
      basic: 'secondary',
      premium: 'success',
      vip: 'warning',
    };
    return colors[plano] || 'default';
  };

  return (
    <SimplePaper>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">Minha Empresa</Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Informações Básicas" />
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nome Fantasia
                  </Typography>
                  <Typography variant="h6">
                    {empresaData.nome}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Razão Social
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.razaoSocial}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    CNPJ
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.cnpj}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Código
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.codigo}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Inscrição Estadual
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.ie || 'Não informado'}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Inscrição Municipal
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.im || 'Não informado'}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Status e Configurações */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Status e Configurações" />
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Status
                  </Typography>
                  <Chip 
                    label={empresaData.status ? 'Ativo' : 'Inativo'} 
                    color={getStatusColor(empresaData.status)}
                    size="small"
                  />
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Regime Tributário
                  </Typography>
                  <Chip 
                    label={empresaData.regimeTributario?.toUpperCase() || 'Não informado'} 
                    color={getRegimeColor(empresaData.regimeTributario)}
                    size="small"
                  />
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Plano
                  </Typography>
                  <Chip 
                    label={empresaData.planoEmpresa?.toUpperCase() || 'Não informado'} 
                    color={getPlanoColor(empresaData.planoEmpresa)}
                    size="small"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contato */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Informações de Contato" />
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Email Principal
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.email}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Email Financeiro
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.emailFinanceiro || 'Não informado'}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    WhatsApp
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.whatsapp || 'Não informado'}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Telefone Comercial
                  </Typography>
                  <Typography variant="body1">
                    {empresaData.telefoneComercial || 'Não informado'}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Endereço */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Endereço" />
            <CardContent>
              {empresaData.endereco && empresaData.endereco.length > 0 ? (
                <Stack spacing={2}>
                  {empresaData.endereco.map((endereco, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Stack spacing={1}>
                        <Typography variant="body1">
                          {endereco.rua}, {endereco.numero}
                          {endereco.complemento && `, ${endereco.complemento}`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {endereco.cidade} - {endereco.estado}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          CEP: {endereco.cep}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Endereço não informado
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tributação */}
        {empresaData.tributacao && empresaData.tributacao.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Tributação" />
              <CardContent>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {empresaData.tributacao.map((tributo, index) => (
                    <Chip 
                      key={index}
                      label={tributo.toUpperCase()} 
                      color="info"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Atividades */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Atividades da Empresa" />
            <CardContent>
              <Grid container spacing={3}>
                {/* Atividade Principal */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ color: 'primary.main', borderBottom: 1, borderColor: 'primary.main', pb: 1 }}>
                      Atividade Principal
                    </Typography>
                    {empresaData.atividade_principal && empresaData.atividade_principal.length > 0 ? (
                      empresaData.atividade_principal.map((atividade, index) => (
                        <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Stack spacing={1}>
                            <Chip 
                              label={atividade.code} 
                              color="primary" 
                              size="small" 
                              sx={{ alignSelf: 'flex-start' }}
                            />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {atividade.text}
                            </Typography>
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Nenhuma atividade principal cadastrada
                      </Typography>
                    )}
                  </Stack>
                </Grid>

                {/* Atividades Secundárias */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ color: 'secondary.main', borderBottom: 1, borderColor: 'secondary.main', pb: 1 }}>
                      Atividades Secundárias
                    </Typography>
                    {empresaData.atividades_secundarias && empresaData.atividades_secundarias.length > 0 ? (
                      <Stack spacing={1}>
                        {empresaData.atividades_secundarias.map((atividade, index) => (
                          <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Stack spacing={1}>
                              <Chip 
                                label={atividade.code} 
                                color="secondary" 
                                size="small" 
                                sx={{ alignSelf: 'flex-start' }}
                              />
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {atividade.text}
                              </Typography>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Nenhuma atividade secundária cadastrada
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sócios */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Sócios" />
            <CardContent>
              {empresaData.socios && empresaData.socios.length > 0 ? (
                <Grid container spacing={2}>
                  {empresaData.socios.map((socio, index) => (
                    <Grid key={index} item xs={12} sm={6} lg={4}>
                      <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                        <Stack spacing={2}>
                          {/* Header do Sócio */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ color: 'text.primary' }}>
                              {socio.nome || 'Nome não informado'}
                            </Typography>
                            <Chip
                              label={socio.administrador ? 'Administrador' : 'Sócio'}
                              color={socio.administrador ? 'primary' : 'default'}
                              size="small"
                            />
                          </Stack>

                          <Divider />

                          {/* Informações do Sócio */}
                          <Stack spacing={2}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 'medium' }}>
                                CPF
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {socio.cpf || 'Não informado'}
                              </Typography>
                            </Stack>

                            <Stack spacing={0.5}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 'medium' }}>
                                RG
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {socio.rg || 'Não informado'}
                              </Typography>
                            </Stack>

                            <Stack spacing={0.5}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 'medium' }}>
                                CNH
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {socio.cnh || 'Não informado'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={48} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nenhum sócio cadastrado
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Observações */}
        {empresaData.observacao && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Observações" />
              <CardContent>
                <Typography variant="body1">
                  {empresaData.observacao}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </SimplePaper>
  );
}
