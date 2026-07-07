'use client';

import { m } from 'framer-motion';
import { useRef, useState, useEffect, forwardRef } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Iconify } from 'src/components/iconify';
import { varFade, varContainer, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function CertificadoDigitalView({ data }) {
  const { accent } = data;

  const [activeTab, setActiveTab] = useState(data.passos.tabs[0].value);
  const [expanded, setExpanded] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        setShowFloating(heroRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentTab = data.passos.tabs.find((tab) => tab.value === activeTab);

  const handleFaq = (panel) => (event, isExpanded) => setExpanded(isExpanded ? panel : false);

  return (
    <Box>
      <CertificadoHero ref={heroRef} data={data} accent={accent} />

      <CertificadoIntro data={data} accent={accent} />

      <CertificadoTipos data={data} accent={accent} />

      {/* Passo a passo */}
      <Box id="passo-a-passo" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container component={MotionViewport}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <m.div variants={varFade().inDown}>
              <Typography variant="h2" sx={{ mb: 3 }}>
                {data.passos.title}{' '}
                <Box component="span" sx={{ color: accent }}>
                  {data.passos.highlight}
                </Box>
              </Typography>
            </m.div>
            <m.div variants={varFade().inDown}>
              <Typography
                sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}
              >
                {data.passos.intro}
              </Typography>
            </m.div>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <Tabs
              value={activeTab}
              onChange={(e, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-indicator': { bgcolor: accent, height: 3 },
                '& .MuiTab-root': { fontWeight: 700, minHeight: 48, '&.Mui-selected': { color: accent } },
              }}
            >
              {data.passos.tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={20} />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          <Box
            key={activeTab}
            component={m.div}
            initial="initial"
            animate="animate"
            variants={varContainer()}
            sx={{ maxWidth: 860, mx: 'auto' }}
          >
            <Stack spacing={2.5}>
              {currentTab.steps.map((step, index) => (
                <m.div key={step.title} variants={varFade().inUp}>
                  <Card
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      display: 'flex',
                      gap: 2.5,
                      alignItems: 'flex-start',
                      transition: 'all 0.3s ease',
                      '&:hover': { boxShadow: (t) => t.customShadows.z16 },
                    }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: accent,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </Card>
                </m.div>
              ))}
            </Stack>

            {currentTab.note && (
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  borderRadius: 2,
                  bgcolor: alpha(accent, 0.08),
                  border: `1px solid ${alpha(accent, 0.24)}`,
                }}
              >
                <Iconify
                  icon="solar:info-circle-bold"
                  width={22}
                  sx={{ color: accent, flexShrink: 0, mt: 0.2 }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {currentTab.note}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <CertificadoProblemas data={data} accent={accent} />

      <CertificadoFaq data={data} accent={accent} expanded={expanded} onChange={handleFaq} />

      <CertificadoCta data={data} accent={accent} />

      {/* Botão flutuante */}
      <Fade in={showFloating}>
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 30 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            display: showFloating ? 'block' : 'none',
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
          }}
        >
          <Button
            component="a"
            href={data.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            size="large"
            variant="contained"
            startIcon={<Iconify icon="mdi:whatsapp" width={24} sx={{ flexShrink: 0 }} />}
            sx={{
              bgcolor: '#28a745',
              color: 'white',
              px: { xs: 3, md: 6 },
              py: { xs: 1.5, md: 2 },
              fontSize: { xs: '0.875rem', md: '1.05rem' },
              fontWeight: 800,
              borderRadius: 50,
              boxShadow: '0 10px 40px 0 rgba(40, 167, 69, 0.6)',
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 300 },
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#218838', transform: 'scale(1.03)' },
              transition: 'all 0.3s ease',
            }}
          >
            Falar com um especialista
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}

// ----------------------------------------------------------------------

const CertificadoHero = forwardRef(({ data, accent }, ref) => {
  const theme = useTheme();
  const { hero } = data;

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/background/background-3-blur.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
          zIndex: 0,
          filter: 'brightness(1.15)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.72)} 0%, ${alpha(theme.palette.grey[50], 0.68)} 100%)`,
          zIndex: 0,
        },
      }}
    >
      <Container component={MotionViewport} sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 860, mx: 'auto' }}>
          <m.div variants={varFade().inUp}>
            <Chip
              icon={<Iconify icon="solar:diploma-verified-bold-duotone" width={18} />}
              label={hero.chip}
              sx={{
                mb: 3,
                px: 1,
                fontWeight: 700,
                bgcolor: alpha(accent, 0.1),
                color: accent,
                '& .MuiChip-icon': { color: accent },
              }}
            />
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h1"
              sx={{ mb: 3, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.2 }}
            >
              {hero.titlePre}{' '}
              <Box component="span" sx={{ color: accent }}>
                {hero.titleHighlight}
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                color: 'text.secondary',
                fontWeight: 400,
                fontSize: { xs: '1.125rem', md: '1.25rem' },
              }}
            >
              {hero.subtitle}
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography sx={{ mb: 5, color: 'text.secondary', lineHeight: 1.8 }}>
              {hero.description}
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                size="large"
                variant="contained"
                href="#passo-a-passo"
                startIcon={<Iconify icon="solar:list-check-bold-duotone" width={22} />}
                sx={{
                  bgcolor: accent,
                  color: 'white',
                  px: { xs: 3, md: 5 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  fontWeight: 800,
                  borderRadius: 50,
                  boxShadow: `0 10px 30px 0 ${alpha(accent, 0.5)}`,
                  textTransform: 'none',
                  '&:hover': { bgcolor: alpha(accent, 0.85), transform: 'scale(1.03)' },
                  transition: 'all 0.3s ease',
                }}
              >
                Ver o passo a passo
              </Button>

              <Button
                size="large"
                variant="outlined"
                color="inherit"
                href={data.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<Iconify icon="mdi:whatsapp" width={22} />}
                sx={{
                  px: { xs: 3, md: 4 },
                  py: { xs: 1.5, md: 2 },
                  fontWeight: 700,
                  borderRadius: 50,
                  textTransform: 'none',
                  '&:hover': { borderColor: accent, color: accent, bgcolor: alpha(accent, 0.08) },
                }}
              >
                Preciso de ajuda
              </Button>
            </Stack>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
});

CertificadoHero.displayName = 'CertificadoHero';

// ----------------------------------------------------------------------

function CertificadoIntro({ data, accent }) {
  const { intro } = data;
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container component={MotionViewport}>
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          <Grid xs={12} md={7}>
            <m.div variants={varFade().inUp}>
              <Typography variant="h2" sx={{ mb: 3 }}>
                {intro.title}{' '}
                <Box component="span" sx={{ color: accent }}>
                  {intro.highlight}
                </Box>
              </Typography>
            </m.div>
            {intro.paragraphs.map((p) => (
              <m.div key={p} variants={varFade().inUp}>
                <Typography sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.9 }}>
                  {p}
                </Typography>
              </m.div>
            ))}
          </Grid>

          <Grid xs={12} md={5}>
            <m.div variants={varFade().inRight}>
              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                  border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Onde você vai usar
                </Typography>
                <Stack spacing={2.5}>
                  {intro.usos.map((uso) => (
                    <Box key={uso.label} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1.5,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(accent, 0.1),
                        }}
                      >
                        <Iconify icon={uso.icon} width={24} sx={{ color: accent }} />
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{uso.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function CertificadoTipos({ data, accent }) {
  const theme = useTheme();
  const { tipos } = data;
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: (t) => alpha(t.palette.grey[500], 0.04) }}>
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              {tipos.title}{' '}
              <Box component="span" sx={{ color: accent }}>
                {tipos.highlight}
              </Box>
            </Typography>
          </m.div>
          <m.div variants={varFade().inDown}>
            <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              {tipos.intro}
            </Typography>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {tipos.cards.map((card) => (
            <Grid key={card.title} xs={12} md={4}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.customShadows.z16 },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(accent, 0.1),
                      }}
                    >
                      <Iconify icon={card.icon} width={32} sx={{ color: accent }} />
                    </Box>
                    <Chip label={card.badge} size="small" sx={{ fontWeight: 700, height: 24 }} />
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: accent, fontWeight: 700 }}>
                    {card.validade}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.8 }}
                  >
                    {card.description}
                  </Typography>

                  <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Iconify
                      icon="solar:download-square-bold-duotone"
                      width={20}
                      sx={{ color: accent, flexShrink: 0, mt: 0.2 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {card.instalacao}
                    </Typography>
                  </Box>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function CertificadoProblemas({ data, accent }) {
  const theme = useTheme();
  const { problemas } = data;
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: (t) => alpha(t.palette.grey[500], 0.04) }}>
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              {problemas.title}{' '}
              <Box component="span" sx={{ color: accent }}>
                {problemas.highlight}
              </Box>
            </Typography>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {problemas.items.map((item) => (
            <Grid key={item.problem} xs={12} md={6}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    gap: 2,
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: theme.customShadows.z16 },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(accent, 0.1),
                    }}
                  >
                    <Iconify icon={item.icon} width={26} sx={{ color: accent }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {item.problem}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      {item.solution}
                    </Typography>
                  </Box>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function CertificadoFaq({ data, accent, expanded, onChange }) {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Dúvidas{' '}
              <Box component="span" sx={{ color: accent }}>
                frequentes
              </Box>
            </Typography>
          </m.div>
        </Box>

        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          {data.faqs.map((faq, index) => (
            <m.div key={faq.question} variants={varFade().inRight}>
              <Accordion
                expanded={expanded === `panel${index}`}
                onChange={onChange(`panel${index}`)}
                sx={{
                  mb: 2,
                  '&:before': { display: 'none' },
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
                  boxShadow: (t) => t.customShadows.card,
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: accent,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {expanded === `panel${index}` ? '−' : '+'}
                    </Box>
                  }
                  sx={{ px: 3, py: 2.5, '& .MuiAccordionSummary-content': { my: 1.5 } }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, pr: 2 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 3,
                    pb: 3,
                    pt: 0,
                    borderTop: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function CertificadoCta({ data, accent }) {
  const { cta } = data;
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: (t) => alpha(t.palette.grey[500], 0.04) }}>
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              {cta.title}{' '}
              <Box component="span" sx={{ color: accent }}>
                {cta.highlight}
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h5"
              sx={{ mb: 5, color: 'text.secondary', fontWeight: 400, lineHeight: 1.8 }}
            >
              {cta.subtitle}
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Button
              component="a"
              href={data.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              size="large"
              variant="contained"
              startIcon={<Iconify icon="mdi:whatsapp" width={26} />}
              sx={{
                bgcolor: '#28a745',
                color: 'white',
                px: { xs: 4, md: 6 },
                py: 2,
                fontSize: { xs: '0.95rem', md: '1.25rem' },
                fontWeight: 700,
                borderRadius: 10,
                boxShadow: '0 8px 24px 0 rgba(40, 167, 69, 0.4)',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#218838', transform: 'scale(1.05)' },
                transition: 'all 0.3s ease',
              }}
            >
              Quero falar agora!
            </Button>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}
