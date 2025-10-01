'use client';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { PasswordIcon } from 'src/assets/icons';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { updatePassword } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

export const UpdatePasswordSchema = zod.object({
  password: zod
    .string()
    .min(1, { message: 'Senha é obrigatória!' })
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres!' }),
  confirmPassword: zod
    .string()
    .min(1, { message: 'Confirmação de senha é obrigatória!' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem!',
  path: ['confirmPassword'],
});

// ----------------------------------------------------------------------

export function JwtUpdatePasswordView() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const {userId} = params;
  const token = searchParams.get('token');

  const password = useBoolean();
  const confirmPassword = useBoolean();

  // Verificar se userId e token existem
  useEffect(() => {
    if (!userId || !token) {
      // Redirecionar para página de reset de senha após 3 segundos
      const timer = setTimeout(() => {
        router.push(paths.auth.jwt.resetPassword);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [userId, token, router]);

  const defaultValues = {
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = methods;

  // Se não tiver userId ou token, mostrar mensagem de erro
  if (!userId || !token) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <PasswordIcon sx={{ mx: 'auto', mb: 3 }} />
        
        <Typography variant="h5" sx={{ mb: 2 }}>
          Link inválido
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          O link de redefinição de senha é inválido ou expirou.
          <br />
          Você será redirecionado para solicitar um novo link em alguns segundos.
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3 }}>
          Token ou ID de usuário não encontrado. Solicite um novo link de redefinição.
        </Alert>
        
        <Link
          component={RouterLink}
          href={paths.auth.jwt.resetPassword}
          variant="button"
          sx={{ mt: 2 }}
        >
          Solicitar novo link
        </Link>
      </Box>
    );
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!token || !userId) {
        setError('root', {
          message: 'Token de redefinição não encontrado. Solicite um novo link.',
        });
        return;
      }

      await updatePassword({ 
        userId,
        token, 
        password: data.password
      });
      
      // Mostrar mensagem de sucesso
      toast.success('Senha redefinida com sucesso! Você pode fazer login com sua nova senha.');
      
      // Redirecionar para login
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
      console.error('Erro ao redefinir senha:', error);
      
      // Mostrar mensagem de erro
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao redefinir senha. Tente novamente.';
      
      setError('root', {
        message: errorMessage,
      });
    }
  });

  const renderHead = (
    <>
      <PasswordIcon sx={{ mx: 'auto' }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5, textAlign: 'center', whiteSpace: 'pre-line' }}>
        <Typography variant="h5">Redefinir senha</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Digite sua nova senha abaixo. Certifique-se de que ela tenha pelo menos 6 caracteres.
        </Typography>
      </Stack>
    </>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        autoFocus
        name="password"
        label="Nova senha"
        placeholder="Digite sua nova senha"
        type={password.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="confirmPassword"
        label="Confirmar nova senha"
        placeholder="Confirme sua nova senha"
        type={confirmPassword.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle} edge="end">
                <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Redefinindo..."
      >
        Redefinir senha
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.signIn}
        color="inherit"
        variant="subtitle2"
        sx={{ gap: 0.5, alignSelf: 'center', alignItems: 'center', display: 'inline-flex' }}
      >
        <Iconify width={16} icon="eva:arrow-ios-back-fill" />
        Voltar para login
      </Link>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
