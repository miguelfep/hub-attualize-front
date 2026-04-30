'use client';

import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';
import { fDate, fDateUTC } from 'src/utils/format-time';

import { obterConciliacao, buscarTransacoesConciliacao, confirmarTransacoesEmLote } from 'src/actions/conciliacao';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function DetalhesConciliacaoPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const {conciliacaoId} = params;

  const [loading, setLoading] = useState(true);
  const [conciliacao, setConciliacao] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [error, setError] = useState(null);
  const [dialogEditar, setDialogEditar] = useState({ open: false, transacao: null });
  const [salvando, setSalvando] = useState(false);
  const [finalizando, setFinalizando] = useState(false); // ✅ Estado para finalização
  const [resumoTransacoes, setResumoTransacoes] = useState(null); // 🔥 Resumo da nova rota
  const [contasContabeis, setContasContabeis] = useState([]);
  const [loadingContasContabeis, setLoadingContasContabeis] = useState(false);
  const [erroContasContabeis, setErroContasContabeis] = useState(null);
  const contasContabeisCacheRef = useRef(new Map());
  const [formEdicao, setFormEdicao] = useState({
    descricao: '',
    tipo: 'credito',
    valor: '',
    contaContabilId: null,
  });

  // Buscar detalhes da conciliação
  useEffect(() => {
    const fetchConciliacao = async () => {
      if (!conciliacaoId) return;

      setLoading(true);
      setError(null);

      try {
        const [detalhesResponse, transacoesResponse] = await Promise.allSettled([
          obterConciliacao(conciliacaoId),
          buscarTransacoesConciliacao(conciliacaoId),
        ]);

        let conciliacaoData = null;
        let todasTransacoes = [];
        let resumoTransacoesLocal = null;

        if (detalhesResponse.status === 'fulfilled' && detalhesResponse.value.data?.success) {
          conciliacaoData = detalhesResponse.value.data.data;
          setConciliacao(conciliacaoData);
        } else {
          throw new Error('Erro ao carregar conciliação');
        }

        if (transacoesResponse.status === 'fulfilled' && transacoesResponse.value.data?.success) {
          const transacoesData = transacoesResponse.value.data.data;
          const byId = new Map();

          const mergeLista = (arr, status) => {
            (arr || []).forEach((t) => {
              const id = t._id || t.transacaoImportadaId;
              if (!id) return;
              byId.set(String(id), { ...t, status });
            });
          };

          mergeLista(transacoesData.confirmadas, 'confirmada');
          mergeLista(transacoesData.pendentes, 'pendente');

          if (byId.size > 0) {
            todasTransacoes = Array.from(byId.values());
          } else if (Array.isArray(transacoesData.todas)) {
            todasTransacoes = transacoesData.todas.map((t) => ({
              ...t,
              status:
                t.status ||
                (t.contaContabilId || t.contaContabil ? 'confirmada' : 'pendente'),
            }));
          }

          resumoTransacoesLocal = transacoesData.resumo || null;
          setResumoTransacoes(resumoTransacoesLocal);
        } else {
          try {
            const transacoesPendentesResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/pendentes`
            );

            if (transacoesPendentesResponse.data?.success) {
              const transacoesPendentes = transacoesPendentesResponse.data.data || [];
              todasTransacoes = transacoesPendentes.map((t) => ({ ...t, status: 'pendente' }));
            }
          } catch (fallbackErr) {
            console.error('Erro no fallback de transações:', fallbackErr);
          }
        }
        
        setTransacoes(todasTransacoes);
      } catch (err) {
        console.error('Erro ao carregar conciliação:', err);
        setError(err.message || 'Erro ao carregar conciliação');
        toast.error('Erro ao carregar conciliação');
      } finally {
        setLoading(false);
      }
    };

    fetchConciliacao();
  }, [conciliacaoId]);

  // Abrir dialog de edição
  const handleAbrirEdicao = async (transacao) => {
    // 🔥 A nova rota retorna contaSugerida, que para confirmadas é a conta vinculada
    const contaId = transacao.contaContabilId?._id || 
                    transacao.contaContabilId || 
                    transacao.contaSugerida?._id || 
                    transacao.contaSugerida || 
                    null;
    
    setFormEdicao({
      descricao: transacao.descricao || '',
      tipo: transacao.tipo || 'credito',
      valor: transacao.valor || '',
      contaContabilId: contaId,
    });
    setDialogEditar({ open: true, transacao });

    let clienteIdTransacao =
      extrairId(transacao?.clienteId) || extrairId(transacao?.cliente) || clienteIdConciliacao;

    if (!clienteIdTransacao) {
      const bancoIdConciliacao = extrairId(conciliacao?.bancoId);
      if (bancoIdConciliacao) {
        try {
          const bancosResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`);
          const bancos = bancosResponse.data?.data || bancosResponse.data || [];
          const bancoEncontrado = Array.isArray(bancos)
            ? bancos.find((b) => String(b._id || b.id) === String(bancoIdConciliacao))
            : null;
          clienteIdTransacao =
            extrairId(bancoEncontrado?.clienteId) ||
            extrairId(bancoEncontrado?.cliente) ||
            clienteIdTransacao;
        } catch (err) {
          console.warn('Não foi possível resolver cliente pelo banco da conciliação:', err);
        }
      }
    }

    if (!clienteIdTransacao) {
      setContasContabeis([]);
      setErroContasContabeis('Não foi possível identificar a empresa para carregar as contas.');
      return;
    }

    const cacheKey = String(clienteIdTransacao);
    if (contasContabeisCacheRef.current.has(cacheKey)) {
      setContasContabeis(contasContabeisCacheRef.current.get(cacheKey));
      setErroContasContabeis(null);
      return;
    }

    setLoadingContasContabeis(true);
    setErroContasContabeis(null);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}plano-contas/${clienteIdTransacao}/analiticas`,
        { params: { apenasAtivas: true } }
      );
      const contas = (response.data?.data || []).filter((conta) => conta?.tipo === 'A');
      contasContabeisCacheRef.current.set(cacheKey, contas);
      setContasContabeis(contas);
    } catch (err) {
      console.error('Erro ao carregar contas analíticas ativas:', err);
      setContasContabeis([]);
      setErroContasContabeis('Não foi possível carregar as contas analíticas ativas.');
    } finally {
      setLoadingContasContabeis(false);
    }
  };

  // Fechar dialog de edição
  const handleFecharEdicao = () => {
    setDialogEditar({ open: false, transacao: null });
    setErroContasContabeis(null);
    setFormEdicao({
      descricao: '',
      tipo: 'credito',
      valor: '',
      contaContabilId: null,
    });
  };

  const recarregarDadosConciliacao = async () => {
    const transacoesResponse = await buscarTransacoesConciliacao(conciliacaoId);

    if (transacoesResponse.data?.success) {
      const transacoesData = transacoesResponse.data.data;
      const byId = new Map();
      const mergeLista = (arr, status) => {
        (arr || []).forEach((t) => {
          const id = t._id || t.transacaoImportadaId;
          if (!id) return;
          byId.set(String(id), { ...t, status });
        });
      };
      mergeLista(transacoesData.confirmadas, 'confirmada');
      mergeLista(transacoesData.pendentes, 'pendente');
      const merged =
        byId.size > 0
          ? Array.from(byId.values())
          : (transacoesData.todas || []).map((t) => ({
              ...t,
              status:
                t.status ||
                (t.contaContabilId || t.contaContabil ? 'confirmada' : 'pendente'),
            }));
      setTransacoes(merged);
      setResumoTransacoes(transacoesData.resumo || null);
    }

    const conciliacaoResponse = await obterConciliacao(conciliacaoId);
    if (conciliacaoResponse.data?.success) {
      setConciliacao(conciliacaoResponse.data.data);
    }
  };

  const handleConfirmarTransacao = async (transacao) => {
    const transacaoId = transacao._id || transacao.transacaoImportadaId;
    const contaContabilId =
      formEdicao.contaContabilId ||
      transacao.contaContabilId?._id ||
      transacao.contaContabilId ||
      transacao.contaSugerida?._id ||
      transacao.contaSugerida ||
      null;

    if (!transacaoId) {
      toast.error('Transação inválida para confirmação.');
      return;
    }

    if (!contaContabilId) {
      toast.warning('Selecione uma conta contábil antes de confirmar a transação.');
      handleAbrirEdicao(transacao);
      return;
    }

    try {
      toast.loading('Confirmando transação...');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}conciliacao/confirmar`, {
        transacaoId,
        contaContabilId,
      });
      toast.dismiss();

      if (response.data?.success) {
        toast.success('Transação confirmada com sucesso!');
        await recarregarDadosConciliacao();
      } else {
        toast.error(response.data?.message || 'Erro ao confirmar transação');
      }
    } catch (err) {
      toast.dismiss();
      console.error('Erro ao confirmar transação:', err);
      toast.error(err?.response?.data?.erro?.mensagem || 'Erro ao confirmar transação');
    }
  };

  const handleConfirmarTodasComConta = async () => {
    const transacoesParaConfirmar = transacoesPendentes
      .map((t) => {
        const transacaoId = t._id || t.transacaoImportadaId;
        const contaContabilId = getContaIdTransacao(t);
        if (!transacaoId || !contaContabilId) return null;
        return { transacaoId, contaContabilId, isPrevisao: false };
      })
      .filter(Boolean);

    if (transacoesParaConfirmar.length === 0) {
      toast.warning('Nenhuma transação pendente com conta selecionada para confirmar.');
      return;
    }

    if (!window.confirm(`Deseja confirmar ${transacoesParaConfirmar.length} transação(ões)?`)) return;

    try {
      toast.loading(`Confirmando ${transacoesParaConfirmar.length} transação(ões)...`);
      const response = await confirmarTransacoesEmLote(transacoesParaConfirmar);
      toast.dismiss();

      if (response.data?.success) {
        const sucessos = response.data?.data?.sucessos ?? transacoesParaConfirmar.length;
        const erros = response.data?.data?.erros ?? 0;
        toast[erros > 0 ? 'warning' : 'success'](
          erros > 0 ? `${sucessos} confirmada(s), ${erros} com erro.` : `${sucessos} transação(ões) confirmada(s)!`
        );
        await recarregarDadosConciliacao();
      } else {
        toast.error(response.data?.message || 'Erro ao confirmar transações em lote.');
      }
    } catch (err) {
      toast.dismiss();
      const errorMessage =
        err?.response?.data?.erro?.mensagem ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Erro ao confirmar transações em lote.';
      toast.error(errorMessage);
      console.error('Erro ao confirmar transações em lote:', err);
    }
  };

  // Salvar edição
  const handleSalvarEdicao = async () => {
    if (!dialogEditar.transacao) return;

    setSalvando(true);

    try {
      const transacaoId = dialogEditar.transacao._id || dialogEditar.transacao.transacaoImportadaId;
      const payload = {};

      // Preparar payload apenas com campos alterados
      if (formEdicao.descricao !== dialogEditar.transacao.descricao) {
        payload.descricao = formEdicao.descricao;
      }
      if (formEdicao.tipo !== dialogEditar.transacao.tipo) {
        payload.tipo = formEdicao.tipo;
      }
      if (parseFloat(formEdicao.valor) !== parseFloat(dialogEditar.transacao.valor || 0)) {
        payload.valor = parseFloat(formEdicao.valor);
      }
      // 🔥 Comparar IDs corretamente (pode ser string ou objeto)
      const contaAtualId = dialogEditar.transacao.contaContabilId?._id || dialogEditar.transacao.contaContabilId || null;
      const novaContaId = formEdicao.contaContabilId || null;
      
      console.log('🔍 Comparando contas:', {
        contaAtualId,
        novaContaId,
        saoIguais: contaAtualId === novaContaId || String(contaAtualId) === String(novaContaId)
      });
      
      if (String(contaAtualId) !== String(novaContaId)) {
        payload.contaContabilId = novaContaId;
        console.log('✅ Conta contábil será atualizada:', novaContaId);
      }

      // Se não houver alterações, apenas fechar
      if (Object.keys(payload).length === 0) {
        toast.info('Nenhuma alteração foi feita');
        handleFecharEdicao();
        return;
      }

      // 🔥 Tentar usar endpoint de atualização (quando disponível)
      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}conciliacao/transacao/${transacaoId}`,
          payload
        );

        if (response.data?.success) {
          toast.success('Transação atualizada com sucesso!');
          try {
            await recarregarDadosConciliacao();
          } catch (reloadErr) {
            console.warn('⚠️ Erro ao recarregar transações:', reloadErr);
          }
        }
      } catch (updateError) {
        console.log('🔍 Erro ao atualizar transação:', updateError.response?.status, updateError.response?.data);
        
        // Se endpoint não existir (404), usar método alternativo
        if (updateError.response?.status === 404 || updateError.response?.status === 405) {
          // Fallback: usar endpoint de confirmação apenas para conta contábil
          if (payload.contaContabilId) {
            console.log('🔄 Usando fallback: endpoint de confirmação com contaContabilId:', payload.contaContabilId);
            
            try {
              const confirmResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}conciliacao/confirmar`, {
                transacaoId,
                contaContabilId: payload.contaContabilId,
              });
              
              console.log('✅ Resposta da confirmação:', confirmResponse.data);
              toast.success('Conta contábil atualizada com sucesso!');
              
              try {
                await recarregarDadosConciliacao();
              } catch (reloadErr) {
                console.warn('⚠️ Erro ao recarregar transações:', reloadErr);
              }
            } catch (confirmError) {
              console.error('❌ Erro ao confirmar transação:', confirmError);
              toast.error(confirmError.response?.data?.erro?.mensagem || 'Erro ao atualizar conta contábil');
              throw confirmError;
            }
          } else {
            toast.warning('Endpoint de atualização ainda não está disponível. Apenas a conta contábil pode ser atualizada por enquanto.');
          }
        } else {
          console.error('❌ Erro inesperado:', updateError);
          throw updateError;
        }
      }

      handleFecharEdicao();
    } catch (err) {
      console.error('Erro ao salvar edição:', err);
      toast.error(err.response?.data?.erro?.mensagem || 'Erro ao salvar alterações');
    } finally {
      setSalvando(false);
    }
  };

  // Obter nome do banco
  const getNomeBanco = () => {
    if (!conciliacao?.bancoId) return 'N/A';
    return (
      conciliacao.bancoId?.instituicaoBancariaId?.nome ||
      conciliacao.bancoId?.instituicaoBancaria?.nome ||
      conciliacao.bancoId?.banco?.nome ||
      conciliacao.bancoId?.nome ||
      'N/A'
    );
  };

  // ✅ Finalizar conciliação
  const handleFinalizarConciliacao = async () => {
    // Verificar se ainda há transações pendentes
    if (resumoTransacoes?.pendentes > 0) {
      toast.error(`Ainda há ${resumoTransacoes.pendentes} transação(ões) pendente(s). Confirme todas antes de finalizar.`);
      return;
    }

    if (!window.confirm('Tem certeza que deseja finalizar esta conciliação?')) {
      return;
    }

    try {
      setFinalizando(true);
      toast.loading('Finalizando conciliação...');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}conciliacao/${conciliacaoId}/finalizar`
      );

      toast.dismiss();

      if (response.data?.success) {
        toast.success('🎉 Conciliação finalizada com sucesso!');
        
        // Recarregar dados da conciliação
        const [detalhesResponse, transacoesResponse] = await Promise.allSettled([
          obterConciliacao(conciliacaoId),
          buscarTransacoesConciliacao(conciliacaoId),
        ]);

        if (detalhesResponse.status === 'fulfilled' && detalhesResponse.value.data?.success) {
          setConciliacao(detalhesResponse.value.data.data);
        }

        if (transacoesResponse.status === 'fulfilled' && transacoesResponse.value.data?.success) {
          const transacoesData = transacoesResponse.value.data.data;
          const byId = new Map();
          const mergeLista = (arr, status) => {
            (arr || []).forEach((t) => {
              const id = t._id || t.transacaoImportadaId;
              if (!id) return;
              byId.set(String(id), { ...t, status });
            });
          };
          mergeLista(transacoesData.confirmadas, 'confirmada');
          mergeLista(transacoesData.pendentes, 'pendente');
          const merged =
            byId.size > 0
              ? Array.from(byId.values())
              : (transacoesData.todas || []).map((t) => ({
                  ...t,
                  status:
                    t.status ||
                    (t.contaContabilId || t.contaContabil ? 'confirmada' : 'pendente'),
                }));
          setTransacoes(merged);
          setResumoTransacoes(transacoesData.resumo || null);
        }
      } else {
        const errorMsg = response.data?.error || response.data?.message || 'Erro ao finalizar conciliação';
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.dismiss();
      const errorMessage =
        err?.response?.data?.erro?.mensagem ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.erro?.mensagem ||
        err?.error ||
        err?.message ||
        'Erro ao finalizar conciliação';
      toast.error(errorMessage);
      console.error('Erro ao finalizar conciliação:', {
        conciliacaoId,
        errorMessage,
        errorRaw: err,
      });
    } finally {
      setFinalizando(false);
    }
  };

  // Calcular resumo financeiro
  const resumoFinanceiro = useMemo(() => {
    const totalCreditos = transacoes
      .filter(t => t.tipo === 'credito')
      .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
    
    const totalDebitos = transacoes
      .filter(t => t.tipo === 'debito')
      .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
    
    return {
      totalCreditos,
      totalDebitos,
      saldoFinal: totalCreditos - totalDebitos,
      total: transacoes.length,
    };
  }, [transacoes]);

  const extrairId = (valor) => {
    if (!valor) return null;
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'object') {
      return valor._id || valor.id || valor.clienteId || valor.value || null;
    }
    return null;
  };

  const clienteIdConciliacao = useMemo(() => {
    const clienteIdDaUrl = searchParams.get('clienteId');

    // Ordem de fallback para garantir o cliente no modal de edição:
    // 0) clienteId recebido via querystring da listagem
    // 1) clienteId/cliente vindos da conciliação
    // 2) cliente associado ao banco da conciliação
    // 3) cliente da transação atualmente em edição
    return (
      extrairId(clienteIdDaUrl) ||
      extrairId(conciliacao?.clienteId) ||
      extrairId(conciliacao?.cliente) ||
      extrairId(conciliacao?.bancoId?.clienteId) ||
      extrairId(conciliacao?.bancoId?.cliente) ||
      extrairId(dialogEditar?.transacao?.clienteId) ||
      extrairId(dialogEditar?.transacao?.cliente) ||
      null
    );
  }, [searchParams, conciliacao, dialogEditar]);

  const getStatusTransacao = (transacao) =>
    transacao.status || (transacao.contaSugerida || transacao.contaContabilId ? 'confirmada' : 'pendente');

  const getContaIdTransacao = (transacao) =>
    transacao.contaContabilId?._id ||
    transacao.contaContabilId ||
    transacao.contaSugerida?._id ||
    transacao.contaSugerida ||
    null;

  const transacoesPendentes = useMemo(
    () => transacoes.filter((t) => getStatusTransacao(t) === 'pendente'),
    [transacoes]
  );

  const transacoesPendentesSemConta = useMemo(
    () => transacoesPendentes.filter((t) => !getContaIdTransacao(t)),
    [transacoesPendentes]
  );

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

  if (error || !conciliacao) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Conciliação não encontrada'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => router.push(paths.dashboard.contabil.conciliacoes.root)}
          sx={{ mt: 2 }}
        >
          Voltar para Lista
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            📊 Detalhes da Conciliação
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize e edite as transações desta conciliação
          </Typography>
        </div>
        <Stack direction="row" spacing={2}>
          {/* ✅ Botão de Finalizar Conciliação */}
          {conciliacao?.status !== 'conciliado' && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleFinalizarConciliacao}
              disabled={resumoTransacoes?.pendentes > 0 || finalizando}
              startIcon={finalizando ? <CircularProgress size={16} /> : <Iconify icon="solar:check-circle-bold-duotone" />}
            >
              {finalizando
                ? 'Finalizando...'
                : resumoTransacoes?.pendentes > 0
                ? `⚠️ ${resumoTransacoes.pendentes} Transações Pendentes`
                : '✅ Finalizar Conciliação'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(paths.dashboard.contabil.conciliacoes.root)}
          >
            Voltar
          </Button>
        </Stack>
      </Stack>

      {/* Informações da Conciliação */}
      <Grid container spacing={3} mb={3}>
        <Grid xs={12} lg={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ℹ️ Informações da Conciliação
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Cliente:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {conciliacao.clienteId?.razaoSocial || conciliacao.clienteId?.nomeFantasia || 'N/A'}
                </Typography>
              </Stack>
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
                  {conciliacao.mesAno || 'N/A'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  label={conciliacao.status === 'conciliado' ? 'Conciliado' : conciliacao.status === 'pendente' ? 'Pendente' : conciliacao.status}
                  color={conciliacao.status === 'conciliado' ? 'success' : conciliacao.status === 'pendente' ? 'warning' : 'default'}
                  size="small"
                />
              </Stack>
              {conciliacao.dataProcessamento && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Data de Processamento:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {fDate(conciliacao.dataProcessamento)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid>

        {/* Resumo Financeiro */}
        <Grid xs={12} lg={6}>
          <Card sx={{ p: 3, bgcolor: 'primary.lighter' }}>
            <Typography variant="h6" gutterBottom>
              💰 Resumo Financeiro
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Total de Transações:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {resumoFinanceiro.total}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  <Iconify icon="eva:arrow-upward-fill" color="success.main" sx={{ mr: 0.5 }} />
                  Entradas (Créditos):
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  R$ {resumoFinanceiro.totalCreditos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  <Iconify icon="eva:arrow-downward-fill" color="error.main" sx={{ mr: 0.5 }} />
                  Saídas (Débitos):
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  R$ {resumoFinanceiro.totalDebitos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight="bold">
                  Saldo:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  R$ {resumoFinanceiro.saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Transações */}
      <Card>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h6">
                📋 Transações ({transacoes.length})
              </Typography>
              {resumoTransacoes && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {resumoTransacoes.confirmadas} confirmadas • {resumoTransacoes.pendentes} pendentes
                  {resumoTransacoes.percentualConcluido !== undefined && (
                    <> • {resumoTransacoes.percentualConcluido}% concluído</>
                  )}
                </Typography>
              )}
            </Box>
            <Stack alignItems="flex-end" spacing={1}>
              {transacoesPendentesSemConta.length > 0 && (
                <Typography variant="caption" color="warning.main">
                  {transacoesPendentesSemConta.length} pendente(s) sem conta contábil
                </Typography>
              )}
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleConfirmarTodasComConta}
                disabled={
                  transacoesPendentes.length === 0 ||
                  transacoesPendentes.length === transacoesPendentesSemConta.length
                }
                startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
              >
                Confirmar Todas com Conta
              </Button>
            </Stack>
          </Stack>
          <Divider sx={{ mb: 2 }} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Tipo</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Conta Contábil</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Stack alignItems="center" spacing={2}>
                      <Iconify icon="eva:file-text-outline" width={48} color="text.disabled" />
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma transação encontrada
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                transacoes.map((transacao) => (
                  <TableRow
                    key={transacao._id || transacao.transacaoImportadaId}
                    hover
                    sx={getStatusTransacao(transacao) === 'pendente' ? { bgcolor: 'warning.lighter' } : undefined}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {transacao.data ? fDateUTC(transacao.data, 'DD MMM YYYY') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                        {transacao.descricao || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={transacao.tipo === 'credito' ? 'Crédito' : 'Débito'}
                        color={transacao.tipo === 'credito' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={transacao.tipo === 'credito' ? 'success.main' : 'error.main'}
                      >
                        {transacao.tipo === 'credito' ? '+' : '-'} R${' '}
                        {parseFloat(transacao.valor || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        // 🔥 A nova rota retorna contaSugerida (que para confirmadas é a conta vinculada)
                        // Verificar tanto contaContabilId (mapeado) quanto contaSugerida (original)
                        const conta = transacao.contaContabilId || transacao.contaSugerida;
                        if (conta) {
                          return (
                            <Typography variant="body2">
                              <strong>{conta.codigoSequencial || conta.codigo || 'N/A'}</strong> - {conta.nome || 'N/A'}
                            </Typography>
                          );
                        }
                        return (
                          <Typography variant="body2" color="text.secondary">
                            Não atribuída
                          </Typography>
                        );
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusTransacao(transacao) === 'confirmada' ? 'Confirmada' : 'Pendente'}
                        color={getStatusTransacao(transacao) === 'confirmada' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={1}>
                        <Tooltip title="Editar Transação">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleAbrirEdicao(transacao)}
                          >
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                        </Tooltip>
                        {(transacao.status === 'pendente' || !transacao.contaContabilId) && (
                          <Tooltip title="Confirmar Transação">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleConfirmarTransacao(transacao)}
                            >
                              <Iconify icon="eva:checkmark-circle-2-fill" />
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
      </Card>

      {/* Dialog de Edição */}
      <Dialog
        open={dialogEditar.open}
        onClose={handleFecharEdicao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="eva:edit-fill" width={24} color="primary.main" />
            <Typography variant="h6">Editar Transação</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Descrição"
              value={formEdicao.descricao}
              onChange={(e) => setFormEdicao({ ...formEdicao, descricao: e.target.value })}
              disabled={salvando}
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formEdicao.tipo}
                onChange={(e) => setFormEdicao({ ...formEdicao, tipo: e.target.value })}
                label="Tipo"
                disabled={salvando}
              >
                <MenuItem value="credito">Crédito (Entrada)</MenuItem>
                <MenuItem value="debito">Débito (Saída)</MenuItem>
              </Select>
            </FormControl>

            <NumericFormat
              fullWidth
              label="Valor"
              value={formEdicao.valor || ''}
              onValueChange={(values) => {
                const { floatValue } = values;
                setFormEdicao({ ...formEdicao, valor: floatValue || '' });
              }}
              customInput={TextField}
              disabled={salvando}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Conta Contábil
              </Typography>
              <Autocomplete
                options={contasContabeis}
                value={contasContabeis.find((conta) => conta._id === formEdicao.contaContabilId) || null}
                onChange={(event, novaConta) => {
                  setFormEdicao({ ...formEdicao, contaContabilId: novaConta?._id || null });
                }}
                disabled={salvando || loadingContasContabeis}
                getOptionLabel={(option) =>
                  `${option.codigoSequencial || option.codigo || 'N/A'} - ${option.nome || 'Sem nome'}`
                }
                isOptionEqualToValue={(option, value) => option._id === value._id}
                noOptionsText="Nenhuma conta analítica ativa encontrada"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Conta Contábil"
                    placeholder="Digite para filtrar contas..."
                  />
                )}
              />
              {loadingContasContabeis && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Carregando contas analíticas ativas...
                </Typography>
              )}
              {!!erroContasContabeis && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  {erroContasContabeis}
                </Typography>
              )}
              {!loadingContasContabeis && !erroContasContabeis && contasContabeis.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Nenhuma conta analítica ativa encontrada para esta empresa.
                </Typography>
              )}
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                💡 <strong>Nota:</strong> A atualização de descrição, tipo e valor será implementada em breve. 
                Por enquanto, você pode atualizar a conta contábil.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleFecharEdicao} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSalvarEdicao}
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={16} /> : <Iconify icon="eva:save-fill" />}
          >
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
