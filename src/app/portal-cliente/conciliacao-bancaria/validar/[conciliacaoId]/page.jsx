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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import {
  confirmarTransacao,
  finalizarConciliacao,
  obterMlStatusCliente,
  obterStatusConciliacao,
  buscarTransacoesPendentes,
  confirmarTransacoesEmLote,
  mapearContextoConciliacao,
  buscarTransacoesConciliacao,
} from 'src/actions/conciliacao';

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

/** Ordenação recomendada: sem sugestão primeiro; depois maior valor absoluto. */
function ordenarPendentes(list) {
  const arr = [...list];
  arr.sort((a, b) => {
    const aSug = !!(a.contaSugerida?._id || a.contaSugerida);
    const bSug = !!(b.contaSugerida?._id || b.contaSugerida);
    if (aSug !== bSug) return aSug ? 1 : -1;
    const va = Math.abs(parseFloat(a.valor) || 0);
    const vb = Math.abs(parseFloat(b.valor) || 0);
    return vb - va;
  });
  return arr;
}

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
  const pollTimeoutRef = useRef(null);
  
  // 🔥 NOVO: Estados para processamento assíncrono
  const [statusProcessamento, setStatusProcessamento] = useState(null); // 'processando' | 'pendente' | 'concluida' | 'erro' | null
  const [progressoProcessamento, setProgressoProcessamento] = useState(0);
  const [processando, setProcessando] = useState(false);
  
  // ✅ NOVO: Resumo fixo do status da API
  const [resumoStatus, setResumoStatus] = useState(null); // { totalTransacoes, transacoesPendentes, resumo }
  
  // ✅ NOVO: Transações já confirmadas (para exibir no final)
  const [transacoesConfirmadas, setTransacoesConfirmadas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState(0); // 0 = Pendentes, 1 = Conciliadas
  const [alterandoContaId, setAlterandoContaId] = useState(null);
  const [buscaPendentes, setBuscaPendentes] = useState('');
  
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

  const aplicarPayloadStatus = useCallback(
    (statusData) => {
      if (!statusData) return;
      setStatusProcessamento(statusData.status);
      setProgressoProcessamento(statusData.progresso || 0);
      setProcessando(statusData.status === 'processando');
      if (statusData.resumo !== undefined || statusData.totalTransacoes !== undefined) {
        setResumoStatus({
          totalTransacoes: statusData.totalTransacoes ?? 0,
          transacoesPendentes: statusData.transacoesPendentes ?? 0,
          resumo: statusData.resumo ?? null,
        });
      }
      setConciliacao(mapearContextoConciliacao(statusData, conciliacaoId));
    },
    [conciliacaoId]
  );

  const atualizarResumoLocalPendentes = useCallback((transacoesPendentes) => {
    if (transacoesPendentes.length > 0) {
      const transacoesCreditos = transacoesPendentes.filter((t) => t.tipo === 'credito');
      const transacoesDebitos = transacoesPendentes.filter((t) => t.tipo === 'debito');
      const totalCreditos = transacoesCreditos.reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
      const totalDebitos = transacoesDebitos.reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
      setResumoInicialFixo({
        totalCreditos,
        totalDebitos,
        saldoFinal: totalCreditos - totalDebitos,
      });
    } else {
      setResumoInicialFixo({
        totalCreditos: 0,
        totalDebitos: 0,
        saldoFinal: 0,
      });
    }
  }, []);

  const carregarPendentesOrdenados = useCallback(async () => {
    if (!conciliacaoId) return;
    const response = await buscarTransacoesPendentes(conciliacaoId);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro ao carregar transações pendentes');
    }
    const transacoesPendentes = ordenarPendentes(response.data.data || []);
    setTransacoes(transacoesPendentes);
    atualizarResumoLocalPendentes(transacoesPendentes);
  }, [conciliacaoId, atualizarResumoLocalPendentes]);

  // Status + polling (2s) até sair de processando; depois apenas GET /pendentes
  useEffect(() => {
    if (!conciliacaoId) return undefined;

    let cancelled = false;

    const limparPoll = () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    const tick = async () => {
      if (cancelled) return;
      try {
        const statusResponse = await obterStatusConciliacao(conciliacaoId);
        const statusData = statusResponse.data?.data;
        if (cancelled || !statusData) return;

        aplicarPayloadStatus(statusData);

        if (statusData.status === 'erro') {
          setError(statusData.erros?.[0] || 'Erro ao processar arquivo');
          toast.error('Erro ao processar arquivo');
          setLoading(false);
          return;
        }

        if (statusData.status === 'processando') {
          setLoading(false);
          pollTimeoutRef.current = setTimeout(tick, 2000);
          return;
        }

        setProcessando(false);
        await carregarPendentesOrdenados();
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('Erro ao sincronizar conciliação:', err);
          setError(err.message || 'Erro ao carregar conciliação');
          toast.error('Erro ao carregar conciliação');
          setLoading(false);
        }
      }
    };

    setLoading(true);
    setError(null);
    limparPoll();
    tick();

    return () => {
      cancelled = true;
      limparPoll();
    };
  }, [conciliacaoId, aplicarPayloadStatus, carregarPendentesOrdenados]);

   
  const clienteId = empresaData?._id || empresaData?.id;

  useEffect(() => {
    setTransacoesConfirmadas([]);
    setAbaAtiva(0);
  }, [conciliacaoId]);

  const atualizarResumoViaStatus = useCallback(async () => {
    if (!conciliacaoId) return;
    try {
      const r = await obterStatusConciliacao(conciliacaoId);
      const d = r.data?.data;
      if (d) aplicarPayloadStatus(d);
    } catch {
      /* mantém estado local */
    }
  }, [conciliacaoId, aplicarPayloadStatus]);

  // Helper para obter nome do banco de várias formas possíveis
  const getNomeBanco = () => {
    if (bancoInfo) {
      return (
        bancoInfo.instituicaoBancariaId?.nome ||
        bancoInfo.instituicaoBancaria?.nome ||
        bancoInfo.banco?.nome ||
        bancoInfo.nome ||
        'N/A'
      );
    }
    if (!conciliacao?.bancoId) return 'N/A';
    const banco = conciliacao.bancoId;
    if (typeof banco === 'string') return 'Banco selecionado';
    
    // Tentar diferentes caminhos onde o nome pode estar
    return (
      banco.instituicaoBancariaId?.nome ||
      banco.instituicaoBancaria?.nome ||
      banco.banco?.nome ||
      banco.nome ||
      'N/A'
    );
  };

  useEffect(() => {
    const carregarBancoInfoInicial = async () => {
      const bancoIdAtual = conciliacao?.bancoId?._id || conciliacao?.bancoId;
      if (!clienteId || !bancoIdAtual || bancoInfo) return;
      try {
        const bancoResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
          { params: { clienteId } }
        );
        const bancoEncontrado = bancoResponse.data?.find((b) => b._id === bancoIdAtual);
        if (bancoEncontrado) setBancoInfo(bancoEncontrado);
      } catch {
        // mantém fallback do status
      }
    };
    carregarBancoInfoInicial();
  }, [clienteId, conciliacao?.bancoId, bancoInfo]);

  // Confirmar transação
  // 🔥 ATUALIZADO: Agora usa o novo endpoint /confirmar
  const handleConfirmarTransacao = async (transacaoId, transacaoExistenteId = null, contaContabilId = null) => {
    if (!contaContabilId) {
      toast.error('Selecione uma conta contábil para confirmar a transação.');
      return;
    }

    try {
      toast.loading('Confirmando transação...');

      const response = await confirmarTransacao(transacaoId, contaContabilId);

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
        const bancoIdAtual = conciliacao?.bancoId?._id || conciliacao?.bancoId;
        if (bancoIdAtual) {
          const clienteIdAtual = empresaData?._id || empresaData?.id;
          if (clienteIdAtual) {
            try {
              const bancoResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
                { params: { clienteId: clienteIdAtual } }
              );
              const bancoEncontrado = bancoResponse.data?.find((b) => b._id === bancoIdAtual);
              if (bancoEncontrado) {
                setBancoInfo(bancoEncontrado);
              }
            } catch (bancoErr) {
              console.error('Erro ao atualizar saldo do banco:', bancoErr);
            }
          }
        }

        await atualizarResumoViaStatus();
        if (abaAtiva === 1) {
          buscarTransacoesConfirmadas();
        }
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

      const response = await finalizarConciliacao(conciliacaoId);

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

        if (clienteId) {
          try {
            const mlRes = await obterMlStatusCliente(clienteId);
            const ml = mlRes.data?.data;
            if (ml?.status === 'not_trained' && ml?.lastJob?.trainingResult === 'insufficient_samples') {
              toast.message(
                'Sugestões automáticas: o modelo ainda não tem amostras suficientes. Elas devem melhorar com o tempo.'
              );
            }
          } catch {
            /* opcional */
          }
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
  const transacoesPendentesFiltradas = useMemo(() => {
    const q = buscaPendentes.trim().toLowerCase();
    if (!q) return transacoesPendentes;
    return transacoesPendentes.filter((t) => {
      const descricao = String(t.descricao || '').toLowerCase();
      const valor = String(t.valor ?? '').toLowerCase();
      return descricao.includes(q) || valor.includes(q);
    });
  }, [transacoesPendentes, buscaPendentes]);

  const handleAplicarContaSemelhantes = useCallback(
    (transacaoBase, contaContabilId) => {
      const baseDescricao = String(transacaoBase?.descricao || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      if (!baseDescricao || !contaContabilId) return;

      const chavesBase = baseDescricao.split(' ').filter((w) => w.length > 3).slice(0, 4);
      if (chavesBase.length === 0) return;

      let alteradas = 0;
      setContasSelecionadas((prev) => {
        const next = { ...prev };
        transacoesPendentes.forEach((t) => {
          const id = t._id || t.transacaoImportadaId;
          if (!id) return;
          const desc = String(t.descricao || '')
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
          const match = chavesBase.every((k) => desc.includes(k));
          if (match) {
            next[id] = contaContabilId;
            alteradas += 1;
          }
        });
        return next;
      });

      if (alteradas > 0) {
        toast.success(`Conta aplicada para ${alteradas} transação(ões) semelhante(s).`);
      } else {
        toast.info('Nenhuma transação semelhante encontrada.');
      }
    },
    [transacoesPendentes]
  );

  /** Lista completa só na aba Conciliadas — evita GET /transacoes em toda visita. */
  const buscarTransacoesConfirmadas = useCallback(async () => {
    if (!conciliacaoId || processando || statusProcessamento === 'processando') return;

    try {
      const response = await buscarTransacoesConciliacao(conciliacaoId);

      if (response.data?.success && response.data.data) {
        const { confirmadas: confirmadasData, todas: todasData } = response.data.data;
        let confirmadas = [];

        if (Array.isArray(confirmadasData)) {
          confirmadas = confirmadasData;
        } else if (Array.isArray(todasData)) {
          confirmadas = todasData.filter((t) => {
            const temContaId =
              t.contaContabilId ||
              (t.contaContabil && (typeof t.contaContabil === 'string' || t.contaContabil._id)) ||
              (t.transacaoImportada &&
                (t.transacaoImportada.contaContabilId || t.transacaoImportada.contaContabil));

            const temStatusConfirmado =
              t.status === 'confirmada' ||
              t.status === 'conciliada' ||
              (t.transacaoImportada &&
                (t.transacaoImportada.status === 'confirmada' ||
                  t.transacaoImportada.status === 'conciliada'));

            return temContaId || temStatusConfirmado;
          });
        }

        setTransacoesConfirmadas(confirmadas);
      } else {
        setTransacoesConfirmadas([]);
      }
    } catch (err) {
      console.error('Erro ao buscar transações confirmadas:', err);
      setTransacoesConfirmadas([]);
    }
  }, [conciliacaoId, processando, statusProcessamento]);

  useEffect(() => {
    if (abaAtiva !== 1) return;
    buscarTransacoesConfirmadas();
  }, [abaAtiva, buscarTransacoesConfirmadas]);

  const handleAlterarContaTransacaoConciliada = useCallback(
    async (transacaoId, contaContabilId) => {
      if (!transacaoId || !contaContabilId) return;
      try {
        setAlterandoContaId(transacaoId);
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}conciliacao/transacao/${transacaoId}`,
          { contaContabilId }
        );
      } catch (updateErr) {
        if (updateErr?.response?.status === 404 || updateErr?.response?.status === 405) {
          await confirmarTransacao(transacaoId, contaContabilId);
        } else {
          throw updateErr;
        }
      } finally {
        setAlterandoContaId(null);
      }

      await atualizarResumoViaStatus();
      await buscarTransacoesConfirmadas();
      toast.success('Conta contábil atualizada.');
    },
    [atualizarResumoViaStatus, buscarTransacoesConfirmadas]
  );

  const totalConfirmadasIndicador = useMemo(() => {
    if (
      resumoStatus?.totalTransacoes != null &&
      resumoStatus?.transacoesPendentes != null
    ) {
      return Math.max(0, resumoStatus.totalTransacoes - resumoStatus.transacoesPendentes);
    }
    return transacoesConfirmadas.length;
  }, [resumoStatus, transacoesConfirmadas.length]);

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
      return {
        totalCreditos: 0,
        totalDebitos: 0,
        saldoFinal: 0,
      };
    }

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
    
    return {
      totalCreditos,
      totalDebitos,
      saldoFinal: totalCreditos - totalDebitos,
    };
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
        
        const bid = conciliacao?.bancoId?._id || conciliacao?.bancoId;
        if (bid) {
          const clienteIdAtual = empresaData?._id || empresaData?.id;
          if (clienteIdAtual) {
            try {
              const bancoResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
                { params: { clienteId: clienteIdAtual } }
              );
              const bancoEncontrado = bancoResponse.data?.find((b) => b._id === bid);
              if (bancoEncontrado) {
                setBancoInfo(bancoEncontrado);
              }
            } catch (bancoErr) {
              console.error('Erro ao atualizar saldo do banco:', bancoErr);
            }
          }
        }

        await atualizarResumoViaStatus();
        if (abaAtiva === 1) {
          buscarTransacoesConfirmadas();
        }
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
        
        const bid = conciliacao?.bancoId?._id || conciliacao?.bancoId;
        if (bid) {
          const clienteIdAtual = empresaData?._id || empresaData?.id;
          if (clienteIdAtual) {
            try {
              const bancoResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
                { params: { clienteId: clienteIdAtual } }
              );
              const bancoEncontrado = bancoResponse.data?.find((b) => b._id === bid);
              if (bancoEncontrado) {
                setBancoInfo(bancoEncontrado);
              }
            } catch (bancoErr) {
              console.error('Erro ao atualizar saldo do banco:', bancoErr);
            }
          }
        }

        await atualizarResumoViaStatus();
        if (abaAtiva === 1) {
          buscarTransacoesConfirmadas();
        }
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
          <Alert 
            severity="success" 
            icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            action={
              <Button
                variant="outlined"
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
              ✅ Todas as transações foram conciliadas!
            </Typography>
            <Typography variant="body2">
              {conciliacao?.status === 'concluida' || statusProcessamento === 'concluida' 
                ? 'Esta conciliação está finalizada. Você pode reenviar o arquivo caso falte algum lançamento.'
                : 'Clique em "Finalizar Conciliação" para concluir o processo.'}
            </Typography>
          </Alert>
        ) : null}
      </Box>

      {/* Resumo Header */}
      <Grid container spacing={2} mb={2}>
        {/* Informações Gerais */}
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              📋 Informações da Conciliação
            </Typography>
            <Divider sx={{ mb: 1.25 }} />
            <Stack spacing={1.25}>
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
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%', bgcolor: 'primary.lighter' }}>
            <Typography variant="subtitle1" gutterBottom>
              💰 Resumo Financeiro
            </Typography>
            <Divider sx={{ mb: 1.25 }} />
            <Stack spacing={1.25}>
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
              {totalConfirmadasIndicador > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Transações Conciliadas:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {totalConfirmadasIndicador}
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
                  {totalConfirmadasIndicador > 0 && (
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
                      {totalConfirmadasIndicador}
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
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mt={1.5}>
                      <TextField
                        fullWidth
                        size="small"
                        value={buscaPendentes}
                        onChange={(e) => setBuscaPendentes(e.target.value)}
                        placeholder="Buscar por descrição ou valor..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:search-fill" />
                            </InputAdornment>
                          ),
                        }}
                      />
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
                    {transacoesPendentesFiltradas.map((transacao, idx) => {
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
                            onAplicarSemelhantes={handleAplicarContaSemelhantes}
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
                    {transacoesConfirmadas.length} transaç{transacoesConfirmadas.length !== 1 ? 'ões' : 'ão'} já {transacoesConfirmadas.length !== 1 ? 'foram' : 'foi'} conciliada{transacoesConfirmadas.length !== 1 ? 's' : ''}
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
                      As transações abaixo já foram conciliadas. Você pode alterar a conta contábil quando necessário.
                    </Typography>
                  </Alert>

                  <Stack spacing={1.5}>
                    {transacoesConfirmadas.map((transacao, idx) => {
                      const transacaoId = transacao._id || transacao.transacaoImportadaId || idx;
                      return (
                        <TransacaoConfirmada
                          key={transacaoId}
                          transacao={transacao}
                          clienteId={clienteId}
                          alterandoConta={alterandoContaId === transacaoId}
                          onAlterarConta={handleAlterarContaTransacaoConciliada}
                        />
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
