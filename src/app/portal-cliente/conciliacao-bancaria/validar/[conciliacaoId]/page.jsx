'use client';

import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { TransacaoNaoIdentificada } from '../../components';

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

  // 🔥 Buscar transações pendentes (otimizado - uma vez por conciliacaoId)
  useEffect(() => {
    // 🔥 Prevenir múltiplas chamadas simultâneas
    if (carregandoTransacoesRef.current) {
      console.log('⏳ Já carregando transações, ignorando chamada duplicada');
      return;
    }

    const fetchTransacoes = async () => {
      if (!conciliacaoId) return;

      carregandoTransacoesRef.current = true;
      setLoading(true);
      setError(null);

      try {
        
        // Buscar transações pendentes (Nova API)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/pendentes`
        );


        if (response.data?.success) {
          const transacoesPendentes = response.data.data || [];
          setTransacoes(transacoesPendentes);
          
          // 🔥 Calcular resumo inicial IMEDIATAMENTE das transações pendentes (snapshot inicial)
          // Isso garante que temos o resumo completo antes de qualquer confirmação
          // 🔥 SEMPRE calcular quando houver transações, mesmo se já tiver resumo fixo
          if (transacoesPendentes.length > 0) {
            const transacoesCreditos = transacoesPendentes.filter(t => t.tipo === 'credito');
            const transacoesDebitos = transacoesPendentes.filter(t => t.tipo === 'debito');
            
            const totalCreditos = transacoesCreditos.reduce((sum, t) => {
              const valor = parseFloat(t.valor) || 0;
              console.log('💰 Crédito:', t.descricao?.substring(0, 40), 'Valor:', valor);
              return sum + valor;
            }, 0);
            
            const totalDebitos = transacoesDebitos.reduce((sum, t) => {
              const valor = parseFloat(t.valor) || 0;
              console.log('💸 Débito:', t.descricao?.substring(0, 40), 'Valor:', valor);
              return sum + valor;
            }, 0);
            
            const saldoFinal = totalCreditos - totalDebitos;
            
            const resumo = {
              totalCreditos,
              totalDebitos,
              saldoFinal,
            };
          
        
            
            // 🔥 SEMPRE atualizar o resumo fixo quando calcular
            setResumoInicialFixo(resumo);
          } else {
            console.log('⚠️ Nenhuma transação pendente encontrada');
            // Mesmo sem transações, definir resumo como zero
            setResumoInicialFixo({
              totalCreditos: 0,
              totalDebitos: 0,
              saldoFinal: 0,
            });
          }
          
          // Também buscar detalhes básicos da conciliação (apenas se ainda não tiver)
          if (!conciliacao) {
            try {
              const detalhesResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}reconciliation/${conciliacaoId}`
              );
              if (detalhesResponse.data?.success) {
                const conciliacaoData = detalhesResponse.data.data;
                setConciliacao(conciliacaoData);
                
                // ✅ Buscar informações atualizadas do banco (saldo, etc)
                if (conciliacaoData.bancoId?._id) {
                  const clienteIdAtual = empresaData?._id || empresaData?.id;
                  if (clienteIdAtual) {
                    try {
                      const bancoResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
                        { params: { clienteId: clienteIdAtual } }
                      );
                      // Encontrar o banco específico na lista
                      const bancoEncontrado = bancoResponse.data?.find(b => b._id === conciliacaoData.bancoId._id);
                      if (bancoEncontrado) {
                        setBancoInfo(bancoEncontrado);
                      } else if (conciliacaoData.bancoId) {
                        // Fallback: usar dados do banco da conciliação
                        setBancoInfo(conciliacaoData.bancoId);
                      }
                    } catch (bancoErr) {
                      console.error('Erro ao buscar informações do banco:', bancoErr);
                      // Se não conseguir buscar, usar dados do banco da conciliação
                      if (conciliacaoData.bancoId) {
                        setBancoInfo(conciliacaoData.bancoId);
                      }
                    }
                  } else if (conciliacaoData.bancoId) {
                    // Se não tiver clienteId, usar dados do banco da conciliação
                    setBancoInfo(conciliacaoData.bancoId);
                  }
                } else if (conciliacaoData.bancoId) {
                  // Usar dados do banco que já vêm na conciliação
                  setBancoInfo(conciliacaoData.bancoId);
                }
                
                // 🔥 NUNCA sobrescrever resumoInicialFixo se já tivermos valores válidos calculados
                // O resumo calculado das transações pendentes tem prioridade sobre o resumo da API
                if (conciliacaoData.resumo) {
                  const resumoAPI = conciliacaoData.resumo;
                  const temValoresValidosAPI = (resumoAPI.totalCreditos > 0 || resumoAPI.totalDebitos > 0);
                  const temValoresValidosFixo = resumoInicialFixo && 
                                                (resumoInicialFixo.totalCreditos > 0 || resumoInicialFixo.totalDebitos > 0);
                  
                  if (!temValoresValidosFixo && temValoresValidosAPI) {
                    // Só usar o resumo da API se não tivermos um resumo fixo com valores válidos
                    console.log('✅ Usando resumo da API (com valores válidos):', resumoAPI);
                    setResumoInicialFixo(resumoAPI);
                  } else if (temValoresValidosFixo) {
                    console.log('✅ Mantendo resumo fixo calculado das transações (não sobrescrever):', resumoInicialFixo);
                  } else {
                    console.log('⚠️ Resumo da API tem apenas zeros, não usando');
                  }
                } else if (conciliacaoData.transacoes && conciliacaoData.transacoes.length > 0) {
                  // Só calcular de todas as transações se não tivermos um resumo fixo com valores válidos
                  const temValoresValidosFixo = resumoInicialFixo && 
                                                (resumoInicialFixo.totalCreditos > 0 || resumoInicialFixo.totalDebitos > 0);
                  
                  if (!temValoresValidosFixo) {
                    // Calcular de todas as transações (incluindo já confirmadas) se não tivermos resumo
                    const todasTransacoes = conciliacaoData.transacoes;
                    const totalCreditos = todasTransacoes
                      .filter(t => t.tipo === 'credito')
                      .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
                    const totalDebitos = todasTransacoes
                      .filter(t => t.tipo === 'debito')
                      .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
                    
                    console.log('📊 Calculando resumo de todas as transações:', {
                      totalCreditos,
                      totalDebitos,
                      saldoFinal: totalCreditos - totalDebitos,
                      totalTransacoes: todasTransacoes.length
                    });
                    
                    setResumoInicialFixo({
                      totalCreditos,
                      totalDebitos,
                      saldoFinal: totalCreditos - totalDebitos,
                    });
                  } else {
                    console.log('✅ Mantendo resumo fixo calculado (não recalcular de todas as transações)');
                  }
                }
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
        console.error('❌ Erro completo:', err.response?.data || err);
        setError(err.message || 'Erro ao carregar transações');
        toast.error('Erro ao carregar transações');
      } finally {
        setLoading(false);
        carregandoTransacoesRef.current = false;
      }
    };

    fetchTransacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conciliacaoId]); // 🔥 Removido 'conciliacao' das dependências para evitar loop

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

  // 🔥 Resumo financeiro inicial (não atualiza dinamicamente)
  // Usar resumo fixo calculado no carregamento inicial
  const resumoInicial = useMemo(() => {
    console.log('🔄 useMemo resumoInicial executado:', {
      resumoInicialFixo,
      temConciliacaoResumo: !!conciliacao?.resumo,
      totalTransacoes: transacoesPendentes.length,
    });
    
    // Prioridade 1: Usar resumo fixo salvo (calculado quando transações foram carregadas pela primeira vez)
    if (resumoInicialFixo) {
      console.log('✅ Usando resumoInicialFixo:', resumoInicialFixo);
      console.log('✅ Valores:', {
        totalCreditos: resumoInicialFixo.totalCreditos,
        totalDebitos: resumoInicialFixo.totalDebitos,
        saldoFinal: resumoInicialFixo.saldoFinal,
      });
      return resumoInicialFixo;
    }
    
    // Prioridade 2: Usar resumo da conciliação se disponível
    if (conciliacao?.resumo) {
      console.log('✅ Usando resumo da conciliacao:', conciliacao.resumo);
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
  }, [resumoInicialFixo, conciliacao?.resumo, transacoesPendentes.length]); // Adicionado transacoesPendentes.length para recalcular se necessário

  // 🔥 Contar transações com sugestão
  const transacoesComSugestao = transacoesPendentes.filter(t => t.contaSugerida);
  const temSugestoes = transacoesComSugestao.length > 0;

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
      
      let sucesso = 0;
      let erros = 0;

      // Confirmar todas as sugestões sequencialmente (evitar sobrecarga)
      await Promise.all(
        transacoesComSugestao.map(async (transacao) => {
          try {
            const transacaoId = transacao._id || transacao.transacaoImportadaId;
            const contaContabilId = transacao.contaSugerida._id;
            
            await handleConfirmarTransacao(transacaoId, null, contaContabilId);
            sucesso += 1;
          } catch (err) {
            console.error('Erro ao confirmar transação:', err);
            erros += 1;
          }
        })
      );
      
      toast.dismiss();
      
      if (erros === 0) {
        toast.success(`✅ ${sucesso} sugestão(ões) aceita(s) com sucesso!`);
      } else {
        toast.warning(`${sucesso} aceita(s), ${erros} erro(s)`);
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Erro ao aceitar sugestões');
      console.error(err);
    }
  };

  console.log('📊 Transações pendentes:', {
    total: transacoesPendentes.length,
    comSugestao: transacoesComSugestao.length
  });

  // Loading
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
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
        {transacoesPendentes.length === 0 ? (
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
                  {transacoesPendentes.length}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  <Iconify icon="eva:arrow-upward-fill" color="success.main" sx={{ mr: 0.5 }} />
                  Entradas (Créditos):
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  R$ {((resumoInicial?.totalCreditos ?? 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  <Iconify icon="eva:arrow-downward-fill" color="error.main" sx={{ mr: 0.5 }} />
                  Saídas (Débitos):
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  R$ {((resumoInicial?.totalDebitos ?? 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Saldo do Período:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  R$ {((resumoInicial?.saldoFinal ?? 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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


      {/* Transações para Conciliar */}
      <Card sx={{ p: 2, mb: 2 }}>
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
          {temSugestoes && (
            <Button
              variant="contained"
              color="success"
              size="medium"
              startIcon={<Iconify icon="eva:flash-fill" />}
              onClick={handleAceitarTodasSugestoes}
              sx={{
                boxShadow: 3,
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                },
              }}
            >
              ⚡ Aceitar Todas as Sugestões ({transacoesComSugestao.length})
            </Button>
          )}
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
            {transacoesPendentes.length > 5 && (
              <Alert severity="info" sx={{ mb: 2 }} icon={<Iconify icon="eva:info-fill" width={16} />}>
                <Typography variant="caption">
                  💡 O sistema pode sugerir contas contábeis baseadas em histórico. Role para ver todas as transações.
                </Typography>
              </Alert>
            )}
            <Stack spacing={1}>
              {transacoesPendentes.map((transacao, idx) => (
                <TransacaoNaoIdentificada
                  key={transacao._id || idx}
                  transacao={transacao}
                  clienteId={clienteId}
                  onConfirmar={handleConfirmarTransacao}
                />
              ))}
            </Stack>
          </>
        )}
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Botões de Ação */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
        >
          ← Voltar
        </Button>

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
      </Stack>
    </Box>
  );
}
