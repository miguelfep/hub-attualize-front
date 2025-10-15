import { useMemo, useState, useContext, createContext, useCallback } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setLoading(false);
  };

  const isFuncionalidadeAtiva = useCallback(
    (funcionalidade) => settings?.funcionalidades?.[funcionalidade] || false,
    [settings]
  );

  const value = useMemo(
    () => ({ settings, updateSettings, isFuncionalidadeAtiva, loading }),
    [settings, loading, isFuncionalidadeAtiva]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export const useSettingsContext = () => useContext(SettingsContext);


