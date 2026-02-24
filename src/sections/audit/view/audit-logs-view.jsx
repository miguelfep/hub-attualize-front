'use client';

import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { DatePicker } from '@mui/x-date-pickers';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';

import { getAuditLogs, getEntityHistory } from 'src/actions/audit';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData , TableHeadCustom } from 'src/components/table';
import { AuditLogTableRowSkeleton } from 'src/components/skeleton/AuditLogTableRowSkeleton';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'createdAt', label: 'Data/Hora', width: 180 },
  { id: 'action', label: 'Ação', width: 100 },
  { id: 'entityType', label: 'Entidade', width: 120 },
  { id: 'userEmail', label: 'Usuário', width: 200 },
  { id: 'clienteRazaoSocial', label: 'Cliente', width: 180 },
  { id: 'changes', label: 'Alterações', width: 200 },
  { id: 'actions', label: 'Ações', align: 'right', width: 100 },
];

const ENTITY_TYPES = [
  { value: '', label: 'Todas' },
  { value: 'Cliente', label: 'Cliente' },
  { value: 'User', label: 'Usuário' },
  { value: 'Invoice', label: 'Orçamento/Venda' },
  { value: 'Contrato', label: 'Contrato' },
  { value: 'Cobranca', label: 'Cobrança' },
];

const ACTION_TYPES = [
  { value: '', label: 'Todas' },
  { value: 'CREATE', label: 'Criar' },
  { value: 'UPDATE', label: 'Atualizar' },
  { value: 'DELETE', label: 'Excluir' },
];

// ----------------------------------------------------------------------

export function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filtros
  const [filtroEntityType, setFiltroEntityType] = useState('');
  const [filtroAction, setFiltroAction] = useState('');
  const [filtroUserEmail, setFiltroUserEmail] = useState('');
  const [filtroInicio, setFiltroInicio] = useState(dayjs().subtract(30, 'days'));
  const [filtroFim, setFiltroFim] = useState(dayjs());
  
  // Dialog de detalhes
  const [dialogDetalhes, setDialogDetalhes] = useState({ open: false, log: null });
  const [dialogHistorico, setDialogHistorico] = useState({ open: false, entityType: null, entityId: null, historico: [] });
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        pagina: page + 1,
        limite: rowsPerPage,
      };
      
      if (filtroEntityType) params.entityType = filtroEntityType;
      if (filtroAction) params.action = filtroAction;
      if (filtroUserEmail) params.userEmail = filtroUserEmail;
      if (filtroInicio) params.inicio = filtroInicio.toISOString();
      if (filtroFim) params.fim = filtroFim.endOf('day').toISOString();
      
      const response = await getAuditLogs(params);
      
      if (response.logs) {
        setLogs(response.logs);
        setTotal(response.paginacao?.total || 0);
        setTotalPages(response.paginacao?.totalPaginas || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      if (error.response?.status === 403) {
        toast.error('Acesso negado: Apenas administradores podem visualizar logs de auditoria.');
      } else {
        toast.error('Erro ao carregar logs de auditoria');
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filtroEntityType, filtroAction, filtroUserEmail, filtroInicio, filtroFim]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleViewDetails = (log) => {
    setDialogDetalhes({ open: true, log });
  };

  const handleViewHistory = async (entityType, entityId) => {
    try {
      setLoadingHistorico(true);
      setDialogHistorico({ open: true, entityType, entityId, historico: [] });
      
      const response = await getEntityHistory(entityType, entityId);
      
      if (response.historico) {
        setDialogHistorico(prev => ({ ...prev, historico: response.historico }));
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleResetFilters = () => {
    setFiltroEntityType('');
    setFiltroAction('');
    setFiltroUserEmail('');
    setFiltroInicio(dayjs().subtract(30, 'days'));
    setFiltroFim(dayjs());
    setPage(0);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATE':
        return 'Criar';
      case 'UPDATE':
        return 'Atualizar';
      case 'DELETE':
        return 'Excluir';
      default:
        return action;
    }
  };

  const formatChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return 'Nenhuma alteração';
    
    const changeKeys = Object.keys(changes);
    if (changeKeys.length === 0) return 'Nenhuma alteração';
    
    if (changeKeys.length <= 3) {
      return changeKeys.join(', ');
    }
    
    return `${changeKeys.slice(0, 3).join(', ')} +${changeKeys.length - 3} mais`;
  };

  return (
    <>
      <Stack spacing={3}>
        {/* Filtros */}
        <Card>
          <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Entidade</InputLabel>
                <Select
                  value={filtroEntityType}
                  onChange={(e) => {
                    setFiltroEntityType(e.target.value);
                    setPage(0);
                  }}
                  label="Entidade"
                >
                  {ENTITY_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Ação</InputLabel>
                <Select
                  value={filtroAction}
                  onChange={(e) => {
                    setFiltroAction(e.target.value);
                    setPage(0);
                  }}
                  label="Ação"
                >
                  {ACTION_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Email do Usuário"
                value={filtroUserEmail}
                onChange={(e) => {
                  setFiltroUserEmail(e.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: 250 }}
              />

              <DatePicker
                label="Data Início"
                value={filtroInicio}
                onChange={(newValue) => {
                  setFiltroInicio(newValue);
                  setPage(0);
                }}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
              />

              <DatePicker
                label="Data Fim"
                value={filtroFim}
                onChange={(newValue) => {
                  setFiltroFim(newValue);
                  setPage(0);
                }}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
              />

              <Button
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<Iconify icon="eva:refresh-fill" />}
                sx={{ minWidth: 120 }}
              >
                Limpar
              </Button>
            </Stack>
          </Box>
        </Card>

        {/* Tabela */}
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 1380 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {loading ? (
                    <>
                      {[...Array(rowsPerPage)].map((_, index) => (
                        <AuditLogTableRowSkeleton key={`skeleton-${index}`} />
                      ))}
                    </>
                  ) : logs.length === 0 ? (
                    <TableNoData notFound />
                  ) : (
                    logs.map((log) => (
                        <TableRow key={log._id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {fDateTime(log.createdAt, 'DD/MM/YYYY HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getActionLabel(log.action)}
                              color={getActionColor(log.action)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.entityType}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.userEmail}</Typography>
                            {log.userId?.name && (
                              <Typography variant="caption" color="text.secondary">
                                {log.userId.name}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 180 }} title={log.clienteRazaoSocial || undefined}>
                              {log.clienteRazaoSocial || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {formatChanges(log.changes)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Ver Detalhes">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(log)}
                                >
                                  <Iconify icon="eva:eye-fill" />
                                </IconButton>
                              </Tooltip>
                              {log.entityType && log.entityId && (
                                <Tooltip title="Ver Histórico">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewHistory(log.entityType, log.entityId)}
                                  >
                                    <Iconify icon="eva:clock-fill" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            {/* Paginação */}
            <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            />
          </Card>
      </Stack>

      {/* Dialog de Detalhes */}
      <Dialog
        open={dialogDetalhes.open}
        onClose={() => setDialogDetalhes({ open: false, log: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="eva:info-fill" width={24} />
            <Typography variant="h6">Detalhes do Log</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {dialogDetalhes.log && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Informações Gerais
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Data/Hora:</Typography>
                    <Typography variant="body2">{fDateTime(dialogDetalhes.log.createdAt)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Ação:</Typography>
                    <Chip
                      label={getActionLabel(dialogDetalhes.log.action)}
                      color={getActionColor(dialogDetalhes.log.action)}
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Entidade:</Typography>
                    <Typography variant="body2">{dialogDetalhes.log.entityType}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">ID da Entidade:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {dialogDetalhes.log.entityId}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Usuário:</Typography>
                    <Typography variant="body2">{dialogDetalhes.log.userEmail}</Typography>
                  </Stack>
                  {(dialogDetalhes.log.clienteRazaoSocial ?? '') !== '' && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                      <Typography variant="body2">{dialogDetalhes.log.clienteRazaoSocial}</Typography>
                    </Stack>
                  )}
                  {dialogDetalhes.log.userId?.name && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Nome:</Typography>
                      <Typography variant="body2">{dialogDetalhes.log.userId.name}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>

              {dialogDetalhes.log.changes && Object.keys(dialogDetalhes.log.changes).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Alterações
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(dialogDetalhes.log.changes).map(([key, change]) => (
                      <Box key={key} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          {key}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Valor Antigo:
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {JSON.stringify(change.old)}
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Valor Novo:
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {JSON.stringify(change.new)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {dialogDetalhes.log.ipAddress && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Informações Técnicas
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">IP:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {dialogDetalhes.log.ipAddress}
                      </Typography>
                    </Stack>
                    {dialogDetalhes.log.metadata?.endpoint && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Endpoint:</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {dialogDetalhes.log.metadata.endpoint}
                        </Typography>
                      </Stack>
                    )}
                    {dialogDetalhes.log.metadata?.method && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Método:</Typography>
                        <Typography variant="body2">{dialogDetalhes.log.metadata.method}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogDetalhes({ open: false, log: null })}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Histórico */}
      <Dialog
        open={dialogHistorico.open}
        onClose={() => setDialogHistorico({ open: false, entityType: null, entityId: null, historico: [] })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="eva:clock-fill" width={24} />
            <Typography variant="h6">
              Histórico - {dialogHistorico.entityType}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {loadingHistorico ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : dialogHistorico.historico.length === 0 ? (
            <Alert severity="info">Nenhum histórico encontrado para esta entidade.</Alert>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {dialogHistorico.historico.map((log) => (
                <Card key={log._id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={getActionLabel(log.action)}
                        color={getActionColor(log.action)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {fDateTime(log.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Por: {log.userEmail}
                    </Typography>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Alterações:
                        </Typography>
                        <Typography variant="body2">
                          {Object.keys(log.changes).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogHistorico({ open: false, entityType: null, entityId: null, historico: [] })}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
