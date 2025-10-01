'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import axios from 'src/utils/axios';

import { useTable } from 'src/components/table';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'numero', label: 'Número' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'dataInicio', label: 'Início' },
  { id: 'dataFim', label: 'Fim' },
  { id: 'valor', label: 'Valor' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: 'Ações' },
];

// ----------------------------------------------------------------------

export default function PortalClienteContratosView() {
  const { user } = useAuthContext();

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');

  const {
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,
    onSort,
    onChangePage,
    onChangeRowsPerPage,
    onSelectRow,
    onSelectAllRows,
  } = useTable({
    defaultOrderBy: 'dataInicio',
  });

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        const params = {
          page: page + 1,
          limit: rowsPerPage,
          ...(filtroStatus && { status: filtroStatus }),
        };

        const response = await axios.get('/api/cliente-portal/contratos', { params });
        setContratos(response.data.data || []);
      } catch (error) {
        console.error('Erro ao carregar contratos:', error);
        toast.error('Erro ao carregar contratos');
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, [page, rowsPerPage, filtroStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'success';
      case 'inativo':
        return 'error';
      case 'suspenso':
        return 'warning';
      case 'cancelado':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'suspenso':
        return 'Suspenso';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'contabilidade':
        return 'Contabilidade';
      case 'fiscal':
        return 'Fiscal';
      case 'societario':
        return 'Societário';
      case 'trabalhista':
        return 'Trabalhista';
      default:
        return tipo;
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">Meus Contratos</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            size="small"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            placeholder="Filtrar por status"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
            <MenuItem value="suspenso">Suspenso</MenuItem>
            <MenuItem value="cancelado">Cancelado</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{ width: headCell.width, minWidth: headCell.minWidth }}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {contratos.map((contrato) => (
                <TableRow key={contrato.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {contrato.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getTipoLabel(contrato.tipo)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(contrato.dataInicio)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {contrato.dataFim ? formatDate(contrato.dataFim) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(contrato.valor)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(contrato.status)}
                      color={getStatusColor(contrato.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          // Implementar visualização do contrato
                          toast.info('Funcionalidade em desenvolvimento');
                        }}
                      >
                        <Iconify icon="solar:eye-bold" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => {
                          // Implementar download do contrato
                          toast.info('Funcionalidade em desenvolvimento');
                        }}
                      >
                        <Iconify icon="solar:download-bold" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {contratos.length === 0 && !loading && (
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
              <Avatar sx={{ bgcolor: 'grey.100', width: 64, height: 64 }}>
                <Iconify icon="solar:file-text-bold-duotone" width={32} />
              </Avatar>
              <Typography variant="h6">Nenhum contrato encontrado</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Não há contratos para exibir no momento.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </>
  );
}
