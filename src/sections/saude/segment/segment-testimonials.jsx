'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { getInitials } from 'src/utils/helper';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SegmentTestimonials({ segment }) {
  const theme = useTheme();

  const { testimonials } = segment;

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.neutral',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.2)} 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* Header */}
        <Stack spacing={3} sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}>
          <Stack direction="row" justifyContent="center" spacing={1}>
            {[...Array(5)].map((_, index) => (
              <Iconify
                key={index}
                icon="solar:star-bold"
                width={32}
                sx={{ color: 'warning.main' }}
              />
            ))}
          </Stack>

          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            O que os {segment.name.toLowerCase()} dizem sobre nós
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            Mais de{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {segment.testimonialsSubject || '200 profissionais e clínicas'}
            </Box>{' '}
            confiam na Attualize para cuidar de sua contabilidade
          </Typography>
        </Stack>

        {/* Grid de Depoimentos */}
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.customShadows.z20,
                },
              }}
            >
              {/* Aspas decorativas */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.1 }}>
                <Iconify
                  icon="solar:chat-round-quote-bold"
                  width={48}
                  sx={{ color: 'primary.main' }}
                />
              </Box>

              <Rating value={5} readOnly size="small" sx={{ mb: 2 }} />

              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  flexGrow: 1,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  lineHeight: 1.8,
                }}
              >
                &ldquo;{testimonial.testimonial}&rdquo;
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar alt={testimonial.name} sx={{ width: 56, height: 56 }}>
                  {getInitials(testimonial.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {testimonial.title ? `${testimonial.title} ` : ''}
                    {testimonial.name}
                  </Typography>
                  {testimonial.registry && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      {testimonial.registry}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <Iconify icon="solar:map-point-bold" width={14} sx={{ color: 'primary.main' }} />
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {testimonial.city}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}
                  >
                    {testimonial.specialty}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
