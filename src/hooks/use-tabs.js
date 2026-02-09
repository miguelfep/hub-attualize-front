import { useMemo, useState, useCallback, useEffect } from 'react';

// ----------------------------------------------------------------------

export function useTabs(defaultValue, validValues = null) {
  // Garantir que o defaultValue seja válido
  const safeDefaultValue = validValues && !validValues.includes(defaultValue) 
    ? (validValues[0] || defaultValue)
    : defaultValue;
  
  const [value, setValue] = useState(safeDefaultValue);

  // Validar valor se validValues for fornecido
  useEffect(() => {
    if (validValues && value && !validValues.includes(value)) {
      setValue(validValues[0] || defaultValue);
    }
  }, [value, validValues, defaultValue]);

  const onChange = useCallback((event, newValue) => {
    // Validar novo valor antes de definir
    if (!validValues || validValues.includes(newValue)) {
      setValue(newValue);
    }
  }, [validValues]);

  const memoizedValue = useMemo(() => ({ value, setValue, onChange }), [onChange, value]);

  return memoizedValue;
}
