'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { PasswordIcon } from 'src/assets/icons';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { resetPassword } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatório!' })
    .email({ message: 'Email deve ser um endereço válido!' }),
});

// ----------------------------------------------------------------------

export function AmplifyResetPasswordView() {
  const router = useRouter();

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await resetPassword({ email: data.email });
      
      // Mostrar mensagem de sucesso
      alert('Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
      
      // Redirecionar para login
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      // Mostrar mensagem de erro
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao enviar email de recuperação. Tente novamente.';
      alert(errorMessage);
    }
  });

  const renderHead = (
    <>
      <PasswordIcon sx={{ mx: 'auto' }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5, textAlign: 'center', whiteSpace: 'pre-line' }}>
        <Typography variant="h5">Esqueceu sua senha?</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Digite o endereço de email associado à sua conta e enviaremos um link para redefinir sua senha.
        </Typography>
      </Stack>
    </>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        autoFocus
        name="email"
        label="Endereço de email"
        placeholder="exemplo@gmail.com"
        InputLabelProps={{ shrink: true }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Enviando..."
      >
        Enviar solicitação
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
