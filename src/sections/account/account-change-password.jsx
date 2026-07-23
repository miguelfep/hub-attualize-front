import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { alterarMinhaSenha } from 'src/actions/users';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------
// Troca de senha do próprio usuário (PUT /users/me/password). Exige a senha
// atual; o backend valida a força da nova senha.
// ----------------------------------------------------------------------

export const ChangePasswordSchema = zod
  .object({
    senhaAtual: zod.string().min(1, { message: 'Informe a senha atual.' }),
    novaSenha: zod
      .string()
      .min(1, { message: 'Informe a nova senha.' })
      .min(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' }),
    confirmarSenha: zod.string().min(1, { message: 'Confirme a nova senha.' }),
  })
  .refine((data) => data.senhaAtual !== data.novaSenha, {
    message: 'A nova senha deve ser diferente da atual.',
    path: ['novaSenha'],
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });

export function AccountChangePassword() {
  const mostrar = useBoolean();

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { senhaAtual: '', novaSenha: '', confirmarSenha: '' },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await alterarMinhaSenha({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha });
      toast.success('Senha alterada com sucesso!');
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Não foi possível alterar a senha.');
    }
  });

  const adornment = (
    <InputAdornment position="end">
      <IconButton onClick={mostrar.onToggle} edge="end">
        <Iconify icon={mostrar.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column', maxWidth: 480 }}>
        <Typography variant="h6">Trocar senha</Typography>

        <Field.Text
          name="senhaAtual"
          type={mostrar.value ? 'text' : 'password'}
          label="Senha atual"
          InputProps={{ endAdornment: adornment }}
        />

        <Field.Text
          name="novaSenha"
          type={mostrar.value ? 'text' : 'password'}
          label="Nova senha"
          helperText={
            <Stack component="span" direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="eva:info-fill" width={16} /> Mínimo de 8 caracteres.
            </Stack>
          }
          InputProps={{ endAdornment: adornment }}
        />

        <Field.Text
          name="confirmarSenha"
          type={mostrar.value ? 'text' : 'password'}
          label="Confirmar nova senha"
          InputProps={{ endAdornment: adornment }}
        />

        <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
          Salvar nova senha
        </LoadingButton>
      </Card>
    </Form>
  );
}
