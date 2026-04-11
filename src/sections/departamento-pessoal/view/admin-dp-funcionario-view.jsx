'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { formatCPF, onlyDigits, validateCPF } from 'src/utils/format-number';

import {
  useAdminFuncionario,
  adminAprovarCadastro,
  adminDemissaoAprovar,
  adminReprovarCadastro,
  adminDemissaoRejeitar,
  adminDemissaoEmAnalise,
  portalUpdateFuncionario,
  revalidatePortalFuncionariosByCliente,
} from 'src/actions/departamento-pessoal';

import { Form, Field } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ChipStatusVinculo, ChipStatusCadastro, ChipStatusDemissao } from '../dp-shared';

// ----------------------------------------------------------------------

const codigoFolhaStringSchema = zod
  .string()
  .optional()
  .refine((s) => !s?.trim() || /^\d{1,12}$/.test(s.trim()), {
    message: 'Código folha: apenas números inteiros (até 12 dígitos)',
  });

const editSchema = zod.object({
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
  return err?.message || 'Erro';
}

export function AdminDpFuncionarioView({ funcionarioId }) {
  const { data: f, isLoading, mutate } = useAdminFuncionario(funcionarioId);
  const [openReprovar, setOpenReprovar] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [obsInterna, setObsInterna] = useState('');
  const [pending, setPending] = useState(null);

  const clienteId = f?.clienteId ?? f?.cliente_id;

  const methods = useForm({
    resolver: zodResolver(editSchema),
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

  const { reset, handleSubmit, setError, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (!f) return;
    reset({
      nome: f.nome || '',
      cpf: f.cpf ? formatCPF(f.cpf) : '',
      codigoFolha: f.codigoFolha != null && f.codigoFolha !== '' ? String(f.codigoFolha) : '',
      email: f.email || '',
      cargo: f.cargo || '',
      dataAdmissao: f.dataAdmissao ? String(f.dataAdmissao).slice(0, 10) : '',
      observacoes: f.observacoes || '',
    });
  }, [f, reset]);

  const run = async (label, fn) => {
    setPending(label);
    try {
      const next = await fn();
      toast.success('Atualizado.');
      mutate(next, false);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setPending(null);
    }
  };

  const onSaveDados = handleSubmit(async (data) => {
    if (!clienteId) {
      toast.error('Não foi possível identificar o cliente deste funcionário.');
      return;
    }
    try {
      const codigoStr = (data.codigoFolha ?? '').trim();
      const codigoNum = codigoStr === '' ? null : Number.parseInt(codigoStr, 10);
      if (codigoStr !== '' && Number.isNaN(codigoNum)) {
        setError('codigoFolha', { message: 'Código folha inválido' });
        return;
      }
      const updated = await portalUpdateFuncionario(clienteId, funcionarioId, {
        nome: data.nome.trim(),
        cpf: onlyDigits(data.cpf),
        email: data.email?.trim() || undefined,
        cargo: data.cargo?.trim() || undefined,
        codigoFolha: codigoNum,
        dataAdmissao: data.dataAdmissao || undefined,
        observacoes: data.observacoes?.trim() || undefined,
      });
      await revalidatePortalFuncionariosByCliente(clienteId);
      toast.success('Dados do funcionário salvos.');
      mutate(updated, false);
    } catch (err) {
      const msg = errMsg(err);
      if (String(msg).toLowerCase().includes('cpf') || err?.status === 409) {
        setError('cpf', { message: msg });
      }
      toast.error(msg);
    }
  });

  if (isLoading || !f) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  const dem = f.demissao?.status;
  const podeDemissaoAdmin = dem === 'solicitada' || dem === 'em_analise';

  const listHref = clienteId
    ? paths.dashboard.cliente.departamentoPessoal(clienteId)
    : paths.dashboard.cliente.departamentoPessoalHub;

  return (
    <Box>
      <CustomBreadcrumbs
        heading={f.nome || 'Funcionário'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Funcionários', href: listHref },
          { name: f.nome || 'Detalhe' },
        ]}
        action={
          <Button component={RouterLink} href={listHref} variant="outlined" size="small">
            Voltar à lista
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <ChipStatusCadastro status={f.statusCadastro} />
        <ChipStatusVinculo status={f.statusVinculo} />
        <ChipStatusDemissao status={f.demissao?.status} />
      </Stack>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={700}>
          Dados do colaborador
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Altere os campos e use <strong>Salvar dados</strong>. Criado em {fDate(f.createdAt)} · Atualizado em{' '}
          {fDate(f.updatedAt)}
        </Typography>
        {!clienteId && (
          <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
            Sem identificador do cliente na resposta da API — não é possível gravar alterações por esta tela.
          </Typography>
        )}
        <Form methods={methods} onSubmit={onSaveDados}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Field.Text name="nome" label="Nome completo" required disabled={!clienteId} />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text name="cpf" label="CPF" placeholder="000.000.000-00" required disabled={!clienteId} />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text
                name="codigoFolha"
                label="Código da folha"
                placeholder="Ex.: 42"
                helperText="Opcional. Deixe em branco para remover o código, se a API permitir."
                inputProps={{ inputMode: 'numeric', maxLength: 12 }}
                disabled={!clienteId}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text name="email" label="E-mail" type="email" disabled={!clienteId} />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text name="cargo" label="Cargo" disabled={!clienteId} />
            </Grid>
            <Grid xs={12} md={6}>
              <Field.Text
                name="dataAdmissao"
                label="Data de admissão"
                type="date"
                InputLabelProps={{ shrink: true }}
                disabled={!clienteId}
              />
            </Grid>
            <Grid xs={12}>
              <Field.Text name="observacoes" label="Observações" multiline rows={3} disabled={!clienteId} />
            </Grid>
            <Grid xs={12}>
              <Divider sx={{ my: 1 }} />
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={!clienteId}
                size="large"
              >
                Salvar dados
              </LoadingButton>
            </Grid>
          </Grid>
        </Form>
      </Card>

      {f.statusCadastro === 'pendente_aprovacao' && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Aprovação de cadastro
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <LoadingButton
              variant="contained"
              color="success"
              loading={pending === 'aprovar'}
              onClick={() => run('aprovar', () => adminAprovarCadastro(funcionarioId))}
            >
              Aprovar cadastro
            </LoadingButton>
            <LoadingButton variant="outlined" color="error" onClick={() => setOpenReprovar(true)}>
              Reprovar cadastro
            </LoadingButton>
          </Stack>
        </Card>
      )}

      {f.statusCadastro === 'reprovado' && f.motivoReprovacao && (
        <Card sx={{ p: 2, mb: 2, bgcolor: 'error.lighter' }}>
          <Typography variant="subtitle2">Motivo da reprovação</Typography>
          <Typography variant="body2">{f.motivoReprovacao}</Typography>
        </Card>
      )}

      {(dem === 'solicitada' || dem === 'em_analise' || dem === 'aprovada' || dem === 'rejeitada') && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Demissão
          </Typography>
          {f.demissao?.motivo && <Typography variant="body2">Motivo: {f.demissao.motivo}</Typography>}
          {f.demissao?.dataPrevistaDesligamento && (
            <Typography variant="body2">Previsão: {fDate(f.demissao.dataPrevistaDesligamento)}</Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <TextField
            label="Observação interna (opcional)"
            fullWidth
            multiline
            rows={2}
            value={obsInterna}
            onChange={(e) => setObsInterna(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
            {dem === 'solicitada' && (
              <LoadingButton
                variant="outlined"
                loading={pending === 'analise'}
                onClick={() => run('analise', () => adminDemissaoEmAnalise(funcionarioId))}
              >
                Colocar em análise
              </LoadingButton>
            )}
            {podeDemissaoAdmin && (
              <>
                <LoadingButton
                  variant="contained"
                  color="success"
                  loading={pending === 'aprovDem'}
                  onClick={() =>
                    run('aprovDem', () =>
                      adminDemissaoAprovar(funcionarioId, obsInterna ? { observacaoInterna: obsInterna } : {})
                    )
                  }
                >
                  Aprovar demissão (inativa vínculo)
                </LoadingButton>
                <LoadingButton
                  variant="outlined"
                  color="warning"
                  loading={pending === 'rejDem'}
                  onClick={() =>
                    run('rejDem', () =>
                      adminDemissaoRejeitar(funcionarioId, obsInterna ? { observacaoInterna: obsInterna } : {})
                    )
                  }
                >
                  Rejeitar solicitação
                </LoadingButton>
              </>
            )}
          </Stack>
        </Card>
      )}

      <Dialog open={openReprovar} onClose={() => setOpenReprovar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reprovar cadastro</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo (obrigatório)"
            fullWidth
            multiline
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReprovar(false)}>Cancelar</Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={pending === 'reprovar'}
            disabled={motivo.trim().length < 3}
            onClick={async () => {
              setPending('reprovar');
              try {
                const next = await adminReprovarCadastro(funcionarioId, { motivo: motivo.trim() });
                toast.success('Cadastro reprovado.');
                mutate(next, false);
                setOpenReprovar(false);
                setMotivo('');
              } catch (err) {
                toast.error(errMsg(err));
              } finally {
                setPending(null);
              }
            }}
          >
            Confirmar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
