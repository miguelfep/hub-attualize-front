'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Box,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
  AlertTitle,
  LinearProgress,
  Paper,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { calcularApuracao } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';

// ----------------------------------------------------------------------

export function NovaApuracaoView({ clienteId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    periodoApuracao: '',
    calcularFatorR: false,
    folhaPagamentoMes: '',
    inssCppMes: '',
  });

  // Buscar dados do cliente
  const { data: clientes } = useGetAllClientes({ status: true });
  const cliente = clientes?.find((c) => (c._id || c.id) === clienteId);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.periodoApuracao || formData.periodoApuracao.length !== 6) {
        toast.error('Período deve ter 6 dígitos no formato AAAAMM');
        return;
      }

      if (formData.calcularFatorR) {
        if (!formData.folhaPagamentoMes || parseFloat(formData.folhaPagamentoMes) <= 0) {
          toast.error('Folha de pagamento é obrigatória quando calcular Fator R está ativo');
          return;
        }
        if (!formData.inssCppMes || parseFloat(formData.inssCppMes) <= 0) {
          toast.error('INSS/CPP é obrigatório quando calcular Fator R está ativo');
          return;
        }
      }

      try {
        setLoading(true);

        const dados = {
          periodoApuracao: formData.periodoApuracao,
          calcularFatorR: formData.calcularFatorR,
          ...(formData.calcularFatorR && {
            folhaPagamentoMes: parseFloat(formData.folhaPagamentoMes),
            inssCppMes: parseFloat(formData.inssCppMes),
          }),
        };

        const resultado = await calcularApuracao(clienteId, dados);

        toast.success('Apuração calculada com sucesso!');
        router.push(
          `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${resultado._id || resultado.apuracao?._id}`
        );
      } catch (error) {
        toast.error(error.message || 'Erro ao calcular apuração');
        console.error('Erro ao calcular apuração:', error);
      } finally {
        setLoading(false);
      }
    },
    [formData, clienteId, router]
  );

  if (!cliente) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Cliente não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Nova Apuração"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Clientes', href: paths.dashboard.fiscal.apuracaoClientes },
          {
            name: cliente.nome || cliente.razao_social,
            href: `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}`,
          },
          { name: 'Nova Apuração' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>Nova Apuração de Impostos</AlertTitle>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            <strong>Como funciona:</strong>
            <br />
            • O faturamento do período será buscado automaticamente das notas fiscais já baixadas
            pelo sistema
            <br />
            • Após calcular a apuração, um novo registro de histórico será criado automaticamente
            com os dados do período
            <br />
            • Para calcular o Fator R, é necessário informar os valores de folha e INSS do mês
          </Typography>
        </Alert>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados da Apuração
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ mt: 3 }}>
              {/* Período */}
              <TextField
                fullWidth
                label="Período de Apuração *"
                placeholder="202412"
                value={formData.periodoApuracao}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, periodoApuracao: value });
                }}
                helperText="Formato: AAAAMM (ex: 202412 para Dezembro/2024). O faturamento será buscado automaticamente das notas fiscais deste período."
                required
                inputProps={{ maxLength: 6 }}
              />

              <Alert severity="success" icon={<Iconify icon="solar:document-text-bold-duotone" />}>
                <AlertTitle>Faturamento Automático</AlertTitle>
                <Typography variant="caption">
                  O sistema buscará automaticamente todas as notas fiscais emitidas no período
                  selecionado. Essas notas são atualizadas diariamente via cron job.
                </Typography>
              </Alert>

              {/* Calcular Fator R */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.calcularFatorR}
                    onChange={(e) =>
                      setFormData({ ...formData, calcularFatorR: e.target.checked })
                    }
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Calcular Fator R</Typography>
                    <Typography variant="caption" color="text.secondary">
                      O Fator R determina se a empresa se enquadra no Anexo III (≥28%) ou Anexo V
                      (&lt;28%). Será calculado considerando os últimos 12 meses de histórico.
                    </Typography>
                  </Box>
                }
              />

              {/* Campos de Folha (apenas se calcularFatorR = true) */}
              {formData.calcularFatorR && (
                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'primary.lighter' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Dados do Mês para Cálculo do Fator R
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Estes valores serão utilizados para calcular o Fator R e também serão salvos no
                    histórico após a apuração.
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Folha de Pagamento do Mês *"
                        type="number"
                        step="0.01"
                        min="0"
                        required={formData.calcularFatorR}
                        placeholder="10500.00"
                        value={formData.folhaPagamentoMes}
                        onChange={(e) =>
                          setFormData({ ...formData, folhaPagamentoMes: e.target.value })
                        }
                        helperText="Valor da folha SEM encargos (salários + pró-labore)"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="INSS/CPP do Mês *"
                        type="number"
                        step="0.01"
                        min="0"
                        required={formData.calcularFatorR}
                        placeholder="2310.00"
                        value={formData.inssCppMes}
                        onChange={(e) =>
                          setFormData({ ...formData, inssCppMes: e.target.value })
                        }
                        helperText="Valor do INSS/CPP (contribuição patronal + funcionários)"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <Alert severity="warning" icon={<Iconify icon="solar:calendar-mark-bold-duotone" />}>
                <AlertTitle>Histórico será Atualizado</AlertTitle>
                <Typography variant="caption">
                  Após calcular a apuração, um novo registro será adicionado automaticamente ao
                  histórico com os dados deste período (faturamento, folha e INSS informados).
                  Isso garantirá que o Fator R seja calculado corretamente nas próximas apurações.
                </Typography>
              </Alert>

              {/* Botões */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
                  disabled={loading}
                >
                  {loading ? 'Calculando...' : 'Calcular Apuração'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}

