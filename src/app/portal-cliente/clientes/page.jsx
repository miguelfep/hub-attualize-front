'use client';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { mutate as mutateGlobal } from 'swr';
import { useState, useCallback } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  TableBody,
  Typography,
  CardContent,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { endpoints } from 'src/utils/axios';
import { applySortFilter } from 'src/utils/constants/table-utils';

import { usePortalClientes, portalUpdateCliente } from 'src/actions/portal';

import { Iconify } from 'src/components/iconify';
import { useTable, getComparator } from 'src/components/table';
import { ClienteTableRowSkeleton } from 'src/components/skeleton/ClienteTableRowSkeleton';
import { PortalClientesPageSkeleton } from 'src/components/skeleton/PortalClientePageSkeleton';

import { TableHeadCustom } from 'src/sections/clientes/TableHeadCustom';
import { ClienteTableRow } from 'src/sections/clientes/ClienteTableRow';
import { ClienteTableToolbar } from 'src/sections/clientes/ClienteTableToolbar';

import { useAuthContext } from 'src/auth/hooks';

function ClienteMobileCard({ cliente, onToggleStatus, onEdit, isToggling }) {
  const isActive = (v) => v === true || v === 'true' || v === 1;
  const getRazaoSocial = (row) =>
    row?.razaoSocial ?? row?.razaosocial ?? row?.razao_social ?? row?.RazaoSocial ?? '';

  return (
    <Card variant="outlined" sx={{ '&:hover': { boxShadow: (theme) => theme.customShadows.z16 } }}>
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box sx={{ maxWidth: 'calc(100% - 80px)' }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word' }}
            >
              {cliente.nome}
            </Typography>
            {!!getRazaoSocial(cliente) && (
              <Typography variant="body2" color="text.secondary">
                {getRazaoSocial(cliente)}
              </Typography>
            )}
          </Box>
          <Chip
            size="small"
            label={isActive(cliente.status) ? 'Ativo' : 'Inativo'}
            color={isActive(cliente.status) ? 'success' : 'default'}
            variant="soft"
          />
        </Stack>

        <Stack spacing={1} sx={{ mb: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            <strong>CPF/CNPJ:</strong> {cliente.cpfCnpj}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            <strong>Email:</strong> {cliente.email}
          </Typography>
          <Typography variant="body2">
            <strong>Telefone:</strong> {cliente.telefone}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Button
            size="small"
            variant="contained"
            color={isActive(cliente.status) ? 'error' : 'success'}
            disabled={isToggling}
            onClick={onToggleStatus}
          >
            {isActive(cliente.status) ? 'Inativar' : 'Ativar'}
          </Button>
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={onEdit} 
          >
            Editar
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function PortalClientesPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarClientes, limiteClientes } = useSettings();
  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'nome', defaultRowsPerPage: 25});

  const [filters, setFilters] = useState({ search: '', status: '', tipoPessoa: '' });
  const { data: clientes, isLoading, mutate } = usePortalClientes(clienteProprietarioId, filters);

  const [toggling, setToggling] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToggleStatus = async (row) => {
    const isActive = (v) => v === true || v === 'true' || v === 1;
    const nextStatus = !isActive(row.status);
    mutate((prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map((r) => (r._id === row._id ? { ...r, status: nextStatus } : r));
    }, false);
    try {
      setToggling((list) => [...list, row._id]);
      await portalUpdateCliente(clienteProprietarioId, row._id, { status: nextStatus });
      toast.success(nextStatus ? 'Cliente ativado' : 'Cliente inativado');
    } catch (error) {
      toast.error('Erro ao alterar status');
      mutate();
    } finally {
      setToggling((list) => list.filter((id) => id !== row._id));
      mutate();
      const base = endpoints.portal.clientes.list(clienteProprietarioId);
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith(base), undefined, true);
    }
  };

  const handleFilters = useCallback((key, value) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [key]: value }));
    }, [table]);

  const dataFiltered = applySortFilter({
    inputData: Array.isArray(clientes) ? clientes : [],
    comparator: getComparator(table.order, table.orderBy),
  });

  const TABLE_HEAD = [
    { id: 'nome', label: 'Nome / Razão Social',  width: 300, align: 'left' },
    { id: 'cpfCnpj', label: 'CPF/CNPJ', width: 300, align: 'center' },
    { id: 'email', label: 'Email', width: 300 , align: 'center'},
    { id: 'telefone', label: 'Telefone', width: 300, align: 'center' },
    { id: 'status', label: 'Status', width: 300, align: 'center' },
    { id: '', label: '', align: 'right' },
  ];

  if (loadingEmpresas || !clienteProprietarioId) {
    return <PortalClientesPageSkeleton />;
  }
  
  if (!podeGerenciarClientes) {
    return <Typography>Funcionalidade não disponível.</Typography>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, // Empilha na vertical no mobile (xs)
              alignItems: { sm: 'center' },               // Centraliza verticalmente no desktop (sm)
              justifyContent: 'space-between',
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}
          >
          <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Meus Clientes
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                Visualize, gerencie e cadastre seus clientes.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
              {limiteClientes && (
                <Chip
                  label={`${dataFiltered.length} / ${limiteClientes}`}
                  size="small"
                  sx={{ bgcolor: 'black', color: 'common.white' }}
                />
              )}
              <Button
                href="./novo"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
              >
                Novo Cliente
              </Button>
            </Stack>
          </Box>

          <ClienteTableToolbar filters={filters} onFilters={handleFilters} />

          <CardContent sx={{ p: { xs: 2, md: 0 } }}>
            {isMobile ? (
              <Stack spacing={2}>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row, index) => (
                    <m.div
                      key={row._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ClienteMobileCard
                        cliente={row}
                        onToggleStatus={() => handleToggleStatus(row)}
                        onEdit={() => router.push(`./${row._id}`)}
                        isToggling={toggling.includes(row._id)}
                      />
                    </m.div>
                  ))}
              </Stack>
            ) : (
              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                <Table size={table.dense ? 'small' : 'medium'}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />
                  <TableBody>
                    {isLoading
                      ? [...Array(5)].map((_, index) => (
                          <ClienteTableRowSkeleton key={index} />
                        ))
                      : dataFiltered
                          .slice(
                            table.page * table.rowsPerPage,
                            table.page * table.rowsPerPage + table.rowsPerPage
                          )
                          .map((row) => (
                            <ClienteTableRow
                              key={row._id}
                              row={row}
                              onEdit={() => router.push(`./${row._id}`)}
                              onToggle={() => handleToggleStatus(row)}
                              isToggling={toggling.includes(row._id)}
                            />
                          ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            page={table.page}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </m.div>

      {/* <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Excluir cliente?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação não poderá ser desfeita. Deseja realmente excluir este cliente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (toDelete) {
                await handleDelete(toDelete);
              }
              setConfirmOpen(false);
              setToDelete(null);
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog> */}
    </LazyMotion>
  );
}
