import { useRef, useEffect } from 'react';

import { postPresencaStatus } from 'src/actions/chat-interno';

// ----------------------------------------------------------------------
// Detecção de inatividade para o status "ausente" do chat interno (estilo Slack):
// sem mouse/teclado por IDLE_MS (10 min) → reporta 'ausente'; qualquer atividade
// volta para 'online'. Reporta só nas TRANSIÇÕES (o backend também deduplica).
// Roda junto do stream global (qualquer página do dashboard).
// ----------------------------------------------------------------------

const IDLE_MS = Number(process.env.NEXT_PUBLIC_CHAT_IDLE_MS || 10 * 60 * 1000);
const CHECK_MS = 60 * 1000;

export function usePresencaAtividade(habilitado) {
  const ultimaAtividadeRef = useRef(Date.now());
  const statusRef = useRef('online');

  useEffect(() => {
    if (!habilitado || typeof window === 'undefined') return undefined;

    const reportar = (status) => {
      if (statusRef.current === status) return;
      statusRef.current = status;
      postPresencaStatus(status).catch(() => {
        // Falhou (rede) — permite retentar na próxima transição/checagem.
        statusRef.current = null;
      });
    };

    const registrarAtividade = () => {
      ultimaAtividadeRef.current = Date.now();
      if (statusRef.current !== 'online') reportar('online');
    };

    // Eventos leves de atividade (passivos; sem throttle pesado — só timestamps).
    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    eventos.forEach((e) => window.addEventListener(e, registrarAtividade, { passive: true }));

    // Voltar para a aba conta como atividade.
    const onVisibilidade = () => {
      if (document.visibilityState === 'visible') registrarAtividade();
    };
    document.addEventListener('visibilitychange', onVisibilidade);

    const timer = setInterval(() => {
      if (Date.now() - ultimaAtividadeRef.current >= IDLE_MS) reportar('ausente');
    }, CHECK_MS);

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, registrarAtividade));
      document.removeEventListener('visibilitychange', onVisibilidade);
      clearInterval(timer);
    };
  }, [habilitado]);
}
