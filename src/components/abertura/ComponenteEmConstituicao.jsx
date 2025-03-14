'use client';

import React, { useRef, useEffect } from 'react';

import { styled } from '@mui/material/styles';
import { Box, Button, Typography } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { Iconify } from '../iconify';

const statuses = [
  { label: 'Solicitando Viabilidade', value: 0 },
  { label: 'Aprovação da Viabilidade', value: 1 },
  { label: 'Pagamento taxas de registro', value: 2 },
  { label: 'Assinatura do processo', value: 3 },
  { label: 'Protocolo do processo', value: 4 },
  { label: 'Aguardando deferimento', value: 5 },
  { label: 'Processo deferido', value: 6 },
  { label: 'Emissão de certificado Digital', value: 7 },
  { label: 'Início de licenças e alvarás', value: 8 },
  { label: 'Autorização de NF e Regime de tributação', value: 9 },
  { label: 'Abertura concluída', value: 10 },
];

// Estilizando o círculo com maior destaque
const Circle = styled('div')(({ theme, status, currentStatus }) => ({
  width: 60, // Aumentei o tamanho do círculo
  height: 60,
  borderRadius: '50%',
  backgroundColor:
    status === currentStatus
      ? theme.palette.success.main // Verde para o status atual
      : status < currentStatus
        ? theme.palette.primary.main // Azul para os passos completados
        : theme.palette.grey[400], // Cinza para os passos futuros
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 'bold',
  boxShadow: status === currentStatus ? `0 0 12px ${theme.palette.success.main}` : 'none',
  transition: 'all 0.3s ease',
}));

const StepLine = styled('div')(({ theme, completed }) => ({
  width: '100%',
  height: 6, // Aumentei a espessura da linha conectora
  backgroundColor: completed ? theme.palette.primary.main : theme.palette.grey[400],
  transition: 'background-color 0.3s ease',
}));

const ComponenteEmConstituicao = ({ formData }) => {
  const currentStatus = formData.situacaoAbertura;

  // Refs para rolar até o passo atual
  const stepsRef = useRef([]);

  // Hook para progresso de scroll horizontal
  const containerProgress = useScrollProgress('container-scroll-x');

  // Rolar para o passo atual
  useEffect(() => {
    if (stepsRef.current[currentStatus]) {
      stepsRef.current[currentStatus].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }, [currentStatus]);

  const handleWhatsAppClick = () => {
    const phoneNumber = '+554130681800';
    const message = `Olá, gostaria de solicitar informações sobre a abertura da empresa ${formData.nomeEmpresarial}`;
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ padding: { xs: 2, sm: 4, md: 6 }, backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Progress bar horizontal fixa */}
      <ScrollProgress
        variant="linear"
        size={6}
        progress={containerProgress.scrollXProgress}
        sx={{ position: 'fixed', top: 0, left: 0, right: 0 }}
      />

      <Box
        component="img"
        alt="logo"
        src="/logo/hub-tt.png"
        sx={{
          width: 80,
          height: 80,
          display: 'block',
          margin: '0 auto',
          mb: 4,
        }}
      />

      <Typography variant="h5" align="center" sx={{ mb: 6, fontWeight: 'bold', color: '#1A2027' }}>
        Progresso da Abertura
      </Typography>

      {/* Container com Scrollbar horizontal */}
      <Scrollbar
        ref={containerProgress.elementRef}
        sx={{ whiteSpace: 'nowrap', overflowX: 'auto', paddingBottom: 3 }}
      >
        <Box display="flex" gap={8} paddingX={3}>
          {' '}
          {/* Aumentei o gap entre os itens */}
          {statuses.map((status, index) => (
            <Box
              key={index}
              ref={(el) => {
                stepsRef.current[index] = el;
              }}
              display="inline-flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              gap={2} // Maior espaço entre os itens
            >
              <Circle status={status.value} currentStatus={currentStatus}>
                {status.value < currentStatus ? <Iconify icon="mdi-check" /> : status.value + 1}
              </Circle>
              <Typography variant="body1" sx={{ mt: 1, minWidth: 120, fontSize: '1rem' }}>
                {status.label}
              </Typography>
              {index < statuses.length - 1 && (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <StepLine completed={index < currentStatus} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Scrollbar>

      <Typography variant="body1" align="center" sx={{ my: 4, color: '#888' }}>
        Toda atualização ficará disponível nesta página.
      </Typography>

      <Box display="flex" justifyContent="center">
        <Button variant="contained" color="primary" onClick={handleWhatsAppClick}>
          Falar com Especialista no WhatsApp
        </Button>
      </Box>
    </Box>
  );
};

export default ComponenteEmConstituicao;
