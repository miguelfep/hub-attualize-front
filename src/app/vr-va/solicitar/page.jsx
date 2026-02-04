'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

export default function SolicitarVrVaPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    quantidadeCartoes: '',
    saldoMensal: '',
    observacoes: '',
  });

  const [saving, setSaving] = useState(false);

  // Pré-preenche dados se o usuário estiver logado
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nome: user?.name || user?.razaoSocial || '',
        email: user?.email || '',
      }));
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.quantidadeCartoes || !formData.saldoMensal) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implementar chamada à API para enviar solicitação
      // await api.post('/vr-va/solicitar', { ...formData, userId: user?.userId });
      
      toast.success('Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve.');
      
      // Limpar formulário
      setFormData({
        nome: user?.name || user?.razaoSocial || '',
        email: user?.email || '',
        telefone: '',
        quantidadeCartoes: '',
        saldoMensal: '',
        observacoes: '',
      });
    } catch (error) {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <Box>
        {/* Hero Banner Fullwidth */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            minHeight: { xs: 400, md: 600 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
          }}
        >
          <Box
            component="img"
            src="/assets/images/banners/background.webp"
            alt="VR e VA"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
              zIndex: 0,
            }}
          />
          <Container maxWidth="lg">
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                py: { xs: 8, md: 12 },
                px: { xs: 3, md: 4 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: 400, md: 600 },
              }}
            >
              <Stack spacing={4} alignItems="center" textAlign="center" sx={{ maxWidth: 1000 }}>
                <Typography variant="h1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '2.5rem', md: '4rem' } }}>
                  Auxílio VR+VA
                </Typography>
                <Typography variant="h4" color="text.secondary" sx={{ maxWidth: 900, fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
                  Alimentar com mais escolhas é o melhor tempero. Um benefício para aquisição de refeições e alimentos, com um só cartão, em restaurantes, padarias, lanchonetes, cafés, supermercados, hortifrútis, mercearias e açougues.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    const formElement = document.querySelector('form');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  sx={{ 
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                  startIcon={<Iconify icon="solar:arrow-down-bold-duotone" />}
                >
                  Solicitar Agora
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 5 }}>
          <CustomBreadcrumbs
            heading="Solicitar VR/VA"
            links={[
              { name: 'Home', href: '/' },
              { name: 'Solicitar VR/VA' },
            ]}
            sx={{ mb: 4 }}
          />

          <Grid container spacing={4}>

          {/* Principais Vantagens */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Mais praticidade para a rotina do trabalhador
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:wallet-money-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Custo zero
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        O empregador não paga nada pela emissão, entrega na empresa e serviços dos cartões.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:document-text-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        PAT e Auxílio
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aderente ao PAT (Lei 6.321/76) e Auxílio (Artigo 457, CLT e Lei nº 14.442), é só escolher! Crédito recorrente.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:shop-2-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Ampla aceitação
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Os cartões VR são aceitos nas principais máquinas e aplicativos de entrega em todo o Brasil.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:clock-circle-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Crédito rápido
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Com pagamento via PIX e agendamento de crédito no mesmo dia, a compensação é feita em minutos.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Informação sobre TotalPass */}
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Iconify icon="solar:gift-bold-duotone" width={32} sx={{ color: 'info.main' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      TotalPass Disponível
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ao utilizar o VR, você também terá acesso ao TotalPass, um benefício adicional para seus colaboradores.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Formulário */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Dados da Solicitação
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Dados do Cliente */}
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Dados de Contato
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Nome/Razão Social"
                            value={formData.nome}
                            onChange={handleChange('nome')}
                            required
                            size="small"
                            helperText={user ? 'Pré-preenchido com seus dados' : ''}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            required
                            size="small"
                            helperText={user ? 'Pré-preenchido com seus dados' : ''}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Telefone"
                            value={formData.telefone}
                            onChange={handleChange('telefone')}
                            size="small"
                            placeholder="(00) 00000-0000"
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Quantidade de Cartões */}
                    <TextField
                      fullWidth
                      label="Quantidade de Cartões"
                      type="number"
                      value={formData.quantidadeCartoes}
                      onChange={handleChange('quantidadeCartoes')}
                      required
                      inputProps={{ min: 1 }}
                      helperText="Informe quantos cartões VR/VA você precisa"
                    />

                    {/* Saldo Mensal */}
                    <TextField
                      fullWidth
                      label="Saldo Mensal por Cartão (R$)"
                      type="number"
                      value={formData.saldoMensal}
                      onChange={handleChange('saldoMensal')}
                      required
                      inputProps={{ min: 0, step: 0.01 }}
                      helperText="Valor que será creditado mensalmente em cada cartão"
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                      }}
                    />

                    {/* Observações */}
                    <TextField
                      fullWidth
                      label="Observações"
                      multiline
                      rows={4}
                      value={formData.observacoes}
                      onChange={handleChange('observacoes')}
                      helperText="Informações adicionais sobre sua solicitação (opcional)"
                    />

                    {/* Botões */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => router.push('/')}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        startIcon={<Iconify icon="solar:check-circle-bold-duotone" />}
                      >
                        {saving ? 'Enviando...' : 'Enviar Solicitação'}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Informações sobre SuperApp e SuperPortal */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Iconify icon="solar:smartphone-2-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      SuperApp VR
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      O trabalhador tem mais autonomia, praticidade e empoderamento a um clique de distância. Gestão de saldos, ofertas exclusivas e muito mais.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Iconify icon="solar:chart-2-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      SuperPortal VR
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gestão simplificada e centralizada com segurança jurídica total. Dados comparativos estratégicos para tomadas de decisões.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Iconify icon="solar:shield-check-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Tecnologia Antifraude
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mais segurança para você e seus colaboradores com tecnologia de ponta.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
        </Container>
      </Box>
    </LazyMotion>
  );
}
