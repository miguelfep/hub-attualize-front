import Confetti from 'react-confetti';
import React, { useState, useEffect } from 'react';

import { Box, Card, Typography, CardContent } from '@mui/material';

const ComponenteAberturaFinalizada = ({ formData }) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    return undefined;
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: 2, sm: 4, md: 6 },
        backgroundColor: '#fff',
        minHeight: '100vh',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Confetti ocupando toda a tela */}
      <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} />

      {/* Logo centralizada */}
      <Box
        component="img"
        alt="logo"
        src="/logo/hub-tt.png"
        sx={{
          width: 80,
          height: 80,
          display: 'block',
          marginBottom: 4,
          zIndex: 2, // Garante que o logo fique acima do Confetti
          position: 'relative',
        }}
      />

      {/* Texto de finalização */}
      <Typography variant="h4" gutterBottom sx={{ zIndex: 2, position: 'relative' }}>
        Parabéns, {formData.nomeEmpresarial} está oficialmente aberta!
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        gutterBottom
        sx={{ zIndex: 2, position: 'relative' }}
      >
        Sua jornada empresarial começa agora. Estamos aqui para ajudar em todos os próximos passos.
      </Typography>

      {/* Próximos Passos */}
      <Box my={3} sx={{ width: '100%', maxWidth: 600, zIndex: 2, position: 'relative' }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Próximos Passos</Typography>
            <Typography variant="body1">
              - Converse com nosso time.
              <br />
              - Consulte serviços de abertura de conta bancária PJ.
              <br />
              - Explore as melhores práticas de gestão de negócios.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ComponenteAberturaFinalizada;
