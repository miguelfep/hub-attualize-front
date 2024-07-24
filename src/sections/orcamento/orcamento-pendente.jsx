import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { fCurrency } from 'src/utils/format-number';
import Stack from '@mui/material/Stack';
import { fDate } from 'src/utils/format-time';

export function OrcamentoPendente({ invoice }) {
  const renderTotal = (
    <>
      <TableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>
          <Box sx={{ mt: 2 }} />
          Subtotal
        </TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
          <Box sx={{ mt: 2 }} />
          {fCurrency(invoice?.subTotal)}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Desconto</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          - {fCurrency(invoice?.desconto)}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(invoice?.total)}
        </TableCell>
      </TableRow>
    </>
  );

  return (
    <Box sx={{ my: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contratada:
            </Typography>
            Attualize Contabil LTDA
            <br />
            Rua Dias Da Rocha Filho 640 - Alto da XV
            <br />
            Curitiba - PR
            <br />
            Telefone: (41) 3068-1800
            <br />
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contratante
            </Typography>
            {invoice?.cliente.nome}
            <br />
            {invoice?.cliente.email}
            <br />
            Telefone: {invoice?.cliente.whatsapp}
            <br />
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Proposta válida até
            </Typography>
            {fDate(invoice?.dataVencimento)}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Titulo</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Descrição</TableCell>
              <TableCell>Qtd</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice?.items.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="body" sx={{ color: 'text.primary' }} noWrap>
                      {row.titulo}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      {row.descricao}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.quantidade}</TableCell>
                <TableCell align="right">{fCurrency(row.preco * row.quantidade)}</TableCell>
              </TableRow>
            ))}
            {renderTotal}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
