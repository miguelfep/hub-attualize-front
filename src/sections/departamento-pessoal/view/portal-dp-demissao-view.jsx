'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { usePortalFuncionario, portalSolicitarDemissao } from 'src/actions/departamento-pessoal';

import { Form, Field } from 'src/components/hook-form';

import { useDpPortalContext } from '../dp-shared';

// ----------------------------------------------------------------------

const schema = zod.object({
  motivo: zod.string().min(5, 'Descreva o motivo'),
  dataPrevistaDesligamento: zod.string().optional(),
});

function errMsg(err) {
  if (typeof err === 'string') return err;
  return err?.message || 'Erro';
}

export function PortalDpDemissaoView({ funcionarioId }) {
  const { enabled, loadingEmpresas, clienteProprietarioId } = useDpPortalContext();
  const { data: f, isLoading } = usePortalFuncionario(clienteProprietarioId, funcionarioId);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { motivo: '', dataPrevistaDesligamento: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (!clienteProprietarioId) return;
    try {
      await portalSolicitarDemissao(clienteProprietarioId, funcionarioId, {
        motivo: data.motivo.trim(),
        dataPrevistaDesligamento: data.dataPrevistaDesligamento || undefined,
      });
      toast.success('Solicitação de demissão enviada.');
      window.location.href = paths.cliente.departamentoPessoal.details(funcionarioId);
    } catch (err) {
      toast.error(errMsg(err));
    }
  });

  if (loadingEmpresas || !clienteProprietarioId) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  if (!enabled) {
    return <Alert severity="info">Módulo não habilitado.</Alert>;
  }

  if (isLoading || !f) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  const pode =
    f.statusCadastro === 'aprovado' &&
    f.statusVinculo === 'ativo' &&
    f.demissao?.status !== 'solicitada' &&
    f.demissao?.status !== 'em_analise';

  if (!pode) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Não é possível solicitar demissão neste momento (cadastro deve estar aprovado, vínculo ativo e sem
        solicitação em aberto).
        <Button component={RouterLink} href={paths.cliente.departamentoPessoal.details(funcionarioId)} sx={{ mt: 1 }}>
          Voltar
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Solicitar demissão — {f.nome}
      </Typography>
      <Button component={RouterLink} href={paths.cliente.departamentoPessoal.details(funcionarioId)} variant="outlined" sx={{ mb: 3 }}>
        Cancelar
      </Button>

      <Card sx={{ p: 3, maxWidth: 560 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2}>
            <Field.Text name="motivo" label="Motivo" multiline rows={4} />
            <Field.Text
              name="dataPrevistaDesligamento"
              label="Data prevista de desligamento"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <LoadingButton type="submit" variant="contained" color="warning" loading={isSubmitting}>
              Enviar solicitação
            </LoadingButton>
          </Stack>
        </Form>
      </Card>
    </Box>
  );
}
