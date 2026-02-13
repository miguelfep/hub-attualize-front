'use client';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { exportarCSVMes, obterStatusConciliacao } from 'src/actions/conciliacao';

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
  
  // 🔥 NOVO: Estados para processamento assíncrono
  const [processamentosEmAndamento, setProcessamentosEmAndamento] = useState({}); // { conciliacaoId: { status, progresso, mesAno, bancoId } }
  const processamentosEmAndamentoRef = useRef({}); // Ref para manter estado atualizado
  
  // ✅ Sincronizar ref com estado
  useEffect(() => {
    processamentosEmAndamentoRef.current = processamentosEmAndamento;
  }, [processamentosEmAndamento]);

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
      const processamentosEncontrados = {};
      
      await Promise.all(
        bancos.map(async (banco) => {
          try {
            // 🔥 Usando API antiga (reconciliation) para listar meses conciliados
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}reconciliation/meses-conciliados/${clienteId}?bancoId=${banco._id}`
            );
            
            if (response.data?.success) {
              const meses = response.data.data || [];
              mesesMap[banco._id] = meses;
              
              // 🔥 NOVO: Verificar status de cada conciliação que pode estar processando
              await Promise.all(
                meses
                  .filter(m => m.conciliacaoId && (m.status === 'enviada' || m.status === 'pendente' || !m.status))
                  .map(async (mes) => {
                    try {
                      const statusResponse = await obterStatusConciliacao(mes.conciliacaoId);
                      const statusData = statusResponse.data?.data;
                      
                      if (statusData && statusData.status === 'processando') {
                        processamentosEncontrados[mes.conciliacaoId] = {
                          status: statusData.status,
                          progresso: statusData.progresso || 0,
                          mesAno: mes.mesAno,
                          bancoId: banco._id,
                        };
                      }
                    } catch (err) {
                      // Ignorar erros ao verificar status individual
                    }
                  })
              );
            }
          } catch (err) {
            console.error(`Erro ao carregar meses do banco ${banco._id}:`, err);
            mesesMap[banco._id] = [];
          }
        })
      );
      
      setMesesPorBanco(mesesMap);
      
      // Atualizar processamentos encontrados
      if (Object.keys(processamentosEncontrados).length > 0) {
        const novos = {
          ...processamentosEmAndamentoRef.current,
          ...processamentosEncontrados,
        };
        processamentosEmAndamentoRef.current = novos;
        setProcessamentosEmAndamento(novos);
      }
    };

    carregarMesesPorBanco();
  }, [clienteId, bancos]);

  // 🔥 NOVO: Polling de conciliações em processamento
  useEffect(() => {
    if (!clienteId || bancos.length === 0) {
      return undefined;
    }

    // Buscar todas as conciliações em processamento da lista de meses
    // Incluir: processando, enviada, e pendente (pois pode estar processando ainda)
    const conciliacoesProcessandoDaLista = Object.values(mesesPorBanco)
      .flat()
      .filter(m => {
        if (!m.conciliacaoId) return false;
        // Incluir se status é processando, enviada, ou pendente (pode estar processando)
        return m.status === 'processando' || m.status === 'enviada' || 
               (m.status === 'pendente' && (!m.totalTransacoes || m.totalTransacoes === 0));
      })
      .map(m => m.conciliacaoId)
      .filter(Boolean);

    // Também incluir processamentos que já estão no estado (para casos de transição)
    const conciliacoesProcessandoDoEstado = Object.keys(processamentosEmAndamentoRef.current);
    
    // Combinar ambas as listas (sem duplicatas)
    const conciliacoesProcessando = [...new Set([...conciliacoesProcessandoDaLista, ...conciliacoesProcessandoDoEstado])];
    
    console.log('🔍 Processamentos detectados:', {
      daLista: conciliacoesProcessandoDaLista.length,
      doEstado: conciliacoesProcessandoDoEstado.length,
      total: conciliacoesProcessando.length,
      ids: conciliacoesProcessando,
    });

    if (conciliacoesProcessando.length === 0) {
      // Limpar processamentos se não houver nenhum
      setProcessamentosEmAndamento({});
      return undefined;
    }

    // Função de polling
    const verificarProcessamentos = async () => {
      // ✅ CORREÇÃO: Usar ref para garantir estado atualizado
      const novosProcessamentos = { ...processamentosEmAndamentoRef.current };
      let atualizou = false;

      await Promise.all(
        conciliacoesProcessando.map(async (conciliacaoId) => {
          try {
            const statusResponse = await obterStatusConciliacao(conciliacaoId);
            const statusData = statusResponse.data?.data;

            if (statusData) {
              // Encontrar o mês correspondente na lista
              const mesEncontrado = Object.values(mesesPorBanco)
                .flat()
                .find(m => m.conciliacaoId === conciliacaoId);

              // Se encontrou na lista ou já está no estado de processamentos
              const processamentoExistente = novosProcessamentos[conciliacaoId];
              
              // Se está processando, sempre adicionar/atualizar
              if (statusData.status === 'processando') {
                const bancoId = mesEncontrado?.bancoId || processamentoExistente?.bancoId;
                const mesAno = mesEncontrado?.mesAno || processamentoExistente?.mesAno || statusData.mesAno;

                // ✅ CORREÇÃO: Aceitar mesmo sem bancoId/mesAno se vier do status (upload recente)
                // Se não tem bancoId/mesAno mas tem mesAno no status, tentar encontrar banco pela conciliacaoId
                let bancoIdFinal = bancoId;
                let mesAnoFinal = mesAno;
                
                if (!bancoIdFinal && statusData.mesAno) {
                  // Tentar encontrar banco que tenha este conciliacaoId
                  const bancoEncontrado = Object.entries(mesesPorBanco).find(([bancoIdKey, meses]) => {
                    const mesComConciliacao = meses.find(m => m.conciliacaoId === conciliacaoId);
                    if (mesComConciliacao) {
                      bancoIdFinal = bancoIdKey;
                      mesAnoFinal = mesComConciliacao.mesAno || statusData.mesAno;
                      return true;
                    }
                    return false;
                  });
                  // bancoEncontrado já atualizou bancoIdFinal e mesAnoFinal se encontrou
                }
                
                // Se ainda não tem bancoId, mas tem mesAno, adicionar mesmo assim (será atualizado depois)
                if (statusData.mesAno) {
                  novosProcessamentos[conciliacaoId] = {
                    status: statusData.status,
                    progresso: statusData.progresso || 0,
                    mesAno: mesAnoFinal || statusData.mesAno,
                    bancoId: bancoIdFinal || null, // Pode ser null temporariamente
                    // ✅ NOVO: Salvar informações adicionais do status
                    arquivoOrigem: statusData.arquivoOrigem || null,
                    totalTransacoes: statusData.totalTransacoes || 0,
                    transacoesPendentes: statusData.transacoesPendentes || 0,
                    resumo: statusData.resumo || null,
                    erros: statusData.erros || [],
                    dataProcessamento: statusData.dataProcessamento || null,
                    updatedAt: statusData.updatedAt || null,
                  };
                  atualizou = true;
                  console.log('✅ Processamento detectado:', { 
                    conciliacaoId, 
                    bancoId: bancoIdFinal, 
                    mesAno: mesAnoFinal || statusData.mesAno, 
                    progresso: statusData.progresso, 
                    totalTransacoes: statusData.totalTransacoes,
                    temBancoId: !!bancoIdFinal,
                    temMesAno: !!(mesAnoFinal || statusData.mesAno)
                  });
                }
              } else if (mesEncontrado || processamentoExistente) {
                const bancoId = mesEncontrado?.bancoId || processamentoExistente?.bancoId;
                const mesAno = mesEncontrado?.mesAno || processamentoExistente?.mesAno || statusData.mesAno;

                novosProcessamentos[conciliacaoId] = {
                  status: statusData.status,
                  progresso: statusData.progresso || 0,
                  mesAno,
                  bancoId,
                };
                atualizou = true;

                // Se finalizou (pendente ou concluida), recarregar meses
                if (statusData.status === 'pendente' || statusData.status === 'concluida') {
                  // Se temos bancoId, recarregar meses desse banco
                  if (bancoId) {
                    const response = await axios.get(
                      `${process.env.NEXT_PUBLIC_API_URL}reconciliation/meses-conciliados/${clienteId}?bancoId=${bancoId}`
                    );
                    if (response.data?.success) {
                      setMesesPorBanco(prev => ({
                        ...prev,
                        [bancoId]: response.data.data || [],
                      }));
                    }
                  } else {
                    // Se não temos bancoId, recarregar todos os bancos
                    bancos.forEach(async (banco) => {
                      try {
                        const response = await axios.get(
                          `${process.env.NEXT_PUBLIC_API_URL}reconciliation/meses-conciliados/${clienteId}?bancoId=${banco._id}`
                        );
                        if (response.data?.success) {
                          setMesesPorBanco(prev => ({
                            ...prev,
                            [banco._id]: response.data.data || [],
                          }));
                        }
                      } catch (err) {
                        console.error(`Erro ao recarregar meses do banco ${banco._id}:`, err);
                      }
                    });
                  }
                  // Remover do processamentos em andamento
                  delete novosProcessamentos[conciliacaoId];
                }

                // Se erro, remover também
                if (statusData.status === 'erro') {
                  delete novosProcessamentos[conciliacaoId];
                }
              }
            }
          } catch (err) {
            console.error(`Erro ao verificar status da conciliação ${conciliacaoId}:`, err);
          }
        })
      );

      if (atualizou) {
        console.log('🔄 Atualizando processamentos em andamento:', Object.keys(novosProcessamentos).length, 'processamentos');
        processamentosEmAndamentoRef.current = novosProcessamentos; // Atualizar ref
        setProcessamentosEmAndamento(novosProcessamentos);
      } else {
        // 🔥 DEBUG: Verificar se há processamentos que não foram adicionados
        const processamentosNaoAdicionados = conciliacoesProcessando.filter(id => !novosProcessamentos[id]);
        if (processamentosNaoAdicionados.length > 0) {
          console.log('⚠️ Processamentos detectados mas não adicionados:', processamentosNaoAdicionados);
        }
      }
    };

    // Verificar imediatamente
    verificarProcessamentos();

    // Polling a cada 3 segundos
    const intervalId = setInterval(verificarProcessamentos, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [clienteId, bancos, mesesPorBanco]);

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
    
    // 🔥 NOVO: Verificar se há processamento em andamento para este mês
    const processamento = Object.values(processamentosEmAndamento).find(
      p => p.bancoId === bancoId && p.mesAno === mesAno
    );

    if (processamento) {
      // Se há processamento em andamento, retornar status de processamento
      return {
        status: 'processando',
        conciliacaoId: Object.keys(processamentosEmAndamento).find(
          id => processamentosEmAndamento[id] === processamento
        ),
        totalTransacoes: 0,
        progresso: processamento.progresso,
      };
    }
    
    // 🔥 NOVO: Se tem conciliação mas status é "pendente" e não tem transações, pode estar processando
    // Verificar se está no estado de processamentos (mesmo que não tenha sido encontrado acima)
    if (conciliacao?.conciliacaoId) {
      const processamentoPorId = processamentosEmAndamento[conciliacao.conciliacaoId];
      if (processamentoPorId && processamentoPorId.status === 'processando') {
        return {
          status: 'processando',
          conciliacaoId: conciliacao.conciliacaoId,
          totalTransacoes: 0,
          progresso: processamentoPorId.progresso,
        };
      }
    }
    
    if (!conciliacao) {
      // Mês não tem conciliação iniciada
      return {
        status: 'nao_enviado', // 🔥 Atualizado: usar 'nao_enviado' ao invés de 'nao_iniciado'
        conciliacaoId: null,
        totalTransacoes: 0,
      };
    }
    
    // Retornar dados da API - suporta 6 status diferentes
    // Status possíveis: nao_enviado, fechado_sem_movimento, enviada, processando, pendente, conciliado
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
      case 'processando':
        return { color: 'info', icon: 'eva:sync-outline', label: 'Processando' };
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
    if (mesAno) {
      const statusMes = obterStatusMes(bancoId, mesAno);
      
      // Se está fechado sem movimento, bloquear
      if (statusMes.status === 'fechado_sem_movimento') {
        toast.error('🔒 Este período está fechado sem movimento. Entre em contato com o suporte para liberar.');
        return;
      }
      
      // Se está processando, não fazer nada
      if (statusMes.status === 'processando') {
          return;
        } 
    }
    
    // Ir para upload
    let url = `${paths.cliente.conciliacaoBancaria}/upload?bancoId=${bancoId}`;
    if (mesAno) {
      url += `&mesAno=${mesAno}`;
    }
    router.push(url);
  };

  const handleVerDetalhes = (conciliacaoId) => {
    router.push(`${paths.cliente.conciliacaoBancaria}/validar/${conciliacaoId}`);
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
      {/* Header - Simplificado */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <div>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Conciliação Bancária
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {empresaData.razaoSocial || empresaData.nome || 'Não identificado'}
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:credit-card-fill" />}
          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/bancos`)}
        >
         Gerenciar Bancos
        </Button>
      </Stack>

      {/* 🔥 Card Fixo de Processamentos em Andamento - Bem no Topo */}
      {(() => {
        const count = Object.keys(processamentosEmAndamento).length;
        if (count > 0) {
          console.log('✅ Renderizando card de processamentos. Count:', count, 'Keys:', Object.keys(processamentosEmAndamento));
        }
        return count > 0;
      })() && (
        <Card 
          sx={{ 
            mb: 4, 
            p: 3,
            bgcolor: 'info.lighter',
            border: 2,
            borderColor: 'info.main',
            borderRadius: 2,
            boxShadow: 4,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <CircularProgress size={28} thickness={4} color="info" />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="info.dark">
                    ⚡ Processamentos em Andamento
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Object.keys(processamentosEmAndamento).length} arquivo{Object.keys(processamentosEmAndamento).length !== 1 ? 's' : ''} sendo processado{Object.keys(processamentosEmAndamento).length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={`${Object.keys(processamentosEmAndamento).length} ativo${Object.keys(processamentosEmAndamento).length !== 1 ? 's' : ''}`}
                color="info"
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
              />
            </Stack>
            
            <Alert severity="info" icon={<Iconify icon="eva:info-fill" />} sx={{ bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.main' }}>
              <Typography variant="body2">
                Os arquivos abaixo estão sendo processados em segundo plano. Você pode continuar navegando enquanto isso.
              </Typography>
            </Alert>

            {/* Lista de Processamentos */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(processamentosEmAndamento).map(([conciliacaoId, processamento]) => {
                // Encontrar banco e mês correspondente
                // ✅ CORREÇÃO: Se não tem bancoId, tentar encontrar pela conciliacaoId na lista de meses
                let banco = null;
                let mesAnoFinal = processamento.mesAno;
                
                if (processamento.bancoId) {
                  banco = bancos.find(b => b._id === processamento.bancoId);
                } else {
                  // Tentar encontrar banco pela conciliacaoId
                  const bancoEncontrado = Object.entries(mesesPorBanco).find(([bancoIdKey, meses]) => {
                    const mesComConciliacao = meses.find(m => m.conciliacaoId === conciliacaoId);
                    if (mesComConciliacao) {
                      banco = bancos.find(b => b._id === bancoIdKey);
                      mesAnoFinal = mesComConciliacao.mesAno || mesAnoFinal;
                      // Atualizar processamento com bancoId encontrado
                      if (!processamento.bancoId) {
                        processamento.bancoId = bancoIdKey;
                        processamento.mesAno = mesAnoFinal;
                      }
                      return true;
                    }
                    return false;
                  });
                  // bancoEncontrado já atualizou banco e mesAnoFinal se encontrou
                }
                
                const [ano, mes] = mesAnoFinal?.split('-') || [];
                const meses = [
                  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ];
                const nomeMes = meses[parseInt(mes, 10) - 1] || mes;

                // ✅ Calcular tempo decorrido se tiver dataProcessamento
                const tempoDecorrido = processamento.dataProcessamento 
                  ? Math.floor((new Date() - new Date(processamento.dataProcessamento)) / 1000)
                  : null;
                const minutos = tempoDecorrido ? Math.floor(tempoDecorrido / 60) : null;
                const segundos = tempoDecorrido ? tempoDecorrido % 60 : null;

                return (
                  <Grid xs={12} sm={6} md={4} key={conciliacaoId}>
                    <Card 
                      sx={{ 
                        p: 2.5,
                        bgcolor: 'background.paper',
                        border: 1.5,
                        borderColor: 'info.main',
                        boxShadow: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        {/* Header: Banco e Período */}
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                              <Iconify icon="eva:file-text-fill" color="info.main" width={20} />
                              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                {banco?.instituicaoBancariaId?.nome || banco?.nome || 'Banco'}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {nomeMes} de {ano}
                            </Typography>
                            {processamento.arquivoOrigem && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                📄 {processamento.arquivoOrigem}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            icon={<CircularProgress size={14} thickness={4} />}
                            label="Processando"
                            size="small"
                            color="info"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Stack>
                        
                        {/* Barra de Progresso - Apenas se progresso > 0 */}
                        {processamento.progresso > 0 && (
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                Progresso do Processamento
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" color="info.main">
                                {processamento.progresso}%
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={processamento.progresso} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 1,
                                bgcolor: 'info.lighter',
                              }}
                              color="info"
                            />
                          </Box>
                        )}

                        {/* Informações Adicionais */}
                        <Stack spacing={0.5}>
                          {processamento.totalTransacoes > 0 ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Iconify icon="eva:list-fill" color="success.main" width={16} />
                              <Typography variant="caption" color="text.secondary">
                                <strong>{processamento.totalTransacoes}</strong> transação{processamento.totalTransacoes !== 1 ? 'ões' : ''} encontrada{processamento.totalTransacoes !== 1 ? 's' : ''}
                              </Typography>
                            </Stack>
                          ) : (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Iconify icon="eva:search-fill" color="info.main" width={16} />
                              <Typography variant="caption" color="text.secondary">
                                Analisando arquivo e extraindo transações...
                              </Typography>
                            </Stack>
                          )}
                          {tempoDecorrido && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Iconify icon="eva:clock-fill" color="text.secondary" width={16} />
                              <Typography variant="caption" color="text.secondary">
                                Processando há {minutos > 0 ? `${minutos} min e ` : ''}{segundos} seg
                              </Typography>
                            </Stack>
                          )}
                          {processamento.dataProcessamento && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Iconify icon="eva:calendar-fill" color="text.secondary" width={16} />
                              <Typography variant="caption" color="text.secondary">
                                Iniciado em {new Date(processamento.dataProcessamento).toLocaleString('pt-BR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Typography>
                            </Stack>
                          )}
                          {processamento.resumo && (processamento.resumo.totalCreditos > 0 || processamento.resumo.totalDebitos > 0) && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Iconify icon="eva:trending-up-fill" color="success.main" width={16} />
                              <Typography variant="caption" color="text.secondary">
                                Créditos: R$ {processamento.resumo.totalCreditos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'} • 
                                Débitos: R$ {processamento.resumo.totalDebitos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                              </Typography>
                            </Stack>
                          )}
                          {processamento.erros && processamento.erros.length > 0 && (
                            <Alert severity="warning" sx={{ py: 0.5, fontSize: '0.7rem', mt: 0.5 }}>
                              <Typography variant="caption">
                                ⚠️ {processamento.erros.length} aviso{processamento.erros.length !== 1 ? 's' : ''} durante processamento
                              </Typography>
                            </Alert>
                          )}
                        </Stack>

                        {/* Botão Ver Detalhes */}
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          startIcon={<Iconify icon="eva:eye-fill" />}
                          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/validar/${conciliacaoId}`)}
                          fullWidth
                          sx={{ mt: 1 }}
                        >
                          Ver Detalhes
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        </Card>
      )}

      {/* Guia Rápido - Ajuda Visual */}
      {!loadingBancos && bancos.length > 0 && (
        <Card sx={{ p: 2, mb: 3, bgcolor: 'primary.lighter', border: 1, borderColor: 'primary.main' }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Iconify icon="eva:info-outline" width={24} color="primary.main" sx={{ mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary.dark" gutterBottom>
                Como funciona?
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  <strong>📤 Enviar Extrato:</strong> Clique no mês desejado e faça upload do arquivo do banco
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>⏳ Processando:</strong> Aguarde o processamento finalizar (pode levar alguns minutos)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>✏️ Conciliar:</strong> Após processar, confirme as transações sugeridas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>✅ Concluído:</strong> Conciliação finalizada e pronta para uso
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Select de Ano - Simplificado */}
      {!loadingBancos && bancos.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="medium">
              Ano:
            </Typography>
            <Select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              size="small"
              sx={{ minWidth: 120, bgcolor: 'background.paper' }}
            >
              {anosDisponiveis.map((ano) => (
                <MenuItem key={ano} value={ano}>
                  {ano}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Box>
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
                      <Tooltip title="Meses conciliados">
                        <Chip
                          label={`${mesesConciliados}/${totalMeses}`}
                          color="success"
                          size="small"
                          variant={mesesConciliados > 0 ? "filled" : "outlined"}
                        />
                      </Tooltip>
                      {mesesPendentes > 0 && (
                        <Tooltip title="Meses aguardando conciliação">
                        <Chip
                            label={`${mesesPendentes} pendente${mesesPendentes > 1 ? 's' : ''}`}
                          color="warning"
                          size="small"
                        />
                        </Tooltip>
                      )}
                      {/* Contar meses em processamento */}
                      {mesesDoAnoFiltrados.filter((mes) => {
                        const status = obterStatusMes(banco._id, mes.mesAno);
                        return status.status === 'processando';
                      }).length > 0 && (
                        <Tooltip title="Meses em processamento">
                        <Chip
                            label={`${
                            mesesDoAnoFiltrados.filter((mes) => {
                              const status = obterStatusMes(banco._id, mes.mesAno);
                                return status.status === 'processando';
                            }).length
                            } processando`}
                          color="info"
                          size="small"
                            icon={<CircularProgress size={14} />}
                        />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                </AccordionSummary>
                
                <AccordionDetails>
                  {/* Aviso se não há meses disponíveis */}
                  {mesesDoAnoFiltrados.length === 0 && (
                    <Alert severity="info" icon={<Iconify icon="eva:info-outline" />} sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {banco.dataInicio
                          ? `Este banco iniciou a conciliação em ${formatarDataISO(banco.dataInicio)}. Selecione outro ano.`
                          : `Nenhum mês disponível para ${anoSelecionado}.`}
                      </Typography>
                    </Alert>
                  )}
                  
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {mesesDoAnoFiltrados.map((mes) => {
                      const status = obterStatusMes(banco._id, mes.mesAno);
                      
                      return (
                        <Grid xs={12} sm={6} md={4} lg={3} key={mes.mesAno}>
                          <Card
                            sx={{
                              p: 2.5,
                              height: '100%',
                              minHeight: 200,
                              display: 'flex',
                              flexDirection: 'column',
                              border: 1.5,
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
                              bgcolor: 'background.paper',
                              transition: 'all 0.2s ease',
                              cursor: status.status === 'fechado_sem_movimento' || status.status === 'processando' ? 'default' : 'pointer',
                              '&:hover': {
                                boxShadow: status.status === 'fechado_sem_movimento' || status.status === 'processando' ? 2 : 4,
                                transform: status.status === 'fechado_sem_movimento' || status.status === 'processando' ? 'none' : 'translateY(-2px)',
                                borderColor: (() => {
                                const statusInfo = obterCorStatus(status.status);
                                  if (status.status === 'fechado_sem_movimento' || status.status === 'processando') return 'inherit';
                                switch (statusInfo.color) {
                                    case 'success': return 'success.dark';
                                    case 'warning': return 'warning.dark';
                                    case 'error': return 'error.dark';
                                    case 'info': return 'info.dark';
                                    default: return 'primary.main';
                                }
                              })(),
                              },
                            }}
                          >
                            <Stack spacing={1.5} sx={{ flex: 1, justifyContent: 'space-between' }}>
                              {/* Nome do Mês */}
                              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                <Typography variant="h6" sx={{ textTransform: 'capitalize', flex: 1 }}>
                                {mes.mesNome}
                              </Typography>
                                {/* Badge de status de processamento */}
                                {status.status === 'processando' && (
                                  <Tooltip title="Arquivo sendo processado">
                                    <Chip
                                      icon={<CircularProgress size={12} thickness={4} color="inherit" />}
                                      label={status.progresso > 0 ? `${status.progresso}%` : 'Processando'}
                                      size="small"
                                      color="info"
                                      sx={{
                                        animation: 'pulse 2s ease-in-out infinite',
                                        '@keyframes pulse': {
                                          '0%, 100%': { opacity: 1 },
                                          '50%': { opacity: 0.7 },
                                        },
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>

                              {/* Status - Simplificado */}
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 1 }}>
                                {(() => {
                                  const statusInfo = obterCorStatus(status.status);
                                  return (
                                    <>
                                      {/* Status Principal */}
                                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        {status.status === 'processando' ? (
                                          <CircularProgress size={18} thickness={4} color="info" />
                                        ) : (
                                          <Iconify icon={statusInfo.icon} color={`${statusInfo.color}.main`} width={24} />
                                        )}
                                        <Typography variant="body1" fontWeight="bold" color={`${statusInfo.color}.main`}>
                                          {statusInfo.label}
                                        </Typography>
                                      </Stack>
                                      
                                      {/* Informações Adicionais */}
                                      {status.status === 'processando' ? (
                                        <Box>
                                          {status.progresso > 0 && (
                                            <>
                                              <LinearProgress 
                                                variant="determinate" 
                                                value={status.progresso} 
                                                sx={{ 
                                                  height: 8, 
                                                  borderRadius: 1,
                                                  mb: 0.5,
                                                }}
                                                color="info"
                                              />
                                              <Typography variant="caption" color="info.main" fontWeight="medium" textAlign="center" display="block">
                                                {status.progresso}% concluído
                                        </Typography>
                                            </>
                                          )}
                                          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>
                                            Aguarde o processamento finalizar
                                          </Typography>
                                        </Box>
                                      ) : status.status === 'conciliado' ? (
                                        <Typography variant="body2" color="text.secondary">
                                          ✅ Conciliação finalizada
                                          {status.totalTransacoes > 0 && ` • ${status.totalTransacoes} transações`}
                                        </Typography>
                                      ) : status.status === 'pendente' ? (
                                        <Typography variant="body2" color="text.secondary">
                                          ⏳ Aguardando conciliação
                                          {status.totalTransacoes > 0 && ` • ${status.totalTransacoes} transações`}
                                        </Typography>
                                      ) : status.status === 'fechado_sem_movimento' ? (
                                        <Typography variant="body2" color="error.main">
                                          🔒 Período bloqueado
                                        </Typography>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary">
                                          📤 Nenhum extrato enviado
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

                              {/* Ações - Simplificado: Uma ação principal por status */}
                              <Box sx={{ mt: 'auto', pt: 1 }}>
                                {status.status === 'processando' ? (
                                    <Button
                                    variant="outlined"
                                      size="small"
                                      fullWidth
                                    disabled
                                    startIcon={<CircularProgress size={14} />}
                                    sx={{ cursor: 'not-allowed' }}
                                  >
                                    Processando...
                                    </Button>
                                ) : status.status === 'conciliado' ? (
                                    <Button
                                    variant="contained"
                                      size="small"
                                    color="success"
                                      fullWidth
                                    startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerDetalhes(status.conciliacaoId);
                                      }}
                                    >
                                    Ver Conciliação
                                    </Button>
                                ) : status.status === 'fechado_sem_movimento' ? (
                                  <Alert severity="error" sx={{ py: 0.5, fontSize: '0.7rem' }}>
                                    <Typography variant="caption">
                                      🔒 Bloqueado
                                    </Typography>
                                  </Alert>
                                ) : status.status === 'pendente' ? (
                                  <Stack spacing={1}>
                                    {status.totalTransacoes > 0 ? (
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
                                        Conciliar Agora
                                      </Button>
                                    ) : (
                                      <>
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
                                          Ver Conciliação
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                          color="primary"
                                      fullWidth
                                      startIcon={<Iconify icon="eva:upload-fill" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEnviarExtrato(banco._id, mes.mesAno);
                                      }}
                                    >
                                          Reenviar Arquivo
                                    </Button>
                                      </>
                                    )}
                                  </Stack>
                                ) : (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="primary"
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

    </Box>
  );
}
