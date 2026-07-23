import { useRef, useState, useEffect } from 'react';

import { getChatStreamUrl } from 'src/actions/chat-interno';

// ----------------------------------------------------------------------
// Realtime (SSE) do chat interno. Envelope de todo evento no `data`:
//   { tipo, canalId, destinatarios, payload, ts }
// O backend só entrega eventos destinados ao usuário conectado (membros do
// canal/DM; menções só para os mencionados), então dá pra confiar no que chega.
//
// Tipos:
//   chat.mensagem            { mensagem }
//   chat.mensagem.editada    { mensagem }
//   chat.mensagem.removida   { mensagemId }
//   chat.reacao              { mensagemId, reacoes }        (estado final)
//   chat.thread.resposta     { mensagem, raizId }
//   chat.mencao              { mensagemId, trecho }         (toast global)
//   chat.dm                  { mensagem }
//   chat.canal.atualizado    { canal }
//   chat.canal.arquivado     { canalId }
//   chat.membro.adicionado   { canalId, usuario }
//   chat.membro.removido     { canalId, usuario }
//   chat.lido                { canalId, lastReadAt }        (só para você)
//   chat.presenca            { usuario, online }            (broadcast)
// ----------------------------------------------------------------------

const EVENTOS = [
  'chat.mensagem',
  'chat.mensagem.editada',
  'chat.mensagem.removida',
  'chat.reacao',
  'chat.thread.resposta',
  'chat.mencao',
  'chat.dm',
  'chat.canal.atualizado',
  'chat.canal.arquivado',
  'chat.membro.adicionado',
  'chat.membro.removido',
  'chat.lido',
  'chat.presenca',
];

/**
 * Conecta ao stream SSE e chama `onEvent(tipo, envelope)` para cada evento.
 * @param {(tipo: string, envelope: object) => void} onEvent
 * @returns {{ conectado: boolean }}
 */
export function useChatStream(onEvent) {
  const [conectado, setConectado] = useState(false);

  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const url = getChatStreamUrl();
    if (!url || typeof window === 'undefined') return undefined;

    const es = new EventSource(url);

    const dispatch = (tipo) => (event) => {
      try {
        const envelope = JSON.parse(event.data);
        handlerRef.current?.(tipo, envelope);
      } catch (error) {
        console.error('[chat-stream] payload inválido', tipo, error);
      }
    };

    es.addEventListener('conectado', () => setConectado(true));
    EVENTOS.forEach((tipo) => es.addEventListener(tipo, dispatch(tipo)));

    es.onerror = () => {
      // O EventSource reconecta sozinho; só refletimos o estado.
      setConectado(false);
    };

    return () => {
      es.close();
      setConectado(false);
    };
  }, []);

  return { conectado };
}
