import { Card, Typography, Stack, Divider, Button } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';

export function InvoicePaymentDetails({ boleto }) {
  const handleCopy = (text) => {
    toast.success('Texto copiado: ' + text);
  };

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Detalhes do Boleto
      </Typography>
      <Stack spacing={2} divider={<Divider flexItem />}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Nosso Número:</Typography>
          <Stack direction="row" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1 }}>
              {boleto.nossoNumero}
            </Typography>
            <CopyToClipboard
              text={boleto.nossoNumero}
              onCopy={() => handleCopy(boleto.nossoNumero)}
            >
              <Button variant="outlined" size="small">
                Copiar
              </Button>
            </CopyToClipboard>
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Código de Barras:</Typography>
          <Stack direction="row" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1 }}>
              {boleto.codigoBarras}
            </Typography>
            <CopyToClipboard
              text={boleto.codigoBarras}
              onCopy={() => handleCopy(boleto.codigoBarras)}
            >
              <Button variant="outlined" size="small">
                Copiar
              </Button>
            </CopyToClipboard>
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Linha Digitável:</Typography>
          <Stack direction="row" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1 }}>
              {boleto.linhaDigitavel}
            </Typography>
            <CopyToClipboard
              text={boleto.linhaDigitavel}
              onCopy={() => handleCopy(boleto.linhaDigitavel)}
            >
              <Button variant="outlined" size="small">
                Copiar
              </Button>
            </CopyToClipboard>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
