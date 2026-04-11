import { useMemo, useState, useContext, useCallback, createContext } from 'react';

/** Valor usado fora de `SettingsProvider` (ex.: rotas do dashboard que montam UI do portal). */
const defaultPortalSettingsValue = {
  settings: null,
  clienteData: null,
  updateSettings: () => {},
  updateClienteData: () => {},
  isFuncionalidadeAtiva: () => false,
  loading: false,
};

/** Nome explícito para não colidir com `SettingsContext` do tema (`src/components/settings`). */
export const PortalClienteSettingsContext = createContext(defaultPortalSettingsValue);

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
    <PortalClienteSettingsContext.Provider value={value}>{children}</PortalClienteSettingsContext.Provider>
  );
}

export const useSettingsContext = () => useContext(PortalClienteSettingsContext);


