'use client';

import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Alert,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  Typography,
  CardContent,
  LinearProgress,
  TableContainer,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';
import { fPercent, fCurrency, fShortenNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { Chart, useChart } from 'src/components/chart';

import {
  getMargem,
  getCargaAnual,
  getCargaMensal,
  getPrecoIndice,
  getCenarioLabel,
  getRecomendacaoLabel,
  getRecomendacaoColor,
  getDiferencaCargaBase,
  CONFIABILIDADE_NIVEL_COLORS,
} from '../utils';

// ----------------------------------------------------------------------

const fFraction = (value, options) =>
  value === null || value === undefined
    ? '—'
    : fPercent(Number(value) * 100, { maximumFractionDigits: 2, ...options });

const fMoney = (value) => (value === null || value === undefined ? '—' : fCurrency(value));

const FONTE_LABELS = {
  notas_fiscais: 'Notas fiscais',
  guias_fiscais: 'Guias fiscais',
  entradas_manuais: 'Dados informados',
};

const fonteLabel = (fonte) => FONTE_LABELS[fonte] || String(fonte).replaceAll('_', ' ');

// ----------------------------------------------------------------------

function RecomendacaoHero({ comparativo }) {
  if (!comparativo) return null;
  const { recomendacaoFinal, impactoCompetitividadeB2B, impactoPrecoParaMargem } = comparativo;

  const diferencaBase = getDiferencaCargaBase(comparativo);
  const temEconomia = diferencaBase !== null && diferencaBase < 0;
  const temCustoExtra = diferencaBase !== null && diferencaBase > 0;

  return (
    <Card sx={{ height: 1 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="solar:medal-ribbons-star-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Recomendação
              </Typography>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                {getRecomendacaoLabel(recomendacaoFinal)}
              </Typography>
            </Box>
          </Stack>

          {diferencaBase !== null && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                {temEconomia && 'Economia anual estimada com o híbrido (cenário base)'}
                {temCustoExtra && 'Custo anual adicional do híbrido (cenário base)'}
                {!temEconomia && !temCustoExtra && 'Diferença anual de carga (cenário base)'}
              </Typography>
              <Typography variant="h3" color={temCustoExtra ? 'error.main' : 'success.main'}>
                {fCurrency(Math.abs(diferencaBase))}
              </Typography>
            </Box>
          )}

          {impactoCompetitividadeB2B && (
            <Typography variant="body2" color="text.secondary">
              {impactoCompetitividadeB2B}
            </Typography>
          )}

          {impactoPrecoParaMargem && (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Índice de preço para manter a margem (1,00 = preço atual)
              </Typography>
              <Stack direction="row" spacing={1}>
                {impactoPrecoParaMargem.simples !== undefined && (
                  <Chip size="small" label={`Simples: ${Number(impactoPrecoParaMargem.simples).toFixed(2)}`} />
                )}
                {impactoPrecoParaMargem.hibrido !== undefined && (
                  <Chip
                    size="small"
                    color="primary"
                    variant="soft"
                    label={`Híbrido: ${Number(impactoPrecoParaMargem.hibrido).toFixed(2)}`}
                  />
                )}
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ConfiabilidadeCard({ confiabilidade }) {
  if (!confiabilidade) return null;
  const { score, nivel, fontes = [], pendencias = [] } = confiabilidade;
  const color = CONFIABILIDADE_NIVEL_COLORS[nivel] || 'default';

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Confiabilidade dos dados" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h3">{score ?? '—'}</Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(Number(score) || 0, 100)}
                color={color === 'default' ? 'primary' : color}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
            {nivel && (
              <Label color={color} variant="soft">
                {nivel}
              </Label>
            )}
          </Stack>

          {fontes.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {fontes.map((fonte) => (
                <Chip key={fonte} size="small" variant="outlined" label={fonteLabel(fonte)} />
              ))}
            </Stack>
          )}

          {pendencias.length > 0 && (
            <Alert severity="warning" variant="outlined">
              <Stack spacing={0.5}>
                {pendencias.map((p, index) => (
                  <Typography key={index} variant="body2">
                    {typeof p === 'string' ? p : p?.descricao || p?.mensagem || JSON.stringify(p)}
                  </Typography>
                ))}
              </Stack>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function BaseDadosCard({ baseDados }) {
  if (!baseDados) return null;

  const linhas = [
    { label: 'Receita últimos 12 meses', value: fMoney(baseDados.receitaUltimos12Meses) },
    { label: 'Receita média mensal', value: fMoney(baseDados.receitaMediaMensalHistorica) },
    { label: 'Guias pagas (12 meses)', value: fMoney(baseDados.totalGuiasUltimos12Meses) },
    { label: 'Retenções (12 meses)', value: fMoney(baseDados.totalRetencoesUltimos12Meses) },
    { label: 'Meses com receita', value: baseDados.mesesComReceita ?? '—' },
  ];

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Base de dados utilizada" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={1} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
          {linhas.map((linha) => (
            <Stack key={linha.label} direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {linha.label}
              </Typography>
              <Typography variant="subtitle2">{linha.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function CenariosChart({ cenarios = [] }) {
  const theme = useTheme();

  const categories = cenarios.map((cenario, index) => getCenarioLabel(cenario.nome, index));

  const series = [
    { name: 'Simples tradicional', data: cenarios.map((c) => getCargaAnual(c.simples) ?? 0) },
    { name: 'Híbrido (IBS/CBS)', data: cenarios.map((c) => getCargaAnual(c.hibrido) ?? 0) },
  ];

  const chartOptions = useChart({
    // Paleta validada (light e dark): secundária p/ Simples, primária p/ Híbrido
    colors: [theme.palette.secondary.main, theme.palette.primary.main],
    xaxis: { categories },
    yaxis: {
      labels: { formatter: (value) => `R$ ${fShortenNumber(value)}` },
    },
    tooltip: {
      y: { formatter: (value) => fCurrency(value) },
    },
    legend: { show: true, position: 'top', horizontalAlign: 'right' },
    dataLabels: { enabled: false },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 4 } },
  });

  if (!cenarios.length) return null;

  return (
    <Card>
      <CardHeader
        title="Carga tributária anual por cenário"
        subheader="Quanto menor a barra, menor o imposto no ano"
        titleTypographyProps={{ variant: 'subtitle1' }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Chart type="bar" series={series} options={chartOptions} height={320} />
      </CardContent>
    </Card>
  );
}

function CenariosTable({ cenarios = [] }) {
  if (!cenarios.length) return null;

  return (
    <Card>
      <CardHeader
        title="Comparativo por cenário"
        subheader="Simples tradicional x Simples com IBS/CBS por fora"
        titleTypographyProps={{ variant: 'subtitle1' }}
      />
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              <TableCell>Cenário</TableCell>
              <TableCell align="right">Carga mensal — Simples</TableCell>
              <TableCell align="right">Carga mensal — Híbrido</TableCell>
              <TableCell align="right">Margem — Simples</TableCell>
              <TableCell align="right">Margem — Híbrido</TableCell>
              <TableCell align="right">Preço p/ margem — S / H</TableCell>
              <TableCell align="right">Δ carga anual</TableCell>
              <TableCell>Recomendação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cenarios.map((cenario, index) => {
              const diferencaCarga = cenario.diferencaCargaAnual;
              const precoSimples = getPrecoIndice(cenario.simples);
              const precoHibrido = getPrecoIndice(cenario.hibrido);
              return (
                <TableRow key={cenario.nome || index} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{getCenarioLabel(cenario.nome, index)}</Typography>
                  </TableCell>
                  <TableCell align="right">{fMoney(getCargaMensal(cenario.simples))}</TableCell>
                  <TableCell align="right">{fMoney(getCargaMensal(cenario.hibrido))}</TableCell>
                  <TableCell align="right">{fFraction(getMargem(cenario.simples))}</TableCell>
                  <TableCell align="right">{fFraction(getMargem(cenario.hibrido))}</TableCell>
                  <TableCell align="right">
                    {precoSimples !== undefined || precoHibrido !== undefined
                      ? `${precoSimples !== undefined ? Number(precoSimples).toFixed(2) : '—'} / ${
                          precoHibrido !== undefined ? Number(precoHibrido).toFixed(2) : '—'
                        }`
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={Number(diferencaCarga) > 0 ? 'error.main' : 'success.main'}
                    >
                      {fMoney(diferencaCarga)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Label color={getRecomendacaoColor(cenario.recomendacao)} variant="soft">
                      {getRecomendacaoLabel(cenario.recomendacao)}
                    </Label>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ px: 3, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Δ = híbrido − simples (negativo = economia do híbrido). Preço p/ margem: índice necessário
          para manter a margem alvo (1,00 = preço atual).
        </Typography>
      </Box>
    </Card>
  );
}

function PlanoAcaoCard({ planoAcao = [] }) {
  if (!planoAcao.length) return null;

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Plano de ação" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={1.5}>
          {planoAcao.map((item, index) => {
            const texto = typeof item === 'string' ? item : item?.titulo || item?.descricao || item?.acao;
            const detalhe = typeof item === 'object' && item?.titulo ? item?.descricao : null;
            return (
              <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                <Iconify
                  icon="solar:check-circle-bold"
                  sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }}
                />
                <Box>
                  <Typography variant="body2">{texto}</Typography>
                  {detalhe && (
                    <Typography variant="caption" color="text.secondary">
                      {detalhe}
                    </Typography>
                  )}
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PremissasAplicadasCard({ premissas }) {
  if (!premissas) return null;

  const linhas = [
    { label: 'Alíquota efetiva — Simples', value: fFraction(premissas.aliquotaSimplesEfetiva) },
    { label: 'Alíquota efetiva — Híbrido', value: fFraction(premissas.aliquotaHibridoEfetiva) },
    { label: 'Crédito aproveitável B2B', value: fFraction(premissas.percentualCreditoB2B) },
    { label: 'Custo de compliance híbrido', value: fMoney(premissas.custoComplianceHibridoMensal) },
  ];

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Premissas aplicadas" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>
        <Stack spacing={1} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
          {linhas.map((linha) => (
            <Stack key={linha.label} direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {linha.label}
              </Typography>
              <Typography variant="subtitle2">{linha.value}</Typography>
            </Stack>
          ))}
          {premissas.fonteAliquotas && (
            <Typography variant="caption" color="text.secondary">
              Fonte: {premissas.fonteAliquotas}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ResumoExecutivoCard({ resumoExecutivo }) {
  if (!resumoExecutivo) return null;

  return (
    <Card>
      <CardHeader title="Resumo executivo" titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent sx={{ pt: 0 }}>
        <Markdown children={resumoExecutivo} />
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

/** Exibição completa do `resultado` de um diagnóstico (backoffice e portal). */
export function DiagnosticoResultado({ resultado }) {
  if (!resultado) return null;

  const {
    confiabilidade,
    comparativo,
    baseDados,
    planoAcao,
    resumoExecutivo,
    premissasAplicadas,
    calculadoEm,
  } = resultado;

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <RecomendacaoHero comparativo={comparativo} />
        </Grid>
        <Grid xs={12} md={4}>
          <ConfiabilidadeCard confiabilidade={confiabilidade} />
        </Grid>
        <Grid xs={12} md={4}>
          <BaseDadosCard baseDados={baseDados} />
        </Grid>
      </Grid>

      <ResumoExecutivoCard resumoExecutivo={resumoExecutivo} />

      <CenariosChart cenarios={comparativo?.cenarios || []} />

      <CenariosTable cenarios={comparativo?.cenarios || []} />

      <Grid container spacing={3}>
        <Grid xs={12} md={7}>
          <PlanoAcaoCard planoAcao={planoAcao || []} />
        </Grid>
        <Grid xs={12} md={5}>
          <PremissasAplicadasCard premissas={premissasAplicadas} />
        </Grid>
      </Grid>

      {calculadoEm && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
          Calculado em {fDateTime(calculadoEm)}
        </Typography>
      )}
    </Stack>
  );
}
