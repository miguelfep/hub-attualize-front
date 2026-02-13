import React from 'react';

import Stack from '@mui/material/Stack';
import {
  Box,
  Grid,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

export function OrcamentoPendente({ invoice }) {
  const renderTotal = (
    <>
      <TableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Subtotal</TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
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
    <Box sx={{ my: { xs: 2, md: 3 } }}>
      {/* Informações da Contratada e Contratante */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4}>
          <Stack spacing={1} sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contratada
            </Typography>
            Attualize Contabil LTDA
            <br />
            Avenida Senador Salgado Filho 1847 - Guabirotuba
            <br />
            Curitiba - PR
            <br />
            Telefone: (41) 9 9698-2267
          </Stack>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Stack spacing={1} sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contratante
            </Typography>
            {invoice?.cliente?.nome || invoice?.lead.nome}
            <br />
            {invoice?.cliente?.email || invoice?.lead.email}
            <br />
            Telefone: {invoice?.cliente?.whatsapp || invoice?.lead.telefone}
          </Stack>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Stack spacing={1} sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Proposta válida até
            </Typography>
            {fDate(invoice?.dataVencimento)}
          </Stack>
        </Grid>
      </Grid>

      {/* Tabela com Itens */}
      <Box sx={{ mt: { xs: 2, md: 3 }, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 720, maxWidth: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
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
                  <Box sx={{ maxWidth: { xs: 240, md: 560 } }}>
                    <Typography variant="body" sx={{ color: 'text.primary' }} noWrap>
                      {row.titulo}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: { xs: 240, md: 560 } }}>
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
