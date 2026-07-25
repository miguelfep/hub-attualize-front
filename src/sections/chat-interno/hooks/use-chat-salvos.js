import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------
// "Salvar para depois" (estilo Slack): guarda um snapshot da mensagem em
// localStorage, por usuário/navegador. Snapshot (e não só o id) porque não há
// endpoint de mensagem única — o item salvo fica legível mesmo fora do canal.
// ----------------------------------------------------------------------

const STORAGE_KEY = 'chat-interno-salvos';
const LIMITE = 200;

function carregar() {
  if (typeof window === 'undefined') return [];
  try {
    const lista = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function persistir(lista) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    /* storage indisponível — vale só para a sessão */
  }
}

const previewDe = (m) => {
  if (m?.texto) return m.texto.slice(0, 200);
  if (m?.anexos?.length) return `📎 ${m.anexos[0].nomeOriginal}`;
  if (m?.gifUrl) return 'GIF';
  if (m?.enquete?.pergunta) return `📊 ${m.enquete.pergunta}`;
  return 'Mensagem';
};

export function useChatSalvos() {
  const [salvos, setSalvos] = useState(carregar);

  /** Alterna salvar/remover uma mensagem. `canal` dá nome/contexto ao item. */
  const alternarSalvo = useCallback((mensagem, canal, nomeConversa) => {
    if (!mensagem?._id) return;
    setSalvos((prev) => {
      const existe = prev.some((s) => s.mensagemId === mensagem._id);
      const prox = existe
        ? prev.filter((s) => s.mensagemId !== mensagem._id)
        : [
            {
              mensagemId: mensagem._id,
              canalId: canal?._id || null,
              conversa: nomeConversa || canal?.nome || 'Conversa',
              autorNome:
                mensagem.autor?.name || mensagem.autor?.email || 'Usuário',
              preview: previewDe(mensagem),
              createdAt: mensagem.createdAt || null,
              salvoEm: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, LIMITE);
      persistir(prox);
      return prox;
    });
  }, []);

  const removerSalvo = useCallback((mensagemId) => {
    setSalvos((prev) => {
      const prox = prev.filter((s) => s.mensagemId !== mensagemId);
      persistir(prox);
      return prox;
    });
  }, []);

  return { salvos, alternarSalvo, removerSalvo };
}
