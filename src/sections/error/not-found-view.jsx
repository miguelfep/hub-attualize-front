'use client';

import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { SimpleLayout } from 'src/layouts/simple';
import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export function NotFoundView() {
  return (
    <SimpleLayout content={{ compact: false }}>
      <Container 
        component={MotionContainer}
        sx={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          py: 5,
        }}
      >
        <m.div variants={varBounce().in}>
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
            }}
          >
            Ops! Página não encontrada
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography 
            variant="h6"
            sx={{ 
              color: 'text.secondary', 
              mb: 1,
              maxWidth: 600,
              mx: 'auto',
              px: 2,
            }}
          >
            Parece que você se perdeu no nosso hub de soluções contábeis! 
          </Typography>
          <Typography 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              px: 2,
            }}
          >
            A página que você está procurando não existe ou foi movida. Que tal voltar para o início 
            e explorar nossas soluções?
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <PageNotFoundIllustration 
            sx={{ 
              my: { xs: 5, sm: 8 },
              height: { xs: 200, sm: 300, md: 360 },
              mx: 'auto',
            }} 
          />
        </m.div>

        <m.div variants={varBounce().in}>
          <Button 
            component={RouterLink} 
            href="/" 
            size="large" 
            variant="contained"
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Voltar para o Início
          </Button>
        </m.div>
      </Container>
    </SimpleLayout>
  );
}
