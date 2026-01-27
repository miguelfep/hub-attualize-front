'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { exportarCSVMes } from 'src/actions/conciliacao';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { useBancosCliente } from '../hooks';

// ✅ Helper para formatar data ISO sem problemas de timezone
const formatarDataISO = (dataISO) => {
  if (!dataISO) return '';
  
  // Se for string ISO, extrair apenas a parte da data (YYYY-MM-DD)
  if (typeof dataISO === 'string' && dataISO.includes('T')) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  }
  
  // Se for Date object, usar toLocaleDateString
  if (dataISO instanceof Date) {
    return dataISO.toLocaleDateString('pt-BR');
  }
  
  // Fallback: tentar criar Date
  try {
    const data = new Date(dataISO);
    // Extrair apenas a parte da data da string ISO original se possível
    if (typeof dataISO === 'string') {
      const match = dataISO.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
    }
    return data.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
};

export default function StatusConciliacaoPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  const [mesesPorBanco, setMesesPorBanco] = useState({});
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear()); // 🔥 Ano atual por padrão
  const [modalPendenteOpen, setModalPendenteOpen] = useState(false);
  const [modalPendenteData, setModalPendenteData] = useState(null); // { bancoId, mesAno, conciliacaoId }

  // Buscar dados da empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (!user?.userId) {
        setLoadingEmpresa(false);
        return;
      }
      try {
        setLoadingEmpresa(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dados/${user.userId}`
        );
        setEmpresaData(response.data.data.cliente);
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoadingEmpresa(false);
      }
    };
    fetchEmpresaData();
  }, [user?.userId]);

  const clienteId = empresaData?._id || empresaData?.id;

  // Hook de bancos (buscar bancos reais da API)
  const { bancos, loading: loadingBancos } = useBancosCliente(clienteId);

  // Carregar meses para cada banco
  useEffect(() => {
    const carregarMesesPorBanco = async () => {
      if (!clienteId || bancos.length === 0) return;

      const mesesMap = {};
      
      await Promise.all(
        bancos.map(async (banco) => {
          try {
            // 🔥 Usando API antiga (reconciliation) para listar meses conciliados
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}reconciliation/meses-conciliados/${clienteId}?bancoId=${banco._id}`
            );
            
            if (response.data?.success) {
              mesesMap[banco._id] = response.data.data || [];
            }
          } catch (err) {
            console.error(`Erro ao carregar meses do banco ${banco._id}:`, err);
            mesesMap[banco._id] = [];
          }
        })
      );
      
      setMesesPorBanco(mesesMap);
    };

    carregarMesesPorBanco();
  }, [clienteId, bancos]);

  // 🔥 Obter anos disponíveis (últimos 24 meses = 2 anos)
  const obterAnosDisponiveis = () => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth(); // 0-11
    
    const anos = new Set();
    
    // Gerar últimos 24 meses
    for (let i = 0; i < 24; i += 1) {
      const data = new Date(anoAtual, mesAtual - i, 1);
      anos.add(data.getFullYear());
    }
    
    // Retornar em ordem decrescente
    return Array.from(anos).sort((a, b) => b - a);
  };

  // ✅ Gerar meses do ano selecionado, filtrando pela dataInicio do banco
  const gerarMesesDoAno = (ano, banco = null) => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth(); // 0-11
    
    const mesesDoAno = [];
    
    // ✅ Obter data de início do banco (se houver)
    let dataInicioBanco = null;
    if (banco?.dataInicio) {
      dataInicioBanco = new Date(banco.dataInicio);
    }
    
    // Gerar meses do ano selecionado
    for (let mes = 1; mes <= 12; mes += 1) {
      const data = new Date(ano, mes - 1, 1);
      
      // ✅ Filtrar: só incluir meses >= dataInicio do banco
      if (dataInicioBanco && data < dataInicioBanco) {
        // Pular meses anteriores à data de início
      } else {
        // Só incluir meses que já passaram ou são do futuro próximo (últimos 24 meses)
        const diferencaMeses = (anoAtual - ano) * 12 + (mesAtual + 1 - mes);
        if (diferencaMeses >= 0 && diferencaMeses < 24) {
          const mesAno = `${ano}-${String(mes).padStart(2, '0')}`;
          const mesNome = data.toLocaleDateString('pt-BR', { month: 'long' });
          
          mesesDoAno.push({
            mes,
            mesAno,
            mesNome,
          });
        }
      }
    }
    
    // Retornar meses em ordem decrescente (Dezembro -> Janeiro)
    return mesesDoAno.reverse();
  };

  // 🔥 Obter status de um mês para um banco
  const obterStatusMes = (bancoId, mesAno) => {
    const mesesDoBanco = mesesPorBanco[bancoId] || [];
    const conciliacao = mesesDoBanco.find(m => m.mesAno === mesAno);
    
    if (!conciliacao) {
      // Mês não tem conciliação iniciada
      return {
        status: 'nao_enviado', // 🔥 Atualizado: usar 'nao_enviado' ao invés de 'nao_iniciado'
        conciliacaoId: null,
        totalTransacoes: 0,
      };
    }
    
    // Retornar dados da API - suporta 5 status diferentes
    // Status possíveis: nao_enviado, fechado_sem_movimento, enviada, pendente, conciliado
    return {
      status: conciliacao.status || 'pendente',
      conciliacaoId: conciliacao.conciliacaoId,
      totalTransacoes: conciliacao.totalTransacoes || 0,
      dataProcessamento: conciliacao.dataProcessamento,
    };
  };

  // 🔥 Função para obter cor e ícone do status
  const obterCorStatus = (status) => {
    switch (status) {
      case 'conciliado':
        return { color: 'success', icon: 'eva:checkmark-circle-2-fill', label: 'Conciliado' };
      case 'pendente':
        return { color: 'warning', icon: 'eva:clock-fill', label: 'Pendente' };
      case 'fechado_sem_movimento':
        return { color: 'error', icon: 'eva:lock-fill', label: 'Fechado sem Movimento' };
      case 'enviada':
        return { color: 'info', icon: 'eva:checkmark-circle-outline', label: 'Enviada' };
      case 'nao_enviado':
      default:
        return { color: 'default', icon: 'eva:file-outline', label: 'Não Enviado' };
    }
  };

  const anosDisponiveis = obterAnosDisponiveis();
  
  // ✅ Função para obter anos disponíveis considerando dataInicio do banco
  const obterAnosDisponiveisPorBanco = (banco) => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    
    // ✅ Obter data de início do banco
    let dataInicioBanco = null;
    if (banco?.dataInicio) {
      dataInicioBanco = new Date(banco.dataInicio);
    }
    
    const anos = new Set();
    
    // Gerar últimos 24 meses, mas só a partir da data de início
    for (let i = 0; i < 24; i += 1) {
      const data = new Date(anoAtual, mesAtual - i, 1);
      
      // ✅ Se banco tem dataInicio, só incluir meses >= dataInicio
      if (!dataInicioBanco || data >= dataInicioBanco) {
        anos.add(data.getFullYear());
      }
    }
    
    return Array.from(anos).sort((a, b) => b - a);
  };

  const handleExportarCSV = async (bancoId, mesAno) => {
    try {
      toast.loading('Gerando CSV...');
      const downloadUrl = await exportarCSVMes(clienteId, bancoId, mesAno);
      
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        toast.dismiss();
        toast.success('CSV baixado com sucesso!');
      } else {
        toast.dismiss();
        toast.error('Não foi possível gerar o CSV para este mês.');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Erro ao exportar CSV.');
      console.error(err);
    }
  };

  const handleEnviarExtrato = (bancoId, mesAno = null) => {
    // 🔥 Verificar status antes de permitir ação
    if (mesAno) {
      const statusMes = obterStatusMes(bancoId, mesAno);
      
      // 🔥 Validações atualizadas para suportar 5 status
      
      // Se está fechado sem movimento, bloquear
      if (statusMes.status === 'fechado_sem_movimento') {
        toast.error('🔒 Este período está fechado sem movimento. Entre em contato com o suporte para liberar.');
        return;
      }
      
      // Se está conciliado, perguntar se quer visualizar
      if (statusMes.status === 'conciliado') {
        const confirma = window.confirm(
          '⚠️ Este mês já foi conciliado.\n\nDeseja visualizar a conciliação existente?'
        );
        
        if (confirma && statusMes.conciliacaoId) {
          router.push(`${paths.cliente.conciliacaoBancaria}/validar/${statusMes.conciliacaoId}`);
          return;
        } 
          return; // Cancelar
        
      }
      
      // Se está pendente, abrir modal para escolher ação
      if (statusMes.status === 'pendente') {
        setModalPendenteData({
          bancoId,
          mesAno,
          conciliacaoId: statusMes.conciliacaoId,
        });
        setModalPendenteOpen(true);
        return;
      }
      
      // Se está marcado como "enviada", pode fazer upload normalmente (não bloqueia)
    }
    
    // Se não está iniciado ou usuário quer enviar novo, ir para upload
    let url = `${paths.cliente.conciliacaoBancaria}/upload?bancoId=${bancoId}`;
    
    if (mesAno) {
      url += `&mesAno=${mesAno}`;
    }
    
    router.push(url);
  };

  const handleVerDetalhes = (conciliacaoId) => {
    router.push(`${paths.cliente.conciliacaoBancaria}/validar/${conciliacaoId}`);
  };

  const handleContinuarConciliacao = () => {
    if (modalPendenteData?.conciliacaoId) {
      router.push(`${paths.cliente.conciliacaoBancaria}/validar/${modalPendenteData.conciliacaoId}`);
    }
    setModalPendenteOpen(false);
    setModalPendenteData(null);
  };

  const handleNovoUpload = () => {
    if (modalPendenteData) {
      const { bancoId, mesAno } = modalPendenteData;
      let url = `${paths.cliente.conciliacaoBancaria}/upload?bancoId=${bancoId}`;
      if (mesAno) {
        url += `&mesAno=${mesAno}`;
      }
      router.push(url);
    }
    setModalPendenteOpen(false);
    setModalPendenteData(null);
  };

  // Loading empresa
  if (loadingEmpresa) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="h6">Carregando dados do cliente...</Typography>
        </Stack>
      </Box>
    );
  }

  // Erro ao carregar empresa
  if (!empresaData || !clienteId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Erro ao carregar dados do cliente</Typography>
          <Typography variant="body2">
            Não foi possível identificar o cliente. Por favor, faça login novamente.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            🏦 Conciliação Bancária
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Empresa: {empresaData.razaoSocial || empresaData.nome || 'Não identificado'}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/bancos`)}
        >
          Cadastrar Banco
        </Button>
      </Stack>

      {/* 🔥 Select de Ano */}
      {!loadingBancos && bancos.length > 0 && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:calendar-bold-duotone" width={32} />
            <Typography variant="subtitle1" fontWeight="bold">
              Selecione o Ano:
            </Typography>
            <Select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {anosDisponiveis.map((ano) => (
                <MenuItem key={ano} value={ano}>
                  📅 {ano}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Card>
      )}

      {/* Loading bancos */}
      {loadingBancos && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Nenhum banco cadastrado */}
      {!loadingBancos && bancos.length === 0 && (
        <Alert severity="info">
          <Typography variant="body1" fontWeight="bold">
            Você ainda não tem bancos cadastrados
          </Typography>
          <Typography variant="body2">
            Cadastre um banco para começar a fazer conciliações bancárias.
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/bancos`)}
            sx={{ mt: 2 }}
          >
            Cadastrar Primeiro Banco
          </Button>
        </Alert>
      )}

      {/* ✅ Accordions por Banco */}
      {!loadingBancos && bancos.length > 0 && (
        <Stack spacing={2}>
          {bancos.map((banco) => {
            // ✅ Gerar meses do ano selecionado FILTRADOS pela dataInicio do banco
            const mesesDoAnoFiltrados = gerarMesesDoAno(anoSelecionado, banco);
            
            // Contar meses conciliados do ano selecionado
            const mesesConciliados = mesesDoAnoFiltrados.filter(mes => {
              const status = obterStatusMes(banco._id, mes.mesAno);
              return status.status === 'conciliado';
            }).length;
            const mesesPendentes = mesesDoAnoFiltrados.filter(mes => {
              const status = obterStatusMes(banco._id, mes.mesAno);
              return status.status === 'pendente';
            }).length;
            const totalMeses = mesesDoAnoFiltrados.length;
            
            return (
              <Accordion key={banco._id} defaultExpanded={bancos.length === 1}>
                <AccordionSummary
                  expandIcon={<Iconify icon="eva:arrow-down-fill" />}
                  sx={{
                    bgcolor: 'background.neutral',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon="eva:credit-card-fill" width={24} />
                      <div>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {banco.instituicaoBancariaId?.nome || banco.nome || 'Banco'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Código: {banco.instituicaoBancariaId?.codigo || banco.codigo || 'N/A'} | 
                          Ag: {banco.agencia || 'N/A'} | 
                          Conta: {banco.conta}
                        </Typography>
                      </div>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {mesesConciliados > 0 && (
                        <Chip
                          label={`✅ ${mesesConciliados}`}
                          color="success"
                          size="small"
                        />
                      )}
                      {mesesPendentes > 0 && (
                        <Chip
                          label={`⏳ ${mesesPendentes}`}
                          color="warning"
                          size="small"
                        />
                      )}
                      {/* ✅ Contar meses fechados sem movimento */}
                      {mesesDoAnoFiltrados.filter((mes) => {
                        const status = obterStatusMes(banco._id, mes.mesAno);
                        return status.status === 'fechado_sem_movimento';
                      }).length > 0 && (
                        <Chip
                          label={`🔒 ${
                            mesesDoAnoFiltrados.filter((mes) => {
                              const status = obterStatusMes(banco._id, mes.mesAno);
                              return status.status === 'fechado_sem_movimento';
                            }).length
                          }`}
                          color="error"
                          size="small"
                        />
                      )}
                      {/* ✅ Mostrar data de início do banco */}
                      {banco.dataInicio && (
                        <Chip
                          label={`📅 Início: ${formatarDataISO(banco.dataInicio)}`}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Stack>
                </AccordionSummary>
                
                <AccordionDetails>
                  {/* ✅ Aviso se não há meses disponíveis para este banco no ano selecionado */}
                  {mesesDoAnoFiltrados.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {banco.dataInicio
                          ? `Este banco iniciou a conciliação em ${formatarDataISO(banco.dataInicio)}. Não há meses disponíveis para ${anoSelecionado}.`
                          : `Não há meses disponíveis para ${anoSelecionado}.`}
                      </Typography>
                    </Alert>
                  )}
                  
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {mesesDoAnoFiltrados.map((mes) => {
                      const status = obterStatusMes(banco._id, mes.mesAno);
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={mes.mesAno}>
                          <Card
                            sx={{
                              p: 2,
                              height: '100%', // 🔥 Altura 100% para ocupar todo o espaço do Grid
                              minHeight: 180, // 🔥 Altura mínima para manter consistência
                              display: 'flex',
                              flexDirection: 'column',
                              border: 2,
                              borderColor: (() => {
                                const statusInfo = obterCorStatus(status.status);
                                switch (statusInfo.color) {
                                  case 'success': return 'success.main';
                                  case 'warning': return 'warning.main';
                                  case 'error': return 'error.main';
                                  case 'info': return 'info.main';
                                  default: return 'grey.300';
                                }
                              })(),
                              bgcolor: (() => {
                                const statusInfo = obterCorStatus(status.status);
                                switch (statusInfo.color) {
                                  case 'success': return 'success.lighter';
                                  case 'warning': return 'warning.lighter';
                                  case 'error': return 'error.lighter';
                                  case 'info': return 'info.lighter';
                                  default: return 'grey.50';
                                }
                              })(),
                              transition: 'all 0.3s',
                              cursor: status.status === 'fechado_sem_movimento' ? 'not-allowed' : 'pointer',
                              opacity: status.status === 'fechado_sem_movimento' ? 0.8 : 1,
                              '&:hover': {
                                boxShadow: status.status === 'fechado_sem_movimento' ? 2 : 6,
                                transform: status.status === 'fechado_sem_movimento' ? 'none' : 'translateY(-4px)',
                              },
                            }}
                          >
                            <Stack spacing={1.5} sx={{ flex: 1, justifyContent: 'space-between' }}>
                              {/* Nome do Mês */}
                              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                {mes.mesNome}
                              </Typography>

                              {/* Status */}
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {(() => {
                                  const statusInfo = obterCorStatus(status.status);
                                  return (
                                    <>
                                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <Iconify icon={statusInfo.icon} color={`${statusInfo.color}.main`} width={20} />
                                        <Typography variant="body2" fontWeight="bold" color={`${statusInfo.color}.main`}>
                                          {statusInfo.label}
                                        </Typography>
                                      </Stack>
                                      {status.status === 'fechado_sem_movimento' ? (
                                        <Typography variant="caption" color="error.main" fontWeight="medium">
                                          🔒 Upload bloqueado
                                        </Typography>
                                      ) : status.totalTransacoes > 0 ? (
                                        <Typography variant="caption" color="text.secondary">
                                          {status.totalTransacoes} transações
                                        </Typography>
                                      ) : (
                                        <Typography variant="caption" color="text.secondary">
                                          {status.status === 'enviada' ? 'Marcado como enviado' : 'Nenhuma transação'}
                                        </Typography>
                                      )}
                                    </>
                                  );
                                })()}
                              </Box>
                              {/* Status Antigo - Removido */}
                              {false && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Iconify icon="eva:file-text-outline" color="grey.500" width={20} />
                                  <Typography variant="body2" fontWeight="bold" color="text.secondary">
                                    Não enviado
                                  </Typography>
                                </Stack>
                              )}

                              {/* Ações - Sempre no final do card */}
                              <Box sx={{ mt: 'auto', pt: 1 }}>
                                {status.status === 'conciliado' ? (
                                  <Stack spacing={1}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      color="primary"
                                      fullWidth
                                      startIcon={<Iconify icon="eva:download-fill" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportarCSV(banco._id, mes.mesAno);
                                      }}
                                    >
                                      Exportar
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      startIcon={<Iconify icon="eva:eye-fill" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerDetalhes(status.conciliacaoId);
                                      }}
                                    >
                                      Detalhes
                                    </Button>
                                  </Stack>
                                ) : status.status === 'fechado_sem_movimento' ? (
                                  <Alert severity="error" sx={{ py: 0.5 }}>
                                    <Typography variant="caption" fontWeight="bold">
                                      🔒 Período bloqueado. Entre em contato com o suporte.
                                    </Typography>
                                  </Alert>
                                ) : status.status === 'pendente' ? (
                                  <Stack spacing={1}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      color="warning"
                                      fullWidth
                                      startIcon={<Iconify icon="eva:edit-fill" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerDetalhes(status.conciliacaoId);
                                      }}
                                    >
                                      Conciliar
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      startIcon={<Iconify icon="eva:upload-fill" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEnviarExtrato(banco._id, mes.mesAno);
                                      }}
                                    >
                                      Novo Upload
                                    </Button>
                                  </Stack>
                                ) : (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="inherit"
                                    fullWidth
                                    startIcon={<Iconify icon="eva:upload-fill" />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEnviarExtrato(banco._id, mes.mesAno);
                                    }}
                                  >
                                    Enviar Extrato
                                  </Button>
                                )}
                              </Box>
                            </Stack>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}

      {/* Modal para Conciliação Pendente */}
      <Dialog
        open={modalPendenteOpen}
        onClose={() => {
          setModalPendenteOpen(false);
          setModalPendenteData(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="eva:alert-triangle-fill" width={32} sx={{ color: 'warning.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Conciliação Pendente
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            ⚠️ Este mês tem uma conciliação pendente.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            O que você deseja fazer?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              setModalPendenteOpen(false);
              setModalPendenteData(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Iconify icon="eva:upload-fill" />}
            onClick={handleNovoUpload}
          >
            Novo Upload
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Iconify icon="eva:edit-fill" />}
            onClick={handleContinuarConciliacao}
          >
            Continuar Conciliação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
