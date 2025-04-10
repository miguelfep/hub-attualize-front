import React from 'react';
import { m } from 'framer-motion';

import { Box, Grid, Container, Typography } from '@mui/material';

import { varFade, MotionViewport } from 'src/components/animate';

import { CallToAction } from '../call-to-action/CallToAction';

export function ImportanciaContabilidadeEstetica() {
  return (
    <Container
      component={MotionViewport}
      sx={{ py: { xs: 10, md: 15 }, textAlign: { xs: 'center', md: 'unset' } }}
    >
      {/* Título centralizado */}
      <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        A Importância da Contabilidade para Clínicas de Estética
      </Typography>

      <Grid container spacing={4} alignItems="center">
        {/* Texto sobre a importância da contabilidade */}
        <Grid item xs={12} md={7}>
          <m.div variants={varFade().inLeft}>
            <Typography variant="body1" paragraph>
              Gerir uma clínica de estética exige muito mais do que oferecer serviços de qualidade,
              é essencial manter uma gestão financeira eficiente e estratégica. A contabilidade não
              é apenas uma obrigação legal, mas uma ferramenta indispensável para tomar decisões
              inteligentes e garantir a sustentabilidade do seu negócio.
            </Typography>
            <Typography variant="body1" paragraph>
              Ao contar com a Attualize que é especializada no setor de estética, sua clínica pode
              alcançar uma melhor organização fiscal, otimizar custos e aumentar a lucratividade.
              Além disso, temos contadores experientes para ajudar a garantir que todas as
              obrigações fiscais sejam cumpridas, evitando multas e problemas com o fisco.
            </Typography>
            <Typography variant="body1" paragraph>
              Na Attualize Contábil, oferecemos soluções personalizadas para clínicas de estética em
              todo o Brasil. Nosso serviço digital combina praticidade, agilidade e expertise no
              setor, permitindo que você foque no que realmente importa: o bem-estar dos seus
              clientes.
            </Typography>

            {/* Call to Action */}
            <CallToAction pageSource="site-estetica" />
          </m.div>
        </Grid>

        {/* Imagem ou componente visual */}
        <Grid item xs={12} md={5}>
          <m.div variants={varFade().inRight}>
            <Box
              component="img"
              src="/assets/images/estetica/animacao-site.png" // Certifique-se de que é um PNG transparente
              alt="Contabilidade para Estética"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block', // Garante que a imagem não tenha margens inesperadas
                borderRadius: 0, // Remove bordas arredondadas
                backgroundColor: 'transparent', // Remove qualquer fundo aplicado
                boxShadow: 'none', // Remove qualquer sombra aplicada
              }}
            />
          </m.div>
        </Grid>
      </Grid>
    </Container>
  );
}
