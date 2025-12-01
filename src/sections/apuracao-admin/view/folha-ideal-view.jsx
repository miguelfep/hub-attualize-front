'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Grid,
  Box,
  TextField,
  Alert,
  AlertTitle,
  LinearProgress,
  Paper,
  Divider,
  Chip,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { MonthYearPicker } from 'src/components/month-year-picker/month-year-picker';

import { calcularFolhaIdeal } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';
import { formatarPeriodo, FATOR_R_MINIMO } from 'src/utils/apuracao-helpers';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function FolhaIdealView({ clienteId }) {
  const router = useRouter();

  const [periodoReferencia, setPeriodoReferencia] = useState('');
  const [percentualINSS, setPercentualINSS] = useState('0.278');
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  // Buscar dados do cliente
  const { data: clientes } = useGetAllClientes({ status: true });
  const cliente = clientes?.find((c) => (c._id || c.id) === clienteId);

  const handleCalcular = useCallback(async () => {
    if (!periodoReferencia || periodoReferencia.length !== 6) {
      toast.error('Selecione um período de referência válido');
      return;
    }

    const percentual = parseFloat(percentualINSS);
    if (isNaN(percentual) || percentual < 0 || percentual > 1) {
      toast.error('Percentual de INSS deve ser um número entre 0 e 1 (ex: 0.278 para 27,8%)');
      return;
    }

    try {
      setCalculando(true);
      setErro(null);
      const dados = await calcularFolhaIdeal(clienteId, periodoReferencia, percentual);
      setResultado(dados);
      toast.success('Cálculo realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao calcular folha ideal:', error);
      setErro(error.message || 'Erro ao calcular folha ideal');
      toast.error(error.message || 'Erro ao calcular folha ideal');
    } finally {
      setCalculando(false);
    }
  }, [clienteId, periodoReferencia, percentualINSS]);

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Calcular Folha Ideal para Fator R"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Clientes', href: paths.dashboard.fiscal.apuracaoClientes },
          {
            name: cliente?.nome || cliente?.razao_social || 'Cliente',
            href: `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/detalhes`,
          },
          { name: 'Folha Ideal' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:arrow-left-bold-duotone" />}
            onClick={() => router.push(`${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/detalhes`)}
          >
            Voltar
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {/* Informações */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>Calcular Folha Ideal para Fator R</AlertTitle>
          <Typography variant="body2">
            Esta ferramenta calcula a folha de pagamento ideal necessária para atingir o Fator R mínimo de 28%,
            permitindo que a empresa se enquadre no Anexo III (alíquotas menores) do Simples Nacional.
          </Typography>
        </Alert>

        {/* Formulário */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Parâmetros do Cálculo
          </Typography>

          <Stack spacing={3} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MonthYearPicker
                  label="Período de Referência"
                  value={periodoReferencia}
                  onChange={setPeriodoReferencia}
                  helperText="Período para o qual deseja calcular a folha ideal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Percentual de INSS"
                  value={percentualINSS}
                  onChange={(e) => setPercentualINSS(e.target.value)}
                  helperText="Percentual de INSS sobre a folha (ex: 0.278 = 27,8%)"
                  inputProps={{ step: '0.001', min: '0', max: '1' }}
                  required
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
              onClick={handleCalcular}
              disabled={!periodoReferencia || !percentualINSS || calculando}
            >
              {calculando ? 'Calculando...' : 'Calcular Folha Ideal'}
            </Button>
          </Stack>
        </Card>

        {/* Loading */}
        {calculando && <LinearProgress />}

        {/* Erro */}
        {erro && (
          <Alert severity="error">
            <AlertTitle>Erro</AlertTitle>
            {erro}
          </Alert>
        )}

        {/* Resultado */}
        {resultado && (
          <Stack spacing={3}>
            {/* Fator R Atual */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Fator R Atual
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Folha 12 Meses
                      </Typography>
                      <Typography variant="h6">
                        {fCurrency(resultado.fatorRAtual?.folhaPagamento12Meses || 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        INSS/CPP 12 Meses
                      </Typography>
                      <Typography variant="h6">
                        {fCurrency(resultado.fatorRAtual?.inssCpp12Meses || 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Receita Bruta 12 Meses
                      </Typography>
                      <Typography variant="h6">
                        {fCurrency(resultado.fatorRAtual?.receitaBruta12Meses || 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider />

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: resultado.fatorRAtual?.atingeMinimo ? 'success.lighter' : 'warning.lighter',
                    border: (theme) =>
                      `1px solid ${theme.palette[resultado.fatorRAtual?.atingeMinimo ? 'success' : 'warning'].main}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Fator R Atual
                      </Typography>
                      <Typography variant="h4">
                        {resultado.fatorRAtual?.percentual?.toFixed(2) || 0}%
                      </Typography>
                    </Box>
                    <Chip
                      label={resultado.fatorRAtual?.atingeMinimo ? 'Anexo III' : 'Anexo V'}
                      color={resultado.fatorRAtual?.atingeMinimo ? 'success' : 'warning'}
                      size="large"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {resultado.fatorRAtual?.mesesConsiderados || 0} meses considerados
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Folha Ideal */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Folha Ideal para Atingir 28%
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                      <Typography variant="caption" color="text.secondary">
                        Folha Mensal Ideal
                      </Typography>
                      <Typography variant="h5" color="primary.main">
                        {fCurrency(resultado.folhaIdeal?.folhaPagamentoMensal || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sem encargos
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                      <Typography variant="caption" color="text.secondary">
                        Folha Anual Ideal
                      </Typography>
                      <Typography variant="h5" color="primary.main">
                        {fCurrency(resultado.folhaIdeal?.folhaPagamento12Meses || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sem encargos (12 meses)
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        INSS/CPP Mensal Ideal
                      </Typography>
                      <Typography variant="h6">
                        {fCurrency(resultado.folhaIdeal?.inssCppMensal || 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        INSS/CPP Anual Ideal
                      </Typography>
                      <Typography variant="h6">
                        {fCurrency(resultado.folhaIdeal?.inssCpp12Meses || 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.lighter' }}>
                      <Typography variant="caption" color="text.secondary">
                        Folha com Encargos (12 meses)
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {fCurrency(resultado.folhaIdeal?.folhaComEncargos12Meses || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Este valor garante Fator R de 28%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
            </Card>

            {/* Diferença Necessária */}
            {resultado.diferenca && (
              <Card sx={{ p: 3, bgcolor: 'warning.lighter' }}>
                <Typography variant="h6" gutterBottom>
                  Diferença Necessária
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Aumento Mensal Necessário
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {fCurrency(resultado.diferenca?.folhaMensalAdicional || 0)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Aumento Anual Necessário
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {fCurrency(resultado.diferenca?.folha12MesesAdicional || 0)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Percentual de Aumento
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {resultado.diferenca?.percentualAumento?.toFixed(2) || 0}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Stack>
              </Card>
            )}

            {/* Observações */}
            {resultado.observacoes && resultado.observacoes.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Observações
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {resultado.observacoes.map((obs, index) => (
                    <Alert key={index} severity="info" icon={false}>
                      {obs}
                    </Alert>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

