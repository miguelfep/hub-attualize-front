'use client';

import { useMemo } from 'react';

import ReactApexChart from 'react-apexcharts';
import NextLink from 'next/link';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

const CHECKLIST = [
  'Mapear exposição: compras, vendas, clientes do Simples e necessidade de crédito financeiro.',
  'Revisar contratos para exibir imposto “por fora” e cláusulas de créditos.',
  'Adequar ERP/faturamento para split payment e notas com IBS/CBS.',
  'Treinar time fiscal/financeiro e fornecedores sobre compliance de créditos.',
  'Planejar fluxos de caixa considerando o split payment.',
];

const TIMELINE = [
  {
    year: '2026 — Início da transição',
    note: 'CBS 0,9% e IBS 0,1% para calibragem (sem aumento de carga total).',
    important: true,
  },
  { year: '2027 — Extinção de PIS/COFINS', note: 'CBS passa a valer integralmente.' },
  { year: '2028 — Extinção de ICMS/ISS', note: 'Início da transição do IBS.' },
  {
    year: '2029–2032 — Transição do IBS',
    note: 'Alíquotas do IBS sobem gradualmente enquanto as antigas caem.',
  },
  { year: '2033 — Novo sistema completo', note: 'Antigos tributos totalmente extintos.' },
];

const PILL_ITEMS = [
  {
    label: 'Redução de 60% para Saúde e Educação',
    chip: '60%',
    color: 'warning',
  },
  {
    label: 'Redução de 30% para serviços profissionais (advocacia, contabilidade, etc.)',
    chip: '30%',
  },
  {
    label: 'Alíquota zero para cesta básica de alimentos',
    chip: '0%',
  },
  {
    label: 'Imposto Seletivo com alíquotas maiores para itens nocivos (cigarros, álcool)',
    chip: 'IS',
    color: 'error',
  },
];

const QUICK_START = [
  {
    icon: 'solar:magic-stick-bold-duotone',
    title: 'Resumo imediato',
    description: 'IBS + CBS substituem cinco tributos. Cliente vê imposto separado no preço final (“por fora”).',
  },
  {
    icon: 'solar:credit-card-2-bold-duotone',
    title: 'Fluxo de caixa muda',
    description: 'Split payment envia imposto direto ao governo no Pix/cartão. O caixa recebe menos na hora.',
  },
  {
    icon: 'solar:bookmark-bold-duotone',
    title: 'Crédito financeiro real',
    description: 'Tudo o que você paga em IBS/CBS vira crédito. Acabou o efeito cascata — hora de revisar fornecedores.',
  },
];

const WHY_NOW = [
  {
    icon: 'solar:alarm-bold-duotone',
    title: 'Transição já começou',
    description: '2026 traz alíquotas-teste. Quem se prepara antes evita correria com notas, contratos e sistemas.',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Prova social',
    description: 'Empresas que já simulam IBS/CBS conseguem negociar melhor com clientes que exigirão crédito integral.',
  },
  {
    icon: 'solar:chart-up-bold-duotone',
    title: 'Foco em ganhos',
    description: 'Mostrar transparência no preço aumenta confiança e reduz atrito na venda — argumento chave para times comerciais.',
  },
];

export default function ReformaTributariaPage() {
  const theme = useTheme();

  const aliquotaChart = useMemo(
    () => ({
      series: [73.5, 26.5],
      options: {
        chart: {
          type: 'donut',
          toolbar: { show: false },
        },
        labels: ['Preço líquido', 'Imposto (26,5%)'],
        colors: [alpha(theme.palette.info.light, 0.65), theme.palette.primary.main],
        legend: { position: 'bottom' },
        dataLabels: {
          style: { colors: [theme.palette.common.white, theme.palette.common.white] },
          formatter(val) {
            return `${val.toFixed(1)}%`;
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '62%',
            },
          },
        },
        tooltip: {
          theme: theme.palette.mode,
          y: {
            formatter: (val) => `${val.toFixed(1)}%`,
          },
        },
      },
    }),
    [theme]
  );

  const creditoChart = useMemo(
    () => ({
      series: [
        {
          name: 'Crédito/Débito (ex.)',
          data: [15, 26.5],
        },
      ],
      options: {
        chart: {
          type: 'bar',
          toolbar: { show: false },
        },
        colors: [theme.palette.warning.main],
        plotOptions: { bar: { borderRadius: 8, columnWidth: '50%' } },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val} %`,
          style: { colors: [theme.palette.text.primary], fontWeight: 600 },
        },
        xaxis: {
          categories: ['Compra', 'Venda'],
          labels: { style: { colors: theme.palette.text.secondary } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          max: 30,
          labels: {
            formatter: (val) => `${val}`,
            style: { colors: theme.palette.text.secondary },
          },
        },
        grid: {
          borderColor: alpha(theme.palette.text.secondary, 0.12),
          strokeDashArray: 5,
        },
        tooltip: {
          theme: theme.palette.mode,
          y: { formatter: (val) => `${val} %` },
        },
      },
    }),
    [theme]
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={6}>
        <Card
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: `0 30px 60px ${alpha(theme.palette.common.black, 0.08)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(115% 130% at 100% 0%, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 55%)`,
            }}
          />

          <Stack spacing={2.5} position="relative">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip icon={<Iconify icon="solar:book-bookmark-bold-duotone" />} label="Reforma Tributária" color="primary" />
              <Chip icon={<Iconify icon="solar:compass-bold-duotone" />} label="Guia interativo" variant="outlined" />
            </Stack>

            <Typography variant="h3">Reforma Tributária no Brasil: Guia para Iniciantes</Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={780}>
              Por que simplificar? Como funcionava antes? O que muda com IBS/CBS e Imposto Seletivo? Entenda os pilares de
              simplificação e transparência, o sistema de créditos, o split payment e o cronograma até 2033.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={1}>
              <Button
                component={NextLink}
                href="#timeline"
                variant="contained"
                startIcon={<Iconify icon="solar:calendar-bold-duotone" />}
              >
                Ver cronograma
              </Button>
              <Button
                component={NextLink}
                href="https://wa.me/5541996982267?text=Ol%C3%A1%2C%20quero%20um%20diagn%C3%B3stico%20da%20Reforma%20Tribut%C3%A1ria%20para%20minha%20empresa."
                target="_blank"
                rel="noopener"
                variant="outlined"
                startIcon={<Iconify icon="solar:whatsapp-bold" />}
              >
                Falar com a Attualize
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip icon={<Iconify icon="solar:idea-bold-duotone" />} label="Versão simples" color="primary" />
                    <Chip label="Importante" color="secondary" variant="outlined" />
                  </Stack>
                  <Typography variant="h5">Entenda em 90 segundos</Typography>
                  <Stack spacing={1.5}>
                    {QUICK_START.map((item) => (
                      <Stack key={item.title} direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify icon={item.icon} width={20} />
                        </Box>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Chip icon={<Iconify icon="solar:flag-bold-duotone" />} label="Por que agir já" color="primary" />
                  <Typography variant="h5">Viés a favor da decisão</Typography>
                  <Stack spacing={1.5}>
                    {WHY_NOW.map((item) => (
                      <Stack key={item.title} spacing={0.75}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon={item.icon} width={18} />
                          <Typography variant="subtitle2" fontWeight={700}>
                            {item.title}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Typography variant="body2" color="text.secondary">
                    Use estes gatilhos (urgência, prova social e ganho percebido) em materiais internos para acelerar o engajamento
                    do time e reduzir resistência à mudança.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase' }}>
                    1) Introdução — por que mudar?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    O sistema de impostos sobre consumo no Brasil era considerado um dos mais complexos do mundo. Relatórios do
                    Banco Mundial/PwC estimavam cerca de <strong>1.500 horas/ano</strong> para uma empresa cumprir obrigações. A
                    reforma busca transformar esse emaranhado em um modelo mais claro, transparente e menos burocrático.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase' }}>
                    2) Antes da reforma — o emaranhado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <strong>Tributos que serão substituídos:</strong>
                    <List dense sx={{ mt: 1 }}>
                      {['PIS (Federal)', 'COFINS (Federal)', 'IPI (Federal)', 'ICMS (Estadual)', 'ISS (Municipal)'].map(
                        (item) => (
                          <ListItem key={item} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Iconify icon="solar:minus-bold" width={14} />
                            </ListItemIcon>
                            <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} primary={item} />
                          </ListItem>
                        )
                      )}
                    </List>
                    Regras, datas e administrações distintas criavam custos, insegurança jurídica e a “guerra fiscal” entre estados.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase' }}>
                3) A solução — unificação em dois tributos
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">IBS — Imposto sobre Bens e Serviços</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Substitui ICMS (estadual) e ISS (municipal).
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">CBS — Contribuição sobre Bens e Serviços</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Substitui PIS e COFINS (federais).
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Typography variant="body2" color="text.secondary">
                O <strong>Imposto Seletivo</strong> incide sobre produtos/serviços nocivos (ex.: cigarros, álcool). Cesta básica:
                <strong> alíquota zero</strong>. Reduções de alíquota IBS/CBS: <strong>60%</strong> (saúde e educação) e{' '}
                <strong>30%</strong> (serviços profissionais).
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
                    4.1 Imposto “por fora”
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preço e imposto discriminados separadamente melhoram a transparência para o consumidor.
                  </Typography>
                  <ReactApexChart
                    type="donut"
                    height={310}
                    series={aliquotaChart.series}
                    options={aliquotaChart.options}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Exemplo: preço do produto R$ 100, imposto R$ 26,50 → preço final R$ 126,50.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
                    4.2 Crédito financeiro
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    O IBS/CBS pago na compra gera crédito para abater no imposto da venda. Tributa-se apenas o valor agregado em
                    cada etapa.
                  </Typography>
                  <ReactApexChart type="bar" height={310} series={creditoChart.series} options={creditoChart.options} />
                  <Typography variant="caption" color="text.secondary">
                    Empresas do Simples poderão optar por recolher IBS/CBS “por fora” para gerar crédito ao cliente.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
                  4.3 Split Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ao pagar via Pix/cartão, o sistema separa automaticamente o valor do IBS/CBS e remete ao governo. A empresa
                  recebe o valor líquido. Impacta o fluxo de caixa — será preciso ajustar controles financeiros.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
              Setores com redução de alíquota
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1.5} useFlexGap sx={{ mt: 2 }}>
              {PILL_ITEMS.map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 999,
                    bgcolor: alpha(theme.palette[item.color || 'primary'].main, 0.08),
                    border: `1px solid ${alpha(theme.palette[item.color || 'primary'].main, 0.24)}`,
                  }}
                >
                  <Chip
                    label={item.chip}
                    size="small"
                    color={item.color || 'primary'}
                    sx={{ fontWeight: 700 }}
                  />
                  <Typography variant="body2">{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card id="timeline" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
              5) Cronograma — 2026 a 2033
            </Typography>
            <Stack spacing={3} sx={{ position: 'relative', mt: 3, pl: 4 }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  bottom: 8,
                  left: 16,
                  width: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.25),
                }}
              />
              {TIMELINE.map((item) => (
                <Stack key={item.year} direction="row" spacing={2}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `4px solid ${item.important ? theme.palette.warning.main : theme.palette.primary.main}`,
                      bgcolor: 'background.paper',
                      mt: 0.5,
                    }}
                  />
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.year}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.note}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
                  Checklist — ações iniciais
                </Typography>
                <List dense sx={{ mt: 2 }}>
                  {CHECKLIST.map((item) => (
                    <ListItem key={item} sx={{ alignItems: 'flex-start', py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 28, mt: 0.4 }}>
                        <Iconify icon="solar:check-circle-bold-duotone" width={22} color={theme.palette.success.main} />
                      </ListItemIcon>
                      <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} primary={item} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 3,
                height: '100%',
                bgcolor: alpha(theme.palette.secondary.main, 0.08),
                border: `1px dashed ${alpha(theme.palette.secondary.main, 0.3)}`,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 800 }}>
                    Converse com a Attualize
                  </Typography>
                  <Typography variant="h5">Diagnóstico personalizado</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Entenda como adaptar sua empresa para o IBS/CBS, split payment e novas alíquotas com o acompanhamento do nosso
                    time.
                  </Typography>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Button
                    component={NextLink}
                    href="https://wa.me/5541996982267?text=Ol%C3%A1%2C%20quero%20um%20diagn%C3%B3stico%20da%20Reforma%20Tribut%C3%A1ria%20para%20minha%20empresa."
                    target="_blank"
                    rel="noopener"
                    variant="contained"
                    startIcon={<Iconify icon="solar:whatsapp-bold" />}
                    fullWidth
                  >
                    Falar no WhatsApp
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" align="center">
          Material introdutório. Alguns pontos ainda dependem de regulamentação. Acompanhe atualizações oficiais.
        </Typography>
      </Stack>
    </Container>
  );
}

