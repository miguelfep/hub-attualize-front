import { useState } from 'react';

import { uploadArquivoConciliacao } from 'src/actions/conciliacao';

/**
 * Hook para gerenciar upload de extrato
 */
export function useUploadExtrato() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [errorData, setErrorData] = useState(null); // 🔥 NOVO: objeto completo do erro

  const upload = async (clienteId, bancoId, mesAno, arquivo) => {
    setLoading(true);
    setError(null);
    setErrorData(null); // 🔥 Limpar errorData também
    setResultado(null);
    setUploadProgress(0);

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

      if (response.data?.success) {
        setResultado(response.data.data);
        // 🔥 NÃO resetar loading imediatamente - deixar a página controlar
        // O loading será resetado quando a página redirecionar
        return response.data.data;
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
    setErrorData(null); // 🔥 Limpar errorData também
  };

  return { 
    upload, 
    loading, 
    uploadProgress,
    resultado, 
    error,
    errorData, // 🔥 NOVO: retornar objeto completo do erro
    reset
  };
}
