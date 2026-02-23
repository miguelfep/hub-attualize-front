'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Tab,
  Grid,
  Tabs,
  Paper,
  Stack,
  Table,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const TAB_OPTIONS = [
  { label: 'Natureza Jurídica', icon: 'solar:document-bold-duotone', value: 0 },
  { label: 'Regime Tributário', icon: 'solar:calculator-bold-duotone', value: 1 },
];

const tabContentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// ----------------------------------------------------------------------

export function NaturezaTributacaoTabs() {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const SECTION_BG = isLight
    ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.grey[500], 0.04)} 50%, ${theme.palette.background.default} 100%)`
    : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.grey[900], 0.5)} 50%, ${theme.palette.background.default} 100%)`;

  return (
    <Box
      component="section"
      aria-labelledby="planejamento-estrategico-heading"
      sx={{
        py: { xs: 10, md: 15 },
        position: 'relative',
        background: SECTION_BG,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          maxWidth: 600,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, isLight ? 0.2 : 0.3)}, transparent)`,
        },
      }}
    >
      <Container>
        <Stack
          component={MotionViewport}
          spacing={2}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <m.div variants={varFade().inDown}>
            <Typography
              id="planejamento-estrategico-heading"
              variant="h2"
              sx={{ fontWeight: 800 }}
            >
              Planejamento Estratégico
            </Typography>
          </m.div>
          <m.div variants={varFade().inUp}>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
            >
              A escolha certa entre Natureza Jurídica e Regime Tributário pode
              reduzir sua carga tributária em mais de 50%.
            </Typography>
          </m.div>
        </Stack>

        {/* Tabs elegantes e compactas */}
        <Stack alignItems="center" sx={{ mb: 8 }}>
          <Box
            component={m.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              p: 0.6,
              borderRadius: 2.2, // Um pouco mais arredondado para um ar moderno
              display: 'inline-flex',
              position: 'relative',
              // Vidro Jateado sutil
              bgcolor: isLight
                ? alpha(theme.palette.grey[500], 0.08)
                : alpha(theme.palette.common.black, 0.2),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: (t) => `inset 0 1px 2px ${alpha(t.palette.common.black, 0.05)}`,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{
                minHeight: 44,
                '& .MuiTabs-flexContainer': {
                  gap: 0.5,
                  position: 'relative',
                  zIndex: 1,
                },
                '& .MuiTabs-indicator': {
                  height: '100%',
                  borderRadius: 1.8,
                  bgcolor: isLight ? 'common.white' : alpha(theme.palette.primary.main, 0.2),
                  boxShadow: isLight ? theme.customShadows?.z8 : 'none',
                  // Borda sutil no indicador para o modo dark
                  border: !isLight ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
              }}
            >
              {TAB_OPTIONS.map((tab) => {
                const isSelected = tabValue === tab.value;

                return (
                  <Tab
                    key={tab.value}
                    value={tab.value}
                    disableRipple // Remove o efeito de "clique de Android" para um ar mais limpo
                    icon={<Iconify icon={tab.icon} width={20} />}
                    iconPosition="start"
                    label={tab.label}
                    sx={{
                      minHeight: 44,
                      px: 3,
                      py: 1,
                      zIndex: 2,
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 800 : 500,
                      textTransform: 'none',
                      borderRadius: 1.8,
                      color: isSelected ? 'text.primary' : 'text.disabled',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'text.primary',
                        bgcolor: isSelected ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                      },
                      // Ajuste específico para a cor do ícone
                      '& .MuiTab-iconWrapper': {
                        color: isSelected ? 'primary.main' : 'inherit',
                        transition: 'color 0.2s',
                      },
                    }}
                  />
                );
              })}
            </Tabs>
          </Box>
        </Stack>

        {/* Conteúdo das abas: AnimatePresence evita “sumir” ao trocar */}
        <Box sx={{ minHeight: 420 }}>
          <AnimatePresence mode="wait">
            {tabValue === 0 ? (
              <m.div
                key="natureza"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25 }}
                style={{ width: '100%' }}
              >
                <NaturezaJuridicaView isLight={isLight} />
              </m.div>
            ) : (
              <m.div
                key="regime"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25 }}
                style={{ width: '100%' }}
              >
                <RegimeTributarioView isLight={isLight} />
              </m.div>
            )}
          </AnimatePresence>
        </Box>
      </Container>
    </Box>
  );
}

const NATUREZA_ITEMS = [
  {
    title: 'Empresário Individual (EI)',
    desc: 'Opção simples de início, porém sem separação entre bens pessoais e da empresa. Em caso de dívidas, seu patrimônio pessoal responde.',
    highlight: 'Risco Patrimonial Alto',
    icon: 'solar:user-bold-duotone',
  },
  {
    title: 'Sociedade Unipessoal (SLU)',
    desc: 'A melhor opção para quem não tem sócios. Garante a proteção dos bens pessoais (separação patrimonial) sem precisar de capital social mínimo.',
    highlight: 'Segurança e Praticidade',
    icon: 'solar:shield-user-bold-duotone',
  },
  {
    title: 'Sociedade Limitada (LTDA)',
    desc: 'Para clínicas com dois ou mais sócios. Oferece credibilidade no mercado e total flexibilidade para entrada de novos parceiros ou investidores.',
    highlight: 'Ideal para Expansão',
    icon: 'solar:users-group-rounded-bold-duotone',
  },
];

const NATUREZA_TABLE_ROWS = [
  {
    tipo: 'EI',
    protecao: 'Não — patrimônio pessoal responde',
    socios: 'Apenas 1',
    capital: 'Não exige',
    indicado: 'Início rápido, baixo custo',
  },
  {
    tipo: 'SLU',
    protecao: 'Sim — separação patrimonial',
    socios: '1',
    capital: 'Não exige mínimo',
    indicado: 'Quem atua sozinho e quer proteção',
  },
  {
    tipo: 'LTDA',
    protecao: 'Sim — separação patrimonial',
    socios: '2 ou mais',
    capital: 'Não exige mínimo',
    indicado: 'Clínicas com sócios ou expansão',
  },
];

function NaturezaJuridicaView({ isLight }) {
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      <Grid container spacing={3}>
        {NATUREZA_ITEMS.map((item, index) => (
          <Grid item xs={12} md={4} key={item.title}>
            <ContentCard item={item} isLight={isLight} />
          </Grid>
        ))}
      </Grid>

      {/* Tabela de comparação: Natureza Jurídica */}
      <Typography component="h3" variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Comparativo: EI, SLU e LTDA para clínicas de estética
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          bgcolor: isLight
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.06),
          overflow: 'hidden',
        }}
      >
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 800 }}>Natureza</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Proteção patrimonial</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Sócios</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Capital social</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Indicado para</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {NATUREZA_TABLE_ROWS.map((row) => (
              <TableRow
                key={row.tipo}
                sx={{ '&:last-child td': { border: 0 } }}
              >
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {row.tipo}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {row.protecao}
                </TableCell>
                <TableCell>{row.socios}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{row.capital}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {row.indicado}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

const REGIME_CARDS = [
  {
    title: 'Simples Nacional (Fator R)',
    desc: 'Tributação unificada. Se sua folha de pagamento (incluindo pró-labore) for ≥ 28% do faturamento, você cai no Anexo III.',
    highlight: 'Alíquota: de 6% a 15,5%',
    icon: 'solar:graph-up-bold-duotone',
  },
  {
    title: 'Lucro Presumido',
    desc: 'Indicado para clínicas com faturamento acima de R$ 4,8 milhões/ano ou com margens de lucro muito elevadas e folha baixa.',
    highlight: 'Presunção de Lucro: 32%',
    icon: 'solar:wad-of-money-bold-duotone',
  },
  {
    title: 'ISS Municipal',
    desc: 'Imposto que varia conforme sua cidade (2% a 5%). Em alguns municípios existem regimes de ISS Fixo para profissionais liberais.',
    highlight: 'Variação Regional',
    icon: 'solar:map-point-bold-duotone',
  },
];

const REGIME_TABLE_ROWS = [
  {
    regime: 'Simples (Anexo III)',
    faturamento: 'Até R$ 4,8M/ano',
    aliquota: '6%',
    vantagem: 'Menor imposto para folha alta (Fator R)',
  },
  {
    regime: 'Simples (Anexo V)',
    faturamento: 'Até R$ 4,8M/ano',
    aliquota: '15,5%',
    vantagem: 'Simplificação de impostos',
  },
  {
    regime: 'Lucro Presumido',
    faturamento: 'Até R$ 78M/ano',
    aliquota: '13,33% a 16,33%',
    vantagem: 'Ideal para lucro alto e folha baixa',
  },
  {
    regime: 'MEI',
    faturamento: 'Até R$ 81k/ano',
    aliquota: 'Fixo (~R$ 75)',
    vantagem: 'Baixíssimo custo, mas limitado',
  },
];

function RegimeTributarioView({ isLight }) {
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      <Grid container spacing={3}>
        {REGIME_CARDS.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <ContentCard item={item} isLight={isLight} />
          </Grid>
        ))}
      </Grid>

      <Typography component="h3" variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Comparativo de regimes tributários para clínicas
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          bgcolor: isLight
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.06),
          overflow: 'hidden',
        }}
      >
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 800 }}>Regime</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Faturamento limite</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Alíquota inicial</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Vantagem principal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {REGIME_TABLE_ROWS.map((row) => (
              <TableRow
                key={row.regime}
                sx={{ '&:last-child td': { border: 0 } }}
              >
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {row.regime}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {row.faturamento}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{row.aliquota}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {row.vantagem}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paper
        component="aside"
        aria-label="Atenção ao Fator R"
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.08),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Iconify
          icon="solar:danger-bold"
          width={32}
          sx={{ color: 'warning.main', flexShrink: 0 }}
        />
        <Typography variant="body2" sx={{ color: 'warning.darker', fontWeight: 500 }}>
          <strong>Atenção ao Fator R:</strong> Se sua folha de pagamento for
          menor que 28% do faturamento, seu imposto sobe de 6% para 15,5%
          automaticamente. Nós ajudamos você a planejar o pró-labore para evitar
          esse aumento.
        </Typography>
      </Paper>
    </Stack>
  );
}

function ContentCard({ item, isLight }) {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2.5,
        transition: 'all 0.3s ease',
        bgcolor: isLight
          ? alpha(theme.palette.background.paper, 0.8)
          : alpha(theme.palette.background.paper, 0.06),
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
          boxShadow: theme.customShadows?.z12,
        },
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Iconify icon={item.icon} width={24} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {item.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', lineHeight: 1.6 }}
        >
          {item.desc}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textTransform: 'uppercase',
          }}
        >
          {item.highlight}
        </Typography>
      </Stack>
    </Paper>
  );
}
