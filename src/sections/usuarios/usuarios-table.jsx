import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export function UsuariosTable({ usuarios, loading, onEdit, onDelete }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const confirmDialog = useBoolean();


  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = usuarios.map((n) => n._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

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

  const getStatusColor = (status) => {
    const statusColors = {
      ativo: 'success',
      inativo: 'error',
      pendente: 'warning',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      true: 'Ativo',
      false: 'Inativo'
    
    };
    return statusLabels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usuarios.length) : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando usuários...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size="medium" sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < usuarios.length}
                    checked={usuarios.length > 0 && selected.length === usuarios.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>

                <TableCell>Usuário</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Empresas</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Último Acesso</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {usuarios
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((usuario) => {
                  const isItemSelected = isSelected(usuario._id);

                  return (
                    <TableRow
                      hover
                      key={usuario._id}
                      tabIndex={-1}
                      role="checkbox"
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleClick(event, usuario._id)}
                        />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                              {usuario.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Typography>
                          </Box>
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
                        <Typography variant="body2">
                          {usuario.email || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={usuario.role || 'Cliente'}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        {usuario.empresasId && usuario.empresasId.length > 0 ? (
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                  Empresas com Acesso:
                                </Typography>
                                <Stack spacing={0.5}>
                                  {usuario.empresasId.map((empresa, index) => (
                                    <Typography key={index} variant="body2">
                                      • {typeof empresa === 'string' ? empresa : empresa.nome}
                                      {typeof empresa === 'object' && empresa.cnpj && (
                                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                          ({empresa.cnpj})
                                        </Typography>
                                      )}
                                    </Typography>
                                  ))}
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
                                  label={typeof empresa === 'string' ? empresa : empresa.nome}
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
                          startIcon={
                            <Iconify 
                              icon={
                                usuario.status === 'ativo' 
                                  ? 'eva:checkmark-circle-2-fill' 
                                  : usuario.status === 'inativo'
                                  ? 'eva:close-circle-fill'
                                  : 'eva:clock-outline'
                              } 
                              width={16} 
                            />
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(usuario.ultimoAcesso)}
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
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePagination
        page={page}
        component="div"
        count={usuarios.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Excluir Usuário"
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
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Excluir
          </Button>
        }
      />
    </>
  );
}
