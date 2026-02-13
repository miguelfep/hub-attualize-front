'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function DescontosPendentesTable({ descontosPendentes, loading, onAprovar, onRejeitar }) {
  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!descontosPendentes || descontosPendentes.length === 0) {
    return (
      <EmptyContent
        filled
        title="Nenhum desconto pendente"
        description="Não há solicitações de desconto aguardando aprovação"
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Contrato</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Data Solicitação</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {descontosPendentes.map((desconto) => (
            <TableRow key={desconto._id} hover>
              <TableCell>
                <Stack>
                  <Typography variant="subtitle2">
                    {desconto.cliente?.nome || desconto.cliente?.razaoSocial || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {desconto.cliente?.email || '-'}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:document-text-bold" width={16} />
                  <Typography variant="body2">
                    {`Contrato de #${desconto.cliente.razaoSocial || '-'}`}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="subtitle2" color="success.main">
                  {fCurrency(desconto.valor)}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(desconto.dataSolicitacao)}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                    onClick={() => onAprovar(desconto)}
                  >
                    Aprovar
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Iconify icon="solar:close-circle-bold" />}
                    onClick={() => onRejeitar(desconto)}
                  >
                    Rejeitar
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
