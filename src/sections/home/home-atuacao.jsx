import React from 'react';
import { m } from 'framer-motion';

import { Box, Grid, Stack, Container, Typography } from '@mui/material';

import { varFade, MotionViewport } from 'src/components/animate'; // Ajuste o caminho conforme sua estrutura de arquivos
import { CONFIG } from 'src/config-global'; // Ajuste o caminho conforme sua estrutura de arquivos
import { SvgColor } from 'src/components/svg-color';

// Subcomponente para os serviços
const ServiceCard = ({ icon, title, description }) => (
  <Stack spacing={2} component={m.div} variants={varFade().inUp} alignItems="center" sx={{ textAlign: 'center', padding: 2 }}>
    <SvgColor component="img" src={icon} alt={title} sx={{ width: 80, height: 80 }} />
    <Typography variant="h5">{title}</Typography>
    <Typography variant="body2" color="textSecondary">{description}</Typography>
  </Stack>
);

// Componente principal
const HomeServicesSection = () => {
  const services = [
    {
      icon: `${CONFIG.site.basePath}/assets/icons/home/icone-especialidade-5.png`,
      title: 'Beleza e estética',
      description: 'Contabilidade e gestão financeira para seu salão de beleza, estética e barbearia.',
    },
    {
      icon: `${CONFIG.site.basePath}/assets/icons/home/icone-especialidade-6.png`,
      title: 'Saúde',
      description: 'Contabilidade e gestão financeira especializada para sua clínica ou consultório.',
    },
    {
      icon: `${CONFIG.site.basePath}/assets/icons/home/icone-especialidade-7.png`,
      title: 'Bem Estar',
      description: 'Contabilidade e gestão financeira especializada para seu estúdio, academia, ou box de Crossfit.',
    },
    {
        icon: `${CONFIG.site.basePath}/assets/icons/home/icone-especialidade-8.png`,
        title: 'Profissional Parcerido',
        description: 'Serviços exclusivos para você que atua como profissional parceiro.',
      },
      {
        icon: `${CONFIG.site.basePath}/assets/icons/home/icone-especialidade-9.png`,
        title: 'Psicólogo autônomo',
        description: 'Serviços exclusivos para psicólogos que atuam de forma autônoma.',
      },
      {
        icon: `${CONFIG.site.basePath}/assets/icons/home/icone-especialidade-10.png`,
        title: 'Prestador de serviços',
        description: 'Serviços exclusivos para PJ que precisam de apoio contábil.',
      },
  ];

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 20 } }}>
      <MotionViewport>
        <Container>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h2" component="h2">
              Principais áreas de atuação
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Descubra como podemos ajudar você e seu negócio a prosperar com nossos serviços especializados.
            </Typography>
          </Stack>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 5 }}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
                <ServiceCard {...service} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </MotionViewport>
    </Box>
  );
};

export default HomeServicesSection;
