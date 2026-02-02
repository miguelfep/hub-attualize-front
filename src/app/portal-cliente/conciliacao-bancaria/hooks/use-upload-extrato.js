import { useState } from 'react';

import { 
  obterStatusConciliacao, 
  uploadArquivoConciliacao, 
  buscarTransacoesConciliacao 
} from 'src/actions/conciliacao';

/**
 * Hook para gerenciar upload de extrato
 */
export function useUploadExtrato() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [errorData, setErrorData] = useState(null); // 🔥 NOVO: objeto completo do erro
  
  // 🔥 NOVOS ESTADOS: Processamento assíncrono
  const [processandoStatus, setProcessandoStatus] = useState(null); // 'processando' | 'pendente' | 'concluida' | 'erro' | null
  const [progressoProcessamento, setProgressoProcessamento] = useState(0); // 0-100
  const [conciliacaoId, setConciliacaoId] = useState(null);

  /**
   * 🔥 NOVO: Função de polling do status do processamento
   */
  const aguardarProcessamento = async (id, maxTentativas = 120) => {
    const intervalo = 1000; // 1 segundo
    
    const tentarVerificarStatus = async (tentativa) => {
      try {
        const statusResponse = await obterStatusConciliacao(id);
        const statusData = statusResponse.data?.data;
        
        if (!statusData) {
          throw new Error('Resposta inválida do servidor');
        }
        
        // Atualizar estados de progresso
        setProcessandoStatus(statusData.status);
        setProgressoProcessamento(statusData.progresso || 0);
        
        // Se processamento concluído (pendente ou concluida), buscar transações
        if (statusData.status === 'pendente' || statusData.status === 'concluida') {
          // Buscar transações
          const transacoesResponse = await buscarTransacoesConciliacao(id);
          const transacoesData = transacoesResponse.data?.data;
          
          return {
            conciliacaoId: id,
            status: statusData.status,
            transacoes: transacoesData?.todas || [],
            resumo: transacoesData?.resumo || statusData.resumo || null,
            transacoesIgnoradas: transacoesData?.transacoesIgnoradas || [],
            ...statusData,
          };
        }
        
        // Se erro no processamento
        if (statusData.status === 'erro') {
          const erroMsg = statusData.erros?.[0] || 'Erro ao processar arquivo';
          throw new Error(erroMsg);
        }
        
        return null; // Continuar tentando
      } catch (err) {
        // Se for erro de status do processamento (status = "erro"), propagar imediatamente
        if (err.message && !err.message.toLowerCase().includes('network') && !err.message.toLowerCase().includes('timeout') && !err.message.toLowerCase().includes('resposta inválida')) {
          throw err;
        }
        // Erro de rede ou resposta inválida: continuar tentando até timeout
        // Mas atualizar progresso para indicar que houve problema
        console.warn('Erro durante polling, tentando novamente...', err.message);
        return null; // Continuar tentando
      }
    };
    
    // Usar recursão ao invés de loop com await
    const executarTentativas = async (tentativaAtual) => {
      if (tentativaAtual >= maxTentativas) {
        throw new Error('Timeout ao processar arquivo. O processamento pode estar demorando mais que o esperado.');
      }
      
      const statusResultado = await tentarVerificarStatus(tentativaAtual);
      
      if (statusResultado) {
        return statusResultado;
      }
      
      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, intervalo));
      
      return executarTentativas(tentativaAtual + 1);
    };
    
    return executarTentativas(0);
  };

  const upload = async (clienteId, bancoId, mesAno, arquivo) => {
    setLoading(true);
    setError(null);
    setErrorData(null);
    setResultado(null);
    setUploadProgress(0);
    // 🔥 Limpar estados de processamento
    setProcessandoStatus(null);
    setProgressoProcessamento(0);
    setConciliacaoId(null);

    let teveErro = false;

    try {
      const response = await uploadArquivoConciliacao(
        clienteId,
        bancoId,
        mesAno, // 🔥 OBRIGATÓRIO - formato YYYY-MM
        arquivo,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      );

      // ✅ NOVO: API sempre retorna imediatamente com status "processando"
      // Não retorna transações na resposta - processamento acontece em background
      if (response.data?.success) {
        const uploadData = response.data?.data;
        const id = uploadData?.conciliacaoId;
        const status = uploadData?.status;
        
        // ✅ Verificar se é processamento assíncrono (status = "processando")
        if (status === 'processando') {
          if (!id) {
            throw new Error('ID de conciliação não retornado pelo servidor');
          }
          
          // ✅ Processamento assíncrono: retornar apenas conciliacaoId e status
          // O processamento continuará em background
          // A página de status fará o polling para verificar quando finalizar
          setConciliacaoId(id);
          setProcessandoStatus('processando');
          
          return {
            conciliacaoId: id,
            status: 'processando',
            processamentoAssincrono: true,
            mensagem: uploadData?.mensagem || 'Arquivo recebido e será processado em breve. Use o endpoint de status para verificar o progresso.',
          };
        }
        
        // ✅ FLUXO ANTIGO: Resposta síncrona (compatibilidade - se ainda existir)
        // Se a resposta tiver transações, é processamento síncrono (OFX antigo)
        if (uploadData?.transacoes) {
          setResultado(uploadData);
          return uploadData;
        }
        
        // ✅ Se não tem transações nem status "processando", retornar dados como estão
        setResultado(uploadData);
        return uploadData;
      }
      
      teveErro = true;
      throw new Error(response.data?.message || 'Erro ao processar arquivo');
    } catch (err) {
      teveErro = true;
      // 🔥 Logs detalhados para debug
      console.log('🔴 ==================== ERRO CAPTURADO NO HOOK ====================');
      console.log('🔴 err completo:', err);
      console.log('🔴 typeof err:', typeof err);
      console.log('🔴 err.response:', err?.response);
      console.log('🔴 err.erro:', err?.erro);
      console.log('🔴 err.message:', err?.message);
      
      // 🔥 IMPORTANTE: O interceptor do axios modifica o erro!
      // Ele retorna apenas error.response.data, não o erro completo
      // Por isso, err pode ser diretamente o objeto { erro: { tipo: "...", ... } }
      
      let errorMessage = '';
      let errorObj = null;
      
      // 🔥 CORREÇÃO: Verificar se err JÁ É o objeto de erro (por causa do interceptor)
      if (err?.erro) {
        // O interceptor retornou error.response.data diretamente
        errorObj = err.erro;
        console.log('✅ errorObj extraído de err.erro (interceptor)');
      } else if (err?.response?.data?.erro) {
        // Caso normal (sem interceptor)
        errorObj = err.response.data.erro;
        console.log('✅ errorObj extraído de err.response.data.erro');
      } else if (err?.tipo) {
        // err já é o objeto de erro diretamente
        errorObj = err;
        console.log('✅ errorObj é o próprio err');
      } else if (err?.response?.data) {
        errorObj = err.response.data;
        console.log('✅ errorObj extraído de err.response.data');
      } else if (typeof err === 'string') {
        errorObj = { tipo: 'ERRO_GENERICO', mensagem: err };
        console.log('✅ errorObj criado a partir de string');
      } else if (err?.response) {
        errorObj = { tipo: 'ERRO_HTTP', mensagem: err.response.statusText };
        console.log('✅ errorObj extraído de err.response');
      } else {
        errorObj = { tipo: 'ERRO_REDE', mensagem: err?.message || 'Erro desconhecido' };
        console.log('✅ errorObj criado a partir de err.message');
      }
      
      console.log('🔴 errorObj final:', errorObj);
      console.log('🔴 errorObj?.tipo:', errorObj?.tipo);
      console.log('🔴 errorObj?.mensagem:', errorObj?.mensagem);
      
      // 🔥 SALVAR O OBJETO COMPLETO DO ERRO (garantir que não seja undefined)
      setErrorData(errorObj || null);
      console.log('🔴 setErrorData chamado com:', errorObj || null);
      
      if (errorObj?.tipo === 'PERIODO_INVALIDO') {
        // Erro de período inválido
        errorMessage = errorObj.mensagem || 'O arquivo contém transações de outro período';
        console.log('✅ Detectado PERIODO_INVALIDO');
      } else if (errorObj?.tipo === 'CONCILIACAO_EXISTENTE') {
        // Erro de conciliação existente
        errorMessage = errorObj.mensagem || 'Já existe conciliação para este período';
        console.log('✅ Detectado CONCILIACAO_EXISTENTE');
      } else if (errorObj?.tipo === 'OFX_INVALIDO') {
        // Erro de OFX inválido
        errorMessage = errorObj.mensagem || 'Arquivo OFX inválido ou corrompido';
        console.log('✅ Detectado OFX_INVALIDO');
      } else {
        // Erro genérico
        errorMessage = errorObj?.mensagem || errorObj?.error || errorObj?.message || err.message || 'Erro ao fazer upload';
        console.log('⚠️ Erro genérico (sem tipo)');
      }
      
      console.log('🔴 errorMessage final:', errorMessage);
      
      setError(errorMessage);
      console.log('🔴 setError chamado com:', errorMessage);
      console.log('🔴 ================================================================');
      
      throw new Error(errorMessage);
    } finally {
      // 🔥 Só resetar loading em caso de erro
      // Em caso de sucesso, manter loading até redirecionar
      if (teveErro) {
        setLoading(false);
        setUploadProgress(0);
      }
      // Se não houver erro (teveErro === false), o loading permanece ativo para mostrar mensagem de sucesso
    }
  };

  const reset = () => {
    setLoading(false);
    setUploadProgress(0);
    setResultado(null);
    setError(null);
    setErrorData(null);
    // 🔥 Limpar estados de processamento
    setProcessandoStatus(null);
    setProgressoProcessamento(0);
    setConciliacaoId(null);
  };

  return { 
    upload, 
    loading, 
    uploadProgress,
    resultado, 
    error,
    errorData,
    // 🔥 NOVOS RETORNOS: Estados de processamento assíncrono
    processandoStatus,
    progressoProcessamento,
    conciliacaoId,
    reset
  };
}
