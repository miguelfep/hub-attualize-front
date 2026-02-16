'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { buscarLeadsConvertidos } from 'src/actions/lead';

import { Iconify } from 'src/components/iconify';
import { TableNoData, TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 200 },
  { id: 'email', label: 'Email', width: 200 },
  { id: 'clienteId', label: 'Cliente', width: 200 },
  { id: 'origem', label: 'Origem', width: 150 },
  { id: 'owner', label: 'Responsável', width: 140 },
  { id: '', width: 50 },
];

// ----------------------------------------------------------------------

export function LeadsConvertidosView() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filtroBusca, setFiltroBusca] = useState('');

  const carregarLeads = useCallback(async () => {
    setLoading(true);
    try {
      const currentPage = page + 1; // API usa página baseada em 1
      const result = await buscarLeadsConvertidos({
        page: currentPage,
        limit: rowsPerPage,
      });

      // Normalizar resposta da API
      let leadsData = [];
      let paginationData = {};

      if (result?.success && result?.data) {
        if (Array.isArray(result.data.leads)) {
          leadsData = result.data.leads;
        }
        if (result.data.pagination) {
          paginationData = result.data.pagination;
          setTotal(paginationData.total || 0);
          setTotalPages(paginationData.totalPages || 0);
        }
      } else if (Array.isArray(result?.leads)) {
        leadsData = result.leads;
        if (result.pagination) {
          paginationData = result.pagination;
          setTotal(paginationData.total || 0);
          setTotalPages(paginationData.totalPages || 0);
        }
      } else if (Array.isArray(result?.data)) {
        leadsData = result.data;
      }

      setLeads(leadsData);
    } catch (error) {
      console.error('Erro ao carregar leads convertidos:', error);
      setLeads([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    carregarLeads();
  }, [carregarLeads]);

  // Aplicar filtro de busca
  const leadsFiltrados = leads.filter((lead) => {
    if (!filtroBusca) return true;

    const termo = filtroBusca.toLowerCase();
    return (
      lead.nome?.toLowerCase().includes(termo) ||
      lead.email?.toLowerCase().includes(termo) ||
      lead.telefone?.includes(termo) ||
      lead.clienteId?.nome?.toLowerCase().includes(termo) ||
      lead.clienteId?.razaoSocial?.toLowerCase().includes(termo)
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Leads Convertidos
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {total} lead{total !== 1 ? 's' : ''} convertido{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
            onClick={() => router.push(paths.dashboard.comercial.leads)}
          >
            Voltar para Leads
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:refresh-bold" />}
            onClick={carregarLeads}
            sx={{ bgcolor: '#0096D9' }}
          >
            Atualizar
          </Button>
        </Stack>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, email, telefone ou cliente..."
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <Iconify icon="solar:magnifer-bold-duotone" width={24} sx={{ color: 'text.disabled', mr: 1 }} />
            ),
          }}
        />
      </Card>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : leadsFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <TableNoData
                      title="Nenhum lead convertido encontrado"
                      description="Não há leads convertidos ou os filtros não retornaram resultados"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                leadsFiltrados.map((row) => (
                  <LeadConvertidoTableRow key={row._id || row.id} row={row} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={filtroBusca ? leadsFiltrados.length : total}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function LeadConvertidoTableRow({ row }) {
  const router = useRouter();
  const popover = usePopover();

  const handleOpenDetails = () => {
    popover.onClose();
    router.push(paths.dashboard.comercial.leadDetails(row._id || row.id));
  };

  const handleOpenCliente = () => {
    if (row.clienteId?._id || row.clienteId?.id) {
      const clienteId = row.clienteId._id || row.clienteId.id;
      router.push(paths.dashboard.cliente.edit(clienteId));
    }
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{row.nome || '-'}</Typography>
            {row.telefone && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.telefone}
              </Typography>
            )}
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {row.email || '-'}
          </Typography>
        </TableCell>

        <TableCell>
          {row.clienteId ? (
            <Button
              variant="text"
              size="small"
              onClick={handleOpenCliente}
              sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
            >
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {row.clienteId.nome || row.clienteId.razaoSocial || '-'}
                </Typography>
                {row.clienteId.razaoSocial && row.clienteId.nome && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {row.clienteId.razaoSocial}
                  </Typography>
                )}
              </Stack>
            </Button>
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.disabled' }}>
              -
            </Typography>
          )}
        </TableCell>

        <TableCell>
          {row.origem ? (
            <Tooltip title={row.origem} arrow placement="top">
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: 150,
                }}
              >
                {row.origem}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Iconify icon="solar:user-bold" width={16} sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {row.owner || '-'}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={handleOpenDetails}>
            <Iconify icon="solar:eye-bold-duotone" />
            Ver Detalhes do Lead
          </MenuItem>

          {row.clienteId && (
            <MenuItem onClick={handleOpenCliente}>
              <Iconify icon="solar:user-bold" />
              Ver Cliente
            </MenuItem>
          )}
        </MenuList>
      </CustomPopover>
    </>
  );
}
