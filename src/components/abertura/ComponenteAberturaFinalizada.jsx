import React from 'react';
import Confetti from 'react-confetti';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ComponenteAberturaFinalizada = ({ formData }) => (
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
    <Confetti numberOfPieces={200} />

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
      }}
    />

    {/* Texto de finalização */}
    <Typography variant="h4" gutterBottom>
      Parabéns, {formData.nomeEmpresarial} está oficialmente aberta!
    </Typography>
    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
      Sua jornada empresarial começa agora. Estamos aqui para ajudar em todos os próximos passos.
    </Typography>

    {/* Próximos Passos */}
    <Box my={3} sx={{ width: '100%', maxWidth: 600 }}>
      <Card>
        <CardContent>
          <Typography variant="h6">Próximos Passos</Typography>
          <Typography variant="body1">
            - Converse com nosso time.
            <br />
            - Consulte serviços abertura de conta bancária PJ.
            <br />
            - Explore as melhores práticas de gestão de negócios.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  </Box>
);

export default ComponenteAberturaFinalizada;
