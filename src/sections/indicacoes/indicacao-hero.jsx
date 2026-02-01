'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function IndicacaoHero({ indicador }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.success.main, 0.1),
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Iconify icon="solar:gift-bold-duotone" width={48} />
          </Box>

          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Você foi indicado!
            </Typography>
            {indicador ? (
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                {indicador.nome || indicador.razaoSocial || 'Alguém'} te indicou
              </Typography>
            ) : null}
            <Typography variant="h6" color="text.secondary">
              {indicador
                ? `para conhecer a Attualize Contábil`
                : 'Alguém te indicou para conhecer a Attualize'}
            </Typography>
          </Box>

          {indicador && (
            <Card
              sx={{
                p: 3,
                maxWidth: 400,
                width: '100%',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.main',
                    fontSize: 24,
                  }}
                >
                  {(indicador.nome || indicador.razaoSocial || 'A')
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {indicador.nome || indicador.razaoSocial || 'Cliente Attualize'}
                  </Typography>
                  {indicador.razaoSocial && indicador.nome && (
                    <Typography variant="body2" color="text.secondary">
                      {indicador.razaoSocial}
                    </Typography>
                  )}
                  {indicador.cidade && indicador.estado && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {indicador.cidade}, {indicador.estado}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Card>
          )}

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            {indicador
              ? `${indicador.nome || indicador.razaoSocial || 'Quem te indicou'} confia na Attualize. Preencha o formulário abaixo e nossa equipe entrará em contato para apresentar nossos serviços contábeis especializados.`
              : 'Preencha o formulário abaixo e nossa equipe entrará em contato para apresentar nossos serviços contábeis especializados.'}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
