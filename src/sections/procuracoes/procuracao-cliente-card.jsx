'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fDate, fDateTime } from 'src/utils/format-time';

import { consultarProcuracao, useGetProcuracaoCliente } from 'src/actions/procuracoes';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

const apiErrMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

/**
 * Procuração eletrônica do cliente. Responde "podemos agir em nome dele?",
 * pré-condição de qualquer transmissão ao Fisco.
 *
 * A consulta é explícita (botão) porque é chamada externa cobrada — o card
 * mostra o último resultado salvo até alguém pedir uma nova.
 */
export function ProcuracaoClienteCard({ clienteId }) {
  const { procuracao, procuracaoLoading, refetchProcuracao } = useGetProcuracaoCliente(clienteId);
  const [consultando, setConsultando] = useState(false);

  const handleConsultar = async () => {
    setConsultando(true);
    try {
      const res = await consultarProcuracao(clienteId);
      const qtd = res?.procuracao?.procuracoes?.length ?? 0;
      if (res?.procuracao?.vigente) {
        toast.success(`Procuração vigente encontrada (${qtd} registro(s)).`);
      } else {
        toast.warning(
          qtd
            ? 'Procurações encontradas, mas todas expiradas.'
            : 'Nenhuma procuração encontrada para este cliente.'
        );
      }
      refetchProcuracao();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Falha ao consultar procuração na Serpro'));
    } finally {
      setConsultando(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Procuração eletrônica (e-CAC)"
        subheader="Necessária para transmitir declarações em nome do cliente"
        action={
          <LoadingButton
            size="small"
            variant="contained"
            loading={consultando}
            startIcon={<Iconify icon="eva:search-fill" />}
            onClick={handleConsultar}
          >
            Consultar na Receita
          </LoadingButton>
        }
      />

      <Stack spacing={2} sx={{ p: 3 }}>
        {procuracaoLoading && <Skeleton variant="rectangular" height={90} />}

        {!procuracaoLoading && !procuracao && (
          <Alert severity="info">
            Este cliente ainda não foi consultado. Use o botão acima para verificar na Receita.
          </Alert>
        )}

        {!procuracaoLoading && procuracao && (
          <>
            <Stack direction="row" spacing={2} alignItems="center">
              <Label variant="soft" color={procuracao.vigente ? 'success' : 'error'}>
                {procuracao.vigente ? 'Procuração vigente' : 'Sem procuração vigente'}
              </Label>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Consultado em {fDateTime(procuracao.consultadoEm)}
              </Typography>
            </Stack>

            {!procuracao.vigente && (
              <Alert severity="warning">
                Sem procuração vigente a Receita recusa a transmissão, por mais correta que a
                declaração esteja. Conceder procuração é ato manual no e-CAC — não há como fazer
                por aqui.
              </Alert>
            )}

            {procuracao.procuracoes?.length > 0 && (
              <Stack spacing={2} divider={<Divider flexItem />}>
                {procuracao.procuracoes.map((p, index) => (
                  <Box key={`${p.dtExpiracao}-${index}`}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">
                        Expira em {p.expiraEm ? fDate(p.expiraEm) : p.dtExpiracao}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {p.nrSistemas} sistema(s)
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {p.sistemas?.map((sistema) => (
                        <Chip key={sistema} size="small" variant="soft" label={sistema} />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
