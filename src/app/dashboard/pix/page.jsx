'use client';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { listarCobrancasPix, listarPixRecebidos } from 'src/actions/pix';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ATIVA', label: 'Ativa' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'REMOVIDA_PELO_USUARIO_RECEBEDOR', label: 'Removida' },
  { value: 'REMOVIDA_PELO_PSP', label: 'Removida pelo PSP' },
];

// ----------------------------------------------------------------------

export default function PixPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cobrancas'); // 'cobrancas' ou 'recebidos'
  
  // Dados de cobranças
  const [cobrancas, setCobrancas] = useState([]);
  const [pageCobrancas, setPageCobrancas] = useState(0);
  const [rowsPerPageCobrancas, setRowsPerPageCobrancas] = useState(25);
  const [totalCobrancas, setTotalCobrancas] = useState(0);
  
  // Dados de PIX recebidos
  const [pixRecebidos, setPixRecebidos] = useState([]);
  const [pageRecebidos, setPageRecebidos] = useState(0);
  const [rowsPerPageRecebidos, setRowsPerPageRecebidos] = useState(25);
  const [totalRecebidos, setTotalRecebidos] = useState(0);
  
  // Filtros
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [status, setStatus] = useState('');

  // Definir datas padrão (último mês)
  useEffect(() => {
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    setFim(hoje.toISOString().split('T')[0]);
    setInicio(umMesAtras.toISOString().split('T')[0]);
  }, []);

  const carregarCobrancas = useCallback(async () => {
    setLoading(true);
    try {
      const filtros = {
        inicio: inicio || undefined,
        fim: fim || undefined,
        status: status || undefined,
        paginaAtual: pageCobrancas + 1,
        itensPorPagina: rowsPerPageCobrancas,
      };

      const response = await listarCobrancasPix(filtros);
      
      console.log('📥 Resposta da API listarCobrancasPix:', response);
      
      // A resposta pode vir em diferentes formatos
      // Tentar diferentes estruturas possíveis
      const cobrancasList = response?.cobs 
        || response?.cobrancas 
        || response?.data?.cobs 
        || response?.data?.cobrancas 
        || (Array.isArray(response) ? response : []);
      
      const total = response?.paginacao?.total 
        || response?.total 
        || response?.data?.paginacao?.total 
        || response?.data?.total 
        || cobrancasList.length;

      console.log('✅ Cobranças processadas:', { count: cobrancasList.length, total });
      
      setCobrancas(cobrancasList);
      setTotalCobrancas(total);
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Erro ao carregar cobranças PIX';
      toast.error(errorMessage);
      setCobrancas([]);
      setTotalCobrancas(0);
    } finally {
      setLoading(false);
    }
  }, [inicio, fim, status, pageCobrancas, rowsPerPageCobrancas]);

  const carregarPixRecebidos = useCallback(async () => {
    setLoading(true);
    try {
      const filtros = {
        inicio: inicio || undefined,
        fim: fim || undefined,
        paginaAtual: pageRecebidos + 1,
        itensPorPagina: rowsPerPageRecebidos,
      };

      const response = await listarPixRecebidos(filtros);
      
      // A resposta pode vir em diferentes formatos
      const pixList = response?.pix 
        || response?.recebidos 
        || response?.data?.pix 
        || response?.data?.recebidos 
        || (Array.isArray(response) ? response : []);
      
      const total = response?.paginacao?.total 
        || response?.total 
        || response?.data?.paginacao?.total 
        || response?.data?.total 
        || pixList.length;

      setPixRecebidos(pixList);
      setTotalRecebidos(total);
    } catch (error) {
      console.error('Erro ao carregar PIX recebidos:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Erro ao carregar PIX recebidos';
      toast.error(errorMessage);
      setPixRecebidos([]);
      setTotalRecebidos(0);
    } finally {
      setLoading(false);
    }
  }, [inicio, fim, pageRecebidos, rowsPerPageRecebidos]);

  useEffect(() => {
    if (activeTab === 'cobrancas') {
      carregarCobrancas();
    } else {
      carregarPixRecebidos();
    }
  }, [activeTab, carregarCobrancas, carregarPixRecebidos]);

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'CONCLUIDA':
        return 'success';
      case 'ATIVA':
        return 'info';
      case 'REMOVIDA_PELO_USUARIO_RECEBEDOR':
      case 'REMOVIDA_PELO_PSP':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="PIX"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'PIX' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:file-text-bold" />}
              onClick={() => router.push(paths.dashboard.pix.logs)}
            >
              Logs
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:chart-bold" />}
              onClick={() => router.push(paths.dashboard.pix.relatorios)}
            >
              Relatórios
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Tabs */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant={activeTab === 'cobrancas' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('cobrancas')}
            startIcon={<Iconify icon="solar:bill-list-bold" />}
          >
            Cobranças PIX
          </Button>
          <Button
            variant={activeTab === 'recebidos' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('recebidos')}
            startIcon={<Iconify icon="solar:card-receive-bold" />}
          >
            PIX Recebidos
          </Button>
        </Stack>
      </Card>

      {/* Filtros */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Filtros</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Data Inicial"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            <TextField
              label="Data Final"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            {activeTab === 'cobrancas' && (
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ minWidth: 200 }}
                SelectProps={{ native: true }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            )}

            <Button
              variant="contained"
              onClick={() => {
                if (activeTab === 'cobrancas') {
                  carregarCobrancas();
                } else {
                  carregarPixRecebidos();
                }
              }}
              startIcon={<Iconify icon="solar:refresh-bold" />}
            >
              Filtrar
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Tabela de Cobranças */}
      {activeTab === 'cobrancas' && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>TXID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Chave</TableCell>
                  <TableCell>Criação</TableCell>
                  <TableCell>Expiração</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : cobrancas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma cobrança encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cobrancas.map((cobranca) => (
                    <TableRow key={cobranca.txid}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} noWrap>
                          {cobranca.txid || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={cobranca.status || '-'} color={getStatusColor(cobranca.status)} size="small" />
                      </TableCell>
                      <TableCell>{cobranca.valor?.original ? fCurrency(cobranca.valor.original) : '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} noWrap>
                          {cobranca.chave || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {cobranca.calendario?.criacao ? fDate(cobranca.calendario.criacao, 'dd/MM/yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {cobranca.calendario?.expiracao
                          ? fDate(
                              new Date(new Date(cobranca.calendario.criacao).getTime() + cobranca.calendario.expiracao * 1000),
                              'dd/MM/yyyy HH:mm'
                            )
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCobrancas}
            page={pageCobrancas}
            onPageChange={(event, newPage) => setPageCobrancas(newPage)}
            rowsPerPage={rowsPerPageCobrancas}
            onRowsPerPageChange={(event) => {
              setRowsPerPageCobrancas(parseInt(event.target.value, 10));
              setPageCobrancas(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Linhas por página:"
          />
        </Card>
      )}

      {/* Tabela de PIX Recebidos */}
      {activeTab === 'recebidos' && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>E2EID</TableCell>
                  <TableCell>TXID</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Chave</TableCell>
                  <TableCell>Horário</TableCell>
                  <TableCell>Pagador</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : pixRecebidos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum PIX recebido encontrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pixRecebidos.map((pix) => (
                    <TableRow key={pix.endToEndId}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} noWrap>
                          {pix.endToEndId || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} noWrap>
                          {pix.txid || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{pix.valor ? fCurrency(pix.valor) : '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} noWrap>
                          {pix.chave || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{pix.horario ? fDate(pix.horario, 'dd/MM/yyyy HH:mm:ss') : '-'}</TableCell>
                      <TableCell>
                        {pix.pagador?.nome ? (
                          <Stack>
                            <Typography variant="body2">{pix.pagador.nome}</Typography>
                            {pix.pagador.cpf && (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                CPF: {pix.pagador.cpf}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalRecebidos}
            page={pageRecebidos}
            onPageChange={(event, newPage) => setPageRecebidos(newPage)}
            rowsPerPage={rowsPerPageRecebidos}
            onRowsPerPageChange={(event) => {
              setRowsPerPageRecebidos(parseInt(event.target.value, 10));
              setPageRecebidos(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Linhas por página:"
          />
        </Card>
      )}
    </DashboardContent>
  );
}
