'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useApuracao, useApuracaoActions } from 'src/hooks/use-apuracao';
import { fDate } from 'src/utils/format-time';
import { fCurrency, fNumber, fPercent } from 'src/utils/format-number';
import { DashboardContent } from 'src/layouts/dashboard/main';

const STATUS_COLORS = {
  calculada: 'info',
  validada: 'primary',
  transmitida: 'secondary',
  das_gerado: 'info',
  pago: 'success',
  cancelada: 'default',
  pendente: 'warning',
};

function formatCurrency(value) {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPercent(value, decimals = 2) {
  if (value === undefined || value === null) return '—';
  return `${value.toFixed(decimals)}%`;
}

function formatPeriodo(periodo) {
  if (!periodo || periodo.length !== 6) return periodo || '—';
  const ano = periodo.slice(0, 4);
  const mes = parseInt(periodo.slice(4, 6), 10);
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
    return `${meses[mes - 1]}/${ano}`;
  }
  
export function ApuracaoDetalhesView({ apuracaoId }) {
  const router = useRouter();
  const { data, isLoading, error, mutate } = useApuracao(apuracaoId);
  const { recalcularApuracao } = useApuracaoActions();

  const [recalcularOpen, setRecalcularOpen] = useState(false);
  const [recalcularLoading, setRecalcularLoading] = useState(false);
  const [calcularFatorR, setCalcularFatorR] = useState(true);
  const [folha12, setFolha12] = useState('');
  const [receita12, setReceita12] = useState('');

  const apuracao = useMemo(() => data?.apuracao || data?.data || data, [data]);

  const handleSubmitRecalcular = async () => {
    setRecalcularLoading(true);
    try {
      await recalcularApuracao(apuracaoId, {
        calcularFatorR,
        folhaPagamento12Meses: folha12 !== '' ? Number(folha12) : undefined,
        receitaBruta12Meses: receita12 !== '' ? Number(receita12) : undefined,
      });
      toast.success('Apuração recalculada com sucesso!');
      setRecalcularOpen(false);
      setFolha12('');
      setReceita12('');
      mutate?.();
    } catch (recalcError) {
      toast.error(recalcError?.response?.data?.message || 'Erro ao recalcular apuração');
    } finally {
      setRecalcularLoading(false);
    }
  };
 
  if (isLoading) {
    return (
      <DashboardContent>
        <Stack spacing={2} sx={{ py: 8 }} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Carregando detalhes da apuração...
          </Typography>
        </Stack>
      </DashboardContent>
    );
  }

  if (error || !apuracao) {
    return (
      <DashboardContent>
        <Alert severity="error">
          Não foi possível carregar a apuração informada. Ela pode ter sido removida.
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h4">Apuração de {formatPeriodo(apuracao.periodoApuracao)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Cálculo realizado em {fDate(apuracao.calculadoEm, 'DD/MM/YYYY HH:mm')}
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Tooltip
              title={apuracao.dasGerado ? 'Recalcule apenas antes de gerar o DAS' : 'Recalcular apuração'}
            >
              <span>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => setRecalcularOpen(true)}
                  disabled={apuracao.dasGerado}
                >
                  Recalcular apuração
                </Button>
              </span>
            </Tooltip>
            <Button variant="outlined" onClick={() => router.back()}>
              Voltar
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={apuracao.status}
                  color={STATUS_COLORS[apuracao.status] || 'default'}
                  sx={{ mt: 1 }}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Total de impostos
                </Typography>
                <Typography variant="h5">{formatCurrency(apuracao.totalImpostos)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Alíquota efetiva: {formatPercent(apuracao.aliquotaEfetivaTotal || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Receita bruta
                </Typography>
                <Typography variant="h5">{formatCurrency(apuracao.totalReceitaBruta)}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  DAS gerado?
                </Typography>
                <Typography variant="subtitle2">
                  {apuracao.dasGerado ? 'Sim' : 'Não'}
                </Typography>
                {apuracao.dasId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    DAS gerado: {apuracao.dasId}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Fator R
                </Typography>
                {apuracao?.fatorR ? (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="h6">{formatPercent(apuracao.fatorR.percentual || 0)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Folha 12 meses: {formatCurrency(apuracao.fatorR.folhaPagamento12Meses)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receita 12 meses: {formatCurrency(apuracao.fatorR.receitaBruta12Meses)}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Fator R não calculado nesta apuração.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Distribuição por anexo
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Anexo</TableCell>
                    <TableCell>Notas</TableCell>
                    <TableCell align="right">Receita</TableCell>
                    <TableCell align="right">Alíquota efetiva</TableCell>
                    <TableCell align="right">Imposto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apuracao?.notasPorAnexo?.map((item) => (
                    <TableRow key={item.anexo}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={`Anexo ${item.anexo}`} size="small" />
                          {item.usaFatorR && <Chip label="Fator R" size="small" color="info" variant="outlined" />}
                        </Stack>
                      </TableCell>
                      <TableCell>{fNumber(item.quantidadeNotas)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.totalNotas)}</TableCell>
                      <TableCell align="right">{formatPercent(item.aliquotaEfetiva)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.impostoCalculado)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {(apuracao.observacoes?.length || apuracao.alertas?.length) && (
          <Grid container spacing={2}>
            {apuracao.observacoes?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2">Observações</Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {apuracao.observacoes.map((obs) => (
                        <Typography variant="body2" key={obs}>
                          • {obs}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {apuracao.alertas?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2">Alertas</Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {apuracao.alertas.map((alerta) => (
                        <Typography variant="body2" color="warning.main" key={alerta}>
                          • {alerta}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {apuracao?.historicoFaturamento?.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Histórico de faturamento (últimos 12 meses)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Período</TableCell>
                      <TableCell align="right">Receita</TableCell>
                      <TableCell align="right">Folha</TableCell>
                      <TableCell align="right">Pró-labore</TableCell>
                      <TableCell align="right">Fator R</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...apuracao.historicoFaturamento]
                      .sort((a, b) => (a.periodoApuracao > b.periodoApuracao ? -1 : 1))
                      .map((item) => (
                        <TableRow key={item.periodoApuracao}>
                          <TableCell>{formatPeriodo(item.periodoApuracao)}</TableCell>
                          <TableCell align="right">{fCurrency(item.receitaBruta)}</TableCell>
                          <TableCell align="right">{fCurrency(item.folhaPagamento)}</TableCell>
                          <TableCell align="right">{fCurrency(item.proLabore)}</TableCell>
                          <TableCell align="right">{fPercent(item.fatorR || 0)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        <RecalcularApuracaoDialog
          open={recalcularOpen}
          onClose={() => {
            if (!recalcularLoading) {
              setRecalcularOpen(false);
            }
          }}
          loading={recalcularLoading}
          calcularFatorR={calcularFatorR}
          onToggleFatorR={setCalcularFatorR}
          folha12={folha12}
          onChangeFolha={setFolha12}
          receita12={receita12}
          onChangeReceita={setReceita12}
          onSubmit={handleSubmitRecalcular}
        />
      </Stack>
    </DashboardContent>
  );
}

function RecalcularApuracaoDialog({
  open,
  onClose,
  loading,
  calcularFatorR,
  onToggleFatorR,
  folha12,
  onChangeFolha,
  receita12,
  onChangeReceita,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Recalcular apuração</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            Use esta ação após ajustar notas fiscais ou dados de folha. Ela mantém o mesmo ID da apuração, registrando uma observação com a data do recálculo.
          </Alert>
          <FormControlLabel
            control={<Switch checked={calcularFatorR} onChange={(event) => onToggleFatorR(event.target.checked)} />}
            label="Recalcular Fator R"
          />
          <TextField
            label="Receita bruta (12 meses)"
            value={receita12}
            onChange={(event) => onChangeReceita(event.target.value)}
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            helperText="Opcional. Deixe em branco para usar o acumulado salvo no cliente."
          />
          <TextField
            label="Folha de pagamento (12 meses)"
            value={folha12}
            onChange={(event) => onChangeFolha(event.target.value)}
            type="number"
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            helperText="Opcional. Deixe em branco para usar o acumulado salvo no cliente."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={loading} onClick={onSubmit} color="warning">
          Recalcular
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default ApuracaoDetalhesView;


