import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import {
  useGetApuracao,
  revisarApuracao,
  simularApuracao,
  transmitirApuracao,
} from 'src/actions/fator-r';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import {
  apiErrMsg,
  anexoLabel,
  statusApuracaoColor,
  statusApuracaoLabel,
} from '../utils';

/** Transmitir é irreversível — mesmo conjunto restrito que o backend aplica. */
const ROLES_TRANSMISSAO = ['admin', 'gerencial', 'financeiro'];

const PASSOS = ['Montar', 'Simular', 'Aprovar', 'Transmitir'];

function passoAtual(apuracao) {
  if (!apuracao) return 0;
  if (apuracao.status === 'transmitida') return 4;
  if (apuracao.status === 'revisada') return 3;
  if (apuracao.simuladoEm) return 2;
  return 1;
}

export function FatorRApuracao({ clienteId, ano, mes }) {
  const { user } = useAuthContext();
  const podeTransmitir = ROLES_TRANSMISSAO.includes(user?.role);

  const [idAtividade, setIdAtividade] = useState('');
  const { apuracao, apuracaoLoading, refetchApuracao } = useGetApuracao(clienteId, ano, mes, {
    idAtividade: idAtividade || undefined,
  });

  const [carregando, setCarregando] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const executar = useCallback(
    async (acao, fn, mensagem) => {
      setCarregando(acao);
      try {
        await fn();
        toast.success(mensagem);
        refetchApuracao();
      } catch (error) {
        toast.error(apiErrMsg(error, 'Falha na operação'));
      } finally {
        setCarregando(null);
      }
    },
    [refetchApuracao]
  );

  if (apuracaoLoading) {
    return (
      <Card>
        <CardHeader title="Apuração do Simples Nacional" />
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={220} />
        </Box>
      </Card>
    );
  }

  const pendencias = apuracao?.pendencias ?? [];
  const temPendencia = pendencias.length > 0;
  const simulada = !!apuracao?.simuladoEm;
  const transmitida = apuracao?.status === 'transmitida';

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Apuração do Simples Nacional (PGDAS-D)"
          subheader="Montar, simular na Receita, aprovar e só então transmitir"
          action={
            apuracao && (
              <Label variant="soft" color={statusApuracaoColor(apuracao.status)}>
                {statusApuracaoLabel(apuracao.status)}
              </Label>
            )
          }
        />

        <Box sx={{ px: 3, pt: 3 }}>
          <Stepper activeStep={passoAtual(apuracao)} alternativeLabel>
            {PASSOS.map((passo) => (
              <Step key={passo}>
                <StepLabel>{passo}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Stack spacing={2.5} sx={{ p: 3 }}>
          {temPendencia && (
            <Alert severity="warning">
              <AlertTitle>Pendências bloqueiam a apuração</AlertTitle>
              <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                {pendencias.map((p) => (
                  <li key={p}>
                    <Typography variant="body2">{p}</Typography>
                  </li>
                ))}
              </Stack>
            </Alert>
          )}

          {!transmitida && (
            <TextField
              label="Código da atividade no PGDAS-D (idAtividade)"
              value={idAtividade}
              onChange={(e) => setIdAtividade(e.target.value)}
              helperText="Obrigatório para montar a declaração. A montagem cobre um estabelecimento e uma atividade."
              sx={{ maxWidth: 420 }}
            />
          )}

          {apuracao && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Dado titulo="Receita interna" valor={fCurrency(apuracao.receitaInterna)} />
              <Dado titulo="Mercado externo" valor={fCurrency(apuracao.receitaExterna)} />
              <Dado titulo="Anexo aplicável" valor={anexoLabel(apuracao.anexoAplicavel)} />
            </Stack>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <LoadingButton
              variant="outlined"
              loading={carregando === 'montar'}
              startIcon={<Iconify icon="eva:refresh-fill" />}
              onClick={() => executar('montar', async () => refetchApuracao(), 'Apuração remontada')}
            >
              Remontar
            </LoadingButton>

            <LoadingButton
              variant="outlined"
              disabled={temPendencia || transmitida}
              loading={carregando === 'simular'}
              startIcon={<Iconify icon="solar:calculator-bold" />}
              onClick={() =>
                executar(
                  'simular',
                  () => simularApuracao(clienteId, ano, mes),
                  'Simulação concluída — os valores vieram da Receita, sem transmitir'
                )
              }
            >
              Simular na Receita
            </LoadingButton>

            <LoadingButton
              variant="contained"
              color="info"
              disabled={temPendencia || !simulada || apuracao?.status !== 'rascunho'}
              loading={carregando === 'revisar'}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              onClick={() =>
                executar(
                  'revisar',
                  () => revisarApuracao(clienteId, ano, mes),
                  'Apuração aprovada'
                )
              }
            >
              Aprovar
            </LoadingButton>

            <LoadingButton
              variant="contained"
              color="error"
              disabled={apuracao?.status !== 'revisada' || !podeTransmitir}
              startIcon={<Iconify icon="solar:upload-bold" />}
              onClick={() => setConfirmando(true)}
            >
              Transmitir
            </LoadingButton>
          </Stack>

          {!podeTransmitir && apuracao?.status === 'revisada' && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Seu perfil não permite transmitir. Peça a um usuário admin, gerencial ou financeiro.
            </Typography>
          )}

          {apuracao?.status === 'erro' && (
            <Alert severity="error">
              <AlertTitle>A transmissão falhou</AlertTitle>
              {apuracao.mensagemErro}
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                A aprovação foi preservada — corrija o que for necessário e transmita novamente.
              </Typography>
            </Alert>
          )}

          {transmitida && (
            <Alert severity="success">
              <AlertTitle>Declaração transmitida</AlertTitle>
              Declaração {apuracao.idDeclaracao} em {fDateTime(apuracao.transmitidoEm)}. Este
              período está fechado e não pode mais ser alterado por aqui.
            </Alert>
          )}
        </Stack>
      </Card>

      {simulada && !!apuracao?.valoresDevidos?.length && (
        <Card>
          <CardHeader
            title="Valores apurados pela Receita"
            subheader="É este conjunto que será reenviado na transmissão; divergência de um centavo bloqueia o envio"
          />
          <TableContainer>
            <Table size="small">
              <TableBody>
                {apuracao.valoresDevidos.map((v) => (
                  <TableRow key={v.codigoTributo}>
                    <TableCell>Tributo {v.codigoTributo}</TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">{fCurrency(v.valor)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2">Total</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1">
                      {fCurrency(
                        apuracao.valoresDevidos.reduce((soma, v) => soma + (v.valor || 0), 0)
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          {apuracao.revisadoEm && (
            <Box sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Aprovado em {fDateTime(apuracao.revisadoEm)}.
              </Typography>
            </Box>
          )}
        </Card>
      )}

      <Dialog open={confirmando} onClose={() => setConfirmando(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Transmitir declaração?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            A transmissão é irreversível. Retificar depois é um processo manual na Receita.
          </Alert>
          <Typography variant="body2">
            Serão transmitidos os valores aprovados, totalizando{' '}
            <strong>
              {fCurrency(
                (apuracao?.valoresDevidos ?? []).reduce((soma, v) => soma + (v.valor || 0), 0)
              )}
            </strong>
            .
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={carregando === 'transmitir'}
            onClick={async () => {
              await executar(
                'transmitir',
                () => transmitirApuracao(clienteId, ano, mes),
                'Declaração transmitida'
              );
              setConfirmando(false);
            }}
          >
            Transmitir
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function Dado({ titulo, valor }) {
  return (
    <Stack spacing={0.5} sx={{ flex: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {titulo}
      </Typography>
      <Typography variant="h6">{valor}</Typography>
    </Stack>
  );
}
