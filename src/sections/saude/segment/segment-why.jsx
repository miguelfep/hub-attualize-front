'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function SegmentWhy({ segment }) {
  const theme = useTheme();

  const { accent, why } = segment;

  return (
    <Box
      id="porque"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Por que {segment.name.toLowerCase()} escolhem a{' '}
              <Box component="span" sx={{ color: accent }}>
                Attualize
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Box
              sx={{
                maxWidth: 900,
                mx: 'auto',
                color: 'text.secondary',
                '& p': { mb: 2, lineHeight: 1.8 },
              }}
            >
              {why.intro.map((paragraph) => (
                <Typography key={paragraph}>{paragraph}</Typography>
              ))}
            </Box>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {why.cards.map((card) => (
            <Grid key={card.title} xs={12} sm={6} md={4}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z16,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Iconify
                      icon={card.icon}
                      width={32}
                      sx={{ color: accent, mr: 2, flexShrink: 0 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {card.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {card.description}
                  </Typography>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
