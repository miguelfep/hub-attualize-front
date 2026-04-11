'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import { onlyDigits, validateCPF } from 'src/utils/format-number';

import {
  portalCreateFuncionario,
  revalidatePortalFuncionariosByCliente,
} from 'src/actions/departamento-pessoal';

import { Form, Field } from 'src/components/hook-form';

import { useDpPortalContext } from '../dp-shared';

// ----------------------------------------------------------------------

const codigoFolhaField = zod
  .string()
  .optional()
  .refine((s) => !s?.trim() || /^\d{1,12}$/.test(s.trim()), { message: 'Código folha: apenas números inteiros' })
  .transform((s) => {
    const t = s?.trim();
    return t ? Number.parseInt(t, 10) : undefined;
  });

const schema = zod.object({
  nome: zod.string().min(3, 'Informe o nome'),
  cpf: zod.string().refine((v) => validateCPF(v), { message: 'CPF inválido' }),
  email: zod.string().email('E-mail inválido').optional().or(zod.literal('')),
  cargo: zod.string().optional(),
  codigoFolha: codigoFolhaField,
  dataAdmissao: zod.string().optional(),
  observacoes: zod.string().optional(),
});

function errMsg(err) {
  if (typeof err === 'string') return err;
  return err?.message || 'Erro ao salvar';
}

export function PortalDpNovoView() {
  const router = useRouter();
  const { enabled, loadingEmpresas, clienteProprietarioId } = useDpPortalContext();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      cpf: '',
      email: '',
      cargo: '',
      codigoFolha: '',
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
    if (!clienteProprietarioId) return;
    try {
      await portalCreateFuncionario(clienteProprietarioId, {
        nome: data.nome.trim(),
        cpf: onlyDigits(data.cpf),
        email: data.email?.trim() || undefined,
        cargo: data.cargo?.trim() || undefined,
        ...(data.codigoFolha !== undefined ? { codigoFolha: data.codigoFolha } : {}),
        dataAdmissao: data.dataAdmissao || undefined,
        observacoes: data.observacoes?.trim() || undefined,
      });
      await revalidatePortalFuncionariosByCliente(clienteProprietarioId);
      toast.success('Funcionário cadastrado e enviado para aprovação.');
      router.push(paths.cliente.departamentoPessoal.root);
    } catch (err) {
      const msg = errMsg(err);
      if (String(msg).toLowerCase().includes('cpf') || err?.status === 409) {
        setError('cpf', { message: msg });
      }
      toast.error(msg);
    }
  });

  if (loadingEmpresas || !clienteProprietarioId) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  if (!enabled) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        O módulo não está habilitado para esta empresa.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Novo funcionário
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Após o envio, o cadastro ficará pendente de aprovação do escritório.
      </Typography>

      <Card sx={{ p: 3, maxWidth: 720 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            <Field.Text name="nome" label="Nome completo" />
            <Field.Text name="cpf" label="CPF" placeholder="000.000.000-00" />
            <Field.Text name="email" label="E-mail" />
            <Field.Text name="cargo" label="Cargo" />
            <Field.Text
              name="codigoFolha"
              label="Código folha"
              placeholder="Ex.: 42"
              helperText="Opcional. Matrícula ou código no sistema de folha de pagamento (inteiro)."
              inputProps={{ inputMode: 'numeric', maxLength: 12 }}
            />
            <Field.Text name="dataAdmissao" label="Data de admissão" type="date" InputLabelProps={{ shrink: true }} />
            <Field.Text name="observacoes" label="Observações" multiline rows={3} />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => router.back()}>
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
