'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { useGetPlanosIr } from 'src/actions/ir';

import { Iconify } from 'src/components/iconify';

import IrCheckoutDialog from './IrCheckoutDialog';

// ─── Animações ───────────────────────────────────────────────────────────────

const bounce = keyframes`
  0%   { transform: translateY(-15%); }
  50%  { transform: translateY(0); }
  100% { transform: translateY(-15%); }
`;

// ─── Metadados estáticos dos planos (conteúdo) ───────────────────────────────

const PLANO_META = {
  basica: {
    nome: 'Básica',
    destaque: false,
    inclusos: [
      'Assalariado com 1 fonte de renda',
      'Sem dependentes',
      'Até 3 bens e direitos',
      'Deduções padrão',
      'Envio à Receita Federal',
      'Suporte via WhatsApp',
    ],
    naoInclusos: ['Carnê-leão', 'Ganho de capital', 'Bolsa de valores'],
  },
  intermediaria: {
    nome: 'Intermediária',
    destaque: true,
    inclusos: [
      'Até 3 fontes de renda',
      'Até 3 dependentes',
      'Bens e direitos (aluguéis, investimentos)',
      'Deduções com saúde e educação',
      'Envio à Receita Federal',
      'Suporte via WhatsApp',
    ],
    naoInclusos: ['Carnê-leão', 'Ganho de capital', 'Bolsa de valores'],
  },
  completa: {
    nome: 'Completa',
    destaque: false,
    inclusos: [
      'Profissional liberal / MEI',
      'Fontes de renda ilimitadas',
      'Dependentes ilimitados',
      'Bens e direitos ilimitados',
      'Carnê-leão incluso',
      'Ganho de capital incluso',
      'Bolsa de valores incluso',
      'Suporte prioritário',
    ],
    naoInclusos: [],
  },
};

// ─── Planos de fallback — usados enquanto a API /ir/planos não está disponível ──

const PLANOS_FALLBACK = [
  {
    _id: 'basica',
    modalidade: 'basica',
    titulo: 'IR Básica',
    descricao: 'Ideal para assalariados com uma fonte de renda, sem bens ou investimentos.',
    valorCheio: 299.9,
    tipoDesconto: 'percentual',
    desconto: 33,
    valorFinal: 199.9,
    loteAtual: 1,
    loteDescricao: '1º Lote — Antecipe e economize',
    dataFimLote: '2026-03-31T23:59:59.000Z',
    vagasRestantes: 18,
    disponivel: true,
    ano: 'IR2026',
    year: 2026,
    ordem: 1,
  },
  {
    _id: 'intermediaria',
    modalidade: 'intermediaria',
    titulo: 'IR Intermediária',
    descricao: 'Para quem possui bens, aluguéis, investimentos ou mais de uma fonte de renda.',
    valorCheio: 449.9,
    tipoDesconto: 'percentual',
    desconto: 16,
    valorFinal: 379.9,
    loteAtual: 1,
    loteDescricao: '1º Lote',
    dataFimLote: '2026-03-31T23:59:59.000Z',
    vagasRestantes: 25,
    disponivel: true,
    ano: 'IR2026',
    year: 2026,
    ordem: 2,
  },
  {
    _id: 'completa',
    modalidade: 'completa',
    titulo: 'IR Completa',
    descricao: 'Para profissionais liberais, MEI, múltiplas fontes de renda e situações complexas.',
    valorCheio: null,
    tipoDesconto: null,
    desconto: null,
    valorFinal: null,
    loteAtual: null,
    loteDescricao: null,
    dataFimLote: null,
    vagasRestantes: null,
    disponivel: false,
    ano: 'IR2026',
    year: 2026,
    ordem: 3,
  },
];

// ─── Lotes de referência (exibição visual) ────────────────────────────────────

const LOTES_REF = [
  { prazo: 'Até 31/03/2026', desconto: '~20% OFF', status: 'ativo' },
  { prazo: 'Até 30/04/2026', desconto: '~10% OFF', status: 'proximo' },
  { prazo: 'Até 31/05/2026', desconto: 'Preço cheio', status: 'futuro' },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    pergunta: 'Quem é obrigado a declarar o Imposto de Renda em 2026?',
    resposta:
      'Estão obrigados a declarar quem recebeu rendimentos tributáveis acima de R$ 35.584,00 em 2025 ou receita bruta da atividade rural acima de R$ 177.920,00. Também deve declarar quem teve rendimentos isentos, não tributáveis ou tributados exclusivamente na fonte acima de R$ 200.000,00, quem obteve ganho de capital com alienação de bens ou direitos, quem realizou operações em bolsa de valores acima de R$ 40 mil, quem tinha bens ou direitos acima de R$ 800.000,00 em 31/12/2025, ou quem passou à condição de residente no Brasil em 2025.',
  },
  {
    pergunta: 'Quais são os prazos para a declaração em 2026?',
    resposta:
      'O prazo para entrega começa em 23 de março e encerra em 29 de maio de 2026. O programa para fazer a declaração fica disponível a partir de 20 de março.',
  },
  {
    pergunta: 'Como funcionam os lotes de restituição este ano?',
    resposta:
      'Este ano serão 4 lotes de restituição, nas seguintes datas: 29/05, 30/06, 31/07 e 31/08. A prioridade segue a ordem legal: 80 anos ou mais; 60 anos ou mais, deficientes e portadores de moléstia grave; professores; quem usou a declaração pré-preenchida e optou pelo Pix; e demais contribuintes.',
  },
  {
    pergunta: 'O que é a Restituição Automática?',
    resposta:
      'É uma novidade para quem não estava obrigado a declarar em 2025, mas tinha direito à restituição por IR retido na fonte em 2024. A Receita elaborará a declaração automaticamente a partir de 15 de junho para quem tem direito a até R$ 1.000, CPF regular e chave Pix vinculada ao CPF.',
  },
  {
    pergunta: 'Quais documentos preciso reunir?',
    resposta:
      'Você precisará de: Informe de Rendimentos de todos os empregadores, extratos de bancos e corretoras, comprovantes de despesas médicas e educação, escritura ou documentos de bens e imóveis, comprovantes de dependentes, recibos de aluguéis e CNPJ se tiver empresa.',
  },
  {
    pergunta: 'Como funciona o processo após a contratação?',
    resposta:
      'Após o pagamento, você receberá via WhatsApp e e-mail um link para acessar o nosso portal de documentos. Basta enviar digitalmente todos os seus documentos. Nosso contador analisa, prepara a declaração e envia para sua aprovação antes de submeter à Receita Federal.',
  },
];

// ─── Obrigatoriedades ─────────────────────────────────────────────────────────

const OBRIGADOS = [
  {
    icon: 'solar:wallet-money-bold-duotone',
    titulo: 'Renda tributável acima de R$ 35.584,00',
    desc: 'Salário, pró-labore, aluguéis e demais rendimentos tributáveis em 2025',
  },
  {
    icon: 'solar:buildings-bold-duotone',
    titulo: 'Patrimônio acima de R$ 800 mil',
    desc: 'Bens e direitos como imóveis, veículos, aplicações e participações societárias em 31/12/2025',
  },
  {
    icon: 'solar:chart-bold-duotone',
    titulo: 'Operações em bolsa de valores',
    desc: 'Alienações acima de R$ 40 mil ou com ganhos líquidos sujeitos a imposto',
  },
  {
    icon: 'solar:buildings-3-bold-duotone',
    titulo: 'Ganho de capital',
    desc: 'Lucro na venda de imóvel, veículo ou outros bens acima do valor pago',
  },
  {
    icon: 'solar:user-id-bold-duotone',
    titulo: 'Passou a residir no Brasil em 2025',
    desc: 'Quem se tornou residente fiscal brasileiro a qualquer momento em 2025',
  },
  {
    icon: 'solar:leaf-bold-duotone',
    titulo: 'Atividade rural',
    desc: 'Quem obteve receita bruta da atividade rural acima de R$ 177.920,00',
  },
];

// ─── Benefícios ───────────────────────────────────────────────────────────────

const BENEFICIOS = [
  { icon: 'solar:diploma-bold-duotone', texto: 'Contadores especializados em IRPF' },
  { icon: 'solar:shield-check-bold-duotone', texto: 'Análise de riscos fiscais incluída' },
  { icon: 'solar:smartphone-bold-duotone', texto: '100% digital — sem sair de casa' },
  { icon: 'solar:clock-circle-bold-duotone', texto: 'Entrega em até 5 dias úteis' },
  { icon: 'solar:chat-round-bold-duotone', texto: 'Suporte via WhatsApp do início ao fim' },
  { icon: 'solar:eye-bold-duotone', texto: 'Portal online para acompanhar sua declaração' },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export function IrLandingPage() {
  const _theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [faqAberto, setFaqAberto] = useState(false);

  const { data: planosApiRaw, isLoading: loadingPlanos } = useGetPlanosIr();

  // Usa dados da API quando disponíveis; caso contrário, usa fallback estático
  const planosApi = planosApiRaw && planosApiRaw.length > 0 ? planosApiRaw : (!loadingPlanos ? PLANOS_FALLBACK : []);

  const handleContratar = (planoApi) => {
    setPlanoSelecionado(planoApi);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* ═══════════════ HERO ═══════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'common.black',
          backgroundImage: `linear-gradient(270deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.8) 35%, rgba(0, 0, 0, 0.62) 65%, rgba(0, 0, 0, 0.95) 100%), url(${CONFIG.site.basePath}/assets/images/banners/banner-irpf-2025.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'common.white',
          pt: { xs: 10, md: 14 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid xs={12} md={7}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.800rem',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
                  color: 'warning.main',
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 2.5,
                  animation: `${bounce} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                }}
              >
                <Iconify icon="solar:calendar-bold" width={20} color="warning.lighter" />
                Prazo final: 29/05/2026
              </Box>

              <Typography
                variant="h1"
                fontWeight={800}
                sx={{
                  lineHeight: 1.1,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                }}
              >
                Declaração de<br />
                <Box
                  component="span"
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    color: 'warning.main',
                  }}
                >
                  Imposto de Renda <br />
                  <Box
                    component="svg"
                    viewBox="0 0 200 20"
                    fill="none"
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      left: 0,
                      width: '100%',
                      overflow: 'visible',
                      color: (theme) => alpha(theme.palette.primary.lighter, 0.25),
                    }}
                  >
                    <path
                      d="M5 15Q40 5 100 15T200 15"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </Box>
                </Box>
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                  }}
                >
                  2026
                </Box>
              </Typography>

              <Typography
                variant="h6"
                fontWeight={400}
                sx={{ opacity: 0.85, mb: 5, lineHeight: 1.6, maxWidth: 540 }}
              >
                Deixe com a Attualize. Seu IR declarado com segurança, sem sair de casa
                e com acompanhamento completo via WhatsApp.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  onClick={() => {
                    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    px: 4,
                    height: 56,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: (theme) => `0 20px 40px -10px ${alpha(theme.palette.warning.main, 0.5)}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: (theme) => `0 25px 50px -12px ${alpha(theme.palette.warning.main, 0.6)}`,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: 0, width: '100%', height: '100%',
                      background: 'linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0))',
                      transform: 'translateY(100%)',
                      transition: 'transform 0.3s',
                    },
                    '&:hover::after': { transform: 'translateY(0)' },
                  }}
                  endIcon={<Iconify icon="eva:arrow-downward-fill" />}
                >
                  Ver planos e preços
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    height: 56,
                    fontSize: '1.1rem',
                    color: 'common.white',
                    borderColor: alpha('#fff', 0.5),
                    borderWidth: 2,
                    '&:hover': { borderColor: 'common.white', borderWidth: 2, bgcolor: alpha('#fff', 0.05) },
                  }}
                  onClick={() => {
                    document.getElementById('obrigatoriedade')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Preciso declarar?
                </Button>
              </Stack>
            </Grid>

            <Grid xs={12} md={5}>
              <Stack spacing={2}>
                {BENEFICIOS.map((b) => (
                  <Stack
                    key={b.texto}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(_theme.palette.common.white, 0.08),
                      border: '1px solid transparent',
                      transition: 'all 0.25s',
                      backdropFilter: 'blur(1px)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: alpha(_theme.palette.common.white, 0.12),
                        borderColor: alpha(_theme.palette.warning.main, 0.2),
                      },
                    }}
                  >
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(_theme.palette.warning.main, 0.2),
                      color: 'warning.main'
                    }}>
                      <Iconify icon={b.icon} width={24} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {b.texto}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ OBRIGATORIEDADE ═══════════════════════════════════════ */}
      <Box id="obrigatoriedade" sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.neutral' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Obrigatoriedade
            </Typography>
            <Typography variant="h3" fontWeight={700} mt={1}>
              Você precisa declarar o IR 2026?
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1.5} maxWidth={600} mx="auto">
              A declaração é obrigatória para quem se enquadra em ao menos uma das situações
              abaixo relativas ao ano-calendário 2025.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {OBRIGADOS.map((item) => (
              <Grid key={item.titulo} xs={12} sm={6} md={4}>
                <Card sx={{
                  height: '100%',
                  p: 0.5,
                  transition: 'all 0.25s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    boxShadow: (theme) => theme.customShadows?.z12 || theme.shadows[12],
                  },
                }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 1.5,
                          bgcolor: alpha(_theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify icon={item.icon} width={28} color="primary.main" />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={5}>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                px: 4,
                height: 56,
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
              endIcon={<Iconify icon="eva:arrow-downward-fill" />}
            >
              Quero declarar com a Attualize
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ═══════════════ LOTES / PRAZOS ════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 6, md: 8 }, position: 'relative', overflow: 'hidden' }}>
        {/* Círculos decorativos */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03), transform: 'translate(50%, -50%)' }} />

        <Container maxWidth="lg">
          <Box textAlign="center" mb={5}>
            <Typography variant="overline" color="warning.main" fontWeight={700}>
              Preços por lote
            </Typography>
            <Typography variant="h4" fontWeight={700} mt={1}>
              Quanto antes, menor o preço
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Os valores aumentam conforme o prazo se aproxima — contrate agora e economize.
            </Typography>
          </Box>

          {/* Tabela de preços por plano × lote */}
          {!loadingPlanos && planosApi.filter((p) => p.disponivel || p.valorFinal != null).length > 0 && (
            <Card sx={{
              overflowX: 'auto',
              mb: 3,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: (theme) => theme.customShadows?.card || theme.shadows[2],
            }}>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    px: { xs: 1.5, md: 3 },
                    py: 2,
                    textAlign: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                  '& thead th': {
                    bgcolor: 'background.neutral',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                  },
                  '& tbody tr:last-child td': { borderBottom: 0 },
                  '& tbody tr:hover': { bgcolor: alpha(_theme.palette.primary.main, 0.02) },
                }}
              >
                <thead>
                  <Box component="tr">
                    <Box component="th" sx={{ textAlign: 'left !important', minWidth: 130 }}>
                      Lote / Prazo
                    </Box>
                    {planosApi.map((p) => (
                      <Box component="th" key={p._id}>
                        <Typography variant="caption" fontWeight={700} display="block">
                          {p.titulo ?? PLANO_META[p.modalidade]?.nome}
                        </Typography>
                        {p.loteDescricao && p.disponivel && (
                          <Chip label={p.loteDescricao} size="small" color="success" sx={{ mt: 0.5, fontSize: 10 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </thead>
                <tbody>
                  {/* Linha do lote ativo (preço atual) */}
                  <Box
                    component="tr"
                    sx={{ bgcolor: `${alpha(_theme.palette.success.main, 0.04)} !important` }}
                  >
                    <Box component="td" sx={{ textAlign: 'left !important' }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label="Agora" color="success" size="small" sx={{ fontWeight: 700 }} />
                        </Stack>
                        {planosApi[0]?.dataFimLote && (
                          <Typography variant="caption" color="text.secondary">
                            até{' '}
                            {new Date(planosApi[0].dataFimLote).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: '2-digit',
                            })}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    {planosApi.map((p) => (
                      <Box component="td" key={p._id}>
                        {p.disponivel && p.valorFinal != null ? (
                          <Stack alignItems="center" spacing={0.3}>
                            {p.valorCheio != null && p.valorCheio > p.valorFinal && (
                              <Typography variant="caption" color="text.disabled"
                                sx={{ textDecoration: 'line-through' }}>
                                R$ {p.valorCheio.toFixed(2).replace('.', ',')}
                              </Typography>
                            )}
                            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                              R$ {p.valorFinal.toFixed(2).replace('.', ',')}
                            </Typography>
                            {p.tipoDesconto && p.desconto > 0 && (
                              <Chip
                                size="small"
                                color="warning"
                                label={p.tipoDesconto === 'percentual' ? `${p.desconto}% OFF` : `R$ ${p.desconto} OFF`}
                                sx={{ fontSize: 10, fontWeight: 700 }}
                              />
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.disabled">Em breve</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>

                  {/* Linhas dos lotes futuros (estáticos — referência) */}
                  {LOTES_REF.slice(1).map((ref, i) => (
                    <Box component="tr" key={ref.prazo}>
                      <Box component="td" sx={{ textAlign: 'left !important' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Lote {i + 2}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" display="block">
                          {ref.prazo}
                        </Typography>
                      </Box>
                      {planosApi.map((p) => (
                        <Box component="td" key={p._id}>
                          <Typography variant="caption" color="text.secondary">
                            {ref.desconto}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </tbody>
              </Box>
            </Card>
          )}

          {/* Banner de urgência quando há prazo */}
          {planosApi.some((p) => p.dataFimLote && p.disponivel) && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)} 0%, ${alpha(theme.palette.warning.light, 0.08)} 100%)`,
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Iconify icon="eva:clock-outline" width={32} color="warning.main" sx={{ flexShrink: 0 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="warning.dark" fontWeight={700}>
                  Preços do 1º lote válidos por tempo limitado!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Após o prazo, os valores aumentam automaticamente para o próximo lote.
                  Garanta o melhor preço agora.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="warning"
                onClick={() => {
                  document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  flexShrink: 0,
                  display: { xs: 'none', sm: 'flex' },
                  boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.warning.main, 0.4)}`,
                }}
                endIcon={<Iconify icon="eva:arrow-downward-fill" />}
              >
                Ver planos
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* ═══════════════ PLANOS ════════════════════════════════════════════════ */}
      <Box id="planos" sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.neutral' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Planos
            </Typography>
            <Typography variant="h3" fontWeight={700} mt={1}>
              Escolha o plano ideal para você
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Todos os planos incluem análise completa e envio à Receita Federal.
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            {loadingPlanos
              ? [0, 1, 2, 3].map((i) => (
                <Grid key={i} xs={12} md={4}>
                  <Skeleton variant="rounded" height={480} />
                </Grid>
              ))
              : planosApi.map((planoApi) => {
                const meta = PLANO_META[planoApi.modalidade] ?? { destaque: false, inclusos: [], naoInclusos: [] };
                const esgotado = !planoApi.disponivel;
                const temDesconto = planoApi.valorFinal != null && planoApi.valorCheio != null && planoApi.valorFinal < planoApi.valorCheio;
                const badgeDesconto = planoApi.tipoDesconto === 'percentual'
                  ? `${planoApi.desconto}% OFF`
                  : planoApi.tipoDesconto === 'fixo' && planoApi.desconto > 0
                    ? `R$ ${planoApi.desconto} OFF`
                    : null;

                return (
                  <Grid key={planoApi._id ?? planoApi.modalidade} xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        overflow: 'visible',
                        border: meta.destaque ? `2px solid ${_theme.palette.primary.main}` : '1px solid transparent',
                        boxShadow: meta.destaque ? _theme.shadows[16] : _theme.shadows[2],
                        opacity: esgotado ? 0.7 : 1,
                        transition: 'all 0.3s',
                        '&:hover': esgotado ? {} : {
                          transform: 'translateY(-8px)',
                          borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                          boxShadow: (theme) => theme.customShadows?.z24 || theme.shadows[24]
                        },
                      }}
                    >
                      {/* Badge de topo */}
                      {esgotado ? (
                        <Chip label="Em breve" color="default" size="small"
                          sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700 }} />
                      ) : meta.destaque ? (
                        <Chip label="Mais popular" color="primary" size="small"
                          sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700, animation: `${bounce} 2s infinite` }} />
                      ) : badgeDesconto ? (
                        <Chip label={badgeDesconto} color="warning" size="small"
                          sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 700 }} />
                      ) : null}

                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 'inherit', overflow: 'hidden' }}>
                        {/* Título e descrição */}
                        <Box mb={2.5}>
                          <Typography variant="h5" fontWeight={700}>{planoApi.titulo}</Typography>
                          <Typography variant="body2" color="text.secondary" mt={0.5}>
                            {planoApi.descricao}
                          </Typography>
                        </Box>

                        {/* Preço */}
                        <Box mb={2.5}>
                          {esgotado || planoApi.valorFinal == null ? (
                            <Typography variant="h5" color="text.disabled" fontWeight={600}>
                              Consulte valores
                            </Typography>
                          ) : (
                            <>
                              {temDesconto && (
                                <Typography variant="body2" color="text.disabled"
                                  sx={{ textDecoration: 'line-through' }}>
                                  R$ {planoApi.valorCheio.toFixed(2).replace('.', ',')}
                                </Typography>
                              )}
                              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>R$</Typography>
                                <Typography variant="h3" fontWeight={800} color="primary.main" lineHeight={1}>
                                  {planoApi.valorFinal.toFixed(2).replace('.', ',')}
                                </Typography>
                              </Stack>
                            </>
                          )}

                          {/* Info de lote / vagas / prazo */}
                          <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                            {planoApi.loteDescricao && (
                              <Chip label={planoApi.loteDescricao} size="small" color="success" variant="outlined" sx={{ fontSize: 10 }} />
                            )}
                            {planoApi.vagasRestantes !== null && planoApi.vagasRestantes <= 10 && planoApi.vagasRestantes > 0 && (
                              <Chip label={`${planoApi.vagasRestantes} vagas`} size="small" color="warning" sx={{ fontSize: 10, fontWeight: 700 }} />
                            )}
                            {planoApi.dataFimLote && !esgotado && (
                              <Typography variant="caption" color="text.secondary">
                                até {new Date(planoApi.dataFimLote).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        {/* Itens inclusos/não inclusos */}
                        <Stack spacing={1} flex={1} mb={3}>
                          {meta.inclusos.map((item) => (
                            <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                              <Iconify icon="eva:checkmark-circle-2-fill" width={18} color="success.main" sx={{ mt: 0.25, flexShrink: 0 }} />
                              <Typography variant="body2">{item}</Typography>
                            </Stack>
                          ))}
                          {meta.naoInclusos.map((item) => (
                            <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                              <Iconify icon="eva:close-circle-outline" width={18} color="text.disabled" sx={{ mt: 0.25, flexShrink: 0 }} />
                              <Typography variant="body2" color="text.disabled">{item}</Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          variant={meta.destaque ? 'contained' : 'outlined'}
                          fullWidth
                          size="large"
                          disabled={esgotado}
                          onClick={() => handleContratar(planoApi)}
                          sx={{
                            height: 48,
                            ...(meta.destaque && {
                              boxShadow: () => `0 8px 24px ${alpha(_theme.palette.primary.main, 0.4)}`,
                            })
                          }}
                          endIcon={<Iconify icon={esgotado ? 'eva:clock-outline' : 'eva:arrow-forward-fill'} />}
                        >
                          {esgotado ? 'Em breve' : `Contratar`}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>

          {/* Adicionais */}
          <Box mt={5}>
            <Typography variant="subtitle1" fontWeight={700} textAlign="center" mb={3}>
              Serviços adicionais (sob consulta)
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {[
                { nome: 'Carnê-Leão', valor: 'a partir de R$ 300', icon: 'solar:leaf-bold-duotone' },
                { nome: 'Ganho de Capital', valor: 'a partir de R$ 450', icon: 'solar:chart-bold-duotone' },
                { nome: 'Bolsa de Valores', valor: 'a partir de R$ 500', icon: 'solar:chart-2-bold-duotone' },
                { nome: 'Declaração Retificadora', valor: 'sob consulta', icon: 'solar:pen-bold-duotone' },
              ].map((extra) => (
                <Grid key={extra.nome} xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', borderColor: 'primary.main', bgcolor: () => alpha(_theme.palette.primary.main, 0.02) }
                  }}>
                    <CardContent>
                      <Stack alignItems="center" spacing={1} textAlign="center">
                        <Iconify icon={extra.icon} width={32} color="primary.main" />
                        <Typography variant="subtitle2" fontWeight={700}>{extra.nome}</Typography>
                        <Typography variant="caption" color="text.secondary">{extra.valor}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* ═══════════════ COMO FUNCIONA ═════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 256, height: 256, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03), transform: 'translate(-50%, 50%)' }} />

        <Container maxWidth="md">
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Processo
            </Typography>
            <Typography variant="h3" fontWeight={700} mt={1}>
              Como funciona?
            </Typography>
          </Box>

          <Stack spacing={0}>
            {[
              {
                numero: '01',
                titulo: 'Contrate e pague',
                desc: 'Escolha o plano, preencha seus dados e pague via PIX ou boleto. Tudo online, em minutos.',
                icon: 'solar:card-bold-duotone',
              },
              {
                numero: '02',
                titulo: 'Envie seus documentos',
                desc: 'Você receberá um link por WhatsApp para acessar o portal de documentos. Envie tudo digitalmente: informes, holerites, comprovantes médicos e mais.',
                icon: 'solar:upload-bold-duotone',
              },
              {
                numero: '03',
                titulo: 'Nosso contador cuida de tudo',
                desc: 'Analisamos seus documentos, identificamos todas as deduções possíveis e preparamos a declaração com máxima restituição.',
                icon: 'solar:calculator-bold-duotone',
              },
              {
                numero: '04',
                titulo: 'Receba e aprove',
                desc: 'Você recebe a declaração para revisão. Após sua aprovação, enviamos diretamente à Receita Federal.',
                icon: 'solar:check-circle-bold-duotone',
              },
            ].map((step, idx) => (
              <Stack
                key={step.numero}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems="flex-start"
                sx={{
                  py: 4,
                  borderBottom: idx < 3 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    minWidth: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: `0 8px 16px ${alpha(_theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {step.numero}
                </Box>
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon={step.icon} width={22} color="primary.main" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      {step.titulo}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {step.desc}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>

          {/* ═══════════════ MULTA E DESTINAÇÃO ═════════════════════════════════════ */}
          <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02) }}>
            <Container maxWidth="lg">

              <Box textAlign="center" mb={6} my={6}>
                <Typography variant="overline" color="primary.main" fontWeight={700}>
                  ATENÇÃO
                </Typography>
                <Typography variant="h3" fontWeight={700} mb={1}> Multa e Destinação</Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid xs={12} md={6}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.error.main, 0.1), color: 'error.main' }}>
                      <Iconify icon="solar:danger-triangle-bold-duotone" width={32} />
                    </Box>
                    <Typography variant="h5" fontWeight={800}>Multa por Atraso</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Quem não entregar no prazo estará sujeito a uma multa mínima de <strong>R$ 165,74</strong> e máxima de 20% do imposto devido, além de ficar com o CPF pendente de regularização.
                  </Typography>
                </Grid>
                <Grid xs={12} md={6}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                      <Iconify icon="solar:heart-bold-duotone" width={32} />
                    </Box>
                    <Typography variant="h5" fontWeight={800}>Destinação do IR</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Contribuintes que desejarem destinar parte do imposto aos fundos tutelares (criança, adolescente, idoso) têm vencimento do DARF em 29 de maio. A destinação não implica pagamento a mais de tributo nem redução da restituição.
                  </Typography>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Container>
      </Box>

      {/* ═══════════════ CTA FINAL ═════════════════════════════════════════════ */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: 'primary.main',
          color: 'common.white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.common.white, 0.05), transform: 'translate(50%, -50%)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 256, height: 256, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.common.black, 0.05), transform: 'translate(-50%, 50%)' }} />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} mb={2}>
            Não deixe para a última hora!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
            O prazo final da Receita Federal é <strong>29 de maio de 2026</strong>. Contrate
            agora no primeiro lote e economize até 20%.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                bgcolor: 'common.white',
                color: 'primary.dark',
                fontWeight: 700,
                px: 5,
                height: 56,
                '&:hover': { bgcolor: alpha('#fff', 0.9), transform: 'scale(1.05)' },
                boxShadow: `0 8px 24px ${alpha(_theme.palette.common.black, 0.2)}`,
              }}
              endIcon={<Iconify icon="line-md:arrow-up" />}
            >
              Ver planos
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="https://wa.me/55SEUNUMERO?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20a%20declara%C3%A7%C3%A3o%20de%20IR%202026"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderColor: alpha(_theme.palette.common.white, 0.5),
                color: 'common.white',
                height: 56,
                borderWidth: 2,
                '&:hover': { borderColor: 'common.white', bgcolor: alpha('#fff', 0.05), borderWidth: 2 },
              }}
              startIcon={<Iconify icon="logos:whatsapp-icon" />}
            >
              Falar no WhatsApp
            </Button>
          </Stack>
        </Container>
      </Box>


      {/* ═══════════════ FAQ ═══════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.neutral', position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Dúvidas frequentes
            </Typography>
            <Typography variant="h3" fontWeight={700} mt={1}>
              Perguntas e respostas
            </Typography>
          </Box>

          <Stack spacing={1}>
            {FAQ.map((item, idx) => (
              <Accordion
                key={idx}
                expanded={faqAberto === idx}
                onChange={() => setFaqAberto(faqAberto === idx ? false : idx)}
                sx={{
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  transition: 'all 0.25s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    boxShadow: (theme) => theme.customShadows?.z16 || theme.shadows[16],
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<Iconify icon="eva:chevron-down-fill" />}
                  sx={{ fontWeight: 600 }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.pergunta}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                    {item.resposta}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Dialog de checkout */}
      <IrCheckoutDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        plano={planoSelecionado}
      />
    </Box>
  );
}
