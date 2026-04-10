'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { formatCPF, onlyDigits, validateCPF } from 'src/utils/format-number';

import { usePortalFuncionario, portalUpdateFuncionario } from 'src/actions/departamento-pessoal';

import { Form, Field } from 'src/components/hook-form';

import {
  ChipStatusVinculo,
  ChipStatusCadastro,
  ChipStatusDemissao,
  useDpPortalContext,
} from '../dp-shared';

// ----------------------------------------------------------------------

const codigoFolhaField = zod
  .string()
  .optional()
  .refine((s) => !s?.trim() || /^\d{1,12}$/.test(s.trim()), { message: 'Código folha: apenas números inteiros' })
  .transform((s) => {
    const t = s?.trim();
    return t ? Number.parseInt(t, 10) : undefined;
  });

const editSchema = zod.object({
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
  return err?.message || 'Erro';
}

export function PortalDpDetalheView({ funcionarioId }) {
  const { enabled, loadingEmpresas, clienteProprietarioId } = useDpPortalContext();
  const { data: f, isLoading, mutate } = usePortalFuncionario(clienteProprietarioId, funcionarioId);

  const pendente = f?.statusCadastro === 'pendente_aprovacao';

  const methods = useForm({
    resolver: zodResolver(editSchema),
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

  const { reset, handleSubmit, setError, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (!f) return;
    reset({
      nome: f.nome || '',
      cpf: f.cpf ? formatCPF(f.cpf) : '',
      email: f.email || '',
      cargo: f.cargo || '',
      codigoFolha: f.codigoFolha != null && f.codigoFolha !== '' ? String(f.codigoFolha) : '',
      dataAdmissao: f.dataAdmissao ? String(f.dataAdmissao).slice(0, 10) : '',
      observacoes: f.observacoes || '',
    });
  }, [f, reset]);

  const onSave = handleSubmit(async (data) => {
    if (!clienteProprietarioId || !funcionarioId) return;
    try {
      const updated = await portalUpdateFuncionario(clienteProprietarioId, funcionarioId, {
        nome: data.nome.trim(),
        cpf: onlyDigits(data.cpf),
        email: data.email?.trim() || undefined,
        cargo: data.cargo?.trim() || undefined,
        codigoFolha: data.codigoFolha === undefined ? null : data.codigoFolha,
        dataAdmissao: data.dataAdmissao || undefined,
        observacoes: data.observacoes?.trim() || undefined,
      });
      toast.success('Dados atualizados.');
      mutate(updated, false);
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

  if (isLoading || !f) {
    return <Typography sx={{ p: 2 }}>Carregando funcionário…</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            {f.nome}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            <ChipStatusCadastro status={f.statusCadastro} />
            <ChipStatusVinculo status={f.statusVinculo} />
            <ChipStatusDemissao status={f.demissao?.status} />
          </Stack>
        </Box>
        <Button component={RouterLink} href={paths.cliente.departamentoPessoal.root} variant="outlined">
          Voltar à lista
        </Button>
      </Stack>

      {f.statusCadastro === 'reprovado' && f.motivoReprovacao && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Motivo da reprovação:</strong> {f.motivoReprovacao}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mb: 2 }}>
        {f.statusCadastro === 'aprovado' && f.statusVinculo === 'ativo' && (
          <>
            <Button
              component={RouterLink}
              href={paths.cliente.departamentoPessoal.apontamentosLancar({ funcionario: funcionarioId })}
              variant="contained"
              color="primary"
            >
              Lançar apontamentos
            </Button>
            {f.demissao?.status !== 'solicitada' && f.demissao?.status !== 'em_analise' && (
              <Button
                component={RouterLink}
                href={paths.cliente.departamentoPessoal.demissao(funcionarioId)}
                variant="outlined"
                color="warning"
              >
                Solicitar demissão
              </Button>
            )}
          </>
        )}
      </Stack>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dados
        </Typography>
        {!pendente && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>CPF:</strong> {formatCPF(f.cpf || '')}
            </Typography>
            {f.email && (
              <Typography variant="body2">
                <strong>E-mail:</strong> {f.email}
              </Typography>
            )}
            {f.cargo && (
              <Typography variant="body2">
                <strong>Cargo:</strong> {f.cargo}
              </Typography>
            )}
            <TextField
              label="Código folha"
              value={f.codigoFolha != null && f.codigoFolha !== '' ? String(f.codigoFolha) : ''}
              disabled
              size="small"
              placeholder="—"
              sx={{ maxWidth: 400 }}
              helperText="Só é possível alterar pelo portal enquanto o cadastro estiver pendente de aprovação."
            />
            {f.dataAdmissao && (
              <Typography variant="body2">
                <strong>Admissão:</strong> {fDate(f.dataAdmissao)}
              </Typography>
            )}
            {f.observacoes && (
              <Typography variant="body2">
                <strong>Observações:</strong> {f.observacoes}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Criado em {fDate(f.createdAt)} · Atualizado em {fDate(f.updatedAt)}
            </Typography>
          </Stack>
        )}

        {pendente && (
          <Form methods={methods} onSubmit={onSave}>
            <Stack spacing={2} sx={{ maxWidth: 640 }}>
              <Field.Text name="nome" label="Nome completo" />
              <Field.Text name="cpf" label="CPF" />
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
              <Divider sx={{ my: 1 }} />
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Salvar alterações
              </LoadingButton>
            </Stack>
          </Form>
        )}
      </Card>
    </Box>
  );
}
