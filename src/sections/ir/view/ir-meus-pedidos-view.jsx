'use client';

import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { useGetMeusPedidosIr } from 'src/actions/ir';

import { Iconify } from 'src/components/iconify';
import IrStatusBadge from 'src/components/ir/IrStatusBadge';

// ----------------------------------------------------------------------

function formatData(isoString) {
  try {
    return format(parseISO(isoString), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
}

// ----------------------------------------------------------------------

export default function IrMeusPedidosView() {
  const router = useRouter();
  const { data: pedidos, isLoading, error } = useGetMeusPedidosIr();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography color="error">Erro ao carregar seus pedidos. Tente novamente.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4">Meus pedidos — IR</Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhe todos os seus pedidos de declaração de imposto de renda.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => router.push(paths.cliente.impostoRenda.root)}
        >
          Novo pedido
        </Button>
      </Stack>

      {!pedidos?.length ? (
        <Card>
          <Box py={8} textAlign="center">
            <Iconify icon="eva:file-text-outline" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Você ainda não tem pedidos de IR.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => router.push(paths.cliente.impostoRenda.root)}
            >
              Contratar declaração
            </Button>
          </Box>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ano</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tipo pagamento</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {pedido.ano}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IrStatusBadge status={pedido.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" textTransform="capitalize">
                        {pedido.paymentType === 'boleto' ? 'Boleto' : 'PIX'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{fCurrency(pedido.valor)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatData(pedido.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          router.push(paths.cliente.impostoRenda.pedido(pedido._id))
                        }
                      >
                        Ver detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Container>
  );
}
