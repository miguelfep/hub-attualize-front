import { useMemo, useState, useContext, useCallback, createContext } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [clienteData, setClienteData] = useState(null); // Novo estado para dados do cliente
  const [loading, setLoading] = useState(true);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    setLoading(false);
  }, []);

  const updateClienteData = useCallback((newClienteData) => {
    setClienteData(newClienteData);
  }, []);

  const isFuncionalidadeAtiva = useCallback(
    (funcionalidade) => settings?.funcionalidades?.[funcionalidade] || false,
    [settings]
  );

  const value = useMemo(
    () => ({ 
      settings, 
      clienteData, 
      updateSettings, 
      updateClienteData, 
      isFuncionalidadeAtiva, 
      loading 
    }),
    [settings, clienteData, loading, isFuncionalidadeAtiva, updateSettings, updateClienteData]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export const useSettingsContext = () => useContext(SettingsContext);


