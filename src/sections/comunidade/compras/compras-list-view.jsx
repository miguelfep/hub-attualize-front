'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import Pagination from '@mui/material/Pagination';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { useCompras } from 'src/actions/comunidade';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'reembolsado', label: 'Reembolsado' },
];

const TIPO_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'material', label: 'Material' },
  { value: 'curso', label: 'Curso' },
];

const STATUS_COLOR = {
  pendente: 'warning',
  aprovado: 'success',
  cancelado: 'error',
  reembolsado: 'default',
};

const PAGE_SIZE = 20;

// ----------------------------------------------------------------------

export function ComprasListView() {
  const [page, setPage] = useState(1);
  const [tipo, setTipo] = useState('all');
  const [status, setStatus] = useState('all');

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(tipo !== 'all' && { tipo }),
      ...(status !== 'all' && { status }),
    }),
    [page, tipo, status]
  );

  const { data: compras, total, isLoading } = useCompras(params);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const getTitulo = (row) => {
    if (row.tipo === 'curso') return row.curso?.titulo ?? row.titulo ?? '—';
    return row.material?.titulo ?? row.titulo ?? '—';
  };

  const getValor = (row) => {
    const v = row.valorPago ?? row.valor;
    if (v == null) return '—';
    return `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Compras (Comunidade)"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Comunidade', href: paths.dashboard.comunidade.root },
          { name: 'Compras' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            size="small"
            label="Tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 140 }}
          >
            {TIPO_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 140 }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Card>

      <Card>
        {isLoading ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            Carregando...
          </Box>
        ) : !compras?.length ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            Nenhuma compra encontrada.
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {compras.map((row) => {
                    const statusColor = STATUS_COLOR[row.status] || 'default';
                    const dataCompra = row.dataCompra ?? row.createdAt;
                    const dataStr = dataCompra
                      ? new Date(dataCompra).toLocaleDateString('pt-BR')
                      : '—';
                    return (
                      <TableRow key={row._id}>
                        <TableCell>
                          <Label variant="soft" color={row.tipo === 'curso' ? 'info' : 'default'}>
                            {row.tipo === 'curso' ? 'Curso' : 'Material'}
                          </Label>
                        </TableCell>
                        <TableCell>{getTitulo(row)}</TableCell>
                        <TableCell>{getValor(row)}</TableCell>
                        <TableCell>
                          <Label variant="soft" color={statusColor}>
                            {row.status || '—'}
                          </Label>
                        </TableCell>
                        <TableCell>{dataStr}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Stack alignItems="flex-end" sx={{ p: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </>
        )}
      </Card>
    </DashboardContent>
  );
}
