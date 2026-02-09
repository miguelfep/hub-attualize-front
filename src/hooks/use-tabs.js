import { useMemo, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export function useTabs(defaultValue, validValues = null) {
  // Garantir que o defaultValue seja válido
  // Se validValues for fornecido e defaultValue não estiver na lista, usar o primeiro valor válido
  const safeDefaultValue = validValues && !validValues.includes(defaultValue) 
    ? (validValues[0] || defaultValue)
    : defaultValue;
  
  const [value, setValue] = useState(() => {
    // Validação adicional na inicialização do estado
    // Garantir que o valor inicial seja sempre válido
    if (validValues && !validValues.includes(safeDefaultValue)) {
      return validValues[0] || defaultValue;
    }
    return safeDefaultValue;
  });

  // Validar valor se validValues for fornecido
  // Executa imediatamente e sempre que o valor mudar
  useEffect(() => {
    if (validValues && value && !validValues.includes(value)) {
      // Forçar correção imediata se o valor for inválido
      const correctedValue = validValues[0] || defaultValue;
      setValue(correctedValue);
    }
  }, [value, validValues, defaultValue]);

  const onChange = useCallback((event, newValue) => {
    // Validar novo valor antes de definir
    if (!validValues || validValues.includes(newValue)) {
      setValue(newValue);
    } else {
      // Se o novo valor for inválido, usar o primeiro valor válido
      const correctedValue = validValues[0] || defaultValue;
      setValue(correctedValue);
    }
  }, [validValues, defaultValue]);

  // Garantir que o valor retornado seja sempre válido
  const safeValue = useMemo(() => {
    // Validação rigorosa: se o valor não for válido, usar o primeiro valor válido
    // Especialmente importante: nunca retornar "Standard" ou qualquer valor inválido
    if (!value || typeof value !== 'string' || (validValues && !validValues.includes(value))) {
      // Se o valor for inválido (incluindo "Standard"), corrigir imediatamente no estado
      if (value && validValues) {
        const correctedValue = validValues[0] || defaultValue;
        // Usar setTimeout para evitar atualização durante render
        setTimeout(() => setValue(correctedValue), 0);
        return correctedValue;
      }
      return validValues?.[0] || defaultValue;
    }
    // Validação adicional: garantir que o valor não seja "Standard"
    if (value === 'Standard' && validValues) {
      const correctedValue = validValues[0] || defaultValue;
      setTimeout(() => setValue(correctedValue), 0);
      return correctedValue;
    }
    return value;
  }, [value, validValues, defaultValue]);

  const memoizedValue = useMemo(() => ({ value: safeValue, setValue, onChange }), [onChange, safeValue]);

  return memoizedValue;
}
