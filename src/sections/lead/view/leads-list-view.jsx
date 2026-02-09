'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { getLeads } from 'src/actions/lead';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { TableNoData, TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 200 },
  { id: 'segment', label: 'Segmento', width: 120 },
  { id: 'origem', label: 'Origem', width: 250 },
  { id: 'statusLead', label: 'Status', width: 140 },
  { id: 'owner', label: 'Responsável', width: 140 },
  { id: '', width: 50 },
];

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos', color: 'default' },
  { value: 'novo', label: 'Novos', color: 'info' },
  { value: 'contatado', label: 'Contatados', color: 'primary' },
  { value: 'qualificado', label: 'Qualificados', color: 'success' },
  { value: 'proposta-enviada', label: 'Proposta Enviada', color: 'warning' },
  { value: 'negociacao', label: 'Em Negociação', color: 'warning' },
  { value: 'convertido', label: 'Convertidos', color: 'success' },
  { value: 'perdido', label: 'Perdidos', color: 'error' },
];

// ----------------------------------------------------------------------

export function LeadsListView() {
  const theme = useTheme();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('novo');
  const [filtroBusca, setFiltroBusca] = useState('');

  const carregarLeads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLeads();
      console.log(result);
      setLeads(result.leads || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    carregarLeads();
  }, [carregarLeads]);

  // Aplicar filtros
  const leadsFiltrados = leads.filter((lead) => {
    // Filtro de status
    const matchStatus = filtroStatus === 'todos' || lead.statusLead === filtroStatus || (!lead.statusLead && filtroStatus === 'novo');

    // Filtro de busca (nome, email, telefone)
    const matchBusca = !filtroBusca ||
      lead.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      lead.email?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      lead.telefone?.includes(filtroBusca);

    return matchStatus && matchBusca;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLeads = leadsFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusCount = (status) => {
    if (status === 'todos') return leads.length;
    if (status === 'novo') return leads.filter(l => !l.statusLead || l.statusLead === 'novo').length;
    return leads.filter(l => l.statusLead === status).length;
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gerenciamento de Leads
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {leadsFiltrados.length} lead{leadsFiltrados.length !== 1 ? 's' : ''} encontrado{leadsFiltrados.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:refresh-bold" />}
          onClick={carregarLeads}
          sx={{ bgcolor: '#0096D9' }}
        >
          Atualizar
        </Button>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Stack spacing={3}>
          {/* Busca */}
          <TextField
            fullWidth
            placeholder="Buscar por nome, email ou telefone..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <Iconify icon="solar:magnifer-bold-duotone" width={24} sx={{ color: 'text.disabled', mr: 1 }} />
              ),
            }}
          />

          {/* Filtros de Status */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Filtrar por Status:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {STATUS_OPTIONS.map((option) => {
                const count = getStatusCount(option.value);
                const isActive = filtroStatus === option.value;

                return (
                  <Button
                    key={option.value}
                    size="small"
                    variant={isActive ? 'contained' : 'outlined'}
                    onClick={() => setFiltroStatus(option.value)}
                    sx={{
                      borderColor: isActive ? undefined : alpha(theme.palette.grey[500], 0.32),
                      color: isActive ? 'white' : 'text.secondary',
                      bgcolor: isActive ? `${option.color}.main` : 'transparent',
                      '&:hover': {
                        bgcolor: isActive ? `${option.color}.dark` : alpha(theme.palette.grey[500], 0.08),
                      },
                    }}
                  >
                    {option.label} ({count})
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Stack>
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
              ) : paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <TableNoData
                      title="Nenhum lead encontrado"
                      description="Tente ajustar os filtros ou aguarde novos leads chegarem"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((row) => (
                  <LeadTableRow key={row._id} row={row} onUpdate={carregarLeads} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={leadsFiltrados.length}
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

function LeadTableRow({ row, onUpdate }) {
  const router = useRouter();
  const popover = usePopover();

  const handleOpenDetails = () => {
    popover.onClose();
    router.push(paths.dashboard.comercial.leadDetails(row._id));
  };

  const handleWhatsApp = () => {
    popover.onClose();
    const mensagem = encodeURIComponent(
      `Olá ${row.nome}, vi que você se interessou pela Attualize. Como posso ajudar?`
    );
    const telefone = row.telefone?.replace(/\D/g, '');
    if (telefone) {
      window.open(`https://wa.me/55${telefone}?text=${mensagem}`, '_blank');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'novo': 'info',
      'contatado': 'primary',
      'qualificado': 'success',
      'proposta-enviada': 'warning',
      'negociacao': 'warning',
      'convertido': 'success',
      'perdido': 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'novo': 'Novo',
      'contatado': 'Contatado',
      'qualificado': 'Qualificado',
      'proposta-enviada': 'Proposta Enviada',
      'negociacao': 'Em Negociação',
      'convertido': 'Convertido',
      'perdido': 'Perdido',
    };
    return labels[status] || 'Novo';
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{row.nome}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.email}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Chip
            label={row.segment || '-'}
            size="small"
            variant="soft"
            sx={{ textTransform: 'capitalize' }}
          />
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
                  maxWidth: 250,
                }}
              >
                {row.origem}
              </Typography>
            </Tooltip>
          ) : (
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              -
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={getStatusColor(row.statusLead || 'novo')}>
            {getStatusLabel(row.statusLead || 'novo')}
          </Label>
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
            Ver Detalhes
          </MenuItem>

          <MenuItem onClick={handleWhatsApp}>
            <Iconify icon="logos:whatsapp-icon" />
            WhatsApp
          </MenuItem>

          <MenuItem onClick={() => {
            popover.onClose();
            window.location.href = `mailto:${row.email}`;
          }}>
            <Iconify icon="solar:letter-bold-duotone" />
            Enviar Email
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}

