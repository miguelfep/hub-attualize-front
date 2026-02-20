import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

const itensDoOrcamento = (invoice) =>
  Array.isArray(invoice?.items) ? invoice.items : Array.isArray(invoice?.itens) ? invoice.itens : [];

export function OrcamentoPendente({ invoice }) {
  const itens = itensDoOrcamento(invoice);

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

  const blockSx = {
    p: 2.5,
    borderRadius: 2,
    bgcolor: 'background.neutral',
    border: '1px solid',
    borderColor: 'divider',
    height: '100%',
  };

  return (
    <Box sx={{ my: 0 }}>
      {/* Contratada, Contratante e Validade - blocos bem separados */}
      <Grid container spacing={3} sx={{ mb: { xs: 4, md: 5 } }}>
        <Grid xs={12} sm={6} md={4}>
          <Box sx={blockSx}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Contratada
            </Typography>
            <Stack spacing={1.25}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Attualize Contabil LTDA
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Avenida Senador Salgado Filho 1847 - Guabirotuba
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Curitiba - PR
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Telefone: (41) 9 9698-2267
              </Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Box sx={blockSx}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Contratante
            </Typography>
            <Stack spacing={1.25}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {invoice?.cliente?.nome || invoice?.lead?.nome || '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {invoice?.cliente?.email || invoice?.lead?.email || '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Telefone: {invoice?.cliente?.whatsapp || invoice?.lead?.telefone || '—'}
              </Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Box sx={blockSx}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Proposta válida até
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {fDate(invoice?.dataVencimento)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Itens: cards no mobile, tabela no desktop */}
      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
          Itens do orçamento
        </Typography>

        {/* Layout em cards para mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack spacing={2}>
            {itens.map((row, index) => (
              <Card key={index} variant="outlined" sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        #{index + 1}
                      </Typography>
                      <Typography variant="subtitle2">{fCurrency((row.preco || 0) * (row.quantidade || 0))}</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {row.titulo}
                    </Typography>
                    {row.descricao && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {row.descricao}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Qtd: {row.quantidade}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
                <Typography variant="body2">{fCurrency(invoice?.subTotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Desconto</Typography>
                <Typography variant="body2" color="error.main">- {fCurrency(invoice?.desconto)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="subtitle1">{fCurrency(invoice?.total)}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Tabela para desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
          <Table sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell sx={{ typography: 'subtitle2' }}>Título</TableCell>
                <TableCell sx={{ typography: 'subtitle2' }}>Descrição</TableCell>
                <TableCell>Qtd</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itens.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {row.titulo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {row.descricao || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.quantidade}</TableCell>
                  <TableCell align="right">{fCurrency((row.preco || 0) * (row.quantidade || 0))}</TableCell>
                </TableRow>
              ))}
              {renderTotal}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
