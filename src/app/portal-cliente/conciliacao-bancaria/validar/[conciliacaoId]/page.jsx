'use client';

import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { obterStatusConciliacao, confirmarTransacoesEmLote } from 'src/actions/conciliacao';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { TransacaoNaoIdentificada } from '../../components';
import TransacaoConfirmada from '../../components/transacao-confirmada';

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

export default function ValidacaoConciliacaoPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();

  const {conciliacaoId} = params;

  const [loading, setLoading] = useState(true);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  const [conciliacao, setConciliacao] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [error, setError] = useState(null);
  const [resumoInicialFixo, setResumoInicialFixo] = useState(null); // 🔥 Resumo fixo do OFX
  const [bancoInfo, setBancoInfo] = useState(null); // ✅ Informações do banco (saldo, etc)
  const carregandoTransacoesRef = useRef(false); // 🔥 Prevenir múltiplas chamadas
  
  // 🔥 NOVO: Estados para processamento assíncrono
  const [statusProcessamento, setStatusProcessamento] = useState(null); // 'processando' | 'pendente' | 'concluida' | 'erro' | null
  const [progressoProcessamento, setProgressoProcessamento] = useState(0);
  const [processando, setProcessando] = useState(false);
  
  // ✅ NOVO: Resumo fixo do status da API
  const [resumoStatus, setResumoStatus] = useState(null); // { totalTransacoes, transacoesPendentes, resumo }
  
  // ✅ NOVO: Transações já confirmadas (para exibir no final)
  const [transacoesConfirmadas, setTransacoesConfirmadas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState(0); // 0 = Pendentes, 1 = Conciliadas
  
  // 🔥 NOVO: Rastrear contas selecionadas para cada transação
  const [contasSelecionadas, setContasSelecionadas] = useState({}); // { transacaoId: contaContabilId }

  // ✅ Inicializar contas selecionadas com sugestões quando transações carregarem
  // ⚡ IMPORTANTE: Sugestões já vêm salvas na resposta (geradas durante upload, não ao buscar)
  // Se contaSugerida existir, pré-seleciona automaticamente para facilitar confirmação em massa
  // 🔥 CORREÇÃO: Usar ref para evitar loop infinito - só inicializar uma vez
  const contasInicializadasRef = useRef(false);
  
  useEffect(() => {
    // Só inicializar uma vez quando transações carregarem pela primeira vez
    if (transacoes.length > 0 && !contasInicializadasRef.current) {
      const contasIniciais = {};
      transacoes.forEach(transacao => {
        const transacaoId = transacao._id || transacao.transacaoImportadaId;
        // ✅ Pré-selecionar conta se houver sugestão salva
        if (transacaoId && transacao.contaSugerida?._id) {
          contasIniciais[transacaoId] = transacao.contaSugerida._id;
        }
      });
      
      // Só atualizar se houver contas para adicionar
      if (Object.keys(contasIniciais).length > 0) {
        setContasSelecionadas(prev => ({
          ...prev,
          ...contasIniciais,
        }));
        contasInicializadasRef.current = true;
      }
    }
    
    // Resetar flag se transações ficarem vazias (nova conciliação)
    if (transacoes.length === 0) {
      contasInicializadasRef.current = false;
    }
  }, [transacoes]);

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
      } catch (err) {
        console.error('Erro ao carregar dados da empresa:', err);
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoadingEmpresa(false);
      }
    };
    fetchEmpresaData();
  }, [user?.userId]);

  // 🔥 Função separada para carregar transações (usando useCallback para evitar problemas de dependências)
  const carregarTransacoes = useCallback(async () => {
      if (!conciliacaoId) return;

      carregandoTransacoesRef.current = true;
      setLoading(true);
      setError(null);

      try {
      // ✅ Buscar transações pendentes (Nova API)
      // ⚡ IMPORTANTE: Resposta é INSTANTÂNEA - sugestões já estão salvas no banco (geradas durante upload)
      // Não chama IA - apenas retorna sugestões já salvas
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/pendentes`
        );

        if (response.data?.success) {
          const transacoesPendentes = response.data.data || [];
        // ✅ As transações já vêm com contaSugerida preenchida (se houver sugestão salva)
        // Se contaSugerida for null, significa que não há sugestão disponível
          setTransacoes(transacoesPendentes);
          
          // 🔥 Calcular resumo inicial IMEDIATAMENTE das transações pendentes (snapshot inicial)
          if (transacoesPendentes.length > 0) {
            const transacoesCreditos = transacoesPendentes.filter(t => t.tipo === 'credito');
            const transacoesDebitos = transacoesPendentes.filter(t => t.tipo === 'debito');
            
            const totalCreditos = transacoesCreditos.reduce((sum, t) => {
              const valor = parseFloat(t.valor) || 0;
              return sum + valor;
            }, 0);
            
            const totalDebitos = transacoesDebitos.reduce((sum, t) => {
              const valor = parseFloat(t.valor) || 0;
              return sum + valor;
            }, 0);
            
            const saldoFinal = totalCreditos - totalDebitos;
            
          setResumoInicialFixo({
              totalCreditos,
              totalDebitos,
              saldoFinal,
          });
          } else {
            setResumoInicialFixo({
              totalCreditos: 0,
              totalDebitos: 0,
              saldoFinal: 0,
            });
          }
          
        // Buscar detalhes básicos da conciliação
          if (!conciliacao) {
            try {
              const detalhesResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}reconciliation/${conciliacaoId}`
              );
              if (detalhesResponse.data?.success) {
              setConciliacao(detalhesResponse.data.data);
            }
          } catch (detalhesErr) {
            console.warn('⚠️ Não foi possível buscar detalhes:', detalhesErr);
          }
        }
      } else {
        throw new Error(response.data?.message || 'Erro ao carregar transações');
                      }
    } catch (err) {
      console.error('❌ Erro ao carregar transações:', err);
      setError(err.message || 'Erro ao carregar transações');
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
      carregandoTransacoesRef.current = false;
    }
  }, [conciliacaoId, conciliacao]);

  // 🔥 NOVO: Verificar status da conciliação e fazer polling se necessário
  useEffect(() => {
    if (!conciliacaoId) {
      return undefined;
    }

    let intervalId = null;

    const verificarStatus = async () => {
      try {
        const statusResponse = await obterStatusConciliacao(conciliacaoId);
        const statusData = statusResponse.data?.data;

        if (statusData) {
          setStatusProcessamento(statusData.status);
          setProgressoProcessamento(statusData.progresso || 0);
          
          // ✅ NOVO: Salvar resumo do status (valores fixos da API)
          if (statusData.resumo || statusData.totalTransacoes !== undefined) {
            setResumoStatus({
              totalTransacoes: statusData.totalTransacoes || 0,
              transacoesPendentes: statusData.transacoesPendentes || 0,
              resumo: statusData.resumo || null,
            });
          }

          // Se está processando, iniciar polling
          if (statusData.status === 'processando') {
            setProcessando(true);
            
            // Iniciar polling
            intervalId = setInterval(async () => {
              try {
                const pollResponse = await obterStatusConciliacao(conciliacaoId);
                const pollData = pollResponse.data?.data;

                if (pollData) {
                  setStatusProcessamento(pollData.status);
                  setProgressoProcessamento(pollData.progresso || 0);
                  
                  // ✅ NOVO: Atualizar resumo do status durante polling
                  if (pollData.resumo || pollData.totalTransacoes !== undefined) {
                    setResumoStatus({
                      totalTransacoes: pollData.totalTransacoes || 0,
                      transacoesPendentes: pollData.transacoesPendentes || 0,
                      resumo: pollData.resumo || null,
                    });
                  }

                  // Se finalizou processamento, parar polling e carregar transações
                  if (pollData.status === 'pendente' || pollData.status === 'concluida') {
                    if (intervalId) {
                      clearInterval(intervalId);
                      intervalId = null;
                    }
                    setProcessando(false);
                    // Recarregar transações
                    if (!carregandoTransacoesRef.current) {
                      carregarTransacoes();
                    }
                  }

                  // Se erro, parar polling
                  if (pollData.status === 'erro') {
                    if (intervalId) {
                      clearInterval(intervalId);
                      intervalId = null;
                    }
                    setProcessando(false);
                    setError(pollData.erros?.[0] || 'Erro ao processar arquivo');
                    toast.error('Erro ao processar arquivo');
                }
              }
              } catch (err) {
                console.error('Erro ao verificar status durante polling:', err);
            }
            }, 2000); // Polling a cada 2 segundos
        } else {
            setProcessando(false);
            // Se não está processando, pode carregar transações normalmente
          }
        }
      } catch (err) {
        console.error('Erro ao verificar status da conciliação:', err);
        // Se der erro, tentar carregar transações mesmo assim (compatibilidade)
        setProcessando(false);
      }
    };

    verificarStatus();

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [conciliacaoId, carregarTransacoes]);

  // 🔥 Buscar transações pendentes (otimizado - uma vez por conciliacaoId)
  useEffect(() => {
    // 🔥 Prevenir múltiplas chamadas simultâneas
    if (carregandoTransacoesRef.current) {
      console.log('⏳ Já carregando transações, ignorando chamada duplicada');
      return;
    }

    // Se está processando, não carregar transações ainda
    if (processando || statusProcessamento === 'processando') {
      return;
      }

    carregarTransacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conciliacaoId, processando, statusProcessamento]); // 🔥 Adicionar processando e statusProcessamento

  const clienteId = empresaData?._id || empresaData?.id;

  // Helper para obter nome do banco de várias formas possíveis
  const getNomeBanco = () => {
    if (!conciliacao?.bancoId) return 'N/A';
    console.log(conciliacao);
    const banco = conciliacao.bancoId;
    
    // Tentar diferentes caminhos onde o nome pode estar
    return (
      banco.instituicaoBancariaId?.nome ||
      banco.instituicaoBancaria?.nome ||
      banco.banco?.nome ||
      banco.nome ||
      'N/A'
    );
  };

  // Confirmar transação
  // 🔥 ATUALIZADO: Agora usa o novo endpoint /confirmar
  const handleConfirmarTransacao = async (transacaoId, transacaoExistenteId = null, contaContabilId = null) => {
    if (!contaContabilId) {
      toast.error('Selecione uma conta contábil para confirmar a transação.');
      return;
    }

    try {
      toast.loading('Confirmando transação...');

      // 🔥 NOVO: Usa /conciliacao/confirmar sem conciliacaoId na URL
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}conciliacao/confirmar`,
        {
          transacaoId,      // 🔥 String ID (não objeto)
          contaContabilId,  // 🔥 String ID (não objeto)
        }
      );

      if (response.data?.success) {
        toast.dismiss();
        toast.success('Transação confirmada!');
        
        // Remover transação da lista local (usar _id ou transacaoImportadaId)
        setTransacoes((prev) => prev.filter((t) => {
          const id = t._id || t.transacaoImportadaId;
          return id !== transacaoId;
        }));
        
        // 🔥 CORREÇÃO: Remover conta selecionada para evitar estados inconsistentes
        setContasSelecionadas((prev) => {
          const novas = { ...prev };
          delete novas[transacaoId];
          return novas;
        });
        
        // ✅ Recarregar informações do banco para atualizar saldo
        if (conciliacao?.bancoId?._id) {
          const clienteIdAtual = empresaData?._id || empresaData?.id;
          if (clienteIdAtual) {
            try {
              const bancoResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
                { params: { clienteId: clienteIdAtual } }
              );
              // Encontrar o banco específico na lista
              const bancoEncontrado = bancoResponse.data?.find(b => b._id === conciliacao.bancoId._id);
              if (bancoEncontrado) {
                setBancoInfo(bancoEncontrado);
              }
            } catch (bancoErr) {
              console.error('Erro ao atualizar saldo do banco:', bancoErr);
            }
          }
        }
        
        // ✅ NOVO: Recarregar transações confirmadas após confirmação
        buscarTransacoesConfirmadas();
        
        console.log('✅ Transação confirmada e removida da lista');
      } else {
        throw new Error(response.data?.message || 'Erro ao confirmar transação');
      }
    } catch (err) {
      toast.dismiss();
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao confirmar transação';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  // Finalizar conciliação
  const handleFinalizarConciliacao = async () => {
    // Verificar se ainda há transações pendentes
    if (transacoes.length > 0) {
      toast.error(`Ainda há ${transacoes.length} transação(ões) pendente(s). Confirme todas antes de finalizar.`);
      return;
    }

    if (!window.confirm('Tem certeza que deseja finalizar esta conciliação?')) {
      return;
    }

    try {
      toast.loading('Finalizando conciliação...');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/finalizar`
      );

      toast.dismiss();

      if (response.data?.success) {
        toast.success('🎉 Conciliação finalizada com sucesso!');
        
        // ✅ Atualizar status da conciliação para "concluida"
        setStatusProcessamento('concluida');
        if (conciliacao) {
          setConciliacao({
            ...conciliacao,
            status: 'concluida',
          });
        }
        
        // Aguardar 2 segundos antes de redirecionar
        setTimeout(() => {
          router.push(`${paths.cliente.conciliacaoBancaria}/status`);
        }, 2000);
      } else {
        const errorMsg = response.data?.error || response.data?.message || 'Erro ao finalizar conciliação';
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.dismiss();
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao finalizar conciliação';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  // 🔥 Todas as transações retornadas são PENDENTES
  // Não precisa filtrar, todas estão em `transacoes`
  const transacoesPendentes = transacoes;

  // 🔥 Log quando resumoInicialFixo mudar
  useEffect(() => {
    if (resumoInicialFixo) {
      console.log('📌 resumoInicialFixo mudou para:', resumoInicialFixo);
    }
  }, [resumoInicialFixo]);

  // ✅ NOVO: Buscar transações confirmadas
  const buscarTransacoesConfirmadas = useCallback(async () => {
    if (!conciliacaoId || processando || statusProcessamento === 'processando') return;
    
    try {
      // ✅ Buscar todas as transações (incluindo confirmadas)
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/transacoes`
      );
      
      console.log('🔍 Resposta completa da API /transacoes:', JSON.stringify(response.data, null, 2));
      
      if (response.data?.success && response.data.data) {
        // ✅ CORREÇÃO: A API retorna { data: { todas: [], pendentes: [], confirmadas: [] } }
        const { confirmadas: confirmadasData, todas: todasData } = response.data.data;
        let confirmadas = [];
        
        // Prioridade 1: Tentar acessar diretamente o campo 'confirmadas'
        if (confirmadasData && Array.isArray(confirmadasData)) {
          confirmadas = confirmadasData;
          console.log('✅ Encontradas transações confirmadas em data.confirmadas:', confirmadas.length);
        }
        // Prioridade 2: Se não tiver 'confirmadas', tentar filtrar de 'todas'
        else if (todasData && Array.isArray(todasData)) {
          console.log('🔍 Filtrando confirmadas de data.todas:', todasData.length);
          confirmadas = todasData.filter(t => {
            // Verificar se tem contaContabilId (string ou objeto)
            const temContaId = t.contaContabilId || 
                              (t.contaContabil && (typeof t.contaContabil === 'string' || t.contaContabil._id)) ||
                              (t.transacaoImportada && (t.transacaoImportada.contaContabilId || t.transacaoImportada.contaContabil));
            
            // Verificar status
            const temStatusConfirmado = t.status === 'confirmada' || 
                                       t.status === 'conciliada' ||
                                       (t.transacaoImportada && (t.transacaoImportada.status === 'confirmada' || t.transacaoImportada.status === 'conciliada'));
            
            return temContaId || temStatusConfirmado;
          });
          console.log('✅ Transações confirmadas filtradas de todas:', confirmadas.length);
        }
        // Prioridade 3: Fallback - tentar endpoint específico para confirmadas
        else {
          console.warn('⚠️ Estrutura de resposta não esperada. Tentando endpoint /confirmadas...');
          try {
            const confirmadasResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/confirmadas`
            );
            
            if (confirmadasResponse.data?.success && Array.isArray(confirmadasResponse.data.data)) {
              confirmadas = confirmadasResponse.data.data;
              console.log('✅ Encontradas transações confirmadas no endpoint /confirmadas:', confirmadas.length);
            }
          } catch (confirmadasErr) {
            console.log('⚠️ Endpoint /confirmadas não existe ou retornou erro:', confirmadasErr.response?.status);
          }
        }
        
        console.log('📊 Total de transações confirmadas encontradas:', confirmadas.length);
        if (confirmadas.length > 0) {
          console.log('🔍 Exemplo de transação confirmada:', confirmadas[0]);
        }
        
        setTransacoesConfirmadas(confirmadas);
      } else {
        console.warn('⚠️ API não retornou success ou data:', response.data);
        setTransacoesConfirmadas([]);
      }
    } catch (err) {
      console.error('Erro ao buscar transações confirmadas:', err);
      console.error('Detalhes do erro:', err.response?.data);
      console.error('Status do erro:', err.response?.status);
      
      // ✅ FALLBACK: Se o endpoint /transacoes não funcionar, tentar /confirmadas
      if (err.response?.status === 404 || err.response?.status >= 500) {
        try {
          console.log('🔄 Tentando endpoint alternativo /confirmadas...');
          const confirmadasResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/confirmadas`
          );
          
          if (confirmadasResponse.data?.success && Array.isArray(confirmadasResponse.data.data)) {
            console.log('✅ Encontradas transações confirmadas no endpoint alternativo:', confirmadasResponse.data.data.length);
            setTransacoesConfirmadas(confirmadasResponse.data.data);
            return;
          }
        } catch (fallbackErr) {
          console.error('Erro no endpoint alternativo:', fallbackErr);
        }
      }
      
      setTransacoesConfirmadas([]);
    }
  }, [conciliacaoId, processando, statusProcessamento]);

  useEffect(() => {
    buscarTransacoesConfirmadas();
  }, [buscarTransacoesConfirmadas]);

  // 🔥 Resumo financeiro - Usar valores fixos do status da API
  const resumoInicial = useMemo(() => {
    // ✅ Prioridade 1: Usar resumo do status (valores fixos da API)
    if (resumoStatus?.resumo) {
      return resumoStatus.resumo;
    }
    
    // Prioridade 2: Usar resumo fixo salvo (calculado quando transações foram carregadas pela primeira vez)
    if (resumoInicialFixo) {
      return resumoInicialFixo;
    }
    
    // Prioridade 3: Usar resumo da conciliação se disponível
    if (conciliacao?.resumo) {
      return conciliacao.resumo;
    }
    
    // Prioridade 3: Calcular das transações pendentes (fallback - apenas se ainda não tiver nenhum)
    if (transacoesPendentes.length === 0) {
      console.log('⚠️ Sem transações pendentes, retornando zeros');
      return {
        totalCreditos: 0,
        totalDebitos: 0,
        saldoFinal: 0,
      };
    }
    
    console.log('⚠️ Calculando resumo de fallback das transações pendentes:', transacoesPendentes.length);
    const totalCreditos = transacoesPendentes
      .filter(t => t.tipo === 'credito')
      .reduce((sum, t) => {
        const valor = parseFloat(t.valor) || 0;
        return sum + valor;
      }, 0);
    const totalDebitos = transacoesPendentes
      .filter(t => t.tipo === 'debito')
      .reduce((sum, t) => {
        const valor = parseFloat(t.valor) || 0;
        return sum + valor;
      }, 0);
    
    const resumoCalculado = {
      totalCreditos,
      totalDebitos,
      saldoFinal: totalCreditos - totalDebitos,
    };
    
    console.log('📊 Resumo calculado (fallback):', resumoCalculado);
    return resumoCalculado;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumoStatus, resumoInicialFixo, conciliacao?.resumo, transacoesPendentes.length]);

  // 🔥 Contar transações com sugestão
  const transacoesComSugestao = transacoesPendentes.filter(t => t.contaSugerida);
  const temSugestoes = transacoesComSugestao.length > 0;

  // 🔥 NOVO: Callback quando conta muda em uma transação
  const handleContaChange = (transacaoId, contaContabilId) => {
    setContasSelecionadas(prev => ({
      ...prev,
      [transacaoId]: contaContabilId,
    }));
  };

  // 🔥 Aceitar todas as sugestões
  const handleAceitarTodasSugestoes = async () => {
    if (transacoesComSugestao.length === 0) {
      toast.info('Não há sugestões para aceitar');
      return;
    }

    if (!window.confirm(`Deseja aceitar todas as ${transacoesComSugestao.length} sugestão(ões)?`)) {
      return;
    }

    try {
      toast.loading(`Aceitando ${transacoesComSugestao.length} sugestão(ões)...`);
      
      // ✅ NOVO: Preparar array de transações para envio em lote
      const transacoesParaLote = transacoesComSugestao.map(transacao => {
        const transacaoId = transacao._id || transacao.transacaoImportadaId;
        const contaContabilId = transacao.contaSugerida._id;
        return {
          transacaoId,
          contaContabilId,
          isPrevisao: false, // Sugestões não são previsões
        };
      });

      // ✅ NOVO: Enviar todas em um único lote
      const response = await confirmarTransacoesEmLote(transacoesParaLote);
      
      if (response.data?.success) {
        const { sucessos, erros, detalhes } = response.data.data;
        
        // Remover transações confirmadas da lista local
        const transacoesConfirmadasIds = detalhes
          .filter(d => d.sucesso)
          .map(d => d.transacaoId);
        
        setTransacoes((prev) => prev.filter((t) => {
          const id = t._id || t.transacaoImportadaId;
          return !transacoesConfirmadasIds.includes(id);
        }));
        
        // Remover contas selecionadas das transações confirmadas
        setContasSelecionadas((prev) => {
          const novas = { ...prev };
          transacoesConfirmadasIds.forEach(transacaoId => {
            delete novas[transacaoId];
          });
          return novas;
        });
        
        toast.dismiss();
        
        if (erros === 0) {
          toast.success(`✅ ${sucessos} sugestão(ões) aceita(s) com sucesso!`);
        } else {
          toast.warning(`${sucessos} aceita(s), ${erros} erro(s)`);
          // Mostrar detalhes dos erros no console
          const errosDetalhes = detalhes.filter(d => !d.sucesso);
          console.error('Erros ao confirmar transações:', errosDetalhes);
        }
        
        // ✅ Recarregar informações do banco para atualizar saldo
        if (conciliacao?.bancoId?._id) {
          const clienteIdAtual = empresaData?._id || empresaData?.id;
          if (clienteIdAtual) {
            try {
              const bancoResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
                { params: { clienteId: clienteIdAtual } }
              );
              const bancoEncontrado = bancoResponse.data?.find(b => b._id === conciliacao.bancoId._id);
              if (bancoEncontrado) {
                setBancoInfo(bancoEncontrado);
              }
            } catch (bancoErr) {
              console.error('Erro ao atualizar saldo do banco:', bancoErr);
            }
          }
        }
        
        // ✅ NOVO: Recarregar transações confirmadas após confirmação
        buscarTransacoesConfirmadas();
      } else {
        throw new Error(response.data?.message || 'Erro ao confirmar transações');
      }
    } catch (err) {
      toast.dismiss();
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao aceitar sugestões';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  // 🔥 NOVO: Confirmar todas as transações que já têm conta selecionada
  const handleConfirmarTodasSelecionadas = async () => {
    // Filtrar transações que têm conta selecionada (sugestão ou manual)
    const transacoesParaConfirmar = transacoesPendentes.filter(transacao => {
      const transacaoId = transacao._id || transacao.transacaoImportadaId;
      // Tem conta selecionada manualmente OU tem sugestão (que já está pré-selecionada)
      return contasSelecionadas[transacaoId] || transacao.contaSugerida?._id;
    });

    // Contar quantas têm conta selecionada (incluindo sugestões)
    const totalComConta = transacoesPendentes.filter(transacao => {
      const transacaoId = transacao._id || transacao.transacaoImportadaId;
      return contasSelecionadas[transacaoId] || transacao.contaSugerida?._id;
    }).length;

    if (transacoesParaConfirmar.length === 0) {
      toast.warning('Nenhuma transação com conta selecionada. Selecione contas primeiro.');
      return;
    }

    if (!window.confirm(`Deseja confirmar ${transacoesParaConfirmar.length} transação(ões) que já têm conta selecionada?`)) {
      return;
    }

    try {
      toast.loading(`Confirmando ${transacoesParaConfirmar.length} transação(ões)...`);
      
      // ✅ NOVO: Preparar array de transações para envio em lote
      const transacoesParaLote = transacoesParaConfirmar
        .map(transacao => {
          const transacaoId = transacao._id || transacao.transacaoImportadaId;
          // Usar conta selecionada manualmente ou sugestão
          const contaContabilId = contasSelecionadas[transacaoId] || transacao.contaSugerida?._id;
          
          if (contaContabilId) {
            return {
              transacaoId,
              contaContabilId,
              isPrevisao: false, // Por padrão não são previsões
            };
          }
          return null;
        })
        .filter(Boolean); // Remover nulls

      if (transacoesParaLote.length === 0) {
        toast.warning('Nenhuma transação válida para confirmar.');
        return;
      }

      // ✅ NOVO: Enviar todas em um único lote
      const response = await confirmarTransacoesEmLote(transacoesParaLote);
      
      if (response.data?.success) {
        const { sucessos, erros, detalhes } = response.data.data;
        
        // Remover transações confirmadas da lista local
        const transacoesConfirmadasIds = detalhes
          .filter(d => d.sucesso)
          .map(d => d.transacaoId);
        
        setTransacoes((prev) => prev.filter((t) => {
          const id = t._id || t.transacaoImportadaId;
          return !transacoesConfirmadasIds.includes(id);
        }));
        
        // Remover contas selecionadas das transações confirmadas
        setContasSelecionadas((prev) => {
          const novas = { ...prev };
          transacoesConfirmadasIds.forEach(transacaoId => {
            delete novas[transacaoId];
          });
          return novas;
        });
        
        toast.dismiss();
        
        if (erros === 0) {
          toast.success(`✅ ${sucessos} transação(ões) confirmada(s) com sucesso!`);
        } else {
          toast.warning(`${sucessos} confirmada(s), ${erros} erro(s)`);
          // Mostrar detalhes dos erros no console
          const errosDetalhes = detalhes.filter(d => !d.sucesso);
          console.error('Erros ao confirmar transações:', errosDetalhes);
        }
        
        // ✅ Recarregar informações do banco para atualizar saldo
        if (conciliacao?.bancoId?._id) {
          const clienteIdAtual = empresaData?._id || empresaData?.id;
          if (clienteIdAtual) {
            try {
              const bancoResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
                { params: { clienteId: clienteIdAtual } }
              );
              const bancoEncontrado = bancoResponse.data?.find(b => b._id === conciliacao.bancoId._id);
              if (bancoEncontrado) {
                setBancoInfo(bancoEncontrado);
              }
            } catch (bancoErr) {
              console.error('Erro ao atualizar saldo do banco:', bancoErr);
            }
          }
        }
        
        // ✅ NOVO: Recarregar transações confirmadas após confirmação
        buscarTransacoesConfirmadas();
      } else {
        throw new Error(response.data?.message || 'Erro ao confirmar transações');
      }
    } catch (err) {
      toast.dismiss();
      const errorMessage = err?.response?.data?.error || err.message || 'Erro ao confirmar transações';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  console.log('📊 Transações pendentes:', {
    total: transacoesPendentes.length,
    comSugestao: transacoesComSugestao.length
  });

  // 🔥 NOVO: Tela de processamento quando estiver processando
  if (processando || statusProcessamento === 'processando') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 3 }}>
        <Card sx={{ p: 4, maxWidth: 600, width: '100%' }}>
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} thickness={4} color="info" />
            <Stack spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight="bold" color="info.main">
                Processando Arquivo
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                O arquivo está sendo processado. Isso pode levar alguns minutos.
              </Typography>
            </Stack>
            {progressoProcessamento > 0 && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="info.main">
                    {progressoProcessamento}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={progressoProcessamento} 
                  sx={{ height: 8, borderRadius: 1 }}
                  color="info"
                />
              </Box>
            )}
            <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2">
                Você será redirecionado automaticamente quando o processamento finalizar.
                <br />
                Ou pode voltar para a página de status e acompanhar o progresso.
              </Typography>
            </Alert>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
            >
              Voltar para Status
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  // Loading normal
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="h6">Carregando conciliação...</Typography>
        </Stack>
      </Box>
    );
  }

  // Erro
  if (error || !conciliacao) {
    console.error('❌ Estado de erro:', { error, conciliacao, conciliacaoId });
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Erro ao carregar conciliação</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {error || 'Conciliação não encontrada'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            ID da conciliação: {conciliacaoId}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Verifique o console do navegador para mais detalhes.
          </Typography>
          <Button
            size="small"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
          >
            Voltar ao Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  // Contar transações com conta selecionada para o botão fixo
  const totalComContaParaBotaoFixo = transacoesPendentes.filter(transacao => {
    const transacaoId = transacao._id || transacao.transacaoImportadaId;
    return contasSelecionadas[transacaoId] || transacao.contaSugerida?._id;
  }).length;

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        maxWidth: 1400, 
        mx: 'auto',
        pb: totalComContaParaBotaoFixo > 0 ? { xs: 12, sm: 14 } : undefined, // Espaço para o botão fixo
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Stack>
          <Typography variant="h4" gutterBottom>
            ✅ Validação de Conciliação
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {empresaData?.razaoSocial || empresaData?.nome || 'Empresa'}
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
        >
          Voltar
        </Button>
      </Stack>

      {/* Status Alert */}
      <Box sx={{ mb: 3 }}>
        {/* 🔥 NOVO: Alerta para conciliação pendente sem transações */}
        {transacoesPendentes.length === 0 && 
         conciliacao?.status === 'pendente' && 
         !processando && 
         statusProcessamento !== 'processando' ? (
          <Alert 
            severity="warning" 
            icon={<Iconify icon="eva:alert-triangle-fill" />}
            action={
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Iconify icon="eva:upload-fill" />}
                onClick={() => {
                  const bancoId = conciliacao?.bancoId?._id || conciliacao?.bancoId;
                  const mesAno = conciliacao?.ano && conciliacao?.mes 
                    ? `${conciliacao.ano}-${conciliacao.mes.toString().padStart(2, '0')}`
                    : '';
                  
                  if (bancoId && mesAno) {
                    router.push(
                      `${paths.cliente.conciliacaoBancaria}/upload?banco=${bancoId}&mesAno=${mesAno}`
                    );
                  } else {
                    toast.error('Não foi possível identificar o banco ou período para reenvio');
                  }
                }}
              >
                Reenviar Arquivo
              </Button>
            }
          >
            <Typography variant="subtitle1" fontWeight="bold">
              ⚠️ Conciliação Pendente
            </Typography>
            <Typography variant="body2">
              Esta conciliação está pendente e não possui transações. Você pode reenviar o arquivo para processar novamente.
            </Typography>
          </Alert>
        ) : transacoesPendentes.length === 0 ? (
          <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" />}>
            <Typography variant="subtitle1" fontWeight="bold">
              ✅ Todas as transações foram conciliadas!
            </Typography>
            <Typography variant="body2">
              Clique em &quot;Finalizar Conciliação&quot; para concluir o processo.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" icon={<Iconify icon="eva:info-fill" />}>
            <Typography variant="subtitle1" fontWeight="bold">
              📋 {transacoesPendentes.length} transação(ões) aguardando conciliação
            </Typography>
            <Typography variant="body2">
              Selecione uma conta contábil para cada transação e confirme.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Resumo Header */}
      <Grid container spacing={3} mb={3}>
        {/* Informações Gerais */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              📋 Informações da Conciliação
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Banco:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {getNomeBanco()}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Período:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {conciliacao.mes?.toString().padStart(2, '0')}/{conciliacao.ano}
                </Typography>
              </Stack>
              {conciliacao.dataProcessamento && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Processado em:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(conciliacao.dataProcessamento).toLocaleDateString('pt-BR')}
                  </Typography>
                </Stack>
              )}
              {conciliacao.status && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" textTransform="capitalize" color="primary.main">
                    {conciliacao.status}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid>

        {/* Resumo Financeiro */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%', bgcolor: 'primary.lighter' }}>
            <Typography variant="h6" gutterBottom>
              💰 Resumo Financeiro
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Total de Transações Pendentes:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {resumoStatus?.transacoesPendentes ?? transacoesPendentes.length}
                </Typography>
              </Stack>
              {resumoStatus?.totalTransacoes && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total de Transações:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {resumoStatus.totalTransacoes}
                  </Typography>
                </Stack>
              )}
              {transacoesConfirmadas.length > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Transações Conciliadas:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {transacoesConfirmadas.length}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  <Iconify icon="eva:arrow-upward-fill" color="success.main" sx={{ mr: 0.5 }} />
                  Entradas (Créditos):
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  R$ {(resumoStatus?.resumo?.totalCreditos ?? resumoInicial?.totalCreditos ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  <Iconify icon="eva:arrow-downward-fill" color="error.main" sx={{ mr: 0.5 }} />
                  Saídas (Débitos):
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  R$ {(resumoStatus?.resumo?.totalDebitos ?? resumoInicial?.totalDebitos ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Saldo do Período:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  R$ {(resumoStatus?.resumo?.saldoFinal ?? resumoInicial?.saldoFinal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
              
              {/* ✅ Saldo do Banco Após Conciliação */}
              {bancoInfo && (bancoInfo.saldo !== undefined && bancoInfo.saldo !== null) && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      💳 Saldo do Banco
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Saldo Atual:
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        R$ {(bancoInfo.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Stack>
                    {bancoInfo.saldoInicial !== undefined && bancoInfo.saldoInicial !== null && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Saldo Inicial:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          R$ {(bancoInfo.saldoInicial || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {bancoInfo.dataInicio && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              (em {formatarDataISO(bancoInfo.dataInicio)})
                            </Typography>
                          )}
                        </Typography>
                      </Stack>
                    )}
                    {bancoInfo.saldoInicial !== undefined && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Variação:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={(bancoInfo.saldo || 0) >= (bancoInfo.saldoInicial || 0) ? 'success.main' : 'error.main'}
                        >
                          {(bancoInfo.saldo || 0) >= (bancoInfo.saldoInicial || 0) ? '+' : ''}
                          R$ {((bancoInfo.saldo || 0) - (bancoInfo.saldoInicial || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>


      {/* Transações - Sistema de Abas */}
      <Card sx={{ p: 0, mb: 2 }}>
        {/* Cabeçalho com Abas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={abaAtiva} 
            onChange={(e, newValue) => setAbaAtiva(newValue)}
            sx={{ px: 2, pt: 1 }}
          >
            <Tab 
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="eva:clock-fill" width={18} />
                  <Typography variant="body2" fontWeight="medium">
                    Pendentes
                  </Typography>
                  {transacoesPendentes.length > 0 && (
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {transacoesPendentes.length}
                    </Box>
                  )}
                </Stack>
              }
            />
            <Tab 
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="eva:checkmark-circle-2-fill" width={18} />
                  <Typography variant="body2" fontWeight="medium">
                    Conciliadas
                  </Typography>
                  {transacoesConfirmadas.length > 0 && (
                    <Box
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {transacoesConfirmadas.length}
                    </Box>
                  )}
                </Stack>
              }
            />
          </Tabs>
        </Box>

        {/* Conteúdo das Abas */}
        <Box sx={{ p: 2 }}>
          {/* Aba 0: Pendentes */}
          {abaAtiva === 0 && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Iconify icon="eva:file-text-fill" color="primary.main" width={24} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Transações para Conciliar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transacoesPendentes.length} transação{transacoesPendentes.length !== 1 ? 'ões' : ''} pendente{transacoesPendentes.length !== 1 ? 's' : ''}
                      {temSugestoes && (
                        <> • {transacoesComSugestao.length} com sugestão{transacoesComSugestao.length !== 1 ? 'ões' : ''}</>
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              {transacoesPendentes.length === 0 ? (
                <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" />}>
                  <Typography variant="body2" fontWeight="bold">
                    ✅ Todas as transações foram conciliadas!
                  </Typography>
                  <Typography variant="caption">
                    Clique em &quot;Finalizar Conciliação&quot; para concluir o processo.
                  </Typography>
                </Alert>
              ) : (
                <>
                  {/* 🔥 NOVO: Barra de ações rápidas */}
                  <Card 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      bgcolor: 'primary.lighter',
                      border: 1,
                      borderColor: 'primary.main',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.dark" sx={{ flex: 1, minWidth: 200 }}>
                        ⚡ Ações Rápidas:
                      </Typography>
                      {transacoesComSugestao.length > 0 && (
                        <Button
                          variant="contained"
                          color="info"
                          size="small"
                          startIcon={<Iconify icon="eva:flash-fill" />}
                          onClick={handleAceitarTodasSugestoes}
                        >
                          Aceitar Todas Sugestões ({transacoesComSugestao.length})
                        </Button>
                      )}
                      {(() => {
                        // Contar transações com conta selecionada (manual ou sugestão)
                        const totalComConta = transacoesPendentes.filter(transacao => {
                          const transacaoId = transacao._id || transacao.transacaoImportadaId;
                          return contasSelecionadas[transacaoId] || transacao.contaSugerida?._id;
                        }).length;

                        if (totalComConta > 0) {
                          return (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                              onClick={handleConfirmarTodasSelecionadas}
                            >
                              Confirmar Todas Selecionadas ({totalComConta})
                            </Button>
                          );
                        }
                        return null;
                      })()}
                      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                        💡 Selecione contas e use os botões acima para confirmar em massa
                      </Typography>
                    </Stack>
                  </Card>

                  {transacoesPendentes.length > 5 && (
                    <Alert severity="info" sx={{ mb: 2 }} icon={<Iconify icon="eva:info-fill" width={16} />}>
                      <Typography variant="caption">
                        💡 O sistema pode sugerir contas contábeis baseadas em histórico. Role para ver todas as transações.
                      </Typography>
                    </Alert>
                  )}
                  <Stack spacing={1}>
                    {transacoesPendentes.map((transacao, idx) => {
                      const transacaoId = transacao._id || transacao.transacaoImportadaId;
                      const temContaSelecionada = contasSelecionadas[transacaoId] || transacao.contaSugerida?._id;
                      
                      return (
                        <Box
                          key={transacaoId || idx}
                          sx={{
                            position: 'relative',
                            ...(temContaSelecionada && {
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 4,
                                bgcolor: 'success.main',
                                borderRadius: '4px 0 0 4px',
                                zIndex: 1,
                              },
                            }),
                          }}
                        >
                          <TransacaoNaoIdentificada
                            transacao={transacao}
                            clienteId={clienteId}
                            onConfirmar={handleConfirmarTransacao}
                            onContaChange={handleContaChange}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </>
              )}
            </Box>
          )}

          {/* Aba 1: Conciliadas */}
          {abaAtiva === 1 && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Iconify icon="eva:checkmark-circle-2-fill" color="success.main" width={24} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="success.dark">
                    Transações Já Conciliadas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transacoesConfirmadas.length} transação{transacoesConfirmadas.length !== 1 ? 'ões' : ''} já foi{transacoesConfirmadas.length !== 1 ? 'ram' : ''} conciliada{transacoesConfirmadas.length !== 1 ? 's' : ''} (somente visualização)
                  </Typography>
                </Box>
              </Stack>

              {transacoesConfirmadas.length === 0 ? (
                <Alert severity="info" icon={<Iconify icon="eva:info-fill" />}>
                  <Typography variant="body2">
                    Nenhuma transação foi conciliada ainda. As transações conciliadas aparecerão aqui.
                  </Typography>
                </Alert>
              ) : (
                <>
                  <Alert severity="info" icon={<Iconify icon="eva:info-fill" />} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      As transações abaixo já foram conciliadas e não podem ser editadas. Elas são exibidas apenas para referência.
                    </Typography>
                  </Alert>

                  <Stack spacing={1.5}>
                    {transacoesConfirmadas.map((transacao, idx) => {
                      const transacaoId = transacao._id || transacao.transacaoImportadaId || idx;
                      return (
                        <TransacaoConfirmada key={transacaoId} transacao={transacao} />
                      );
                    })}
                  </Stack>
                </>
              )}
            </Box>
          )}
        </Box>
      </Card>

      {/* Botões de Ação */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
        >
          ← Voltar
        </Button>

        {/* ✅ Ocultar botão se status for "concluida" */}
        {(conciliacao?.status !== 'concluida' && statusProcessamento !== 'concluida') && (
          <Button
            variant="contained"
            size="large"
            color="success"
            onClick={handleFinalizarConciliacao}
            disabled={transacoesPendentes.length > 0}
            startIcon={<Iconify icon="solar:check-circle-bold-duotone" />}
          >
            {transacoesPendentes.length === 0
              ? '✅ Finalizar Conciliação'
              : `⚠️ ${transacoesPendentes.length} Transações Pendentes`}
          </Button>
        )}
      </Stack>

      {/* 🔥 NOVO: Botão fixo na parte inferior para confirmar todas selecionadas */}
      {(() => {
        // Contar transações com conta selecionada (manual ou sugestão)
        const totalComConta = transacoesPendentes.filter(transacao => {
          const transacaoId = transacao._id || transacao.transacaoImportadaId;
          return contasSelecionadas[transacaoId] || transacao.contaSugerida?._id;
        }).length;

        if (totalComConta > 0) {
          return (
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Card
                sx={{
                  p: 2,
                  bgcolor: 'success.lighter',
                  border: 1,
                  borderColor: 'success.main',
                  maxWidth: 600,
                  width: '100%',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Stack>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                      ⚡ {totalComConta} transação{totalComConta !== 1 ? 'ões' : ''} pronta{totalComConta !== 1 ? 's' : ''} para confirmar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Role para cima para ver todas as transações
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                    onClick={handleConfirmarTodasSelecionadas}
                    sx={{
                      minWidth: 200,
                      fontWeight: 'bold',
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s',
                      },
                    }}
                  >
                    Confirmar Todas ({totalComConta})
                  </Button>
                </Stack>
              </Card>
            </Box>
          );
        }
        return null;
      })()}
    </Box>
  );
}
