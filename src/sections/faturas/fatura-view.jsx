'use client';

// Definir o componente como Client Component

import React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Box, Card, Grid, Stack, Button, Container, Typography, CardContent } from '@mui/material'; // Para fazer a requisição do boleto em PDF

const FaturaViewPage = ({ faturaData }) => {
  const locale = 'pt-br';

  // Dados da fatura
  const { valor, dataVencimento, observacoes, boleto } = faturaData;

  const boletoData = boleto ? JSON.parse(boleto) : null; // Verifica se há dados de boleto e os parseia

  // Formata a data de vencimento
  const formattedDate = new Date(dataVencimento).toLocaleDateString(locale);

  // Função para baixar o boleto
  const handleDownloadBoleto = async (codigoSolicitacao) => {
    try {
      const response = await axios.get(
        `https://api.attualizecontabil.com.br/api/contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
      );
      const { pdf } = response.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdf}`;
      link.download = `boleto_${codigoSolicitacao}.pdf`;
      link.click();
      toast.success('Download do boleto concluído!');
    } catch (error) {
      toast.error('Erro ao baixar o boleto.');
    }
  };

  return (
    <Container sx={{ mb: 10 }}>
      <Box sx={{ textAlign: 'center', my: { xs: 3, md: 5 } }}>
        <Box
          component="img"
          alt="logo"
          src="/logo/hub-tt.png"
          sx={{
            width: 48,
            height: 48,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <Typography variant="h4">Sua fatura chegou</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Confira os detalhes da sua fatura e faça o pagamento para manter seus serviços em dia.
        </Typography>
      </Box>

      {/* Cartão com os detalhes da fatura */}
      <Card sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
        {' '}
        {/* Aumenta a largura do card */}
        <CardContent>
          {/* Título centralizado e maior */}
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
            Detalhes da Fatura
          </Typography>

          <Grid container spacing={2}>
            {/* Exibir o valor */}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1">Valor:</Typography>
                <Typography variant="h6" color="primary">
                  R$ {valor.toFixed(2)}
                </Typography>
              </Stack>
            </Grid>

            {/* Exibir a data de vencimento */}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1">Data de Vencimento:</Typography>
                <Typography variant="body1">{formattedDate}</Typography>
              </Stack>
            </Grid>

            {/* Exibir observações */}
            <Grid item xs={12}>
              <Typography variant="subtitle1">Descrição:</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {observacoes}
              </Typography>{' '}
              {/* Descrição com texto embaixo */}
            </Grid>

            {/* Botões para copiar PIX ou linha digitável e baixar o boleto */}
            {boletoData && (
              <Stack spacing={3} sx={{ width: '100%', mt: 3 }}>
                {' '}
                {/* Mais espaçamento entre os botões */}
                {boletoData.linhaDigitavel && (
                  <CopyToClipboard
                    text={boletoData.linhaDigitavel}
                    onCopy={() => toast.success('Linha Digitável copiada!')}
                  >
                    <Button variant="contained" fullWidth>
                      Copiar Linha Digitável
                    </Button>
                  </CopyToClipboard>
                )}
                {boletoData.pixCopiaECola && (
                  <CopyToClipboard
                    text={boletoData.pixCopiaECola}
                    onCopy={() => toast.success('Código PIX copiado!')}
                  >
                    <Button variant="contained" color="success" fullWidth>
                      Copiar Código PIX
                    </Button>
                  </CopyToClipboard>
                )}
                {/* Botão de download do boleto */}
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => handleDownloadBoleto(boletoData.codigoSolicitacao)}
                >
                  Download do Boleto
                </Button>
              </Stack>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FaturaViewPage;