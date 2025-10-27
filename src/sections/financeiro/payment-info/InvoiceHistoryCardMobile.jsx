import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useStatusProps } from 'src/hooks/use-status-cobranca';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

export function InvoiceHistoryCardMobile({ fatura, onDownloadBoleto }) {
  const boleto = fatura.boleto ? JSON.parse(fatura.boleto) : null;
  const { color, icon, label } = useStatusProps(fatura.status);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ maxWidth: '70%' }}>
            {fatura.observacoes}
          </Typography>
          <Chip label={label} color={color} size="small" icon={<Iconify icon={icon} />} />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack>
            <Typography variant="body2" color="text.secondary">
              Vencimento
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}
            </Typography>
          </Stack>
          <Stack alignItems="flex-end">
            <Typography variant="body2" color="text.secondary">
              Valor
            </Typography>
            <Typography variant="subtitle2">{fCurrency(fatura.valor)}</Typography>
          </Stack>
        </Stack>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:download-bold" />}
          onClick={() => onDownloadBoleto(boleto?.codigoSolicitacao || fatura.codigoSolicitacao)}
          disabled={!boleto?.codigoSolicitacao && !fatura.codigoSolicitacao}
        >
          Baixar Boleto
        </Button>
      </Box>
    </Card>
  );
}