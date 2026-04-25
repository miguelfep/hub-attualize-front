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
  const [warnings, setWarnings] = useState([]); // 🔥 NOVO: avisos do backend (não bloqueiam)
  
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
    setWarnings([]); // 🔥 Limpar warnings
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
      
      // 🔥 NOVA ESTRUTURA: Backend agora retorna { success, message, errors, warnings, code }
      // Verificar se err JÁ É o objeto de erro (por causa do interceptor)
      let errorDataFromBackend = null;
      
      if (err?.erro) {
        // O interceptor retornou error.response.data diretamente (estrutura antiga)
        errorDataFromBackend = err.erro;
        console.log('✅ errorData extraído de err.erro (interceptor - estrutura antiga)');
      } else if (err?.response?.data?.erro) {
        // Caso normal (sem interceptor - estrutura antiga)
        errorDataFromBackend = err.response.data.erro;
        console.log('✅ errorData extraído de err.response.data.erro (estrutura antiga)');
      } else if (err?.response?.data) {
        // Nova estrutura do backend: { success, message, errors, warnings, code }
        errorDataFromBackend = err.response.data;
        console.log('✅ errorData extraído de err.response.data (nova estrutura)');
      } else if (err?.tipo) {
        // err já é o objeto de erro diretamente (estrutura antiga)
        errorDataFromBackend = err;
        console.log('✅ errorData é o próprio err (estrutura antiga)');
      } else if (typeof err === 'string') {
        errorDataFromBackend = { tipo: 'ERRO_GENERICO', mensagem: err };
        console.log('✅ errorData criado a partir de string');
      } else if (err?.response) {
        errorDataFromBackend = { tipo: 'ERRO_HTTP', mensagem: err.response.statusText };
        console.log('✅ errorData extraído de err.response');
      } else {
        errorDataFromBackend = { tipo: 'ERRO_REDE', mensagem: err?.message || 'Erro desconhecido' };
        console.log('✅ errorData criado a partir de err.message');
      }
      
      console.log('🔴 errorDataFromBackend final:', errorDataFromBackend);
      
      // 🔥 NOVA ESTRUTURA: Tratar errors, warnings e code
      let errors = [];
      let warningsFromBackend = [];
      let code = null;
      
      // Verificar se é nova estrutura (tem errors/warnings/code)
      if (errorDataFromBackend?.errors && Array.isArray(errorDataFromBackend.errors)) {
        const { errors: errList, warnings: warnList, code: codeValue } = errorDataFromBackend;
        errors = errList;
        warningsFromBackend = warnList || [];
        code = codeValue;
        console.log('✅ Nova estrutura detectada - errors:', errors, 'warnings:', warningsFromBackend, 'code:', code);
      } else if (errorDataFromBackend?.warnings && Array.isArray(errorDataFromBackend.warnings)) {
        // Pode ter apenas warnings
        const { warnings: warnList, code: codeValue } = errorDataFromBackend;
        warningsFromBackend = warnList;
        code = codeValue;
        console.log('✅ Nova estrutura detectada (apenas warnings)');
      }
      
      // Construir errorObj para compatibilidade com código existente
      errorObj = {
        ...errorDataFromBackend,
        errors,
        warnings: warningsFromBackend,
        code,
        // Manter compatibilidade com estrutura antiga
        tipo: errorDataFromBackend?.tipo || code || 'ERRO_GENERICO',
        mensagem: errorDataFromBackend?.message || errorDataFromBackend?.mensagem || errorDataFromBackend?.error || errorDataFromBackend?.message || 'Erro ao fazer upload',
      };
      
      console.log('🔴 errorObj final:', errorObj);
      console.log('🔴 errorObj?.tipo:', errorObj?.tipo);
      console.log('🔴 errorObj?.mensagem:', errorObj?.mensagem);
      console.log('🔴 errorObj?.errors:', errorObj?.errors);
      console.log('🔴 errorObj?.warnings:', errorObj?.warnings);
      console.log('🔴 errorObj?.code:', errorObj?.code);
      
      // 🔥 SALVAR O OBJETO COMPLETO DO ERRO (garantir que não seja undefined)
      setErrorData(errorObj || null);
      // 🔥 SALVAR WARNINGS SEPARADAMENTE (para exibição na UI)
      setWarnings(warningsFromBackend || []);
      console.log('🔴 setErrorData chamado com:', errorObj || null);
      console.log('🔴 setWarnings chamado com:', warningsFromBackend || []);
      
      // Tratar erros específicos (estrutura antiga e nova)
      if (errorObj?.tipo === 'PERIODO_INVALIDO' || errorObj?.code === 'PERIODO_INVALIDO') {
        // Erro de período inválido
        errorMessage = errors.length > 0 ? errors[0] : (errorObj.mensagem || 'O arquivo contém transações de outro período');
        console.log('✅ Detectado PERIODO_INVALIDO');
      } else if (errorObj?.tipo === 'CONCILIACAO_EXISTENTE' || errorObj?.code === 'CONCILIACAO_EXISTENTE') {
        // Erro de conciliação existente
        errorMessage = errors.length > 0 ? errors[0] : (errorObj.mensagem || 'Já existe conciliação para este período');
        console.log('✅ Detectado CONCILIACAO_EXISTENTE');
      } else if (errorObj?.tipo === 'OFX_INVALIDO' || errorObj?.code === 'OFX_INVALIDO') {
        // Erro de OFX inválido
        errorMessage = errors.length > 0 ? errors[0] : (errorObj.mensagem || 'Arquivo OFX inválido ou corrompido');
        console.log('✅ Detectado OFX_INVALIDO');
      } else if (errorObj?.code === 'LIMIT_FILE_SIZE') {
        // Erro de arquivo muito grande (nova estrutura)
        errorMessage = errors.length > 0 ? errors[0] : (errorObj.mensagem || 'Arquivo muito grande');
        console.log('✅ Detectado LIMIT_FILE_SIZE');
      } else if (errorObj?.code === 'LIMIT_FILE_COUNT') {
        // Erro de muitos arquivos (nova estrutura)
        errorMessage = errors.length > 0 ? errors[0] : (errorObj.mensagem || 'Muitos arquivos enviados');
        console.log('✅ Detectado LIMIT_FILE_COUNT');
      } else if (errorObj?.code === 'LIMIT_UNEXPECTED_FILE') {
        // Erro de campo de arquivo inesperado (nova estrutura)
        errorMessage = errors.length > 0 ? errors[0] : (errorObj.mensagem || 'Campo de arquivo inesperado');
        console.log('✅ Detectado LIMIT_UNEXPECTED_FILE');
      } else if (errors.length > 0) {
        // Nova estrutura: usar primeiro erro da lista
        errorMessage = errors[0];
        console.log('✅ Usando primeiro erro da lista (nova estrutura)');
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
    setWarnings([]); // 🔥 Limpar warnings
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
    warnings, // 🔥 NOVO: avisos do backend
    // 🔥 NOVOS RETORNOS: Estados de processamento assíncrono
    processandoStatus,
    progressoProcessamento,
    conciliacaoId,
    reset
  };
}
