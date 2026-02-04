'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

export default function SolicitarMedPassPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    quantidadeBeneficiarios: '',
    observacoes: '',
  });

  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

    if (!formData.nome || !formData.email || !formData.quantidadeBeneficiarios) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implementar chamada à API para enviar solicitação
      // await api.post('/medpass/solicitar', { ...formData, userId: user?.userId });
      
      setShowModal(true);
    } catch (error) {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Limpar formulário
    setFormData({
      nome: user?.name || user?.razaoSocial || '',
      email: user?.email || '',
      telefone: '',
      quantidadeBeneficiarios: '',
      observacoes: '',
    });
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
            alt="MedPass"
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
                  MedPass - Multi Benefícios
                </Typography>
                <Typography variant="h4" color="text.secondary" sx={{ maxWidth: 900, fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
                  Cuidado completo com a saúde dos seus colaboradores e familiares. Uma solução completa de benefícios de saúde com teleconsulta, consultas presenciais, descontos, apoio emocional e muito mais.
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
            heading="Solicitar MedPass"
            links={[
              { name: 'Home', href: '/' },
              { name: 'Solicitar MedPass' },
            ]}
            sx={{ mb: 4 }}
          />

          <Grid container spacing={4}>

          {/* Principais Benefícios */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Benefícios completos para sua equipe
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:phone-calling-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Teleconsulta e Consultas Presenciais
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Acesso a consultas médicas online e presenciais com profissionais qualificados.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:discount-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Descontos Exclusivos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Descontos em farmácias, laboratórios e outros serviços de saúde.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:heart-pulse-2-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Fitness e Nutricionista
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Acompanhamento com profissionais de educação física e nutrição.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Apoio Emocional
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Suporte psicológico e emocional para você e sua família.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:dog-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Assistência PET
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cuidados também para os animais de estimação da família.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Iconify icon="solar:shield-check-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Assistência Funeral
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Suporte completo em momentos difíceis para você e sua família.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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

                    {/* Quantidade de Beneficiários */}
                    <TextField
                      fullWidth
                      label="Quantidade de Beneficiários"
                      type="number"
                      value={formData.quantidadeBeneficiarios}
                      onChange={handleChange('quantidadeBeneficiarios')}
                      required
                      inputProps={{ min: 1 }}
                      helperText="Informe quantas pessoas serão beneficiadas pelo plano"
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

          {/* Informações sobre o MedPass */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Iconify icon="solar:heart-pulse-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Cuidado Completo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uma solução completa que cobre desde consultas médicas até assistência funeral.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Iconify icon="solar:users-group-rounded-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Para Toda a Família
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Benefícios que se estendem para seus colaboradores e seus familiares.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Iconify icon="solar:phone-calling-bold-duotone" width={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Suporte Dedicado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nossa equipe está pronta para ajudar você e seus colaboradores.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
        </Container>

        {/* Modal de Confirmação */}
        <Dialog open={showModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:check-circle-bold-duotone" width={40} sx={{ color: 'success.main' }} />
              <Typography variant="h6">Solicitação Enviada!</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Sua solicitação de MedPass foi enviada com sucesso!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nossa equipe entrará em contato em breve para dar continuidade ao seu pedido e apresentar as melhores opções de planos disponíveis.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} variant="contained" fullWidth>
              Entendi
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LazyMotion>
  );
}
