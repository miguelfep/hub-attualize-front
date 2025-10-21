import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { useStatusProps } from 'src/hooks/use-status-cobranca';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number'; 

import { Iconify } from 'src/components/iconify';

const handleDownloadBoleto = async (codigoSolicitacao) => {
  if (!codigoSolicitacao) {
    toast.error('Boleto não disponível para esta fatura.');
    return;
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
    );
    const { pdf } = response.data;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdf}`;
    link.download = `boleto_${codigoSolicitacao}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download do boleto concluído!');
  } catch (error) {
    console.error('Erro ao baixar o boleto:', error);
    toast.error('Erro ao baixar o boleto. Tente novamente.');
  }
};

const FaturaTableRow = ({ fatura }) => {
  const boleto = fatura.boleto ? JSON.parse(fatura.boleto) : null;
  const { color, icon, label } = useStatusProps(fatura.status);

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        <Typography variant="subtitle2" noWrap>
          {fatura.observacoes}
        </Typography>
      </TableCell>
      <TableCell>
        {new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell align="right">{fCurrency(fatura.valor)}</TableCell>
      <TableCell>
        <Chip label={label} color={color} size="small" icon={<Iconify icon={icon} />} />
      </TableCell>
      <TableCell align="center">
        <Tooltip title="Baixar Boleto">
          <span>
            <IconButton
              onClick={() => handleDownloadBoleto(boleto?.codigoSolicitacao || fatura.codigoSolicitacao)}
              disabled={!boleto?.codigoSolicitacao}
            >
              <Iconify icon="solar:download-bold" />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

const SectionHeader = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
      }}
    >
      <Iconify icon={icon} width={24} color="primary.main" />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
  </Stack>
);

export function InvoiceHistory({ faturas }) {
  const theme = useTheme();

  if (faturas.length === 0) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 5, fontStyle: 'italic' }}>
        <Iconify icon="solar:history-outline" width={32} sx={{ color: 'text.disabled' }} />
        <Typography variant="body2" color="text.secondary">
          Não há outras faturas no histórico.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <SectionHeader icon="solar:history-bold-duotone" title="Histórico de Faturas" />
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de histórico de faturas">
            <TableHead sx={{ bgcolor: theme.palette.background.neutral }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vencimento</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Valor
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faturas.map((fatura) => (
                <FaturaTableRow key={fatura._id} fatura={fatura} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
