import React from 'react';

import { Box, Typography } from '@mui/material';

import { Iconify } from '../iconify';

const ComponenteAguardandoValidacao = () => (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      textAlign="center"
      sx={{
        backgroundColor: '#f0f4f8',
        animation: 'fadeIn 1.5s ease-in-out',
      }}
    >
      <Box
        sx={{
          padding: 3,
          borderRadius: 2,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
        }}
      >
        {/* Ícone de relógio animado */}
        <Iconify
          width={80}
          icon="mdi-clock-outline"
          sx={{
            color: '#1976d2',
            animation: 'spin 2s linear infinite', // Animação de rotação para o ícone de relógio
          }}
        />
        <Typography variant="h4" sx={{ my: 3, fontWeight: 'bold', color: '#333' }}>
          Aguarde a validação do nosso time!
        </Typography>
        <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', color: '#555' }}>
            Estamos trabalhando na validação dos seus dados.
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#888' }}>
          Isso pode levar alguns minutos. Agradecemos sua paciência!
        </Typography>
      </Box>
    </Box>
  );

// Adicionando keyframes para a animação de rotação e fade-in
const styles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
`;

export default ComponenteAguardandoValidacao;

// Adiciona estilos globalmente (para Next.js ou outro framework similar)
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
