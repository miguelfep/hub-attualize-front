'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { onlyDigits, validateCPF } from 'src/utils/format-number';

import { getClienteById } from 'src/actions/clientes';
import {
  portalCreateFuncionario,
  revalidateAdminFuncionariosByCliente,
} from 'src/actions/departamento-pessoal';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

/** Valida string do form; conversão para número só no submit (evita perda de valor com resolver + RHF). */
const codigoFolhaStringSchema = zod
  .string()
  .optional()
  .refine((s) => !s?.trim() || /^\d{1,12}$/.test(s.trim()), {
    message: 'Código folha: apenas números inteiros (até 12 dígitos)',
  });

const schema = zod.object({
  nome: zod.string().min(3, 'Informe o nome'),
  cpf: zod.string().refine((v) => validateCPF(v), { message: 'CPF inválido' }),
  codigoFolha: codigoFolhaStringSchema,
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
  const theme = useTheme();
  const router = useRouter();
  const [clienteRazaoSocial, setClienteRazaoSocial] = useState('');

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      cpf: '',
      codigoFolha: '',
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

  useEffect(() => {
    let cancelled = false;
    if (!clienteId) {
      setClienteRazaoSocial('');
    } else {
      (async () => {
        try {
          const data = await getClienteById(clienteId);
          const rs = (data?.razaoSocial || '').trim();
          if (!cancelled) setClienteRazaoSocial(rs);
        } catch {
          if (!cancelled) setClienteRazaoSocial('');
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [clienteId]);

  const onSubmit = handleSubmit(async (data) => {
    if (!clienteId) return;
    try {
      const codigoStr = (data.codigoFolha ?? '').trim();
      const codigoNum = codigoStr === '' ? undefined : Number.parseInt(codigoStr, 10);
      await portalCreateFuncionario(clienteId, {
        nome: data.nome.trim(),
        cpf: onlyDigits(data.cpf),
        email: data.email?.trim() || undefined,
        cargo: data.cargo?.trim() || undefined,
        dataAdmissao: data.dataAdmissao || undefined,
        observacoes: data.observacoes?.trim() || undefined,
        ...(codigoNum !== undefined && !Number.isNaN(codigoNum) ? { codigoFolha: codigoNum } : {}),
      });
      await revalidateAdminFuncionariosByCliente(clienteId);
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

  const listHref = paths.dashboard.cliente.departamentoPessoal(clienteId);

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5} useFlexGap sx={{ mb: 0.5 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Novo funcionário
            </Typography>
            {clienteRazaoSocial ? (
              <Chip
                label={clienteRazaoSocial}
                color="primary"
                variant="soft"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  py: 0.5,
                  '& .MuiChip-label': { whiteSpace: 'normal' },
                }}
              />
            ) : null}
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Cadastro vinculado a este cliente. Já nesta tela você informa o{' '}
            <strong>código da folha</strong> (matrícula no sistema de folha), se houver. Após salvar, o registro poderá
            seguir fila de aprovação de cadastro.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
          <Button component={RouterLink} href={listHref} variant="outlined" color="inherit">
            Voltar à lista
          </Button>
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <Field.Text name="nome" label="Nome completo" required />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text name="cpf" label="CPF" placeholder="000.000.000-00" required />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text
                name="codigoFolha"
                label="Código da folha"
                placeholder="Ex.: 42"
                helperText="Opcional. Informe já no cadastro a matrícula/código no sistema de folha (somente números)."
                inputProps={{ inputMode: 'numeric', maxLength: 12 }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text name="email" label="E-mail" type="email" />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text name="cargo" label="Cargo" />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text
                name="dataAdmissao"
                label="Data de admissão"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid xs={12}>
              <Field.Text name="observacoes" label="Observações" multiline rows={3} />
            </Grid>
            <Grid xs={12}>
              <Divider />
              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={1.5}
                justifyContent="flex-end"
                sx={{ pt: 3 }}
              >
                <Button variant="outlined" color="inherit" onClick={() => router.push(listHref)} size="large">
                  Cancelar
                </Button>
                <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                  Salvar funcionário
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </Form>
      </CardContent>
    </Card>
  );
}
