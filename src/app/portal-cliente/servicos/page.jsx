'use client';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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
  Dialog,
  TableBody,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  DialogContentText,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { fCurrency } from 'src/utils/format-number';
import { applySortFilter } from 'src/utils/constants/table-utils';

import { usePortalServicos, portalDeleteServico, portalUpdateServico } from 'src/actions/portal';

import { Iconify } from 'src/components/iconify';
import { useTable, getComparator } from 'src/components/table';
import { ServicoTableRowSkeleton } from 'src/components/skeleton/ServicoTableRowSkeleton';
import { PortalServicosPageSkeleton } from 'src/components/skeleton/PortalServicosPageSkeleton';

import { ServicoTableRow } from 'src/sections/servicos/ServicoTableRow';
import { TableHeadCustom } from 'src/sections/clientes/TableHeadCustom';
import { ServicoTableToolbar } from 'src/sections/servicos/ServicoTableToolbar';

import { useAuthContext } from 'src/auth/hooks';

function ServicoMobileCard({ servico, onToggle, onDelete, onEdit, isToggling }) {
  const isActive = (v) => v === true || v === 'true' || v === 1;

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
              {servico.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {servico.categoria}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={isActive(servico.status) ? 'Ativo' : 'Inativo'}
            color={isActive(servico.status) ? 'success' : 'default'}
            variant="soft"
          />
        </Stack>

        <Stack spacing={1} sx={{ mb: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Valor:</strong> {fCurrency(servico.valor)}
          </Typography>
          <Typography variant="body2">
            <strong>Unidade:</strong> {servico.unidade}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Button
            size="small"
            variant="contained"
            color={isActive(servico.status) ? 'error' : 'success'}
            disabled={isToggling}
            onClick={onDelete}
          >
            Deletar
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

export default function PortalServicosPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarServicos, limiteServicos } = useSettings();
  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'nome', defaultRowsPerPage: 25 });

  const [filters, setFilters] = useState({ status: 'true', categoria: '', search: '' });
  const { data: servicos, isLoading, mutate } = usePortalServicos(clienteProprietarioId, filters);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toggling, setToggling] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDelete = async (id) => {
    try {
      const response = await portalDeleteServico(id, clienteProprietarioId);
      if (response?.data?.success || response.message) {
        toast.success('Serviço excluído com sucesso!');
        mutate(
          servicos.filter((s) => s._id !== id),
          false
        );
      } else {
        toast.error(response?.data?.message || 'Ocorreu um erro ao tentar excluir.');
      }
    } catch (error) {
      console.error('Erro de rede ao excluir serviço:', error);
      toast.error('Não foi possível conectar ao servidor para excluir o serviço.');
    }
  };

  const handleToggleStatus = async (row) => {
    const isActive = (v) => v === true || v === 'true' || v === 1;
    const nextStatus = !isActive(row.status);

    mutate(
      (prev) =>
        Array.isArray(prev)
          ? prev.map((r) => (r._id === row._id ? { ...r, status: nextStatus } : r))
          : prev,
      false
    );

    try {
      setToggling((list) => [...list, row._id]);
      await portalUpdateServico(row._id, { status: nextStatus });
      toast.success(nextStatus ? 'Serviço ativado' : 'Serviço inativado');
    } catch (e) {
      toast.error('Erro ao alterar status');
      mutate();
    } finally {
      setToggling((list) => list.filter((id) => id !== row._id));
      mutate();
    }
  };

  const handleFilters = useCallback(
    (key, value) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [key]: value }));
    },
    [table]
  );

  const dataFiltered = applySortFilter({
    inputData: Array.isArray(servicos) ? servicos : [],
    comparator: getComparator(table.order, table.orderBy),
  });

  const TABLE_HEAD = [
    { id: 'nome', label: 'Nome', width: 300, align: 'left'},
    { id: 'categoria', label: 'Categoria', width: 300, align: 'center' },
    { id: 'valor', label: 'Valor', width: 300, align: 'center' },
    { id: 'unidade', label: 'Unid.', width: 300, align: 'center' },
    { id: 'status', label: 'Status', width: 300, align: 'center' },
    { id: '', label: '', align: 'right' },
  ];

  if (loadingEmpresas || !clienteProprietarioId) {
    return <PortalServicosPageSkeleton />;
  }
  if (!podeGerenciarServicos) {
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
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
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
                Meus Serviços
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                Visualize, gerencie e cadastre seus serviços.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }}}>
              {limiteServicos && (
                <Chip
                  label={`${dataFiltered.length} / ${limiteServicos}`}
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
                Novo Serviço
              </Button>
            </Stack>
          </Box>

          <ServicoTableToolbar filters={filters} onFilters={handleFilters} />

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
                      <ServicoMobileCard
                        servico={row}
                        onToggle={() => handleToggleStatus(row)}
                        onDelete={() => {
                          setToDelete(row._id);
                          setConfirmOpen(true);
                        }}
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
                      ? [...Array(table.rowsPerPage)].map((_, index) => (
                          <ServicoTableRowSkeleton key={index} />
                        ))
                      : dataFiltered
                          .slice(
                            table.page * table.rowsPerPage,
                            table.page * table.rowsPerPage + table.rowsPerPage
                          )
                          .map((row) => (
                            <ServicoTableRow
                              key={row._id}
                              row={row}
                              onEdit={() => router.push(`./${row._id}`)}
                              onToggle={() => handleToggleStatus(row)}
                              onDelete={() => {
                                setToDelete(row._id);
                                setConfirmOpen(true);
                              }}
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Excluir serviço?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação não poderá ser desfeita. Deseja realmente excluir este serviço?
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
      </Dialog>
    </LazyMotion>
  );
}
