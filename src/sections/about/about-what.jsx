import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fPercent } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { varAlpha, stylesMode } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export const SKILLS = [...Array(4)].map((_, index) => ({
  label: ['Atendimento Humanizado', 'Praticidade', 'Especializada', 'Digital/Zero Papel'][index],
  value: [100, 100, 100, 100][index],
}));

// ----------------------------------------------------------------------

export function AboutWhat() {
  const theme = useTheme();

  return (
    <Container
      component={MotionViewport}
      sx={{ py: { xs: 10, md: 15 }, textAlign: { xs: 'center', md: 'unset' } }}
    >
      <Grid container columnSpacing={{ md: 3 }} alignItems="flex-start">
        <Grid
          container
          xs={12}
          md={6}
          lg={7}
          alignItems="center"
          sx={{
            pr: { md: 7 },
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <Grid xs={6}>
            <m.div variants={varFade().inUp}>
              <Image
                alt="Our office small"
                src={`${CONFIG.site.basePath}/assets/images/about/what-small.webp`}
                ratio="1/1"
                sx={{
                  borderRadius: 3,
                  boxShadow: `-40px 40px 80px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
                  [stylesMode.dark]: {
                    boxShadow: `-40px 40px 80px ${varAlpha(theme.vars.palette.common.blackChannel, 0.24)}`,
                  },
                }}
              />
            </m.div>
          </Grid>

          <Grid xs={6}>
            <m.div variants={varFade().inUp}>
              <Image
                alt="Our office large"
                src={`${CONFIG.site.basePath}/assets/images/about/what-large.webp`}
                ratio="3/4"
                sx={{
                  borderRadius: 3,
                  boxShadow: `-40px 40px 80px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
                  [stylesMode.dark]: {
                    boxShadow: `-40px 40px 80px ${varAlpha(theme.vars.palette.common.blackChannel, 0.24)}`,
                  },
                }}
              />
            </m.div>
          </Grid>
        </Grid>

        <Grid xs={12} md={6} lg={5}>
          <m.div variants={varFade().inRight}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Contabilidade Digital
            </Typography>
          </m.div>

          <m.div variants={varFade().inRight}>
            <Typography
              sx={{ color: 'text.secondary', [stylesMode.dark]: { color: 'common.white' } }}
            >
              Aqui na Attualize prezamos que as pessoas sejam elas mesmas e se sintam felizes exercendo seu trabalho aqui.<br/>

              Um dos valores mais importantes é o respeito com nossos clientes e isso significa entregar qualidade.
              <br/>
              Aqui não existe o &quot;nunca eterno&quot;, sempre nos questionamos e perguntamos para tudo &quot;por que não?&quot;
            </Typography>
          </m.div>

          <Stack spacing={3} sx={{ my: 5 }}>
            {SKILLS.map((progress, index) => (
              <Box component={m.div} key={progress.label} variants={varFade().inRight}>
                <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ flexGrow: 1, textAlign: 'left' }}>
                    {progress.label}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {fPercent(progress.value)}
                  </Typography>
                </Stack>

                <LinearProgress
                  color={(index === 0 && 'primary') || (index === 1 && 'warning') || 'error'}
                  variant="determinate"
                  value={progress.value}
                />
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
