import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------
// Preferências da sidebar do chat, por usuário/navegador (localStorage):
// - ordem: 'recentes' (última mensagem) ou 'alfabetica' (A–Z)
// - fixados: ids de conversas fixadas no topo da própria seção
// ----------------------------------------------------------------------

const STORAGE_KEY = 'chat-interno-nav-prefs';

const PADRAO = { ordem: 'recentes', fixados: [] };

function carregar() {
  if (typeof window === 'undefined') return PADRAO;
  try {
    const salvo = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      ordem: salvo.ordem === 'alfabetica' ? 'alfabetica' : 'recentes',
      fixados: Array.isArray(salvo.fixados) ? salvo.fixados.map(String) : [],
    };
  } catch {
    return PADRAO;
  }
}

function salvar(prefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage indisponível — preferência vale só para a sessão */
  }
}

export function useChatNavPrefs() {
  const [prefs, setPrefs] = useState(carregar);

  const definirOrdem = useCallback((ordem) => {
    setPrefs((prev) => {
      const prox = { ...prev, ordem };
      salvar(prox);
      return prox;
    });
  }, []);

  const alternarFixado = useCallback((canalId) => {
    const id = String(canalId);
    setPrefs((prev) => {
      const fixados = prev.fixados.includes(id)
        ? prev.fixados.filter((f) => f !== id)
        : [...prev.fixados, id];
      const prox = { ...prev, fixados };
      salvar(prox);
      return prox;
    });
  }, []);

  return { ...prefs, definirOrdem, alternarFixado };
}
