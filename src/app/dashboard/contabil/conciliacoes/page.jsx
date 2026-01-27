'use client';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback } from 'react';

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
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
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

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { getClientes } from 'src/actions/clientes';
import { listarMesesDisponiveis } from 'src/actions/conciliacao';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'conciliado', label: 'Conciliados' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'nao_enviado', label: 'Não Enviados' },
  { value: 'fechado_sem_movimento', label: 'Fechado sem Movimento' },
  { value: 'enviada', label: 'Enviado' },
];

// ----------------------------------------------------------------------

export default function ConciliaçõesPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conciliacoesData, setConciliacoesData] = useState({}); // { clienteId: { meses: [], loading: false } }
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('');
  const [bancoSelecionadoId, setBancoSelecionadoId] = useState('');
  const [bancosCliente, setBancosCliente] = useState([]);
  const [loadingBancos, setLoadingBancos] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroAno, setFiltroAno] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [dialogMarcarNaoEnviado, setDialogMarcarNaoEnviado] = useState({ open: false, cliente: null, mes: null });
  const [dialogFechadoSemMovimento, setDialogFechadoSemMovimento] = useState({ open: false, cliente: null, mes: null });
  const [dialogMarcarEnviada, setDialogMarcarEnviada] = useState({ open: false, cliente: null, mes: null });
  const [exportando, setExportando] = useState({ clienteId: null, bancoId: null }); // ✅ Estado para exportação

  // Carregar clientes
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setLoading(true);
        const data = await getClientes({ status: true, tipoContato: 'cliente' });
        setClientes(data || []);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.error('Erro ao carregar clientes');
      } finally {
        setLoading(false);
      }
    };

    carregarClientes();
  }, []);

  // Carregar conciliações para cada cliente
  const carregarConciliacoesCliente = useCallback(async (clienteId) => {
    if (conciliacoesData[clienteId]?.loading) return; // Evitar chamadas duplicadas

    setConciliacoesData((prev) => ({
      ...prev,
      [clienteId]: { ...prev[clienteId], loading: true },
    }));

    try {
      // Buscar todos os bancos do cliente primeiro
      const bancosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}bancos/contas/cliente/${clienteId}`
      );
      const bancos = bancosResponse.data?.data || bancosResponse.data || [];

      // Para cada banco, buscar meses conciliados
      const mesesPorBanco = {};
      await Promise.all(
        bancos.map(async (banco) => {
          try {
            const response = await listarMesesDisponiveis(clienteId, banco._id);
            const meses = response.data?.data || response.data || [];
            mesesPorBanco[banco._id] = {
              banco,
              meses,
            };
          } catch (error) {
            console.error(`Erro ao carregar meses para banco ${banco._id}:`, error);
            mesesPorBanco[banco._id] = {
              banco,
              meses: [],
            };
          }
        })
      );

      setConciliacoesData((prev) => ({
        ...prev,
        [clienteId]: {
          loading: false,
          mesesPorBanco,
        },
      }));
    } catch (error) {
      console.error(`Erro ao carregar conciliações para cliente ${clienteId}:`, error);
      setConciliacoesData((prev) => ({
        ...prev,
        [clienteId]: {
          loading: false,
          mesesPorBanco: {},
          error: true,
        },
      }));
    }
  }, [conciliacoesData]);

  // Carregar bancos quando cliente é selecionado
  useEffect(() => {
    const carregarBancosCliente = async () => {
      if (!clienteSelecionadoId) {
        setBancosCliente([]);
        setBancoSelecionadoId('');
        return;
      }

      try {
        setLoadingBancos(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}bancos/contas/cliente/${clienteSelecionadoId}`
        );
        const bancos = response.data?.data || response.data || [];
        setBancosCliente(bancos);
        
        // Se havia um banco selecionado e ele não está mais na lista, limpar seleção
        if (bancoSelecionadoId && !bancos.find(b => b._id === bancoSelecionadoId)) {
          setBancoSelecionadoId('');
        }
      } catch (error) {
        console.error('Erro ao carregar bancos do cliente:', error);
        toast.error('Erro ao carregar bancos do cliente');
        setBancosCliente([]);
      } finally {
        setLoadingBancos(false);
      }
    };

    carregarBancosCliente();
  }, [clienteSelecionadoId, bancoSelecionadoId]);

  // Carregar conciliações quando cliente e banco são selecionados
  useEffect(() => {
    if (clienteSelecionadoId && !conciliacoesData[clienteSelecionadoId]) {
      carregarConciliacoesCliente(clienteSelecionadoId);
    }
  }, [clienteSelecionadoId, conciliacoesData, carregarConciliacoesCliente]);

  // Resetar banco quando cliente muda
  useEffect(() => {
    if (!clienteSelecionadoId) {
      setBancoSelecionadoId('');
    }
  }, [clienteSelecionadoId]);

  // Preparar dados para tabela (apenas do cliente e banco selecionados)
  const linhasTabela = useMemo(() => {
    if (!clienteSelecionadoId) {
      return [];
    }

    const linhas = [];
    const dados = conciliacoesData[clienteSelecionadoId];
    if (!dados || dados.loading) return [];

    const cliente = clientes.find(c => (c._id || c.id) === clienteSelecionadoId);
    if (!cliente) return [];

    // Se banco selecionado, mostrar apenas esse banco, senão mostrar todos
    const bancosParaProcessar = bancoSelecionadoId
      ? Object.values(dados.mesesPorBanco || {}).filter(({ banco }) => banco._id === bancoSelecionadoId)
      : Object.values(dados.mesesPorBanco || {});

    bancosParaProcessar.forEach(({ banco, meses }) => {
      meses.forEach((mes) => {
        const status = mes.status || (mes.conciliado ? 'conciliado' : 'pendente');

        // Aplicar filtro de status
        if (filtroStatus !== 'all') {
          if (filtroStatus === 'conciliado' && status !== 'conciliado') return;
          if (filtroStatus === 'pendente' && status !== 'pendente') return;
          if (filtroStatus === 'nao_enviado' && status !== 'nao_enviado') return;
          if (filtroStatus === 'fechado_sem_movimento' && status !== 'fechado_sem_movimento') return;
          if (filtroStatus === 'enviada' && status !== 'enviada') return;
        }

        // Extrair ano do mesAno para filtro
        const [ano] = mes.mesAno.split('-');
        
        // Aplicar filtro de ano se selecionado
        if (filtroAno && ano !== filtroAno) return;

        linhas.push({
          clienteId: cliente._id || cliente.id,
          clienteNome: cliente.razaoSocial || cliente.nomeFantasia || 'N/A',
          bancoId: banco._id,
          bancoNome: banco.instituicaoBancariaId?.nome || banco.nome || 'N/A',
          mesAno: mes.mesAno,
          mesNome: mes.mesNome,
          status: mes.status || status, // Preferir status do backend
          conciliacaoId: mes.conciliacaoId,
          totalTransacoes: mes.totalTransacoes || 0,
          ano: parseInt(ano, 10), // Adicionar ano numérico para ordenação
          mes: parseInt(mes.mesAno.split('-')[1], 10), // Adicionar mês numérico para ordenação
        });
      });
    });

    // 🔥 Ordenar por ano (decrescente) e depois por mês (decrescente)
    linhas.sort((a, b) => {
      if (a.ano !== b.ano) {
        return b.ano - a.ano; // Ano mais recente primeiro
      }
      return b.mes - a.mes; // Mês mais recente primeiro
    });

    return linhas;
  }, [clienteSelecionadoId, bancoSelecionadoId, conciliacoesData, filtroStatus, filtroAno, clientes]);

  // 🔥 Obter lista de anos disponíveis para filtro
  const anosDisponiveis = useMemo(() => {
    if (!clienteSelecionadoId) return [];

    const dados = conciliacoesData[clienteSelecionadoId];
    if (!dados || dados.loading) return [];

    const anos = new Set();
    Object.values(dados.mesesPorBanco || {}).forEach(({ meses }) => {
      meses.forEach((mes) => {
        const [ano] = mes.mesAno.split('-');
        anos.add(ano);
      });
    });

    return Array.from(anos).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)); // Ordenar decrescente
  }, [clienteSelecionadoId, conciliacoesData]);

  // Paginação
  const linhasPaginadas = useMemo(() => {
    const start = page * rowsPerPage;
    return linhasTabela.slice(start, start + rowsPerPage);
  }, [linhasTabela, page, rowsPerPage]);

  // ✅ Exportar para Domínio Contábil diretamente
  const handleExportarDominio = useCallback(async (clienteId, bancoId, mesAno) => {
    try {
      setExportando({ clienteId, bancoId });

      // Converter mesAno (YYYY-MM) em dataInicio e dataFim
      const [ano, mes] = mesAno.split('-');
      const primeiroDia = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, 1);
      const ultimoDia = new Date(parseInt(ano, 10), parseInt(mes, 10), 0);

      const dataInicio = primeiroDia.toISOString().split('T')[0];
      const dataFim = ultimoDia.toISOString().split('T')[0];

      const params = new URLSearchParams({
        dataInicio,
        dataFim,
      });

      // Obter token do axios configurado
      const token = localStorage.getItem('accessToken') || '';
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}conciliacao/exportar-dominio/${clienteId}/${bancoId}?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Verificar se é um erro (JSON)
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao exportar');
      }

      // Verificar se é um arquivo (text/plain)
      if (response.ok && contentType && contentType.includes('text/plain')) {
        // Obter nome do arquivo do header Content-Disposition
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = `dominio_${dataInicio}_${dataFim}.txt`;

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        }

        // Baixar arquivo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Arquivo exportado com sucesso!');
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      
      // Tratar erros específicos
      let mensagemErro = error?.message || 'Ocorreu um erro ao exportar o arquivo';
      
      if (mensagemErro.includes('conciliação finalizada') || mensagemErro.includes('conciliações finalizadas')) {
        mensagemErro = 'Não há conciliações finalizadas para este período. Finalize as conciliações antes de exportar.';
      } else if (mensagemErro.includes('transação conciliada') || mensagemErro.includes('transações conciliadas')) {
        mensagemErro = 'Não há transações conciliadas no período selecionado.';
      } else if (mensagemErro.includes('Conta bancária não encontrada')) {
        mensagemErro = 'Configure uma conta contábil para o banco antes de exportar.';
      }

      toast.error(mensagemErro, { duration: 5000 });
    } finally {
      setExportando({ clienteId: null, bancoId: null });
    }
  }, []);

  // Marcar mês como não enviado
  const handleMarcarNaoEnviado = useCallback(async () => {
    const { cliente, mes } = dialogMarcarNaoEnviado;
    if (!cliente || !mes) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}conciliacao/marcar-status`, {
        clienteId: cliente._id || cliente.id,
        bancoId: mes.bancoId,
        mesAno: mes.mesAno,
        status: 'nao_enviado',
      });

      toast.success(`Mês ${mes.mesNome} marcado como não enviado`);
      setDialogMarcarNaoEnviado({ open: false, cliente: null, mes: null });

      // Recarregar conciliações do cliente
      carregarConciliacoesCliente(cliente._id || cliente.id);
    } catch (error) {
      console.error('Erro ao marcar como não enviado:', error);
      toast.error('Erro ao marcar mês como não enviado');
    }
  }, [dialogMarcarNaoEnviado, carregarConciliacoesCliente]);

  // Marcar mês como fechado sem movimento
  const handleFechadoSemMovimento = useCallback(async () => {
    const { cliente, mes } = dialogFechadoSemMovimento;
    if (!cliente || !mes) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}conciliacao/marcar-status`, {
        clienteId: cliente._id || cliente.id,
        bancoId: mes.bancoId,
        mesAno: mes.mesAno,
        status: 'fechado_sem_movimento',
      });

      toast.success(`Mês ${mes.mesNome} marcado como fechado sem movimento`);
      setDialogFechadoSemMovimento({ open: false, cliente: null, mes: null });

      // Recarregar conciliações do cliente
      carregarConciliacoesCliente(cliente._id || cliente.id);
    } catch (error) {
      console.error('Erro ao marcar como fechado sem movimento:', error);
      toast.error('Erro ao marcar mês como fechado sem movimento');
    }
  }, [dialogFechadoSemMovimento, carregarConciliacoesCliente]);

  // Marcar mês como enviada
  const handleMarcarEnviada = useCallback(async () => {
    const { cliente, mes } = dialogMarcarEnviada;
    if (!cliente || !mes) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}conciliacao/marcar-status`, {
        clienteId: cliente._id || cliente.id,
        bancoId: mes.bancoId,
        mesAno: mes.mesAno,
        status: 'enviada',
      });

      toast.success(`Mês ${mes.mesNome} marcado como enviada`);
      setDialogMarcarEnviada({ open: false, cliente: null, mes: null });

      // Recarregar conciliações do cliente
      carregarConciliacoesCliente(cliente._id || cliente.id);
    } catch (error) {
      console.error('Erro ao marcar como enviada:', error);
      toast.error('Erro ao marcar mês como enviada');
    }
  }, [dialogMarcarEnviada, carregarConciliacoesCliente]);

  const obterCorStatus = (status) => {
    switch (status) {
      case 'conciliado':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'nao_enviado':
        return 'default';
      case 'fechado_sem_movimento':
        return 'error';
      case 'enviada':
        return 'info';
      default:
        return 'default';
    }
  };

  const obterLabelStatus = (status) => {
    switch (status) {
      case 'conciliado':
        return 'Conciliado';
      case 'pendente':
        return 'Pendente';
      case 'nao_enviado':
        return 'Não Enviado';
      case 'fechado_sem_movimento':
        return 'Fechado sem Movimento';
      case 'enviada':
        return 'Enviada';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="h6">Carregando clientes...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <div>
            <Typography variant="h4" gutterBottom>
              📊 Conciliações Bancárias
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize e gerencie as conciliações bancárias de todos os clientes
            </Typography>
          </div>
        </Stack>

        {/* Filtros */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Selecione o Cliente *</InputLabel>
              <Select
                value={clienteSelecionadoId}
                onChange={(e) => {
                  setClienteSelecionadoId(e.target.value);
                  setBancoSelecionadoId(''); // Resetar banco quando cliente muda
                }}
                label="Selecione o Cliente *"
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Selecione um cliente</em>
                </MenuItem>
                {clientes.map((cliente) => (
                  <MenuItem key={cliente._id || cliente.id} value={cliente._id || cliente.id}>
                    {cliente.razaoSocial || cliente.nomeFantasia || 'N/A'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {clienteSelecionadoId && (
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Selecione o Banco</InputLabel>
                <Select
                  value={bancoSelecionadoId}
                  onChange={(e) => setBancoSelecionadoId(e.target.value)}
                  label="Selecione o Banco"
                  disabled={loadingBancos}
                >
                  <MenuItem value="">
                    <em>Todos os bancos</em>
                  </MenuItem>
                  {bancosCliente.map((banco) => (
                    <MenuItem key={banco._id} value={banco._id}>
                      {banco.instituicaoBancariaId?.nome || banco.nome || 'Banco'} (
                      {banco.instituicaoBancariaId?.codigo || banco.codigo || 'N/A'}) - Ag:{' '}
                      {banco.agencia || 'N/A'} Conta: {banco.conta}
                    </MenuItem>
                  ))}
                </Select>
                {loadingBancos && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Carregando bancos...
                  </Typography>
                )}
              </FormControl>
            )}

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} label="Status">
                {STATUS_FILTERS.map((filter) => (
                  <MenuItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {clienteSelecionadoId && anosDisponiveis.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Ano</InputLabel>
                <Select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} label="Ano">
                  <MenuItem value="">
                    <em>Todos os anos</em>
                  </MenuItem>
                  {anosDisponiveis.map((ano) => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Card>

        {/* Tabela */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Banco</TableCell>
                  <TableCell>Período</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Transações</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!clienteSelecionadoId ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Stack alignItems="center" spacing={2}>
                        <Iconify icon="eva:info-outline" width={48} color="text.disabled" />
                        <Typography variant="body2" color="text.secondary">
                          Selecione um cliente para visualizar as conciliações
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : conciliacoesData[clienteSelecionadoId]?.loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Stack alignItems="center" spacing={2}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" color="text.secondary">
                          Carregando conciliações...
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : linhasPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Stack alignItems="center" spacing={2}>
                        <Iconify icon="eva:file-text-outline" width={48} color="text.disabled" />
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma conciliação encontrada com os filtros aplicados
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  linhasPaginadas.map((linha, idx) => (
                    <TableRow key={`${linha.clienteId}-${linha.bancoId}-${linha.mesAno}-${idx}`} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{linha.clienteNome}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{linha.bancoNome}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {linha.mesNome}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={obterLabelStatus(linha.status)}
                          color={obterCorStatus(linha.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{linha.totalTransacoes}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                          {linha.conciliacaoId && (
                            <Tooltip title="Editar Conciliação">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  router.push(paths.dashboard.contabil.conciliacoes.details(linha.conciliacaoId));
                                }}
                              >
                                <Iconify icon="eva:edit-fill" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {/* ✅ Exportar para Domínio Contábil (apenas se conciliado) */}
                          {linha.status === 'conciliado' && (
                            <Tooltip title="Exportar para Domínio Contábil">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleExportarDominio(linha.clienteId, linha.bancoId, linha.mesAno)}
                                disabled={exportando.clienteId === linha.clienteId && exportando.bancoId === linha.bancoId}
                              >
                                {exportando.clienteId === linha.clienteId && exportando.bancoId === linha.bancoId ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <Iconify icon="eva:download-fill" />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                          {linha.status !== 'fechado_sem_movimento' && (
                            <Tooltip title="Fechar sem Movimento">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  const cliente = clientes.find((c) => (c._id || c.id) === linha.clienteId);
                                  setDialogFechadoSemMovimento({
                                    open: true,
                                    cliente,
                                    mes: {
                                      mesAno: linha.mesAno,
                                      mesNome: linha.mesNome,
                                      bancoId: linha.bancoId,
                                      conciliacaoId: linha.conciliacaoId,
                                    },
                                  });
                                }}
                              >
                                <Iconify icon="eva:lock-fill" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {linha.status === 'fechado_sem_movimento' && (
                            <Tooltip title="Liberar para Upload (Marcar como Não Enviado)">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => {
                                  const cliente = clientes.find((c) => (c._id || c.id) === linha.clienteId);
                                  setDialogMarcarNaoEnviado({
                                    open: true,
                                    cliente,
                                    mes: {
                                      mesAno: linha.mesAno,
                                      mesNome: linha.mesNome,
                                      bancoId: linha.bancoId,
                                      conciliacaoId: linha.conciliacaoId,
                                    },
                                  });
                                }}
                              >
                                <Iconify icon="eva:unlock-fill" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {linha.status !== 'enviada' && (
                            <Tooltip title="Marcar como Enviada">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => {
                                  const cliente = clientes.find((c) => (c._id || c.id) === linha.clienteId);
                                  setDialogMarcarEnviada({
                                    open: true,
                                    cliente,
                                    mes: {
                                      mesAno: linha.mesAno,
                                      mesNome: linha.mesNome,
                                      bancoId: linha.bancoId,
                                      conciliacaoId: linha.conciliacaoId,
                                    },
                                  });
                                }}
                              >
                                <Iconify icon="eva:checkmark-circle-2-fill" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {linha.status !== 'fechado_sem_movimento' && linha.status !== 'nao_enviado' && (
                            <Tooltip title="Marcar como Não Enviado">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  const cliente = clientes.find((c) => (c._id || c.id) === linha.clienteId);
                                  setDialogMarcarNaoEnviado({
                                    open: true,
                                    cliente,
                                    mes: {
                                      mesAno: linha.mesAno,
                                      mesNome: linha.mesNome,
                                      bancoId: linha.bancoId,
                                      conciliacaoId: linha.conciliacaoId,
                                    },
                                  });
                                }}
                              >
                                <Iconify icon="eva:close-circle-fill" />
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
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={linhasTabela.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Informações adicionais */}
        {clienteSelecionadoId && conciliacoesData[clienteSelecionadoId] && !conciliacoesData[clienteSelecionadoId].loading && (
          <Card sx={{ p: 2, mt: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="eva:info-outline" width={24} color="info.main" />
              <Typography variant="body2" color="text.secondary">
                {bancoSelecionadoId
                  ? `Mostrando conciliações do banco selecionado. Total: ${linhasTabela.length} períodos.`
                  : `Mostrando conciliações de todos os bancos do cliente. Total: ${linhasTabela.length} períodos.`}
              </Typography>
            </Stack>
          </Card>
        )}
      </Box>

      {/* Dialog Marcar como Não Enviado */}
      <Dialog open={dialogMarcarNaoEnviado.open} onClose={() => setDialogMarcarNaoEnviado({ open: false, cliente: null, mes: null })}>
        <DialogTitle>
          {dialogMarcarNaoEnviado.mes?.status === 'fechado_sem_movimento' ? 'Liberar para Upload' : 'Marcar Mês como Não Enviado'}
        </DialogTitle>
        <DialogContent>
          <Alert severity={dialogMarcarNaoEnviado.mes?.status === 'fechado_sem_movimento' ? 'info' : 'warning'} sx={{ mb: 2 }}>
            {dialogMarcarNaoEnviado.mes?.status === 'fechado_sem_movimento' ? (
              <>
                Esta ação irá liberar o mês <strong>{dialogMarcarNaoEnviado.mes?.mesNome}</strong> do cliente{' '}
                <strong>{dialogMarcarNaoEnviado.cliente?.razaoSocial || dialogMarcarNaoEnviado.cliente?.nomeFantasia}</strong> para
                que o cliente possa enviar o OFX.
                <br />
                <br />
                <strong>Status:</strong> O mês será marcado como &quot;Não Enviado&quot; e o cliente poderá fazer upload novamente.
              </>
            ) : (
              <>
                Esta ação irá marcar o mês <strong>{dialogMarcarNaoEnviado.mes?.mesNome}</strong> do cliente{' '}
                <strong>{dialogMarcarNaoEnviado.cliente?.razaoSocial || dialogMarcarNaoEnviado.cliente?.nomeFantasia}</strong> como
                não enviado.
                {dialogMarcarNaoEnviado.mes?.conciliacaoId && (
                  <>
                    <br />
                    <br />
                    <strong>Atenção:</strong> Se existir uma conciliação para este mês, ela será removida.
                  </>
                )}
              </>
            )}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMarcarNaoEnviado({ open: false, cliente: null, mes: null })}>Cancelar</Button>
          <Button variant="contained" color={dialogMarcarNaoEnviado.mes?.status === 'fechado_sem_movimento' ? 'warning' : 'error'} onClick={handleMarcarNaoEnviado}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Fechado sem Movimento */}
      <Dialog open={dialogFechadoSemMovimento.open} onClose={() => setDialogFechadoSemMovimento({ open: false, cliente: null, mes: null })}>
        <DialogTitle>Fechar Mês sem Movimento</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Esta ação irá marcar o mês <strong>{dialogFechadoSemMovimento.mes?.mesNome}</strong> do cliente{' '}
            <strong>{dialogFechadoSemMovimento.cliente?.razaoSocial || dialogFechadoSemMovimento.cliente?.nomeFantasia}</strong> como
            <strong> Fechado sem Movimento</strong>.
            <br />
            <br />
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>O cliente <strong>NÃO poderá</strong> fazer upload de OFX para este mês enquanto estiver marcado como &quot;Fechado sem Movimento&quot;</li>
              <li>O time precisa <strong>liberar explicitamente</strong> (marcar como &quot;Não Enviado&quot;) para permitir upload novamente</li>
              <li>Use este status quando o cliente não enviou o OFX e você precisa fechar o período</li>
            </ul>
            {dialogFechadoSemMovimento.mes?.conciliacaoId && (
              <>
                <br />
                <strong>Atenção:</strong> Se existir uma conciliação para este mês, ela será removida.
              </>
            )}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogFechadoSemMovimento({ open: false, cliente: null, mes: null })}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleFechadoSemMovimento}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Marcar como Enviada */}
      <Dialog open={dialogMarcarEnviada.open} onClose={() => setDialogMarcarEnviada({ open: false, cliente: null, mes: null })}>
        <DialogTitle>Marcar Mês como Enviada</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Esta ação irá marcar o mês <strong>{dialogMarcarEnviada.mes?.mesNome}</strong> do cliente{' '}
            <strong>{dialogMarcarEnviada.cliente?.razaoSocial || dialogMarcarEnviada.cliente?.nomeFantasia}</strong> como{' '}
            <strong>Enviada</strong>.
            <br />
            <br />
            <strong>📌 Quando usar:</strong>
            <ul>
              <li>Para meses que já passaram</li>
              <li>Quando você já recebeu o OFX do cliente</li>
              <li>Quando o cliente confirmou que enviou o arquivo</li>
            </ul>
            <br />
            Este status serve para controle interno do time e não bloqueia o upload do cliente.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMarcarEnviada({ open: false, cliente: null, mes: null })}>Cancelar</Button>
          <Button variant="contained" color="info" onClick={handleMarcarEnviada}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
