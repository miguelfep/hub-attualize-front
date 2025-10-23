
import { Card, Chip, Table, TableRow, TableBody, TableCell, TableHead, CardHeader, IconButton, TableContainer } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function AnalyticsNewInvoices({ title, subheader, list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{`INV-${row.id}`}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{`$${row.price}`}</TableCell>
                <TableCell>
                  <Chip label={row.status} color={row.status === 'Paid' ? 'success' : 'warning'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton><Iconify icon="eva:more-vertical-fill" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
