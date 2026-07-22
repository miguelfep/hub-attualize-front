import { useRef, useState, useEffect } from 'react';

import { getWaStreamUrl } from 'src/actions/whatsapp';

// ----------------------------------------------------------------------
// Realtime (SSE) do atendimento WhatsApp. O EventSource do browser não manda
// header Authorization, então o token vai na query string (?token=). O backend
// só entrega a cada atendente os eventos dentro do escopo dele (setor/atendente),
// então dá pra confiar que só chega o que aquele usuário pode ver.
//
// Todo evento tem o mesmo envelope no `data`:
//   { tipo, conversaId, setores, atendenteId, payload }
//
// Tipos e payloads:
//   mensagem         { mensagem, conversa }     nova msg (inbound|outbound)
//   mensagem_status  { mensagemId, status }     enviada→entregue→lida→falha
//   mensagem_midia   { mensagemId, urlPublica } mídia inbound baixada
//   atribuicao       { setores, atendente }     setor/atendente alterado
//   transferencia    { de, para, tipo }         conversa transferida
//   conversa_status  { status }                 aberta/pendente/resolvida
// ----------------------------------------------------------------------

const EVENTOS = [
  'mensagem',
  'mensagem_status',
  'mensagem_midia',
  'atribuicao',
  'transferencia',
  'conversa_status',
];

/**
 * Conecta ao stream SSE e chama `onEvent(tipo, envelope)` para cada evento.
 * @param {(tipo: string, envelope: object) => void} onEvent
 * @returns {{ conectado: boolean }}
 */
export function useWaStream(onEvent) {
  const [conectado, setConectado] = useState(false);

  // Mantém sempre o callback mais recente sem reabrir a conexão a cada render.
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const url = getWaStreamUrl();
    if (!url || typeof window === 'undefined') return undefined;

    const es = new EventSource(url);

    const dispatch = (tipo) => (event) => {
      try {
        const envelope = JSON.parse(event.data);
        handlerRef.current?.(tipo, envelope);
      } catch (error) {
        console.error('[wa-stream] payload inválido', tipo, error);
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
