'use client';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

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

export default function PortalClienteProfileView() {
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
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">Meu Perfil</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  src={user?.imgprofile}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                  }}
                >
                  {!user?.imgprofile && (
                    <Iconify icon="solar:user-bold-duotone" width={60} />
                  )}
                </Avatar>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {user?.email}
                  </Typography>
                  <Chip
                    label="Cliente"
                    color="primary"
                    size="small"
                  />
                </Stack>
                <Divider sx={{ width: '100%' }} />
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tipo de Usuário:
                    </Typography>
                    <Typography variant="body2">
                      Cliente
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Status:
                    </Typography>
                    <Chip
                      label={user?.status === true ? 'Ativo' : 'Inativo'}
                      color={user?.status === true ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Informações Pessoais" />
            <CardContent>
              <Form methods={methods} onSubmit={onSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="name"
                      label="Nome Completo"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="email"
                      label="Email"
                      fullWidth
                      disabled
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isSubmitting || loading}
                  >
                    Salvar Alterações
                  </LoadingButton>
                  <Button
                    variant="outlined"
                    onClick={() => methods.reset()}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Form>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardHeader title="Alterar Senha" />
            <CardContent>
              <Form methods={passwordMethods} onSubmit={handlePasswordChange}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="currentPassword"
                      label="Senha Atual"
                      type="password"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="newPassword"
                      label="Nova Senha"
                      type="password"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="confirmPassword"
                      label="Confirmar Nova Senha"
                      type="password"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isPasswordSubmitting || passwordLoading}
                  >
                    Alterar Senha
                  </LoadingButton>
                  <Button
                    variant="outlined"
                    onClick={() => passwordMethods.reset()}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Form>
            </CardContent>
          </Card>      
        </Grid>
      </Grid>
    </>
  );
}
