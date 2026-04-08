'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import { onlyDigits, validateCPF } from 'src/utils/format-number';

import { portalCreateFuncionario } from 'src/actions/departamento-pessoal';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const schema = zod.object({
  nome: zod.string().min(3, 'Informe o nome'),
  cpf: zod.string().refine((v) => validateCPF(v), { message: 'CPF inválido' }),
  email: zod.string().email('E-mail inválido').optional().or(zod.literal('')),
  cargo: zod.string().optional(),
  dataAdmissao: zod.string().optional(),
  observacoes: zod.string().optional(),
});

function errMsg(err) {
  if (typeof err === 'string') return err;
  return err?.message || 'Erro ao salvar';
}

export function AdminDpNovoView({ clienteId }) {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      cpf: '',
      email: '',
      cargo: '',
      dataAdmissao: '',
      observacoes: '',
    },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (!clienteId) return;
    try {
      await portalCreateFuncionario(clienteId, {
        nome: data.nome.trim(),
        cpf: onlyDigits(data.cpf),
        email: data.email?.trim() || undefined,
        cargo: data.cargo?.trim() || undefined,
        dataAdmissao: data.dataAdmissao || undefined,
        observacoes: data.observacoes?.trim() || undefined,
      });
      toast.success('Funcionário cadastrado. Seguirá o fluxo de aprovação quando aplicável.');
      router.push(paths.dashboard.cliente.departamentoPessoal(clienteId));
    } catch (err) {
      const msg = errMsg(err);
      if (String(msg).toLowerCase().includes('cpf') || err?.status === 409) {
        setError('cpf', { message: msg });
      }
      toast.error(msg);
    }
  });

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Novo funcionário
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cadastro vinculado a este cliente. A API usa o mesmo endpoint do portal; usuários internos podem registrar
        mesmo sem o toggle do portal, conforme regra do backend.
      </Typography>

      <Card sx={{ p: 3, maxWidth: 720 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            <Field.Text name="nome" label="Nome completo" />
            <Field.Text name="cpf" label="CPF" placeholder="000.000.000-00" />
            <Field.Text name="email" label="E-mail" />
            <Field.Text name="cargo" label="Cargo" />
            <Field.Text name="dataAdmissao" label="Data de admissão" type="date" InputLabelProps={{ shrink: true }} />
            <Field.Text name="observacoes" label="Observações" multiline rows={3} />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => router.push(paths.dashboard.cliente.departamentoPessoal(clienteId))}>
                Cancelar
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Salvar
              </LoadingButton>
            </Stack>
          </Stack>
        </Form>
      </Card>
    </Box>
  );
}
