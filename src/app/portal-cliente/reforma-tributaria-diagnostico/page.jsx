'use client';

import { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Dialog,
  Skeleton,
  Container,
  Typography,
  CardContent,
  DialogTitle,
  ToggleButton,
  DialogContent,
  ToggleButtonGroup,
} from '@mui/material';

import { useSettings } from 'src/hooks/useSettings';

import { fDateTime } from 'src/utils/format-time';

import {
  useGetDiagnosticosPortal,
  calcularDiagnosticoPortal,
  useGetResultadoDiagnosticoPortal,
  atualizarEntradasDiagnosticoPortal,
} from 'src/actions/reforma-tributaria-diagnostico';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import {
  getStatusOption,
  formatCompetencia,
} from 'src/sections/reforma-tributaria-diagnostico/utils';
import { DiagnosticoResultado } from 'src/sections/reforma-tributaria-diagnostico/components/diagnostico-resultado';
import { DiagnosticoEntradasForm } from 'src/sections/reforma-tributaria-diagnostico/components/diagnostico-entradas-form';

// ----------------------------------------------------------------------

const apiErrMsg = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

export default function ReformaTributariaDiagnosticoPage() {
  const { podeUsarReformaTributariaDiagnostico } = useSettings();

  const { diagnosticos, diagnosticosLoading, refetchDiagnosticos } = useGetDiagnosticosPortal();

  const [selectedId, setSelectedId] = useState(null);
  const [openEditar, setOpenEditar] = useState(false);
  const [recalculando, setRecalculando] = useState(false);

  useEffect(() => {
    if (!selectedId && diagnosticos.length > 0) {
      setSelectedId(diagnosticos[0]._id || diagnosticos[0].id);
    }
  }, [diagnosticos, selectedId]);

  const diagnosticoSelecionado = useMemo(
    () => diagnosticos.find((d) => (d._id || d.id) === selectedId) || null,
    [diagnosticos, selectedId]
  );

  const { resultado: resultadoPayload, resultadoLoading, refetchResultado } =
    useGetResultadoDiagnosticoPortal(podeUsarReformaTributariaDiagnostico ? selectedId : null);

  if (!podeUsarReformaTributariaDiagnostico) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Funcionalidade não disponível para sua conta. Fale com a Attualize para ativar o
          diagnóstico da Reforma Tributária.
        </Alert>
      </Container>
    );
  }

  const handleSalvarEntradas = async (payload) => {
    try {
      await atualizarEntradasDiagnosticoPortal(selectedId, payload);
      toast.success('Dados atualizados');
      setOpenEditar(false);
      refetchDiagnosticos();
      refetchResultado();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Erro ao atualizar dados'));
    }
  };

  const handleRecalcular = async () => {
    try {
      setRecalculando(true);
      await calcularDiagnosticoPortal(selectedId);
      toast.success('Diagnóstico recalculado');
      refetchDiagnosticos();
      refetchResultado();
    } catch (error) {
      toast.error(apiErrMsg(error, 'Erro ao recalcular diagnóstico'));
    } finally {
      setRecalculando(false);
    }
  };

  const statusOption = getStatusOption(resultadoPayload?.status || diagnosticoSelecionado?.status);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Diagnóstico da Reforma Tributária</Typography>
          <Typography variant="body2" color="text.secondary">
            Compare o Simples tradicional com o modelo híbrido (IBS/CBS por fora) e veja a
            recomendação para o seu negócio.
          </Typography>
        </Box>

        {diagnosticosLoading && <Skeleton variant="rounded" height={320} />}

        {!diagnosticosLoading && diagnosticos.length === 0 && (
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={1.5} sx={{ py: 8 }}>
                <Iconify
                  icon="solar:diagram-up-bold-duotone"
                  width={48}
                  sx={{ color: 'text.disabled' }}
                />
                <Typography variant="subtitle1">Nenhum diagnóstico disponível ainda</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', maxWidth: 440 }}
                >
                  Nossa equipe está preparando o diagnóstico da sua empresa. Assim que estiver
                  disponível, ele aparecerá aqui.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {!diagnosticosLoading && diagnosticos.length > 0 && (
          <>
            {diagnosticos.length > 1 && (
              <ToggleButtonGroup
                exclusive
                size="small"
                value={selectedId}
                onChange={(_, value) => value && setSelectedId(value)}
                sx={{ flexWrap: 'wrap' }}
              >
                {diagnosticos.map((diagnostico) => {
                  const id = diagnostico._id || diagnostico.id;
                  return (
                    <ToggleButton key={id} value={id}>
                      {formatCompetencia(diagnostico.competenciaBase)}
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            )}

            <Card>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="h6">
                        {formatCompetencia(
                          resultadoPayload?.competenciaBase || diagnosticoSelecionado?.competenciaBase
                        )}
                      </Typography>
                      <Label color={statusOption.color} variant="soft">
                        {statusOption.label}
                      </Label>
                    </Stack>
                    {(resultadoPayload?.updatedAt || diagnosticoSelecionado?.updatedAt) && (
                      <Typography variant="caption" color="text.secondary">
                        Atualizado em{' '}
                        {fDateTime(resultadoPayload?.updatedAt || diagnosticoSelecionado?.updatedAt)}
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="solar:pen-bold" />}
                      onClick={() => setOpenEditar(true)}
                    >
                      Atualizar meus dados
                    </Button>
                    <LoadingButton
                      variant="contained"
                      loading={recalculando}
                      startIcon={<Iconify icon="solar:calculator-bold" />}
                      onClick={handleRecalcular}
                    >
                      Recalcular
                    </LoadingButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {resultadoLoading && <Skeleton variant="rounded" height={480} />}

            {!resultadoLoading && resultadoPayload?.resultado && (
              <DiagnosticoResultado resultado={resultadoPayload.resultado} />
            )}

            {!resultadoLoading && !resultadoPayload?.resultado && (
              <Alert severity="info">
                O diagnóstico ainda não foi calculado. Confira seus dados em “Atualizar meus dados”
                e clique em “Recalcular”.
              </Alert>
            )}
          </>
        )}
      </Stack>

      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Atualizar dados do diagnóstico</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <DiagnosticoEntradasForm
              diagnostico={diagnosticoSelecionado}
              showPremissas={false}
              onSave={handleSalvarEntradas}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
