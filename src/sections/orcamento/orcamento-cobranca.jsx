import React from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import {
  Grid,
  Card,
  Stack,
  Button,
  Divider,
  Container,
  Typography,
  CardContent,
} from '@mui/material';

import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

const statusColors = {
  EMABERTO: 'success',
  VENCIDO: 'error',
  CANCELADO: 'info',
};

const statusTexts = {
  EMABERTO: 'Aguardando pagamento',
  VENCIDO: 'Vencida',
  CANCELADO: 'Cancelado',
};

export function CobrancaExistente({ invoice }) {
  const { copy } = useCopyToClipboard();

  const handleDownload = async (codigoSolicitacao) => {
    try {
      const response = await axios.get(
        `https://api.attualizecontabil.com.br/api/contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
      );

      const { pdf } = response.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdf}`;
      link.download = `boleto_${codigoSolicitacao}.pdf`;
      link.click();
      toast.success('Download concluído!');
    } catch (error) {
      toast.error('Erro ao baixar o boleto.');
    }
  };

  const handleCopy = async (text, successMessage) => {
    const result = await copy(text);
    if (result) {
      toast.success(successMessage);
    } else {
      toast.error('Erro ao copiar para a área de transferência.');
    }
  };

  return (
    <Container sx={{ pt: 5, pb: 10, maxWidth: '800px' }}>
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        Detalhes da Cobrança
      </Typography>
      {invoice.cobrancas.map((cobranca, index) => (
        <Grid container spacing={3} justifyContent="center" key={cobranca._id || index}>
          <Grid item xs={12}>
            <Card sx={{ margin: 'auto', maxWidth: '600px' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {`Cobrança: ${cobranca.metodoPagamento.toUpperCase()}`}
                </Typography>
                <Label color={statusColors[cobranca.status]} variant="filled" sx={{ mb: 3 }}>
                  {statusTexts[cobranca.status]}
                </Label>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Valor
                    </Typography>
                    <Typography variant="h4" color="warning">
                      {fCurrency(cobranca.valor)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Data de Vencimento
                    </Typography>
                    <Typography variant="subtitle1">
                      {new Date(cobranca.dataVencimento).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>

                {cobranca.metodoPagamento === 'boleto' && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<Iconify width={16} icon="eva:copy-outline" />}
                        onClick={() =>
                          handleCopy(
                            JSON.parse(cobranca.boleto).pixCopiaECola,
                            'Chave pix copiada!'
                          )
                        }
                        fullWidth
                      >
                        Pagar com Pix Copia e cola
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<Iconify width={16} icon="eva:copy-outline" />}
                        onClick={() =>
                          handleCopy(
                            JSON.parse(cobranca.boleto).linhaDigitavel,
                            'Linha Digitável copiada!'
                          )
                        }
                        fullWidth
                      >
                        Pagar com Linha Digitável
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Iconify width={16} icon="eva:file-outline" />}
                        onClick={() =>
                          handleDownload(JSON.parse(cobranca.boleto).codigoSolicitacao)
                        }
                        fullWidth
                      >
                        Download do Boleto
                      </Button>
                    </Stack>
                  </>
                )}
                {cobranca.metodoPagamento === 'pix' && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6">Chave PIX:</Typography>
                        <Typography variant="h6">32.610.190/0001-55</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="h6">Beneficiário:</Typography>
                        <Typography variant="h6">Attualize Contabil LTDA</Typography>
                      </Stack>
                    </Stack>
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<Iconify width={16} icon="eva:copy-outline" />}
                        onClick={() => handleCopy('32.610.190/0001-55', 'Chave PIX copiada!')}
                        fullWidth
                      >
                        Copiar Chave PIX
                      </Button>
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ))}
    </Container>
  );
}
