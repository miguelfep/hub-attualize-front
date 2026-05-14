'use client';

// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { usePlanoContas } from 'src/hooks/use-plano-contas';


/**
 * Componente de seleção de conta contábil com autocomplete
 * @param {string} clienteId - ID do cliente
 * @param {string} value - ID da conta selecionada
 * @param {function} onChange - Callback quando conta é selecionada
 * @param {string} descricaoTransacao - Descrição da transação para sugestão automática
 * @param {string} contaSugeridaId - ID da conta sugerida pelo backend (baseada em histórico)
 * @param {string} transacaoTipo - Tipo da transação ('credito' | 'debito') - opcional para filtrar contas
 * @param {boolean} filterGroup11 - Se true, filtra apenas contas do Grupo 1.1 (Disponibilidades) - para bancos
 * @param {boolean} disabled - Se o campo está desabilitado
 * @param {string} label - Label do campo
 * @param {boolean} required - Se o campo é obrigatório
 * @param {string} size - Tamanho do campo ('small' | 'medium')
 */
export default function SelectContaContabil({
  clienteId,
  value,
  onChange,
  descricaoTransacao = '',
  contaSugeridaId = null,
  transacaoTipo = null, // 'credito' | 'debito' - opcional para filtrar contas relevantes
  filterGroup11 = false, // ✅ NOVO: Filtrar apenas Grupo 1.1 (Disponibilidades) para bancos
  disabled = false,
  label = 'Conta Contábil',
  required = false,
  size = 'medium',
}) {
  const { contasAnaliticas, loading, buscarContas } = usePlanoContas(clienteId);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [contaSugerida, setContaSugerida] = useState(null);
  const [selectedConta, setSelectedConta] = useState(null);
  const [contasAnaliticasConciliacao, setContasAnaliticasConciliacao] = useState([]);

  // Conciliação: reutiliza GET /analiticas (já carregado pelo hook) — evita N× GET ?tipo=A&apenasAtivas=true
  useEffect(() => {
    if (!transacaoTipo && !filterGroup11) {
      setContasAnaliticasConciliacao([]);
      return;
    }

    if (!clienteId || !contasAnaliticas?.length) {
      setContasAnaliticasConciliacao([]);
      return;
    }

    // Obter o grupo da classificação (primeiro número)
    const obterGrupo = (classificacao) => {
      if (!classificacao) return null;
      return classificacao.split('.')[0];
    };

    const contasFiltradas = contasAnaliticas.filter((conta) => {
      if (conta.tipo !== 'A') return false;
      
      // ✅ NOVO: Filtrar por Grupo 1.1 (Disponibilidades) para bancos
      if (filterGroup11) {
        const classificacao = conta.classificacao || '';
        const codigo = conta.codigo || '';
        const nome = (conta.nome || '').toLowerCase();
        
        // Grupo 1.1 ou código começa com 11 ou nome contém banco/caixa/disponibilidade
        return (
          classificacao.startsWith('1.1') ||
          codigo.startsWith('11') ||
          /banco|caixa|disponibilidade/i.test(nome)
        );
      }
      
      const grupo = obterGrupo(conta.classificacao);
      
      if (transacaoTipo === 'debito') {
        // Saída → Apenas Grupo 3 (Despesas)
        return grupo === '3';
      } if (transacaoTipo === 'credito') {
        // Recebido → Apenas Grupo 4 (Receitas)
        return grupo === '4';
      }
      
      return false;
    });

    setContasAnaliticasConciliacao(contasFiltradas);
  }, [clienteId, contasAnaliticas, transacaoTipo, filterGroup11]);

  // 🔥 FILTRO PARA CONCILIAÇÃO BANCÁRIA: Apenas contas ANALÍTICAS
  // Saídas (débito) → Grupo 3 (Despesas)
  // Recebidos (crédito) → Grupo 4 (Receitas)
  // ✅ NOVO: Para bancos (filterGroup11) → Grupo 1.1 (Disponibilidades)
  const filtrarContasPorTipo = useCallback((contasParaFiltrar) => {
    if (!contasParaFiltrar || contasParaFiltrar.length === 0) {
      return contasParaFiltrar;
    }

    // ✅ NOVO: Filtrar por Grupo 1.1 (Disponibilidades) para bancos
    if (filterGroup11) {
      const contasAnaliticasFiltradas = contasParaFiltrar.filter((conta) => conta.tipo === 'A');
      return contasAnaliticasFiltradas.filter((conta) => {
        const classificacao = conta.classificacao || '';
        const codigo = conta.codigo || '';
        const nome = (conta.nome || '').toLowerCase();
        
        // Grupo 1.1 ou código começa com 11 ou nome contém banco/caixa/disponibilidade
        return (
          classificacao.startsWith('1.1') ||
          codigo.startsWith('11') ||
          /banco|caixa|disponibilidade/i.test(nome)
        );
      });
    }

    // Se não tiver tipo de transação (não é conciliação), retornar contas analíticas padrão
    if (!transacaoTipo) {
      return contasParaFiltrar.filter((conta) => conta.tipo === 'A');
    }

    // ✅ VALIDAÇÃO: Filtrar apenas contas ANALÍTICAS (tipo 'A') para conciliação
    const contasAnaliticasFiltradas = contasParaFiltrar.filter((conta) => {
      // Se não tiver tipo, retornar false (deve ser explícito)
      if (!conta.tipo) return false;
      // Apenas tipo 'A' (Analítica)
      return conta.tipo === 'A';
    });

    // Obter o grupo da classificação (primeiro número)
    const obterGrupo = (classificacao) => {
      if (!classificacao) return null;
      return classificacao.split('.')[0];
    };

    // Filtrar por grupo baseado no tipo de transação
    const contasFiltradas = contasAnaliticasFiltradas.filter((conta) => {
      const grupo = obterGrupo(conta.classificacao);
      
      if (transacaoTipo === 'debito') {
        // Saída → Apenas Grupo 3 (Despesas)
        return grupo === '3';
      } if (transacaoTipo === 'credito') {
        // Recebido → Apenas Grupo 4 (Receitas)
        return grupo === '4';
      }
      
      return false;
    });

    return contasFiltradas;
  }, [transacaoTipo, filterGroup11]);

  // 🔥 CONCILIAÇÃO: Usar contas analíticas filtradas quando houver tipo de transação ou filterGroup11
  // Senão, usar contas analíticas padrão (comportamento padrão)
  const contasParaUsar = (transacaoTipo || filterGroup11) ? contasAnaliticasConciliacao : contasAnaliticas;

  // Buscar conta sugerida pelo ID quando disponível
  // 🔥 Para conciliação: aceitar apenas contas ANALÍTICAS (tipo 'A')
  useEffect(() => {
    if (!contaSugeridaId) {
      setContaSugerida(null);
      return;
    }

    const buscarContaSugerida = async () => {
      // Primeiro tentar encontrar na lista já carregada
      const contasDisponiveis = transacaoTipo ? contasAnaliticasConciliacao : contasAnaliticas;
      
      if (contasDisponiveis.length > 0) {
        const conta = contasDisponiveis.find((c) => c._id === contaSugeridaId);
        if (conta) {
          // 🔥 Para conciliação: apenas analíticas são válidas
          if (transacaoTipo && conta.tipo !== 'A') {
            console.warn(`⚠️ Conta sugerida "${conta.nome}" não é Analítica. Ignorando.`);
            setContaSugerida(null);
          } else if (!transacaoTipo && conta.tipo !== 'A') {
            console.warn(`⚠️ Conta sugerida "${conta.nome}" não é Analítica. Ignorando.`);
            setContaSugerida(null);
          } else {
            setContaSugerida(conta);
          }
          return; // Encontrou, não precisa buscar na API
        }
      }

      // Se não encontrou na lista filtrada, ainda pode estar sendo carregada
      // Ou pode estar em outro grupo - mas se o backend sugeriu, confiamos nele
      // Por enquanto, apenas logar e deixar null - a conta aparecerá quando carregar
      console.log(`ℹ️ Conta sugerida (${contaSugeridaId}) não encontrada na lista filtrada ainda. Aguardando carregamento.`);
      
      // Aguardar um pouco e tentar novamente quando as contas carregarem
      // Isso é tratado pelo useEffect que recarrega quando contasAnaliticasConciliacao muda
    };

    buscarContaSugerida();
  }, [contaSugeridaId, contasAnaliticas, contasAnaliticasConciliacao, transacaoTipo, clienteId]);

  // Buscar conta pelo ID quando o value mudar
  useEffect(() => {
    if (!value) {
      setSelectedConta(null);
      return;
    }

    const contasDisponiveis = transacaoTipo ? contasAnaliticasConciliacao : contasAnaliticas;
    
    if (contasDisponiveis.length > 0) {
      const conta = contasDisponiveis.find((c) => c._id === value);
      setSelectedConta(conta || null);
    }
  }, [value, contasAnaliticas, contasAnaliticasConciliacao, transacaoTipo]);

  // Atualizar options quando as contas carregarem
  useEffect(() => {
    if (!inputValue) {
      const contasFiltradas = filtrarContasPorTipo(contasParaUsar);
      setOptions(contasFiltradas);
    }
  }, [contasParaUsar, inputValue, filtrarContasPorTipo]);

  // Extrair palavras-chave do texto digitado
  const extrairPalavrasChave = (texto) => {
    if (!texto) return '';
    
    return texto
      .replace(/^\d+\s*/g, '')           // Remove números do início
      .replace(/\([^)]*\)/g, '')         // Remove parênteses e conteúdo
      .replace(/[-_]/g, ' ')             // Remove traços
      .replace(/\s+/g, ' ')              // Normaliza espaços
      .trim();
  };

  // Buscar contas enquanto o usuário digita
  useEffect(() => {
    if (inputValue.length >= 2) {
      setLoadingSearch(true);
      const timer = setTimeout(async () => {
        // Extrair apenas palavras-chave para busca
        const termo = extrairPalavrasChave(inputValue);
        
        // Se após extrair não sobrou nada válido, busca vazia
        if (!termo || termo.length < 2) {
          const contasFiltradas = filtrarContasPorTipo(contasParaUsar);
          setOptions(contasFiltradas);
          setLoadingSearch(false);
          return;
        }
        
        // 🔥 Buscar contas: para conciliação busca analíticas filtradas, senão analíticas padrão
        let resultados;
        if (transacaoTipo) {
          // Para conciliação: buscar contas analíticas filtradas
          // Filtrar do array de analíticas já carregado
          const termoLower = termo.toLowerCase();
          resultados = contasAnaliticasConciliacao.filter((conta) => {
            const nome = (conta.nome || '').toLowerCase();
            const classificacao = (conta.classificacao || '').toLowerCase();
            return nome.includes(termoLower) || classificacao.includes(termoLower);
          });
        } else {
          // Comportamento padrão: buscar contas analíticas
          resultados = await buscarContas(termo, 20);
        }
        
        // Filtrar resultados por tipo também
        const resultadosFiltrados = filtrarContasPorTipo(resultados);
        setOptions(resultadosFiltrados);
        setLoadingSearch(false);
      }, 300);

      return () => {
        clearTimeout(timer);
        setLoadingSearch(false);
      };
    }
    if (inputValue.length === 0) {
      const contasFiltradas = filtrarContasPorTipo(contasParaUsar);
      setOptions(contasFiltradas);
    }
    return undefined;
  }, [inputValue, buscarContas, contasParaUsar, contasAnaliticasConciliacao, transacaoTipo, filtrarContasPorTipo]);

  return (
    <div>
      <Autocomplete
        value={selectedConta}
        onChange={(event, newValue) => {
          // 🔥 VALIDAÇÃO: Para conciliação aceitar apenas Analíticas, senão apenas Analíticas também
          if (newValue && newValue.tipo) {
            if (transacaoTipo && newValue.tipo !== 'A') {
              console.warn(`⚠️ Conta "${newValue.nome}" não é Analítica. Para conciliação, apenas contas Analíticas podem ser selecionadas.`);
              return; // Não permitir seleção de conta não analítica na conciliação
            } if (!transacaoTipo && newValue.tipo !== 'A') {
              console.warn(`⚠️ Conta "${newValue.nome}" não é Analítica. Apenas contas Analíticas podem receber lançamentos.`);
              return; // Não permitir seleção de conta não analítica
            }
          }
          setSelectedConta(newValue);
          onChange(newValue?._id || '');
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={options}
        loading={loading || loadingSearch}
        disabled={disabled}
        getOptionLabel={(option) => {
          const codigo = option.codigoSequencial || option.codigo || 'N/A';
          const classificacao = option.classificacao ? ` (${option.classificacao})` : '';
          return `${codigo}${classificacao} - ${option.nome}`;
        }}
        isOptionEqualToValue={(option, optionValue) => option._id === optionValue._id}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            size={size}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {(loading || loadingSearch) ? (
                    <CircularProgress color="inherit" size={size === 'small' ? 16 : 20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const isSugerida = contaSugerida && option._id === contaSugerida._id;
          const codigo = option.codigoSequencial || option.codigo || 'N/A';
          const {classificacao} = option;
          
          return (
            <li 
              {...props} 
              key={option._id}
              style={{
                ...props.style,
                backgroundColor: isSugerida ? '#e3f2fd' : undefined,
                borderLeft: isSugerida ? '4px solid #2196f3' : undefined,
                padding: '8px 16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontFamily: 'monospace' }}>{codigo}</strong>
                  {classificacao && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#666',
                      fontFamily: 'monospace',
                      backgroundColor: '#f5f5f5',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {classificacao}
                    </span>
                  )}
                  {isSugerida && (
                    <span style={{ 
                      fontSize: '0.75rem',
                      color: '#2196f3',
                      fontWeight: 'bold'
                    }}>
                      ⭐ Sugerida
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.875rem', color: '#666' }}>{option.nome}</span>
              </div>
            </li>
          );
        }}
        noOptionsText={
          inputValue.length < 2
            ? 'Digite pelo menos 2 caracteres para buscar'
            : 'Nenhuma conta encontrada'
        }
      />
      
      {contaSugerida && value !== contaSugerida._id && (
        <Chip
          label={`💡 Sugestão: ${contaSugerida.codigoSequencial || contaSugerida.codigo} ${contaSugerida.classificacao ? `(${contaSugerida.classificacao})` : ''} - ${contaSugerida.nome}`}
          color="info"
          variant="outlined"
          size="small"
          sx={{ mt: 1, cursor: 'pointer' }}
          onClick={() => {
            setSelectedConta(contaSugerida);
            onChange(contaSugerida._id);
          }}
        />
      )}
    </div>
  );
}

SelectContaContabil.propTypes = {
  clienteId: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  descricaoTransacao: PropTypes.string,
  contaSugeridaId: PropTypes.string,
  transacaoTipo: PropTypes.oneOf(['credito', 'debito']),
  filterGroup11: PropTypes.bool, // ✅ NOVO: Filtrar apenas Grupo 1.1 (Disponibilidades) para bancos
  disabled: PropTypes.bool,
  label: PropTypes.string,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
};
