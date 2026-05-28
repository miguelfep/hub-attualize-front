import { useState } from 'react';

import { inspectPdfPassword } from 'src/utils/pdf-password-inspect';

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
   * Polling GET .../status até pendente, concluida ou erro (recomendado: 2–5 s com backoff máx. ~60 s).
   * Mantido para reuso (ex.: fluxos que queiram aguardar antes de navegar).
   */
  const aguardarProcessamento = async (id, maxTentativas = 120) => {
    let delayMs = 2500;
    const delayMax = 60000;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const tentarVerificarStatus = async () => {
      try {
        const statusResponse = await obterStatusConciliacao(id);
        if (statusResponse.status === 404) {
          throw new Error(
            'Este ID de conciliação não existe mais (upload multi-mês: placeholder removido). Abra a página de status do banco para ver os meses atualizados.'
          );
        }
        const statusData = statusResponse.data?.data;

        if (!statusData) {
          throw new Error('Resposta inválida do servidor');
        }

        setProcessandoStatus(statusData.status);
        setProgressoProcessamento(statusData.progresso || 0);

        if (statusData.status === 'pendente' || statusData.status === 'concluida') {
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

        if (statusData.status === 'erro') {
          const erroMsg = (statusData.erros && statusData.erros.join?.('; ')) || statusData.erros?.[0] || 'Erro ao processar arquivo';
          throw new Error(typeof erroMsg === 'string' ? erroMsg : 'Erro ao processar arquivo');
        }

        // processando, aguardando_extrato, etc. — continuar
        return null;
      } catch (err) {
        const msg = err?.message || '';
        const isRede =
          msg.toLowerCase().includes('network') ||
          msg.toLowerCase().includes('timeout') ||
          msg.toLowerCase().includes('resposta inválida');
        if (!isRede) throw err;
        console.warn('Erro durante polling, tentando novamente...', msg);
        return null;
      }
    };

    const executar = async (tentativa) => {
      if (tentativa >= maxTentativas) {
        throw new Error('Timeout ao processar arquivo. O processamento pode estar demorando mais que o esperado.');
      }
      const statusResultado = await tentarVerificarStatus();
      if (statusResultado) return statusResultado;
      await sleep(delayMs);
      delayMs = Math.min(Math.floor(delayMs * 1.2), delayMax);
      return executar(tentativa + 1);
    };

    return executar(0);
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
      let arquivoProtegido = false;
      if (arquivo?.name?.toLowerCase().endsWith('.pdf')) {
        const inspect = await inspectPdfPassword(arquivo);
        arquivoProtegido = inspect.protegido;
      }

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
        },
        { arquivoProtegido }
      );

      // HTTP 202 + fila assíncrona (documentação API conciliação)
      const httpStatus = response.status;
      const uploadPayloadOk =
        response.data?.success && (httpStatus === 202 || httpStatus === 200 || httpStatus === 201);

      if (uploadPayloadOk) {
        const uploadData = response.data?.data;

        if (uploadData?.arquivado) {
          setResultado(uploadData);
          setLoading(false);
          return {
            arquivado: true,
            ...uploadData,
            mensagem:
              uploadData?.mensagem ||
              response.data?.message ||
              'Arquivo arquivado com sucesso.',
          };
        }

        const id = uploadData?.conciliacaoId;
        const status = uploadData?.status;

        const fluxoAssincrono =
          httpStatus === 202 ||
          status === 'processando' ||
          status === 'aguardando_extrato';

        if (fluxoAssincrono) {
          if (!id) {
            throw new Error('ID de conciliação não retornado pelo servidor');
          }

          setConciliacaoId(id);
          setProcessandoStatus(status || 'processando');
          setLoading(false);

          return {
            conciliacaoId: id,
            status: status || 'processando',
            processamentoAssincrono: true,
            mensagem:
              uploadData?.mensagem ||
              response.data?.message ||
              'Arquivo recebido e será processado em breve. Acompanhe o status na tela de conciliação.',
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
      } else if (errorObj?.tipo === 'FECHADO_SEM_MOVIMENTO' || errorObj?.code === 'FECHADO_SEM_MOVIMENTO') {
        errorMessage = errors.length > 0 ? errors[0] : (errorObj.mensagem || 'Período fechado sem movimento. Solicite liberação ao suporte.');
        console.log('✅ Detectado FECHADO_SEM_MOVIMENTO');
      } else if (errorObj?.tipo === 'BANCO_SEM_PARSER_PDF' || errorObj?.code === 'BANCO_SEM_PARSER_PDF') {
        errorMessage =
          errors.length > 0 ? errors[0] : (errorObj.solucao || errorObj.mensagem || 'Tente enviar o extrato em OFX.');
        console.log('✅ Detectado BANCO_SEM_PARSER_PDF');
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
