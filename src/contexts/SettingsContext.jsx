import { createContext, useContext, useState, useMemo } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setLoading(false);
  };

  const isFuncionalidadeAtiva = (funcionalidade) => {
    return settings?.funcionalidades?.[funcionalidade] || false;
  };

  const value = useMemo(
    () => ({ settings, updateSettings, isFuncionalidadeAtiva, loading }),
    [settings, loading]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export const useSettingsContext = () => useContext(SettingsContext);


