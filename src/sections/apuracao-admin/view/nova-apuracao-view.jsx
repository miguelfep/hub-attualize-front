'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { MonthYearPicker } from 'src/components/month-year-picker/month-year-picker';

import { calcularApuracao } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';

// ----------------------------------------------------------------------

export function NovaApuracaoView({ clienteId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    periodoApuracao: '',
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

      try {
        setLoading(true);

        const dados = {
          periodoApuracao: formData.periodoApuracao,
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
            • O Fator R será calculado automaticamente se a empresa estiver habilitada na configuração
          </Typography>
        </Alert>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados da Apuração
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ mt: 3 }}>
              {/* Período */}
              <MonthYearPicker
                label="Período de Apuração"
                value={formData.periodoApuracao}
                onChange={(periodo) => {
                  setFormData({ ...formData, periodoApuracao: periodo });
                }}
                helperText="Selecione o mês e ano. O faturamento será buscado automaticamente das notas fiscais deste período."
                required
              />

              <Alert severity="success" icon={<Iconify icon="solar:document-text-bold-duotone" />}>
                <AlertTitle>Faturamento Automático</AlertTitle>
                <Typography variant="caption">
                  O sistema buscará automaticamente todas as notas fiscais emitidas no período
                  selecionado. Essas notas são atualizadas diariamente via cron job.
                </Typography>
              </Alert>

              <Alert severity="info" icon={<Iconify icon="solar:chart-bold-duotone" />}>
                <AlertTitle>Cálculo Automático do Fator R</AlertTitle>
                <Typography variant="caption">
                  O Fator R será calculado automaticamente se a empresa estiver habilitada na configuração.
                  O cálculo considera os últimos 12 meses de histórico de folha e faturamento.
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

