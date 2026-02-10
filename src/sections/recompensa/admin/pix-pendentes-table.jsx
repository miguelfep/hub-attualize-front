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
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function PixPendentesTable({ pixPendentes, loading, onAprovar, onRejeitar }) {
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

  if (!pixPendentes || pixPendentes.length === 0) {
    return (
      <EmptyContent
        filled
        title="Nenhum PIX pendente"
        description="Não há solicitações de PIX aguardando aprovação"
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Chave PIX</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Data Solicitação</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pixPendentes.map((pix) => (
            <TableRow key={pix._id} hover>
              <TableCell>
                <Stack>
                  <Typography variant="subtitle2">
                    {pix.cliente?.nome || pix.cliente?.razaoSocial || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pix.cliente?.email || '-'}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:copy-bold" width={16} />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {pix.chavePix}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="subtitle2" color="success.main">
                  {fCurrency(pix.valor)}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(pix.dataSolicitacao)}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                    onClick={() => onAprovar(pix)}
                  >
                    Aprovar
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Iconify icon="solar:close-circle-bold" />}
                    onClick={() => onRejeitar(pix)}
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
