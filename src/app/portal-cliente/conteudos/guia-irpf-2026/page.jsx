'use client';

import { useMemo } from 'react';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Grid,
  List,
  Stack,
  Button,
  Divider,
  ListItem,
  Container,
  Typography,
  CardContent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const HIGHLIGHTS = [
  {
    title: 'Dividendos acima de R$ 50 mil/mês',
    description: 'Retenção na fonte de 10% por empresa/sócio sobre o valor excedente.',
    kpi: 'Limite de R$ 50 mil',
    helper: 'Lucros apurados até 31/12/2025 permanecem isentos (pagáveis até 2028 se aprovados).',
  },
  {
    title: 'IRPF Mínimo (IRPFM)',
    description: 'Tributação mínima para renda global superior a R$ 600 mil/ano, chegando a 10% a partir de R$ 1,2 mi.',
    kpi: 'Até 10% progressivo',
    helper: null,
  },
  {
    title: 'Rendimentos do trabalho',
    description: 'Isenção até R$ 5.000/mês e descontos progressivos entre R$ 5.000 e R$ 7.350.',
    kpi: 'R$ 5.000 isentos',
    helper: null,
  },
];

const TIMELINE = [
  {
    title: '31/12/2025 — Aprovar DF/2025 e distribuir lucros',
    description: 'Garantir a isenção de lucros apurados em 2025 (pagáveis até 2028).',
    important: true,
  },
  {
    title: '01/01/2026 — Início previsto da tributação de dividendos',
    description: 'Retenção de 10% sobre o excedente de R$ 50 mil/mês por empresa/sócio.',
  },
  {
    title: 'Até 30/04/2026 — Hipótese de adiamento',
    description: 'Tema em discussão no Senado. Acompanhar atualizações oficiais.',
  },
];

const CHECKLIST = [
  'Simular impacto da retenção de dividendos no fluxo de caixa dos sócios.',
  'Definir governança para distribuir lucros apurados até 2025 dentro do prazo.',
  'Revisar pró-labore e políticas de distribuição considerando o IRPFM.',
  'Atualizar contratos sociais e acordos de sócios com as novas regras.',
  'Planejar comunicação com sócios e investidores sobre mudanças.',
];

const QUICK_SUMMARY = [
  {
    icon: 'solar:alarm-bold-duotone',
    title: 'Prazo curto',
    description:
      'Lucros de 2025 só permanecem isentos se distribuídos até 31/12/2025. Depois disso, o excedente paga 10% na fonte.',
  },
  {
    icon: 'solar:chart-bold-duotone',
    title: 'Impacto direto',
    description: 'Quem recebe mais de R$ 600 mil/ano terá IRPF mínimo. Em R$ 1,2 mi a alíquota chega a 10%.',
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'Proteja o caixa',
    description: 'Reorganize retirada de dividendos e pró-labore para evitar surpresas quando a regra começar.',
  },
];

const NEXT_MOVES = [
  {
    icon: 'solar:target-bold-duotone',
    title: 'Defina o plano 2025',
    description: 'Mapeie lucros acumulados e combine com os sócios uma agenda para distribuição antes do prazo.',
  },
  {
    icon: 'solar:document-bold-duotone',
    title: 'Revise contratos',
    description: 'Atualize acordos e cláusulas de remuneração para refletir o IRPFM e retenções automáticas.',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Alinhe comunicação',
    description: 'Compartilhe o novo cenário com sócios e líderes para reduzir resistência às mudanças.',
  },
];

export default function GuiaIrpf2026Page() {
  const theme = useTheme();

  const lineChartConfig = useMemo(
    () => ({
      series: [
        {
          name: 'Alíquota mínima (%)',
          data: [0, 2, 5, 8, 10],
        },
      ],
      options: {
        chart: {
          type: 'line',
          height: 300,
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        stroke: {
          curve: 'smooth',
          width: 4,
          colors: [theme.palette.primary.dark],
        },
        markers: {
          size: 4,
          colors: [theme.palette.common.white],
          strokeColors: theme.palette.primary.dark,
          strokeWidth: 2,
          hover: { size: 6 },
        },
        dataLabels: { enabled: false },
        colors: [theme.palette.primary.dark],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 0.5,
            opacityFrom: 0.35,
            opacityTo: 0.05,
            stops: [0, 100],
            colorStops: [
              {
                offset: 0,
                color: alpha(theme.palette.primary.dark, 0.35),
                opacity: 0.35,
              },
              {
                offset: 100,
                color: alpha(theme.palette.primary.dark, 0.05),
                opacity: 0.05,
              },
            ],
          },
        },
        xaxis: {
          categories: ['0', 'R$ 300k', 'R$ 600k', 'R$ 900k', 'R$ 1,2 mi'],
          labels: { style: { colors: theme.palette.text.secondary } },
          axisBorder: { color: alpha(theme.palette.text.secondary, 0.2) },
          axisTicks: { color: alpha(theme.palette.text.secondary, 0.2) },
        },
        yaxis: {
          max: 12,
          labels: {
            formatter: (value) => `${value}%`,
            style: { colors: theme.palette.text.secondary },
          },
        },
        grid: {
          borderColor: alpha(theme.palette.text.secondary, 0.12),
          strokeDashArray: 5,
        },
        tooltip: {
          theme: theme.palette.mode,
          y: { formatter: (value) => `${value}%` },
        },
      },
    }),
    [theme]
  );

  const dividendChartConfig = useMemo(
    () => ({
      series: [
        {
          name: 'Dividendos (R$ mil)',
          type: 'column',
          data: [40, 45, 60, 55, 70, 48, 52, 65, 45, 58, 62, 49],
        },
        {
          name: 'Limite isento',
          type: 'line',
          data: Array(12).fill(50),
        },
      ],
      options: {
        chart: {
          stacked: false,
          toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: {
          width: [0, 4],
          curve: 'straight',
          colors: [theme.palette.warning.main, theme.palette.primary.dark],
        },
        colors: [theme.palette.warning.main, theme.palette.primary.dark],
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: '45%',
          },
        },
        xaxis: {
          categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
          labels: { style: { colors: theme.palette.text.secondary } },
          axisBorder: { color: alpha(theme.palette.text.secondary, 0.2) },
          axisTicks: { color: alpha(theme.palette.text.secondary, 0.2) },
        },
        yaxis: [
          {
            labels: { style: { colors: theme.palette.text.secondary }, formatter: (value) => `${value}` },
          },
        ],
        grid: {
          borderColor: alpha(theme.palette.text.secondary, 0.12),
          strokeDashArray: 5,
        },
        tooltip: {
          shared: true,
          intersect: false,
          theme: theme.palette.mode,
          y: [
            {
              formatter: (value) => `R$ ${value?.toFixed(0)} mil`,
            },
            {
              formatter: (value) => `Limite: R$ ${value?.toFixed(0)} mil`,
            },
          ],
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          markers: { radius: 8 },
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
              background: `radial-gradient(100% 110% at 100% 0%, ${alpha(theme.palette.warning.main, 0.2)} 0%, transparent 60%)`,
            }}
          />
          <Stack spacing={2.5} position="relative">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip icon={<Iconify icon="solar:book-bookmark-bold-duotone" />} label="Guia IRPF 2026" color="warning" />
              <Chip icon={<Iconify icon="solar:sparkle-bold-duotone" />} label="Novo" variant="outlined" />
            </Stack>
            <Typography variant="h3">Fim da isenção de dividendos e IRPF mínimo</Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={760}>
              O PL 1.087/2025 altera a tributação de lucros e dividendos a partir de 2026, cria o Imposto de Renda
              Mínimo (IRPFM) progressivo e amplia a faixa de isenção do trabalho. Veja o que muda, prazos e como se
              preparar.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={1}>
              <Button
                component={NextLink}
                href="https://wa.me/5541996982267?text=Ol%C3%A1%2C%20quero%20regularizar%20minhas%20retiradas%20de%20lucro%20ainda%20em%202025%20para%20pagar%20menos%20impostos"
                target="_blank"
                rel="noopener"
                variant="contained"
                startIcon={<Iconify icon="solar:whatsapp-bold-duotone" />}
              >
                Falar com a Attualize
              </Button>
              <Button
                component={NextLink}
                href="https://www12.senado.leg.br/ecidadania/visualizacaomateria?id=167836"
                target="_blank"
                rel="noopener"
                variant="outlined"
                startIcon={<Iconify icon="solar:document-bold-duotone" />}
              >
                Acompanhar o PL 1.087/2025
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          <Grid xs={12} md={7}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                bgcolor: alpha(theme.palette.warning.main, 0.08),
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      icon={<Iconify icon="solar:idea-bold-duotone" />}
                      label="Resumo em 2 minutos"
                      color="warning"
                    />
                    <Chip label="Importante" color="error" variant="outlined" />
                  </Stack>
                  <Typography variant="h5">O que você precisa saber agora</Typography>
                  <Stack spacing={1.5}>
                    {QUICK_SUMMARY.map((item) => (
                      <Stack key={item.title} direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.warning.main, 0.18),
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
          <Grid xs={12} md={5}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Chip icon={<Iconify icon="solar:flag-bold-duotone" />} label="Versão simples" color="primary" />
                  <Typography variant="h5">Próximos movimentos</Typography>
                  <Stack spacing={1.5}>
                    {NEXT_MOVES.map((item) => (
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
                    Use esta versão curta em reuniões com sócios para reforçar urgência (prazo), impacto financeiro e o plano
                    sugerido. Esses gatilhos facilitam a tomada de decisão.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {HIGHLIGHTS.map((item) => (
            <Grid key={item.title} item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.light, 0.12),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" color="warning.main" sx={{ textTransform: 'uppercase', fontWeight: 800 }}>
                      Destaque
                    </Typography>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                    <Typography variant="subtitle1" color="warning.dark" fontWeight={800}>
                      {item.kpi}
                    </Typography>
                    {item.helper && (
                      <Typography variant="caption" color="text.secondary">
                        {item.helper}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
                    ALIQUOTA    
                  </Typography>
                  <Typography variant="h5">IRPFM — como a alíquota mínima cresce</Typography>
                  <Typography variant="body2" color="text.secondary">
                    A linha azul mostra a evolução da alíquota mínima do IRPFM conforme a renda global anual aumenta. O objetivo é
                    garantir um patamar mínimo de tributação para altas rendas.
                  </Typography>
                  <ReactApexChart type="line" height={320} series={lineChartConfig.series} options={lineChartConfig.options} />
                  <Typography variant="caption" color="text.secondary">
                    Dica: a partir de R$ 600 mil/ano a alíquota começa a subir e chega a 10% em R$ 1,2 mi.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
                    RETENÇÃO NA FONTE
                  </Typography>
                  <Typography variant="h5">Dividendos — quando ocorre a retenção na fonte</Typography>
                  <Typography variant="body2" color="text.secondary">
                    O gráfico compara os dividendos mensais de um sócio com o limite isento. Valores acima de R$ 50 mil/mês
                    sofrem retenção de 10% na fonte.
                  </Typography>
                  <ReactApexChart
                    type="line"
                    height={320}
                    series={dividendChartConfig.series}
                    options={dividendChartConfig.options}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Exemplo: se a empresa paga R$ 70 mil em um mês, apenas R$ 20 mil excedentes sofrem retenção de 10%.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
              Timeline
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, mb: 3 }}>
              Prazos cruciais
            </Typography>
            <Stack spacing={3} position="relative" sx={{ pl: { xs: 2, sm: 4 } }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  bottom: 8,
                  left: 14,
                  width: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.25),
                }}
              />
              {TIMELINE.map((item) => (
                <Stack key={item.title} spacing={1.2} direction="row">
                  <Box
                    sx={{
                      mt: 0.5,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: `4px solid ${item.important ? theme.palette.warning.main : theme.palette.primary.main}`,
                      bgcolor: 'background.paper',
                    }}
                  />
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
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid xs={12} md={7}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 800 }}>
                  Checklist
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>
                  Ações prioritárias para 2025/2026
                </Typography>
                <List dense>
                  {CHECKLIST.map((item) => (
                    <ListItem key={item} sx={{ alignItems: 'flex-start', py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <Iconify icon="solar:check-circle-bold-duotone" width={22} color={theme.palette.success.main} />
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                        primary={item}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={5}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', fontWeight: 800 }}>
                    Precisa de apoio?
                  </Typography>
                  <Typography variant="h5">Fale com a Attualize</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agende um diagnóstico personalizado para planejar o impacto da nova tributação de dividendos e do IRPFM
                    no seu negócio e nos sócios.
                  </Typography>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      component={NextLink}
                      href="https://wa.me/5541996982267?text=Ol%C3%A1%2C%20quero%20regularizar%20minhas%20retiradas%20de%20lucro%20ainda%20em%202025%20para%20pagar%20menos%20impostos"
                      target="_blank"
                      rel="noopener"
                      variant="contained"
                      startIcon={<Iconify icon="solar:whatsapp-bold" />}
                      fullWidth
                    >
                      Falar no WhatsApp
                    </Button>
                    <Button
                      component={NextLink}
                      href="mailto:contato@attualizecontabilidade.com.br"
                      variant="outlined"
                      startIcon={<Iconify icon="solar:mailbox-bold-duotone" />}
                      fullWidth
                    >
                      Enviar e-mail
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" align="center">
          Material ilustrativo com base no texto do PL 1.087/2025. Acompanhe atualizações legislativas e busque orientação
          profissional.
        </Typography>
      </Stack>
    </Container>
  );
}

