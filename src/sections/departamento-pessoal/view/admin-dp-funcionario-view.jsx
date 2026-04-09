'use client';

import { toast } from 'sonner';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { formatCPF } from 'src/utils/format-number';

import {
  useAdminFuncionario,
  adminAprovarCadastro,
  adminDemissaoAprovar,
  adminReprovarCadastro,
  adminDemissaoRejeitar,
  adminDemissaoEmAnalise,
} from 'src/actions/departamento-pessoal';

import { ChipStatusVinculo, ChipStatusCadastro, ChipStatusDemissao } from '../dp-shared';

// ----------------------------------------------------------------------

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

  const clienteId = f?.clienteId;

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

  if (isLoading || !f) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  const dem = f.demissao?.status;
  const podeDemissaoAdmin = dem === 'solicitada' || dem === 'em_analise';

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4">{f.nome}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            <ChipStatusCadastro status={f.statusCadastro} />
            <ChipStatusVinculo status={f.statusVinculo} />
            <ChipStatusDemissao status={f.demissao?.status} />
          </Stack>
        </Box>
        {clienteId && (
          <Button component={RouterLink} href={paths.dashboard.cliente.departamentoPessoal(clienteId)} variant="outlined">
            Lista do cliente
          </Button>
        )}
      </Stack>

      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Dados
        </Typography>
        <Typography variant="body2">CPF: {formatCPF(f.cpf || '')}</Typography>
        {f.email && <Typography variant="body2">E-mail: {f.email}</Typography>}
        {f.cargo && <Typography variant="body2">Cargo: {f.cargo}</Typography>}
        {f.dataAdmissao && <Typography variant="body2">Admissão: {fDate(f.dataAdmissao)}</Typography>}
        {f.observacoes && <Typography variant="body2">Obs.: {f.observacoes}</Typography>}
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
