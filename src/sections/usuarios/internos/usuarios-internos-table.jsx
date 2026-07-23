import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useBoolean } from 'src/hooks/use-boolean';

import { avatarUrl } from 'src/utils/avatar';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

const ROLE_LABELS = {
  admin: 'Administrador',
  gerencial: 'Gerencial',
  financeiro: 'Financeiro',
  comercial: 'Comercial',
  operacional: 'Operacional',
  contabil_externo: 'Contábil Externo',
  ir: 'Imposto de Renda',
};

const ROLE_COLORS = {
  admin: 'error',
  gerencial: 'warning',
  financeiro: 'success',
  comercial: 'info',
  operacional: 'default',
  contabil_externo: 'secondary',
  ir: 'primary',
};

function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

function getStatusLabel(status) {
  if (status === true) return 'Ativo';
  if (status === false) return 'Inativo';
  return status || '';
}

function getStatusColor(status) {
  if (status === true) return 'success';
  if (status === false) return 'error';
  return 'default';
}

function getEmpresasSortString(usuario) {
  if (!usuario.empresasId?.length) return '';
  return usuario.empresasId
    .map((e) => (typeof e === 'object' && e?.razaoSocial ? e.razaoSocial : e?.nome || String(e)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .join(' ');
}

function getComparator(order, orderBy) {
  const dir = order === 'asc' ? 1 : -1;
  return (a, b) => {
    let valA;
    let valB;
    switch (orderBy) {
      case 'name':
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return dir * valA.localeCompare(valB, 'pt-BR');
      case 'email':
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
        return dir * valA.localeCompare(valB, 'pt-BR');
      case 'role':
        valA = (Array.isArray(a.role) ? a.role[0] : a.role) || '';
        valB = (Array.isArray(b.role) ? b.role[0] : b.role) || '';
        return dir * valA.localeCompare(valB, 'pt-BR');
      case 'empresas':
        valA = getEmpresasSortString(a);
        valB = getEmpresasSortString(b);
        return dir * valA.localeCompare(valB, 'pt-BR');
      case 'status':
        valA = getStatusLabel(a.status);
        valB = getStatusLabel(b.status);
        return dir * valA.localeCompare(valB, 'pt-BR');
      case 'ultimoAcesso': {
        const dA = a.ultimoAcesso ? new Date(a.ultimoAcesso).getTime() : 0;
        const dB = b.ultimoAcesso ? new Date(b.ultimoAcesso).getTime() : 0;
        return dir * (dA - dB);
      }
      case 'createdAt': {
        const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dir * (dA - dB);
      }
      default:
        return 0;
    }
  };
}

const HEAD_LABELS = [
  { id: 'name', label: 'Usuário', width: 240, sortable: true },
  { id: 'email', label: 'Email', width: 220, sortable: true },
  { id: 'role', label: 'Perfil', width: 150, sortable: true },
  { id: 'empresas', label: 'Empresas', sortable: true },
  { id: 'status', label: 'Status', width: 120, sortable: true },
  { id: 'ultimoAcesso', label: 'Último Acesso', width: 140, sortable: true },
  { id: 'createdAt', label: 'Criado em', width: 120, sortable: true },
];

// ----------------------------------------------------------------------

export function UsuariosInternosTable({ usuarios, loading, onEdit, onDelete }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const confirmDialog = useBoolean();

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const sortedUsuarios = useMemo(
    () => [...usuarios].sort(getComparator(order, orderBy)),
    [usuarios, order, orderBy]
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDeleteClick = (usuario) => {
    confirmDialog.onTrue();
    confirmDialog.setValue(usuario);
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.value) {
      onDelete(confirmDialog.value._id);
      confirmDialog.onFalse();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateWithTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedUsuarios.length) : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando usuários internos...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size="medium" sx={{ minWidth: 1080 }}>
            <TableHead>
              <TableRow>
                {HEAD_LABELS.map((head) => (
                  <TableCell
                    key={head.id}
                    width={head.width}
                    sortDirection={orderBy === head.id ? order : false}
                  >
                    {head.sortable ? (
                      <TableSortLabel
                        active={orderBy === head.id}
                        direction={orderBy === head.id ? order : 'asc'}
                        onClick={() => handleRequestSort(head.id)}
                      >
                        {head.label}
                      </TableSortLabel>
                    ) : (
                      head.label
                    )}
                  </TableCell>
                ))}
                <TableCell align="center" width={100}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedUsuarios
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((usuario) => {
                  const roles = Array.isArray(usuario.role) ? usuario.role : [usuario.role].filter(Boolean);
                  const empresaAtivaId =
                    typeof usuario.empresaAtiva === 'string'
                      ? usuario.empresaAtiva
                      : usuario.empresaAtiva?._id;

                  return (
                    <TableRow hover key={usuario._id} tabIndex={-1}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            src={avatarUrl(usuario) || undefined}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              fontWeight: 'bold',
                              fontSize: 15,
                            }}
                          >
                            {usuario.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                              {usuario.name || 'Nome não informado'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {usuario._id?.slice(-8)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {usuario.email || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {roles.length > 0 ? (
                            roles.map((r) => (
                              <Chip
                                key={r}
                                label={getRoleLabel(r)}
                                size="small"
                                color={ROLE_COLORS[r] || 'default'}
                                variant="filled"
                                sx={{ fontSize: '0.7rem', height: 22, fontWeight: 'bold' }}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        {usuario.empresasId && usuario.empresasId.length > 0 ? (
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                  Empresas vinculadas:
                                </Typography>
                                <Stack spacing={0.5}>
                                  {usuario.empresasId.map((empresa, index) => {
                                    const isAtiva =
                                      empresaAtivaId &&
                                      (typeof empresa === 'string'
                                        ? empresa === empresaAtivaId
                                        : empresa._id === empresaAtivaId);
                                    return (
                                      <Typography key={index} variant="body2">
                                        {isAtiva ? '★ ' : '• '}
                                        {typeof empresa === 'string'
                                          ? empresa
                                          : empresa.razaoSocial || empresa.nome}
                                        {typeof empresa === 'object' && empresa.cnpj && (
                                          <Typography
                                            component="span"
                                            variant="caption"
                                            sx={{ ml: 1, color: 'text.secondary' }}
                                          >
                                            ({empresa.cnpj})
                                          </Typography>
                                        )}
                                      </Typography>
                                    );
                                  })}
                                </Stack>
                              </Box>
                            }
                            arrow
                            placement="top"
                          >
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {usuario.empresasId.slice(0, 2).map((empresa, index) => (
                                <Chip
                                  key={index}
                                  label={
                                    typeof empresa === 'string'
                                      ? empresa
                                      : empresa.razaoSocial || empresa.nome
                                  }
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20, cursor: 'help' }}
                                />
                              ))}
                              {usuario.empresasId.length > 2 && (
                                <Chip
                                  label={`+${usuario.empresasId.length - 2}`}
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20, cursor: 'help' }}
                                />
                              )}
                            </Stack>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Nenhuma empresa
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel(usuario.status)}
                          color={getStatusColor(usuario.status)}
                          size="small"
                          icon={
                            <Iconify
                              icon={
                                usuario.status === true
                                  ? 'eva:checkmark-circle-2-fill'
                                  : 'eva:close-circle-fill'
                              }
                              width={16}
                            />
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateWithTime(usuario.ultimoAcesso)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(usuario.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(usuario)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Iconify icon="eva:edit-fill" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(usuario)}
                              sx={{ color: 'error.main' }}
                            >
                              <Iconify icon="eva:trash-2-fill" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={8} />
                </TableRow>
              )}

              {sortedUsuarios.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Stack spacing={1} alignItems="center">
                      <Iconify
                        icon="solar:users-group-rounded-bold-duotone"
                        width={48}
                        sx={{ color: 'text.disabled' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Nenhum usuário interno encontrado.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePagination
        page={page}
        component="div"
        count={sortedUsuarios.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Excluir Usuário Interno"
        content={
          <>
            Tem certeza que deseja excluir o usuário{' '}
            <strong>{confirmDialog.value?.name}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        }
      />
    </>
  );
}
