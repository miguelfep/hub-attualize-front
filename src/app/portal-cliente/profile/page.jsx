'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { ProfileCover } from 'src/sections/profile/ProfileCover';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const ProfileSchema = zod.object({
  name: zod.string().min(1, 'Nome é obrigatório'),
  email: zod.string().email('Email inválido'),
});

const PasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Senha atual é obrigatória'),
  newPassword: zod.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: zod.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

// ----------------------------------------------------------------------
const SectionHeader = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
    <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
      <Iconify icon={icon} width={24} color="primary.main" />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
  </Stack>
);


export default function PortalClienteProfileView() {
  const theme = useTheme();
  const { user, checkUserSession } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [clienteData, setClienteData] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Formulário para alterar senha
  const passwordMethods = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const {
    handleSubmit: handlePasswordSubmit,
    formState: { isSubmitting: isPasswordSubmitting },
  } = passwordMethods;

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dados/${  user.userId}`);
        const {data} = response;
        setClienteData(data);

        // Atualiza os valores do formulário
        methods.reset({
          name: data.nome || user?.name || '',
          email: data.email || user?.email || '',
        });
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        toast.error('Erro ao carregar dados do cliente');
      }
    };

    if (user) {
      fetchClienteData();
    }
  }, [user, methods]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      
      // Atualiza dados do usuário
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}users/cliente/profile`, data);
      
      // Atualiza dados do cliente
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dados`, {
        nome: data.name,
        email: data.email,
      });

      // Recarrega a sessão do usuário
      await checkUserSession?.();

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  });

  const handlePasswordChange = handlePasswordSubmit(async (data) => {
    try {
      setPasswordLoading(true);
      
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}users/cliente/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Senha alterada com sucesso!');
      passwordMethods.reset();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  });

return (
    <LazyMotion features={domAnimation}>
      <m.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Card sx={{ borderRadius: 3 }}>
          <Box sx={{ p: 4, bgcolor: 'background.neutral', borderRadius: '16px 16px 0 0', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})` }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Meu Perfil</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Gerencie suas informações pessoais e de segurança.</Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4}>
              <Grid xs={12} md={4}>
                <ProfileCover user={user} />
              </Grid>

              <Grid xs={12} md={8}>
                <Stack spacing={4}>
                  <Box>
                    <SectionHeader icon="solar:user-id-bold-duotone" title="Informações Pessoais" />
                    <Form methods={methods} onSubmit={onSubmit}>
                      <Grid container spacing={2}>
                        <Grid xs={12} sm={6}>
                          <Field.Text name="name" label="Nome Completo" fullWidth />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Field.Text name="email" label="Email" fullWidth disabled />
                        </Grid>
                      </Grid>
                      <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
                        <Button variant="outlined" onClick={() => methods.reset()}>Cancelar</Button>
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>Salvar Alterações</LoadingButton>
                      </Stack>
                    </Form>
                  </Box>
                  
                  <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                  <Box>
                    <SectionHeader icon="solar:lock-password-bold-duotone" title="Alterar Senha" />
                    <Form methods={passwordMethods} onSubmit={handlePasswordChange}>
                      <Grid container spacing={2}>
                        <Grid xs={12} sm={6}>
                          <Field.Text name="currentPassword" label="Senha Atual" type="password" fullWidth />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Field.Text name="newPassword" label="Nova Senha" type="password" fullWidth />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <Field.Text name="confirmPassword" label="Confirmar Nova Senha" type="password" fullWidth />
                        </Grid>
                      </Grid>
                      <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
                        <Button variant="outlined" onClick={() => passwordMethods.reset()}>Cancelar</Button>
                        <LoadingButton type="submit" variant="contained" loading={isPasswordSubmitting || passwordLoading}>Alterar Senha</LoadingButton>
                      </Stack>
                    </Form>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}
